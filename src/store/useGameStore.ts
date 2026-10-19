import { create } from 'zustand';
import levelsData from '../data/levels.json';
import { type LevelData, findClueById } from '../lib/crossword';
import { THEMES, type ThemeKey, applyTheme } from '../lib/themes';
import { soundManager } from '../lib/audio';
import confetti from 'canvas-confetti';
import { mabarRealtime } from '../lib/mabarRealtime';
import { submitDailyRushScore, fetchDailyRushLeaderboard, type DbDailyRushRecord } from '../lib/supabase';

export type TabType = 'home' | 'social' | 'game' | 'quests' | 'profile' | 'stats' | 'settings' | 'arena';

export interface MabarPeerInfo {
  id: string;
  name: string;
  avatar: string;
}

export interface UserProfile {
  name: string;
  email?: string;
  isGuest: boolean;
  avatar: string;
  joinedAt: string;
}

export interface LevelProgressRecord {
  inputs: Record<string, string>;
  locked: Record<string, boolean>;
  solved: string[];
  completed: boolean;
  starsEarned: number;
  timeSpent?: number;
  accuracy?: number;
  rating?: 1 | 2 | 3;
}

export interface DailyRushRecord {
  date: string;
  score: number;
  timeSpent: number;
  accuracy: number;
  completed: boolean;
}

export interface ShareStatItem {
  label: string;
  value: string;
}

export interface ShareModalData {
  badge: string;
  title: string;
  subtitle: string;
  mascot?: string;
  stats: ShareStatItem[];
  shareUrl?: string;
  shareText?: string;
}

interface GameState {
  // Navigation
  currentTab: TabType;
  previousTab: TabType;
  setCurrentTab: (tab: TabType) => void;

  // Daily Rush 90s speedrun
  gameMode: 'classic' | 'daily_rush';
  dailyRushTimeLeft: number;
  dailyRushRecord: DailyRushRecord | null;
  startDailyRush: () => void;
  tickDailyRush: () => void;
  finishDailyRush: (completed: boolean) => void;

  // User Profile
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  isAuthOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  loginAsGuest: () => void;
  loginWithEmail: (email: string, name: string) => void;
  logout: () => void;

  // Theme
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;

  // Sound & Haptics
  soundEnabled: boolean;
  toggleSound: () => void;
  hapticEnabled: boolean;
  toggleHaptic: () => void;

  // Levels & Progress
  levels: LevelData[];
  currentLevelIndex: number;
  level: LevelData;
  selectLevel: (index: number) => void;
  goToNextLevel: () => void;
  playRandomLevel: () => void;
  levelRecords: Record<string, LevelProgressRecord>;

  // Streak & Currency
  streak: number;
  stars: number;

  // Active play state
  activeClueId: string | null;
  focusedCell: [number, number] | null;
  userInputs: Record<string, string>;
  lockedCells: Record<string, boolean>;
  solvedClues: string[];
  levelStartTime: number;
  levelMistakes: number;
  levelHintsUsed: number;

  // Feedback animations & game-feel
  poppingCells: string[];
  shakingCells: string[];
  validationMessage: string | null;
  clearValidationMessage: () => void;
  wordStreak: number;
  comboMessage: string | null;
  clearComboMessage: () => void;

  // Global toast alerts & social sync
  globalToast: string | null;
  showGlobalToast: (message: string, durationMs?: number) => void;
  clearGlobalToast: () => void;
  activeRoomCode: string | null;
  setActiveRoomCode: (code: string | null) => void;

  // Mabar Realtime Peer-to-Peer & Supabase live sync
  mabarPeers: MabarPeerInfo[];
  partnerCursor: { key: string; name: string } | null;
  setMabarPeers: (peers: MabarPeerInfo[]) => void;
  setPartnerCursor: (cursor: { key: string; name: string } | null) => void;
  applyRemoteInput: (key: string, letter: string, partnerName: string) => void;
  applyRemoteDelete: (key: string) => void;
  applyRemoteClueSolved: (clueId: string, newlySolved: string[], partnerName: string) => void;

  // Modals
  isSettingsOpen: boolean;
  isLevelCompleteOpen: boolean;
  isAdModalOpen: boolean;
  isLevelSelectOpen: boolean;
  isLexiconOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  openAdModal: () => void;
  closeAdModal: () => void;
  closeLevelComplete: () => void;
  openLevelSelect: () => void;
  closeLevelSelect: () => void;
  openLexicon: () => void;
  closeLexicon: () => void;
  isLeaderboardOpen: boolean;
  openLeaderboard: () => void;
  closeLeaderboard: () => void;
  nationalLeaderboard: DbDailyRushRecord[];
  isLoadingLeaderboard: boolean;
  loadNationalLeaderboard: (dateStr?: string) => Promise<void>;
  isShareModalOpen: boolean;
  shareModalData: ShareModalData | null;
  openShareModal: (data: ShareModalData) => void;
  closeShareModal: () => void;

  // Gameplay actions
  selectClue: (clueId: string, cellToFocus?: [number, number]) => void;
  selectCell: (r: number, c: number) => void;
  inputLetter: (letter: string) => void;
  deleteLetter: () => void;
  closeKeyboard: () => void;
  nextClue: () => void;
  prevClue: () => void;
  checkAnswers: () => void;
  useHint: () => void;
  clearActiveWord: () => void;
  addStars: (amount: number) => void;
  rewardAdWatch: () => void;
  restartLevel: () => void;
  resetAllProgress: () => void;
}

const STORAGE_KEY_THEME = 'tts_quest_theme';
const STORAGE_KEY_STARS = 'tts_quest_stars';
const STORAGE_KEY_USER = 'tts_quest_user';
const STORAGE_KEY_RECORDS = 'tts_quest_records_v2';
const STORAGE_KEY_SOUND = 'tts_quest_sound';
const STORAGE_KEY_HAPTIC = 'tts_haptics';
const STORAGE_KEY_LEVEL_IDX = 'tts_quest_level_idx';
const STORAGE_KEY_DAILY_RUSH = 'tts_quest_daily_rush_record';

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDailyRushLevelIndex(totalLevels: number): number {
  const d = new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const diff = d.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return (dayOfYear * 7 + 13) % totalLevels;
}

