/**
 * SteamSquad — Poll Generator & Exporter
 * 1-Click Discord and WhatsApp formatted poll creator for fast squad voting.
 */

import { i18n } from '../services/i18n.js';

const NUMBER_EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

export class PollGenerator {
  /**
   * Generates Discord markdown formatted poll string
   * @param {Array} games - List of matched games (top 3 to 10)
   * @param {number} squadSize - Active player count
   * @param {object} options - Customization options
   * @returns {string}
   */
  static generateDiscordPoll(games, squadSize, options = {}) {
    if (!games || games.length === 0) {
      return i18n.t('pollNoGames');
    }

    const maxItems = options.limit || Math.min(games.length, 5);
    const selectedGames = games.slice(0, maxItems);

    let text = `${i18n.t('pollDiscordHeader', { squadSize })}\n\n`;

    selectedGames.forEach((game, index) => {
      const emoji = NUMBER_EMOJIS[index] || `🔹`;
      const modeLabel = game.metadata?.mode?.toUpperCase() || 'MULTI';
      const isSolo = game.metadata?.mode === 'solo' || game.metadata?.maxPlayers === 1;
      const maxP = isSolo
        ? i18n.t('tagSoloCapacity')
        : (game.metadata?.maxPlayers ? i18n.t('tagMultiCapacity', { count: game.metadata.maxPlayers }) : i18n.t('tagMultiplayerGeneral'));

      let statusBadge = i18n.t('pollAllOwnBadge');
      if (game.missingMembers && game.missingMembers.length > 0) {
        const missingNames = game.missingMembers.map(m => m.name).join(', ');
        const activeCountry = i18n.getLanguage() === 'en' ? 'us' : 'tr';
        const storeDetails = (game.storeDetails && (!game.storeDetails.countryCode || game.storeDetails.countryCode === activeCountry))
          ? game.storeDetails
          : null;

        if (storeDetails?.hasDiscount && storeDetails?.finalFormatted) {
          statusBadge = i18n.t('pollMissingDiscountBadge', {
            names: missingNames,
            discount: storeDetails.discountPercent,
            price: storeDetails.finalFormatted
          });
        } else if (storeDetails?.isFree) {
          statusBadge = i18n.t('pollMissingFreeBadge', { names: missingNames });
        } else {
          statusBadge = i18n.t('pollMissingBadge', { names: missingNames });
        }
      }

      text += `${emoji} **${game.name}** — ${statusBadge} (${modeLabel} / ${maxP})\n`;
      if (game.dealUrl && !game.storeDetails?.isFree && game.missingMembers && game.missingMembers.length > 0) {
        const missingNames = game.missingMembers.map(m => m.name).join(', ');
        text += i18n.t('pollDealAnnex', { names: missingNames, url: game.dealUrl });
      }
    });

    text += `\n${i18n.t('pollDiscordFooter')}`;
    return text;
  }

  /**
   * Generates WhatsApp formatted poll string
   * @param {Array} games - List of matched games
   * @param {number} squadSize - Active player count
   * @param {object} options - Customization options
   * @returns {string}
   */
  static generateWhatsAppPoll(games, squadSize, options = {}) {
    if (!games || games.length === 0) {
      return i18n.t('pollNoGamesWhatsapp');
    }

    const maxItems = options.limit || Math.min(games.length, 5);
    const selectedGames = games.slice(0, maxItems);

    let text = `${i18n.t('pollWhatsappHeader', { squadSize })}\n\n`;

    selectedGames.forEach((game, index) => {
      const emoji = NUMBER_EMOJIS[index] || `🔹`;
      const modeLabel = game.metadata?.mode?.toUpperCase() || 'MULTI';
      const isSolo = game.metadata?.mode === 'solo' || game.metadata?.maxPlayers === 1;
      const maxP = isSolo
        ? i18n.t('tagSoloCapacity')
        : (game.metadata?.maxPlayers ? i18n.t('tagMultiCapacity', { count: game.metadata.maxPlayers }) : i18n.t('tagMultiplayerGeneral'));

      let statusBadge = i18n.t('pollWhatsappAllOwnBadge');
      if (game.missingMembers && game.missingMembers.length > 0) {
        const missingNames = game.missingMembers.map(m => m.name).join(', ');
        const activeCountry = i18n.getLanguage() === 'en' ? 'us' : 'tr';
        const storeDetails = (game.storeDetails && (!game.storeDetails.countryCode || game.storeDetails.countryCode === activeCountry))
          ? game.storeDetails
          : null;

        if (storeDetails?.hasDiscount && storeDetails?.finalFormatted) {
          statusBadge = i18n.t('pollMissingDiscountBadge', {
            names: missingNames,
            discount: storeDetails.discountPercent,
            price: storeDetails.finalFormatted
          });
        } else if (storeDetails?.isFree) {
          statusBadge = i18n.t('pollMissingFreeBadge', { names: missingNames });
        } else {
          statusBadge = i18n.t('pollMissingBadge', { names: missingNames });
        }
      }

      text += `${emoji} *${game.name}* — ${statusBadge} (${modeLabel} / ${maxP})\n`;
      if (game.dealUrl && !game.storeDetails?.isFree && game.missingMembers && game.missingMembers.length > 0) {
        const missingNames = game.missingMembers.map(m => m.name).join(', ');
        text += i18n.t('pollDealAnnex', { names: missingNames, url: game.dealUrl });
      }
    });

    text += `\n${i18n.t('pollWhatsappFooter')}`;
    return text;
  }

  /**
   * Copies text to clipboard and returns success status
   * @param {string} text 
   * @returns {Promise<boolean>}
   */
  static async copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch (err) {
      console.error('[SteamSquad] Copy failed:', err);
      return false;
    }
  }
}
