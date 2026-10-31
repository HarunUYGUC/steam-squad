/**
 * SteamSquad — Poll Generator & Exporter
 * 1-Click Discord and WhatsApp formatted poll creator for fast squad voting.
 */

import { i18n } from '../services/i18n.js';
import { dealsService } from '../services/deals-service.js';

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

      let dealMasked = '';
      if (game.dealUrl && !game.storeDetails?.isFree && game.missingMembers && game.missingMembers.length > 0) {
        const maskLabel = i18n.t('pollDiscordDealMask');
        dealMasked = ` ([${maskLabel}](${game.dealUrl}))`;
      }

      text += `${emoji} **${game.name}** — ${statusBadge}${dealMasked} (${modeLabel} / ${maxP})\n`;
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
    });

    // Append clean footer block for discounted missing games in WhatsApp
    const dealGames = selectedGames.filter(g => g.dealUrl && !g.storeDetails?.isFree && g.missingMembers?.length > 0);
    if (dealGames.length > 0) {
      text += `\n${i18n.t('pollWhatsappDealsHeader')}\n`;
      dealGames.forEach(g => {
        const priceInfo = g.storeDetails?.finalFormatted ? ` (${g.storeDetails.finalFormatted})` : '';
        text += `• ${g.name}${priceInfo}: ${g.dealUrl}\n`;
      });
    }

    text += `\n${i18n.t('pollWhatsappFooter')}`;
    return text;
  }

  /**
   * Generates a rich Discord / WhatsApp share message for a winning game (Wheel or Veto)
   * Enriches with discount, missing players, and Humble Partner affiliate link.
   * @param {object} game - Winning game object
   * @param {'roulette'|'veto'} source - Game decision origin
   * @returns {string}
   */
  static generateWinnerShareText(game, source = 'roulette') {
    if (!game) return '';

    const mode = game.metadata?.mode?.toUpperCase() || 'COOP';
    const isSolo = game.metadata?.mode === 'solo' || game.metadata?.maxPlayers === 1;
    const players = isSolo
      ? i18n.t('tagSoloCapacity')
      : (game.metadata?.maxPlayers ? i18n.t('tagMultiCapacity', { count: game.metadata.maxPlayers }) : i18n.t('tagMultiplayerGeneral'));

    const header = source === 'veto'
      ? i18n.t('winnerShareVetoHeader')
      : i18n.t('winnerShareWheelHeader');

    const lines = [
      header,
      i18n.t('winnerShareGameLine', { name: game.name }),
      i18n.t('winnerShareModeLine', { mode, players })
    ];

    const hasMissing = game.missingMembers && game.missingMembers.length > 0;
    const hasDiscount = Boolean(game.storeDetails?.hasDiscount || game.dealInfo?.hasDeal);
    const dealPrice = game.dealInfo?.price || (game.storeDetails?.finalFormatted || '');
    const discountPercent = game.dealInfo?.savingsPercent || (game.storeDetails?.discountPercent || 0);

    if (hasMissing) {
      const missingNames = game.missingMembers.map(m => m.name || m.personaName).join(', ');
      if (hasDiscount && discountPercent > 0) {
        lines.push(i18n.t('winnerShareMissingWithDiscount', { names: missingNames, discount: discountPercent, price: dealPrice }));
      } else {
        lines.push(i18n.t('winnerShareMissing', { names: missingNames }));
      }
    } else if (hasDiscount && discountPercent > 0) {
      lines.push(i18n.t('winnerShareDiscountActive', { discount: discountPercent, price: dealPrice }));
    }

    // Attach Humble Store affiliate link if missing players or active discount
    if ((hasMissing || hasDiscount) && !game.storeDetails?.isFree) {
      const humbleUrl = game.dealUrl || dealsService.getHumbleSearchUrl(game.name);
      if (humbleUrl) {
        lines.push(i18n.t('winnerShareHumbleLink', { url: humbleUrl }));
      }
    }

    // Direct Steam store link
    lines.push(i18n.t('winnerShareSteamLink', { link: `https://store.steampowered.com/app/${game.appId}` }));

    return lines.join('\n');
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
