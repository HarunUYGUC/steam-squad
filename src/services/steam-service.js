/**
 * SteamSquad — Steam Public Data Service
 * Safe & passwordless public Steam XML/HTML parsing and Steam Web API library retrieval.
 */

import { getGameMetadata } from './game-metadata.js';

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours cache for store details

/**
 * Normalizes input string to determine identifier type and key
 * @param {string} input 
 * @returns {{ type: 'id' | 'profiles', value: string, cleanInput: string }}
 */
export function parseSteamInput(input) {
  if (!input) return null;
  const trimmed = input.trim();

  // Pattern: https://steamcommunity.com/id/vanityname/...
  const idMatch = trimmed.match(/steamcommunity\.com\/id\/([^/?#]+)/i);
  if (idMatch) {
    return { type: 'id', value: idMatch[1], cleanInput: trimmed };
  }

  // Pattern: https://steamcommunity.com/profiles/76561198.../...
  const profileMatch = trimmed.match(/steamcommunity\.com\/profiles\/([0-9]{17})/i);
  if (profileMatch) {
    return { type: 'profiles', value: profileMatch[1], cleanInput: trimmed };
  }

  // Pure SteamID64 (17 digits)
  if (/^[0-9]{17}$/.test(trimmed)) {
    return { type: 'profiles', value: trimmed, cleanInput: trimmed };
  }

  // Otherwise assume custom vanity URL identifier
  const sanitized = trimmed.replace(/[^a-zA-Z0-9_-]/g, '');
  return { type: 'id', value: sanitized || trimmed, cleanInput: trimmed };
}

/**
 * Resolves vanity URL to SteamID64 via Steam Web API if key is available
 */
async function resolveVanityUrl(vanity, apiKey) {
  if (!vanity || !apiKey) return null;
  try {
    const res = await fetch(`https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apiKey}&vanityurl=${vanity}`);
    if (res.ok) {
      const json = await res.json();
      if (json.response?.success === 1 && json.response?.steamid) {
        return json.response.steamid;
      }
    }
  } catch (e) {
    console.warn('[SteamSquad] Vanity resolve error:', e);
  }
  return null;
}

/**
 * Fetches all owned games via Steam Web API
 */
async function fetchOwnedGamesApi(steamId64, apiKey) {
  if (!steamId64 || !apiKey) return null;
  try {
    const res = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId64}&include_appinfo=1&include_played_free_games=1&format=json`);
    if (res.ok) {
      const json = await res.json();
      if (json.response && Array.isArray(json.response.games)) {
        return json.response.games.map(g => ({
          appId: Number(g.appid),
          name: g.name || 'Oyun',
          logo: `https://cdn.akamai.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
          hoursOnRecord: parseFloat(((g.playtime_forever || 0) / 60).toFixed(1)),
          storeLink: `https://store.steampowered.com/app/${g.appid}`,
          metadata: getGameMetadata(g.appid, g.name)
        }));
      }
    }
  } catch (e) {
    console.warn('[SteamSquad] Steam Web API fetch error:', e);
  }
  return null;
}

/**
 * Fetches and parses a Steam profile library using multi-strategy fallback:
 * Strategy 1: Steam Web API (if API key saved) -> pulls 100% of all games (all 50-1000+ games)
 * Strategy 2: Profile XML (https://steamcommunity.com/{type}/{value}/?xml=1) -> user info & mostPlayedGames
 * Strategy 3: Games XML / HTML session fallback
 * 
 * @param {string} input - Steam URL, SteamID64, or vanity username
 * @returns {Promise<{
 *   success: boolean,
 *   steamId64?: string,
 *   personaName?: string,
 *   avatarUrl?: string,
 *   profileUrl?: string,
 *   games: Array<{ appId: number, name: string, logo: string, hoursOnRecord: number, storeLink: string, metadata: object }>,
 *   isPrivate?: boolean,
 *   warning?: string,
 *   error?: string
 * }>}
 */
