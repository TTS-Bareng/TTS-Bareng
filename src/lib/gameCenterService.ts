// ======================================================================
// APPLE GAME CENTER SERVICE (TTS BARENG)
// Native iOS GameKit integration via Capacitor GameCenterPlugin
// Includes seamless mock mode on Web and desktop environments
// ======================================================================

import { Capacitor, registerPlugin } from '@capacitor/core';

export const GAME_CENTER_LEADERBOARDS = {
  stars: 'com.syntheticae.ttsbareng.stars',
  streak: 'com.syntheticae.ttsbareng.streak',
  words: 'com.syntheticae.ttsbareng.words',
} as const;

export const GAME_CENTER_ACHIEVEMENTS = {
  firstWord: 'com.syntheticae.ttsbareng.first_word',
  chapter1: 'com.syntheticae.ttsbareng.chapter_1',
  words10: 'com.syntheticae.ttsbareng.words_10',
  words50: 'com.syntheticae.ttsbareng.words_50',
  words100: 'com.syntheticae.ttsbareng.words_100',
  streak7: 'com.syntheticae.ttsbareng.streak_7',
} as const;

export type LeaderboardKey = keyof typeof GAME_CENTER_LEADERBOARDS;
export type AchievementKey = keyof typeof GAME_CENTER_ACHIEVEMENTS;

interface GameCenterPluginInterface {
  authenticate(): Promise<{
    isAuthenticated: boolean;
    playerID?: string;
    displayName?: string;
    alias?: string;
    error?: string;
  }>;
  submitScore(options: { leaderboardID: string; score: number }): Promise<{ success: boolean }>;
  unlockAchievement(options: { achievementID: string; percentComplete?: number }): Promise<{ success: boolean }>;
  showGameCenter(options?: { state?: 'default' | 'leaderboards' | 'achievements' }): Promise<{ success: boolean }>;
}

const NativeGameCenter = registerPlugin<GameCenterPluginInterface>('GameCenterPlugin');

export interface GameCenterProfile {
  isAuthenticated: boolean;
  playerID?: string;
  displayName?: string;
  alias?: string;
}

class GameCenterService {
  private profile: GameCenterProfile = { isAuthenticated: false };
  private isInitialized = false;

  public get isNativeIos(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios';
  }

  public get isAuthenticated(): boolean {
    return this.profile.isAuthenticated;
  }

  public get playerDisplayName(): string | undefined {
    return this.profile.displayName || this.profile.alias;
  }

  /**
   * Inisialisasi otomatis Game Center di background saat game dibuka
   */
  public async initialize(): Promise<GameCenterProfile> {
    if (this.isInitialized && this.profile.isAuthenticated) {
      return this.profile;
    }

    if (!this.isNativeIos) {
      this.isInitialized = true;
      this.profile = {
        isAuthenticated: false,
        displayName: 'Simulator Web',
      };
      console.info('[GameCenter] Web Mock Mode: Game Center hanya aktif pada perangkat iOS native.');
      return this.profile;
    }

    try {
      const res = await NativeGameCenter.authenticate();
      this.isInitialized = true;
      this.profile = {
        isAuthenticated: !!res.isAuthenticated,
        playerID: res.playerID,
        displayName: res.displayName,
        alias: res.alias,
      };

      if (res.isAuthenticated) {
        console.info(`[GameCenter] Autentikasi berhasil: ${res.displayName || res.alias}`);
      } else {
        console.warn('[GameCenter] Autentikasi dibatalkan atau belum masuk:', res.error);
      }
      return this.profile;
    } catch (err) {
      console.warn('[GameCenter] Gagal menginisialisasi Game Center:', err);
      this.isInitialized = true;
      this.profile = { isAuthenticated: false };
      return this.profile;
    }
  }

  /**
   * Mengirim skor ke salah satu papan peringkat (Stars, Streak, Words)
   */
  public async submitScore(key: LeaderboardKey, score: number): Promise<boolean> {
    if (score < 0) return false;

    if (!this.isNativeIos) {
      console.debug(`[GameCenter Mock] submitScore -> ${key}: ${score}`);
      return true;
    }

    if (!this.profile.isAuthenticated) {
      await this.initialize();
      if (!this.profile.isAuthenticated) return false;
    }

    try {
      const leaderboardID = GAME_CENTER_LEADERBOARDS[key];
      const res = await NativeGameCenter.submitScore({
        leaderboardID,
        score: Math.round(score),
      });
      return !!res.success;
    } catch (err) {
      console.warn(`[GameCenter] Gagal submit skor ke ${key}:`, err);
      return false;
    }
  }

  /**
   * Melaporkan pencapaian (Achievement) ke Game Center
   */
  public async unlockAchievement(key: AchievementKey, percentComplete: number = 100): Promise<boolean> {
    const clamped = Math.max(0, Math.min(100, percentComplete));

    if (!this.isNativeIos) {
      console.debug(`[GameCenter Mock] unlockAchievement -> ${key}: ${clamped}%`);
      return true;
    }

    if (!this.profile.isAuthenticated) {
      await this.initialize();
      if (!this.profile.isAuthenticated) return false;
    }

    try {
      const achievementID = GAME_CENTER_ACHIEVEMENTS[key];
      const res = await NativeGameCenter.unlockAchievement({
        achievementID,
        percentComplete: clamped,
      });
      return !!res.success;
    } catch (err) {
      console.warn(`[GameCenter] Gagal unlock achievement ${key}:`, err);
      return false;
    }
  }

  /**
   * Membuka tampilan overlay native Apple Game Center (Papan Peringkat / Prestasi)
   */
  public async openDashboard(state: 'default' | 'leaderboards' | 'achievements' = 'default'): Promise<boolean> {
    if (!this.isNativeIos) {
      console.info(`[GameCenter Mock] Buka dashboard (${state}) - Hanya tersedia di perangkat Apple iOS.`);
      return false;
    }

    if (!this.profile.isAuthenticated) {
      await this.initialize();
      if (!this.profile.isAuthenticated) return false;
    }

    try {
      const res = await NativeGameCenter.showGameCenter({ state });
      return !!res.success;
    } catch (err) {
      console.warn('[GameCenter] Gagal membuka Game Center dashboard:', err);
      return false;
    }
  }

  /**
   * Sinkronisasi berkala seluruh skor dan lencana pencapaian ke Game Center
   */
  public async syncAll(params: {
    stars: number;
    streak: number;
    totalSolvedWords: number;
    hasCompletedChapter1: boolean;
  }): Promise<void> {
    const { stars, streak, totalSolvedWords, hasCompletedChapter1 } = params;

    // 1. Submit Leaderboard Scores
    if (stars > 0) this.submitScore('stars', stars);
    if (streak > 0) this.submitScore('streak', streak);
    if (totalSolvedWords > 0) this.submitScore('words', totalSolvedWords);

    // 2. Check & Report Milestone Achievements
    if (totalSolvedWords >= 1) {
      this.unlockAchievement('firstWord', 100);
    }
    if (hasCompletedChapter1) {
      this.unlockAchievement('chapter1', 100);
    }
    if (totalSolvedWords >= 10) {
      this.unlockAchievement('words10', 100);
    }
    if (totalSolvedWords >= 50) {
      this.unlockAchievement('words50', 100);
    }
    if (totalSolvedWords >= 100) {
      this.unlockAchievement('words100', 100);
    }
    if (streak >= 7) {
      this.unlockAchievement('streak7', 100);
    }
  }
}

export const gameCenterService = new GameCenterService();
