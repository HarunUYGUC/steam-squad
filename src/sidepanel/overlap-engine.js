/**
 * SteamSquad — Library Overlap Engine
 * Calculates 100% full matches, 1 missing, 2 missing player intersections, played status, and filters.
 */

import { fetchGameStoreDetails } from '../services/steam-service.js';
import { getGameMetadata, checkPartySizeCompatibility, SIZE_TIERS, GAME_MODES } from '../services/game-metadata.js';

export class OverlapEngine {
  constructor() {
    this.playedGames = new Set();
    this.filters = {
      matchTier: 'all_100',     // 'all_100', 'all_with_n1', 'all_with_n2'
      gameMode: 'all',          // 'all', 'coop', 'pvp', 'party', 'survival'
      sizeTier: 'all',          // 'all', 'small' (<5GB)
      hidePlayed: false,        // hide games marked as played
      searchQuery: '',
      sortBy: 'hours'           // 'hours', 'match', 'name', 'maxPlayers'
    };
  }

  /**
   * Set played game AppIDs
   * @param {Array<number>} appIds 
   */
  setPlayedGames(appIds) {
    if (Array.isArray(appIds)) {
      this.playedGames = new Set(appIds.map(Number));
    }
  }

  /**
   * Toggle played status for an appId
   * @param {number} appId 
   * @returns {boolean} isPlayed
   */
  togglePlayedGame(appId) {
    const num = Number(appId);
    if (this.playedGames.has(num)) {
      this.playedGames.delete(num);
      return false;
    } else {
      this.playedGames.add(num);
      return true;
    }
  }

  /**
   * Update active filters
   * @param {Partial<typeof this.filters>} newFilters 
   */
  setFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
  }

  /**
   * Compute matches across all active squad members
   * @param {Array} activeMembers 
   * @returns {Promise<{
   *   fullMatches: Array<any>,
   *   n1Matches: Array<any>,
   *   n2Matches: Array<any>,
   *   filteredResults: Array<any>,
   *   stats: { activePlayerCount: number, totalUniqueGames: number, fullMatchCount: number, n1Count: number, n2Count: number, playedCount: number }
   * }>}
   */
  async computeOverlap(activeMembers) {
    if (!activeMembers || activeMembers.length === 0) {
      return {
        fullMatches: [],
        n1Matches: [],
        n2Matches: [],
        filteredResults: [],
        stats: { activePlayerCount: 0, totalUniqueGames: 0, fullMatchCount: 0, n1Count: 0, n2Count: 0, playedCount: 0 }
      };
    }

    const totalActive = activeMembers.length;
    const gameMap = new Map();

    // Aggregate games across all members
    activeMembers.forEach(member => {
      if (!member.games) return;
      member.games.forEach(game => {
        if (!gameMap.has(game.appId)) {
          gameMap.set(game.appId, {
            appId: game.appId,
            name: game.name,
            logo: game.logo,
            storeLink: game.storeLink,
            metadata: getGameMetadata(game.appId, game.name),
            owners: [],
            missingMembers: [],
            totalHours: 0
          });
        }

        const entry = gameMap.get(game.appId);
        entry.owners.push({
          id: member.id,
          name: member.personaName,
          avatarUrl: member.avatarUrl,
          hours: game.hoursOnRecord || 0
        });
        entry.totalHours += (game.hoursOnRecord || 0);
      });
    });

    // Determine missing members, played status and match ratio for each game
    const processedGames = [];

    for (const [appId, game] of gameMap.entries()) {
      const ownerIds = new Set(game.owners.map(o => o.id));
      const missing = activeMembers.filter(m => !ownerIds.has(m.id)).map(m => ({
        id: m.id,
        name: m.personaName,
        avatarUrl: m.avatarUrl
      }));

      game.missingMembers = missing;
      game.ownerCount = game.owners.length;
      game.matchPercentage = Math.round((game.ownerCount / totalActive) * 100);
      game.averageHours = game.ownerCount > 0 ? (game.totalHours / game.ownerCount).toFixed(1) : 0;
      game.partyCheck = checkPartySizeCompatibility(game.metadata, totalActive);
      game.storeDetails = null; // Enriched on-demand in UI
      game.isPlayed = this.playedGames.has(Number(appId));

      processedGames.push(game);
    }

    // Categorize
    const fullMatches = processedGames.filter(g => g.ownerCount === totalActive);
    const n1Matches = totalActive > 1 ? processedGames.filter(g => g.ownerCount === totalActive - 1) : [];
    const n2Matches = totalActive > 2 ? processedGames.filter(g => g.ownerCount === totalActive - 2) : [];
    const playedCount = processedGames.filter(g => g.isPlayed).length;

    // Filter according to current active filters
    let pool = [];
    if (this.filters.matchTier === 'all_100') {
      pool = [...fullMatches];
    } else if (this.filters.matchTier === 'all_with_n1' || this.filters.matchTier === 'n1_only') {
      pool = [...n1Matches];
    } else if (this.filters.matchTier === 'all_with_n2' || this.filters.matchTier === 'n2_only') {
      pool = [...n2Matches];
    } else {
      pool = processedGames.filter(g => g.ownerCount >= 1);
    }

    // Filter out played games if hidePlayed is active
    if (this.filters.hidePlayed) {
      pool = pool.filter(g => !g.isPlayed);
    }

    // Game Mode filter
    if (this.filters.gameMode !== 'all') {
      pool = pool.filter(g => g.metadata?.mode === this.filters.gameMode);
    }

    // Size Tier filter
    if (this.filters.sizeTier === 'small') {
      pool = pool.filter(g => g.metadata?.size === SIZE_TIERS.SMALL);
    }

    // Search query filter
    if (this.filters.searchQuery && this.filters.searchQuery.trim()) {
      const q = this.filters.searchQuery.toLowerCase().trim();
      pool = pool.filter(g => g.name.toLowerCase().includes(q));
    }

    // Sort results
    pool.sort((a, b) => {
      if (this.filters.sortBy === 'hours') {
        return b.totalHours - a.totalHours;
      }
      if (this.filters.sortBy === 'match') {
        if (b.ownerCount !== a.ownerCount) {
          return b.ownerCount - a.ownerCount;
        }
        return b.totalHours - a.totalHours;
      }
      if (this.filters.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (this.filters.sortBy === 'maxPlayers') {
        return (b.metadata?.maxPlayers || 0) - (a.metadata?.maxPlayers || 0);
      }
      return 0;
    });

    return {
      fullMatches,
      n1Matches,
      n2Matches,
      filteredResults: pool,
      stats: {
        activePlayerCount: totalActive,
        totalUniqueGames: processedGames.length,
        fullMatchCount: fullMatches.length,
        n1Count: n1Matches.length,
        n2Count: n2Matches.length,
        playedCount
      }
    };
  }
}