function getInitialDailyRushRecord(): DailyRushRecord | null {
  if (typeof window === 'undefined') return null;
  const saved = localStorage.getItem(STORAGE_KEY_DAILY_RUSH);
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

const typedLevels = levelsData as unknown as LevelData[];

function getInitialUser(): UserProfile {
  const defaultAvatar = '/maskot/Fierce Plush Crossword Champion.webp';
  if (typeof window === 'undefined') {
    return { name: 'Pemain TTS', isGuest: true, avatar: defaultAvatar, joinedAt: 'Hari ini' };
  }
  const saved = localStorage.getItem(STORAGE_KEY_USER);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.name === 'Penjelajah') parsed.name = 'Pemain TTS';
      if (
        !parsed.avatar ||
        (!parsed.avatar.startsWith('/') &&
          !parsed.avatar.startsWith('data:') &&
          !parsed.avatar.startsWith('http'))
      ) {
        parsed.avatar = defaultAvatar;
      }
      return parsed;
    } catch {
      // fallback
    }
  }
  return { name: 'Pemain TTS', isGuest: true, avatar: defaultAvatar, joinedAt: 'Hari ini' };
}

function getInitialTheme(): ThemeKey {
  if (typeof window === 'undefined') return 'obsidian';
  const saved = localStorage.getItem(STORAGE_KEY_THEME) as string;
  if (saved === 'forest') return 'racing';
  if (saved === 'neoblue') return 'electric';
  if (saved === 'sunset' || saved === 'alabaster') return 'milky';
  if (saved === 'retro') return 'sage';
  if (saved === 'cyber') return 'obsidian';
  if (saved === 'lavender') return 'oxford';
  if (saved && (THEMES as Record<string, unknown>)[saved]) return saved as ThemeKey;
  return 'obsidian';
}

function getInitialStars(): number {
  if (typeof window === 'undefined') return 120;
  const saved = localStorage.getItem(STORAGE_KEY_STARS);
  if (saved !== null) {
    const num = parseInt(saved, 10);
    if (!isNaN(num) && num >= 0) return num;
  }
  return 120;
}

function getInitialRecords(): Record<string, LevelProgressRecord> {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return {};
}

function getInitialLevelIndex(): number {
  if (typeof window === 'undefined') return 0;
  const saved = localStorage.getItem(STORAGE_KEY_LEVEL_IDX);
  if (saved !== null) {
    const num = parseInt(saved, 10);
    if (!isNaN(num) && num >= 0 && num < typedLevels.length) return num;
  }
  return 0;
}

