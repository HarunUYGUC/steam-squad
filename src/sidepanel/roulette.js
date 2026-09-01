/**
 * SteamSquad — Roulette & Veto Arena Engine
 * Interactive Canvas wheel, Web Audio API sound effects, and Turn-based Veto elimination mode.
 */

// Procedural Web Audio Sound Synthesizer (no external audio files needed)
class SoundFx {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensureContext() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTick() {
    if (this.muted) return;
    try {
      this.ensureContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {}
  }

  playVeto() {
    if (this.muted) return;
    try {
      this.ensureContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    } catch {}
  }

  playFanfare() {
    if (this.muted) return;
    try {
      this.ensureContext();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.1);

        gain.gain.setValueAtTime(0.25, this.ctx.currentTime + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + i * 0.1 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + i * 0.1);
        osc.stop(this.ctx.currentTime + i * 0.1 + 0.3);
      });
    } catch {}
  }
}

export class RouletteEngine {
  constructor(canvasElement, onWinnerSelected) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
    this.onWinnerSelected = onWinnerSelected;
    this.soundFx = new SoundFx();

    this.games = [];
    this.currentRotation = 0; // in radians
    this.isSpinning = false;
    this.lastTickSegment = -1;

    this.colors = [
      '#1b2838', '#2a475e', '#1e3852', '#214b6b',
      '#172330', '#253d52', '#142231', '#2f4f6b'
    ];

    if (this.canvas) {
      this.resize();
      this.draw();
    }
  }

  resize() {
    if (!this.canvas || !this.ctx) return;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : 280;
    const height = rect.height > 0 ? rect.height : 280;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = Math.round(width * dpr);
    this.canvas.height = Math.round(height * dpr);
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  }

  setGames(games) {
    this.games = games && games.length > 0 ? games.slice(0, 36) : [];
    this.resize();
    this.draw();
  }

  draw() {
    if (!this.canvas || !this.ctx) return;
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : 280;
    const height = rect.height > 0 ? rect.height : 280;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.max(10, Math.min(centerX, centerY) - 10);

    this.ctx.clearRect(0, 0, width, height);

    if (this.games.length === 0) {
      // Empty state wheel
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      this.ctx.fillStyle = '#171a21';
      this.ctx.fill();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = '#2a475e';
      this.ctx.stroke();

      this.ctx.fillStyle = '#8f98a0';
      this.ctx.font = '13px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('Oyun Seçilmedi', centerX, centerY);
      this.ctx.restore();
      return;
    }

    const sliceAngle = (2 * Math.PI) / this.games.length;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(this.currentRotation);

    // Draw slices
    this.games.forEach((game, index) => {
      const angle = index * sliceAngle;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0);
      this.ctx.arc(0, 0, radius, angle, angle + sliceAngle);
      this.ctx.closePath();

      this.ctx.fillStyle = this.colors[index % this.colors.length];
      this.ctx.fill();
      this.ctx.lineWidth = 1.5;
      this.ctx.strokeStyle = '#66c0f4';
      this.ctx.stroke();

      // Draw game text
      this.ctx.save();
      this.ctx.rotate(angle + sliceAngle / 2);
      this.ctx.textAlign = 'right';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 11px sans-serif';

      let title = game.name;
      if (title.length > 15) {
        title = title.substring(0, 13) + '...';
      }
      this.ctx.fillText(title, radius - 15, 0);
      this.ctx.restore();
    });

    this.ctx.restore();

    // Center pin circle
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 18, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#66c0f4';
    this.ctx.fill();
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();

    this.ctx.fillStyle = '#171a21';
    this.ctx.font = 'bold 11px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('🎮', centerX, centerY);
    this.ctx.restore();

    // Top indicator arrow (pointing down at 12 o'clock)
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(centerX - 10, 2);
    this.ctx.lineTo(centerX + 10, 2);
    this.ctx.lineTo(centerX, 20);
    this.ctx.closePath();
    this.ctx.fillStyle = '#ff4d4d';
    this.ctx.fill();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();
    this.ctx.restore();
  }

  spin() {
    if (this.isSpinning || this.games.length === 0) return;

    this.isSpinning = true;
    const spinDuration = 4000 + Math.random() * 2000; // 4 to 6 seconds
    const totalSlices = this.games.length;
    const sliceAngle = (2 * Math.PI) / totalSlices;

    // Pick random target slice
    const targetSliceIndex = Math.floor(Math.random() * totalSlices);
    const extraFullRotations = 6 + Math.floor(Math.random() * 4); // 6-9 full turns

    // Top arrow is at angle -PI/2 (12 o'clock).
    // Target slice middle should align with -PI/2:
    const targetSliceAngle = targetSliceIndex * sliceAngle + sliceAngle / 2;
    const targetAngle = (extraFullRotations * 2 * Math.PI) + ((3 * Math.PI / 2) - targetSliceAngle);

    const startRotation = this.currentRotation % (2 * Math.PI);
    const deltaAngle = targetAngle - startRotation;
    const startTime = performance.now();

    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);

      // Ease-out cubic function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      this.currentRotation = startRotation + deltaAngle * easeOut;

      // Tick sound check
      const normalizedRot = (this.currentRotation % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const currentSegment = Math.floor(normalizedRot / sliceAngle);
      if (currentSegment !== this.lastTickSegment) {
        this.soundFx.playTick();
        this.lastTickSegment = currentSegment;
      }

      this.draw();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        this.soundFx.playFanfare();
        const winner = this.games[targetSliceIndex];
        if (this.onWinnerSelected) {
          this.onWinnerSelected(winner);
        }
      }
    };

    requestAnimationFrame(animate);
  }
}

/**
 * Turn-based Veto Arena Engine
 */
export class VetoArenaEngine {
  constructor(activeMembers, games, onStateChange, onWinnerFound) {
    this.members = activeMembers || [];
    this.remainingGames = games ? [...games] : [];
    this.eliminatedGames = [];
    this.currentTurnIndex = 0;
    this.soundFx = new SoundFx();
    this.onStateChange = onStateChange;
    this.onWinnerFound = onWinnerFound;
  }

  getCurrentPlayer() {
    if (this.members.length === 0) return null;
    return this.members[this.currentTurnIndex % this.members.length];
  }

  vetoGame(appId) {
    if (this.remainingGames.length <= 1) return;

    const gameIndex = this.remainingGames.findIndex(g => g.appId === appId);
    if (gameIndex === -1) return;

    const vetoedGame = this.remainingGames.splice(gameIndex, 1)[0];
    const player = this.getCurrentPlayer();

    this.eliminatedGames.push({
      game: vetoedGame,
      eliminatedBy: player ? player.personaName : 'Bilinmeyen'
    });

    this.soundFx.playVeto();
    this.currentTurnIndex++;

    if (this.remainingGames.length === 1) {
      this.soundFx.playFanfare();
      if (this.onWinnerFound) {
        this.onWinnerFound(this.remainingGames[0]);
      }
    }

    if (this.onStateChange) {
      this.onStateChange(this);
    }
  }

  reset(games, activeMembers) {
    this.members = activeMembers || this.members;
    this.remainingGames = games ? [...games] : [];
    this.eliminatedGames = [];
    this.currentTurnIndex = 0;
    if (this.onStateChange) {
      this.onStateChange(this);
    }
  }
}
