import { create } from 'zustand';
import levelsData from '../data/levels.json';
import { type LevelData, type RawLevelData, inflateLevel, findClueById } from '../lib/crossword';
import { THEMES, type ThemeKey, applyTheme } from '../lib/themes';
import { soundManager } from '../lib/audio';
import confetti from 'canvas-confetti';
import { mabarRealtime } from '../lib/mabarRealtime';
import {
  tournamentRealtime,
  type TournamentPeer,
  type MatchProgressPayload,
  type MatchCompletedPayload,
} from '../lib/tournamentRealtime';
import {
  submitDailyRushScore,
  fetchDailyRushLeaderboard,
  type DbDailyRushRecord,
  saveTournamentToDb,
  fetchPublicTournamentsFromDb,
} from '../lib/supabase';
import {
  createInitialTournamentState,
  loadTournamentState,
  advanceTournament,
  loadTrophies,
  createCommunityTournament,
  generateKnockoutBracket,
  advanceTournamentMatch,
  fillRemainingSlotsWithBots,
  simulateConcurrentMatches,
  loadActiveCommunityTournament,
  saveActiveCommunityTournament,
  loadPublicTournaments,
  savePublicTournaments,
  type TournamentCupState,
  type TournamentMatch,
  type TournamentDuelist,
  type TrophyRecord,
  type CommunityTournament,
  type TournamentFormat,
} from '../lib/tournament';
import { haptic } from '../lib/haptics';
import { notificationService } from '../lib/notificationService';
import { calculateEloDelta, getEloTier } from '../lib/eloSystem';
import { syncUserProfile, fetchUserProfile } from '../lib/supabase';

export type TabType = 'home' | 'social' | 'game' | 'quests' | 'profile' | 'stats' | 'settings' | 'arena';

export interface MabarPeerInfo {
  id: string;
  name: string;
  avatar: string;
}

export interface MabarReaction {
  id: string;
  text: string;
  senderName: string;
  avatar?: string;
  clueId?: string;
  clueNumber?: number;
  clueDirection?: 'across' | 'down';
}

export interface BoardSnapshotPayload {
  levelIndex: number;
  userInputs: Record<string, string>;
  lockedCells: Record<string, boolean>;
  solvedClues: string[];
  clueAuthors: Record<string, 'local' | 'partner'>;
  cellAuthors: Record<string, 'local' | 'partner'>;
  senderName: string;
}

export type AvatarFrameKey = 'classic' | 'champion_gold' | 'sapphire' | 'emerald';
export type SoundPackKey = 'apple_tactile' | 'gamelan_classic' | 'acoustic_nylon';

export interface UserProfile {
  id?: string;
  name: string;
  email?: string;
  isGuest: boolean;
  avatar: string;
  avatarFrame?: AvatarFrameKey;
  soundPack?: SoundPackKey;
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

export interface BattleConfig {
  mode?: 'tug_of_war' | 'speed_race';
  rounds: 1 | 3 | 5;
  durationSeconds: number;
  wordCount: 'short' | 'medium' | 'long';
}

export interface DailyRushLastRun {
  score: number;
  speedScore: number;
  accuracyScore: number;
  streakScore: number;
  completionBonus: number;
  timeSpent: number;
  accuracy: number;
  isFullSolved: boolean;
  isNewBest: boolean;
  date: string;
}

export interface AchievementDetailData {
  id: string;
  title: string;
  desc: string;
  rarity: 'Umum' | 'Langka' | 'Epik' | 'Legendaris';
  unlocked: boolean;
  progress: string;
  percent: number;
  rewardStars: number;
  unlockedDate?: string;
}

interface GameState {
  // Navigation
  currentTab: TabType;
  previousTab: TabType;
  setCurrentTab: (tab: TabType) => void;
  arenaSubTab: 'solo' | 'mabar' | 'tournament';
  setArenaSubTab: (subTab: 'solo' | 'mabar' | 'tournament') => void;

  // Game Modes (Classic, Daily Rush, 1v1 Battle)
  gameMode: 'classic' | 'daily_rush' | '1v1_battle';
  dailyRushTimeLeft: number;
  dailyRushRecord: DailyRushRecord | null;
  dailyRushLastRunResult: DailyRushLastRun | null;
  isDailyRushBriefingOpen: boolean;
  openDailyRushBriefing: () => void;
  closeDailyRushBriefing: () => void;
  isDailyRushResultOpen: boolean;
  openDailyRushResult: () => void;
  closeDailyRushResult: () => void;
  startDailyRush: () => void;
  tickDailyRush: () => void;
  finishDailyRush: (completed: boolean) => void;

  // 1v1 Tug-of-War Battle
  battleConfig: BattleConfig;
  setBattleConfig: (config: Partial<BattleConfig>, broadcast?: boolean) => void;
  battleCurrentRound: number;
  battleRoundWins: { local: number; partner: number };
  battleScores: { local: number; partner: number };
  battleClueOwners: Record<string, 'local' | 'partner'>;
  battleTimeLeft: number;
  isBattleLobbyOpen: boolean;
  isBattleResultOpen: boolean;
  battleWinner: 'local' | 'partner' | 'draw' | null;
  openBattleLobby: (mode?: 'tug_of_war' | 'speed_race') => void;
  closeBattleLobby: () => void;
  openBattleResult: () => void;
  closeBattleResult: () => void;
  startBattleMatch: () => void;
  receiveBattleStart: (payload: { levelIndex: number; config: BattleConfig }) => void;
  tickBattleTimer: () => void;
  claimBattleClue: (clueId: string, newlySolved: string[], solver: 'local' | 'partner', partnerName?: string) => void;
  finishBattleRound: () => void;
  startNextBattleRound: () => void;
  rematchBattle: () => void;

  // 1v1 Quick Matchmaking
  isQuickMatchModalOpen: boolean;
  openQuickMatchModal: (mode?: 'speed_race' | 'tug_of_war') => void;
  closeQuickMatchModal: () => void;
  isQuickMatchBot: boolean;
  quickMatchBotOpponent: { name: string; avatar: string } | null;
  quickMatchAiCooldown: number;
  startQuickMatchBattle: (params: {
    opponent: { id: string; name: string; avatar: string; isBot: boolean };
    levelIndex: number;
    config: BattleConfig;
    roomCode: string;
  }) => void;

  // ELO Rating & Chess-inspired Rank System
  eloRating: number;
  battleOpponentElo: number;
  lastEloDelta: number | null;
  customTtsTickets: number;
  isVip: boolean;
  setIsVip: (vip: boolean) => void;
  isVipModalOpen: boolean;
  openVipModal: () => void;
  closeVipModal: () => void;
  battlesStats: { won: number; lost: number; total: number };
  isSachetModalOpen: boolean;
  openSachetModal: () => void;
  closeSachetModal: () => void;
  purchaseSachetPack: () => void;
  isCustomCrosswordModalOpen: boolean;
  openCustomCrosswordModal: () => void;
  closeCustomCrosswordModal: () => void;
  consumeCustomTtsTicket: () => boolean;
  recordBattleEloOutcome: (opponentElo: number, won: boolean | 'draw') => { delta: number; newElo: number };

  // Tournament Cup & Community Tournaments
  isTournamentOpen: boolean;
  openTournament: () => void;
  closeTournament: () => void;
  tournamentState: TournamentCupState;
  resetTournament: () => void;
  trophies: TrophyRecord;
  activeTournamentMatch: TournamentMatch | null;
  isTournamentResultOpen: boolean;
  tournamentResultData: {
    won: boolean;
    roundTitle: string;
    trophyAwarded?: 'gold' | 'silver' | 'bronze';
    opponent: TournamentDuelist;
    playerScore: number;
    opponentScore: number;
  } | null;
  openTournamentResult: () => void;
  closeTournamentResult: () => void;
  startTournamentMatch: () => void;
  tickTournamentAi: () => void;
  tournamentAiCooldown: number;
  tournamentTickets: number;
  lastTicketClaimDate: string;
  claimDailyTicket: () => boolean;
  buyTournamentTicketWithStars: () => boolean;
  setAvatarFrame: (frame: AvatarFrameKey) => void;
  setSoundPack: (pack: SoundPackKey) => void;

  // Community Tournaments
  isCreateTournamentOpen: boolean;
  openCreateTournament: () => void;
  closeCreateTournament: () => void;
  isJoinTournamentOpen: boolean;
  openJoinTournament: () => void;
  closeJoinTournament: () => void;
  isTournamentQrModalOpen: boolean;
  openTournamentQrModal: () => void;
  closeTournamentQrModal: () => void;
  activeTournament: CommunityTournament | null;
  publicTournaments: CommunityTournament[];
  activeCommunityMatchId: string | null;
  createTournament: (
    name: string,
    format: TournamentFormat,
    roundDuration: number,
    themeCategory: string,
    maxPlayers?: number
  ) => CommunityTournament;
  joinTournament: (code: string) => { success: boolean; message: string };
  leaveTournament: () => void;
  fillTournamentSlotsWithBots: () => void;
  startTournamentLobby: () => void;
  startCommunityMatch: (matchId: string, forcedLevelIdx?: number) => void;

  // Tournament Realtime Sync
  tournamentPeers: TournamentPeer[];
  setTournamentPeers: (peers: TournamentPeer[]) => void;
  updateActiveTournamentLocally: (tournament: CommunityTournament) => void;
  receiveTournamentSync: (tournament: CommunityTournament) => void;
  receiveTournamentStart: (tournament: CommunityTournament) => void;
  receiveMatchInit: (matchId: string, levelIndex: number) => void;
  receiveTournamentMatchProgress: (payload: MatchProgressPayload) => void;
  receiveTournamentMatchCompleted: (payload: MatchCompletedPayload) => void;
  receivePublicTournament: (tournament: CommunityTournament) => void;
  removePublicTournament: (tournamentId: string) => void;
  refreshPublicTournamentsFromDb: () => Promise<void>;

  // User Profile
  user: UserProfile;
  setUser: (user: UserProfile) => void;
  updateUserName: (name: string) => void;
  isAuthOpen: boolean;
  openAuth: () => void;
  closeAuth: () => void;
  loginAsGuest: () => void;
  loginWithEmail: (email: string, name: string) => void;
  logout: () => void;
  isPlayerIdModalOpen: boolean;
  openPlayerIdModal: () => void;
  closePlayerIdModal: () => void;

  // Initial Auth & Onboarding Flow
  initialAuthStage: 'auth' | 'onboarding' | 'completed';
  setInitialAuthStage: (stage: 'auth' | 'onboarding' | 'completed') => void;
  proceedToOnboarding: (userData?: { name?: string; email?: string; isGuest?: boolean }) => void;
  completeOnboarding: (customName: string, avatarSrc: string) => void;
  restartOnboarding: () => void;

  // Theme
  theme: ThemeKey;
  setTheme: (theme: ThemeKey) => void;

  // Sound & Haptics
  soundEnabled: boolean;
  toggleSound: () => void;
  hapticEnabled: boolean;
  toggleHaptic: () => void;
  ambientEnabled: boolean;
  toggleAmbient: () => void;
  ambientVolume: number;
  setAmbientVolume: (vol: number) => void;

  // Smart Retention Notifications
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  isNotificationPromptOpen: boolean;
  openNotificationPrompt: () => void;
  closeNotificationPrompt: () => void;

  // Levels & Progress
  levels: LevelData[];
  currentLevelIndex: number;
  level: LevelData;
  selectLevel: (index: number, broadcastMabar?: boolean) => void;
  goToNextLevel: () => void;
  playRandomLevel: () => void;
  levelRecords: Record<string, LevelProgressRecord>;

  // Streak, Currency & Retention Engine (Opsi A)
  streak: number;
  streakShields: number;
  lastActiveDate: string;
  isStreakSavedModalOpen: boolean;
  openStreakSavedModal: () => void;
  closeStreakSavedModal: () => void;
  buyStreakShield: () => boolean;
  checkDailyStreakOnMount: () => void;
  incrementStreakIfNewDay: () => void;
  stars: number;

  // Divisi Liga Mingguan (Weekly Leagues)
  weeklyLeagueXp: number;
  weeklyLeagueWeekKey: string;
  isLeagueModalOpen: boolean;
  openLeagueModal: () => void;
  closeLeagueModal: () => void;
  addWeeklyLeagueXp: (amount: number) => void;

  // Achievement Detail & Rewards
  selectedAchievement: AchievementDetailData | null;
  isAchievementModalOpen: boolean;
  claimedAchievementRewards: Record<string, boolean>;
  openAchievementDetail: (achievement: AchievementDetailData) => void;
  closeAchievementDetail: () => void;
  claimAchievementReward: (achievementId: string) => void;

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
  leaveMabarSession: () => void;
  cellAuthors: Record<string, 'local' | 'partner'>;
  clueAuthors: Record<string, 'local' | 'partner'>;
  activeReaction: MabarReaction | null;
  sendReaction: (text: string, clueId?: string) => void;
  receiveReaction: (reaction: { text: string; senderName: string; avatar?: string; clueId?: string }) => void;
  clearReaction: () => void;
  nextLevelProposal: { targetLevelIndex: number; senderName: string } | null;
  isWaitingForPartnerNextLevel: boolean;
  proposeNextLevel: (targetLevelIndex: number) => void;
  receiveNextLevelProposal: (data: { targetLevelIndex: number; senderName: string }) => void;
  acceptNextLevelProposal: () => void;
  confirmNextLevelTogether: (targetLevelIndex: number) => void;
  cancelNextLevelProposal: (broadcast?: boolean) => void;
  partnerReconnecting: string | null;
  setPartnerReconnecting: (name: string | null) => void;
  applyBoardSnapshot: (snapshot: BoardSnapshotPayload) => void;