const initialRecords = getInitialRecords();
const initialLevelIdx = getInitialLevelIndex();
const currentInitialLevel = typedLevels[initialLevelIdx] || typedLevels[0];
const currentLevelRecord = initialRecords[currentInitialLevel.id] || {
  inputs: {},
  locked: {},
  solved: [],
  completed: false,
  starsEarned: 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  currentTab: 'home',
  previousTab: 'home',
  setCurrentTab: (tab) => set((state) => ({ previousTab: state.currentTab, currentTab: tab })),

  user: getInitialUser(),
  setUser: (user) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    set({ user });
  },
  isAuthOpen: false,
  openAuth: () => set({ isAuthOpen: true }),
  closeAuth: () => set({ isAuthOpen: false }),

  loginAsGuest: () => {
    const guestUser: UserProfile = {
      name: 'Tamu Lokal',
      isGuest: true,
      avatar: '/maskot/Fierce Plush Crossword Champion.webp',
      joinedAt: 'Mode Tamu',
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(guestUser));
    set({ user: guestUser, isAuthOpen: false });
  },

  loginWithEmail: (email: string, name: string) => {
    const emailUser: UserProfile = {
      name: name.trim() || 'Pemain TTS',
      email: email.trim(),
      isGuest: false,
      avatar: '/maskot/Playful Plush Crossword Board.webp',
      joinedAt: 'Oktober 2026',
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(emailUser));
    set({ user: emailUser, isAuthOpen: false });
  },

  logout: () => {
    const defaultUser: UserProfile = {
      name: 'Tamu',
      isGuest: true,
      avatar: '/maskot/Fierce Plush Crossword Champion.webp',
      joinedAt: 'Mode Tamu',
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(defaultUser));
    set({ user: defaultUser });
  },

  theme: getInitialTheme(),
  setTheme: (theme) => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    set({ theme });
  },

  soundEnabled: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_SOUND) !== 'false' : true,
  toggleSound: () => {
    const next = !get().soundEnabled;
    localStorage.setItem(STORAGE_KEY_SOUND, String(next));
    set({ soundEnabled: next });
  },

  hapticEnabled: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_HAPTIC) !== 'false' : true,
  toggleHaptic: () => {
    const next = !get().hapticEnabled;
    localStorage.setItem(STORAGE_KEY_HAPTIC, String(next));
    if (next && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }
    set({ hapticEnabled: next });
  },

  levels: typedLevels,
  currentLevelIndex: initialLevelIdx,
  level: currentInitialLevel,
  levelRecords: initialRecords,
  gameMode: 'classic',
  dailyRushTimeLeft: 90,
  dailyRushRecord: getInitialDailyRushRecord(),
  streak: 3,
  stars: getInitialStars(),

  activeClueId: null,
  focusedCell: null,
  userInputs: currentLevelRecord.inputs,
  lockedCells: currentLevelRecord.locked,
  solvedClues: currentLevelRecord.solved,
  levelStartTime: Date.now(),
  levelMistakes: 0,
  levelHintsUsed: 0,

  poppingCells: [],
  shakingCells: [],
  validationMessage: null,
  clearValidationMessage: () => set({ validationMessage: null }),
  wordStreak: 0,
  comboMessage: null,
  clearComboMessage: () => set({ comboMessage: null }),

  globalToast: null,
  showGlobalToast: (message: string, durationMs: number = 2600) => {
    set({ globalToast: message });
    setTimeout(() => {
      if (get().globalToast === message) {
        set({ globalToast: null });
      }
    }, durationMs);
  },
  clearGlobalToast: () => set({ globalToast: null }),
  activeRoomCode: null,
  setActiveRoomCode: (code: string | null) => {
    set({ activeRoomCode: code });
    if (code) {
      const { user } = get();
      mabarRealtime.joinRoom(code, { name: user.name, avatar: user.avatar });
    } else {
      mabarRealtime.leaveRoom();
    }
  },

  mabarPeers: [],
  partnerCursor: null,
  setMabarPeers: (peers) => set({ mabarPeers: peers }),
  setPartnerCursor: (cursor) => set({ partnerCursor: cursor }),

  applyRemoteInput: (key, letter, partnerName) => {
    const { userInputs, soundEnabled, lockedCells } = get();
    if (lockedCells[key]) return;
    const newInputs = { ...userInputs, [key]: letter };
    if (soundEnabled) soundManager.playKeyClick();
    set({
      userInputs: newInputs,
      partnerCursor: { key, name: partnerName },
    });
  },

  applyRemoteDelete: (key) => {
    const { userInputs, lockedCells } = get();
    if (lockedCells[key]) return;
    const newInputs = { ...userInputs };
    delete newInputs[key];
    set({ userInputs: newInputs });
  },

  applyRemoteClueSolved: (clueId, newlySolved, partnerName) => {
    const { solvedClues, level, lockedCells, soundEnabled, userInputs } = get();
    const updatedSolved = Array.from(new Set([...solvedClues, ...newlySolved, clueId]));
    const newLocked = { ...lockedCells };
    const newInputs = { ...userInputs };

    updatedSolved.forEach((cId) => {
      const clue = findClueById(level, cId);
      if (clue) {
        clue.cells.forEach(([r, c], idx) => {
          const k = `${r},${c}`;
          newLocked[k] = true;
          newInputs[k] = clue.answer[idx];
        });
      }
    });

    if (soundEnabled) soundManager.playWordCorrect(1);
    set({
      solvedClues: updatedSolved,
      lockedCells: newLocked,
      userInputs: newInputs,
      validationMessage: `${partnerName} memecahkan kata!`,
    });
    setTimeout(() => {
      if (get().validationMessage?.includes(partnerName)) {
        set({ validationMessage: null });
      }
    }, 2500);
  },

  isSettingsOpen: false,
  isLevelCompleteOpen: false,
  isAdModalOpen: false,
  isLevelSelectOpen: false,
  isLexiconOpen: false,

  openSettings: () => {
    const current = get().currentTab;
    set({
      previousTab: current === 'settings' ? 'home' : current,
      currentTab: 'settings',
      isSettingsOpen: false,
    });
  },
  closeSettings: () => {
    const prev = get().previousTab;
    set({
      currentTab: prev && prev !== 'settings' ? prev : 'home',
      isSettingsOpen: false,
    });
  },
  openAdModal: () => set({ isAdModalOpen: true }),
  closeAdModal: () => set({ isAdModalOpen: false }),
  closeLevelComplete: () => set({ isLevelCompleteOpen: false }),
  openLevelSelect: () => set({ isLevelSelectOpen: true }),
  closeLevelSelect: () => set({ isLevelSelectOpen: false }),
  openLexicon: () => set({ isLexiconOpen: true }),
  closeLexicon: () => set({ isLexiconOpen: false }),

  isLeaderboardOpen: false,
  nationalLeaderboard: [],
  isLoadingLeaderboard: false,
  openLeaderboard: () => {
    set({ isLeaderboardOpen: true });
    get().loadNationalLeaderboard();
  },
  closeLeaderboard: () => set({ isLeaderboardOpen: false }),
  loadNationalLeaderboard: async (dateStr?: string) => {
    const targetDate = dateStr || getTodayDateString();
    set({ isLoadingLeaderboard: true });
    try {
      const records = await fetchDailyRushLeaderboard(targetDate, 20);
      set({ nationalLeaderboard: records, isLoadingLeaderboard: false });
    } catch {
      set({ isLoadingLeaderboard: false });
    }
  },

  isShareModalOpen: false,
  shareModalData: null,
  openShareModal: (data: ShareModalData) => set({ isShareModalOpen: true, shareModalData: data }),
  closeShareModal: () => set({ isShareModalOpen: false, shareModalData: null }),

  selectLevel: (index: number) => {
    const { levels, levelRecords } = get();
    const safeIdx = Math.max(0, Math.min(index, levels.length - 1));
    const targetLevel = levels[safeIdx];
    const rec = levelRecords[targetLevel.id] || {
      inputs: {},
      locked: {},
      solved: [],
      completed: false,
      starsEarned: 0,
    };

    localStorage.setItem(STORAGE_KEY_LEVEL_IDX, safeIdx.toString());

    set({
      currentLevelIndex: safeIdx,
      level: targetLevel,
      userInputs: rec.inputs,
      lockedCells: rec.locked,
      solvedClues: rec.solved,
      activeClueId: null,
      focusedCell: null,
      shakingCells: [],
      poppingCells: [],
      wordStreak: 0,
      comboMessage: null,
      gameMode: 'classic',
      dailyRushTimeLeft: 0,
      levelStartTime: Date.now(),
      levelMistakes: 0,
      levelHintsUsed: 0,
      currentTab: 'game',
      isLevelCompleteOpen: false,
    });
  },

  goToNextLevel: () => {
    const { currentLevelIndex, levels, selectLevel } = get();
    const nextIdx = (currentLevelIndex + 1) % levels.length;
    selectLevel(nextIdx);
  },

  playRandomLevel: () => {
    const { levels, levelRecords, selectLevel, soundEnabled, hapticEnabled } = get();
    // Prioritize uncompleted levels
    const uncompletedIndices: number[] = [];
    levels.forEach((lvl, idx) => {
      if (!levelRecords[lvl.id]?.completed) {
        uncompletedIndices.push(idx);
      }
    });

    const pool = uncompletedIndices.length > 0 ? uncompletedIndices : levels.map((_, i) => i);
    const randomIdx = pool[Math.floor(Math.random() * pool.length)];

    if (soundEnabled) soundManager.playKeyClick();
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }

    selectLevel(randomIdx);
  },

  startDailyRush: () => {
    const { levels, selectLevel, soundEnabled, hapticEnabled } = get();
    const dailyIdx = getDailyRushLevelIndex(levels.length);
    selectLevel(dailyIdx);
    if (soundEnabled) soundManager.playKeyClick();
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(15);
    }
    set({
      gameMode: 'daily_rush',
      dailyRushTimeLeft: 90,
      currentTab: 'game',
      wordStreak: 0,
      comboMessage: null,
    });
  },

  tickDailyRush: () => {
    const { gameMode, dailyRushTimeLeft, soundEnabled, finishDailyRush } = get();
    if (gameMode !== 'daily_rush') return;
    if (dailyRushTimeLeft <= 1) {
      finishDailyRush(false);
      return;
    }
    const nextTime = dailyRushTimeLeft - 1;
    if (nextTime <= 10 && nextTime > 0) {
      if (soundEnabled) soundManager.playHeartbeat();
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(12);
      }
    }
    set({ dailyRushTimeLeft: nextTime });
  },

  finishDailyRush: (completed: boolean) => {
    const {
      dailyRushTimeLeft,
      levelMistakes,
      levelHintsUsed,
      wordStreak,
      solvedClues,
      level,
      addStars,
      showGlobalToast,
      dailyRushRecord,
    } = get();

    const allCluesCount = level.clues.across.length + level.clues.down.length;
    const isFullSolved = solvedClues.length === allCluesCount || completed;
    const timeSpent = Math.max(1, 90 - dailyRushTimeLeft);
    const accuracy = Math.max(50, Math.min(100, Math.round(100 - (levelMistakes * 6) - (levelHintsUsed * 10))));

    const speedScore = Math.max(0, dailyRushTimeLeft * 12);
    const accuracyScore = Math.round(accuracy * 6);
    const streakScore = wordStreak * 25;
    const completionBonus = isFullSolved ? 200 : 0;
    const totalScore = speedScore + accuracyScore + streakScore + completionBonus;

    const today = getTodayDateString();
    const isHigherScore = dailyRushRecord?.date === today ? totalScore > (dailyRushRecord.score || 0) : true;
    const finalScore = isHigherScore ? totalScore : (dailyRushRecord?.score || totalScore);

    const newRecord: DailyRushRecord = {
      date: today,
      score: finalScore,
      timeSpent: isHigherScore ? timeSpent : (dailyRushRecord?.timeSpent || timeSpent),
      accuracy: isHigherScore ? accuracy : (dailyRushRecord?.accuracy || accuracy),
      completed: isFullSolved || (dailyRushRecord?.date === today && dailyRushRecord.completed),
    };

    localStorage.setItem(STORAGE_KEY_DAILY_RUSH, JSON.stringify(newRecord));

    if (isFullSolved) {
      addStars(50);
      showGlobalToast(`Daily Rush Selesai! Skor: ${totalScore} Pts (+50★)`, 3500);
    } else {
      showGlobalToast(`Waktu Habis! Skor Akhir: ${totalScore} Pts`, 3200);
    }

    set({
      gameMode: 'classic',
      dailyRushRecord: newRecord,
      dailyRushTimeLeft: 0,
    });

    // Auto-submit score to Supabase National Leaderboard
    const currentUser = get().user;
    submitDailyRushScore({
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      date: today,
      score: finalScore,
      timeSpent: isHigherScore ? timeSpent : (dailyRushRecord?.timeSpent || timeSpent),
      accuracy: isHigherScore ? accuracy : (dailyRushRecord?.accuracy || accuracy),
      completed: isFullSolved,
    }).then((ok) => {
      if (ok) {
        get().loadNationalLeaderboard(today);
      }
    });
  },

  selectClue: (clueId: string, cellToFocus?: [number, number]) => {
    const { level, lockedCells, userInputs } = get();
    const clue = findClueById(level, clueId);
    if (!clue) return;

    let target = cellToFocus;
    if (!target) {
      const emptyCell = clue.cells.find(([r, c]) => {
        const key = `${r},${c}`;
        return !lockedCells[key] && !userInputs[key];
      });
      target = emptyCell || clue.cells[0];
    }

    set({
      activeClueId: clueId,
      focusedCell: target,
      shakingCells: [],
      poppingCells: [],
    });
  },

  selectCell: (r: number, c: number) => {
    const { level, activeClueId, focusedCell, solvedClues, soundEnabled, hapticEnabled } = get();
    const tile = level.tiles.find((t) => t.r === r && t.c === c);
    if (!tile) return;

    if (soundEnabled) soundManager.playFocusTick();
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(4);
    }

    const acrossClue = tile.across ? findClueById(level, tile.across) : null;
    const downClue = tile.down ? findClueById(level, tile.down) : null;

    let nextClueId = activeClueId;

    if (focusedCell && focusedCell[0] === r && focusedCell[1] === c) {
      if (acrossClue && downClue) {
        nextClueId = activeClueId === acrossClue.id ? downClue.id : acrossClue.id;
      }
    } else {
      const currentClue = findClueById(level, activeClueId);
      const isCurrentContains = currentClue?.cells.some(([cr, cc]) => cr === r && cc === c);
      if (!isCurrentContains) {
        if (acrossClue && downClue) {
          const acrossSolved = solvedClues.includes(acrossClue.id);
          const downSolved = solvedClues.includes(downClue.id);
          if (acrossSolved && !downSolved) {
            nextClueId = downClue.id;
          } else if (!acrossSolved && downSolved) {
            nextClueId = acrossClue.id;
          } else {
            nextClueId = acrossClue.id;
          }
        } else {
          nextClueId = acrossClue?.id || downClue?.id || null;
        }
      }
    }

    set({
      activeClueId: nextClueId,
      focusedCell: [r, c],
      shakingCells: [],
    });

    if (get().activeRoomCode) {
      mabarRealtime.broadcastCursor(`${r},${c}`);
    }
  },

  inputLetter: (letter: string) => {
    const {
      focusedCell,
      activeClueId,
      level,
      lockedCells,
      userInputs,
      solvedClues,
      stars,
      soundEnabled,
      hapticEnabled,
      levelRecords,
      levelStartTime,
      levelMistakes,
      levelHintsUsed,
    } = get();
    if (!focusedCell || !activeClueId) return;

    const [r, c] = focusedCell;
    const key = `${r},${c}`;

    // If cell is already locked (part of an already solved word), do not overwrite
    if (lockedCells[key]) return;

    const newInputs = { ...userInputs, [key]: letter.toUpperCase() };
    if (get().activeRoomCode) {
      mabarRealtime.broadcastInput(key, letter.toUpperCase());
    }
    if (soundEnabled) soundManager.playKeyClick();
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(8);
    }

    const allClues = [...level.clues.across, ...level.clues.down];
    const newlySolvedClues: string[] = [];
    const newLockedCells = { ...lockedCells };
    const popping: string[] = [];

    // Check all clues to see if any clue is now completed and correct
    for (const clue of allClues) {
      if (solvedClues.includes(clue.id)) continue;

      const isFull = clue.cells.every(([cr, cc]) => !!newInputs[`${cr},${cc}`]);
      if (isFull) {
        const isCorrect = clue.cells.every(
          ([cr, cc], i) => newInputs[`${cr},${cc}`] === clue.answer[i]
        );
        if (isCorrect) {
          newlySolvedClues.push(clue.id);
          for (const [cr, cc] of clue.cells) {
            const ck = `${cr},${cc}`;
            newLockedCells[ck] = true;
            if (!popping.includes(ck)) popping.push(ck);
          }
        }
      }
    }

    const updatedSolved = [...solvedClues, ...newlySolvedClues];
    const isLevelComplete = updatedSolved.length === allClues.length;
    const addedStars = newlySolvedClues.length * 10;
    const updatedStars = stars + addedStars;

    let nextCell = focusedCell;
    let nextClueId = activeClueId;
    let shaking: string[] = [];
    let validationMsg: string | null = null;
    let nextMistakes = levelMistakes;
    const { wordStreak } = get();
    let nextWordStreak = wordStreak;
    let nextComboMessage: string | null = null;

    if (newlySolvedClues.length > 0) {
      // Word(s) solved!
      if (get().activeRoomCode) {
        mabarRealtime.broadcastClueSolved(activeClueId || newlySolvedClues[0], newlySolvedClues);
      }
      nextWordStreak = wordStreak + newlySolvedClues.length;
      if (soundEnabled) soundManager.playWordCorrect(nextWordStreak);
      if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([15, 30, 20]);
      }

      if (nextWordStreak >= 2) {
        const titles = ['Menyala!', 'Hebat!', 'Luar Biasa!', 'Brilian!', 'Jenius!'];
        const title = titles[Math.min(nextWordStreak - 2, titles.length - 1)];
        nextComboMessage = `Kombo ${nextWordStreak}x • ${title}`;
        setTimeout(() => {
          set({ comboMessage: null });
        }, 2500);
      }

      if (isLevelComplete) {
        if (get().gameMode === 'daily_rush') {
          get().finishDailyRush(true);
        }
        if (soundEnabled) soundManager.playVictory();
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          set({ isLevelCompleteOpen: true });
        }, 600);
      } else {
        // Automatically jump to the next unsolved clue
        const currIdx = allClues.findIndex((cl) => cl.id === activeClueId);
        let nextUnsolved = allClues.slice(currIdx + 1).find((cl) => !updatedSolved.includes(cl.id));
        if (!nextUnsolved) {
          nextUnsolved = allClues.find((cl) => !updatedSolved.includes(cl.id));
        }

        if (nextUnsolved) {
          nextClueId = nextUnsolved.id;
          const firstUnfilled = nextUnsolved.cells.find(
            ([nr, nc]) => !newLockedCells[`${nr},${nc}`] && !newInputs[`${nr},${nc}`]
          );
          nextCell = firstUnfilled || nextUnsolved.cells[0];
        }
      }
    } else {
      // No newly solved clue. Check if the active clue is now full but WRONG
      const currentClue = findClueById(level, activeClueId);
      const isCurrentClueFull = currentClue
        ? currentClue.cells.every(([cr, cc]) => !!newInputs[`${cr},${cc}`])
        : false;

      if (isCurrentClueFull && currentClue) {
        const wordWrongCells: string[] = [];
        currentClue.cells.forEach(([cr, cc], i) => {
          const ck = `${cr},${cc}`;
          if (newInputs[ck] !== currentClue.answer[i]) {
            wordWrongCells.push(ck);
          }
        });

        if (wordWrongCells.length > 0) {
          nextMistakes += 1;
          nextWordStreak = 0;
          nextComboMessage = null;
          shaking = wordWrongCells;
          if (soundEnabled) soundManager.playWordWrong();
          if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([35, 45]);
          }
          setTimeout(() => {
            set({ shakingCells: [] });
          }, 600);
        }
      }

      // Check if ALL tiles across the board are filled, but level is not complete
      const allTilesFilled = level.tiles.every((t) => !!newInputs[`${t.r},${t.c}`]);
      if (allTilesFilled && !isLevelComplete) {
        const allWrongCells: string[] = [];
        for (const clue of allClues) {
          if (updatedSolved.includes(clue.id)) continue;
          clue.cells.forEach(([cr, cc], i) => {
            const ck = `${cr},${cc}`;
            if (newInputs[ck] && newInputs[ck] !== clue.answer[i]) {
              if (!allWrongCells.includes(ck)) allWrongCells.push(ck);
            }
          });
        }
        if (allWrongCells.length > 0) {
          nextMistakes += 1;
          nextWordStreak = 0;
          nextComboMessage = null;
          shaking = allWrongCells;
          validationMsg = 'Ada kata yang belum tepat, coba periksa kembali!';
          if (soundEnabled) soundManager.playWordWrong();
          if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([35, 45]);
          }
          setTimeout(() => {
            set({ shakingCells: [], validationMessage: null });
          }, 2500);
        }
      } else {
        // Normal cell navigation inside the current clue (skip already locked cells)
        if (currentClue) {
          const idx = currentClue.cells.findIndex(([cr, cc]) => cr === r && cc === c);
          if (idx !== -1 && idx < currentClue.cells.length - 1) {
            let nextIdx = idx + 1;
            while (
              nextIdx < currentClue.cells.length &&
              newLockedCells[`${currentClue.cells[nextIdx][0]},${currentClue.cells[nextIdx][1]}`]
            ) {
              nextIdx++;
            }
            if (nextIdx < currentClue.cells.length) {
              nextCell = currentClue.cells[nextIdx];
            }
          }
        }
      }
    }

    const timeSpent = isLevelComplete
      ? Math.max(8, Math.floor((Date.now() - levelStartTime) / 1000))
      : (levelRecords[level.id]?.timeSpent || 0);

    const accuracy = isLevelComplete
      ? Math.max(65, Math.min(100, Math.round(100 - (nextMistakes * 5) - (levelHintsUsed * 8))))
      : (levelRecords[level.id]?.accuracy || 100);

    const rating: 1 | 2 | 3 = accuracy >= 90 && levelHintsUsed === 0 ? 3 : accuracy >= 75 || levelHintsUsed <= 1 ? 2 : 1;

    const updatedRecords = {
      ...levelRecords,
      [level.id]: {
        inputs: newInputs,
        locked: newLockedCells,
        solved: updatedSolved,
        completed: isLevelComplete,
        starsEarned: (levelRecords[level.id]?.starsEarned || 0) + addedStars,
        timeSpent,
        accuracy,
        rating,
      },
    };

    if (addedStars > 0) {
      localStorage.setItem(STORAGE_KEY_STARS, updatedStars.toString());
    }
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updatedRecords));

    set({
      userInputs: newInputs,
      lockedCells: newLockedCells,
      solvedClues: updatedSolved,
      stars: updatedStars,
      activeClueId: nextClueId,
      focusedCell: nextCell,
      poppingCells: popping,
      shakingCells: shaking,
      levelMistakes: nextMistakes,
      validationMessage: validationMsg,
      wordStreak: nextWordStreak,
      comboMessage: nextComboMessage !== null ? nextComboMessage : (nextWordStreak === 0 ? null : get().comboMessage),
      levelRecords: updatedRecords,
    });
  },

  deleteLetter: () => {
    const { focusedCell, activeClueId, level, lockedCells, userInputs, soundEnabled, hapticEnabled, levelRecords } = get();
    if (!focusedCell || !activeClueId) return;

    const [r, c] = focusedCell;
    const key = `${r},${c}`;
    const newInputs = { ...userInputs };
    const clue = findClueById(level, activeClueId);
    const idx = clue ? clue.cells.findIndex(([cr, cc]) => cr === r && cc === c) : -1;

    if (soundEnabled) soundManager.playKeyClick();
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(8);
    }

    if (newInputs[key] && !lockedCells[key]) {
      delete newInputs[key];
      if (get().activeRoomCode) {
        mabarRealtime.broadcastDelete(key);
      }
    } else {
      if (clue && idx > 0) {
        let prevIdx = idx - 1;
        while (prevIdx >= 0 && lockedCells[`${clue.cells[prevIdx][0]},${clue.cells[prevIdx][1]}`]) {
          prevIdx--;
        }
        if (prevIdx >= 0) {
          const prevCell = clue.cells[prevIdx];
          const prevKey = `${prevCell[0]},${prevCell[1]}`;
          delete newInputs[prevKey];
          if (get().activeRoomCode) {
            mabarRealtime.broadcastDelete(prevKey);
          }
          set({
            userInputs: newInputs,
            focusedCell: prevCell,
          });
          return;
        }
      }
    }

    const { solvedClues } = get();
    const updatedRecords = {
      ...levelRecords,
      [level.id]: {
        inputs: newInputs,
        locked: lockedCells,
        solved: solvedClues,
        completed: solvedClues.length === (level.clues.across.length + level.clues.down.length),
        starsEarned: (levelRecords[level.id]?.starsEarned || 0),
      },
    };

    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updatedRecords));
    set({ userInputs: newInputs, levelRecords: updatedRecords });
  },

  closeKeyboard: () => {
    set({
      activeClueId: null,
      focusedCell: null,
      shakingCells: [],
      poppingCells: [],
    });
  },

  nextClue: () => {
    const { level, activeClueId, selectClue, soundEnabled, hapticEnabled } = get();
    const allClues = [...level.clues.across, ...level.clues.down];
    if (allClues.length === 0) return;
    const currIdx = allClues.findIndex((c) => c.id === activeClueId);
    const nextIdx = (currIdx + 1) % allClues.length;
    if (soundEnabled) soundManager.playFocusTick();
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(6);
    }
    selectClue(allClues[nextIdx].id);
  },

  prevClue: () => {
    const { level, activeClueId, selectClue, soundEnabled, hapticEnabled } = get();
    const allClues = [...level.clues.across, ...level.clues.down];
    if (allClues.length === 0) return;
    const currIdx = allClues.findIndex((c) => c.id === activeClueId);
    const prevIdx = (currIdx - 1 + allClues.length) % allClues.length;
    if (soundEnabled) soundManager.playFocusTick();
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(6);
    }
    selectClue(allClues[prevIdx].id);
  },

  checkAnswers: () => {
    const {
      level,
      userInputs,
      lockedCells,
      solvedClues,
      stars,
      soundEnabled,
      hapticEnabled,
      levelRecords,
      levelStartTime,
      levelMistakes,
      levelHintsUsed,
    } = get();
    const allClues = [...level.clues.across, ...level.clues.down];

    const newlySolvedClues: string[] = [];
    const newLockedCells = { ...lockedCells };
    const popping: string[] = [];
    const shaking: string[] = [];

    for (const clue of allClues) {
      if (solvedClues.includes(clue.id)) continue;

      let isFull = true;
      let isCorrect = true;
      const wordWrongCells: string[] = [];

      for (let i = 0; i < clue.cells.length; i++) {
        const [r, c] = clue.cells[i];
        const key = `${r},${c}`;
        const inputLetter = userInputs[key];
        const correctLetter = clue.answer[i];

        if (!inputLetter) {
          isFull = false;
        } else if (inputLetter !== correctLetter) {
          isCorrect = false;
          wordWrongCells.push(key);
        }
      }

      if (isFull) {
        if (isCorrect) {
          newlySolvedClues.push(clue.id);
          for (const [r, c] of clue.cells) {
            const key = `${r},${c}`;
            newLockedCells[key] = true;
            if (!popping.includes(key)) popping.push(key);
          }
        } else {
          for (const k of wordWrongCells) {
            if (!shaking.includes(k)) shaking.push(k);
          }
        }
      }
    }

    const { wordStreak } = get();
    let nextWordStreak = wordStreak;
    let nextComboMessage: string | null = null;

    if (newlySolvedClues.length > 0) {
      const addedStars = newlySolvedClues.length * 10;
      const updatedStars = stars + addedStars;
      const updatedSolved = [...solvedClues, ...newlySolvedClues];
      const isLevelComplete = updatedSolved.length === allClues.length;
      nextWordStreak = wordStreak + newlySolvedClues.length;

      const timeSpent = isLevelComplete
        ? Math.max(8, Math.floor((Date.now() - levelStartTime) / 1000))
        : (levelRecords[level.id]?.timeSpent || 0);

      const accuracy = isLevelComplete
        ? Math.max(65, Math.min(100, Math.round(100 - (levelMistakes * 5) - (levelHintsUsed * 8))))
        : (levelRecords[level.id]?.accuracy || 100);

      const rating: 1 | 2 | 3 = accuracy >= 90 && levelHintsUsed === 0 ? 3 : accuracy >= 75 || levelHintsUsed <= 1 ? 2 : 1;

      const updatedRecords = {
        ...levelRecords,
        [level.id]: {
          inputs: userInputs,
          locked: newLockedCells,
          solved: updatedSolved,
          completed: isLevelComplete,
          starsEarned: (levelRecords[level.id]?.starsEarned || 0) + addedStars,
          timeSpent,
          accuracy,
          rating,
        },
      };

      localStorage.setItem(STORAGE_KEY_STARS, updatedStars.toString());
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updatedRecords));

      if (soundEnabled) soundManager.playWordCorrect(nextWordStreak);
      if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([15, 30, 20]);
      }

      if (nextWordStreak >= 2) {
        const titles = ['Menyala!', 'Hebat!', 'Luar Biasa!', 'Brilian!', 'Jenius!'];
        const title = titles[Math.min(nextWordStreak - 2, titles.length - 1)];
        nextComboMessage = `Kombo ${nextWordStreak}x • ${title}`;
        setTimeout(() => {
          set({ comboMessage: null });
        }, 2500);
      }

      set({
        stars: updatedStars,
        lockedCells: newLockedCells,
        solvedClues: updatedSolved,
        poppingCells: popping,
        shakingCells: [],
        wordStreak: nextWordStreak,
        comboMessage: nextComboMessage,
        validationMessage: isLevelComplete ? null : `${newlySolvedClues.length} kata terverifikasi! +${addedStars}★`,
        levelRecords: updatedRecords,
      });

      if (!isLevelComplete) {
        setTimeout(() => {
          set({ validationMessage: null });
        }, 2500);
      }

      if (isLevelComplete) {
        if (get().gameMode === 'daily_rush') {
          get().finishDailyRush(true);
        }
        if (soundEnabled) soundManager.playVictory();
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 },
        });
        setTimeout(() => {
          set({ isLevelCompleteOpen: true });
        }, 600);
      }
    } else if (shaking.length > 0) {
      if (soundEnabled) soundManager.playWordWrong();
      if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([35, 45]);
      }
      set({
        shakingCells: shaking,
        poppingCells: [],
        wordStreak: 0,
        comboMessage: null,
        levelMistakes: levelMistakes + 1,
        validationMessage: 'Ada kata yang belum tepat, coba periksa kembali!',
      });
      setTimeout(() => {
        set({ shakingCells: [], validationMessage: null });
      }, 2500);
    } else {
      set({
        validationMessage: 'Belum ada kata baru yang selesai diisi!',
      });
      setTimeout(() => {
        set({ validationMessage: null });
      }, 2000);
    }
  },

  useHint: () => {
    const {
      activeClueId,
      focusedCell,
      level,
      stars,
      userInputs,
      lockedCells,
      solvedClues,
      soundEnabled,
      hapticEnabled,
      levelRecords,
      levelStartTime,
      levelMistakes,
      levelHintsUsed,
    } = get();

    if (stars < 10) {
      set({ isAdModalOpen: true });
      return;
    }

    const allClues = [...level.clues.across, ...level.clues.down];
    let targetClueId = activeClueId;
    if (!targetClueId) {
      const unsolved = allClues.find((c) => !solvedClues.includes(c.id));
      targetClueId = unsolved ? unsolved.id : allClues[0].id;
    }

    const clue = findClueById(level, targetClueId);
    if (!clue) return;

    const candidateCells: [number, number, string][] = [];
    for (let i = 0; i < clue.cells.length; i++) {
      const [r, c] = clue.cells[i];
      const key = `${r},${c}`;
      const correctChar = clue.answer[i];
      if (!lockedCells[key] || userInputs[key] !== correctChar) {
        candidateCells.push([r, c, correctChar]);
      }
    }

    if (candidateCells.length === 0) return;

    // Prioritize the specifically focused cell if it is an unsolved candidate
    const focusedCandidate = focusedCell
      ? candidateCells.find(([cr, cc]) => cr === focusedCell[0] && cc === focusedCell[1])
      : null;
    const [targetR, targetC, char] = focusedCandidate || candidateCells[0];
    const targetKey = `${targetR},${targetC}`;

    const newInputs = { ...userInputs, [targetKey]: char };
    const newLocked = { ...lockedCells, [targetKey]: true };
    const newStars = stars - 10;
    const nextHintsUsed = levelHintsUsed + 1;

    if (soundEnabled) soundManager.playHint();
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([12, 24]);
    }

    const newlySolvedClues: string[] = [];
    const popping = [targetKey];
    for (const cl of allClues) {
      if (solvedClues.includes(cl.id)) continue;
      const isFull = cl.cells.every(([cr, cc]) => !!newInputs[`${cr},${cc}`]);
      if (isFull) {
        const isCorrect = cl.cells.every(
          ([cr, cc], i) => newInputs[`${cr},${cc}`] === cl.answer[i]
        );
        if (isCorrect) {
          newlySolvedClues.push(cl.id);
          for (const [cr, cc] of cl.cells) {
            const ck = `${cr},${cc}`;
            newLocked[ck] = true;
            if (!popping.includes(ck)) popping.push(ck);
          }
        }
      }
    }

    const updatedSolved = [...solvedClues, ...newlySolvedClues];
    const isLevelComplete = updatedSolved.length === allClues.length;

    const timeSpent = isLevelComplete
      ? Math.max(8, Math.floor((Date.now() - levelStartTime) / 1000))
      : (levelRecords[level.id]?.timeSpent || 0);

    const accuracy = isLevelComplete
      ? Math.max(65, Math.min(100, Math.round(100 - (levelMistakes * 5) - (nextHintsUsed * 8))))
      : (levelRecords[level.id]?.accuracy || 100);

    const rating: 1 | 2 | 3 = accuracy >= 90 && nextHintsUsed === 0 ? 3 : accuracy >= 75 || nextHintsUsed <= 1 ? 2 : 1;

    const updatedRecords = {
      ...levelRecords,
      [level.id]: {
        inputs: newInputs,
        locked: newLocked,
        solved: updatedSolved,
        completed: isLevelComplete,
        starsEarned: (levelRecords[level.id]?.starsEarned || 0),
        timeSpent,
        accuracy,
        rating,
      },
    };

    localStorage.setItem(STORAGE_KEY_STARS, newStars.toString());
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updatedRecords));

    set({
      stars: newStars,
      userInputs: newInputs,
      lockedCells: newLocked,
      solvedClues: updatedSolved,
      poppingCells: popping,
      levelHintsUsed: nextHintsUsed,
      levelRecords: updatedRecords,
    });

    if (isLevelComplete) {
      if (soundEnabled) soundManager.playVictory();
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 },
      });
      setTimeout(() => {
        set({ isLevelCompleteOpen: true });
      }, 600);
    } else {
      setTimeout(() => {
        set({ poppingCells: [] });
      }, 400);
    }
  },

  clearActiveWord: () => {
    const { activeClueId, level, lockedCells, userInputs, levelRecords } = get();
    if (!activeClueId) return;
    const clue = findClueById(level, activeClueId);
    if (!clue) return;
    const newInputs = { ...userInputs };
    for (const [r, c] of clue.cells) {
      const key = `${r},${c}`;
      if (!lockedCells[key]) {
        delete newInputs[key];
      }
    }
    const currentRec = levelRecords[level.id] || {
      inputs: {},
      locked: {},
      solved: [],
      completed: false,
      starsEarned: 0,
    };
    const updatedRecords = {
      ...levelRecords,
      [level.id]: {
        ...currentRec,
        inputs: newInputs,
      },
    };
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updatedRecords));
    set({
      userInputs: newInputs,
      levelRecords: updatedRecords,
      focusedCell: clue.cells[0],
    });
  },

  rewardAdWatch: () => {
    const { stars, soundEnabled, hapticEnabled } = get();
    const newStars = stars + 30;
    localStorage.setItem(STORAGE_KEY_STARS, newStars.toString());
    if (soundEnabled) soundManager.playReward();
    if (hapticEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([20, 40]);
    }
    set({ stars: newStars, isAdModalOpen: false });
  },

  addStars: (amount: number) => {
    const { stars, soundEnabled, hapticEnabled } = get();
    const newStars = Math.max(0, stars + amount);
    localStorage.setItem(STORAGE_KEY_STARS, newStars.toString());
    if (soundEnabled && amount > 0) soundManager.playReward();
    if (hapticEnabled && amount > 0 && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([15, 30]);
    }
    set({ stars: newStars });
  },

  restartLevel: () => {
    const { level, levelRecords } = get();
    const updatedRecords = { ...levelRecords };
    delete updatedRecords[level.id];
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(updatedRecords));

    set({
      userInputs: {},
      lockedCells: {},
      solvedClues: [],
      poppingCells: [],
      shakingCells: [],
      wordStreak: 0,
      comboMessage: null,
      validationMessage: null,
      activeClueId: null,
      focusedCell: null,
      levelStartTime: Date.now(),
      levelMistakes: 0,
      levelHintsUsed: 0,
      isLevelCompleteOpen: false,
      levelRecords: updatedRecords,
    });
  },

  resetAllProgress: () => {
    localStorage.removeItem(STORAGE_KEY_RECORDS);
    localStorage.setItem(STORAGE_KEY_STARS, '120');
    set({
      userInputs: {},
      lockedCells: {},
      solvedClues: [],
      poppingCells: [],
      shakingCells: [],
      wordStreak: 0,
      comboMessage: null,
      validationMessage: null,
      activeClueId: null,
      focusedCell: null,
      stars: 120,
      levelRecords: {},
      currentLevelIndex: 0,
      level: typedLevels[0],
      isLevelCompleteOpen: false,
    });
  },
}));
