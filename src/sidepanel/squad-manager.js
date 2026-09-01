/**
 * SteamSquad — Squad Manager
 * Manages squad members, team presets (Tüm Ekip / custom teams), active selection toggles, and storage persistence.
 */

import { fetchSteamLibrary } from '../services/steam-service.js';
import { getGameMetadata } from '../services/game-metadata.js';

const STORAGE_KEYS = {
  SQUAD_MEMBERS: 'steamsquad_members',
  SQUAD_TEAMS: 'steamsquad_teams',
  ACTIVE_TEAM_ID: 'steamsquad_active_team_id'
};

const DEFAULT_ALL_TEAM = {
  id: 'team_all',
  name: '👥 Tüm Ekip',
  isDefault: true,
  memberIds: null // null indicates all members are active
};

export class SquadManager {
  constructor() {
    this.members = [];
    this.teams = [DEFAULT_ALL_TEAM];
    this.activeTeamId = 'team_all';
    this.onStateChangeCallbacks = [];
  }

  /**
   * Register a listener for state changes
   * @param {Function} callback 
   */
  subscribe(callback) {
    if (typeof callback === 'function') {
      this.onStateChangeCallbacks.push(callback);
    }
  }

  notifyStateChange() {
    this.onStateChangeCallbacks.forEach(cb => cb(this));
  }

  /**
   * Load squad state and teams from chrome.storage.local
   */
  async init() {
    try {
      const data = await chrome.storage.local.get([
        STORAGE_KEYS.SQUAD_MEMBERS,
        STORAGE_KEYS.SQUAD_TEAMS,
        STORAGE_KEYS.ACTIVE_TEAM_ID
      ]);

      if (Array.isArray(data[STORAGE_KEYS.SQUAD_MEMBERS])) {
        this.members = data[STORAGE_KEYS.SQUAD_MEMBERS];
      }

      if (Array.isArray(data[STORAGE_KEYS.SQUAD_TEAMS]) && data[STORAGE_KEYS.SQUAD_TEAMS].length > 0) {
        this.teams = data[STORAGE_KEYS.SQUAD_TEAMS];
        // Ensure team_all is always present as first team
        if (!this.teams.find(t => t.id === 'team_all')) {
          this.teams.unshift(DEFAULT_ALL_TEAM);
        }
      } else {
        this.teams = [DEFAULT_ALL_TEAM];
        await this.persistTeams();
      }

      if (data[STORAGE_KEYS.ACTIVE_TEAM_ID] && this.teams.some(t => t.id === data[STORAGE_KEYS.ACTIVE_TEAM_ID])) {
        this.activeTeamId = data[STORAGE_KEYS.ACTIVE_TEAM_ID];
      } else {
        this.activeTeamId = 'team_all';
      }

      // Apply active selection for current team
      this.applyTeamSelection(this.activeTeamId, false);

    } catch (err) {
      console.error('[SteamSquad] Storage initialization error:', err);
    }

    this.notifyStateChange();
  }

  /**
   * Persist current members to storage
   */
  async persistMembers() {
    try {
      await chrome.storage.local.set({
        [STORAGE_KEYS.SQUAD_MEMBERS]: this.members
      });
    } catch (err) {
      console.error('[SteamSquad] Failed to save members:', err);
    }
  }

  /**
   * Persist teams to storage
   */
  async persistTeams() {
    try {
      await chrome.storage.local.set({
        [STORAGE_KEYS.SQUAD_TEAMS]: this.teams,
        [STORAGE_KEYS.ACTIVE_TEAM_ID]: this.activeTeamId
      });
    } catch (err) {
      console.error('[SteamSquad] Failed to save teams:', err);
    }
  }

  /**
   * Select an active team and update member active states
   * @param {string} teamId 
   * @param {boolean} notify 
   */
  async applyTeamSelection(teamId, notify = true) {
    const team = this.teams.find(t => t.id === teamId);
    if (!team) return;

    this.activeTeamId = teamId;

    if (team.id === 'team_all' || team.memberIds === null) {
      // In "Tüm Ekip", everyone is active by default
      this.members.forEach(m => { m.active = true; });
    } else {
      // In custom team, only selected members are active
      const selectedSet = new Set(team.memberIds || []);
      this.members.forEach(m => {
        m.active = selectedSet.has(m.id);
      });
    }

    await this.persistMembers();
    await this.persistTeams();

    if (notify) {
      this.notifyStateChange();
    }
  }

  /**
   * Create a new team
   * @param {string} teamName 
   */
  async createTeam(teamName) {
    if (!teamName || !teamName.trim()) {
      return { success: false, message: 'Lütfen ekip için bir isim girin.' };
    }

    const newTeam = {
      id: `team_${Date.now()}`,
      name: teamName.trim(),
      isDefault: false,
      memberIds: [], // Initially empty: all checkboxes will come unchecked!
      createdAt: Date.now()
    };

    this.teams.push(newTeam);
    this.activeTeamId = newTeam.id;

    // Set all members inactive so user can check which ones belong to this new team
    this.members.forEach(m => { m.active = false; });

    await this.persistTeams();
    await this.persistMembers();
    this.notifyStateChange();

    return {
      success: true,
      message: `"${teamName}" ekibi oluşturuldu! Dahil etmek istediğiniz oyuncuları işaretleyin.`,
      team: newTeam
    };
  }

