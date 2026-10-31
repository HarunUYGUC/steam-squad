/**
 * SteamSquad — Side Panel Application Controller
 * Orchestrates UI state, tab navigation, event bindings, and submodules.
 */

import { SquadManager } from './squad-manager.js';
import { OverlapEngine } from './overlap-engine.js';
import { PollGenerator } from './poll-generator.js';
import { RouletteEngine, VetoArenaEngine } from './roulette.js';
import { fetchGameStoreDetails } from '../services/steam-service.js';
import { dealsService } from '../services/deals-service.js';
import { i18n } from '../services/i18n.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeHttpUrl(url, fallback = '') {
  if (!url || typeof url !== 'string') return fallback;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
      return escapeHtml(parsed.href);
    }
  } catch { }
  return fallback;
}

function getSteamRunUrl(appId) {
  const num = parseInt(appId, 10);
  return (Number.isSafeInteger(num) && num > 0) ? `steam://run/${num}` : '#';
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
    await i18n.init();
    this.updateLangToggleButton();
    this.updateStaticNavTexts();
    this.updateSquadTabTranslations();
    this.updateMatchesTabTranslations();
    this.updatePollTabTranslations();
    this.updateRouletteTabTranslations();
    i18n.subscribe(() => {
      this.updateLangToggleButton();
      this.updateStaticNavTexts();
      this.updateSquadTabTranslations();
      this.updateMatchesTabTranslations();
      this.updatePollTabTranslations();
      this.updateRouletteTabTranslations();
    });

    this.bindGlobalEvents();
    this.initRouletteAndVeto();

    // Load persisted played games
    try {
      const stored = await chrome.storage.local.get('played_game_app_ids');
      if (Array.isArray(stored.played_game_app_ids)) {
        this.overlapEngine.setPlayedGames(stored.played_game_app_ids);
      }
    } catch { }

    this.squadManager.subscribe(() => {
      this.onSquadUpdated();
    });

    await this.squadManager.init();

    // Check if opened for a specific game target from Steam store badge
    try {
      const target = await chrome.storage.local.get('steamsquad_target_app_id');
      if (target.steamsquad_target_app_id) {
        const targetId = target.steamsquad_target_app_id;
        await chrome.storage.local.remove('steamsquad_target_app_id');
        setTimeout(() => {
          this.focusGame(targetId);
        }, 250);
      }
    } catch (e) {
      console.warn('[SteamSquad] Target app check error:', e);
    }

    // Check SteamLens AI cross-promotion display eligibility
    try {
      const promoData = await chrome.storage.local.get([
        'steamsquad_steamlens_snoozed_until',
        'steamsquad_steamlens_permanent_dismiss'
      ]);
      const isPermanent = promoData.steamsquad_steamlens_permanent_dismiss === true;
      const isSnoozed = promoData.steamsquad_steamlens_snoozed_until && Date.now() < promoData.steamsquad_steamlens_snoozed_until;
      if (!isPermanent && !isSnoozed) {
        document.getElementById('steamlens-promo-card')?.classList.remove('hidden');
      }
    } catch (e) {
      console.warn('[SteamSquad] Promo check error:', e);
    }

    // Check 7-day in-app review prompt eligibility (3s delay on launch)
    try {
      const reviewData = await chrome.storage.local.get([
        'steamsquad_first_seen',
        'steamsquad_review_dismissed'
      ]);

      let firstSeen = reviewData.steamsquad_first_seen;
      if (!firstSeen) {
        firstSeen = Date.now();
        await chrome.storage.local.set({ steamsquad_first_seen: firstSeen });
      }

      const isDismissed = reviewData.steamsquad_review_dismissed === true;
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const isEligible = (Date.now() - firstSeen) >= sevenDaysMs;

      if (!isDismissed && isEligible) {
        setTimeout(() => {
          const banner = document.getElementById('review-prompt-banner');
          if (banner) {
            banner.classList.remove('hidden');
          }
        }, 3000);
      }
    } catch (e) {
      console.warn('[SteamSquad] Review prompt check error:', e);
    }
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

  updateLangToggleButton() {
    const lang = i18n.getLanguage();
    const flagEl = document.getElementById('lang-flag');
    const codeEl = document.getElementById('lang-code');
    const btn = document.getElementById('btn-toggle-lang');
    if (flagEl && codeEl) {
      if (lang === 'en') {
        flagEl.textContent = '🇬🇧';
        codeEl.textContent = 'EN';
        if (btn) btn.title = 'Switch to Turkish / Türkçe\'ye Geç';
      } else {
        flagEl.textContent = '🇹🇷';
        codeEl.textContent = 'TR';
        if (btn) btn.title = 'Switch to English / İngilizce\'ye Geç';
      }
    }
  }

  updateStaticNavTexts() {
    const subtitleEl = document.getElementById('header-subtitle');
    if (subtitleEl) subtitleEl.textContent = i18n.t('headerSubtitle');

    const tabSquad = document.getElementById('tab-label-squad');
    if (tabSquad) tabSquad.textContent = i18n.t('tabSquad');

    const tabMatches = document.getElementById('tab-label-matches');
    if (tabMatches) tabMatches.textContent = i18n.t('tabMatches');

    const tabPoll = document.getElementById('tab-label-poll');
    if (tabPoll) tabPoll.textContent = i18n.t('tabPoll');

    const tabRoulette = document.getElementById('tab-label-roulette');
    if (tabRoulette) tabRoulette.textContent = i18n.t('tabRoulette');

    const countBadge = document.getElementById('active-squad-count');
    if (countBadge) {
      const activeMembers = this.squadManager ? this.squadManager.getActiveMembers() : [];
      countBadge.textContent = i18n.t('playersReady', { count: activeMembers.length });
    }

    // 7-day in-app review prompt translations
    const reviewText = document.getElementById('label-review-prompt-text');
    if (reviewText) reviewText.textContent = i18n.t('reviewPromptText');
    const reviewBtn = document.getElementById('label-review-prompt-btn');
    if (reviewBtn) reviewBtn.textContent = i18n.t('reviewPromptBtn');
    const reviewClose = document.getElementById('btn-close-review-prompt');
    if (reviewClose) reviewClose.title = i18n.t('reviewPromptClose');

    document.documentElement.lang = i18n.getLanguage();
  }

  updateSquadTabTranslations() {
    const labelAddFriend = document.getElementById('label-add-friend');
    if (labelAddFriend) labelAddFriend.textContent = i18n.t('addFriendHeading');

    const memberInput = document.getElementById('member-input');
    if (memberInput) memberInput.placeholder = i18n.t('inputPlaceholder');

    const labelBtnAdd = document.getElementById('label-btn-add');
    if (labelBtnAdd) labelBtnAdd.textContent = i18n.t('btnAdd');

    const labelInputHint = document.getElementById('label-input-hint');
    if (labelInputHint) labelInputHint.innerHTML = i18n.t('inputHint');

    const labelToggleApiKey = document.getElementById('label-toggle-api-key');
    if (labelToggleApiKey) labelToggleApiKey.textContent = i18n.t('unlockFullLibrary');

    const labelApiKeyDesc = document.getElementById('label-api-key-desc');
    if (labelApiKeyDesc) labelApiKeyDesc.innerHTML = i18n.t('apiKeyDesc');

    const apiKeyInput = document.getElementById('api-key-input');
    if (apiKeyInput) apiKeyInput.placeholder = i18n.t('apiKeyPlaceholder');

    const btnSaveApiKey = document.getElementById('btn-save-api-key');
    if (btnSaveApiKey) btnSaveApiKey.textContent = i18n.t('btnSaveKey');

    const btnDeleteApiKey = document.getElementById('btn-delete-api-key');
    if (btnDeleteApiKey) {
      btnDeleteApiKey.textContent = i18n.t('btnDeleteKey');
      btnDeleteApiKey.title = i18n.t('btnDeleteKeyTitle');
    }

    const btnCreateTeam = document.getElementById('btn-create-team');
    const labelBtnCreateTeam = document.getElementById('label-btn-create-team');
    if (btnCreateTeam) btnCreateTeam.title = i18n.t('btnCreateSquadTitle');
    if (labelBtnCreateTeam) labelBtnCreateTeam.textContent = i18n.t('btnCreateSquad');

    const btnClearSquad = document.getElementById('btn-clear-squad');
    const labelBtnClearSquad = document.getElementById('label-btn-clear-squad');
    if (btnClearSquad) btnClearSquad.title = i18n.t('btnClearTitle');
    if (labelBtnClearSquad) labelBtnClearSquad.textContent = i18n.t('btnClear');

    const labelPresets = document.getElementById('label-presets');
    if (labelPresets) labelPresets.textContent = i18n.t('savedSquadsHeading');

    const labelPrivacyTitle = document.getElementById('label-privacy-title');
    if (labelPrivacyTitle) labelPrivacyTitle.textContent = i18n.t('privacyAlertTitle');

    const privacyAlertText = document.getElementById('privacy-alert-text');
    if (privacyAlertText) privacyAlertText.textContent = i18n.t('privacyAlertText');

    const labelSquadHeading = document.getElementById('label-squad-heading');
    if (labelSquadHeading) labelSquadHeading.textContent = i18n.t('squadMembersHeading');

    const labelSquadSubhint = document.getElementById('label-squad-subhint');
    if (labelSquadSubhint) labelSquadSubhint.textContent = i18n.t('squadSubhint');

    const labelEmptyTitle = document.getElementById('label-empty-squad-title');
    if (labelEmptyTitle) labelEmptyTitle.textContent = i18n.t('emptySquadTitle');

    const labelEmptySub = document.getElementById('label-empty-squad-sub');
    if (labelEmptySub) labelEmptySub.textContent = i18n.t('emptySquadSub');

    // SteamLens promo card translations
    const promoTag = document.getElementById('label-promo-companion-tag');
    if (promoTag) promoTag.textContent = i18n.t('promoCompanionTag');

    const promoTitle = document.getElementById('label-promo-steamlens-title');
    if (promoTitle) promoTitle.textContent = i18n.t('promoSteamLensTitle');

    const promoDesc = document.getElementById('label-promo-steamlens-desc');
    if (promoDesc) promoDesc.textContent = i18n.t('promoSteamLensDesc');

    const promoBtn = document.getElementById('label-promo-steamlens-btn');
    if (promoBtn) promoBtn.textContent = i18n.t('promoSteamLensBtn');

    const btnDismissPromo = document.getElementById('btn-dismiss-promo');
    if (btnDismissPromo) btnDismissPromo.title = i18n.t('promoDismissTitle');

    this.renderSquadList();
    this.renderPresets();
  }

  updateMatchesTabTranslations() {
    // Stat cards tooltips, units, and labels
    const statItemFull = document.getElementById('stat-item-full');
    if (statItemFull) statItemFull.title = i18n.t('statFullTooltip');
    const statUnitFull = document.getElementById('stat-unit-full');
    if (statUnitFull) statUnitFull.textContent = i18n.t('statUnitGames');
    const statLabelFull = document.getElementById('stat-label-full');
    if (statLabelFull) statLabelFull.textContent = i18n.t('statLabelAllOwn');

    const statItemN1 = document.getElementById('stat-item-n1');
    if (statItemN1) statItemN1.title = i18n.t('statN1Tooltip');
    const statUnitN1 = document.getElementById('stat-unit-n1');
    if (statUnitN1) statUnitN1.textContent = i18n.t('statUnitGames');
    const statLabelN1 = document.getElementById('stat-label-n1');
    if (statLabelN1) statLabelN1.textContent = i18n.t('statLabelOneMissing');

    const statItemN2 = document.getElementById('stat-item-n2');
    if (statItemN2) statItemN2.title = i18n.t('statN2Tooltip');
    const statUnitN2 = document.getElementById('stat-unit-n2');
    if (statUnitN2) statUnitN2.textContent = i18n.t('statUnitGames');
    const statLabelN2 = document.getElementById('stat-label-n2');
    if (statLabelN2) statLabelN2.textContent = i18n.t('statLabelTwoMissing');

    const statItemPlayed = document.getElementById('stat-item-played');
    if (statItemPlayed) statItemPlayed.title = i18n.t('statPlayedTooltip');
    const statUnitPlayed = document.getElementById('stat-unit-played');
    if (statUnitPlayed) statUnitPlayed.textContent = i18n.t('statUnitGames');
    const statLabelPlayed = document.getElementById('stat-label-played');
    if (statLabelPlayed) statLabelPlayed.textContent = i18n.t('statLabelPlayed');

    const statItemTotal = document.getElementById('stat-item-total');
    if (statItemTotal) statItemTotal.title = i18n.t('statTotalTooltip');
    const statUnitTotal = document.getElementById('stat-unit-total');
    if (statUnitTotal) statUnitTotal.textContent = i18n.t('statUnitGames');
    const statLabelTotal = document.getElementById('stat-label-total');
    if (statLabelTotal) statLabelTotal.textContent = i18n.t('statLabelTotalPool');

    // Filter tier segmented buttons
    const tierBtnAll = document.getElementById('tier-btn-all');
    if (tierBtnAll) tierBtnAll.textContent = i18n.t('tierAllOwn');
    const tierBtnN1 = document.getElementById('tier-btn-n1');
    if (tierBtnN1) tierBtnN1.textContent = i18n.t('tierOneMissing');
    const tierBtnN2 = document.getElementById('tier-btn-n2');
    if (tierBtnN2) tierBtnN2.textContent = i18n.t('tierTwoMissing');

    // Category tags
    const tagModeAll = document.getElementById('tag-mode-all');
    if (tagModeAll) tagModeAll.textContent = i18n.t('tagAllMode');
    const tagModeCoop = document.getElementById('tag-mode-coop');
    if (tagModeCoop) tagModeCoop.textContent = i18n.t('tagCoopMode');
    const tagModePvp = document.getElementById('tag-mode-pvp');
    if (tagModePvp) tagModePvp.textContent = i18n.t('tagPvpMode');
    const tagModeParty = document.getElementById('tag-mode-party');
    if (tagModeParty) tagModeParty.textContent = i18n.t('tagPartyMode');
    const tagModeSurvival = document.getElementById('tag-mode-survival');
    if (tagModeSurvival) tagModeSurvival.textContent = i18n.t('tagSurvivalMode');

    // Search input
    const searchInput = document.getElementById('game-search-input');
    if (searchInput) searchInput.placeholder = i18n.t('searchPlaceholder');

    // Sort options
    const optHours = document.getElementById('opt-sort-hours');
    if (optHours) optHours.textContent = i18n.t('sortMostPlayed');
    const optName = document.getElementById('opt-sort-name');
    if (optName) optName.textContent = i18n.t('sortNameAZ');
    const optMaxPlayers = document.getElementById('opt-sort-maxplayers');
    if (optMaxPlayers) optMaxPlayers.textContent = i18n.t('sortPlayerCapacity');

    // Toggles
    const toggleWrapQuick = document.getElementById('toggle-wrap-quick-download');
    if (toggleWrapQuick) toggleWrapQuick.title = i18n.t('tooltipQuickDownload');
    const labelQuick = document.getElementById('label-quick-download');
    if (labelQuick) labelQuick.textContent = i18n.t('labelQuickDownload');

    const toggleWrapHidePlayed = document.getElementById('toggle-wrap-hide-played');
    if (toggleWrapHidePlayed) toggleWrapHidePlayed.title = i18n.t('tooltipHidePlayed');
    const hidePlayedLabel = document.getElementById('hide-played-label');
    if (hidePlayedLabel) {
      const playedCount = this.currentMatches?.stats?.playedCount || 0;
      hidePlayedLabel.textContent = i18n.t('hidePlayed', { count: playedCount });
    }

    // Empty matches state
    const labelEmptyTitle = document.getElementById('label-empty-matches-title');
    if (labelEmptyTitle) labelEmptyTitle.textContent = i18n.t('emptyMatchesTitle');
    const labelEmptySub = document.getElementById('label-empty-matches-sub');
    if (labelEmptySub) labelEmptySub.textContent = i18n.t('emptyMatchesSub');

    if (this.currentMatches) {
      this.renderMatches();
    }
  }

  updatePollTabTranslations() {
    const labelTitle = document.getElementById('label-poll-title');
    if (labelTitle) labelTitle.textContent = i18n.t('pollGeneratorTitle');

    const labelSub = document.getElementById('label-poll-sub');
    if (labelSub) labelSub.textContent = i18n.t('pollGeneratorSub');

    const labelPlatform = document.getElementById('label-poll-platform');
    if (labelPlatform) labelPlatform.textContent = i18n.t('pollPlatformLabel');

    const labelScope = document.getElementById('label-poll-scope');
    if (labelScope) labelScope.textContent = i18n.t('pollScopeLabel');

    const pollTierAll = document.getElementById('poll-tier-all');
    if (pollTierAll) pollTierAll.textContent = i18n.t('pollScopeAll');

    const pollTierN1 = document.getElementById('poll-tier-n1');
    if (pollTierN1) pollTierN1.textContent = i18n.t('pollScopeN1');

    const pollTierN2 = document.getElementById('poll-tier-n2');
    if (pollTierN2) pollTierN2.textContent = i18n.t('pollScopeN2');

    const labelLimit = document.getElementById('label-poll-limit');
    if (labelLimit) labelLimit.textContent = i18n.t('pollLimitLabel');

    const pollLimit3 = document.getElementById('poll-limit-3');
    if (pollLimit3) pollLimit3.textContent = i18n.t('pollLimit3');

    const pollLimit5 = document.getElementById('poll-limit-5');
    if (pollLimit5) pollLimit5.textContent = i18n.t('pollLimit5');

    const pollLimit8 = document.getElementById('poll-limit-8');
    if (pollLimit8) pollLimit8.textContent = i18n.t('pollLimit8');

    const labelPreviewTitle = document.getElementById('label-poll-preview-title');
    if (labelPreviewTitle) labelPreviewTitle.textContent = i18n.t('pollPreviewTitle');

    const labelBtnCopy = document.getElementById('label-btn-copy-poll');
    if (labelBtnCopy) labelBtnCopy.textContent = i18n.t('btnCopyPoll');

    const labelHowTitle = document.getElementById('label-poll-how-title');
    if (labelHowTitle) labelHowTitle.textContent = i18n.t('pollHowTitle');

    const step1 = document.getElementById('label-poll-step1');
    if (step1) step1.innerHTML = i18n.t('pollStep1');

    const step2 = document.getElementById('label-poll-step2');
    if (step2) step2.innerHTML = i18n.t('pollStep2');

    const step3 = document.getElementById('label-poll-step3');
    if (step3) step3.innerHTML = i18n.t('pollStep3');

    this.renderPoll();
  }

  updateRouletteTabTranslations() {
    const labelSubmodeRoulette = document.getElementById('label-submode-roulette');
    if (labelSubmodeRoulette) labelSubmodeRoulette.textContent = i18n.t('submodeRoulette');

    const labelSubmodeVeto = document.getElementById('label-submode-veto');
    if (labelSubmodeVeto) labelSubmodeVeto.textContent = i18n.t('submodeVeto');

    const labelBtnRestore = document.getElementById('label-btn-restore-wheel');
    if (labelBtnRestore) labelBtnRestore.textContent = i18n.t('btnRestoreWheel');

    const labelBtnSpin = document.getElementById('label-btn-spin-wheel');
    if (labelBtnSpin) labelBtnSpin.textContent = i18n.t('btnSpinWheel');

    const btnToggleSound = document.getElementById('btn-toggle-sound');
    if (btnToggleSound) btnToggleSound.title = i18n.t('btnSoundTitle');

    const btnCloseWinner = document.getElementById('btn-close-winner-card');
    if (btnCloseWinner) btnCloseWinner.title = i18n.t('btnCloseTitle');

    const labelWinnerBadge = document.getElementById('label-winner-badge');
    if (labelWinnerBadge) labelWinnerBadge.textContent = i18n.t('winnerTitle');

    const labelWinnerLaunch = document.getElementById('label-winner-launch');
    if (labelWinnerLaunch) labelWinnerLaunch.textContent = i18n.t('btnLaunchSteam');

    const labelBtnShareWinner = document.getElementById('label-btn-share-winner');
    if (labelBtnShareWinner) labelBtnShareWinner.textContent = i18n.t('btnShareWinner');

    const labelBtnResetVeto = document.getElementById('label-btn-reset-veto');
    if (labelBtnResetVeto) labelBtnResetVeto.textContent = i18n.t('btnResetVeto');

    const labelVetoGraveyard = document.getElementById('label-veto-graveyard');
    if (labelVetoGraveyard) labelVetoGraveyard.textContent = i18n.t('eliminatedGamesHeading');

    const labelChampionHeading = document.getElementById('label-veto-champion-heading');
    if (labelChampionHeading) labelChampionHeading.textContent = i18n.t('vetoChampionHeading');

    const labelChampionDesc = document.getElementById('label-veto-champion-desc');
    if (labelChampionDesc) labelChampionDesc.textContent = i18n.t('vetoChampionDesc');

    const labelChampionLaunch = document.getElementById('label-veto-champion-launch');
    if (labelChampionLaunch) labelChampionLaunch.textContent = i18n.t('vetoChampionLaunch');

    this.renderRoulette();
    this.renderVetoArena();
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
    // Listen for live focus requests from content scripts
    chrome.runtime.onMessage?.addListener((message) => {
      if (message?.type === 'FOCUS_GAME_IN_SIDEPANEL' && message.appId) {
        this.focusGame(message.appId);
      }
    });

    chrome.storage.onChanged?.addListener((changes, area) => {
      if (area === 'local' && changes.steamsquad_target_app_id?.newValue) {
        const id = changes.steamsquad_target_app_id.newValue;
        chrome.storage.local.remove('steamsquad_target_app_id');
        this.focusGame(id);
      }
    });

    // Language toggle button
    document.getElementById('btn-toggle-lang')?.addEventListener('click', async () => {
      const nextLang = await i18n.toggleLanguage();
      this.updateLangToggleButton();
      this.showToast(i18n.t('langSwitched'));
    });

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
        addBtn.innerHTML = `<span>${i18n.t('btnSearching')}</span>`;

        const result = await this.squadManager.addMember(value);
        addBtn.disabled = false;
        addBtn.innerHTML = `<span>${i18n.t('btnAdd')}</span>`;

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
      const teamName = prompt(i18n.t('promptNewTeam'), i18n.t('defaultNewTeamName'));
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
      this.showToast(keyVal ? i18n.t('apiKeySavedRefresh') : i18n.t('apiKeyCleared'));

      // Refresh all existing members
      for (const m of this.squadManager.members) {
        await this.squadManager.refreshMember(m.id);
      }
      this.renderSquadList();
    });

    apiKeyDeleteBtn?.addEventListener('click', async () => {
      await chrome.storage.local.remove('steamsquad_api_key');
      if (apiKeyInput) apiKeyInput.value = '';
      this.showToast(i18n.t('apiKeyDeleted'));
    });

    // Clear squad
    document.getElementById('btn-clear-squad')?.addEventListener('click', async () => {
      if (confirm(i18n.t('confirmClearSquad'))) {
        await this.squadManager.clearAllMembers();
        this.renderSquadList();
        this.showToast(i18n.t('squadCleared'));
      }
    });

    // SteamLens promo card dismissal (7 days snooze)
    document.getElementById('btn-dismiss-promo')?.addEventListener('click', () => {
      const card = document.getElementById('steamlens-promo-card');
      if (card) {
        card.classList.add('dismissing');
        setTimeout(() => card.classList.add('hidden'), 250);
      }
      chrome.storage.local.set({
        steamsquad_steamlens_snoozed_until: Date.now() + (7 * 24 * 60 * 60 * 1000)
      });
    });

    // SteamLens promo card CTA click (permanent dismiss)
    document.getElementById('btn-promo-steamlens-cta')?.addEventListener('click', () => {
      chrome.storage.local.set({
        steamsquad_steamlens_permanent_dismiss: true
      });
      const card = document.getElementById('steamlens-promo-card');
      if (card) {
        card.classList.add('dismissing');
        setTimeout(() => card.classList.add('hidden'), 250);
      }
    });

    // 7-Day in-app review prompt close (permanent dismiss)
    document.getElementById('btn-close-review-prompt')?.addEventListener('click', () => {
      const banner = document.getElementById('review-prompt-banner');
      if (banner) {
        banner.classList.add('dismissing');
        setTimeout(() => banner.classList.add('hidden'), 250);
      }
      chrome.storage.local.set({ steamsquad_review_dismissed: true });
    });

    // 7-Day in-app review prompt CTA click (permanent dismiss)
    document.getElementById('btn-review-prompt-cta')?.addEventListener('click', () => {
      const banner = document.getElementById('review-prompt-banner');
      if (banner) {
        banner.classList.add('dismissing');
        setTimeout(() => banner.classList.add('hidden'), 250);
      }
      chrome.storage.local.set({ steamsquad_review_dismissed: true });
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
          this.showToast(i18n.t('pollCopiedToast'));
        } else {
          this.showToast(i18n.t('pollCopyFailed'));
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
      this.showToast(i18n.t('wheelResetToast'));
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
      const isSolo = w.metadata?.mode === 'solo' || w.metadata?.maxPlayers === 1;
      const p = isSolo
        ? i18n.t('tagSoloCapacity')
        : (w.metadata?.maxPlayers ? i18n.t('tagMultiCapacity', { count: w.metadata.maxPlayers }) : i18n.t('tagMultiplayerGeneral'));
      const text = i18n.t('winnerShareTemplate', {
        name: w.name,
        mode: mode,
        players: p,
        link: `https://store.steampowered.com/app/${w.appId}`
      });
      const success = await PollGenerator.copyToClipboard(text);
      if (success) {
        this.showToast(i18n.t('winnerShareToast'));
      } else {
        this.showToast(i18n.t('pollCopyFailed'));
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
      this.showToast(i18n.t('vetoResetToast'));
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

  /**
   * Switches to matches tab, ensures the game is visible by updating filters,
   * scrolls the game card into view, and highlights it with an animated pulse.
   * @param {number|string} targetAppId
   */
  async focusGame(targetAppId) {
    if (!targetAppId) return;
    const numId = parseInt(targetAppId, 10);
    if (!Number.isSafeInteger(numId) || numId <= 0) return;

    // Switch to matches tab
    this.switchTab('tab-matches');

    const activeMembers = this.squadManager.getActiveMembers();
    if (!this.currentMatches) {
      this.currentMatches = await this.overlapEngine.computeOverlap(activeMembers);
    }

    // Determine which match tier the target game belongs to
    const full = this.currentMatches?.fullMatches || [];
    const n1 = this.currentMatches?.n1Matches || [];
    const n2 = this.currentMatches?.n2Matches || [];

    let requiredTier = null;
    if (full.some(g => Number(g.appId) === numId)) {
      requiredTier = 'all_100';
    } else if (n1.some(g => Number(g.appId) === numId)) {
      requiredTier = 'all_with_n1';
    } else if (n2.some(g => Number(g.appId) === numId)) {
      requiredTier = 'all_with_n2';
    }

    if (!requiredTier) {
      this.showToast(i18n.t('toastGameNotInPool'));
      return;
    }

    const currentTier = this.overlapEngine.filters.matchTier;
    if (currentTier !== requiredTier) {
      document.querySelectorAll('#match-tier-filter .segment-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tier') === requiredTier);
      });
      this.overlapEngine.setFilters({ matchTier: requiredTier });
    }

    // Reset game mode tag to 'all' so it is not hidden by genre filter
    if (this.overlapEngine.filters.gameMode !== 'all') {
      document.querySelectorAll('#game-mode-filter .tag-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-mode') === 'all');
      });
      this.overlapEngine.setFilters({ gameMode: 'all' });
    }

    // Clear search filter so game is not hidden
    const searchInput = document.getElementById('game-search-input');
    if (searchInput && searchInput.value) {
      searchInput.value = '';
      this.overlapEngine.setFilters({ searchQuery: '' });
    }

    // Re-render matches to show target game
    await this.renderMatches();

    // Scroll to the card and highlight
    setTimeout(() => {
      const cardEl = document.getElementById(`game-card-${numId}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cardEl.classList.add('card-highlight-pulse');
        setTimeout(() => cardEl.classList.remove('card-highlight-pulse'), 3500);
      }
    }, 150);
  }

  async onSquadUpdated() {
    this.renderSquadList();
    this.renderPresets();

    const activeMembers = this.squadManager.getActiveMembers();
    const countBadge = document.getElementById('active-squad-count');
    if (countBadge) {
      countBadge.textContent = i18n.t('playersReady', { count: activeMembers.length });
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
      const safeId = escapeHtml(member.id);
      const safeAvatar = sanitizeHttpUrl(member.avatarUrl, 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg');
      const gameCount = Array.isArray(member.games) ? member.games.length : 0;

      const card = document.createElement('div');
      card.className = `member-card ${member.active ? '' : 'inactive'}`;

      const checkboxTitle = escapeHtml(member.active ? i18n.t('removeFromSquad') : i18n.t('addToSquad'));
      const statusTitle = escapeHtml(member.isPrivate ? i18n.t('gamesPrivate') : i18n.t('publicProfile'));
      const metaText = member.isPrivate ? i18n.t('gamesHiddenWarning') : i18n.t('gameCount', { count: gameCount });
      const refreshTitle = escapeHtml(i18n.t('refreshLibrary'));
      const removeTitle = escapeHtml(i18n.t('removeMember'));

      card.innerHTML = `
        <div class="member-checkbox-wrap" title="${checkboxTitle}">
          <input type="checkbox" ${member.active ? 'checked' : ''} data-member-id="${safeId}" class="member-checkbox" title="${checkboxTitle}" />
        </div>
        <div class="member-avatar-wrap">
          <img src="${safeAvatar}" alt="${safeName}" class="member-avatar" />
          <span class="member-status-dot ${member.isPrivate ? 'status-private' : 'status-public'}" title="${statusTitle}"></span>
        </div>
        <div class="member-info">
          <div class="member-name">${safeName}</div>
          <div class="member-meta">
            ${metaText}
          </div>
        </div>
        <div class="member-actions">
          <button class="icon-btn btn-refresh" data-member-id="${safeId}" title="${refreshTitle}">🔄</button>
          <button class="icon-btn btn-remove" data-member-id="${safeId}" title="${removeTitle}">❌</button>
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
        this.showToast(i18n.t('memberRemoved', { name: member.personaName }));
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
      container.innerHTML = `<span style="font-size: 11px; color: #8f98a0;">${i18n.t('noSavedSquads')}</span>`;
      return;
    }

    teams.forEach(team => {
      const chip = document.createElement('div');
      const isActive = team.id === activeTeamId;
      chip.className = `preset-chip ${isActive ? 'active' : ''}`;

      const isAllTeam = team.isDefault || team.id === 'team_all';
      const teamDisplayName = isAllTeam ? i18n.t('allSquadPreset') : escapeHtml(team.name);

      const deleteBtn = !isAllTeam
        ? `<button class="preset-delete-btn" data-team-id="${team.id}" title="${i18n.t('deleteTeamTitle')}">×</button>`
        : '';

      chip.innerHTML = `
        <span class="preset-name">${teamDisplayName}</span>
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
        this.showToast(i18n.t('teamSelected', { name: teamDisplayName }));
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
    if (hidePlayedLabel) hidePlayedLabel.textContent = i18n.t('hidePlayed', { count: stats?.playedCount || 0 });

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

    const currentLang = i18n.getLanguage();
    const isEn = currentLang === 'en';
    const countryCode = isEn ? 'us' : 'tr';
    const storeLang = isEn ? 'english' : 'turkish';

    games.forEach(game => {
      const safeAppId = parseInt(game.appId, 10) || 0;
      const safeName = escapeHtml(game.name);
      const safeLogo = sanitizeHttpUrl(game.logo, `https://cdn.akamai.steamstatic.com/steam/apps/${safeAppId}/header.jpg`);
      const safeStoreLink = sanitizeHttpUrl(game.storeLink, `https://store.steampowered.com/app/${safeAppId}`);
      const safeRunUrl = getSteamRunUrl(safeAppId);

      const card = document.createElement('div');
      card.className = `game-card ${game.isPlayed ? 'is-played' : ''}`;
      card.id = `game-card-${safeAppId}`;
      card.setAttribute('data-app-id', String(safeAppId));

      const isFull = game.ownerCount === stats.activePlayerCount;
      const isN1 = game.ownerCount === stats.activePlayerCount - 1;
      const badgeClass = isFull ? 'badge-100' : (isN1 ? 'badge-n1' : 'badge-n2');
      const badgeText = isFull
        ? i18n.t('badgeAllOwn')
        : (isN1
          ? i18n.t('badgeOneMissing', { count: game.ownerCount, total: stats.activePlayerCount })
          : i18n.t('badgeTwoMissing', { count: game.ownerCount, total: stats.activePlayerCount }));

      const matchingDetails = (game.storeDetails && (!game.storeDetails.countryCode || game.storeDetails.countryCode === countryCode))
        ? game.storeDetails
        : null;

      let missingHtml = '';
      if (!isFull && game.missingMembers.length > 0) {
        const safeNames = game.missingMembers.map(m => escapeHtml(m.name)).join(', ');
        const rawNames = game.missingMembers.map(m => m.name).join(', ');
        const nudgeTitle = escapeHtml(i18n.t('btnShareNudgeTitle', { names: rawNames }));
        let initialDiscountHtml = '';
        if (matchingDetails?.hasDiscount) {
          initialDiscountHtml = `<span class="discount-pill">-%${matchingDetails.discountPercent} ${escapeHtml(matchingDetails.finalFormatted)}</span>`;
        } else if (matchingDetails?.isFree) {
          initialDiscountHtml = `<span class="discount-pill">${escapeHtml(i18n.t('badgeFree'))}</span>`;
        } else if (matchingDetails?.finalFormatted) {
          initialDiscountHtml = `<span class="price-pill" style="background-color: rgba(255,255,255,0.12); padding: 1px 6px; border-radius: 3px; font-size: 10px; margin-left: 4px; font-weight: 600;">${escapeHtml(matchingDetails.finalFormatted)}</span>`;
        }
        missingHtml = `
          <div class="game-ownership-status ownership-missing">
            <div class="missing-status-left">
              <span>${i18n.t('ownershipMissing', { names: safeNames })}</span>
              <span class="discount-container" data-app-id="${safeAppId}">${initialDiscountHtml}</span>
            </div>
            <button class="btn-nudge-share" data-app-id="${safeAppId}" title="${nudgeTitle}">
              ${i18n.t('btnShareNudge')}
            </button>
          </div>
        `;
      } else {
        missingHtml = `<div class="game-ownership-status ownership-full">${i18n.t('ownershipFull', { count: stats.activePlayerCount, total: stats.activePlayerCount })}</div>`;
      }

      const isSolo = game.metadata?.mode === 'solo' || game.metadata?.maxPlayers === 1;
      const modeIcon = isSolo
        ? i18n.t('tagSingleplayer')
        : (game.metadata?.mode === 'coop'
          ? '🤝 Co-Op'
          : (game.metadata?.mode === 'pvp'
            ? '⚔️ PvP'
            : (game.metadata?.mode === 'party'
              ? (isEn ? '🎲 Party' : '🎲 Parti')
              : '🧗 Survival')));

      const maxP = isSolo
        ? i18n.t('tagSoloCapacity')
        : (game.metadata?.maxPlayers ? i18n.t('tagMultiCapacity', { count: game.metadata.maxPlayers }) : i18n.t('tagMultiplayerGeneral'));

      const sizeTag = game.metadata?.size === 'small'
        ? '⚡ <5 GB'
        : (game.metadata?.size === 'large'
          ? '📦 >20 GB'
          : '💾 5-20 GB');
      const playedBadge = game.isPlayed ? `<span class="game-played-badge">${i18n.t('badgePlayedGame')}</span>` : '';

      card.innerHTML = `
        <div class="game-banner-wrap">
          <img src="${safeLogo}" alt="${safeName}" class="game-banner" loading="lazy" />
          ${playedBadge}
          <span class="game-match-badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="game-content">
          <div class="game-title-row">
            <h4 class="game-title" title="${safeName}">${safeName}</h4>
            <span class="game-playtime">${i18n.t('totalHours', { hours: Math.round(game.totalHours) })}</span>
          </div>
          <div class="game-tags-row">
            <span class="pill-tag">${modeIcon}</span>
            <span class="pill-tag">${isSolo ? '👤' : '👥'} ${maxP}</span>
            <span class="pill-tag">${sizeTag}</span>
          </div>
          ${missingHtml}
          <div class="deal-placeholder" data-deal-app-id="${safeAppId}"></div>
          <div class="game-footer-actions">
            <button class="btn btn-sm ${game.isPlayed ? 'btn-success' : 'btn-secondary'} game-played-btn" data-app-id="${safeAppId}" title="${escapeHtml(i18n.t('btnPlayedTitle'))}" style="flex: 1.1;">
              ${game.isPlayed ? i18n.t('btnPlayedChecked') : i18n.t('btnPlayedUnchecked')}
            </button>
            <a href="${safeStoreLink}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-secondary" style="flex: 0.9;">
              ${i18n.t('btnStore')}
            </a>
            <a href="${safeRunUrl}" class="btn btn-sm btn-primary" style="flex: 0.9;">
              ${i18n.t('btnPlay')}
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
        this.showToast(isNowPlayed
          ? i18n.t('toastMarkedPlayed', { name: game.name })
          : i18n.t('toastUnmarkedPlayed', { name: game.name }));
      });

      // Share / Nudge button click handler for missing games
      card.querySelector('.btn-nudge-share')?.addEventListener('click', async () => {
        const names = game.missingMembers.map(m => m.name).join(', ');
        let priceContext = '';
        const currentDetails = (game.storeDetails && (!game.storeDetails.countryCode || game.storeDetails.countryCode === countryCode))
          ? game.storeDetails
          : null;
        if (currentDetails?.hasDiscount && currentDetails?.finalFormatted) {
          priceContext = i18n.t('nudgePriceDiscount', { discount: currentDetails.discountPercent, price: currentDetails.finalFormatted });
        } else if (currentDetails?.isFree) {
          priceContext = i18n.t('nudgePriceFree');
        } else if (currentDetails?.finalFormatted) {
          priceContext = i18n.t('nudgePriceNormal', { price: currentDetails.finalFormatted });
        } else {
          priceContext = '!';
        }

        const isPlural = game.missingMembers.length > 1;
        const callToAction = isPlural
          ? i18n.t('nudgeCtaPlural')
          : i18n.t('nudgeCtaSingle');

        const storeLink = game.storeLink || `https://store.steampowered.com/app/${game.appId}`;
        let msg = i18n.t('nudgeTemplate', {
          names,
          name: game.name,
          priceContext,
          cta: callToAction,
          link: storeLink
        });

        // Append deal link if present and game is not free
        if (game.dealUrl && !game.storeDetails?.isFree) {
          msg += i18n.t('nudgeDealAnnex', { url: game.dealUrl });
        }

        const success = await PollGenerator.copyToClipboard(msg);
        if (success) {
          this.showToast(i18n.t('toastNudgeCopied', { names }));
        } else {
          this.showToast(i18n.t('pollCopyFailed'));
        }
      });

      listContainer.appendChild(card);

      // Render Humble Store key deal button immediately for missing games
      if (!isFull && game.missingMembers.length > 0) {
        this.updateDealBanner(card, game);

        // Asynchronously fetch and display live price & discount from Steam Store API
        if (!game.storeDetails || game.storeDetails.countryCode !== countryCode) {
          fetchGameStoreDetails(game.appId, countryCode, storeLang).then(details => {
            if (!details) return;
            game.storeDetails = details;

            const container = card.querySelector(`.discount-container[data-app-id="${game.appId}"]`);
            if (container) {
              if (details.hasDiscount) {
                container.innerHTML = `<span class="discount-pill">-%${details.discountPercent} ${escapeHtml(details.finalFormatted)}</span>`;
              } else if (details.isFree) {
                container.innerHTML = `<span class="discount-pill">${escapeHtml(i18n.t('badgeFree'))}</span>`;
              } else if (details.finalFormatted) {
                container.innerHTML = `<span class="price-pill" style="background-color: rgba(255,255,255,0.12); padding: 1px 6px; border-radius: 3px; font-size: 10px; margin-left: 4px; font-weight: 600;">${escapeHtml(details.finalFormatted)}</span>`;
              }
            }

            this.updateDealBanner(card, game);
          }).catch(() => { });
        }

        // Asynchronously fetch live Humble key deals via batch queue
        dealsService.getBestDeal(game.appId, game.name).then(deal => {
          if (!deal) return;
          game.dealInfo = deal;
          this.updateDealBanner(card, game);
        }).catch(() => { });
      }
    });
  }

  updateDealBanner(card, game) {
    if (!card || !game) return;
    const safeAppId = escapeHtml(String(game.appId));
    const placeholder = card.querySelector(`.deal-placeholder[data-deal-app-id="${game.appId}"]`);
    if (!placeholder) return;

    // 1. Never show deal banner for free games
    if (game.storeDetails?.isFree) {
      placeholder.innerHTML = '';
      game.dealUrl = null;
      return;
    }

    const rawNames = (game.missingMembers || []).map(m => m.name).join(', ');
    const humbleSearchUrl = dealsService.getHumbleSearchUrl(game.name);
    game.dealUrl = humbleSearchUrl;

    const deal = game.dealInfo;
    const steamPriceCents = game.storeDetails?.finalPriceCents || 0;
    const steamPrice = steamPriceCents / 100;

    // Check if Humble deal is ACTUALLY cheaper than Steam
    const isCheaperThanSteam = Boolean(
      deal?.hasDeal &&
      deal?.priceNumeric > 0 &&
      steamPrice > 0 &&
      deal.priceNumeric < steamPrice
    );

    if (isCheaperThanSteam) {
      // Highlighted deal banner with price, savings percent, and copy button
      const priceDisplay = `${escapeHtml(deal.price)} USD`;
      const savingsDisplay = deal.savingsPercent > 0 ? `<span class="deal-savings-badge">-%${deal.savingsPercent}</span>` : '';
      const ctaLabel = `Humble: ${escapeHtml(deal.price)}`;

      placeholder.innerHTML = `
        <div class="game-deal-banner">
          <div class="deal-banner-left">
            <span class="deal-store-tag">🔑 Humble</span>
            <span class="deal-price-text">${priceDisplay}</span>
            ${savingsDisplay}
          </div>
          <div class="deal-banner-actions">
            <a href="${escapeHtml(humbleSearchUrl)}" target="_blank" rel="noopener noreferrer" class="btn-deal-cta" title="${escapeHtml(i18n.t('btnStore'))}">
              ${ctaLabel} ➔
            </a>
            <button class="btn-deal-copy" data-app-id="${safeAppId}" title="${escapeHtml(i18n.t('btnCopyDealTitle'))}">
              📋
            </button>
          </div>
        </div>
      `;

      placeholder.querySelector('.btn-deal-copy')?.addEventListener('click', async (e) => {
        e.stopPropagation();
        const shareMsg = dealsService.getShareMessage(game.name, rawNames, deal, i18n.getLanguage());
        const success = await PollGenerator.copyToClipboard(shareMsg);
        if (success) {
          this.showToast(i18n.t('toastDealCopied', { name: game.name }));
        }
      });
    } else {
      // Quiet fallback link when there is no cheaper deal
      const searchLabel = escapeHtml(i18n.t('btnHumbleSearch'));

      placeholder.innerHTML = `
        <div class="game-deal-banner game-deal-banner-quiet">
          <div class="deal-banner-left">
            <span class="deal-store-tag">🔑 Humble</span>
          </div>
          <div class="deal-banner-actions">
            <a href="${escapeHtml(humbleSearchUrl)}" target="_blank" rel="noopener noreferrer" class="btn-deal-cta btn-deal-quiet" title="${searchLabel}">
              ${searchLabel} ➔
            </a>
          </div>
        </div>
      `;
    }
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

    // Asynchronously enrich missing games storeDetails if needed for current region
    const currentPollLang = i18n.getLanguage();
    const pollCountryCode = currentPollLang === 'en' ? 'us' : 'tr';
    const pollStoreLang = currentPollLang === 'en' ? 'english' : 'turkish';
    const candidatesToFetch = games.filter(g => g.missingMembers?.length > 0 && (!g.storeDetails || g.storeDetails.countryCode !== pollCountryCode));
    if (candidatesToFetch.length > 0) {
      Promise.all(candidatesToFetch.map(g =>
        fetchGameStoreDetails(g.appId, pollCountryCode, pollStoreLang).then(d => {
          if (d) g.storeDetails = d;
        }).catch(() => { })
      )).then(() => {
        if (this.activeTab === 'tab-poll') {
          const currentPreviewEl = document.getElementById('poll-preview-text');
          if (currentPreviewEl) {
            currentPreviewEl.textContent = this.pollPlatform === 'discord'
              ? PollGenerator.generateDiscordPoll(games, activeMembers.length, { limit: this.pollLimit })
              : PollGenerator.generateWhatsAppPoll(games, activeMembers.length, { limit: this.pollLimit });
          }
        }
      });
    }

    // Enrich missing games with Humble Store search links
    const missingCandidates = games.filter(g => g.missingMembers?.length > 0 && !g.storeDetails?.isFree && !g.dealUrl);
    if (missingCandidates.length > 0) {
      missingCandidates.forEach(g => {
        g.dealUrl = dealsService.getHumbleSearchUrl(g.name);
      });
      if (this.activeTab === 'tab-poll') {
        const currentPreviewEl = document.getElementById('poll-preview-text');
        if (currentPreviewEl) {
          currentPreviewEl.textContent = this.pollPlatform === 'discord'
            ? PollGenerator.generateDiscordPoll(games, activeMembers.length, { limit: this.pollLimit })
            : PollGenerator.generateWhatsAppPoll(games, activeMembers.length, { limit: this.pollLimit });
        }
      }
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
        syncText.textContent = i18n.t('rouletteSyncBanner', { remaining: games.length, eliminated: this.vetoEngine.eliminatedGames.length });
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
      if (imageEl) imageEl.src = sanitizeHttpUrl(winner.logo, '');
      if (infoEl) {
        const mode = winner.metadata?.mode?.toUpperCase() || 'COOP';
        const isSolo = winner.metadata?.mode === 'solo' || winner.metadata?.maxPlayers === 1;
        const p = isSolo
          ? i18n.t('tagSoloCapacity')
          : (winner.metadata?.maxPlayers ? i18n.t('tagMultiCapacity', { count: winner.metadata.maxPlayers }) : i18n.t('tagMultiplayerGeneral'));
        infoEl.textContent = i18n.t('winnerCardInfo', { mode, players: p, hours: Math.round(winner.totalHours) });
      }
      if (launchBtn) {
        launchBtn.href = getSteamRunUrl(winner.appId);
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
        turnIndicator.textContent = i18n.t('vetoNoActivePlayers');
      }
      if (graveyardList) {
        graveyardList.innerHTML = `<span style="font-size: 11px; color: #8f98a0;">${i18n.t('vetoNoEliminated')}</span>`;
      }
      grid.innerHTML = `<div style="text-align: center; padding: 24px 10px; color: #8f98a0;">${i18n.t('vetoEmptySquadGames')}</div>`;
      return;
    }

    const currentPlayer = this.vetoEngine.getCurrentPlayer();
    if (turnIndicator) {
      if (currentPlayer) {
        turnIndicator.textContent = i18n.t('vetoTurnNotice', { name: currentPlayer.personaName });
      } else {
        turnIndicator.textContent = i18n.t('vetoNoActivePlayers');
      }
    }

    // Render candidate games
    this.vetoEngine.remainingGames.forEach(game => {
      const safeAppId = parseInt(game.appId, 10) || 0;
      const safeName = escapeHtml(game.name);
      const safeLogo = sanitizeHttpUrl(game.logo, `https://cdn.akamai.steamstatic.com/steam/apps/${safeAppId}/header.jpg`);

      const card = document.createElement('div');
      card.className = 'veto-card';
      card.innerHTML = `
        <div class="veto-card-info">
          <img src="${safeLogo}" alt="${safeName}" class="veto-card-thumb" />
          <span class="veto-card-title">${safeName}</span>
        </div>
        <button class="btn btn-sm btn-danger-outline btn-veto" data-app-id="${safeAppId}">
          ${i18n.t('btnVeto')}
        </button>
      `;

      card.querySelector('.btn-veto')?.addEventListener('click', () => {
        this.vetoEngine.vetoGame(safeAppId);
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
        launchBtn.href = getSteamRunUrl(winner.appId);
      }
      championCard.classList.remove('hidden');
    }
  }
}

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new SteamSquadApp();
});