  // Modals
  isSettingsOpen: boolean;
  isLevelCompleteOpen: boolean;
  isLevelSelectOpen: boolean;
  isLexiconOpen: boolean;
  isAvatarPickerOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  openAvatarPicker: () => void;
  closeAvatarPicker: () => void;
  closeLevelComplete: () => void;
  openLevelSelect: () => void;
  closeLevelSelect: () => void;
  openLexicon: () => void;
  closeLexicon: () => void;
  isLegalModalOpen: boolean;
  legalModalTab: 'privacy' | 'terms' | 'kbbi';
  openLegalModal: (tab?: 'privacy' | 'terms' | 'kbbi') => void;
  closeLegalModal: () => void;
  setLegalModalTab: (tab: 'privacy' | 'terms' | 'kbbi') => void;
  deleteAccountAndData: () => void;
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
  isQrModalOpen: boolean;
  openQrModal: () => void;
  closeQrModal: () => void;
  isScannerOpen: boolean;
  openScanner: () => void;
  closeScanner: () => void;

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
  restartLevel: () => void;
  resetAllProgress: () => void;

  // Smart Solving & Assisting Engine (Opsi 1)
  errorFeedbackMode: 'gentle' | 'purist';
  setErrorFeedbackMode: (mode: 'gentle' | 'purist') => void;
  autoAdvanceEnabled: boolean;
  toggleAutoAdvance: () => void;
  isAnagramDrawerOpen: boolean;
  openAnagramDrawer: () => void;
  closeAnagramDrawer: () => void;
  applyAnagramWord: (word: string) => void;
}

const STORAGE_KEY_THEME = 'tts_quest_theme';
const STORAGE_KEY_STARS = 'tts_quest_stars';
const STORAGE_KEY_USER = 'tts_quest_user';
const STORAGE_KEY_RECORDS = 'tts_quest_records_v2';
const STORAGE_KEY_SOUND = 'tts_quest_sound';
const STORAGE_KEY_HAPTIC = 'tts_haptics';
const STORAGE_KEY_LEVEL_IDX = 'tts_quest_level_idx';
const STORAGE_KEY_DAILY_RUSH = 'tts_quest_daily_rush_record';
const STORAGE_KEY_ACTIVE_ROOM = 'tts_quest_active_room';
const STORAGE_KEY_STREAK = 'tts_quest_streak';
const STORAGE_KEY_STREAK_SHIELDS = 'tts_quest_streak_shields';
const STORAGE_KEY_LAST_ACTIVE_DATE = 'tts_quest_last_active_date';
const STORAGE_KEY_WEEKLY_LEAGUE_XP = 'tts_quest_weekly_league_xp';
const STORAGE_KEY_WEEKLY_LEAGUE_WEEK = 'tts_quest_weekly_league_week';
const STORAGE_KEY_CLAIMED_ACHIEVEMENTS = 'tts_quest_claimed_achievements';
const STORAGE_KEY_LAST_COMPLETED_DAY = 'tts_quest_last_completed_day';
const STORAGE_KEY_ERROR_FEEDBACK = 'tts_quest_error_feedback_mode';
const STORAGE_KEY_AUTO_ADVANCE = 'tts_auto_advance';
const STORAGE_KEY_ONBOARDED = 'tts_quest_onboarded';
const STORAGE_KEY_TICKETS = 'tts_tournament_tickets_v1';
const STORAGE_KEY_TICKET_DATE = 'tts_last_ticket_claim_v1';
const STORAGE_KEY_NOTIFICATIONS = 'tts_notifications_enabled_v1';
const STORAGE_KEY_NOTIFICATION_PROMPT_SHOWN = 'tts_notification_prompt_shown_v1';
const STORAGE_KEY_AMBIENT_ENABLED = 'tts_ambient_enabled_v1';
const STORAGE_KEY_AMBIENT_VOLUME = 'tts_ambient_volume_v1';
const STORAGE_KEY_ELO = 'tts_elo_rating_v1';
const STORAGE_KEY_CUSTOM_TTS_TICKETS = 'tts_custom_tickets_v1';
const STORAGE_KEY_IS_VIP = 'tts_is_vip_v1';
const STORAGE_KEY_BATTLES_STATS = 'tts_battles_stats_v1';

function getInitialElo(): number {
  if (typeof window === 'undefined') return 1000;
  const val = localStorage.getItem(STORAGE_KEY_ELO);
  return val ? parseInt(val, 10) : 1000;
}

function getInitialCustomTickets(): number {
  if (typeof window === 'undefined') return 0;
  const val = localStorage.getItem(STORAGE_KEY_CUSTOM_TTS_TICKETS);
  return val ? parseInt(val, 10) : 0;
}

function getInitialIsVip(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_IS_VIP) === 'true';
}

function getInitialBattlesStats(): { won: number; lost: number; total: number } {
  if (typeof window === 'undefined') return { won: 0, lost: 0, total: 0 };
  try {
    const val = localStorage.getItem(STORAGE_KEY_BATTLES_STATS);
    return val ? JSON.parse(val) : { won: 0, lost: 0, total: 0 };
  } catch {
    return { won: 0, lost: 0, total: 0 };
  }
}

function getInitialAmbientEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY_AMBIENT_ENABLED) === 'true';
}

function getInitialAmbientVolume(): number {
  if (typeof window === 'undefined') return 0.25;
  const saved = localStorage.getItem(STORAGE_KEY_AMBIENT_VOLUME);
  return saved ? parseFloat(saved) : 0.25;
}

function getInitialNotificationsEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEY_NOTIFICATIONS) !== 'false';
}

function getInitialTickets(): number {
  if (typeof window === 'undefined') return 3;
  const saved = localStorage.getItem(STORAGE_KEY_TICKETS);
  if (saved !== null) {
    const num = parseInt(saved, 10);
    if (!isNaN(num) && num >= 0) return num;
  }
  return 3;
}

function getInitialTicketDate(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_TICKET_DATE) || '';
}

function getInitialAuthStage(): 'auth' | 'onboarding' | 'completed' {
  if (typeof window === 'undefined') return 'completed';
  return localStorage.getItem(STORAGE_KEY_ONBOARDED) === 'true' ? 'completed' : 'auth';
}

function getInitialErrorFeedbackMode(): 'gentle' | 'purist' {
  if (typeof window === 'undefined') return 'gentle';
  const saved = localStorage.getItem(STORAGE_KEY_ERROR_FEEDBACK);
  return saved === 'purist' ? 'purist' : 'gentle';
}

function getInitialAutoAdvance(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEY_AUTO_ADVANCE) !== 'false';
}

export function getIsoWeekKey(d: Date = new Date()): string {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNum = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function getInitialStreak(): number {
  if (typeof window === 'undefined') return 3;
  const saved = localStorage.getItem(STORAGE_KEY_STREAK);
  if (saved !== null) {
    const num = parseInt(saved, 10);
    if (!isNaN(num) && num >= 1) return num;
  }
  return 3;
}

function getInitialStreakShields(): number {
  if (typeof window === 'undefined') return 1;
  const saved = localStorage.getItem(STORAGE_KEY_STREAK_SHIELDS);
  if (saved !== null) {
    const num = parseInt(saved, 10);
    if (!isNaN(num) && num >= 0 && num <= 2) return num;
  }
  return 1;
}

function getInitialLastActiveDate(): string {
  if (typeof window === 'undefined') return getTodayDateString();
  return localStorage.getItem(STORAGE_KEY_LAST_ACTIVE_DATE) || getTodayDateString();
}

function getInitialWeeklyLeagueXp(): number {
  if (typeof window === 'undefined') return 240;
  const currentWeek = getIsoWeekKey();
  const savedWeek = localStorage.getItem(STORAGE_KEY_WEEKLY_LEAGUE_WEEK);
  if (savedWeek !== currentWeek) {
    localStorage.setItem(STORAGE_KEY_WEEKLY_LEAGUE_WEEK, currentWeek);
    localStorage.setItem(STORAGE_KEY_WEEKLY_LEAGUE_XP, '240');
    return 240;
  }
  const savedXp = localStorage.getItem(STORAGE_KEY_WEEKLY_LEAGUE_XP);
  if (savedXp !== null) {
    const num = parseInt(savedXp, 10);
    if (!isNaN(num) && num >= 0) return num;
  }
  return 240;
}

function getInitialClaimedAchievements(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  const saved = localStorage.getItem(STORAGE_KEY_CLAIMED_ACHIEVEMENTS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return {};
    }
  }
  return {};
}

function getInitialActiveRoomCode(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY_ACTIVE_ROOM);
}

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

const typedLevels: LevelData[] = (levelsData as unknown as RawLevelData[]).map(inflateLevel);

