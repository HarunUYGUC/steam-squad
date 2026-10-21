/**
 * SteamSquad — Central i18n & Localization Service
 * Faithful bilingual dictionary (Turkish & English) with parameter interpolation and state persistence.
 */

const STORAGE_KEY = 'steamsquad_language';

export const TRANSLATIONS = {
  tr: {
    // Header & General
    headerSubtitle: 'Kütüphane Eşleştirici',
    playersReady: '{count} Oyuncu Hazır',
    langSwitched: 'Dil değiştirildi: 🇹🇷 Türkçe',
    
    // Navigation Tabs
    tabSquad: 'Kadro',
    tabMatches: 'Oyunlar',
    tabPoll: 'Anket',
    tabRoulette: 'Çark & Veto',

    // Tab 1: Squad Manager
    addFriendHeading: 'ARKADAŞ EKLE',
    inputPlaceholder: 'Profil linki, kullanıcı adı veya SteamID64...',
    btnAdd: '+ Ekle',
    btnSearching: '⏳ Aranıyor...',
    savedSquadsHeading: 'KAYITLI EKİPLER',
    btnCreateSquad: '+ Ekip Oluştur',
    btnClear: 'Temizle',
    squadMembersHeading: 'Kadro Üyeleri',
    emptySquadTitle: 'Kadroda henüz kimse yok',
    emptySquadSub: 'Arkadaşlarınızın kütüphanesini eşleştirmek için yukarıdaki alana Steam profil linkini girin.',
    allSquadPreset: '👥 Tüm Ekip',
    unlockFullLibrary: 'Tüm Kütüphaneyi Aç (Steam Web API)',
    apiKeyLabel: 'Steam Web API Anahtarı',
    btnSaveKey: 'Kaydet',
    btnDeleteKey: 'Anahtarı Sil',
    apiKeySaved: '✅ Steam Web API anahtarı kaydedildi!',
    apiKeyDeleted: '🗑️ Steam Web API anahtarı silindi.',
    promptNewTeam: 'Yeni ekip adı girin (Örn: Duo Takımı, 5v5 Ekibi, Hafta Sonu):',
    teamCreated: '"{name}" ekibi oluşturuldu.',
    teamSelected: '"{name}" seçildi.',
    confirmClearSquad: 'Tüm kadroyu temizlemek istediğinize emin misiniz?',
    squadCleared: 'Kadro temizlendi.',

    // Tab 2: Matches & Overlap
    allOwn: 'Herkeste Var',
    oneMissing: '1 Kişide Yok',
    twoMissing: '2 Kişide Yok',
    played: 'OYNANDI',
    totalPool: 'TOPLAM HAVUZ',
    hidePlayed: 'Oynananları Gizle ({count})',
    quickDownload: '10 Dk\'da İndir (<5 GB)',
    searchPlaceholder: 'Oyun ara...',
    sortMostPlayed: 'En Çok Oynanan',
    sortNameAZ: 'İsim (A-Z)',
    sortPlayerCapacity: 'Oyuncu Kapasitesi',
    allMode: '🎮 Tümü',
    coopMode: '🤝 Co-Op / PvE',
    pvpMode: '⚔️ PvP / Rekabetçi',
    partyMode: '🎲 Parti / Eğlence',
    survivalMode: '🧗 Survival',
    badgeAllOwn: 'HERKESTE VAR',
    badgeOneMissing: '1 KİŞİDE YOK ({count}/{total})',
    badgeTwoMissing: '2 KİŞİDE YOK ({count}/{total})',
    ownershipFull: '✅ Seçilen tüm oyuncuların ({count}/{total}) kütüphanesinde var!',
    ownershipMissing: '⚠️ <strong>{names}</strong> hariç herkeste var',
    btnPlay: 'Oyna',
    btnStore: 'Mağaza',
    btnPlayed: 'Oynandı',
    btnShare: '💬 Paylaş',
    emptyMatchesTitle: 'Eşleşen oyun bulunamadı',
    emptyMatchesSub: 'Filtreleri gevşetmeyi veya kadroya yeni oyuncular eklemeyi deneyin.',

    // Tab 3: Poll Generator
    pollGeneratorTitle: 'Anket Oluşturucu',
    pollGeneratorSub: 'Arkadaş grubunuz için tek tıkla kopyalanabilir anket şablonu.',
    platformFormat: 'Platform Formatı',
    pollScope: 'Anket Kapsamı',
    gameCount: 'Oyun Sayısı',
    btnCopyPoll: '📋 Panoya Kopyala & Paylaş',
    pollCopiedToast: '📋 Anket panoya kopyalandı! Discord veya WhatsApp\'a yapıştırabilirsiniz.',
    pollCopyFailed: 'Kopyalama başarısız oldu.',
    pollDiscordHeader: '🎮 **BU AKŞAM NE OYNUYORUZ?** ({squadSize} Kişi Aktif)',
    pollDiscordFooter: '👇 *Lütfen oynamak istediğiniz seçeneğin reaksiyonuna/emojisine tıklayın!* 🕹️',
    pollAllOwnBadge: '[HERKESTE VAR]',
    pollMissingBadge: '[{names} Hariç]',
    pollMissingDiscountBadge: '[{names} Hariç — %{discount} İndirim: {price}]',
    pollMissingFreeBadge: '[{names} Hariç — Ücretsiz]',
    pollNoGames: '🎮 **SteamSquad**: Ortak oyun bulunamadı.',

    // Tab 4: Roulette & Veto
    submodeRoulette: 'Çarkıfelek (Roulette)',
    submodeVeto: 'Veto Eleme Arenası',
    btnSpinWheel: 'ÇARKI ÇEVİR!',
    btnRestoreWheel: 'Ortak Oyunları Yenile',
    wheelResetToast: 'Çark tüm ortak oyunlarla yenilendi.',
    winnerTitle: '🏆 KAZANAN OYUN!',
    btnLaunchSteam: 'Steam\'de Başlat',
    btnShareWinner: 'Paylaş',
    winnerShareToast: '📋 Kazanan oyun Discord/WhatsApp formatında panoya kopyalandı!',
    winnerShareTemplate: '🏆 **SteamSquad Çarkı Kararını Verdi!**\n🎮 Bu akşam oynuyoruz: **{name}**\n👥 Tür: {mode} ({players})\n🚀 Steam: {link}',
    vetoTurnNotice: '🎯 Sıra: {name} — İstemediğin 1 oyunu tıkla ve ele!',
    btnVeto: 'VETO ET ❌',
    eliminatedGamesHeading: 'ELENEN OYUNLAR',
    btnResetVeto: 'Arenayı Sıfırla',
    btnSyncWithWheel: 'Kalanları Çarka Gönder',
    vetoResetToast: 'Veto Arenası sıfırlandı.',
    vetoSyncToast: 'Kalan {count} oyun çarka aktarıldı!',

    // In-Page Content Badge
    inpageAllOwnTitle: 'Ekipteki Herkeste Var! ({owners}/{total})',
    inpageAllOwnSub: 'Bu akşam ekiple hemen oynayabilirsiniz!',
    inpagePartialTitle: '{owners}/{total} Kişide Var',
    inpageMissingOne: '⚠️ Eksik: <strong>{name}</strong>',
    inpageMissingMultiple: '⚠️ Eksik: {names}',
    inpageMissingMany: '⚠️ {count} kişide kütüphanede yok',
    inpageBtnOpen: 'Yan Paneli Aç',
    inpageGuideIcon: '👆 Sağ üstteki SteamSquad ikonuna tıklayın'
  },

  en: {
    // Header & General
    headerSubtitle: 'Library Matcher',
    playersReady: '{count} Players Ready',
    langSwitched: 'Language switched: 🇬🇧 English',

    // Navigation Tabs
    tabSquad: 'Squad',
    tabMatches: 'Matches',
    tabPoll: 'Poll',
    tabRoulette: 'Wheel & Veto',

    // Tab 1: Squad Manager
    addFriendHeading: 'ADD FRIEND',
    inputPlaceholder: 'Profile link, username, or SteamID64...',
    btnAdd: '+ Add',
    btnSearching: '⏳ Searching...',
    savedSquadsHeading: 'SAVED SQUADS',
    btnCreateSquad: '+ Create Squad',
    btnClear: 'Clear All',
    squadMembersHeading: 'Squad Members',
    emptySquadTitle: 'Squad is currently empty',
    emptySquadSub: 'Enter Steam profile links above to match libraries with your squad.',
    allSquadPreset: '👥 All Squad',
    unlockFullLibrary: 'Unlock Full Library (Steam Web API)',
    apiKeyLabel: 'Steam Web API Key',
    btnSaveKey: 'Save',
    btnDeleteKey: 'Delete Key',
    apiKeySaved: '✅ Steam Web API key saved!',
    apiKeyDeleted: '🗑️ Steam Web API key deleted.',
    promptNewTeam: 'Enter new squad name (e.g., Duo Team, 5v5 Squad, Weekend 4):',
    teamCreated: 'Squad "{name}" created.',
    teamSelected: 'Squad "{name}" selected.',
    confirmClearSquad: 'Are you sure you want to clear the entire squad?',
    squadCleared: 'Squad cleared.',

    // Tab 2: Matches & Overlap
    allOwn: 'All Own',
    oneMissing: '1 Missing',
    twoMissing: '2 Missing',
    played: 'PLAYED',
    totalPool: 'TOTAL POOL',
    hidePlayed: 'Hide Played ({count})',
    quickDownload: 'Quick Download (<5 GB)',
    searchPlaceholder: 'Search games...',
    sortMostPlayed: 'Most Played',
    sortNameAZ: 'Name (A-Z)',
    sortPlayerCapacity: 'Player Capacity',
    allMode: '🎮 All',
    coopMode: '🤝 Co-Op / PvE',
    pvpMode: '⚔️ PvP / Competitive',
    partyMode: '🎲 Party / Casual',
    survivalMode: '🧗 Survival',
    badgeAllOwn: 'ALL OWN',
    badgeOneMissing: '1 MISSING ({count}/{total})',
    badgeTwoMissing: '2 MISSING ({count}/{total})',
    ownershipFull: '✅ Owned by all selected players ({count}/{total})!',
    ownershipMissing: '⚠️ All own except <strong>{names}</strong>',
    btnPlay: 'Play',
    btnStore: 'Store',
    btnPlayed: 'Played',
    btnShare: '💬 Share',
    emptyMatchesTitle: 'No matching games found',
    emptyMatchesSub: 'Try loosening your filters or adding more squad members.',

    // Tab 3: Poll Generator
    pollGeneratorTitle: 'Poll Generator',
    pollGeneratorSub: '1-click copyable voting poll template for your gaming group.',
    platformFormat: 'Platform Format',
    pollScope: 'Poll Scope',
    gameCount: 'Game Count',
    btnCopyPoll: '📋 Copy to Clipboard & Share',
    pollCopiedToast: '📋 Poll copied to clipboard! Ready to paste into Discord or WhatsApp.',
    pollCopyFailed: 'Copy failed.',
    pollDiscordHeader: '🎮 **WHAT ARE WE PLAYING TONIGHT?** ({squadSize} Players Active)',
    pollDiscordFooter: '👇 *Please vote by clicking the reaction emoji below!* 🕹️',
    pollAllOwnBadge: '[ALL OWN]',
    pollMissingBadge: '[Except {names}]',
    pollMissingDiscountBadge: '[Except {names} — %{discount} Off: {price}]',
    pollMissingFreeBadge: '[Except {names} — Free]',
    pollNoGames: '🎮 **SteamSquad**: No shared games found.',

    // Tab 4: Roulette & Veto
    submodeRoulette: 'Roulette Wheel',
    submodeVeto: 'Veto Arena',
    btnSpinWheel: 'SPIN WHEEL!',
    btnRestoreWheel: 'Restore Shared Games',
    wheelResetToast: 'Wheel restored with all shared games.',
    winnerTitle: '🏆 WINNER GAME!',
    btnLaunchSteam: 'Launch on Steam',
    btnShareWinner: 'Share',
    winnerShareToast: '📋 Winner game copied to clipboard in Discord/WhatsApp format!',
    winnerShareTemplate: '🏆 **SteamSquad Wheel has Chosen!**\n🎮 Tonight we play: **{name}**\n👥 Mode: {mode} ({players})\n🚀 Steam: {link}',
    vetoTurnNotice: '🎯 Turn: {name} — Click to eliminate 1 game you don\'t want!',
    btnVeto: 'VETO ❌',
    eliminatedGamesHeading: 'ELIMINATED GAMES',
    btnResetVeto: 'Reset Arena',
    btnSyncWithWheel: 'Send Remaining to Wheel',
    vetoResetToast: 'Veto Arena has been reset.',
    vetoSyncToast: '{count} remaining games transferred to wheel!',

    // In-Page Content Badge
    inpageAllOwnTitle: 'All Squad Owns This! ({owners}/{total})',
    inpageAllOwnSub: 'Ready to play together tonight!',
    inpagePartialTitle: 'Owned by {owners}/{total} Players',
    inpageMissingOne: '⚠️ Missing: <strong>{name}</strong>',
    inpageMissingMultiple: '⚠️ Missing: {names}',
    inpageMissingMany: '⚠️ Missing for {count} players',
    inpageBtnOpen: 'Open Side Panel',
    inpageGuideIcon: '👆 Click SteamSquad icon in top toolbar'
  }
};

