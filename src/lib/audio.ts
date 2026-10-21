// Procedural Sound Effects using Web Audio API (Next-Gen Apple & Console Game Audio Design)

class SoundManager {
  private ctx: AudioContext | null = null;
  private isWarmedUp = false;
  private clickNoiseBuffer: AudioBuffer | null = null;

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

    // Auto-resume AudioContext on mobile when returning from background or unlocking phone
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    });

    window.addEventListener('focus', () => {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    });
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.generateNoiseBuffers(this.ctx);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Pre-generates high-density pink noise buffer for ultra-realistic physical key click transients
   */
  private generateNoiseBuffers(ctx: AudioContext) {
    try {
      const bufferSize = ctx.sampleRate * 0.05; // 50ms buffer
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2 + white * 0.1) * 0.5;
      }
      this.clickNoiseBuffer = buffer;
    } catch {
      // Fallback without noise buffer
    }
  }

  /**
   * Next-Gen Tactile Dual-Layer Keystroke (iOS Taptic & Mechanical Key Feel)
   * Layer 1: Crisp high-frequency bandpass click transient (3800Hz, 6ms)
   * Layer 2: Warm acoustic body resonance with ±2.5% pitch humanizer to avoid robotic monotony
   */
  playKeyClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Humanizer: micro-pitch variation prevents repetitive machine-gun fatigue
      const pitchJitter = 1 + (Math.random() - 0.5) * 0.05;

      // 1. Transient click layer (tactile snap)
      if (this.clickNoiseBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = this.clickNoiseBuffer;

        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(3600 * pitchJitter, now);
        noiseFilter.Q.setValueAtTime(3.2, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.08, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + 0.015);
      }

      // 2. Resonant acoustic body layer (warm wooden switch thud)
      const bodyOsc = ctx.createOscillator();
      const bodyGain = ctx.createGain();
      const bodyFilter = ctx.createBiquadFilter();

      bodyFilter.type = 'lowpass';
      bodyFilter.frequency.setValueAtTime(750, now);

      bodyOsc.type = 'triangle';
      bodyOsc.frequency.setValueAtTime(320 * pitchJitter, now);
      bodyOsc.frequency.exponentialRampToValueAtTime(140 * pitchJitter, now + 0.025);

      bodyGain.gain.setValueAtTime(0.045, now);
      bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.026);

      bodyOsc.connect(bodyFilter);
      bodyFilter.connect(bodyGain);
      bodyGain.connect(ctx.destination);

      bodyOsc.start(now);
      bodyOsc.stop(now + 0.028);
    } catch {
      // Audio might fail if user has not interacted yet
    }
  }

  /**
   * Apple-style micro tick when navigating cells or scrolling items
   */
  playFocusTick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.Q.setValueAtTime(2.5, now);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.01);

      gain.gain.setValueAtTime(0.028, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.014);
    } catch {
      // Ignore
    }
  }

  /**
   * Lush Marimba & Celeste harmonic chiming when a word is verified correct.
   * Escalates with richer multi-harmonic chords on combo streak.
   */
  playWordCorrect(comboStreak: number = 1) {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Chord voicings: C-major9 variations that feel uplifting, warm, and musical
      let notes: number[];
      if (comboStreak >= 4) {
        notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]; // C5, E5, G5, C6, E6, G6 (Grand Cascade)
      } else if (comboStreak === 3) {
        notes = [523.25, 783.99, 987.77, 1174.66, 1318.5]; // C5, G5, B5, D6, E6 (Sparkling 9th)
      } else if (comboStreak === 2) {
        notes = [523.25, 659.25, 783.99, 987.77, 1046.5]; // C5, E5, G5, B5, C6 (Major 7th)
      } else {
        notes = [523.25, 783.99, 1046.5]; // C5, G5, C6 (Pure Triad)
      }

      const stagger = 0.045;
      const decayTime = comboStreak >= 3 ? 0.38 : 0.32;

      notes.forEach((freq, idx) => {
        const noteStart = now + idx * stagger;

        // 1. Fundamental tone (warm marimba bell)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();

        osc1.type = 'sine';
        // Tiny frequency dip on strike emulates physical marimba bar mallet impact
        osc1.frequency.setValueAtTime(freq * 1.015, noteStart);
        osc1.frequency.exponentialRampToValueAtTime(freq, noteStart + 0.015);

        gain1.gain.setValueAtTime(0.001, noteStart);
        gain1.gain.linearRampToValueAtTime(0.085, noteStart + 0.008);
        gain1.gain.exponentialRampToValueAtTime(0.001, noteStart + decayTime);

        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(noteStart);
        osc1.stop(noteStart + decayTime + 0.02);

        // 2. Harmonic overtone (2nd harmonic octave for crystalline presence)
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(freq * 2, noteStart);

        gain2.gain.setValueAtTime(0.001, noteStart);
        gain2.gain.linearRampToValueAtTime(0.025, noteStart + 0.006);
        gain2.gain.exponentialRampToValueAtTime(0.001, noteStart + decayTime * 0.55);

        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(noteStart);
        osc2.stop(noteStart + decayTime * 0.6);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Apple-style Soft Acoustic Double-Tap for wrong answer / invalid submission.
   * Elegant, polite, non-punishing damped woodblock sound (Eb4 -> Bb3).
   */
  playWordWrong() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const taps = [
        { freq: 311.13, delay: 0, gain: 0.07 },      // Eb4
        { freq: 233.08, delay: 0.055, gain: 0.055 }, // Bb3
      ];

      taps.forEach(({ freq, delay, gain: targetGain }) => {
        const tapTime = now + delay;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, tapTime);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, tapTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.85, tapTime + 0.06);

        gain.gain.setValueAtTime(0.001, tapTime);
        gain.gain.linearRampToValueAtTime(targetGain, tapTime + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.001, tapTime + 0.07);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(tapTime);
        osc.stop(tapTime + 0.08);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Grand 3-Phase Cinematic Celebration Fanfare for TTS Level Completion.
   * Phase 1: Rising Celebration Celeste Sweep (0.0s - 0.35s)
   * Phase 2: Warm Polyphonic Major 9th Chord Bloom (0.35s - 1.2s)
   * Phase 3: Shimmering Gold Dust Confetti Tail (0.7s - 1.6s)
   */
  playVictory() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // --- PHASE 1: Rising Celebration Celeste Sweep ---
      const sweepNotes = [698.46, 880.0, 1046.5, 1318.5, 1567.98, 1760.0]; // F5, A5, C6, E6, G6, A6
      const sweepStagger = 0.055;

      sweepNotes.forEach((freq, idx) => {
        const noteStart = now + idx * sweepStagger;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.09, noteStart + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.42);
      });

      // --- PHASE 2: Warm Polyphonic Major 9th Chord Bloom ---
      // Voicing: F4, C5, E5, A5, C6 (Lush Royal F-Major 9th chord)
      const chordStart = now + 0.32;
      const chordNotes = [
        { freq: 174.61, gain: 0.07, decay: 1.1 }, // F3 warm acoustic bass foundation
        { freq: 349.23, gain: 0.065, decay: 1.0 }, // F4
        { freq: 523.25, gain: 0.07, decay: 1.0 }, // C5
        { freq: 659.25, gain: 0.065, decay: 0.95 }, // E5
        { freq: 880.00, gain: 0.06, decay: 0.9 }, // A5
        { freq: 1046.5, gain: 0.05, decay: 0.85 }, // C6
      ];

      chordNotes.forEach(({ freq, gain: targetGain, decay }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1800, chordStart);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, chordStart);

        gain.gain.setValueAtTime(0.001, chordStart);
        gain.gain.linearRampToValueAtTime(targetGain, chordStart + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, chordStart + decay);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(chordStart);
        osc.stop(chordStart + decay + 0.05);
      });

      // --- PHASE 3: Shimmering Gold Dust Confetti Tail ---
      const sparkleStart = now + 0.72;
      const sparkles = [2093.0, 2637.02, 3135.96, 3520.0]; // C7, E7, G7, A7
      sparkles.forEach((freq, idx) => {
        const sparkleTime = sparkleStart + idx * 0.07;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, sparkleTime);

        gain.gain.setValueAtTime(0.001, sparkleTime);
        gain.gain.linearRampToValueAtTime(0.04, sparkleTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, sparkleTime + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(sparkleTime);
        osc.stop(sparkleTime + 0.75);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Magical glissando chime when a hint is revealed
   */
  playHint() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Staggered mystical ascending pentatonic notes (E5, G#5, B5, E6, G#6)
      const notes = [659.25, 830.61, 987.77, 1318.51, 1661.22];

      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.045;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.06, noteStart + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.3);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Crisp double-crystal chime when claiming coins, stars, or milestones
   */
  playReward() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [783.99, 1174.66]; // G5 -> D6 bright fifth interval

      notes.forEach((freq, idx) => {
        const noteStart = now + idx * 0.085;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteStart);

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.085, noteStart + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.32);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Organic low-frequency heartbeat pulse for Daily Rush final countdown (< 10s)
   */
  playHeartbeat() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Realistic two-stage acoustic pulse (lub-dub)
      const pulses = [
        { startFreq: 68, endFreq: 38, gain: 0.12, offset: 0 },
        { startFreq: 58, endFreq: 32, gain: 0.085, offset: 0.11 },
      ];

      pulses.forEach(({ startFreq, endFreq, gain: targetGain, offset }) => {
        const pulseTime = now + offset;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, pulseTime);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, pulseTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, pulseTime + 0.085);

        gain.gain.setValueAtTime(0.001, pulseTime);
        gain.gain.linearRampToValueAtTime(targetGain, pulseTime + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, pulseTime + 0.095);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(pulseTime);
        osc.stop(pulseTime + 0.1);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Procedural Gamelan Micro-Chime for Indonesian cultural moments & tournament round wins
   */
  playGamelanBell() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      // Authentic Slendro-inspired harmonic partials
      const partials = [
        { freq: 587.33, gain: 0.11, decay: 0.65 }, // Fundamental D5
        { freq: 880.0, gain: 0.06, decay: 0.45 },  // Perfect 5th partial
        { freq: 1260.0, gain: 0.035, decay: 0.28 }, // Metallic overtone
      ];

      partials.forEach(({ freq, gain: targetGain, decay }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(targetGain, now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.001, now + decay);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + decay + 0.05);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Pure soft crystal chord chime for Tournament Championship & Gold Trophy celebration
   */
  playCrystalChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const chord = [1046.5, 1318.5, 1567.98, 1975.53, 2093.0]; // C6, E6, G6, B6, C7
      const stagger = 0.045;

      chord.forEach((freq, idx) => {
        const noteTime = now + idx * stagger;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.08, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.55);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.6);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Soft nylon acoustic strum for reflective lexicon study & quest completion
   */
  playAcousticStrum() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const notes = [329.63, 440.0, 523.25, 659.25, 783.99]; // E4, A4, C5, E5, G5

      notes.forEach((freq, idx) => {
        const noteTime = now + idx * 0.025;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, noteTime);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.07, noteTime + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.4);
      });
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundManager();
