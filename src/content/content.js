/**
 * SteamSquad — In-Page Steam Store Trigger (Content Script)
 * Displays a smart, floating squad-ownership badge on Steam game store pages.
 */

(function () {
  'use strict';

  // Prevent duplicate instances
  if (window.__steamsquad_inpage_injected) return;
  window.__steamsquad_inpage_injected = true;

  console.log('[SteamSquad] In-page content script initialized on:', window.location.href);

  const STORAGE_KEYS = {
    MEMBERS: 'steamsquad_members',
    TEAMS: 'steamsquad_teams',
    ACTIVE_TEAM_ID: 'steamsquad_active_team_id',
    LANGUAGE: 'steamsquad_language'
  };

  const INPAGE_TRANSLATIONS = {
    tr: {
      allOwnTitle: 'Ekipteki Herkeste Var! ({owners}/{total})',
      allOwnSub: 'Bu akşam ekiple hemen oynayabilirsiniz!',
      partialTitle: '{owners}/{total} Kişide Var',
      missingOne: '⚠️ Eksik: <strong>{name}</strong>',
      missingMultiple: '⚠️ Eksik: {names}',
      missingMany: '⚠️ {count} kişide kütüphanede yok',
      btnOpen: 'Yan Paneli Aç',
      guideIcon: '👆 Sağ üstteki SteamSquad ikonuna tıklayın',
      dismissTitle: 'Bu oyun için kapat'
    },
    en: {
      allOwnTitle: 'All Squad Owns This! ({owners}/{total})',
      allOwnSub: 'Ready to play together tonight!',
      partialTitle: 'Owned by {owners}/{total} Players',
      missingOne: '⚠️ Missing: <strong>{name}</strong>',
      missingMultiple: '⚠️ Missing: {names}',
      missingMany: '⚠️ {count} players missing this in library',
      btnOpen: 'Open Side Panel',
      guideIcon: '👆 Click SteamSquad icon in top toolbar',
      dismissTitle: 'Dismiss for this game'
    }
  };

  let currentLang = 'tr';

  function t(key, params = {}) {
    const dict = INPAGE_TRANSLATIONS[currentLang] || INPAGE_TRANSLATIONS.tr;
    let text = dict[key] || INPAGE_TRANSLATIONS.tr[key] || '';
    Object.keys(params).forEach(k => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), params[k]);
    });
    return text;
  }

  let isDismissedForApp = false;
  let currentAppId = null;

  /**
   * Extracts Steam AppID from URL (e.g. /app/105600/Terraria/ or /agecheck/app/105600/)
   * @returns {number|null}
   */
  function getAppIdFromUrl() {
    const match = window.location.pathname.match(/\/app\/(\d+)/i);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Checks whether a squad member owns a specific AppID
   * @param {object} member 
   * @param {number} targetAppId 
   * @returns {boolean}
   */
  function memberOwnsGame(member, targetAppId) {
    if (!member || !Array.isArray(member.games)) return false;
    return member.games.some(g => {
      // Handles both appId (camelCase) and appid (lowercase)
      const id = g.appId ?? g.appid;
      return Number(id) === Number(targetAppId);
    });
  }

  /**
   * Reads current active squad members from chrome.storage.local
   * @returns {Promise<Array>}
   */
  async function getActiveSquadMembers() {
    try {
      const data = await chrome.storage.local.get([
        STORAGE_KEYS.MEMBERS,
        STORAGE_KEYS.TEAMS,
        STORAGE_KEYS.ACTIVE_TEAM_ID
      ]);

      const members = Array.isArray(data[STORAGE_KEYS.MEMBERS]) ? data[STORAGE_KEYS.MEMBERS] : [];
      if (members.length === 0) {
        console.log('[SteamSquad] No squad members found in storage.');
        return [];
      }

      const activeTeamId = data[STORAGE_KEYS.ACTIVE_TEAM_ID] || 'team_all';
      const teams = Array.isArray(data[STORAGE_KEYS.TEAMS]) ? data[STORAGE_KEYS.TEAMS] : [];

      let activeList = [];
      if (activeTeamId === 'team_all') {
        activeList = members.filter(m => m.active !== false);
      } else {
        const activeTeam = teams.find(t => t.id === activeTeamId);
        if (activeTeam && Array.isArray(activeTeam.memberIds)) {
          const idSet = new Set(activeTeam.memberIds);
          activeList = members.filter(m => idSet.has(m.id));
        } else {
          activeList = members.filter(m => m.active !== false);
        }
      }

      // If active filter resulted in 0 but we have members, fallback to all members
      if (activeList.length === 0 && members.length > 0) {
        activeList = members;
      }

      return activeList;
    } catch (err) {
      console.warn('[SteamSquad] Error reading storage in content script:', err);
      return [];
    }
  }

  /**
   * Requests background service worker to open the side panel
   */
  function requestOpenSidePanel() {
    try {
      if (currentAppId) {
        chrome.storage.local.set({ steamsquad_target_app_id: currentAppId });
      }
      chrome.runtime.sendMessage({ type: 'OPEN_SIDE_PANEL', appId: currentAppId }, (res) => {
        if (chrome.runtime.lastError || res?.success === false) {
          // If browser security policy requires user to click the toolbar icon directly:
          const btn = document.getElementById('steamsquad-btn-open-panel');
          if (btn) {
            btn.innerHTML = `<span>${t('guideIcon')}</span>`;
            setTimeout(() => {
              if (btn) btn.innerHTML = `<span>${t('btnOpen')}</span><span class="steamsquad-arrow">➔</span>`;
            }, 4500);
          }
        }
      });
      // Also broadcast directly to sidepanel in case it is already open
      chrome.runtime.sendMessage({ type: 'FOCUS_GAME_IN_SIDEPANEL', appId: currentAppId });
    } catch (e) {
      console.error('[SteamSquad] Failed to message background:', e);
    }
  }

  /**
   * Removes existing badge from DOM if present
   */
  function removeBadge() {
    const existing = document.getElementById('steamsquad-store-badge');
    if (existing) {
      existing.classList.add('steamsquad-closing');
      setTimeout(() => existing.remove(), 250);
    }
  }

  /**
   * Evaluates game ownership and renders floating badge on page
   */
  async function evaluateAndRenderBadge() {
    const appId = getAppIdFromUrl();
    if (!appId) {
      removeBadge();
      return;
    }

    if (currentAppId !== appId) {
      currentAppId = appId;
      isDismissedForApp = false;
    }

    if (isDismissedForApp) {
      return;
    }

    try {
      const langData = await chrome.storage.local.get(STORAGE_KEYS.LANGUAGE);
      if (langData && (langData[STORAGE_KEYS.LANGUAGE] === 'en' || langData[STORAGE_KEYS.LANGUAGE] === 'tr')) {
        currentLang = langData[STORAGE_KEYS.LANGUAGE];
      } else {
        currentLang = 'tr';
      }
    } catch {}

    const activeMembers = await getActiveSquadMembers();
    if (!activeMembers || activeMembers.length === 0) {
      removeBadge();
      return;
    }

    // Determine owners & missing members using flexible appId check
    const owners = activeMembers.filter(m => memberOwnsGame(m, appId));
    const missing = activeMembers.filter(m => !memberOwnsGame(m, appId));

    console.log(`[SteamSquad] AppID ${appId} analysis: ${owners.length}/${activeMembers.length} active players own this game.`);

    // If nobody owns it, keep store page clean
    if (owners.length === 0) {
      removeBadge();
      return;
    }

    const isAllOwn = owners.length === activeMembers.length;
    renderBadgeDOM({
      appId,
      owners,
      missing,
      totalCount: activeMembers.length,
      isAllOwn
    });
  }

  /**
   * Injects or updates the badge DOM element
   */
  function renderBadgeDOM({ appId, owners, missing, totalCount, isAllOwn }) {
    let badge = document.getElementById('steamsquad-store-badge');
    if (!badge) {
      badge = document.createElement('div');
      badge.id = 'steamsquad-store-badge';
      badge.className = 'steamsquad-badge-container';
      document.body.appendChild(badge);
    }

    // Apply color theme class
    badge.className = `steamsquad-badge-container ${isAllOwn ? 'steamsquad-theme-all-own' : 'steamsquad-theme-partial'}`;

    // Status titles and subtitles
    let titleText = '';
    let subtitleText = '';
    let statusIcon = '';

    if (isAllOwn) {
      statusIcon = '🎉';
      titleText = t('allOwnTitle', { owners: owners.length, total: totalCount });
      subtitleText = t('allOwnSub');
    } else {
      statusIcon = '👥';
      titleText = t('partialTitle', { owners: owners.length, total: totalCount });
      if (missing.length === 1) {
        subtitleText = t('missingOne', { name: escapeHTML(missing[0].personaName) });
      } else if (missing.length <= 3) {
        subtitleText = t('missingMultiple', { names: missing.map(m => escapeHTML(m.personaName)).join(', ') });
      } else {
        subtitleText = t('missingMany', { count: missing.length });
      }
    }

    // Build avatars HTML
    const maxAvatars = 5;
    const displayedOwners = owners.slice(0, maxAvatars);
    const extraOwnersCount = owners.length - maxAvatars;

    const avatarsHtml = displayedOwners.map(m => {
      const avatarSrc = m.avatarUrl || 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg';
      return `<img class="steamsquad-avatar-item" src="${avatarSrc}" alt="${escapeHTML(m.personaName)}" title="${escapeHTML(m.personaName)}" />`;
    }).join('');

    const extraBadgeHtml = extraOwnersCount > 0 
      ? `<span class="steamsquad-avatar-extra">+${extraOwnersCount}</span>` 
      : '';

    badge.innerHTML = `
      <div class="steamsquad-badge-header">
        <div class="steamsquad-header-left">
          <span class="steamsquad-logo-icon">🎮</span>
          <span class="steamsquad-brand-tag">SteamSquad</span>
        </div>
        <button class="steamsquad-btn-close" id="steamsquad-btn-dismiss" title="${t('dismissTitle')}">✕</button>
      </div>

      <div class="steamsquad-badge-body">
        <div class="steamsquad-status-row">
          <span class="steamsquad-status-emoji">${statusIcon}</span>
          <span class="steamsquad-status-title">${titleText}</span>
        </div>
        <div class="steamsquad-status-sub">${subtitleText}</div>

        <div class="steamsquad-avatar-cluster">
          <div class="steamsquad-avatars-row">
            ${avatarsHtml}
            ${extraBadgeHtml}
          </div>
        </div>
      </div>

      <div class="steamsquad-badge-footer">
        <button class="steamsquad-btn-action" id="steamsquad-btn-open-panel">
          <span>${t('btnOpen')}</span>
          <span class="steamsquad-arrow">➔</span>
        </button>
      </div>
    `;

    // Hook click events
    const btnDismiss = badge.querySelector('#steamsquad-btn-dismiss');
    if (btnDismiss) {
      btnDismiss.addEventListener('click', (e) => {
        e.stopPropagation();
        isDismissedForApp = true;
        removeBadge();
      });
    }

    const btnOpen = badge.querySelector('#steamsquad-btn-open-panel');
    if (btnOpen) {
      btnOpen.addEventListener('click', (e) => {
        e.stopPropagation();
        requestOpenSidePanel();
      });
    }

    // Clicking anywhere on the badge body also opens side panel
    badge.addEventListener('click', (e) => {
      if (e.target.closest('#steamsquad-btn-dismiss')) return;
      requestOpenSidePanel();
    });
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // React to squad storage updates in real-time
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local') {
      if (changes[STORAGE_KEYS.MEMBERS] || changes[STORAGE_KEYS.ACTIVE_TEAM_ID] || changes[STORAGE_KEYS.TEAMS] || changes[STORAGE_KEYS.LANGUAGE]) {
        if (changes[STORAGE_KEYS.LANGUAGE]) {
          currentLang = changes[STORAGE_KEYS.LANGUAGE].newValue || 'tr';
        }
        evaluateAndRenderBadge();
      }
    }
  });

  // Track SPA navigation changes on Steam Store
  let lastUrl = window.location.href;
  const urlCheckInterval = setInterval(() => {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      evaluateAndRenderBadge();
    }
  }, 1000);

  window.addEventListener('popstate', () => {
    evaluateAndRenderBadge();
  });

  // Initial render when script loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', evaluateAndRenderBadge);
  } else {
    evaluateAndRenderBadge();
  }
})();