function generatePlayerId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TTS-${code}`;
}

function getInitialUser(): UserProfile {
  const defaultAvatar = '/maskot/Fierce Plush Crossword Champion.webp';
  if (typeof window === 'undefined') {
    return { id: 'TTS-8842', name: 'Pemain TTS', isGuest: true, avatar: defaultAvatar, joinedAt: 'Hari ini' };
  }
  const saved = localStorage.getItem(STORAGE_KEY_USER);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.name === 'Penjelajah') parsed.name = 'Pemain TTS';
      if (!parsed.id) {
        parsed.id = generatePlayerId();
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(parsed));
      }
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
  const newUser: UserProfile = {
    id: generatePlayerId(),
    name: 'Pemain TTS',
    isGuest: true,
    avatar: defaultAvatar,
    joinedAt: 'Hari ini',
  };
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
  return newUser;
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

export function findLevelForWordCount(levels: LevelData[], preference: 'short' | 'medium' | 'long'): number {
  const matches: number[] = [];
  levels.forEach((lvl, idx) => {
    const totalWords = (lvl.clues.across?.length || 0) + (lvl.clues.down?.length || 0);
    if (preference === 'short' && totalWords >= 4 && totalWords <= 6) {
      matches.push(idx);
    } else if (preference === 'medium' && totalWords >= 7 && totalWords <= 9) {
      matches.push(idx);
    } else if (preference === 'long' && totalWords >= 10) {
      matches.push(idx);
    }
  });
  if (matches.length > 0) {
    return matches[Math.floor(Math.random() * matches.length)];
  }
  return Math.floor(Math.random() * levels.length);
}

export const useGameStore = create<GameState>((set, get) => ({
  currentTab: 'home',
  previousTab: 'home',
  setCurrentTab: (tab) => set((state) => ({ previousTab: state.currentTab, currentTab: tab })),
  arenaSubTab: 'solo',
  setArenaSubTab: (subTab) => set({ arenaSubTab: subTab }),

  user: getInitialUser(),
  setUser: (user) => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    set({ user });
  },
  updateUserName: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const current = get().user;
    const updated: UserProfile = { ...current, name: trimmed };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    set({ user: updated });
  },
  isAuthOpen: false,
  openAuth: () => set({ isAuthOpen: true }),
  closeAuth: () => set({ isAuthOpen: false }),

  isPlayerIdModalOpen: false,
  openPlayerIdModal: () => set({ isPlayerIdModalOpen: true }),
  closePlayerIdModal: () => set({ isPlayerIdModalOpen: false }),

  initialAuthStage: getInitialAuthStage(),
  setInitialAuthStage: (stage) => set({ initialAuthStage: stage }),
  proceedToOnboarding: (userData) => {
    if (userData) {
      const currentId = get().user?.id || generatePlayerId();
      const isGuestMode = userData.isGuest ?? (userData.email ? false : true);
      const updated: UserProfile = {
        id: currentId,
        name: userData.name?.trim() || get().user?.name || 'Pemain TTS',
        email: userData.email?.trim() || get().user?.email,
        isGuest: isGuestMode,
        avatar: get().user?.avatar || '/maskot/Fierce Plush Crossword Champion.webp',
        joinedAt: isGuestMode ? 'Mode Tamu' : 'Oktober 2026',
      };
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
      set({ user: updated, initialAuthStage: 'onboarding' });
    } else {
      set({ initialAuthStage: 'onboarding' });
    }
  },
  completeOnboarding: (customName, avatarSrc) => {
    const current = get().user;
    const updated: UserProfile = {
      ...current,
      name: customName.trim() || current.name || 'Pemain TTS',
      avatar: avatarSrc || current.avatar,
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
    localStorage.setItem(STORAGE_KEY_ONBOARDED, 'true');
    set({ user: updated, initialAuthStage: 'completed', currentTab: 'home' });
  },
  restartOnboarding: () => {
    localStorage.removeItem(STORAGE_KEY_ONBOARDED);
    set({ initialAuthStage: 'auth' });
  },

  loginAsGuest: () => {
    const currentId = get().user?.id || generatePlayerId();
    const guestUser: UserProfile = {
      id: currentId,
      name: 'Tamu Lokal',
      isGuest: true,
      avatar: '/maskot/Fierce Plush Crossword Champion.webp',
      joinedAt: 'Mode Tamu',
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(guestUser));
    set({ user: guestUser, isAuthOpen: false });
  },

  loginWithEmail: async (email: string, name: string) => {
    const currentId = get().user?.id || generatePlayerId();
    const emailUser: UserProfile = {
      id: currentId,
      name: name.trim() || 'Pemain TTS',
      email: email.trim(),
      isGuest: false,
      avatar: '/maskot/Playful Plush Crossword Board.webp',
      joinedAt:
        get().user?.joinedAt && get().user.joinedAt !== 'Mode Tamu' && get().user.joinedAt !== 'Hari ini'
          ? get().user.joinedAt
          : 'Oktober 2026',
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(emailUser));
    set({ user: emailUser, isAuthOpen: false });

    // Restore or sync profile to Supabase cloud
    try {
      const cloud = await fetchUserProfile(currentId);
      if (cloud) {
        if (typeof cloud.elo_rating === 'number') {
          localStorage.setItem(STORAGE_KEY_ELO, String(cloud.elo_rating));
          set({ eloRating: cloud.elo_rating });
        }
        if (typeof cloud.custom_tickets === 'number') {
          localStorage.setItem(STORAGE_KEY_CUSTOM_TTS_TICKETS, String(cloud.custom_tickets));
          set({ customTtsTickets: cloud.custom_tickets });
        }
        if (typeof cloud.is_vip === 'boolean') {
          localStorage.setItem(STORAGE_KEY_IS_VIP, String(cloud.is_vip));
          set({ isVip: cloud.is_vip });
        }
      } else {
        syncUserProfile({
          id: emailUser.id,
          name: emailUser.name,
          avatar: emailUser.avatar,
          isGuest: false,
          stars: get().stars,
          streak: get().streak,
          totalWordsSolved: get().solvedClues.length,
          eloRating: get().eloRating,
          customTickets: get().customTtsTickets,
          isVip: get().isVip,
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Failed cloud profile sync:', err);
    }
  },

  logout: () => {
    const currentId = get().user?.id || generatePlayerId();
    const defaultUser: UserProfile = {
      id: currentId,
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
    if (!next) {
      soundManager.stopFocusAmbient();
    } else if (get().ambientEnabled) {
      soundManager.startFocusAmbient(get().ambientVolume);
    }
  },

  ambientEnabled: getInitialAmbientEnabled(),
  ambientVolume: getInitialAmbientVolume(),
  toggleAmbient: () => {
    const next = !get().ambientEnabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_AMBIENT_ENABLED, String(next));
    }
    set({ ambientEnabled: next });
    if (next && get().soundEnabled) {
      soundManager.startFocusAmbient(get().ambientVolume);
      get().showGlobalToast('Musik Latar Santai Aktif ☕', 2400);
    } else {
      soundManager.stopFocusAmbient();
      get().showGlobalToast('Musik Latar Santai Dimatikan', 2000);
    }
  },
  setAmbientVolume: (vol: number) => {
    const safeVol = Math.max(0.05, Math.min(1.0, vol));
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_AMBIENT_VOLUME, String(safeVol));
    }
    set({ ambientVolume: safeVol });
    soundManager.setFocusAmbientVolume(safeVol);
  },

  hapticEnabled: typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_HAPTIC) !== 'false' : true,
  toggleHaptic: () => {
    const next = !get().hapticEnabled;
    localStorage.setItem(STORAGE_KEY_HAPTIC, String(next));
    if (next) {
      haptic.medium(25);
    }
    set({ hapticEnabled: next });
  },

  notificationsEnabled: getInitialNotificationsEnabled(),
  setNotificationsEnabled: (enabled: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, String(enabled));
      localStorage.setItem(STORAGE_KEY_NOTIFICATION_PROMPT_SHOWN, 'true');
    }
    set({ notificationsEnabled: enabled });
    if (enabled) {
      notificationService.scheduleDailyRetention(get().streak);
    } else {
      notificationService.cancelAll();
    }
  },
  isNotificationPromptOpen: false,
  openNotificationPrompt: () => set({ isNotificationPromptOpen: true }),
  closeNotificationPrompt: () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_NOTIFICATION_PROMPT_SHOWN, 'true');
    }
    set({ isNotificationPromptOpen: false });
  },

  levels: typedLevels,
  currentLevelIndex: initialLevelIdx,
  level: currentInitialLevel,
  levelRecords: initialRecords,
  gameMode: 'classic',
  dailyRushTimeLeft: 90,
  dailyRushRecord: getInitialDailyRushRecord(),
  dailyRushLastRunResult: null,
  isDailyRushBriefingOpen: false,
  openDailyRushBriefing: () => set({ isDailyRushBriefingOpen: true }),
  closeDailyRushBriefing: () => set({ isDailyRushBriefingOpen: false }),
  isDailyRushResultOpen: false,
  openDailyRushResult: () => set({ isDailyRushResultOpen: true }),
  closeDailyRushResult: () => {
    set({ isDailyRushResultOpen: false });
    if (typeof window !== 'undefined') {
      const promptShown = localStorage.getItem(STORAGE_KEY_NOTIFICATION_PROMPT_SHOWN);
      if (promptShown !== 'true' && notificationService.isSupported()) {
        setTimeout(() => {
          set({ isNotificationPromptOpen: true });
        }, 400);
      }
    }
  },
  streak: getInitialStreak(),
  streakShields: getInitialStreakShields(),
  lastActiveDate: getInitialLastActiveDate(),
  isStreakSavedModalOpen: false,
  openStreakSavedModal: () => set({ isStreakSavedModalOpen: true }),
  closeStreakSavedModal: () => set({ isStreakSavedModalOpen: false }),

  checkDailyStreakOnMount: () => {
    const todayStr = getTodayDateString();
    const lastActive = get().lastActiveDate;
    if (!lastActive) {
      localStorage.setItem(STORAGE_KEY_LAST_ACTIVE_DATE, todayStr);
      set({ lastActiveDate: todayStr });
      return;
    }
    if (lastActive === todayStr) {
      return; // Already active today
    }

    // Calculate day difference
    const [tY, tM, tD] = todayStr.split('-').map(Number);
    const [lY, lM, lD] = lastActive.split('-').map(Number);
    const tDate = new Date(tY, tM - 1, tD);
    const lDate = new Date(lY, lM - 1, lD);
    const diffDays = Math.round((tDate.getTime() - lDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Normal continuity
      localStorage.setItem(STORAGE_KEY_LAST_ACTIVE_DATE, todayStr);
      set({ lastActiveDate: todayStr });
    } else if (diffDays === 2) {
      // Missed exactly 1 day (yesterday)
      const { streakShields, soundEnabled } = get();
      if (streakShields > 0) {
        const nextShields = streakShields - 1;
        localStorage.setItem(STORAGE_KEY_STREAK_SHIELDS, String(nextShields));
        localStorage.setItem(STORAGE_KEY_LAST_ACTIVE_DATE, todayStr);
        set({
          streakShields: nextShields,
          lastActiveDate: todayStr,
          isStreakSavedModalOpen: true,
        });
        if (soundEnabled) soundManager.playReward();
      } else {
        localStorage.setItem(STORAGE_KEY_STREAK, '1');
        localStorage.setItem(STORAGE_KEY_LAST_ACTIVE_DATE, todayStr);
        set({
          streak: 1,
          lastActiveDate: todayStr,
        });
        get().showGlobalToast('Streak terputus karena terlewat 1 hari tanpa perisai.', 3500);
      }
    } else if (diffDays > 2) {
      // Missed multiple days
      localStorage.setItem(STORAGE_KEY_STREAK, '1');
      localStorage.setItem(STORAGE_KEY_LAST_ACTIVE_DATE, todayStr);
      set({
        streak: 1,
        lastActiveDate: todayStr,
      });
      get().showGlobalToast('Streak terputus karena absen beberapa hari.', 3500);
    }

    // Ensure daily smart retention notifications are scheduled if enabled
    if (get().notificationsEnabled) {
      notificationService.scheduleDailyRetention(get().streak);
      const lastCompleted = localStorage.getItem(STORAGE_KEY_LAST_COMPLETED_DAY);
      if (lastCompleted === todayStr) {
        notificationService.cancelTodayStreakWarning();
      }
    }
  },

  incrementStreakIfNewDay: () => {
    const today = getTodayDateString();
    const lastCompleted = localStorage.getItem(STORAGE_KEY_LAST_COMPLETED_DAY);
    if (lastCompleted === today) return; // already counted today

    const nextStreak = get().streak + 1;
    localStorage.setItem(STORAGE_KEY_LAST_COMPLETED_DAY, today);
    localStorage.setItem(STORAGE_KEY_STREAK, String(nextStreak));
    localStorage.setItem(STORAGE_KEY_LAST_ACTIVE_DATE, today);
    set({
      streak: nextStreak,
      lastActiveDate: today,
    });

    // Cancel tonight's 21:00 urgent streak warning since streak has been extended today!
    notificationService.cancelTodayStreakWarning();

    get().showGlobalToast(`Api Streak Membara! 🔥 ${nextStreak} Hari Berturut-turut!`, 3200);
  },

  buyStreakShield: () => {
    const { stars, streakShields, soundEnabled } = get();
    if (streakShields >= 2) {
      get().showGlobalToast('Slot Perisai sudah penuh (Maksimal 2 perisai).');
      return false;
    }
    if (stars < 100) {
      get().showGlobalToast('Bintang tidak cukup! Butuh 100★ untuk membeli perisai.');
      return false;
    }
    const nextStars = stars - 100;
    const nextShields = streakShields + 1;
    localStorage.setItem(STORAGE_KEY_STARS, String(nextStars));
    localStorage.setItem(STORAGE_KEY_STREAK_SHIELDS, String(nextShields));
    set({
      stars: nextStars,
      streakShields: nextShields,
    });
    if (soundEnabled) soundManager.playReward();
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 },
    });
    get().showGlobalToast('Berhasil membeli 1 Perisai Runtun (-100★)!');
    return true;
  },

  weeklyLeagueXp: getInitialWeeklyLeagueXp(),
  weeklyLeagueWeekKey: getIsoWeekKey(),
  isLeagueModalOpen: false,
  openLeagueModal: () => set({ isLeagueModalOpen: true }),
  closeLeagueModal: () => set({ isLeagueModalOpen: false }),

  addWeeklyLeagueXp: (amount: number) => {
    if (amount <= 0) return;
    const currentWeek = getIsoWeekKey();
    const { weeklyLeagueWeekKey, weeklyLeagueXp } = get();
    let base = weeklyLeagueXp;
    if (weeklyLeagueWeekKey !== currentWeek) {
      base = 0;
      localStorage.setItem(STORAGE_KEY_WEEKLY_LEAGUE_WEEK, currentWeek);
    }
    const newXp = base + amount;
    localStorage.setItem(STORAGE_KEY_WEEKLY_LEAGUE_XP, String(newXp));
    set({
      weeklyLeagueXp: newXp,
      weeklyLeagueWeekKey: currentWeek,
    });
  },

  selectedAchievement: null,
  isAchievementModalOpen: false,
  claimedAchievementRewards: getInitialClaimedAchievements(),
  openAchievementDetail: (achievement: AchievementDetailData) => {
    set({
      selectedAchievement: achievement,
      isAchievementModalOpen: true,
    });
  },
  closeAchievementDetail: () => {
    set({
      isAchievementModalOpen: false,
      selectedAchievement: null,
    });
  },
  claimAchievementReward: (achievementId: string) => {
    const { claimedAchievementRewards, addStars, soundEnabled } = get();
    if (claimedAchievementRewards[achievementId]) {
      get().showGlobalToast('Hadiah lencana ini sudah diklaim.');
      return;
    }
    const updated = { ...claimedAchievementRewards, [achievementId]: true };
    localStorage.setItem(STORAGE_KEY_CLAIMED_ACHIEVEMENTS, JSON.stringify(updated));
    addStars(25);
    set({ claimedAchievementRewards: updated });
    if (soundEnabled) soundManager.playReward();
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.7 },
    });
    get().showGlobalToast('Hadiah Lencana Diklaim (+25★)!', 2800);
  },

  // Smart Solving & Assisting Engine State & Actions
  errorFeedbackMode: getInitialErrorFeedbackMode(),
  setErrorFeedbackMode: (mode: 'gentle' | 'purist') => {
    localStorage.setItem(STORAGE_KEY_ERROR_FEEDBACK, mode);
    set({ errorFeedbackMode: mode });
  },

  autoAdvanceEnabled: getInitialAutoAdvance(),
  toggleAutoAdvance: () => {
    const next = !get().autoAdvanceEnabled;
    localStorage.setItem(STORAGE_KEY_AUTO_ADVANCE, String(next));
    set({ autoAdvanceEnabled: next });
  },

  isAnagramDrawerOpen: false,
  openAnagramDrawer: () => set({ isAnagramDrawerOpen: true }),
  closeAnagramDrawer: () => set({ isAnagramDrawerOpen: false }),

  applyAnagramWord: (word: string) => {
    const { level, activeClueId, userInputs, lockedCells } = get();
    if (!activeClueId) return;
    const clue = findClueById(level, activeClueId);
    if (!clue) return;

    const letters = word.toUpperCase().split('');
    const newInputs = { ...userInputs };
    clue.cells.forEach(([r, c], i) => {
      const key = `${r},${c}`;
      if (!lockedCells[key] && letters[i]) {
        newInputs[key] = letters[i];
      }
    });

    set({ userInputs: newInputs, isAnagramDrawerOpen: false });
    setTimeout(() => {
      get().checkAnswers();
    }, 50);
  },

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
  activeRoomCode: getInitialActiveRoomCode(),
  setActiveRoomCode: (code: string | null) => {
    if (code) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ROOM, code);
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_ROOM);
    }
    set({ activeRoomCode: code });
    if (code) {
      const { user } = get();
      mabarRealtime.joinRoom(code, { name: user.name, avatar: user.avatar });
    } else {
      mabarRealtime.leaveRoom();
    }
  },

  partnerReconnecting: null,
  setPartnerReconnecting: (name: string | null) => set({ partnerReconnecting: name }),
  mabarPeers: [],
  partnerCursor: null,
  cellAuthors: {},
  clueAuthors: {},
  activeReaction: null,
  nextLevelProposal: null,
  isWaitingForPartnerNextLevel: false,
  setMabarPeers: (peers) => set({ mabarPeers: peers }),
  setPartnerCursor: (cursor) => set({ partnerCursor: cursor }),

  applyRemoteInput: (key, letter, partnerName) => {
    const { userInputs, soundEnabled, lockedCells, cellAuthors } = get();
    if (lockedCells[key]) return;
    const newInputs = { ...userInputs, [key]: letter };
    const newAuthors = { ...cellAuthors, [key]: 'partner' as const };
    if (soundEnabled) soundManager.playKeyClick();
    set({
      userInputs: newInputs,
      cellAuthors: newAuthors,
      partnerCursor: { key, name: partnerName },
    });
  },

  applyRemoteDelete: (key) => {
    const { userInputs, lockedCells, cellAuthors } = get();
    if (lockedCells[key]) return;
    const newInputs = { ...userInputs };
    const newAuthors = { ...cellAuthors };
    delete newInputs[key];
    delete newAuthors[key];
    set({ userInputs: newInputs, cellAuthors: newAuthors });
  },

  applyRemoteClueSolved: (clueId, newlySolved, partnerName) => {
    const { solvedClues, level, lockedCells, soundEnabled, userInputs, cellAuthors, clueAuthors } = get();
    const updatedSolved = Array.from(new Set([...solvedClues, ...newlySolved, clueId]));
    const newLocked = { ...lockedCells };
    const newInputs = { ...userInputs };
    const newAuthors = { ...cellAuthors };
    const newClueAuthors = { ...clueAuthors };

    updatedSolved.forEach((cId) => {
      if (cId && !newClueAuthors[cId]) {
        newClueAuthors[cId] = 'partner';
      }
      const clue = findClueById(level, cId);
      if (clue) {
        clue.cells.forEach(([r, c], idx) => {
          const k = `${r},${c}`;
          newLocked[k] = true;
          newInputs[k] = clue.answer[idx];
          newAuthors[k] = 'partner';
        });
      }
    });

    if (soundEnabled) soundManager.playWordCorrect(1);

    const totalClues = (level.clues.across?.length || 0) + (level.clues.down?.length || 0);
    const isLevelComplete = totalClues > 0 && updatedSolved.length >= totalClues;

    set({
      solvedClues: updatedSolved,
      lockedCells: newLocked,
      userInputs: newInputs,
      cellAuthors: newAuthors,
      clueAuthors: newClueAuthors,
      validationMessage: isLevelComplete ? 'Papan Berhasil Dipecahkan Bersama!' : `${partnerName} memecahkan kata!`,
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
    }

    setTimeout(() => {
      if (get().validationMessage?.includes(partnerName)) {
        set({ validationMessage: null });
      }
    }, 2500);
  },

  leaveMabarSession: () => {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_ROOM);
    mabarRealtime.leaveRoom();
    set({
      activeRoomCode: null,
      mabarPeers: [],
      partnerCursor: null,
      partnerReconnecting: null,
      cellAuthors: {},
      clueAuthors: {},
      activeReaction: null,
      nextLevelProposal: null,
      isWaitingForPartnerNextLevel: false,
    });
    get().showGlobalToast('Keluar dari sesi mabar');
  },

  sendReaction: (text: string, clueId?: string) => {
    const { user, level } = get();
    const clue = clueId ? findClueById(level, clueId) : undefined;
    const reaction: MabarReaction = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      senderName: user.name || 'Kamu',
      avatar: user.avatar,
      clueId,
      clueNumber: clue?.number,
      clueDirection: clue?.direction,
    };
    mabarRealtime.broadcastReaction({ text, clueId });
    set({ activeReaction: reaction });
    setTimeout(() => {
      if (get().activeReaction?.id === reaction.id) {
        set({ activeReaction: null });
      }
    }, 3800);
  },

  receiveReaction: (data) => {
    const { level, soundEnabled } = get();
    const clue = data.clueId ? findClueById(level, data.clueId) : undefined;
    const reaction: MabarReaction = {
      id: `${Date.now()}-${Math.random()}`,
      text: data.text,
      senderName: data.senderName,
      avatar: data.avatar,
      clueId: data.clueId,
      clueNumber: clue?.number,
      clueDirection: clue?.direction,
    };
    if (soundEnabled) soundManager.playKeyClick();
    set({ activeReaction: reaction });
    setTimeout(() => {
      if (get().activeReaction?.id === reaction.id) {
        set({ activeReaction: null });
      }
    }, 3800);
  },

  clearReaction: () => set({ activeReaction: null }),

  proposeNextLevel: (targetLevelIndex: number) => {
    const { mabarPeers, selectLevel, closeLevelComplete } = get();
    // If no other peer in the room, advance immediately
    if (mabarPeers.length <= 1) {
      selectLevel(targetLevelIndex, true);
      closeLevelComplete();
      return;
    }
    mabarRealtime.broadcastNextLevelProposal(targetLevelIndex);
    set({ isWaitingForPartnerNextLevel: true });
    get().showGlobalToast('Mengajak teman lanjut ke bab berikutnya...');
  },

  receiveNextLevelProposal: (data: { targetLevelIndex: number; senderName: string }) => {
    const { soundEnabled } = get();
    if (soundEnabled) soundManager.playKeyClick();
    set({ nextLevelProposal: data });
  },

  acceptNextLevelProposal: () => {
    const { nextLevelProposal, selectLevel, closeLevelComplete } = get();
    if (!nextLevelProposal) return;
    const targetIdx = nextLevelProposal.targetLevelIndex;
    mabarRealtime.broadcastNextLevelAccept(targetIdx);
    selectLevel(targetIdx, true);
    closeLevelComplete();
    set({ nextLevelProposal: null, isWaitingForPartnerNextLevel: false });
    get().showGlobalToast(`Maju ke Bab ${targetIdx + 1} Bersama!`, 3000);
  },

  confirmNextLevelTogether: (targetLevelIndex: number) => {
    const { selectLevel, closeLevelComplete } = get();
    selectLevel(targetLevelIndex, true);
    closeLevelComplete();
    set({ nextLevelProposal: null, isWaitingForPartnerNextLevel: false });
    get().showGlobalToast(`Maju ke Bab ${targetLevelIndex + 1} Bersama!`, 3000);
  },

  cancelNextLevelProposal: (broadcast = true) => {
    if (broadcast) {
      mabarRealtime.broadcastNextLevelCancel();
    }
    set({ nextLevelProposal: null, isWaitingForPartnerNextLevel: false });
  },

  applyBoardSnapshot: (snapshot: BoardSnapshotPayload) => {
    const { currentLevelIndex, selectLevel, level } = get();
    if (currentLevelIndex !== snapshot.levelIndex) {
      selectLevel(snapshot.levelIndex);
    }

    const invertedClueAuthors: Record<string, 'local' | 'partner'> = {};
    if (snapshot.clueAuthors) {
      Object.entries(snapshot.clueAuthors).forEach(([cId, author]) => {
        invertedClueAuthors[cId] = author === 'local' ? 'partner' : 'local';
      });
    }

    const invertedCellAuthors: Record<string, 'local' | 'partner'> = {};
    if (snapshot.cellAuthors) {
      Object.entries(snapshot.cellAuthors).forEach(([key, author]) => {
        invertedCellAuthors[key] = author === 'local' ? 'partner' : 'local';
      });
    }

    const totalClues = (level.clues?.across?.length || 0) + (level.clues?.down?.length || 0);
    const isLevelComplete = totalClues > 0 && snapshot.solvedClues.length >= totalClues;

    set({
      userInputs: { ...snapshot.userInputs },
      lockedCells: { ...snapshot.lockedCells },
      solvedClues: [...snapshot.solvedClues],
      clueAuthors: invertedClueAuthors,
      cellAuthors: invertedCellAuthors,
      isLevelCompleteOpen: isLevelComplete,
    });
    get().showGlobalToast(`Papan tersinkronisasi dengan ${snapshot.senderName}!`, 2500);
  },

  isSettingsOpen: false,
  isLevelCompleteOpen: false,
  isAvatarPickerOpen: false,
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
  openAvatarPicker: () => set({ isAvatarPickerOpen: true }),
  closeAvatarPicker: () => set({ isAvatarPickerOpen: false }),
  closeLevelComplete: () => {
    set({ isLevelCompleteOpen: false });
    if (typeof window !== 'undefined') {
      const promptShown = localStorage.getItem(STORAGE_KEY_NOTIFICATION_PROMPT_SHOWN);
      if (promptShown !== 'true' && notificationService.isSupported()) {
        setTimeout(() => {
          set({ isNotificationPromptOpen: true });
        }, 400);
      }
    }
  },
  openLevelSelect: () => set({ isLevelSelectOpen: true }),
  closeLevelSelect: () => set({ isLevelSelectOpen: false }),
  openLexicon: () => {
    if (get().soundEnabled) soundManager.playAcousticStrum();
    set({ isLexiconOpen: true });
  },
  closeLexicon: () => set({ isLexiconOpen: false }),

  isLegalModalOpen: false,
  legalModalTab: 'privacy',
  openLegalModal: (tab = 'privacy') => set({ isLegalModalOpen: true, legalModalTab: tab }),
  closeLegalModal: () => set({ isLegalModalOpen: false }),
  setLegalModalTab: (tab) => set({ legalModalTab: tab }),

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

  isQrModalOpen: false,
  openQrModal: () => set({ isQrModalOpen: true }),
  closeQrModal: () => set({ isQrModalOpen: false }),

  isScannerOpen: false,
  openScanner: () => set({ isScannerOpen: true }),
  closeScanner: () => set({ isScannerOpen: false }),

  // 1v1 Tug-of-War & Speed Race Battle State & Methods
  battleConfig: {
    mode: 'tug_of_war',
    rounds: 3,
    durationSeconds: 90,
    wordCount: 'medium',
  },
  setBattleConfig: (config, broadcast = true) => {
    const nextConfig = { ...get().battleConfig, ...config };
    set({ battleConfig: nextConfig });
    if (broadcast && get().activeRoomCode) {
      mabarRealtime.broadcastBattleConfig(nextConfig);
    }
  },
  battleCurrentRound: 1,
  battleRoundWins: { local: 0, partner: 0 },
  battleScores: { local: 0, partner: 0 },
  battleClueOwners: {},
  battleTimeLeft: 90,
  isBattleLobbyOpen: false,
  isBattleResultOpen: false,
  battleWinner: null,
  isQuickMatchModalOpen: false,
  isQuickMatchBot: false,
  quickMatchBotOpponent: null,
  quickMatchAiCooldown: 6,

  // ELO & Sachet State
  eloRating: getInitialElo(),
  battleOpponentElo: 1100,
  lastEloDelta: null,
  customTtsTickets: getInitialCustomTickets(),
  isVip: getInitialIsVip(),
  setIsVip: (vip: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_IS_VIP, String(vip));
    }
    set({ isVip: vip });
  },
  isVipModalOpen: false,
  openVipModal: () => set({ isVipModalOpen: true }),
  closeVipModal: () => set({ isVipModalOpen: false }),
  battlesStats: getInitialBattlesStats(),
  isSachetModalOpen: false,
  openSachetModal: () => set({ isSachetModalOpen: true }),
  closeSachetModal: () => set({ isSachetModalOpen: false }),
  isCustomCrosswordModalOpen: false,
  openCustomCrosswordModal: () => set({ isCustomCrosswordModalOpen: true }),
  closeCustomCrosswordModal: () => set({ isCustomCrosswordModalOpen: false }),

  purchaseSachetPack: () => {
    const nextTickets = get().customTtsTickets + 1;
    const nextShields = get().streakShields + 3;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_CUSTOM_TTS_TICKETS, String(nextTickets));
      localStorage.setItem(STORAGE_KEY_STREAK_SHIELDS, String(nextShields));
    }
    get().addStars(150);
    set({
      customTtsTickets: nextTickets,
      streakShields: nextShields,
      isSachetModalOpen: false,
    });
    if (get().soundEnabled) soundManager.playReward();
    if (get().hapticEnabled) haptic.success([30, 60, 40]);
    get().showGlobalToast('🎉 Paket Pemula Aktif! +150 Bintang, +3 Pelindung Streak & 1x Tiket Bikin TTS!', 3800);

    // Sync updated tickets & stars to Supabase cloud profile in background
    const user = get().user;
    if (user?.id) {
      syncUserProfile({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        isGuest: user.isGuest,
        stars: get().stars,
        streak: get().streak,
        totalWordsSolved: get().solvedClues.length,
        eloRating: get().eloRating,
        customTickets: nextTickets,
        isVip: get().isVip,
      }).catch(() => {});
    }
  },

  consumeCustomTtsTicket: () => {
    if (get().isVip) return true;
    const current = get().customTtsTickets;
    if (current > 0) {
      const next = current - 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_CUSTOM_TTS_TICKETS, String(next));
      }
      set({ customTtsTickets: next });

      const user = get().user;
      if (user?.id) {
        syncUserProfile({
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          isGuest: user.isGuest,
          stars: get().stars,
          streak: get().streak,
          totalWordsSolved: get().solvedClues.length,
          eloRating: get().eloRating,
          customTickets: next,
          isVip: get().isVip,
        }).catch(() => {});
      }
      return true;
    }
    return false;
  },

  recordBattleEloOutcome: (opponentElo, won) => {
    const currentElo = get().eloRating;
    const delta = calculateEloDelta(currentElo, opponentElo, won);
    const newElo = Math.max(400, currentElo + delta);
    const currentStats = get().battlesStats;
    const nextStats = {
      won: won === true ? currentStats.won + 1 : currentStats.won,
      lost: won === false ? currentStats.lost + 1 : currentStats.lost,
      total: currentStats.total + 1,
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ELO, String(newElo));
      localStorage.setItem(STORAGE_KEY_BATTLES_STATS, JSON.stringify(nextStats));
    }

    set({
      eloRating: newElo,
      lastEloDelta: delta,
      battlesStats: nextStats,
    });

    // Sync updated ELO to Supabase cloud profile in background
    const user = get().user;
    if (user?.id) {
      syncUserProfile({
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        isGuest: user.isGuest,
        stars: get().stars,
        streak: get().streak,
        totalWordsSolved: get().solvedClues.length,
        eloRating: newElo,
        customTickets: get().customTtsTickets,
        isVip: get().isVip,
      }).catch(() => {});
    }

    return { delta, newElo };
  },

  // Tournament Cup State & Methods
  isTournamentOpen: false,
  openTournament: () => set({ isTournamentOpen: true }),
  closeTournament: () => set({ isTournamentOpen: false }),
  tournamentState: loadTournamentState() || createInitialTournamentState(getInitialUser().name, getInitialUser().avatar),
  resetTournament: () => {
    const fresh = createInitialTournamentState(get().user?.name || 'Kamu', get().user?.avatar);
    set({
      tournamentState: fresh,
      activeTournamentMatch: null,
      isTournamentResultOpen: false,
      tournamentResultData: null,
    });
    get().showGlobalToast('Turnamen Musim Baru Dimulai!', 2500);
  },
  trophies: loadTrophies(),
  activeTournamentMatch: null,
  isTournamentResultOpen: false,
  tournamentResultData: null,
  openTournamentResult: () => set({ isTournamentResultOpen: true }),
  closeTournamentResult: () => set({ isTournamentResultOpen: false }),
  tournamentAiCooldown: 8,
  tournamentTickets: getInitialTickets(),
  lastTicketClaimDate: getInitialTicketDate(),

  claimDailyTicket: () => {
    const today = getTodayDateString();
    const { lastTicketClaimDate, tournamentTickets } = get();
    if (lastTicketClaimDate === today) {
      get().showGlobalToast('Tiket harian sudah diambil hari ini!');
      return false;
    }
    const nextTickets = tournamentTickets + 1;
    localStorage.setItem(STORAGE_KEY_TICKETS, String(nextTickets));
    localStorage.setItem(STORAGE_KEY_TICKET_DATE, today);
    set({
      tournamentTickets: nextTickets,
      lastTicketClaimDate: today,
    });
    get().showGlobalToast('🎟️ +1 Tiket Turnamen Harian Berhasil Diklaim!');
    return true;
  },

  buyTournamentTicketWithStars: () => {
    const { stars, tournamentTickets, showGlobalToast } = get();
    if (stars < 50) {
      showGlobalToast('Bintang tidak mencukupi (Butuh 50★)!');
      return false;
    }
    const nextStars = stars - 50;
    const nextTickets = tournamentTickets + 1;
    localStorage.setItem(STORAGE_KEY_STARS, String(nextStars));
    localStorage.setItem(STORAGE_KEY_TICKETS, String(nextTickets));
    set({
      stars: nextStars,
      tournamentTickets: nextTickets,
    });
    showGlobalToast('🎟️ Berhasil Menukar 50★ dengan 1 Tiket Turnamen!');
    return true;
  },

  // Community Tournaments Implementation
  isCreateTournamentOpen: false,
  openCreateTournament: () => set({ isCreateTournamentOpen: true }),
  closeCreateTournament: () => set({ isCreateTournamentOpen: false }),
  isJoinTournamentOpen: false,
  openJoinTournament: () => set({ isJoinTournamentOpen: true }),
  closeJoinTournament: () => set({ isJoinTournamentOpen: false }),
  isTournamentQrModalOpen: false,
  openTournamentQrModal: () => set({ isTournamentQrModalOpen: true }),
  closeTournamentQrModal: () => set({ isTournamentQrModalOpen: false }),
  activeTournament: loadActiveCommunityTournament(),
  publicTournaments: loadPublicTournaments(),
  activeCommunityMatchId: null,
  tournamentPeers: [],

  setTournamentPeers: (peers: TournamentPeer[]) => set({ tournamentPeers: peers }),

  updateActiveTournamentLocally: (tournament: CommunityTournament) => {
    saveActiveCommunityTournament(tournament);
    set({ activeTournament: tournament });
  },

  receiveTournamentSync: (tournament: CommunityTournament) => {
    const myId = get().user.id || 'player_local';
    const adjustedMatches = (tournament.matches || []).map((m) => ({
      ...m,
      isPlayerMatch: Boolean(m.player1?.id === myId || m.player2?.id === myId),
    }));
    const syncedTourney: CommunityTournament = {
      ...tournament,
      matches: adjustedMatches,
    };
    saveActiveCommunityTournament(syncedTourney);
    set({ activeTournament: syncedTourney });
  },

  receiveTournamentStart: (tournament: CommunityTournament) => {
    const myId = get().user.id || 'player_local';
    const adjustedMatches = (tournament.matches || []).map((m) => ({
      ...m,
      isPlayerMatch: Boolean(m.player1?.id === myId || m.player2?.id === myId),
    }));
    const startedTourney: CommunityTournament = {
      ...tournament,
      status: 'in_progress',
      matches: adjustedMatches,
    };
    saveActiveCommunityTournament(startedTourney);
    set({ activeTournament: startedTourney });

    if (get().soundEnabled) soundManager.playCrystalChime();
    if (get().hapticEnabled) haptic.success([20, 40, 20]);
    get().showGlobalToast('Bagan telah diundi oleh Host! Pertandingan dimulai!', 3500);
  },

  receiveMatchInit: (matchId: string, levelIndex: number) => {
    const { activeTournament, user, activeCommunityMatchId, gameMode } = get();
    if (!activeTournament) return;
    const targetMatch = activeTournament.matches.find((m) => m.id === matchId);
    if (!targetMatch) return;
    const myId = user.id || 'player_local';
    const isMyMatch = targetMatch.player1?.id === myId || targetMatch.player2?.id === myId;

    if (isMyMatch && (!activeCommunityMatchId || gameMode !== '1v1_battle')) {
      get().startCommunityMatch(matchId, levelIndex);
    }
  },

  receiveTournamentMatchProgress: (payload: MatchProgressPayload) => {
    const { activeCommunityMatchId, battleScores, soundEnabled, hapticEnabled } = get();
    if (activeCommunityMatchId !== payload.matchId) return;

    if (payload.score > battleScores.partner) {
      if (soundEnabled) soundManager.playKeyClick();
      if (hapticEnabled) haptic.light(8);
    }

    set({
      battleScores: {
        ...battleScores,
        partner: payload.score,
      },
    });
  },

  receiveTournamentMatchCompleted: (payload: MatchCompletedPayload) => {
    const { activeTournament, user, activeCommunityMatchId } = get();
    if (!activeTournament) return;

    const myId = user.id || 'player_local';
    const targetMatch = activeTournament.matches.find((m) => m.id === payload.matchId);
    if (!targetMatch || targetMatch.status === 'completed') return;

    const { updatedTournament } = advanceTournamentMatch(
      activeTournament,
      payload.matchId,
      payload.winnerId,
      payload.player1Score,
      payload.player2Score,
      myId
    );

    const currentRoundIdx = targetMatch.roundIndex ?? 0;
    const fullyUpdatedTourney = simulateConcurrentMatches(
      updatedTournament,
      currentRoundIdx,
      myId
    );

    saveActiveCommunityTournament(fullyUpdatedTourney);

    if (activeCommunityMatchId === payload.matchId) {
      get().finishBattleRound();
    } else {
      set({ activeTournament: fullyUpdatedTourney });
    }
  },

  receivePublicTournament: (tournament: CommunityTournament) => {
    const { publicTournaments } = get();
    if (publicTournaments.some((t) => t.id === tournament.id || t.code === tournament.code)) return;
    const updated = [tournament, ...publicTournaments];
    savePublicTournaments(updated);
    set({ publicTournaments: updated });
  },

  removePublicTournament: (tournamentId: string) => {
    const { publicTournaments } = get();
    const updated = publicTournaments.filter((t) => t.id !== tournamentId);
    savePublicTournaments(updated);
    set({ publicTournaments: updated });
  },

  refreshPublicTournamentsFromDb: async () => {
    const dbTourneys = await fetchPublicTournamentsFromDb();
    if (dbTourneys.length > 0) {
      const { publicTournaments } = get();
      const map = new Map<string, CommunityTournament>();
      publicTournaments.forEach((t) => map.set(t.id, t));
      dbTourneys.forEach((t) => map.set(t.id, t));
      const merged = Array.from(map.values());
      savePublicTournaments(merged);
      set({ publicTournaments: merged });
    }
  },

  createTournament: (
    name: string,
    format: TournamentFormat,
    roundDuration: number,
    themeCategory: string,
    maxPlayers?: number
  ) => {
    const { user, publicTournaments } = get();
    const myId = user.id || 'player_local';
    const newTourney = createCommunityTournament(
      { id: myId, name: user.name, avatar: user.avatar },
      { name, format, roundDurationSeconds: roundDuration, themeCategory, maxPlayers }
    );
    const updatedPublic = [newTourney, ...publicTournaments.filter((t) => t.id !== newTourney.id)];
    savePublicTournaments(updatedPublic);

    // Save to Supabase Cloud Database (fire-and-forget)
    saveTournamentToDb(newTourney);

    // Connect to Supabase Realtime channel as host
    tournamentRealtime.joinTournament(newTourney.code, {
      id: myId,
      name: user.name,
      avatar: user.avatar,
      isHost: true,
    });

    // Broadcast new tournament to public channel
    tournamentRealtime.broadcastPublishTournament(newTourney);

    set({
      activeTournament: newTourney,
      publicTournaments: updatedPublic,
    });
    return newTourney;
  },

  joinTournament: (code: string) => {
    const { user, activeTournament, publicTournaments } = get();
    const cleanCode = code.trim().toUpperCase();
    const myId = user.id || 'player_local';

    // If player is already inside this tournament
    if (activeTournament && activeTournament.code === cleanCode) {
      tournamentRealtime.joinTournament(cleanCode, {
        id: myId,
        name: user.name,
        avatar: user.avatar,
        isHost: activeTournament.hostId === myId,
      });
      return { success: true, message: `Kembali ke turnamen ${activeTournament.name}` };
    }

    let target = publicTournaments.find((t) => t.code === cleanCode);
    if (!target) {
      target = {
        id: `tourney_${cleanCode}`,
        code: cleanCode,
        name: `Turnamen ${cleanCode}`,
        hostId: 'host_peer',
        hostName: 'Kawan Mabar',
        format: 'knockout_4',
        roundDurationSeconds: 60,
        themeCategory: 'Semua Kategori (Acak)',
        status: 'lobby',
        maxPlayers: 4,
        players: [
          { id: 'host_peer', name: 'Kawan Mabar', isHost: true, isReady: true },
        ],
        matches: [],
        createdAt: 'Baru saja',
      };
    }

    if (target.players.length >= target.maxPlayers && !target.players.some((p) => p.id === myId)) {
      return { success: false, message: 'Turnamen ini sudah penuh!' };
    }

    const existingIdx = target.players.findIndex((p) => p.id === myId);
    const updatedPlayers = [...target.players];
    if (existingIdx === -1) {
      updatedPlayers.push({
        id: myId,
        name: user.name,
        avatar: user.avatar,
        isHost: false,
        isReady: true,
      });
    }

    const updatedTourney: CommunityTournament = {
      ...target,
      players: updatedPlayers,
    };

    saveActiveCommunityTournament(updatedTourney);
    const updatedPublic = publicTournaments.map((t) => (t.id === target?.id ? updatedTourney : t));
    savePublicTournaments(updatedPublic);

    // Save to Supabase Cloud Database (fire-and-forget)
    saveTournamentToDb(updatedTourney);

    // Connect to Supabase Realtime channel
    tournamentRealtime.joinTournament(cleanCode, {
      id: myId,
      name: user.name,
      avatar: user.avatar,
      isHost: updatedTourney.hostId === myId,
    });

    set({
      activeTournament: updatedTourney,
      publicTournaments: updatedPublic,
    });

    return { success: true, message: `Berhasil bergabung ke ${target.name}!` };
  },

  leaveTournament: () => {
    tournamentRealtime.leaveTournament();
    saveActiveCommunityTournament(null);
    set({ activeTournament: null, activeCommunityMatchId: null, tournamentPeers: [] });
    get().showGlobalToast('Keluar dari turnamen.');
  },

  fillTournamentSlotsWithBots: () => {
    const { activeTournament, showGlobalToast } = get();
    if (!activeTournament) return;
    const updated = fillRemainingSlotsWithBots(activeTournament);
    tournamentRealtime.broadcastTournamentSync(updated);
    saveTournamentToDb(updated);
    set({ activeTournament: updated });
    showGlobalToast(`Slot berhasil dilengkapi dengan Jawara TTS! Siap tanding!`, 2500);
  },

  startTournamentLobby: () => {
    const { activeTournament, user, showGlobalToast } = get();
    if (!activeTournament) return;

    if (activeTournament.players.length < 2) {
      showGlobalToast('Butuh minimal 2 pemain untuk memulai turnamen!', 2500);
      return;
    }

    const matches = generateKnockoutBracket(
      activeTournament.players,
      activeTournament.format,
      activeTournament.roundDurationSeconds,
      user.id || 'player_local'
    );

    const startedTourney: CommunityTournament = {
      ...activeTournament,
      status: 'in_progress',
      matches,
    };

    saveActiveCommunityTournament(startedTourney);
    tournamentRealtime.broadcastTournamentStart(startedTourney);
    saveTournamentToDb(startedTourney);
    set({ activeTournament: startedTourney });
    showGlobalToast('Bagan telah diundi! Pertandingan dimulai!', 3000);
  },

  startCommunityMatch: (matchId: string, forcedLevelIdx?: number) => {
    const { activeTournament, levels, user, soundEnabled, hapticEnabled } = get();
    if (!activeTournament) return;

    const targetMatch = activeTournament.matches.find((m) => m.id === matchId);
    if (!targetMatch) return;

    const myId = user.id || 'player_local';
    const isSlot1 = targetMatch.player1?.id === myId;
    const opponent = isSlot1 ? targetMatch.player2 : targetMatch.player1;
    const opponentName = opponent?.name || 'Lawan';

    // Synchronized Level Index across both players
    const chosenLevelIdx =
      typeof forcedLevelIdx === 'number'
        ? forcedLevelIdx % levels.length
        : typeof targetMatch.levelIndex === 'number'
        ? targetMatch.levelIndex % levels.length
        : Math.floor(Math.random() * levels.length);

    const targetLevel = levels[chosenLevelIdx];

    // Broadcast match init so opponent device launches into the exact same match!
    tournamentRealtime.broadcastMatchInit(matchId, chosenLevelIdx);

    if (soundEnabled) soundManager.playReward();
    if (hapticEnabled) {
      haptic.success([20, 50, 30]);
    }

    set({
      gameMode: '1v1_battle',
      battleConfig: {
        rounds: 1,
        durationSeconds: targetMatch.durationSeconds,
        wordCount: 'medium',
        mode: 'speed_race',
      },
      battleCurrentRound: 1,
      battleRoundWins: { local: 0, partner: 0 },
      battleScores: { local: 0, partner: 0 },
      battleClueOwners: {},
      battleTimeLeft: targetMatch.durationSeconds,
      battleWinner: null,
      currentLevelIndex: chosenLevelIdx,
      level: targetLevel,
      userInputs: {},
      lockedCells: {},
      solvedClues: [],
      cellAuthors: {},
      clueAuthors: {},
      wordStreak: 0,
      comboMessage: null,
      validationMessage: null,
      activeClueId: null,
      focusedCell: null,
      currentTab: 'game',
      activeCommunityMatchId: matchId,
    });

    get().showGlobalToast(`Pertandingan ${targetMatch.roundName}: Kamu vs ${opponentName}!`, 3200);
  },

  setAvatarFrame: (frame: AvatarFrameKey) => {
    const { user, setUser } = get();
    setUser({ ...user, avatarFrame: frame });
    get().showGlobalToast(`Bingkai paspor berhasil diubah!`);
  },

  setSoundPack: (pack: SoundPackKey) => {
    const { user, setUser } = get();
    setUser({ ...user, soundPack: pack });
    get().showGlobalToast(`Paket suara diperbarui!`);
  },

  startTournamentMatch: () => {
    const { tournamentState, tournamentTickets, levels, soundEnabled, hapticEnabled } = get();

    if (tournamentTickets <= 0) {
      get().showGlobalToast('Tiket turnamen habis! Klaim tiket harian gratis atau tukar 50★.');
      return;
    }

    const currentRoundKey = tournamentState.currentRound;
    const currentMatches = tournamentState.matches[currentRoundKey];
    const playerMatch = currentMatches.find((m) => m.isPlayerMatch);

    if (!playerMatch) {
      get().showGlobalToast('Tidak ada pertandingan aktif untukmu.');
      return;
    }

    const nextTickets = tournamentTickets - 1;
    localStorage.setItem(STORAGE_KEY_TICKETS, String(nextTickets));

    const opponent = playerMatch.player1.isPlayer ? playerMatch.player2 : playerMatch.player1;
    const targetLevelIdx = findLevelForWordCount(levels, playerMatch.wordCount);
    const targetLevel = levels[targetLevelIdx];

    if (soundEnabled) soundManager.playReward();
    if (hapticEnabled) {
      haptic.success([20, 50, 30]);
    }

    const initialAiCooldown = Math.max(5, Math.floor(13 - (opponent.speedRating - 70) * 0.25));

    set({
      tournamentTickets: nextTickets,
      gameMode: '1v1_battle',
      activeTournamentMatch: playerMatch,
      battleConfig: {
        rounds: 1,
        durationSeconds: playerMatch.durationSeconds,
        wordCount: playerMatch.wordCount,
        mode: 'speed_race',
      },
      battleCurrentRound: 1,
      battleRoundWins: { local: 0, partner: 0 },
      battleScores: { local: 0, partner: 0 },
      battleClueOwners: {},
      battleTimeLeft: playerMatch.durationSeconds,
      battleWinner: null,
      isTournamentOpen: false,
      isTournamentResultOpen: false,
      currentLevelIndex: targetLevelIdx,
      level: targetLevel,
      userInputs: {},
      lockedCells: {},
      solvedClues: [],
      cellAuthors: {},
      clueAuthors: {},
      wordStreak: 0,
      comboMessage: null,
      validationMessage: null,
      activeClueId: null,
      focusedCell: null,
      currentTab: 'game',
      tournamentAiCooldown: initialAiCooldown,
    });

    get().showGlobalToast(`Piala Nusantara: Kamu vs ${opponent.name} (${opponent.origin})!`, 3200);
  },

  tickTournamentAi: () => {
    const {
      activeTournamentMatch,
      activeCommunityMatchId,
      activeTournament,
      tournamentPeers,
      user,
      level,
      solvedClues,
      tournamentAiCooldown,
      claimBattleClue,
      isBattleResultOpen,
      isTournamentResultOpen,
    } = get();

    if (isBattleResultOpen || isTournamentResultOpen) return;

    // 1. Classic Season Cup AI
    if (activeTournamentMatch) {
      if (tournamentAiCooldown > 1) {
        set({ tournamentAiCooldown: tournamentAiCooldown - 1 });
        return;
      }

      const opponent = activeTournamentMatch.player1.isPlayer
        ? activeTournamentMatch.player2
        : activeTournamentMatch.player1;

      const allClues = [...(level.clues?.across || []), ...(level.clues?.down || [])];
      const unsolved = allClues.filter((c) => !solvedClues.includes(c.id));

      if (unsolved.length > 0) {
        const chosen = unsolved[Math.floor(Math.random() * unsolved.length)];
        claimBattleClue(chosen.id, [chosen.id], 'partner', opponent.name);
      }

      const nextCooldown = Math.max(
        5,
        Math.floor(13 - (opponent.speedRating - 70) * 0.25) + Math.floor(Math.random() * 3 - 1)
      );
      set({ tournamentAiCooldown: nextCooldown });
      return;
    }

    // 2. Community Tournament Match AI (Hybrid Bot Fallback)
    if (activeCommunityMatchId && activeTournament) {
      const myId = user.id || 'player_local';
      const targetMatch = activeTournament.matches.find((m) => m.id === activeCommunityMatchId);
      if (!targetMatch) return;

      const opponent = targetMatch.player1?.id === myId ? targetMatch.player2 : targetMatch.player1;
      if (!opponent) return;

      // Only simulate if the opponent is a Bot or offline from tournamentPeers
      const isOpponentOnline = tournamentPeers.some(
        (p) => p.id === opponent.id || p.name === opponent.name
      );
      const isBot = opponent.id.startsWith('bot_') || !isOpponentOnline;

      if (!isBot) return; // Real player is actively connected, do not simulate!

      if (tournamentAiCooldown > 1) {
        set({ tournamentAiCooldown: tournamentAiCooldown - 1 });
        return;
      }

      const allClues = [...(level.clues?.across || []), ...(level.clues?.down || [])];
      const unsolved = allClues.filter((c) => !solvedClues.includes(c.id));

      if (unsolved.length > 0) {
        const chosen = unsolved[Math.floor(Math.random() * unsolved.length)];
        claimBattleClue(chosen.id, [chosen.id], 'partner', opponent.name);
      }

      const nextCooldown = Math.max(4, 8 + Math.floor(Math.random() * 5));
      set({ tournamentAiCooldown: nextCooldown });
    }
  },
  openBattleLobby: (mode) => {
    const battleMode = mode || 'tug_of_war';
    set((state) => ({
      isBattleLobbyOpen: true,
      battleConfig: {
        ...state.battleConfig,
        mode: battleMode,
        durationSeconds: battleMode === 'speed_race' ? 60 : state.battleConfig.durationSeconds,
        wordCount: battleMode === 'speed_race' ? 'short' : state.battleConfig.wordCount,
      },
    }));
  },
  closeBattleLobby: () => set({ isBattleLobbyOpen: false }),
  openBattleResult: () => set({ isBattleResultOpen: true }),
  closeBattleResult: () => set({ isBattleResultOpen: false }),

  openQuickMatchModal: (mode) => {
    const battleMode = mode || 'speed_race';
    set((state) => ({
      isQuickMatchModalOpen: true,
      battleConfig: {
        ...state.battleConfig,
        mode: battleMode,
        durationSeconds: battleMode === 'speed_race' ? 60 : 90,
        wordCount: 'short',
        rounds: battleMode === 'speed_race' ? 1 : 3,
      },
    }));
  },
  closeQuickMatchModal: () => set({ isQuickMatchModalOpen: false }),

  startQuickMatchBattle: ({ opponent, levelIndex, config, roomCode }) => {
    const { levels, user, soundEnabled, hapticEnabled } = get();
    const safeIdx = Math.max(0, Math.min(levelIndex, levels.length - 1));
    const targetLevel = levels[safeIdx] || levels[0];

    if (soundEnabled) soundManager.playReward();
    if (hapticEnabled) {
      haptic.success([20, 50, 30]);
    }

    if (!opponent.isBot) {
      mabarRealtime.joinRoom(roomCode, user);
    }

    set({
      gameMode: '1v1_battle',
      activeRoomCode: roomCode,
      isQuickMatchModalOpen: false,
      isBattleLobbyOpen: false,
      isBattleResultOpen: false,
      isQuickMatchBot: opponent.isBot,
      quickMatchBotOpponent: opponent.isBot
        ? { name: opponent.name, avatar: opponent.avatar }
        : null,
      battleOpponentElo: (opponent as { rating?: number }).rating || 1100,
      lastEloDelta: null,
      quickMatchAiCooldown: 6,
      mabarPeers: [
        { id: user.id || 'me', name: user.name, avatar: user.avatar },
        { id: opponent.id, name: opponent.name, avatar: opponent.avatar },
      ],
      battleConfig: config,
      battleCurrentRound: 1,
      battleRoundWins: { local: 0, partner: 0 },
      battleScores: { local: 0, partner: 0 },
      battleClueOwners: {},
      battleTimeLeft: config.durationSeconds,
      battleWinner: null,
      currentLevelIndex: safeIdx,
      level: targetLevel,
      userInputs: {},
      lockedCells: {},
      solvedClues: [],
      cellAuthors: {},
      clueAuthors: {},
      wordStreak: 0,
      comboMessage: null,
      validationMessage: null,
      activeClueId: null,
      focusedCell: null,
      currentTab: 'game',
    });

    get().showGlobalToast(`Duel Dimulai! Lawan: ${opponent.name}`, 3200);
  },

  startBattleMatch: () => {
    const { levels, battleConfig, soundEnabled, hapticEnabled } = get();
    const targetLevelIdx = findLevelForWordCount(levels, battleConfig.wordCount);
    const targetLevel = levels[targetLevelIdx];

    if (soundEnabled) soundManager.playReward();
    if (hapticEnabled) {
      haptic.success([20, 50, 30]);
    }

    if (get().activeRoomCode) {
      mabarRealtime.broadcastBattleStart(targetLevelIdx, battleConfig);
    }

    set({
      gameMode: '1v1_battle',
      battleCurrentRound: 1,
      battleRoundWins: { local: 0, partner: 0 },
      battleScores: { local: 0, partner: 0 },
      battleClueOwners: {},
      battleTimeLeft: battleConfig.durationSeconds,
      battleWinner: null,
      isBattleLobbyOpen: false,
      isBattleResultOpen: false,
      currentLevelIndex: targetLevelIdx,
      level: targetLevel,
      userInputs: {},
      lockedCells: {},
      solvedClues: [],
      cellAuthors: {},
      clueAuthors: {},
      wordStreak: 0,
      comboMessage: null,
      validationMessage: null,
      activeClueId: null,
      focusedCell: null,
      currentTab: 'game',
    });

    get().showGlobalToast(`Duel Dimulai! Ronde 1/${battleConfig.rounds} • Rebut petak!`, 3200);
  },

  receiveBattleStart: (payload) => {
    const { levels, soundEnabled, hapticEnabled } = get();
    const targetLevel = levels[payload.levelIndex] || levels[0];

    if (soundEnabled) soundManager.playReward();
    if (hapticEnabled) {
      haptic.success([20, 50, 30]);
    }

    set({
      gameMode: '1v1_battle',
      battleConfig: payload.config,
      battleCurrentRound: 1,
      battleRoundWins: { local: 0, partner: 0 },
      battleScores: { local: 0, partner: 0 },
      battleClueOwners: {},
      battleTimeLeft: payload.config.durationSeconds,
      battleWinner: null,
      isBattleLobbyOpen: false,
      isBattleResultOpen: false,
      currentLevelIndex: payload.levelIndex,
      level: targetLevel,
      userInputs: {},
      lockedCells: {},
      solvedClues: [],
      cellAuthors: {},
      clueAuthors: {},
      wordStreak: 0,
      comboMessage: null,
      validationMessage: null,
      activeClueId: null,
      focusedCell: null,
      currentTab: 'game',
    });

    get().showGlobalToast(`Duel Dimulai! Ronde 1/${payload.config.rounds} • Rebut petak!`, 3200);
  },

  tickBattleTimer: () => {
    const {
      gameMode,
      battleTimeLeft,
      isBattleResultOpen,
      isTournamentResultOpen,
      activeTournamentMatch,
      activeCommunityMatchId,
      tickTournamentAi,
      finishBattleRound,
      soundEnabled,
    } = get();
    if (gameMode !== '1v1_battle' || isBattleResultOpen || isTournamentResultOpen) return;

    if (activeTournamentMatch || activeCommunityMatchId) {
      tickTournamentAi();
    } else if (get().isQuickMatchBot && get().quickMatchBotOpponent) {
      const { quickMatchAiCooldown, quickMatchBotOpponent, level, solvedClues, claimBattleClue } = get();
      if (!quickMatchBotOpponent) return;
      if (quickMatchAiCooldown > 1) {
        set({ quickMatchAiCooldown: quickMatchAiCooldown - 1 });
      } else {
        const allClues = [...(level.clues?.across || []), ...(level.clues?.down || [])];
        const unsolved = allClues.filter((c) => !solvedClues.includes(c.id));
        if (unsolved.length > 0) {
          const chosen = unsolved[Math.floor(Math.random() * unsolved.length)];
          claimBattleClue(chosen.id, [chosen.id], 'partner', quickMatchBotOpponent.name);
        }
        set({ quickMatchAiCooldown: Math.max(4, 5 + Math.floor(Math.random() * 5)) });
      }
    }

    if (battleTimeLeft <= 1) {
      finishBattleRound();
      return;
    }

    const nextTime = battleTimeLeft - 1;
    if (nextTime <= 10 && nextTime > 0) {
      if (soundEnabled) soundManager.playHeartbeat();
      if (get().hapticEnabled) {
        haptic.light(10);
      }
    }

    set({ battleTimeLeft: nextTime });
  },

  claimBattleClue: (clueId, newlySolved, solver, partnerName) => {
    const {
      battleClueOwners,
      battleScores,
      level,
      lockedCells,
      userInputs,
      cellAuthors,
      clueAuthors,
      solvedClues,
      soundEnabled,
      hapticEnabled,
      finishBattleRound,
    } = get();

    if (battleClueOwners[clueId]) return;

    const clue = findClueById(level, clueId);
    if (!clue) return;

    const clueLength = clue.answer.length;
    const pointsGained = clueLength * 10;

    const nextOwners = { ...battleClueOwners, [clueId]: solver };
    const nextScores = {
      ...battleScores,
      [solver]: battleScores[solver] + pointsGained,
    };

    const nextLocked = { ...lockedCells };
    const nextInputs = { ...userInputs };
    const nextAuthors = { ...cellAuthors };
    const nextClueAuthors = { ...clueAuthors, [clueId]: solver };

    clue.cells.forEach(([r, c], idx) => {
      const k = `${r},${c}`;
      nextLocked[k] = true;
      nextInputs[k] = clue.answer[idx];
      nextAuthors[k] = solver;
    });

    const nextSolved = solvedClues.includes(clueId) ? solvedClues : [...solvedClues, clueId];

    if (solver === 'local') {
      if (get().activeRoomCode) {
        mabarRealtime.broadcastBattleClue(clueId, newlySolved);
      }
      const { activeCommunityMatchId, activeTournament, user } = get();
      if (activeCommunityMatchId && activeTournament) {
        const totalClues = (level.clues.across?.length || 0) + (level.clues.down?.length || 0);
        tournamentRealtime.broadcastMatchProgress({
          matchId: activeCommunityMatchId,
          playerId: user.id || 'player_local',
          playerName: user.name,
          score: nextScores.local,
          solvedCount: nextSolved.length,
          totalClues,
        });
      }
      if (soundEnabled) soundManager.playWordCorrect(1);
      if (hapticEnabled) {
        haptic.success([15, 30, 20]);
      }
    } else {
      if (soundEnabled) soundManager.playWordCorrect(1);
      get().showGlobalToast(`${partnerName || 'Lawan'} merebut ${clue.answer} (+${pointsGained} Pts)!`, 2200);
    }

    const totalClues = (level.clues.across?.length || 0) + (level.clues.down?.length || 0);
    const isBoardFull = Object.keys(nextOwners).length >= totalClues;

    set({
      battleClueOwners: nextOwners,
      battleScores: nextScores,
      lockedCells: nextLocked,
      userInputs: nextInputs,
      cellAuthors: nextAuthors,
      clueAuthors: nextClueAuthors,
      solvedClues: nextSolved,
    });

    if (isBoardFull) {
      setTimeout(() => {
        finishBattleRound();
      }, 500);
    }
  },

  finishBattleRound: () => {
    const {
      activeCommunityMatchId,
      activeTournament,
      activeTournamentMatch,
      tournamentState,
      battleScores,
      battleRoundWins,
      battleCurrentRound,
      battleConfig,
      soundEnabled,
      addStars,
      showGlobalToast,
      user,
    } = get();

    if (activeCommunityMatchId && activeTournament) {
      const myId = user.id || 'player_local';
      const playerWon = battleScores.local > battleScores.partner;
      const targetMatch = activeTournament.matches.find((m) => m.id === activeCommunityMatchId);
      const opponent = targetMatch?.player1?.id === myId ? targetMatch?.player2 : targetMatch?.player1;
      const opponentName = opponent?.name || 'Lawan';

      const winnerId = playerWon ? myId : (opponent?.id || 'opponent');
      const { updatedTournament, trophyAwarded, starsAwarded } = advanceTournamentMatch(
        activeTournament,
        activeCommunityMatchId,
        winnerId,
        battleScores.local,
        battleScores.partner,
        myId
      );

      if (starsAwarded > 0) {
        addStars(starsAwarded);
      }

      // Broadcast match completed to Supabase Realtime channel
      const isSlot1 = targetMatch?.player1?.id === myId;
      tournamentRealtime.broadcastMatchCompleted({
        matchId: activeCommunityMatchId,
        winnerId,
        player1Score: isSlot1 ? battleScores.local : battleScores.partner,
        player2Score: !isSlot1 ? battleScores.local : battleScores.partner,
        completedBy: user.name || 'Pemain',
      });

      // Automatically simulate other concurrent matches in this round so next round has opponents ready
      const currentRoundIdx = targetMatch?.roundIndex ?? 0;
      const fullyUpdatedTourney = simulateConcurrentMatches(
        updatedTournament,
        currentRoundIdx,
        myId
      );

      // Save fully updated tournament state to cloud database
      saveTournamentToDb(fullyUpdatedTourney);

      const nextTrophies = loadTrophies();

      if (playerWon) {
        if (soundEnabled) {
          if (fullyUpdatedTourney.status === 'completed' && trophyAwarded === 'gold') {
            soundManager.playCrystalChime();
          } else {
            soundManager.playGamelanBell();
          }
        }
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
        showGlobalToast(`Kemenangan Gemilang! Kamu mengalahkan ${opponentName}!`, 3500);
      } else {
        if (soundEnabled) soundManager.playWordWrong();
        showGlobalToast(`Pertandingan selesai! ${opponentName} memenangkan duel.`, 3500);
      }

      set({
        activeTournament: fullyUpdatedTourney,
        trophies: nextTrophies,
        isTournamentResultOpen: true,
        tournamentResultData: {
          won: playerWon,
          roundTitle: targetMatch?.roundName || 'Turnamen',
          trophyAwarded,
          opponent: {
            id: opponent?.id || 'opp',
            name: opponentName,
            origin: 'Indonesia',
            avatar: opponent?.avatar || '',
            title: 'Kontestan Turnamen',
            speedRating: 85,
            accuracyRating: 90,
          },
          playerScore: battleScores.local,
          opponentScore: battleScores.partner,
        },
        battleWinner: playerWon ? 'local' : 'partner',
        activeCommunityMatchId: null,
      });
      return;
    }

    if (activeTournamentMatch) {
      const playerWon = battleScores.local > battleScores.partner;
      const opponent = activeTournamentMatch.player1.isPlayer ? activeTournamentMatch.player2 : activeTournamentMatch.player1;
      const { nextState, trophyAwarded } = advanceTournament(
        tournamentState,
        playerWon,
        battleScores.local,
        battleScores.partner
      );

      const nextTrophies = loadTrophies();

      if (playerWon) {
        addStars(50);
        if (soundEnabled) {
          if (nextState.playerStatus === 'champion') {
            soundManager.playCrystalChime();
          } else {
            soundManager.playGamelanBell();
          }
        }
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.6 } });
        showGlobalToast(`Kemenangan Gemilang! Kamu mengalahkan ${opponent.name}!`, 3500);
      } else {
        if (soundEnabled) soundManager.playWordWrong();
        showGlobalToast(`Pertandingan sengit! ${opponent.name} lolos ke babak berikutnya.`, 3500);
      }

      set({
        tournamentState: nextState,
        trophies: nextTrophies,
        isTournamentResultOpen: true,
        tournamentResultData: {
          won: playerWon,
          roundTitle: activeTournamentMatch.roundTitle,
          trophyAwarded,
          opponent,
          playerScore: battleScores.local,
          opponentScore: battleScores.partner,
        },
        battleWinner: playerWon ? 'local' : 'partner',
      });
      return;
    }

    let roundWinner: 'local' | 'partner' | 'draw' = 'draw';
    const nextRoundWins = { ...battleRoundWins };

    if (battleScores.local > battleScores.partner) {
      roundWinner = 'local';
      nextRoundWins.local += 1;
    } else if (battleScores.partner > battleScores.local) {
      roundWinner = 'partner';
      nextRoundWins.partner += 1;
    }

    const winsNeeded = Math.ceil(battleConfig.rounds / 2);
    const isMatchOver =
      nextRoundWins.local >= winsNeeded ||
      nextRoundWins.partner >= winsNeeded ||
      battleCurrentRound >= battleConfig.rounds;

    let overallWinner: 'local' | 'partner' | 'draw' | null = null;
    if (isMatchOver) {
      const oppElo = get().battleOpponentElo || 1100;

      if (nextRoundWins.local > nextRoundWins.partner) {
        overallWinner = 'local';
        const { delta, newElo } = get().recordBattleEloOutcome(oppElo, true);
        const tier = getEloTier(newElo);
        addStars(30);
        get().addWeeklyLeagueXp(50);
        if (soundEnabled) soundManager.playVictory();
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        showGlobalToast(`🏆 Menang Duel! +${delta} ELO (${newElo} • ${tier.title}) & +30★!`, 4000);
      } else if (nextRoundWins.partner > nextRoundWins.local) {
        overallWinner = 'partner';
        const { delta, newElo } = get().recordBattleEloOutcome(oppElo, false);
        const tier = getEloTier(newElo);
        showGlobalToast(`Kalah Duel (${delta} ELO -> ${newElo} • ${tier.title}). Tetap semangat!`, 3800);
      } else {
        overallWinner = 'draw';
        const { delta, newElo } = get().recordBattleEloOutcome(oppElo, 'draw');
        showGlobalToast(`Duel Seri! (${delta >= 0 ? '+' : ''}${delta} ELO -> ${newElo})`, 3000);
      }
    } else {
      if (roundWinner === 'local') {
        showGlobalToast(`Kamu memenangkan Ronde ${battleCurrentRound}!`, 2800);
      } else if (roundWinner === 'partner') {
        showGlobalToast(`Lawan memenangkan Ronde ${battleCurrentRound}!`, 2800);
      } else {
        showGlobalToast(`Ronde ${battleCurrentRound} Seri!`, 2500);
      }
    }

    set({
      battleRoundWins: nextRoundWins,
      battleWinner: overallWinner,
      isBattleResultOpen: true,
    });
  },

  startNextBattleRound: () => {
    const { levels, battleConfig, battleCurrentRound, soundEnabled, hapticEnabled } = get();
    const nextRound = battleCurrentRound + 1;
    const targetLevelIdx = findLevelForWordCount(levels, battleConfig.wordCount);
    const targetLevel = levels[targetLevelIdx];

    if (soundEnabled) soundManager.playReward();
    if (hapticEnabled) {
      haptic.success([20, 50, 30]);
    }

    if (get().activeRoomCode) {
      mabarRealtime.broadcastBattleStart(targetLevelIdx, battleConfig);
    }

    set({
      battleCurrentRound: nextRound,
      battleScores: { local: 0, partner: 0 },
      battleClueOwners: {},
      battleTimeLeft: battleConfig.durationSeconds,
      isBattleResultOpen: false,
      currentLevelIndex: targetLevelIdx,
      level: targetLevel,
      userInputs: {},
      lockedCells: {},
      solvedClues: [],
      cellAuthors: {},
      clueAuthors: {},
      wordStreak: 0,
      comboMessage: null,
      validationMessage: null,
      activeClueId: null,
      focusedCell: null,
    });

    get().showGlobalToast(`Ronde ${nextRound}/${battleConfig.rounds} Dimulai!`, 3000);
  },

  rematchBattle: () => {
    const { levels, battleConfig, soundEnabled, hapticEnabled } = get();
    const targetLevelIdx = findLevelForWordCount(levels, battleConfig.wordCount);
    const targetLevel = levels[targetLevelIdx];

    if (soundEnabled) soundManager.playReward();
    if (hapticEnabled) {
      haptic.success([20, 50, 30]);
    }

    if (get().activeRoomCode) {
      mabarRealtime.broadcastBattleRematch();
    }

    set({
      battleCurrentRound: 1,
      battleRoundWins: { local: 0, partner: 0 },
      battleScores: { local: 0, partner: 0 },
      battleClueOwners: {},
      battleTimeLeft: battleConfig.durationSeconds,
      battleWinner: null,
      lastEloDelta: null,
      isBattleResultOpen: false,
      currentLevelIndex: targetLevelIdx,
      level: targetLevel,
      userInputs: {},
      lockedCells: {},
      solvedClues: [],
      cellAuthors: {},
      clueAuthors: {},
      wordStreak: 0,
      comboMessage: null,
      validationMessage: null,
      activeClueId: null,
      focusedCell: null,
    });

    get().showGlobalToast(`Tanding Ulang Dimulai! Ronde 1/${battleConfig.rounds}!`, 3200);
  },

  selectLevel: (index: number, broadcastMabar = false) => {
    const { levels, levelRecords, activeRoomCode } = get();
    const safeIdx = Math.max(0, Math.min(index, levels.length - 1));
    const targetLevel = levels[safeIdx];
    if (broadcastMabar && activeRoomCode) {
      mabarRealtime.broadcastLevelChange(safeIdx, targetLevel?.title);
    }
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
      cellAuthors: {},
      clueAuthors: {},
      activeReaction: null,
      nextLevelProposal: null,
      isWaitingForPartnerNextLevel: false,
      partnerReconnecting: null,
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
    selectLevel(nextIdx, true);
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
    if (hapticEnabled) {
      haptic.medium(20);
    }

    selectLevel(randomIdx);
  },

  startDailyRush: () => {
    const { levels, selectLevel, soundEnabled, hapticEnabled } = get();
    const dailyIdx = getDailyRushLevelIndex(levels.length);
    selectLevel(dailyIdx);
    if (soundEnabled) soundManager.playReward();
    if (hapticEnabled) {
      haptic.medium(20);
    }
    set({
      gameMode: 'daily_rush',
      dailyRushTimeLeft: 90,
      currentTab: 'game',
      wordStreak: 0,
      comboMessage: null,
      validationMessage: null,
      isDailyRushBriefingOpen: false,
      isDailyRushResultOpen: false,
      userInputs: {},
      lockedCells: {},
      solvedClues: [],
      cellAuthors: {},
      clueAuthors: {},
      activeClueId: null,
      focusedCell: null,
      levelStartTime: Date.now(),
      levelMistakes: 0,
      levelHintsUsed: 0,
    });
    get().showGlobalToast('Daily Rush 90s Dimulai! Pecahkan secepat mungkin!', 2800);
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
      if (get().hapticEnabled) {
      haptic.light(12);
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
      soundEnabled,
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
      if (soundEnabled) soundManager.playVictory();
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 },
      });
    }

    const lastRun: DailyRushLastRun = {
      score: totalScore,
      speedScore,
      accuracyScore,
      streakScore,
      completionBonus,
      timeSpent,
      accuracy,
      isFullSolved,
      isNewBest: isHigherScore,
      date: today,
    };

    set({
      gameMode: 'classic',
      dailyRushRecord: newRecord,
      dailyRushTimeLeft: 0,
      dailyRushLastRunResult: lastRun,
      isDailyRushResultOpen: true,
    });

    if (totalScore > 0) {
      get().addWeeklyLeagueXp(totalScore);
    }
    if (isFullSolved) {
      get().incrementStreakIfNewDay();
      notificationService.cancelTodayStreakWarning();
    }

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
    if (hapticEnabled) {
      haptic.light(4);
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
    const newAuthors = { ...get().cellAuthors, [key]: 'local' as const };
    if (get().activeRoomCode) {
      mabarRealtime.broadcastInput(key, letter.toUpperCase());
    }
    if (soundEnabled) {
      const sp = get().user?.soundPack;
      if (sp === 'gamelan_classic') {
        soundManager.playGamelanBell();
      } else if (sp === 'acoustic_nylon') {
        soundManager.playAcousticStrum();
      } else {
        soundManager.playKeyClick();
      }
    }
    if (hapticEnabled) {
      haptic.light(6);
    }

    const allClues = [...level.clues.across, ...level.clues.down];
    const newlySolvedClues: string[] = [];
    const newLockedCells = { ...lockedCells };
    const popping: string[] = [];
    const newClueAuthors = { ...get().clueAuthors };

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
          newClueAuthors[clue.id] = 'local';
          for (const [cr, cc] of clue.cells) {
            const ck = `${cr},${cc}`;
            newLockedCells[ck] = true;
            if (!newAuthors[ck]) newAuthors[ck] = 'local';
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
      if (get().gameMode === '1v1_battle') {
        newlySolvedClues.forEach((cid) => {
          get().claimBattleClue(cid, newlySolvedClues, 'local');
        });
      } else if (get().activeRoomCode) {
        mabarRealtime.broadcastClueSolved(activeClueId || newlySolvedClues[0], newlySolvedClues);
      }
      nextWordStreak = wordStreak + newlySolvedClues.length;
      if (soundEnabled) soundManager.playWordCorrect(nextWordStreak);
      if (hapticEnabled) {
      haptic.success([15, 30, 20]);
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
        } else if (get().gameMode === '1v1_battle') {
          get().finishBattleRound();
          return;
        } else {
          if (soundEnabled) soundManager.playVictory();
          get().addWeeklyLeagueXp(50);
          get().incrementStreakIfNewDay();
          notificationService.cancelTodayStreakWarning();
          confetti({
            particleCount: 140,
            spread: 80,
            origin: { y: 0.6 },
          });
          setTimeout(() => {
            set({ isLevelCompleteOpen: true });
          }, 600);
        }
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
          if (get().errorFeedbackMode === 'gentle') {
            shaking = wordWrongCells;
            if (soundEnabled) soundManager.playWordWrong();
            if (hapticEnabled) {
      haptic.error([35, 45]);
    }
            setTimeout(() => {
              set({ shakingCells: [] });
            }, 600);
          }
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
          if (get().errorFeedbackMode === 'gentle') {
            shaking = allWrongCells;
            validationMsg = 'Ada kata yang belum tepat, coba periksa kembali!';
            if (soundEnabled) soundManager.playWordWrong();
            if (hapticEnabled) {
      haptic.error([35, 45]);
    }
            setTimeout(() => {
              set({ shakingCells: [], validationMessage: null });
            }, 2500);
          }
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
            } else if (get().autoAdvanceEnabled) {
              // Reached end of unfilled cells in current clue -> Smart Jump to next clue
              const nextUnsolved = allClues.find(
                (cl) => cl.id !== currentClue.id && !updatedSolved.includes(cl.id) && cl.cells.some(([nr, nc]) => !newInputs[`${nr},${nc}`])
              );
              if (nextUnsolved) {
                nextClueId = nextUnsolved.id;
                const firstEmpty = nextUnsolved.cells.find(([nr, nc]) => !newInputs[`${nr},${nc}`]);
                if (firstEmpty) nextCell = firstEmpty;
              }
            }
          } else if (idx === currentClue.cells.length - 1 && get().autoAdvanceEnabled) {
            // Last letter typed in current clue -> Smart Jump to next incomplete clue
            const nextUnsolved = allClues.find(
              (cl) => cl.id !== currentClue.id && !updatedSolved.includes(cl.id) && cl.cells.some(([nr, nc]) => !newInputs[`${nr},${nc}`])
            );
            if (nextUnsolved) {
              nextClueId = nextUnsolved.id;
              const firstEmpty = nextUnsolved.cells.find(([nr, nc]) => !newInputs[`${nr},${nc}`]);
              if (firstEmpty) nextCell = firstEmpty;
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
      cellAuthors: newAuthors,
      clueAuthors: newClueAuthors,
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
    const { focusedCell, activeClueId, level, lockedCells, userInputs, cellAuthors, soundEnabled, hapticEnabled, levelRecords } = get();
    if (!focusedCell || !activeClueId) return;

    const [r, c] = focusedCell;
    const key = `${r},${c}`;
    const newInputs = { ...userInputs };
    const newAuthors = { ...cellAuthors };
    const clue = findClueById(level, activeClueId);
    const idx = clue ? clue.cells.findIndex(([cr, cc]) => cr === r && cc === c) : -1;

    if (soundEnabled) soundManager.playBackspaceClick();
    if (hapticEnabled) {
      haptic.light(10);
    }

    if (newInputs[key] && !lockedCells[key]) {
      delete newInputs[key];
      delete newAuthors[key];
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
          delete newAuthors[prevKey];
          if (get().activeRoomCode) {
            mabarRealtime.broadcastDelete(prevKey);
          }
          set({
            userInputs: newInputs,
            cellAuthors: newAuthors,
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
    if (hapticEnabled) {
      haptic.light(6);
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
    if (hapticEnabled) {
      haptic.light(6);
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
      if (hapticEnabled) {
      haptic.success([15, 30, 20]);
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
      if (hapticEnabled) {
      haptic.error([35, 45]);
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
      get().showGlobalToast('Bintang tidak cukup! Tuntaskan bab atau misi harian untuk menambah bintang.', 3200);
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
    if (hapticEnabled) {
      haptic.medium(20);
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


  addStars: (amount: number) => {
    const { stars, soundEnabled, hapticEnabled } = get();
    const newStars = Math.max(0, stars + amount);
    localStorage.setItem(STORAGE_KEY_STARS, newStars.toString());
    if (soundEnabled && amount > 0) soundManager.playReward();
    if (hapticEnabled && amount > 0) {
      haptic.medium(25);
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
      cellAuthors: {},
      clueAuthors: {},
      activeReaction: null,
      nextLevelProposal: null,
      isWaitingForPartnerNextLevel: false,
      partnerReconnecting: null,
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

  deleteAccountAndData: () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('tts_') || key.startsWith('crossword_') || key.startsWith('mabar_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // safe fallback if storage access restricted
    }

    const defaultUser: UserProfile = {
      name: 'Tamu',
      isGuest: true,
      avatar: '/maskot/Fierce Plush Crossword Champion.webp',
      joinedAt: 'Mode Tamu',
    };

    set({
      user: defaultUser,
      stars: 120,
      streak: 0,
      streakShields: 1,
      levelRecords: {},
      claimedAchievementRewards: {},
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
      currentLevelIndex: 0,
      level: typedLevels[0],
      isLevelCompleteOpen: false,
      activeRoomCode: null,
      mabarPeers: [],
    });
  },
}));
