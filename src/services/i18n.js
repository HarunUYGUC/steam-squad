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
    addFriendHeading: 'Arkadaş Ekle',
    inputPlaceholder: 'Profil linki, kullanıcı adı veya SteamID64...',
    btnAdd: '+ Ekle',
    btnSearching: '⏳ Aranıyor...',
    inputHint: 'Örn: <code>https://steamcommunity.com/id/kullanici_adi</code> veya <code>kullanici_adi</code>',
    savedSquadsHeading: 'Kayıtlı Ekipler:',
    btnCreateSquad: '➕ Ekip Oluştur',
    btnCreateSquadTitle: 'Yeni bir ekip oluştur ve üyelerini seç',
    btnClear: '🗑️ Temizle',
    btnClearTitle: 'Tüm kadroyu temizle',
    squadMembersHeading: 'Kadro Üyeleri',
    squadSubhint: 'Seçilen oyuncular eşleştirmeye dahil edilir',
    emptySquadTitle: 'Kadroda Henüz Oyuncu Yok',
    emptySquadSub: 'Yukarıdan Steam profil linki veya kullanıcı adı girerek arkadaşlarınızı ekleyin.',
    allSquadPreset: '👥 Tüm Ekip',
    unlockFullLibrary: '🔑 Tüm Kütüphaneyi Aç (Steam Web API)',
    apiKeyDesc: 'Tüm kütüphanedeki yüzlerce oyunu çekmek için ücretsiz Steam API anahtarınızı girebilirsiniz: <a href="https://steamcommunity.com/dev/apikey" target="_blank" style="color: #66c0f4;">steamcommunity.com/dev/apikey</a>',
    apiKeyPlaceholder: 'Steam Web API Key...',
    btnSaveKey: 'Kaydet',
    btnDeleteKey: 'Sil',
    btnDeleteKeyTitle: 'Kayıtlı API anahtarını sil',
    apiKeySaved: '✅ Steam Web API anahtarı kaydedildi!',
    apiKeySavedRefresh: '🔑 Steam Web API Key kaydedildi! Kütüphaneler yenileniyor...',
    apiKeyCleared: 'API Key temizlendi.',
    apiKeyDeleted: '🗑️ Steam Web API anahtarı silindi.',
    promptNewTeam: 'Yeni ekip adı girin (Örn: Duo Takımı, 5v5 Ekibi, Hafta Sonu):',
    defaultNewTeamName: 'Duo Takımı',
    teamCreated: '"{name}" ekibi oluşturuldu.',
    teamCreatedInstruction: '"{name}" ekibi oluşturuldu! Dahil etmek istediğiniz oyuncuları işaretleyin.',
    enterTeamName: 'Lütfen ekip için bir isim girin.',
    cannotDeleteAllTeam: '"Tüm Ekip" ana ekibi silinemez.',
    teamDeleted: '"{name}" ekibi silindi.',
    teamSelected: '"{name}" seçildi.',
    noSavedSquads: 'Kayıtlı ekip yok.',
    deleteTeamTitle: 'Ekibi sil',
    confirmClearSquad: 'Tüm kadroyu temizlemek istediğinize emin misiniz?',
    squadCleared: 'Kadro temizlendi.',
    enterValidProfile: 'Lütfen bir Steam profil linki veya kullanıcı adı girin.',
    playerNotFound: 'Oyuncu bulunamadı.',
    maxMembersReached: 'Bir kadroya en fazla 10 oyuncu ekleyebilirsiniz.',
    profileFetchFailed: 'Profil bilgisi alınamadı.',
    memberUpdated: '{name} kütüphanesi güncellendi.',
    memberAdded: '{name} ({count} oyun) kadroya eklendi!',
    memberAddedPrivate: '{name} eklendi (Oyun detayları gizli ayarlanmış).',
    memberRemoved: '{name} çıkarıldı.',
    memberLibraryRefreshed: '{name} kütüphanesi yenilendi!',
    removeFromSquad: 'Kadrodan Çıkarılsın mı?',
    addToSquad: 'Kadroya Eklensin mi?',
    gamesPrivate: 'Oyun detayları gizli',
    publicProfile: 'Herkese açık profil',
    gamesHiddenWarning: '⚠️ Oyunları Gizli',
    gameCount: '{count} Oyun',
    refreshLibrary: 'Kütüphaneyi Yenile',
    removeMember: 'Kadro\'dan Çıkar',
    privacyAlertTitle: 'Gizli Profil Uyarısı!',
    privacyAlertText: 'Bazı oyuncuların oyun detayları gizli. Kütüphanelerinin görünmesi için Steam Gizlilik Ayarlarından "Oyun Detayları: Herkese Açık" yapılmalıdır.',

    // Tab 2: Matches & Overlap
    statFullTooltip: 'Kadroda seçilen herkesin kütüphanesinde olan oyunlar',
    statN1Tooltip: 'Kadroda sadece 1 kişide eksik olan oyunlar',
    statN2Tooltip: 'Kadroda sadece 2 kişide eksik olan oyunlar',
    statPlayedTooltip: 'Bu kadroyla oynandı olarak işaretlediğiniz oyunlar',
    statTotalTooltip: 'Ekipteki oyuncuların kütüphanelerindeki toplam farklı oyun sayısı',
    statUnitGames: 'Oyun',

    statLabelAllOwn: 'HERKESTE VAR',
    statLabelOneMissing: '1 KİŞİDE YOK',
    statLabelTwoMissing: '2 KİŞİDE YOK',
    statLabelPlayed: 'OYNANDI',
    statLabelTotalPool: 'TOPLAM HAVUZ',

    tierAllOwn: 'Herkeste Var',
    tierOneMissing: '1 Kişide Yok',
    tierTwoMissing: '2 Kişide Yok',

    tagAllMode: '🎮 Tümü',
    tagCoopMode: '🤝 Co-Op / PvE',
    tagPvpMode: '⚔️ PvP / Rekabetçi',
    tagPartyMode: '🎲 Parti / Eğlence',
    tagSurvivalMode: '🧗 Survival',

    searchPlaceholder: 'Oyun ara...',
    sortMostPlayed: '⏱️ En Çok Oynanan',
    sortNameAZ: '🔤 İsim (A-Z)',
    sortPlayerCapacity: '👥 Oyuncu Kapasitesi',

    tooltipQuickDownload: 'Sadece 5 GB altındaki hızlı indirilen oyunları göster',
    labelQuickDownload: '⚡ 10 Dk\'da İndir (<5 GB)',
    tooltipHidePlayed: 'Oynandı olarak işaretlenen oyunları listeden gizle',
    hidePlayed: 'Oynananları Gizle ({count})',

    emptyMatchesTitle: 'Eşleşen Oyun Bulunamadı',
    emptyMatchesSub: 'Filtreleri gevşetebilir veya kadroya daha fazla oyuncu ekleyip kütüphanelerini karşılaştırabilirsiniz.',

    badgeAllOwn: 'HERKESTE VAR',
    badgeOneMissing: '1 KİŞİDE YOK ({count}/{total})',
    badgeTwoMissing: '2 KİŞİDE YOK ({count}/{total})',
    ownershipFull: '✅ Seçilen tüm oyuncuların ({count}/{total}) kütüphanesinde var!',
    ownershipMissing: '⚠️ <strong>{names}</strong> hariç herkeste var',

    tagSingleplayer: '👤 Tek Kişilik',
    tagSoloCapacity: '1 Kişilik (Solo)',
    tagMultiCapacity: '{count} Kişilik',
    tagMultiplayerGeneral: 'Multiplayer',
    totalHours: '⏱️ Toplam: {hours}s',
    badgePlayedGame: '✓ OYNANDI',

    btnPlayedChecked: '☑️ Oynandı',
    btnPlayedUnchecked: '⬜ Oynandı',
    btnPlayedTitle: 'Bu oyunu oynandı olarak işaretle/kaldır',
    btnStore: '🏪 Mağaza',
    btnPlay: '🚀 Oyna',
    btnShareNudge: '💬 Paylaş',
    btnShareNudgeTitle: '{names} için özel davet mesajı kopyala',
    badgeFree: 'Ücretsiz',

    toastMarkedPlayed: '✅ "{name}" oynandı olarak işaretlendi.',
    toastUnmarkedPlayed: '⬜ "{name}" oynandı listesinden çıkarıldı.',
    toastNudgeCopied: '💬 {names} için davet mesajı panoya kopyalandı!',
    nudgePriceDiscount: ' şu an %{discount} indirimle **{price}** fiyata düşmüş!',
    nudgePriceFree: ' tamamen **Ücretsiz**!',
    nudgePriceNormal: ' şu an **{price}** fiyatta.',
    nudgeCtaPlural: 'Ekipçe oynamayı düşünüyoruz, kadroya katılmak için kütüphanenize eklemeyi düşünür müsünüz? 🎮',
    nudgeCtaSingle: 'Ekipçe oynamayı düşünüyoruz, kadroya katılmak için almayı düşünür müsün? 🎮',
    nudgeTemplate: 'Hey {names}! 👋 Steam\'de **{name}** oyunu{priceContext} {cta}\n🔗 Steam Mağazası: {link}',

    // Tab 3: Poll Generator
    pollGeneratorTitle: '📋 Anket Oluşturucu',
    pollGeneratorSub: 'Arkadaşlarınız eklenti kurmadan Discord veya WhatsApp\'ta hızlıca oylama yapabilir.',
    pollPlatformLabel: 'Platform Formatı:',
    pollScopeLabel: 'Anket Kapsamı:',
    pollScopeAll: 'Herkeste Var',
    pollScopeN1: '1 Kişide Yok',
    pollScopeN2: '2 Kişide Yok',
    pollLimitLabel: 'Oyun Sayısı:',
    pollLimit3: 'İlk 3 Oyun',
    pollLimit5: 'İlk 5 Oyun',
    pollLimit8: 'İlk 8 Oyun',
    pollPreviewTitle: 'Anket Önizlemesi',
    btnCopyPoll: '📋 Panoya Kopyala & Paylaş',
    pollCopiedToast: '📋 Anket panoya kopyalandı! Discord veya WhatsApp\'a yapıştırabilirsiniz.',
    pollCopyFailed: 'Kopyalama başarısız oldu.',
    pollHowTitle: '💡 Nasıl Kullanılır?',
    pollStep1: '<strong>"Panoya Kopyala"</strong> butonuna basın.',
    pollStep2: 'Discord sunucunuza veya WhatsApp grubunuza yapıştırın (<code>Ctrl + V</code>).',
    pollStep3: 'Arkadaşlarınız numaralandırılmış emojilere tıklayarak anında oylarını kullansın!',
    pollDiscordHeader: '🎮 **BU AKŞAM NE OYNUYORUZ?** ({squadSize} Kişi Aktif)',
    pollDiscordFooter: '👇 *Lütfen oynamak istediğiniz seçeneğin reaksiyonuna/emojisine tıklayın!* 🕹️',
    pollWhatsappHeader: '🎮 *BU AKŞAM NE OYNUYORUZ?* ({squadSize} Kişi Aktif)',
    pollWhatsappFooter: '👇 *Grupta oy vermek için seçtiğiniz numaranın emojisini veya cevabını gönderin!* 🎯',
    pollAllOwnBadge: '[HERKESTE VAR]',
    pollWhatsappAllOwnBadge: '[Hepimizde Var]',
    pollMissingBadge: '[{names} Hariç]',
    pollMissingDiscountBadge: '[{names} Hariç — %{discount} İndirim: {price}]',
    pollMissingFreeBadge: '[{names} Hariç — Ücretsiz]',
    pollNoGames: '🎮 **SteamSquad**: Ortak oyun bulunamadı.',
    pollNoGamesWhatsapp: '🎮 *SteamSquad*: Ortak oyun bulunamadı.',

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
    addFriendHeading: 'Add Friend',
    inputPlaceholder: 'Profile link, username, or SteamID64...',
    btnAdd: '+ Add',
    btnSearching: '⏳ Searching...',
    inputHint: 'e.g., <code>https://steamcommunity.com/id/username</code> or <code>username</code>',
    savedSquadsHeading: 'Saved Squads:',
    btnCreateSquad: '➕ Create Squad',
    btnCreateSquadTitle: 'Create a new squad and select its members',
    btnClear: '🗑️ Clear All',
    btnClearTitle: 'Clear entire squad',
    squadMembersHeading: 'Squad Members',
    squadSubhint: 'Selected players are included in match calculation',
    emptySquadTitle: 'Squad is Currently Empty',
    emptySquadSub: 'Enter a Steam profile link or username above to add your friends.',
    allSquadPreset: '👥 All Squad',
    unlockFullLibrary: '🔑 Unlock Full Library (Steam Web API)',
    apiKeyDesc: 'To fetch hundreds of games from complete libraries, you can enter your free Steam API key: <a href="https://steamcommunity.com/dev/apikey" target="_blank" style="color: #66c0f4;">steamcommunity.com/dev/apikey</a>',
    apiKeyPlaceholder: 'Steam Web API Key...',
    btnSaveKey: 'Save',
    btnDeleteKey: 'Delete',
    btnDeleteKeyTitle: 'Delete saved API key',
    apiKeySaved: '✅ Steam Web API key saved!',
    apiKeySavedRefresh: '🔑 Steam Web API Key saved! Refreshing libraries...',
    apiKeyCleared: 'API Key cleared.',
    apiKeyDeleted: '🗑️ Steam Web API key deleted.',
    promptNewTeam: 'Enter new squad name (e.g., Duo Team, 5v5 Squad, Weekend 4):',
    defaultNewTeamName: 'Duo Team',
    teamCreated: 'Squad "{name}" created.',
    teamCreatedInstruction: 'Squad "{name}" created! Check the players you want to include.',
    enterTeamName: 'Please enter a name for the squad.',
    cannotDeleteAllTeam: 'Default "All Squad" team cannot be deleted.',
    teamDeleted: 'Squad "{name}" deleted.',
    teamSelected: 'Squad "{name}" selected.',
    noSavedSquads: 'No saved squads.',
    deleteTeamTitle: 'Delete squad',
    confirmClearSquad: 'Are you sure you want to clear the entire squad?',
    squadCleared: 'Squad cleared.',
    enterValidProfile: 'Please enter a Steam profile link or username.',
    playerNotFound: 'Player not found.',
    maxMembersReached: 'You can add at most 10 players to a squad.',
    profileFetchFailed: 'Could not fetch profile info.',
    memberUpdated: '{name}\'s library updated.',
    memberAdded: '{name} ({count} games) added to squad!',
    memberAddedPrivate: '{name} added (Game details are set to private).',
    memberRemoved: '{name} removed.',
    memberLibraryRefreshed: '{name}\'s library refreshed!',
    removeFromSquad: 'Remove from active squad?',
    addToSquad: 'Include in active squad?',
    gamesPrivate: 'Game details are private',
    publicProfile: 'Public profile',
    gamesHiddenWarning: '⚠️ Games Private',
    gameCount: '{count} Games',
    refreshLibrary: 'Refresh Library',
    removeMember: 'Remove from Squad',
    privacyAlertTitle: 'Private Profile Warning!',
    privacyAlertText: 'Some players have private game details. For their libraries to appear, Steam Privacy Settings must be set to "Game Details: Public".',

    // Tab 2: Matches & Overlap
    statFullTooltip: 'Games in every selected squad member\'s library',
    statN1Tooltip: 'Games missing in only 1 player\'s library',
    statN2Tooltip: 'Games missing in only 2 players\' libraries',
    statPlayedTooltip: 'Games marked as played with this squad',
    statTotalTooltip: 'Total unique games across squad members\' libraries',
    statUnitGames: 'Games',

    statLabelAllOwn: 'ALL OWN',
    statLabelOneMissing: '1 MISSING',
    statLabelTwoMissing: '2 MISSING',
    statLabelPlayed: 'PLAYED',
    statLabelTotalPool: 'TOTAL POOL',

    tierAllOwn: 'All Own',
    tierOneMissing: '1 Missing',
    tierTwoMissing: '2 Missing',

    tagAllMode: '🎮 All',
    tagCoopMode: '🤝 Co-Op / PvE',
    tagPvpMode: '⚔️ PvP / Competitive',
    tagPartyMode: '🎲 Party / Casual',
    tagSurvivalMode: '🧗 Survival',

    searchPlaceholder: 'Search games...',
    sortMostPlayed: '⏱️ Most Played',
    sortNameAZ: '🔤 Name (A-Z)',
    sortPlayerCapacity: '👥 Player Capacity',

    tooltipQuickDownload: 'Show only games under 5 GB for fast downloading',
    labelQuickDownload: '⚡ Quick Download (<5 GB)',
    tooltipHidePlayed: 'Hide games marked as played from the list',
    hidePlayed: 'Hide Played ({count})',

    emptyMatchesTitle: 'No Matching Games Found',
    emptyMatchesSub: 'Try loosening your filters or adding more squad members to compare libraries.',

    badgeAllOwn: 'ALL OWN',
    badgeOneMissing: '1 MISSING ({count}/{total})',
    badgeTwoMissing: '2 MISSING ({count}/{total})',
    ownershipFull: '✅ Owned by all selected players ({count}/{total})!',
    ownershipMissing: '⚠️ All own except <strong>{names}</strong>',

    tagSingleplayer: '👤 Singleplayer',
    tagSoloCapacity: '1 Player (Solo)',
    tagMultiCapacity: '{count} Players',
    tagMultiplayerGeneral: 'Multiplayer',
    totalHours: '⏱️ Total: {hours}h',
    badgePlayedGame: '✓ PLAYED',

    btnPlayedChecked: '☑️ Played',
    btnPlayedUnchecked: '⬜ Played',
    btnPlayedTitle: 'Mark or unmark this game as played',
    btnStore: '🏪 Store',
    btnPlay: '🚀 Play',
    btnShareNudge: '💬 Share',
    btnShareNudgeTitle: 'Copy custom invite message for {names}',
    badgeFree: 'Free',

    toastMarkedPlayed: '✅ "{name}" marked as played.',
    toastUnmarkedPlayed: '⬜ "{name}" removed from played list.',
    toastNudgeCopied: '💬 Invite message for {names} copied to clipboard!',
    nudgePriceDiscount: ' is currently %{discount} off at **{price}**!',
    nudgePriceFree: ' is completely **Free**!',
    nudgePriceNormal: ' is currently **{price}**.',
    nudgeCtaPlural: 'We\'re thinking of playing together as a squad, would you consider adding it to your library to join? 🎮',
    nudgeCtaSingle: 'We\'re thinking of playing together as a squad, would you consider getting it to join? 🎮',
    nudgeTemplate: 'Hey {names}! 👋 The game **{name}** on Steam{priceContext} {cta}\n🔗 Steam Store: {link}',

    // Tab 3: Poll Generator
    pollGeneratorTitle: '📋 Poll Generator',
    pollGeneratorSub: 'Squad members can vote quickly in Discord or WhatsApp without installing the extension.',
    pollPlatformLabel: 'Platform Format:',
    pollScopeLabel: 'Poll Scope:',
    pollScopeAll: 'All Own',
    pollScopeN1: '1 Missing',
    pollScopeN2: '2 Missing',
    pollLimitLabel: 'Game Count:',
    pollLimit3: 'Top 3 Games',
    pollLimit5: 'Top 5 Games',
    pollLimit8: 'Top 8 Games',
    pollPreviewTitle: 'Poll Preview',
    btnCopyPoll: '📋 Copy to Clipboard & Share',
    pollCopiedToast: '📋 Poll copied to clipboard! Ready to paste into Discord or WhatsApp.',
    pollCopyFailed: 'Copy failed.',
    pollHowTitle: '💡 How to Use?',
    pollStep1: 'Click the <strong>"Copy to Clipboard"</strong> button.',
    pollStep2: 'Paste into your Discord server or WhatsApp group (<code>Ctrl + V</code>).',
    pollStep3: 'Squad members vote instantly by clicking the numbered emoji reactions!',
    pollDiscordHeader: '🎮 **WHAT ARE WE PLAYING TONIGHT?** ({squadSize} Players Active)',
    pollDiscordFooter: '👇 *Please vote by clicking the reaction emoji below!* 🕹️',
    pollWhatsappHeader: '🎮 *WHAT ARE WE PLAYING TONIGHT?* ({squadSize} Players Active)',
    pollWhatsappFooter: '👇 *Send the numbered emoji or reply with your choice to vote in the group!* 🎯',
    pollAllOwnBadge: '[ALL OWN]',
    pollWhatsappAllOwnBadge: '[All of Us Own]',
    pollMissingBadge: '[Except {names}]',
    pollMissingDiscountBadge: '[Except {names} — %{discount} Off: {price}]',
    pollMissingFreeBadge: '[Except {names} — Free]',
    pollNoGames: '🎮 **SteamSquad**: No shared games found.',
    pollNoGamesWhatsapp: '🎮 *SteamSquad*: No shared games found.',

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