export async function fetchSteamLibrary(input) {
  const parsed = parseSteamInput(input);
  if (!parsed || !parsed.value) {
    return {
      success: false,
      error: 'Geçersiz Steam profil formatı. Lütfen profil linki veya kullanıcı adı girin.'
    };
  }

  // Check if user has saved a Steam Web API key
  let apiKey = '';
  try {
    const storageData = await chrome.storage.local.get('steamsquad_api_key');
    apiKey = storageData.steamsquad_api_key || '';
  } catch {}

  const profileXmlUrl = `https://steamcommunity.com/${parsed.type}/${parsed.value}/?xml=1`;

  try {
    // 1. Fetch Profile XML to get basic info (avatar, display name, steamID64)
    const profileResponse = await fetch(profileXmlUrl, {
      method: 'GET',
      headers: { 'Accept': 'text/xml, application/xml' }
    });

    if (!profileResponse.ok) {
      return {
        success: false,
        error: `Steam profiline erişilemedi (HTTP ${profileResponse.status}). Kullanıcı adı veya linki kontrol edin.`
      };
    }

    const profileXmlText = await profileResponse.text();
    const parser = new DOMParser();
    const profileDoc = parser.parseFromString(profileXmlText, 'text/xml');

    // Check Steam error tag
    const errorNode = profileDoc.querySelector('error');
    if (errorNode) {
      return {
        success: false,
        error: `Steam Hatası: ${errorNode.textContent.trim()}`
      };
    }

    const steamId64Node = profileDoc.querySelector('steamID64');
    const steamIdNode = profileDoc.querySelector('steamID');
    const avatarNode = profileDoc.querySelector('avatarFull') || profileDoc.querySelector('avatarMedium') || profileDoc.querySelector('avatarIcon');
    const privacyNode = profileDoc.querySelector('privacyState');

    let steamId64 = steamId64Node ? steamId64Node.textContent.trim() : (parsed.type === 'profiles' ? parsed.value : '');
    const personaName = steamIdNode ? steamIdNode.textContent.trim() : parsed.value;
    const avatarUrl = avatarNode ? avatarNode.textContent.trim() : 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg';
    const profileUrl = `https://steamcommunity.com/${parsed.type}/${parsed.value}`;
    const privacyState = privacyNode ? privacyNode.textContent.trim().toLowerCase() : 'public';

    const gamesMap = new Map();

    // 2. If API Key is present, try pulling ALL games via Steam Web API
    if (apiKey) {
      if (!steamId64 && parsed.type === 'id') {
        steamId64 = await resolveVanityUrl(parsed.value, apiKey);
      }
      if (steamId64) {
        const apiGames = await fetchOwnedGamesApi(steamId64, apiKey);
        if (apiGames && apiGames.length > 0) {
          apiGames.forEach(g => gamesMap.set(g.appId, g));
        }
      }
    }

    // 3. If API Key wasn't used or returned 0, extract games from profile XML <mostPlayedGames>
    if (gamesMap.size === 0) {
      const mostPlayedNodes = profileDoc.querySelectorAll('mostPlayedGames > mostPlayedGame');
      mostPlayedNodes.forEach(node => {
        const name = node.querySelector('gameName')?.textContent?.trim() || 'Oyun';
        const link = node.querySelector('gameLink')?.textContent?.trim() || '';
        const statsName = node.querySelector('statsName')?.textContent?.trim() || '';
        const logo = node.querySelector('gameLogo')?.textContent?.trim() || '';
        const hoursStr = node.querySelector('hoursOnRecord')?.textContent || node.querySelector('hoursPlayed')?.textContent || '0';
        const hours = parseFloat(hoursStr.replace(',', '.') || '0');

        let appId = null;
        const appMatch = link.match(/\/app\/(\d+)/i);
        if (appMatch) {
          appId = Number(appMatch[1]);
        } else if (statsName && /^\d+$/.test(statsName)) {
          appId = Number(statsName);
        } else if (statsName.toUpperCase() === 'CSGO' || name.includes('Counter-Strike')) {
          appId = 730;
        }

        if (appId) {
          gamesMap.set(appId, {
            appId,
            name,
            logo: logo || `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`,
            hoursOnRecord: isNaN(hours) ? 0 : hours,
            storeLink: `https://store.steampowered.com/app/${appId}`,
            metadata: getGameMetadata(appId, name)
          });
        }
      });
    }

    // 4. Try parsing Games XML or HTML session if available
    if (gamesMap.size <= 5) {
      try {
        const gamesXmlUrl = `https://steamcommunity.com/${parsed.type}/${parsed.value}/games?tab=all&xml=1`;
        const gamesResponse = await fetch(gamesXmlUrl, {
          method: 'GET',
          headers: { 'Accept': 'text/xml, application/xml' }
        });

        if (gamesResponse.ok) {
          const gamesXmlText = await gamesResponse.text();
          if (gamesXmlText.includes('<?xml') && !gamesXmlText.includes('<!DOCTYPE html>')) {
            const gamesDoc = parser.parseFromString(gamesXmlText, 'text/xml');
            const gameNodes = gamesDoc.querySelectorAll('games > game');
            gameNodes.forEach(node => {
              const appID = node.querySelector('appID')?.textContent?.trim();
              const name = node.querySelector('name')?.textContent?.trim() || 'Oyun';
              const logo = node.querySelector('logo')?.textContent?.trim() || `https://cdn.akamai.steamstatic.com/steam/apps/${appID}/header.jpg`;
              const hours = parseFloat(node.querySelector('hoursOnRecord')?.textContent?.replace(',', '.') || '0');

              if (appID) {
                const appIdNum = Number(appID);
                gamesMap.set(appIdNum, {
                  appId: appIdNum,
                  name,
                  logo,
                  hoursOnRecord: isNaN(hours) ? 0 : hours,
                  storeLink: `https://store.steampowered.com/app/${appID}`,
                  metadata: getGameMetadata(appIdNum, name)
                });
              }
            });
          }
        }
      } catch {}
    }

    const games = Array.from(gamesMap.values());
    const isPrivate = privacyState !== 'public' && games.length === 0;

    return {
      success: true,
      steamId64: steamId64 || parsed.value,
      personaName,
      avatarUrl,
      profileUrl,
      games,
      isPrivate,
      warning: isPrivate ? 'Bu kullanıcının Steam oyun detayları gizli veya kısıtlı.' : undefined
    };

  } catch (err) {
    console.error('[SteamSquad] Fetch error:', err);
    return {
      success: false,
      error: `Bağlantı hatası: ${err.message || 'Steam sunucusuna ulaşılamadı'}`
    };
  }
}

