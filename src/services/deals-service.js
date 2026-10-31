/**
 * Deals & Affiliate Service for SteamSquad
 * Fetches real-time Steam key deals exclusively from Humble Store via CheapShark API
 * using Batch requests (micro-debounced chunks of up to 50 AppIDs) and caches for 24 hours.
 * Links ALWAYS point directly to Humble Store with official affiliate tracking (?partner=steamsquad),
 * ensuring 100% of commissions go directly to your Impact.com partner account.
 */

export const AFFILIATE_CONFIG = {
  humblePartnerTag: 'steamsquad',
  enableAffiliate: true,
  cacheDurationMs: 24 * 60 * 60 * 1000 // 24 hours persistent cache
};

export const AUTHORIZED_STORES = {
  '11': { name: 'Humble Store', shortName: 'Humble' }
};

class DealsService {
  constructor() {
    this.memoryCache = new Map();
    this.pendingBatch = [];
    this.batchTimer = null;
    this.rateLimitBackoffUntil = 0;
    this.isFlushing = false;

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
  }

  /**
   * Sanitizes raw Steam game titles for accurate Humble Store search results.
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
   * Generates a clean search URL on Humble Store with the affiliate partner tag
   */
  getHumbleSearchUrl(gameName) {
    const cleanName = this.sanitizeGameTitle(gameName);
    const encoded = encodeURIComponent(cleanName);
    const partner = AFFILIATE_CONFIG.humblePartnerTag;
    return `https://www.humblebundle.com/store/search?sort=bestselling&search=${encoded}&partner=${partner}`;
  }

  /**
   * Creates a default fallback object (Seçenek 2: quiet Humble Store search link)
   */
  createFallback(gameName) {
    const searchUrl = this.getHumbleSearchUrl(gameName);
    return {
      hasDeal: false,
      storeId: '11',
      storeName: 'Humble',
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
   * Fetches the best Humble deal for a Steam AppID with batch grouping and persistent caching
   */
  async getBestDeal(appId, gameName) {
    if (!appId) return null;

    const idStr = String(appId);
    const now = Date.now();

    // 1. Check in-memory cache
    if (this.memoryCache.has(idStr)) {
      const cached = this.memoryCache.get(idStr);
      if (now - cached.timestamp < AFFILIATE_CONFIG.cacheDurationMs) {
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
          this.memoryCache.set(idStr, { deal, timestamp: stored[storageKey].timestamp });
          return deal;
        }
      }
    } catch {}

    const fallback = this.createFallback(gameName);

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
   * Flushes the queued batch by requesting multiple AppIDs in chunks of up to 50 per HTTP call
   */
  async flushBatch() {
    if (this.isFlushing || this.pendingBatch.length === 0) return;
    this.isFlushing = true;

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

    for (let i = 0; i < uniqueAppIds.length; i += CHUNK_SIZE) {
      const chunkIds = uniqueAppIds.slice(i, i + CHUNK_SIZE);

      try {
        const url = `https://www.cheapshark.com/api/1.0/deals?steamAppID=${chunkIds.join(',')}&storeID=11&pageSize=60`;
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

        const returnedDealsMap = new Map();
        if (Array.isArray(data)) {
          for (const d of data) {
            if (String(d.storeID) === '11' && d.steamAppID) {
              const prev = returnedDealsMap.get(d.steamAppID);
              if (!prev || parseFloat(d.salePrice) < parseFloat(prev.salePrice)) {
                returnedDealsMap.set(d.steamAppID, d);
              }
            }
          }
        }

        const storageUpdates = {};

        for (const appId of chunkIds) {
          const items = appMap.get(appId) || [];
          const gameTitle = items[0]?.gameName || '';
          const matched = returnedDealsMap.get(appId);

          let resolvedDeal;
          if (matched) {
            const savings = Math.round(parseFloat(matched.savings || '0'));
            const price = parseFloat(matched.salePrice).toFixed(2);
            const normalPrice = parseFloat(matched.normalPrice || matched.salePrice).toFixed(2);

            // DIRECT HUMBLE STORE SEARCH URL with partner tag and sanitized title
            // (Never uses cheapshark.com/redirect to ensure 100% affiliate commission goes to you)
            const directHumbleUrl = this.getHumbleSearchUrl(gameTitle);

            resolvedDeal = {
              hasDeal: savings > 0,
              storeId: '11',
              storeName: 'Humble',
              price: `$${price}`,
              normalPrice: `$${normalPrice}`,
              priceNumeric: parseFloat(matched.salePrice),
              normalPriceNumeric: parseFloat(matched.normalPrice || matched.salePrice),
              savingsPercent: savings,
              dealUrl: directHumbleUrl,
              humbleUrl: directHumbleUrl
            };
          } else {
            resolvedDeal = items[0]?.fallback || this.createFallback(gameTitle);
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
    const store = 'Humble Store';
    const priceText = deal?.price ? ` (${deal.price}${deal.savingsPercent > 0 ? ' -%' + deal.savingsPercent : ''})` : '';
    const url = deal?.dealUrl || this.getHumbleSearchUrl(gameName);

    if (isEn) {
      const playerText = missingPlayerName ? ` for ${missingPlayerName}` : '';
      return `🎮 ${gameName} Steam key deal${playerText} on ${store}${priceText}: ${url}`;
    }

    const playerText = missingPlayerName ? ` (${missingPlayerName} eksik)` : '';
    return `🎮 ${gameName} Steam key indirimi${playerText} — ${store}'da${priceText}: ${url}`;
  }
}

export const dealsService = new DealsService();