  /**
   * Delete a team
   * @param {string} teamId 
   */
  async deleteTeam(teamId) {
    if (teamId === 'team_all') {
      return { success: false, message: '"Tüm Ekip" ana ekibi silinemez.' };
    }

    const team = this.teams.find(t => t.id === teamId);
    const teamName = team ? team.name : 'Ekip';

    this.teams = this.teams.filter(t => t.id !== teamId);

    if (this.activeTeamId === teamId) {
      await this.applyTeamSelection('team_all', true);
    } else {
      await this.persistTeams();
      this.notifyStateChange();
    }

    return { success: true, message: `"${teamName}" silindi.` };
  }

  /**
   * Toggle active playing status for a member
   * @param {string} memberId 
   */
  async toggleMemberActive(memberId) {
    const member = this.members.find(m => m.id === memberId);
    if (!member) return;

    member.active = !member.active;

    // If currently on a custom team, sync memberIds for that team!
    if (this.activeTeamId !== 'team_all') {
      const currentTeam = this.teams.find(t => t.id === this.activeTeamId);
      if (currentTeam) {
        if (!Array.isArray(currentTeam.memberIds)) {
          currentTeam.memberIds = [];
        }
        if (member.active) {
          if (!currentTeam.memberIds.includes(memberId)) {
            currentTeam.memberIds.push(memberId);
          }
        } else {
          currentTeam.memberIds = currentTeam.memberIds.filter(id => id !== memberId);
        }
        await this.persistTeams();
      }
    }

    await this.persistMembers();
    this.notifyStateChange();
  }

  /**
   * Add a new member by Steam URL, Vanity Name, or SteamID64
   * @param {string} input 
   * @returns {Promise<{ success: boolean, message?: string, member?: object }>}
   */
  async addMember(input) {
    if (!input || !input.trim()) {
      return { success: false, message: 'Lütfen bir Steam profil linki veya kullanıcı adı girin.' };
    }

    if (this.members.length >= 10) {
      return { success: false, message: 'Bir kadroya en fazla 10 oyuncu ekleyebilirsiniz.' };
    }

    const fetchResult = await fetchSteamLibrary(input);
    if (!fetchResult.success) {
      return { success: false, message: fetchResult.error || 'Profil bilgisi alınamadı.' };
    }

    const memberId = fetchResult.steamId64 || input.trim();

    // Check duplicate
    const existingIndex = this.members.findIndex(m => m.id === memberId || m.input?.toLowerCase() === input.trim().toLowerCase());
    if (existingIndex >= 0) {
      // Update existing
      this.members[existingIndex] = {
        ...this.members[existingIndex],
        personaName: fetchResult.personaName,
        avatarUrl: fetchResult.avatarUrl,
        profileUrl: fetchResult.profileUrl,
        games: fetchResult.games,
        isPrivate: fetchResult.isPrivate || false,
        lastUpdated: Date.now()
      };
      await this.persistMembers();
      this.notifyStateChange();
      return {
        success: true,
        message: `${fetchResult.personaName} kütüphanesi güncellendi.`,
        member: this.members[existingIndex]
      };
    }

    // Determine initial active state based on active team
    const isActive = this.activeTeamId === 'team_all';

    const newMember = {
      id: memberId,
      input: input.trim(),
      personaName: fetchResult.personaName,
      avatarUrl: fetchResult.avatarUrl,
      profileUrl: fetchResult.profileUrl,
      games: fetchResult.games || [],
      isPrivate: fetchResult.isPrivate || false,
      active: isActive,
      lastUpdated: Date.now()
    };

    this.members.push(newMember);

    // If a custom team is active and we want it unchecked, it's already isActive=false
    await this.persistMembers();
    this.notifyStateChange();

    const gameCount = newMember.games.length;
    const msg = gameCount > 0 
      ? `${fetchResult.personaName} (${gameCount} oyun) kadroya eklendi!` 
      : `${fetchResult.personaName} eklendi (Oyun detayları gizli ayarlanmış).`;

    return {
      success: true,
      message: msg,
      member: newMember
    };
  }

  /**
   * Remove member from squad
   * @param {string} memberId 
   */
  async removeMember(memberId) {
    this.members = this.members.filter(m => m.id !== memberId);
    // Remove from all teams
    this.teams.forEach(t => {
      if (Array.isArray(t.memberIds)) {
        t.memberIds = t.memberIds.filter(id => id !== memberId);
      }
    });
    await this.persistMembers();
    await this.persistTeams();
    this.notifyStateChange();
  }

  /**
   * Refresh a single member's library from Steam
   * @param {string} memberId 
   */
  async refreshMember(memberId) {
    const member = this.members.find(m => m.id === memberId);
    if (!member) return { success: false, message: 'Oyuncu bulunamadı.' };

    const result = await fetchSteamLibrary(member.input || member.id);
    if (!result.success) {
      return { success: false, message: result.error };
    }

    member.personaName = result.personaName;
    member.avatarUrl = result.avatarUrl;
    member.games = result.games;
    member.isPrivate = result.isPrivate || false;
    member.lastUpdated = Date.now();

    await this.persistMembers();
    this.notifyStateChange();

    return { success: true, message: `${member.personaName} kütüphanesi yenilendi!` };
  }

  /**
   * Clear all members
   */
  async clearAllMembers() {
    this.members = [];
    this.teams = [DEFAULT_ALL_TEAM];
    this.activeTeamId = 'team_all';
    await this.persistMembers();
    await this.persistTeams();
    this.notifyStateChange();
  }

  /**
   * Get list of currently active members
   * @returns {Array}
   */
  getActiveMembers() {
    return this.members.filter(m => m.active);
  }
}