let rateLimitBackoffUntil = 0;
const memoryStoreCache = new Map();

// Queue manager for store requests
let activeStoreRequests = 0;
const MAX_CONCURRENT_STORE_REQUESTS = 2;
const storeQueue = [];

function processStoreQueue() {
  if (storeQueue.length === 0 || activeStoreRequests >= MAX_CONCURRENT_STORE_REQUESTS) {
    return;
  }

  const { task, resolve } = storeQueue.shift();
  activeStoreRequests++;

  task().then(res => {
    activeStoreRequests--;
    resolve(res);
    setTimeout(processStoreQueue, 150);
  }).catch(() => {
    activeStoreRequests--;
    resolve(null);
    setTimeout(processStoreQueue, 150);
  });
}

function queueStoreRequest(task) {
  return new Promise(resolve => {
    storeQueue.push({ task, resolve });
    processStoreQueue();
  });
}

/**
 * Fetch price and discount info for a game from Steam Store API with local caching and rate-limit protection
 * @param {number} appId 
 * @param {string} countryCode - default 'tr' (Turkey / MENA-USD regional pricing)
 * @param {string} language - default 'turkish'
 * @returns {Promise<{ isFree: boolean, discountPercent: number, initialFormatted: string, finalFormatted: string, hasDiscount: boolean, headerImage: string }>}
 */
export async function fetchGameStoreDetails(appId, countryCode = 'tr', language = 'turkish') {
  const cacheKey = `store_cache_${appId}_${countryCode}_${language}`;

  // Check memory cache first
  if (memoryStoreCache.has(cacheKey)) {
    return memoryStoreCache.get(cacheKey);
  }

  // Check storage cache
  try {
    const cached = await chrome.storage.local.get(cacheKey);
    if (cached[cacheKey] && (Date.now() - cached[cacheKey].timestamp < CACHE_TTL_MS)) {
      memoryStoreCache.set(cacheKey, cached[cacheKey].data);
      return cached[cacheKey].data;
    }
  } catch {}

  const fallback = {
    isFree: false,
    discountPercent: 0,
    initialFormatted: '',
    finalFormatted: '',
    hasDiscount: false,
    headerImage: `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
  };

  // If currently in rate-limit backoff, return fallback silently without requesting
  if (Date.now() < rateLimitBackoffUntil) {
    return fallback;
  }

  return queueStoreRequest(async () => {
    try {
      const res = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=${countryCode}&l=${language}`);
      
      if (res.status === 429) {
        // Rate limited by Steam: set a 1-minute backoff
        rateLimitBackoffUntil = Date.now() + 60000;
        return fallback;
      }

      if (!res.ok) return fallback;

      const json = await res.json();
      if (json[appId]?.success && json[appId]?.data) {
        const data = json[appId].data;
        const isFree = Boolean(data.is_free);
        const priceOverview = data.price_overview;

        const result = {
          isFree,
          discountPercent: priceOverview?.discount_percent || 0,
          initialFormatted: priceOverview?.initial_formatted || '',
          finalFormatted: priceOverview?.final_formatted || (isFree ? 'Ücretsiz' : ''),
          hasDiscount: (priceOverview?.discount_percent || 0) > 0,
          headerImage: data.header_image || `https://cdn.akamai.steamstatic.com/steam/apps/${appId}/header.jpg`
        };

        memoryStoreCache.set(cacheKey, result);
        try {
          await chrome.storage.local.set({
            [cacheKey]: { data: result, timestamp: Date.now() }
          });
        } catch {}

        return result;
      }
    } catch {}

    return fallback;
  });
}
