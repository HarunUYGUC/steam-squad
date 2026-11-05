/**
 * Deals & Affiliate Service for SteamSquad
 * Fetches real-time Steam key deals across authorized digital storefronts (GameBillet & Humble Store)
 * via CheapShark API using Batch requests (micro-debounced chunks of up to 50 AppIDs) and caches for 24 hours.
 * Links ALWAYS point directly to authorized stores with official affiliate tracking:
 * - GameBillet: ?affiliate=cfbc4fed-8524-422f-b987-b99a3bc536ed (5% commission)
 * - Humble Store: ?partner=steamsquad (partnership not yet approved, but links still forward users when Humble has the best price)
 * Best Price Wins (Seçenek A): Compares live prices between authorized retailers and surfaces the cheapest key.
 */

export const AFFILIATE_CONFIG = {
  gamebilletAffiliateId: 'cfbc4fed-8524-422f-b987-b99a3bc536ed',
  humblePartnerTag: 'steamsquad', // Partnership not yet approved, but redirected to provide users the best available price
  enableAffiliate: true,
  cacheDurationMs: 24 * 60 * 60 * 1000 // 24 hours persistent cache
};

export const AUTHORIZED_STORES = {
  gamebillet: { name: 'GameBillet', shortName: 'GameBillet', defaultId: '30' },
  humble: { name: 'Humble Store', shortName: 'Humble', defaultId: '11' }
};

