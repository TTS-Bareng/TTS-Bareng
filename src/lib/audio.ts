// Procedural Sound Effects using Web Audio API (Apple iOS Tactile Sound Design)

class SoundManager {
  private ctx: AudioContext | null = null;
  private isWarmedUp = false;

  constructor() {
    this.setupWarmupListeners();
  }

  private setupWarmupListeners() {
    if (typeof window === 'undefined') return;

    const unlock = () => {
      if (!this.isWarmedUp) {
        this.getContext();
        this.isWarmedUp = true;
      }
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };

    window.addEventListener('pointerdown', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true, passive: true });
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Warm, soft acoustic click on keystroke (iOS Keyboard feel)
   */
  playKeyClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Warm low-pass filter to keep it subtle and organic
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, ctx.currentTime);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(380, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.035);
    } catch {
      // Audio might fail if user has not interacted yet
    }
  }

  /**
   * Micro tick when focusing or moving across cells
   */
  playFocusTick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, ctx.currentTime);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.015);

      gain.gain.setValueAtTime(0.025, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.015);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.02);
    } catch {
      // Ignore
    }
  }

  /**
   * Pleasant ascending major chime when a word is verified correct (Escalates on combo streak)
   */
  playWordCorrect(comboStreak: number = 1) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      // Base C-major triad, or escalating rich arpeggio on combo streak
      const notes =
        comboStreak >= 3
          ? [523.25, 659.25, 783.99, 1046.5, 1318.5] // C5, E5, G5, C6, E6
          : comboStreak === 2
          ? [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
          : [523.25, 659.25, 783.99]; // C5, E5, G5

      const noteDuration = comboStreak >= 2 ? 0.055 : 0.07;
      const baseGain = comboStreak >= 3 ? 0.12 : comboStreak === 2 ? 0.11 : 0.09;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * noteDuration);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * noteDuration);
        gain.gain.linearRampToValueAtTime(baseGain, ctx.currentTime + idx * noteDuration + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * noteDuration + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * noteDuration);
        osc.stop(ctx.currentTime + idx * noteDuration + 0.3);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Gentle, soft acoustic thud on wrong check (warm low-end without harsh buzz)
   */
  playWordWrong() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, ctx.currentTime);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.16);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Ignore
    }
  }

  /**
   * Sparkle sound when hint is used
   */
  playHint() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [659.25, 880, 1046.5, 1318.5]; // E5, A5, C6, E6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.18);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.2);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Double-ping chime when claiming rewards or stars
   */
  playReward() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [783.99, 1046.5]; // G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);

        gain.gain.setValueAtTime(0.09, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.24);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.26);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Grand victory fanfare on level completion
   */
  playVictory() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, E6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.5);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Subtle, tense procedural heartbeat thump for Daily Rush final countdown (< 10s)
   */
  playHeartbeat() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      // Two soft low-frequency pulses (lub-dub)
      const times = [0, 0.12];
      times.forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, ctx.currentTime + offset);

        osc.type = 'sine';
        const startFreq = idx === 0 ? 65 : 55;
        osc.frequency.setValueAtTime(startFreq, ctx.currentTime + offset);
        osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + offset + 0.09);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + offset);
        gain.gain.linearRampToValueAtTime(idx === 0 ? 0.14 : 0.1, ctx.currentTime + offset + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + offset + 0.1);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.11);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundManager();