class I18nService {
  constructor() {
    this.currentLang = 'tr';
    this.subscribers = [];
  }

  /**
   * Initializes language from chrome.storage.local
   * Defaults to 'tr'
   * @returns {Promise<string>}
   */
  async init() {
    try {
      const data = await chrome.storage.local.get(STORAGE_KEY);
      if (data && (data[STORAGE_KEY] === 'en' || data[STORAGE_KEY] === 'tr')) {
        this.currentLang = data[STORAGE_KEY];
      } else {
        this.currentLang = 'tr';
      }
    } catch (err) {
      console.warn('[SteamSquad i18n] Error loading language:', err);
      this.currentLang = 'tr';
    }
    return this.currentLang;
  }

  /**
   * Gets current active language code ('tr' or 'en')
   * @returns {string}
   */
  getLanguage() {
    return this.currentLang;
  }

  /**
   * Sets active language and notifies subscribers
   * @param {'tr'|'en'} lang 
   */
  async setLanguage(lang) {
    if (lang !== 'tr' && lang !== 'en') return;
    this.currentLang = lang;
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: lang });
    } catch (err) {
      console.warn('[SteamSquad i18n] Error saving language:', err);
    }
    this.notify();
  }

  /**
   * Toggles between 'tr' and 'en'
   * @returns {Promise<string>} new language code
   */
  async toggleLanguage() {
    const nextLang = this.currentLang === 'tr' ? 'en' : 'tr';
    await this.setLanguage(nextLang);
    return nextLang;
  }

  /**
   * Translates a key with optional parameter interpolation
   * @param {string} key 
   * @param {object} params 
   * @returns {string}
   */
  t(key, params = {}) {
    const dict = TRANSLATIONS[this.currentLang] || TRANSLATIONS.tr;
    let text = dict[key] || TRANSLATIONS.tr[key] || key;

    if (params && typeof params === 'object') {
      Object.keys(params).forEach(p => {
        text = text.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p]);
      });
    }

    return text;
  }

  /**
   * Subscribe to language change events
   * @param {Function} callback 
   */
  subscribe(callback) {
    if (typeof callback === 'function') {
      this.subscribers.push(callback);
    }
  }

  notify() {
    this.subscribers.forEach(cb => {
      try {
        cb(this.currentLang);
      } catch (e) {
        console.error('[SteamSquad i18n] Subscriber error:', e);
      }
    });
  }
}

export const i18n = new I18nService();
