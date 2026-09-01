/**
 * SteamSquad — Side Panel Application Controller
 * Orchestrates UI state, tab navigation, event bindings, and submodules.
 */

import { SquadManager } from './squad-manager.js';
import { OverlapEngine } from './overlap-engine.js';
import { PollGenerator } from './poll-generator.js';
import { RouletteEngine, VetoArenaEngine } from './roulette.js';
import { fetchGameStoreDetails } from '../services/steam-service.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

class SteamSquadApp {
  constructor() {
    this.squadManager = new SquadManager();
    this.overlapEngine = new OverlapEngine();
    this.currentMatches = null;
    this.activeTab = 'tab-squad';
    this.pollPlatform = 'discord';
    this.pollLimit = 5;
    this.pollTier = 'all_100';
    this.rouletteEngine = null;
    this.vetoEngine = null;
    this.lastRouletteWinner = null;

    this.init();
  }

  async init() {
    this.bindGlobalEvents();
    this.initRouletteAndVeto();

    // Load persisted played games
    try {
      const stored = await chrome.storage.local.get('played_game_app_ids');
      if (Array.isArray(stored.played_game_app_ids)) {
        this.overlapEngine.setPlayedGames(stored.played_game_app_ids);
      }
    } catch {}

    this.squadManager.subscribe(() => {
      this.onSquadUpdated();
    });

    await this.squadManager.init();
  }

