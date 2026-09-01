/**
 * SteamSquad — Poll Generator & Exporter
 * 1-Click Discord and WhatsApp formatted poll creator for fast squad voting.
 */

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
      return '🎮 **SteamSquad**: Ortak oyun bulunamadı.';
    }

    const maxItems = options.limit || Math.min(games.length, 5);
    const selectedGames = games.slice(0, maxItems);

    let text = `🎮 **BU AKŞAM NE OYNUYORUZ?** (${squadSize} Kişi Aktif)\n\n`;

    selectedGames.forEach((game, index) => {
      const emoji = NUMBER_EMOJIS[index] || `🔹`;
      const modeLabel = game.metadata?.mode?.toUpperCase() || 'MULTI';
      const maxP = game.metadata?.maxPlayers ? `${game.metadata.maxPlayers} Kişilik` : 'Multiplayer';

      let statusBadge = '[HERKESTE VAR]';
      if (game.missingMembers && game.missingMembers.length > 0) {
        const missingNames = game.missingMembers.map(m => m.name).join(', ');
        if (game.storeDetails?.hasDiscount && game.storeDetails?.finalFormatted) {
          statusBadge = `[${missingNames} Hariç — %${game.storeDetails.discountPercent} İndirim: ${game.storeDetails.finalFormatted}]`;
        } else if (game.storeDetails?.isFree) {
          statusBadge = `[${missingNames} Hariç — Ücretsiz]`;
        } else {
          statusBadge = `[${missingNames} Hariç]`;
        }
      }

      text += `${emoji} **${game.name}** — ${statusBadge} (${modeLabel} / ${maxP})\n`;
    });

    text += `\n👇 *Lütfen oynamak istediğiniz seçeneğin reaksiyonuna/emojisine tıklayın!* 🕹️`;
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
      return '🎮 *SteamSquad*: Ortak oyun bulunamadı.';
    }

    const maxItems = options.limit || Math.min(games.length, 5);
    const selectedGames = games.slice(0, maxItems);

    let text = `🎮 *BU AKŞAM NE OYNUYORUZ?* (${squadSize} Kişi Aktif)\n\n`;

    selectedGames.forEach((game, index) => {
      const emoji = NUMBER_EMOJIS[index] || `🔹`;
      const modeLabel = game.metadata?.mode?.toUpperCase() || 'MULTI';
      const maxP = game.metadata?.maxPlayers ? `${game.metadata.maxPlayers} Kişilik` : 'Multiplayer';

      let statusBadge = '[Hepimizde Var]';
      if (game.missingMembers && game.missingMembers.length > 0) {
        const missingNames = game.missingMembers.map(m => m.name).join(', ');
        if (game.storeDetails?.hasDiscount && game.storeDetails?.finalFormatted) {
          statusBadge = `[${missingNames} Hariç — %${game.storeDetails.discountPercent} İndirim: ${game.storeDetails.finalFormatted}]`;
        } else if (game.storeDetails?.isFree) {
          statusBadge = `[${missingNames} Hariç — Ücretsiz]`;
        } else {
          statusBadge = `[${missingNames} Hariç]`;
        }
      }

      text += `${emoji} *${game.name}* — ${statusBadge} (${modeLabel} / ${maxP})\n`;
    });

    text += `\n👇 *Grupta oy vermek için seçtiğiniz numaranın emojisini veya cevabını gönderin!* 🎯`;
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