class DealsService {
  constructor() {
    this.memoryCache = new Map();
    this.pendingBatch = [];
    this.batchTimer = null;
    this.rateLimitBackoffUntil = 0;
    this.isFlushing = false;
    this._storesInitialized = false;

    this.storeIds = {
      gamebillet: AUTHORIZED_STORES.gamebillet.defaultId,
      humble: AUTHORIZED_STORES.humble.defaultId
    };

    // Load persisted backoff timestamp if any
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        chrome.storage.local.get('steamsquad_deals_backoff_until').then(data => {
          if (data?.steamsquad_deals_backoff_until) {
            this.rateLimitBackoffUntil = Number(data.steamsquad_deals_backoff_until) || 0;
          }
        }).catch(() => {});
      }
    } catch {}

    this.initStores().catch(() => {});
  }

  /**
   * Initializes dynamic store IDs from CheapShark /stores or local storage cache
   */
  async initStores() {
    if (this._storesInitialized) return;

    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const cached = await chrome.storage.local.get('steamsquad_stores_map');
        if (cached?.steamsquad_stores_map && (Date.now() - cached.steamsquad_stores_map.timestamp < 7 * 24 * 60 * 60 * 1000)) {
          this.storeIds = { ...this.storeIds, ...cached.steamsquad_stores_map.data };
          this._storesInitialized = true;
          return;
        }
      }
    } catch {}

    try {
      const response = await fetch('https://www.cheapshark.com/api/1.0/stores');
      if (response.ok) {
        const stores = await response.json();
        if (Array.isArray(stores)) {
          const map = {};
          for (const s of stores) {
            const nameLower = (s.storeName || '').toLowerCase();
            if (nameLower.includes('gamebillet')) {
              map.gamebillet = String(s.storeID);
            } else if (nameLower.includes('humble')) {
              map.humble = String(s.storeID);
            }
          }
          if (map.gamebillet) this.storeIds.gamebillet = map.gamebillet;
          if (map.humble) this.storeIds.humble = map.humble;
          this._storesInitialized = true;

          if (typeof chrome !== 'undefined' && chrome.storage?.local) {
            chrome.storage.local.set({
              steamsquad_stores_map: { data: this.storeIds, timestamp: Date.now() }
            });
          }
        }
      }
    } catch {}
  }

  /**
   * Sanitizes raw Steam game titles for accurate Store search results.
   * Strips trademarks (™, ®, ©), bracketed region/platform tags, and verbose edition/remaster suffixes.
   */
  sanitizeGameTitle(rawTitle) {
    if (!rawTitle || typeof rawTitle !== 'string') return '';

    let clean = rawTitle
      // 1. Remove trademark and copyright symbols
      .replace(/[™®©]/g, '')
      // 2. Remove common region, platform, or edition brackets e.g. (LATAM), [VR], [Remastered]
      .replace(/\s*[\(\[][^\)\]]*(LATAM|RU|CIS|NA|EU|ROW|VR|PC|Mac|Linux|Remaster|Edition|Cut)[^\)\]]*[\)\]]/gi, '')
      // 3. Remove verbose edition suffixes or remaster tags (e.g. "-- Remastered", "Special Edition")
      .replace(/\s*[-:]*\s*(Remastered|Remaster|HD Remaster|Remake|Reboot|Director\'?s Cut|Anniversary Edition|Game of the Year Edition|GOTY Edition|Definitive Edition|Definitive Experience|Digital Deluxe Edition|Deluxe Edition|Complete Edition|Enhanced Edition|Special Edition|Standard Edition|Legacy Edition|Collector\'?s Edition|VR Edition)$/gi, '')
      // 4. Clean up colons, double-dashes, and underscores into clean single spaces
      .replace(/[-:_]+/g, ' ')
      // 5. Collapse multiple whitespace into one
      .replace(/\s+/g, ' ')
      .trim();

    return clean || rawTitle.trim();
  }

  /**
   * Generates a clean search URL on GameBillet with the affiliate partner tag
   */
  getGameBilletSearchUrl(gameName) {
    const cleanName = this.sanitizeGameTitle(gameName);
    const encoded = encodeURIComponent(cleanName);
    const affiliateId = AFFILIATE_CONFIG.gamebilletAffiliateId;
    return `https://www.gamebillet.com/search?q=${encoded}&affiliate=${affiliateId}`;
  }

  /**
   * Generates a clean search URL on Humble Store with the affiliate partner tag
   */
  getHumbleSearchUrl(gameName) {
    const cleanName = this.sanitizeGameTitle(gameName);
    const encoded = encodeURIComponent(cleanName);
    const partner = AFFILIATE_CONFIG.humblePartnerTag;
    return `https://www.humblebundle.com/store/search?sort=bestselling&search=${encoded}&partner=${partner}`;
  }

  /**
   * Generates default fallback search URL (defaults to GameBillet as active affiliate)
   */
  getDefaultSearchUrl(gameName) {
    return this.getGameBilletSearchUrl(gameName);
  }

  /**
   * Creates a default fallback object (quiet GameBillet search link)
   */
  createFallback(gameName, storeKey = 'gamebillet') {
    const isHb = storeKey === 'humble';
    const storeName = isHb ? 'Humble' : 'GameBillet';
    const storeId = isHb ? this.storeIds.humble : this.storeIds.gamebillet;
    const searchUrl = isHb ? this.getHumbleSearchUrl(gameName) : this.getGameBilletSearchUrl(gameName);

    return {
      hasDeal: false,
      storeId,
      storeName,
      price: null,
      normalPrice: null,
      priceNumeric: null,
      normalPriceNumeric: null,
      savingsPercent: 0,
      dealUrl: searchUrl,
      humbleUrl: searchUrl
    };
  }

  /**
   * Fetches the best deal (GameBillet vs Humble) for a Steam AppID with batch grouping and persistent caching
   */
  async getBestDeal(appId, gameName) {
    if (!appId) return null;

    const idStr = String(appId);
    const now = Date.now();

    // 1. Check in-memory cache
    if (this.memoryCache.has(idStr)) {
      const cached = this.memoryCache.get(idStr);
      if (now - cached.timestamp < AFFILIATE_CONFIG.cacheDurationMs) {
        if (cached.deal && cached.deal.dealUrl?.includes('cheapshark.com')) {
          cached.deal.dealUrl = this.getGameBilletSearchUrl(gameName);
          cached.deal.humbleUrl = cached.deal.dealUrl;
        }
        return cached.deal;
      }
    }

    // 2. Check chrome.storage.local cache
    const storageKey = `deal_cache_${idStr}`;
    try {
      if (typeof chrome !== 'undefined' && chrome.storage?.local) {
        const stored = await chrome.storage.local.get(storageKey);
        if (stored[storageKey] && (now - stored[storageKey].timestamp < AFFILIATE_CONFIG.cacheDurationMs)) {
          const deal = stored[storageKey].deal;
          if (deal && (!deal.dealUrl || deal.dealUrl.includes('cheapshark.com'))) {
            deal.dealUrl = this.getGameBilletSearchUrl(gameName);
            deal.humbleUrl = deal.dealUrl;
            chrome.storage.local.set({ [storageKey]: { deal, timestamp: stored[storageKey].timestamp } });
          }
          this.memoryCache.set(idStr, { deal, timestamp: stored[storageKey].timestamp });
          return deal;
        }
      }
    } catch {}

    const fallback = this.createFallback(gameName, 'gamebillet');

    // 3. If currently in rate-limit backoff, return fallback silently without requesting CheapShark
    if (now < this.rateLimitBackoffUntil) {
      return fallback;
    }

    // 4. Enqueue into micro-debounced batch pool (50ms buffer)
    return new Promise((resolve) => {
      this.pendingBatch.push({
        appId: idStr,
        gameName,
        fallback,
        resolve
      });

      if (!this.batchTimer) {
        this.batchTimer = setTimeout(() => {
          this.batchTimer = null;
          this.flushBatch();
        }, 50);
      }
    });
  }

  /**
   * Flushes the queued batch by requesting multiple AppIDs across authorized stores
   */
  async flushBatch() {
    if (this.isFlushing || this.pendingBatch.length === 0) return;
    this.isFlushing = true;

    await this.initStores();

    const currentBatch = [...this.pendingBatch];
    this.pendingBatch = [];

    const now = Date.now();

    // If rate-limited, resolve all queued callers immediately with fallback
    if (now < this.rateLimitBackoffUntil) {
      currentBatch.forEach(item => item.resolve(item.fallback));
      this.isFlushing = false;
      return;
    }

    // Group items by appId
    const appMap = new Map();
    for (const item of currentBatch) {
      if (!appMap.has(item.appId)) {
        appMap.set(item.appId, []);
      }
      appMap.get(item.appId).push(item);
    }

    const uniqueAppIds = Array.from(appMap.keys());
    const CHUNK_SIZE = 50;

    // Both GameBillet and Humble queried together
    const storeIdsList = Array.from(new Set([this.storeIds.gamebillet, this.storeIds.humble])).filter(Boolean).join(',');

    for (let i = 0; i < uniqueAppIds.length; i += CHUNK_SIZE) {
      const chunkIds = uniqueAppIds.slice(i, i + CHUNK_SIZE);

      try {
        const url = `https://www.cheapshark.com/api/1.0/deals?steamAppID=${chunkIds.join(',')}&storeID=${storeIdsList}&pageSize=60`;
        const response = await fetch(url);

        if (response.status === 429) {
          // Rate-limited: silently back off for 3 minutes without raising console warnings
          this.rateLimitBackoffUntil = Date.now() + (3 * 60 * 1000);
          try {
            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
              chrome.storage.local.set({ steamsquad_deals_backoff_until: this.rateLimitBackoffUntil });
            }
          } catch {}

          // Resolve remaining items with clean fallback
          for (let k = i; k < uniqueAppIds.length; k++) {
            const remainingId = uniqueAppIds[k];
            const items = appMap.get(remainingId) || [];
            items.forEach(it => it.resolve(it.fallback));
          }
          break;
        }

        const data = await response.json();

        if (data && data.error) {
          this.rateLimitBackoffUntil = Date.now() + (3 * 60 * 1000);
          try {
            if (typeof chrome !== 'undefined' && chrome.storage?.local) {
              chrome.storage.local.set({ steamsquad_deals_backoff_until: this.rateLimitBackoffUntil });
            }
          } catch {}

          chunkIds.forEach(id => {
            const items = appMap.get(id) || [];
            items.forEach(it => it.resolve(it.fallback));
          });
          continue;
        }

        // Group deals by steamAppID across authorized stores
        const returnedDealsMap = new Map();
        if (Array.isArray(data)) {
          for (const d of data) {
            const sid = String(d.storeID);
            const isGb = sid === this.storeIds.gamebillet;
            const isHb = sid === this.storeIds.humble;
            if ((isGb || isHb) && d.steamAppID) {
              if (!returnedDealsMap.has(d.steamAppID)) {
                returnedDealsMap.set(d.steamAppID, []);
              }
              returnedDealsMap.get(d.steamAppID).push(d);
            }
          }
        }

        const storageUpdates = {};

        for (const appId of chunkIds) {
          const items = appMap.get(appId) || [];
          const gameTitle = items[0]?.gameName || '';
          const dealsForApp = returnedDealsMap.get(appId) || [];

          let matched = null;
          let matchedStore = 'gamebillet';

          if (dealsForApp.length > 0) {
            // "Seçenek A" Best Deal Selection:
            // 1. Sort by lowest salePrice
            // 2. Tie-break: prefer GameBillet (commission active)
            dealsForApp.sort((a, b) => {
              const priceA = parseFloat(a.salePrice || '99999');
              const priceB = parseFloat(b.salePrice || '99999');
              if (priceA !== priceB) {
                return priceA - priceB;
              }
              if (String(a.storeID) === this.storeIds.gamebillet) return -1;
              if (String(b.storeID) === this.storeIds.gamebillet) return 1;
              return 0;
            });

            matched = dealsForApp[0];
            matchedStore = String(matched.storeID) === this.storeIds.humble ? 'humble' : 'gamebillet';
          }

          let resolvedDeal;
          if (matched) {
            const savings = Math.round(parseFloat(matched.savings || '0'));
            const price = parseFloat(matched.salePrice).toFixed(2);
            const normalPrice = parseFloat(matched.normalPrice || matched.salePrice).toFixed(2);

            const isGb = matchedStore === 'gamebillet';
            const storeName = isGb ? 'GameBillet' : 'Humble';
            const storeId = isGb ? this.storeIds.gamebillet : this.storeIds.humble;
            const directUrl = isGb
              ? this.getGameBilletSearchUrl(gameTitle)
              : this.getHumbleSearchUrl(gameTitle);

            resolvedDeal = {
              hasDeal: savings > 0,
              storeId,
              storeName,
              price: `$${price}`,
              normalPrice: `$${normalPrice}`,
              priceNumeric: parseFloat(matched.salePrice),
              normalPriceNumeric: parseFloat(matched.normalPrice || matched.salePrice),
              savingsPercent: savings,
              dealUrl: directUrl,
              humbleUrl: directUrl
            };
          } else {
            resolvedDeal = items[0]?.fallback || this.createFallback(gameTitle, 'gamebillet');
          }

          this.memoryCache.set(appId, { deal: resolvedDeal, timestamp: now });
          storageUpdates[`deal_cache_${appId}`] = { deal: resolvedDeal, timestamp: now };

          items.forEach(it => it.resolve(resolvedDeal));
        }

        try {
          if (typeof chrome !== 'undefined' && chrome.storage?.local && Object.keys(storageUpdates).length > 0) {
            await chrome.storage.local.set(storageUpdates);
          }
        } catch {}

      } catch (err) {
        chunkIds.forEach(id => {
          const items = appMap.get(id) || [];
          items.forEach(it => it.resolve(it.fallback));
        });
      }

      if (i + CHUNK_SIZE < uniqueAppIds.length) {
        await new Promise(r => setTimeout(r, 250));
      }
    }

    this.isFlushing = false;

    if (this.pendingBatch.length > 0) {
      this.flushBatch();
    }
  }

  /**
   * Generates a pre-formatted message for sharing a deal with missing friends
   */
  getShareMessage(gameName, missingPlayerName, deal, lang = 'tr') {
    const isEn = lang === 'en';
    const store = deal?.storeName || 'GameBillet';
    const priceText = deal?.price ? ` (${deal.price}${deal.savingsPercent > 0 ? ' -%' + deal.savingsPercent : ''})` : '';
    const cleanUrl = (deal?.dealUrl && !deal.dealUrl.includes('cheapshark.com'))
      ? deal.dealUrl
      : this.getGameBilletSearchUrl(gameName);

    if (isEn) {
      const playerText = missingPlayerName ? ` for ${missingPlayerName}` : '';
      return `🎮 ${gameName} Steam key deal${playerText} on ${store}${priceText}: ${cleanUrl}`;
    }

    const playerText = missingPlayerName ? ` (${missingPlayerName} eksik)` : '';
    return `🎮 ${gameName} Steam key indirimi${playerText} — ${store}'da${priceText}: ${cleanUrl}`;
  }
}

export const dealsService = new DealsService();