  showToast(message, duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  initRouletteAndVeto() {
    const canvas = document.getElementById('roulette-canvas');
    if (canvas) {
      this.rouletteEngine = new RouletteEngine(canvas, (winner) => {
        this.onRouletteWinner(winner);
      });
    }

    this.vetoEngine = new VetoArenaEngine(
      [],
      [],
      () => this.renderVetoArena(),
      (winner) => this.onVetoWinner(winner)
    );
  }

  bindGlobalEvents() {
    // Nav tabs
    document.querySelectorAll('.nav-tab').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        const tabId = tabBtn.getAttribute('data-tab');
        this.switchTab(tabId);
      });
    });

    // Add member
    const addBtn = document.getElementById('btn-add-member');
    const memberInput = document.getElementById('member-input');

    if (addBtn && memberInput) {
      const handleAdd = async () => {
        const value = memberInput.value;
        if (!value.trim()) return;

        addBtn.disabled = true;
        addBtn.innerHTML = '<span>⏳ Aranıyor...</span>';

        const result = await this.squadManager.addMember(value);
        addBtn.disabled = false;
        addBtn.innerHTML = '<span>+ Ekle</span>';

        if (result.success) {
          memberInput.value = '';
          this.renderSquadList();
          this.showToast(`✅ ${result.message}`);
        } else {
          this.showToast(`⚠️ ${result.message}`);
        }
      };

      addBtn.addEventListener('click', handleAdd);
      memberInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAdd();
      });
    }

    // Create team
    document.getElementById('btn-create-team')?.addEventListener('click', async () => {
      const teamName = prompt('Yeni ekip adı girin (Örn: Duo Takımı, 5v5 Ekibi, Hafta Sonu):', 'Duo Takımı');
      if (teamName) {
        const res = await this.squadManager.createTeam(teamName);
        this.renderSquadList();
        this.renderPresets();
        this.showToast(res.message);
      }
    });

    // Steam Web API Key settings toggle & save
    const apiKeyToggle = document.getElementById('toggle-api-key-panel');
    const apiKeyContent = document.getElementById('api-key-content');
    const apiKeyChevron = document.getElementById('api-key-chevron');
    const apiKeyInput = document.getElementById('api-key-input');
    const apiKeySaveBtn = document.getElementById('btn-save-api-key');

    // Load existing API Key
    chrome.storage.local.get('steamsquad_api_key').then((data) => {
      if (data.steamsquad_api_key && apiKeyInput) {
        apiKeyInput.value = data.steamsquad_api_key;
      }
    });

    apiKeyToggle?.addEventListener('click', () => {
      if (apiKeyContent) {
        const isHidden = apiKeyContent.classList.toggle('hidden');
        if (apiKeyChevron) apiKeyChevron.textContent = isHidden ? '▼' : '▲';
      }
    });

    const apiKeyDeleteBtn = document.getElementById('btn-delete-api-key');

    apiKeySaveBtn?.addEventListener('click', async () => {
      const keyVal = apiKeyInput?.value?.trim() || '';
      await chrome.storage.local.set({ steamsquad_api_key: keyVal });
      this.showToast(keyVal ? '🔑 Steam Web API Key kaydedildi! Kütüphaneler yenileniyor...' : 'API Key temizlendi.');

      // Refresh all existing members
      for (const m of this.squadManager.members) {
        await this.squadManager.refreshMember(m.id);
      }
      this.renderSquadList();
    });

    apiKeyDeleteBtn?.addEventListener('click', async () => {
      await chrome.storage.local.remove('steamsquad_api_key');
      if (apiKeyInput) apiKeyInput.value = '';
      this.showToast('🗑️ Steam Web API anahtarı silindi.');
    });

    // Clear squad
    document.getElementById('btn-clear-squad')?.addEventListener('click', async () => {
      if (confirm('Tüm kadroyu temizlemek istediğinize emin misiniz?')) {
        await this.squadManager.clearAllMembers();
        this.renderSquadList();
        this.showToast('Kadro temizlendi.');
      }
    });

    // Filter - Match Tier Segmented control
    document.querySelectorAll('#match-tier-filter .segment-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        document.querySelectorAll('#match-tier-filter .segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.overlapEngine.setFilters({ matchTier: btn.getAttribute('data-tier') });
        await this.renderMatches();
        this.initVetoArena();
        this.renderRoulette();
        if (this.activeTab === 'tab-poll') this.renderPoll();
      });
    });

    // Filter - Game Mode tags
    document.querySelectorAll('#game-mode-filter .tag-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        document.querySelectorAll('#game-mode-filter .tag-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.overlapEngine.setFilters({ gameMode: btn.getAttribute('data-mode') });
        await this.renderMatches();
        this.initVetoArena();
        this.renderRoulette();
        if (this.activeTab === 'tab-poll') this.renderPoll();
      });
    });

    // Filter - Search input
    document.getElementById('game-search-input')?.addEventListener('input', async (e) => {
      this.overlapEngine.setFilters({ searchQuery: e.target.value });
      await this.renderMatches();
      this.initVetoArena();
      this.renderRoulette();
      if (this.activeTab === 'tab-poll') this.renderPoll();
    });

    // Filter - Sort select
    document.getElementById('sort-select')?.addEventListener('change', async (e) => {
      this.overlapEngine.setFilters({ sortBy: e.target.value });
      await this.renderMatches();
      this.initVetoArena();
      this.renderRoulette();
      if (this.activeTab === 'tab-poll') this.renderPoll();
    });

    // Filter - Quick Download checkbox (<5GB)
    document.getElementById('toggle-quick-download')?.addEventListener('change', async (e) => {
      this.overlapEngine.setFilters({ sizeTier: e.target.checked ? 'small' : 'all' });
      await this.renderMatches();
      this.initVetoArena();
      this.renderRoulette();
      if (this.activeTab === 'tab-poll') this.renderPoll();
    });

    // Filter - Hide Played checkbox
    document.getElementById('toggle-hide-played')?.addEventListener('change', async (e) => {
      this.overlapEngine.setFilters({ hidePlayed: e.target.checked });
      await this.renderMatches();
      this.initVetoArena();
      this.renderRoulette();
      if (this.activeTab === 'tab-poll') this.renderPoll();
    });

    // Poll - Platform selector
    document.querySelectorAll('#poll-platform-selector .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#poll-platform-selector .segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.pollPlatform = btn.getAttribute('data-platform');
        this.renderPoll();
      });
    });

    // Poll - Scope / Tier selector
    document.querySelectorAll('#poll-tier-selector .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#poll-tier-selector .segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.pollTier = btn.getAttribute('data-tier');
        this.renderPoll();
      });
    });

    // Poll - Limit selector
    document.querySelectorAll('#poll-limit-selector .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#poll-limit-selector .segment-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.pollLimit = parseInt(btn.getAttribute('data-limit'), 10);
        this.renderPoll();
      });
    });

    // Poll - Copy button
    document.getElementById('btn-copy-poll')?.addEventListener('click', async () => {
      const text = document.getElementById('poll-preview-text')?.textContent;
      if (text) {
        const success = await PollGenerator.copyToClipboard(text);
        if (success) {
          this.showToast('📋 Anket panoya kopyalandı! Discord veya WhatsApp\'a yapıştırabilirsiniz.');
        } else {
          this.showToast('Kopyalama başarısız oldu.');
        }
      }
    });

    // Submode - Roulette vs Veto
    document.getElementById('btn-submode-roulette')?.addEventListener('click', () => {
      document.getElementById('btn-submode-roulette').classList.add('active');
      document.getElementById('btn-submode-veto').classList.remove('active');
      document.getElementById('subview-roulette').classList.add('active');
      document.getElementById('subview-veto').classList.remove('active');
      this.renderRoulette();
      if (this.rouletteEngine) this.rouletteEngine.draw();
    });

    document.getElementById('btn-submode-veto')?.addEventListener('click', () => {
      document.getElementById('btn-submode-veto').classList.add('active');
      document.getElementById('btn-submode-roulette').classList.remove('active');
      document.getElementById('subview-veto').classList.add('active');
      document.getElementById('subview-roulette').classList.remove('active');
      
      if (!this.vetoEngine || (this.vetoEngine.remainingGames.length === 0 && this.vetoEngine.eliminatedGames.length === 0)) {
        this.initVetoArena();
      } else {
        this.renderVetoArena();
      }
    });

    // Restore full games to wheel
    document.getElementById('btn-restore-wheel-games')?.addEventListener('click', () => {
      if (this.vetoEngine) {
        const activeMembers = this.squadManager.getActiveMembers();
        const games = (this.currentMatches?.filteredResults || []).slice(0, 8);
        this.vetoEngine.reset(games, activeMembers);
      }
      this.renderRoulette();
      this.showToast('Çark tüm ortak oyunlarla yenilendi.');
    });

    // Roulette Spin button
    document.getElementById('btn-spin-wheel')?.addEventListener('click', () => {
      if (this.rouletteEngine) {
        document.getElementById('roulette-winner-card')?.classList.add('hidden');
        this.rouletteEngine.spin();
      }
    });

    // Winner card close event
    document.getElementById('btn-close-winner-card')?.addEventListener('click', () => {
      document.getElementById('roulette-winner-card')?.classList.add('hidden');
    });

    // Winner card share event
    document.getElementById('btn-share-winner')?.addEventListener('click', async () => {
      if (!this.lastRouletteWinner) return;
      const w = this.lastRouletteWinner;
      const mode = w.metadata?.mode?.toUpperCase() || 'COOP';
      const p = w.metadata?.maxPlayers ? `${w.metadata.maxPlayers} Kişilik` : 'Multiplayer';
      const text = `🏆 **SteamSquad Çarkı Kararını Verdi!**\n🎮 Bu akşam oynuyoruz: **${w.name}**\n👥 Tür: ${mode} (${p})\n🚀 Steam: https://store.steampowered.com/app/${w.appId}`;
      const success = await PollGenerator.copyToClipboard(text);
      if (success) {
        this.showToast('📋 Kazanan oyun Discord/WhatsApp formatında panoya kopyalandı!');
      } else {
        this.showToast('Kopyalama başarısız oldu.');
      }
    });

    // Sound toggle
    document.getElementById('btn-toggle-sound')?.addEventListener('click', () => {
      if (this.rouletteEngine) {
        const muted = this.rouletteEngine.soundFx.toggleMute();
        document.getElementById('btn-toggle-sound').textContent = muted ? '🔇' : '🔊';
      }
    });

    // Veto Reset button
    document.getElementById('btn-reset-veto')?.addEventListener('click', () => {
      this.initVetoArena();
      this.renderRoulette();
      this.showToast('Veto Arenası sıfırlandı.');
    });
  }

  switchTab(tabId) {
    this.activeTab = tabId;

    document.querySelectorAll('.nav-tab').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });

    document.querySelectorAll('.tab-pane').forEach(p => {
      p.classList.toggle('active', p.id === tabId);
    });

    if (tabId === 'tab-matches') {
      this.renderMatches();
    } else if (tabId === 'tab-poll') {
      this.renderPoll();
    } else if (tabId === 'tab-roulette') {
      this.renderRoulette();
    }
  }

  async onSquadUpdated() {
    this.renderSquadList();
    this.renderPresets();

    const activeMembers = this.squadManager.getActiveMembers();
    const countBadge = document.getElementById('active-squad-count');
    if (countBadge) {
      countBadge.textContent = `${activeMembers.length} Oyuncu Hazır`;
    }

    // Recompute matches
    this.currentMatches = await this.overlapEngine.computeOverlap(activeMembers);

    const matchBadge = document.getElementById('match-badge-count');
    if (matchBadge) {
      matchBadge.textContent = this.currentMatches?.filteredResults?.length || 0;
    }

    // If squad is empty, reset veto and roulette completely
    if (activeMembers.length === 0) {
      if (this.vetoEngine) {
        this.vetoEngine.reset([], []);
      }
      if (this.rouletteEngine) {
        this.rouletteEngine.setGames([]);
      }
      document.getElementById('roulette-winner-card')?.classList.add('hidden');
      document.getElementById('roulette-veto-sync-bar')?.classList.add('hidden');
    }

    if (this.activeTab === 'tab-matches') {
      this.renderMatches();
    } else if (this.activeTab === 'tab-poll') {
      this.renderPoll();
    } else if (this.activeTab === 'tab-roulette') {
      this.renderRoulette();
      if (document.getElementById('subview-veto')?.classList.contains('active')) {
        this.renderVetoArena();
      }
    }
  }

  renderSquadList() {
    const listContainer = document.getElementById('members-list');
    const emptyState = document.getElementById('empty-squad-state');
    const countLabel = document.getElementById('member-count-label');
    const privacyAlert = document.getElementById('privacy-alert');

    if (!listContainer) return;

    listContainer.innerHTML = '';
    const members = this.squadManager.members || [];

    if (countLabel) {
      countLabel.textContent = `${members.length}/10`;
    }

    if (members.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      if (privacyAlert) privacyAlert.classList.add('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    let hasPrivate = false;

    members.forEach(member => {
      if (member.isPrivate) hasPrivate = true;

      const safeName = escapeHtml(member.personaName || member.input);
      const safeAvatar = member.avatarUrl || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';
      const gameCount = Array.isArray(member.games) ? member.games.length : 0;

      const card = document.createElement('div');
      card.className = `member-card ${member.active ? '' : 'inactive'}`;

      const checkboxTitle = member.active ? 'Kadrodan Çıkarılsın mı?' : 'Kadroya Eklensin mi?';

      card.innerHTML = `
        <div class="member-checkbox-wrap" title="${checkboxTitle}">
          <input type="checkbox" ${member.active ? 'checked' : ''} data-member-id="${member.id}" class="member-checkbox" title="${checkboxTitle}" />
        </div>
        <div class="member-avatar-wrap">
          <img src="${safeAvatar}" alt="${safeName}" class="member-avatar" />
          <span class="member-status-dot ${member.isPrivate ? 'status-private' : 'status-public'}" title="${member.isPrivate ? 'Oyun detayları gizli' : 'Herkese açık profil'}"></span>
        </div>
        <div class="member-info">
          <div class="member-name">${safeName}</div>
          <div class="member-meta">
            ${member.isPrivate ? '⚠️ Oyunları Gizli' : `${gameCount} Oyun`}
          </div>
        </div>
        <div class="member-actions">
          <button class="icon-btn btn-refresh" data-member-id="${member.id}" title="Kütüphaneyi Yenile">🔄</button>
          <button class="icon-btn btn-remove" data-member-id="${member.id}" title="Kadro'dan Çıkar">❌</button>
        </div>
      `;

      // Checkbox event
      card.querySelector('.member-checkbox')?.addEventListener('change', () => {
        this.squadManager.toggleMemberActive(member.id);
      });

      // Refresh event
      card.querySelector('.btn-refresh')?.addEventListener('click', async () => {
        const res = await this.squadManager.refreshMember(member.id);
        this.showToast(res.message);
      });

      // Remove event
      card.querySelector('.btn-remove')?.addEventListener('click', () => {
        this.squadManager.removeMember(member.id);
        this.showToast(`${member.personaName} çıkarıldı.`);
      });

      listContainer.appendChild(card);
    });

    if (privacyAlert) {
      if (hasPrivate) {
        privacyAlert.classList.remove('hidden');
      } else {
        privacyAlert.classList.add('hidden');
      }
    }
  }

  renderPresets() {
    const container = document.getElementById('presets-list');
    if (!container) return;

    container.innerHTML = '';
    const teams = this.squadManager.teams || [];
    const activeTeamId = this.squadManager.activeTeamId || 'team_all';

    if (teams.length === 0) {
      container.innerHTML = '<span style="font-size: 11px; color: #8f98a0;">Kayıtlı ekip yok.</span>';
      return;
    }

    teams.forEach(team => {
      const chip = document.createElement('div');
      const isActive = team.id === activeTeamId;
      chip.className = `preset-chip ${isActive ? 'active' : ''}`;
      
      const deleteBtn = !team.isDefault && team.id !== 'team_all'
        ? `<button class="preset-delete-btn" data-team-id="${team.id}" title="Ekibi sil">×</button>`
        : '';

      chip.innerHTML = `
        <span class="preset-name">${team.name}</span>
        ${deleteBtn}
      `;

      chip.addEventListener('click', async (e) => {
        if (e.target.classList.contains('preset-delete-btn')) {
          e.stopPropagation();
          const res = await this.squadManager.deleteTeam(team.id);
          this.renderSquadList();
          this.renderPresets();
          this.showToast(res.message);
          return;
        }
        await this.squadManager.applyTeamSelection(team.id, true);
        this.renderSquadList();
        this.renderPresets();
        this.showToast(`"${team.name}" seçildi.`);
      });

      container.appendChild(chip);
    });
  }

  async renderMatches() {
    const activeMembers = this.squadManager.getActiveMembers();
    this.currentMatches = await this.overlapEngine.computeOverlap(activeMembers);

    const stats = this.currentMatches?.stats;
    const fullEl = document.getElementById('stat-full-matches');
    const n1El = document.getElementById('stat-n1-matches');
    const n2El = document.getElementById('stat-n2-matches');
    const playedEl = document.getElementById('stat-played-count');
    const totalEl = document.getElementById('stat-total-games');
    const hidePlayedLabel = document.getElementById('hide-played-label');

    if (fullEl) fullEl.textContent = stats?.fullMatchCount || 0;
    if (n1El) n1El.textContent = stats?.n1Count || 0;
    if (n2El) n2El.textContent = stats?.n2Count || 0;
    if (playedEl) playedEl.textContent = stats?.playedCount || 0;
    if (totalEl) totalEl.textContent = stats?.totalUniqueGames || 0;
    if (hidePlayedLabel) hidePlayedLabel.textContent = `Oynananları Gizle (${stats?.playedCount || 0})`;

    const listContainer = document.getElementById('games-results-list');
    const emptyState = document.getElementById('empty-matches-state');

    if (!listContainer) return;
    listContainer.innerHTML = '';

    const games = this.currentMatches?.filteredResults || [];

    // Update navigation badge count to reflect currently filtered games count
    const matchBadge = document.getElementById('match-badge-count');
    if (matchBadge) {
      matchBadge.textContent = games.length;
    }

    if (games.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    games.forEach(game => {
      const card = document.createElement('div');
      card.className = `game-card ${game.isPlayed ? 'is-played' : ''}`;

      const isFull = game.ownerCount === stats.activePlayerCount;
      const isN1 = game.ownerCount === stats.activePlayerCount - 1;
      const badgeClass = isFull ? 'badge-100' : (isN1 ? 'badge-n1' : 'badge-n2');
      const badgeText = isFull ? 'HERKESTE VAR' : (isN1 ? `1 KİŞİDE YOK (${game.ownerCount}/${stats.activePlayerCount})` : `2 KİŞİDE YOK (${game.ownerCount}/${stats.activePlayerCount})`);

      let missingHtml = '';
      if (!isFull && game.missingMembers.length > 0) {
        const names = game.missingMembers.map(m => m.name).join(', ');
        let initialDiscountHtml = '';
        if (game.storeDetails?.hasDiscount) {
          initialDiscountHtml = `<span class="discount-pill">-%${game.storeDetails.discountPercent} ${game.storeDetails.finalFormatted}</span>`;
        } else if (game.storeDetails?.isFree) {
          initialDiscountHtml = `<span class="discount-pill">Ücretsiz</span>`;
        } else if (game.storeDetails?.finalFormatted) {
          initialDiscountHtml = `<span class="price-pill" style="background-color: rgba(255,255,255,0.12); padding: 1px 6px; border-radius: 3px; font-size: 10px; margin-left: 4px; font-weight: 600;">${game.storeDetails.finalFormatted}</span>`;
        }
        missingHtml = `
          <div class="game-ownership-status ownership-missing">
            <div class="missing-status-left">
              <span>⚠️ <strong>${names}</strong> hariç herkeste var</span>
              <span class="discount-container" data-app-id="${game.appId}">${initialDiscountHtml}</span>
            </div>
            <button class="btn-nudge-share" data-app-id="${game.appId}" title="${names} için özel davet mesajı kopyala">
              💬 Paylaş
            </button>
          </div>
        `;
      } else {
        missingHtml = `<div class="game-ownership-status ownership-full">✅ Seçilen tüm oyuncuların (${stats.activePlayerCount}/${stats.activePlayerCount}) kütüphanesinde var!</div>`;
      }

      const modeIcon = game.metadata?.mode === 'coop' ? '🤝 Co-Op' : (game.metadata?.mode === 'pvp' ? '⚔️ PvP' : (game.metadata?.mode === 'party' ? '🎲 Parti' : '🧗 Survival'));
      const maxP = game.metadata?.maxPlayers ? `${game.metadata.maxPlayers} Kişilik` : 'Multiplayer';
      const sizeTag = game.metadata?.size === 'small' ? '⚡ <5 GB' : (game.metadata?.size === 'medium' ? '💾 5-20 GB' : '📦 >20 GB');
      const playedBadge = game.isPlayed ? '<span class="game-played-badge">✓ OYNANDI</span>' : '';

      card.innerHTML = `
        <div class="game-banner-wrap">
          <img src="${game.logo}" alt="${game.name}" class="game-banner" loading="lazy" />
          ${playedBadge}
          <span class="game-match-badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="game-content">
          <div class="game-title-row">
            <h4 class="game-title" title="${game.name}">${game.name}</h4>
            <span class="game-playtime">⏱️ Toplam: ${Math.round(game.totalHours)}s</span>
          </div>
          <div class="game-tags-row">
            <span class="pill-tag">${modeIcon}</span>
            <span class="pill-tag">👥 ${maxP}</span>
            <span class="pill-tag">${sizeTag}</span>
          </div>
          ${missingHtml}
          <div class="game-footer-actions">
            <button class="btn btn-sm ${game.isPlayed ? 'btn-success' : 'btn-secondary'} game-played-btn" data-app-id="${game.appId}" title="Bu oyunu oynandı olarak işaretle/kaldır" style="flex: 1.1;">
              ${game.isPlayed ? '☑️ Oynandı' : '⬜ Oynandı'}
            </button>
            <a href="${game.storeLink}" target="_blank" class="btn btn-sm btn-secondary" style="flex: 0.9;">
              🏪 Mağaza
            </a>
            <a href="steam://run/${game.appId}" class="btn btn-sm btn-primary" style="flex: 0.9;">
              🚀 Oyna
            </a>
          </div>
        </div>
      `;

      // Played toggle click handler
      card.querySelector('.game-played-btn')?.addEventListener('click', async () => {
        const isNowPlayed = this.overlapEngine.togglePlayedGame(game.appId);
        const arr = Array.from(this.overlapEngine.playedGames);
        await chrome.storage.local.set({ played_game_app_ids: arr });
        await this.renderMatches();
        this.initVetoArena();
        this.renderRoulette();
        if (this.activeTab === 'tab-poll') this.renderPoll();
        this.showToast(isNowPlayed ? `✅ "${game.name}" oynandı olarak işaretlendi.` : `⬜ "${game.name}" oynandı listesinden çıkarıldı.`);
      });

      // Share / Nudge button click handler for missing games
      card.querySelector('.btn-nudge-share')?.addEventListener('click', async () => {
        const names = game.missingMembers.map(m => m.name).join(', ');
        let priceContext = '';
        if (game.storeDetails?.hasDiscount && game.storeDetails?.finalFormatted) {
          priceContext = ` şu an %${game.storeDetails.discountPercent} indirimle **${game.storeDetails.finalFormatted}** fiyata düşmüş!`;
        } else if (game.storeDetails?.isFree) {
          priceContext = ` tamamen **Ücretsiz**!`;
        } else if (game.storeDetails?.finalFormatted) {
          priceContext = ` şu an **${game.storeDetails.finalFormatted}** fiyatta.`;
        } else {
          priceContext = `!`;
        }

        const isPlural = game.missingMembers.length > 1;
        const callToAction = isPlural
          ? `Ekipçe oynamayı düşünüyoruz, kadroya katılmak için kütüphanenize eklemeyi düşünür müsünüz? 🎮`
          : `Ekipçe oynamayı düşünüyoruz, kadroya katılmak için almayı düşünür müsün? 🎮`;

        const msg = `Hey ${names}! 👋 Steam'de **${game.name}** oyunu${priceContext} ${callToAction}\n🔗 Steam Mağazası: ${game.storeLink || `https://store.steampowered.com/app/${game.appId}`}`;

        const success = await PollGenerator.copyToClipboard(msg);
        if (success) {
          this.showToast(`💬 ${names} için davet mesajı panoya kopyalandı!`);
        } else {
          this.showToast('Kopyalama başarısız oldu.');
        }
      });

      listContainer.appendChild(card);

      // Asynchronously fetch and display live price & discount from Steam Store API
      if (!isFull && game.missingMembers.length > 0 && !game.storeDetails) {
        fetchGameStoreDetails(game.appId).then(details => {
          if (!details) return;
          game.storeDetails = details;
          const container = card.querySelector(`.discount-container[data-app-id="${game.appId}"]`);
          if (container) {
            if (details.hasDiscount) {
              container.innerHTML = `<span class="discount-pill">-%${details.discountPercent} ${details.finalFormatted}</span>`;
            } else if (details.isFree) {
              container.innerHTML = `<span class="discount-pill">Ücretsiz</span>`;
            } else if (details.finalFormatted) {
              container.innerHTML = `<span class="price-pill" style="background-color: rgba(255,255,255,0.12); padding: 1px 6px; border-radius: 3px; font-size: 10px; margin-left: 4px; font-weight: 600;">${details.finalFormatted}</span>`;
            }
          }
        }).catch(() => {});
      }
    });
  }

  renderPoll() {
    const activeMembers = this.squadManager.getActiveMembers();
    let games = [];

    if (this.currentMatches) {
      if (this.pollTier === 'all_100') {
        games = this.currentMatches.fullMatches || [];
      } else if (this.pollTier === 'all_with_n1') {
        games = this.currentMatches.n1Matches || [];
      } else if (this.pollTier === 'all_with_n2') {
        games = this.currentMatches.n2Matches || [];
      } else {
        games = this.currentMatches.filteredResults || [];
      }
    }

    // Always filter out played games in Poll generator regardless of any active filter or toggle
    games = games.filter(g => !g.isPlayed && !this.overlapEngine.playedGames.has(Number(g.appId)));

    const previewEl = document.getElementById('poll-preview-text');
    const badgeEl = document.getElementById('preview-badge');

    if (!previewEl) return;

    if (this.pollPlatform === 'discord') {
      if (badgeEl) {
        badgeEl.textContent = 'DISCORD';
        badgeEl.style.backgroundColor = '#5865F2';
      }
      previewEl.textContent = PollGenerator.generateDiscordPoll(games, activeMembers.length, { limit: this.pollLimit });
    } else {
      if (badgeEl) {
        badgeEl.textContent = 'WHATSAPP';
        badgeEl.style.backgroundColor = '#25D366';
      }
      previewEl.textContent = PollGenerator.generateWhatsAppPoll(games, activeMembers.length, { limit: this.pollLimit });
    }
  }

  renderRoulette() {
    const activeMembers = this.squadManager.getActiveMembers();
    const syncBar = document.getElementById('roulette-veto-sync-bar');
    const syncText = document.getElementById('roulette-sync-text');

    if (activeMembers.length === 0) {
      if (this.rouletteEngine) {
        this.rouletteEngine.setGames([]);
      }
      if (syncBar) syncBar.classList.add('hidden');
      return;
    }

    let games = this.currentMatches?.filteredResults || [];

    // Filter out played games unconditionally
    games = games.filter(g => !g.isPlayed && !this.overlapEngine.playedGames.has(Number(g.appId)));

    // If Veto Arena has active eliminations, sync remaining games to the wheel!
    if (this.vetoEngine && this.vetoEngine.eliminatedGames && this.vetoEngine.eliminatedGames.length > 0 && this.vetoEngine.remainingGames && this.vetoEngine.remainingGames.length > 0) {
      games = this.vetoEngine.remainingGames;
      if (syncBar && syncText) {
        syncText.textContent = `🎯 Veto sonrası kalan ${games.length} oyun çarkta (${this.vetoEngine.eliminatedGames.length} oyun elendi)`;
        syncBar.classList.remove('hidden');
      }
    } else {
      if (syncBar) {
        syncBar.classList.add('hidden');
      }
    }

    if (this.rouletteEngine) {
      this.rouletteEngine.setGames(games);
    }
  }

  onRouletteWinner(winner) {
    if (!winner) return;
    this.lastRouletteWinner = winner;

    const winnerCard = document.getElementById('roulette-winner-card');
    const titleEl = document.getElementById('winner-game-title');
    const imageEl = document.getElementById('winner-game-image');
    const infoEl = document.getElementById('winner-game-info');
    const launchBtn = document.getElementById('winner-launch-btn');

    if (winnerCard && titleEl) {
      titleEl.textContent = winner.name;
      if (imageEl) imageEl.src = winner.logo;
      if (infoEl) {
        const mode = winner.metadata?.mode?.toUpperCase() || 'COOP';
        const p = winner.metadata?.maxPlayers || 4;
        infoEl.textContent = `${mode} • ${p} Kişilik • Toplam ${Math.round(winner.totalHours)} Saat Oynandı`;
      }
      if (launchBtn) {
        launchBtn.href = `steam://run/${winner.appId}`;
      }
      winnerCard.classList.remove('hidden');
    }
  }

  initVetoArena() {
    const activeMembers = this.squadManager.getActiveMembers();
    let games = (this.currentMatches?.filteredResults || []);

    // Filter out played games unconditionally
    games = games.filter(g => !g.isPlayed && !this.overlapEngine.playedGames.has(Number(g.appId)));
    games = games.slice(0, 32); // Up to 32 candidate games for veto

    document.getElementById('veto-champion-card')?.classList.add('hidden');

    this.vetoEngine.reset(games, activeMembers);
    this.renderVetoArena();
  }

  renderVetoArena() {
    const activeMembers = this.squadManager.getActiveMembers();
    const turnIndicator = document.getElementById('veto-current-player-text');
    const grid = document.getElementById('veto-games-grid');
    const graveyardList = document.getElementById('veto-graveyard-list');

    if (!grid) return;
    grid.innerHTML = '';

    if (activeMembers.length === 0 || !this.vetoEngine || this.vetoEngine.remainingGames.length === 0) {
      if (turnIndicator) {
        turnIndicator.textContent = 'Kadroda aktif oyuncu yok. Lütfen önce kadroya oyuncu ekleyin.';
      }
      if (graveyardList) {
        graveyardList.innerHTML = '<span style="font-size: 11px; color: #8f98a0;">Elenen oyun yok.</span>';
      }
      grid.innerHTML = '<div style="text-align: center; padding: 24px 10px; color: #8f98a0;">👥 Kadro boş olduğu için elenecek oyun bulunmuyor.</div>';
      return;
    }

    const currentPlayer = this.vetoEngine.getCurrentPlayer();
    if (turnIndicator) {
      if (currentPlayer) {
        turnIndicator.textContent = `🎯 Sıra: ${currentPlayer.personaName} — İstemediğin 1 oyunu tıkla ve ele!`;
      } else {
        turnIndicator.textContent = 'Kadroda aktif oyuncu yok.';
      }
    }

    // Render candidate games
    this.vetoEngine.remainingGames.forEach(game => {
      const card = document.createElement('div');
      card.className = 'veto-card';
      card.innerHTML = `
        <div class="veto-card-info">
          <img src="${game.logo}" alt="${game.name}" class="veto-card-thumb" />
          <span class="veto-card-title">${game.name}</span>
        </div>
        <button class="btn btn-sm btn-danger-outline btn-veto" data-app-id="${game.appId}">
          VETO ET ❌
        </button>
      `;

      card.querySelector('.btn-veto')?.addEventListener('click', () => {
        this.vetoEngine.vetoGame(game.appId);
        this.renderRoulette();
      });

      grid.appendChild(card);
    });

    // Render graveyard
    if (graveyardList) {
      graveyardList.innerHTML = '';
      this.vetoEngine.eliminatedGames.forEach(item => {
        const pill = document.createElement('span');
        pill.className = 'graveyard-pill';
        pill.textContent = `${item.game.name} (${item.eliminatedBy})`;
        graveyardList.appendChild(pill);
      });
    }
  }

  onVetoWinner(winner) {
    if (!winner) return;

    const championCard = document.getElementById('veto-champion-card');
    const championTitle = document.getElementById('veto-champion-title');
    const launchBtn = document.getElementById('veto-champion-launch-btn');

    if (championCard && championTitle) {
      championTitle.textContent = winner.name;
      if (launchBtn) {
        launchBtn.href = `steam://run/${winner.appId}`;
      }
      championCard.classList.remove('hidden');
    }
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SteamSquadApp();
});
