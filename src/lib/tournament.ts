import { MASCOTS } from '../assets/maskots';

export type TournamentFormat = 'knockout_4' | 'knockout_8' | 'sprint';

export interface CommunityTournamentPlayer {
  id: string;
  name: string;
  avatar?: string;
  isHost?: boolean;
  isReady?: boolean;
  score?: number;
}

export interface CommunityTournamentMatch {
  id: string;
  roundIndex: number;
  roundName: string;
  player1: CommunityTournamentPlayer | null;
  player2: CommunityTournamentPlayer | null;
  winner: CommunityTournamentPlayer | null;
  player1Score: number;
  player2Score: number;
  durationSeconds: number;
  status: 'pending' | 'active' | 'completed';
  isPlayerMatch: boolean;
  levelIndex?: number;
}

export interface CommunityTournament {
  id: string;
  code: string;
  name: string;
  hostId: string;
  hostName: string;
  format: TournamentFormat;
  roundDurationSeconds: number;
  themeCategory: string;
  status: 'lobby' | 'in_progress' | 'completed';
  players: CommunityTournamentPlayer[];
  maxPlayers: number;
  matches: CommunityTournamentMatch[];
  currentMatchId?: string;
  champion?: CommunityTournamentPlayer;
  runnerUp?: CommunityTournamentPlayer;
  createdAt: string;
  completedAt?: string;
}

export interface TrophyRecord {
  gold: number;
  silver: number;
  bronze: number;
  totalTournaments: number;
  lastChampionDate?: string;
}

/** Predefined pool of smart bots with Indonesian names & colorful mascot avatars */
export const TOURNAMENT_BOT_CANDIDATES: CommunityTournamentPlayer[] = [
  { id: 'bot_aris', name: 'Aris Pratama', avatar: MASCOTS.crosswordDuel, isHost: false, isReady: true },
  { id: 'bot_siti', name: 'Siti Rahma', avatar: MASCOTS.crosswordGirl, isHost: false, isReady: true },
  { id: 'bot_bagus', name: 'Bagus Wijaya', avatar: MASCOTS.cheerfulBookBoy, isHost: false, isReady: true },
  { id: 'bot_rina', name: 'Rina Melati', avatar: MASCOTS.crosswordGirlSticker, isHost: false, isReady: true },
  { id: 'bot_fajar', name: 'Fajar Hidayat', avatar: MASCOTS.puzzleScholar, isHost: false, isReady: true },
  { id: 'bot_dewi', name: 'Dewi Kartika', avatar: MASCOTS.puzzleExplorer, isHost: false, isReady: true },
  { id: 'bot_hendra', name: 'Hendra Saputra', avatar: MASCOTS.puzzleGamer, isHost: false, isReady: true },
  { id: 'bot_maya', name: 'Maya Kusuma', avatar: MASCOTS.crosswordThinker, isHost: false, isReady: true },
  { id: 'bot_bambang', name: 'Bambang Pamungkas', avatar: MASCOTS.batikWordsmith, isHost: false, isReady: true },
  { id: 'bot_anita', name: 'Anita Putri', avatar: MASCOTS.indonesianPuzzleKid, isHost: false, isReady: true },
  { id: 'bot_dimas', name: 'Dimas Setiawan', avatar: MASCOTS.techSavvyWalker, isHost: false, isReady: true },
  { id: 'bot_clarissa', name: 'Clarissa Tania', avatar: MASCOTS.puzzleMoment, isHost: false, isReady: true },
  { id: 'bot_reza', name: 'Reza Rahardian', avatar: MASCOTS.boySolvingPuzzle, isHost: false, isReady: true },
  { id: 'bot_zahra', name: 'Zahra Amelia', avatar: MASCOTS.indonesianPuzzlePals, isHost: false, isReady: true },
  { id: 'bot_kevin', name: 'Kevin Sanjaya', avatar: MASCOTS.crosswordChampion, isHost: false, isReady: true },
];

/** Fill remaining open slots in a tournament lobby with bots */
export function fillRemainingSlotsWithBots(tournament: CommunityTournament): CommunityTournament {
  const emptyCount = Math.max(0, tournament.maxPlayers - tournament.players.length);
  if (emptyCount === 0) return tournament;

  const existingIds = new Set(tournament.players.map((p) => p.id));
  const availableBots = TOURNAMENT_BOT_CANDIDATES.filter((b) => !existingIds.has(b.id));

  const newBots = availableBots.slice(0, emptyCount).map((b) => ({
    ...b,
    isHost: false,
    isReady: true,
  }));

  const updatedTourney: CommunityTournament = {
    ...tournament,
    players: [...tournament.players, ...newBots],
  };

  saveActiveCommunityTournament(updatedTourney);
  return updatedTourney;
}

const STORAGE_KEY_ACTIVE_TOURNAMENT = 'tts_active_tournament_v2';
const STORAGE_KEY_PUBLIC_TOURNAMENTS = 'tts_public_tournaments_v2';
const STORAGE_KEY_TROPHIES = 'tts_tournament_trophies_v1';

/** Generate random 4-digit tournament code: CUP-XXXX */
export function generateTournamentCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `CUP-${digits}`;
}

/** Initial public tournaments when fresh */
export const DEFAULT_PUBLIC_TOURNAMENTS: CommunityTournament[] = [];

/** Create a new community tournament instance */
export function createCommunityTournament(
  hostPlayer: { id: string; name: string; avatar?: string },
  options: {
    name: string;
    format: TournamentFormat;
    roundDurationSeconds: number;
    themeCategory: string;
    maxPlayers?: number;
  }
): CommunityTournament {
  const maxPlayers = options.maxPlayers || (options.format === 'knockout_8' ? 8 : 4);
  const newTourney: CommunityTournament = {
    id: `tourney_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    code: generateTournamentCode(),
    name: options.name.trim() || `Piala ${hostPlayer.name}`,
    hostId: hostPlayer.id,
    hostName: hostPlayer.name,
    format: options.format,
    roundDurationSeconds: options.roundDurationSeconds || 60,
    themeCategory: options.themeCategory || 'Semua Kategori (Acak)',
    status: 'lobby',
    maxPlayers,
    players: [
      {
        id: hostPlayer.id,
        name: hostPlayer.name,
        avatar: hostPlayer.avatar || MASCOTS.crosswordChampion,
        isHost: true,
        isReady: true,
      },
    ],
    matches: [],
    createdAt: 'Baru saja',
  };

  saveActiveCommunityTournament(newTourney);
  return newTourney;
}

/** Generate a realistic knockout bracket from real joined players (4 to 16 players) */
export function generateKnockoutBracket(
  players: CommunityTournamentPlayer[],
  _format: TournamentFormat,
  durationSeconds: number,
  currentUserId: string
): CommunityTournamentMatch[] {
  const matches: CommunityTournamentMatch[] = [];
  const count = players.length;

  if (count <= 4) {
    // 4 Players -> 2 Semifinals + 1 Grand Final
    const p1 = players[0] || null;
    const p2 = players[1] || null;
    const p3 = players[2] || null;
    const p4 = players[3] || null;

    matches.push(
      {
        id: 'match_sf1',
        roundIndex: 0,
        roundName: 'Semifinal 1',
        player1: p1,
        player2: p2,
        winner: null,
        player1Score: 0,
        player2Score: 0,
        durationSeconds,
        status: 'active',
        isPlayerMatch: Boolean(p1?.id === currentUserId || p2?.id === currentUserId),
      },
      {
        id: 'match_sf2',
        roundIndex: 0,
        roundName: 'Semifinal 2',
        player1: p3,
        player2: p4,
        winner: null,
        player1Score: 0,
        player2Score: 0,
        durationSeconds,
        status: 'active',
        isPlayerMatch: Boolean(p3?.id === currentUserId || p4?.id === currentUserId),
      },
      {
        id: 'match_final',
        roundIndex: 1,
        roundName: 'Grand Final',
        player1: null,
        player2: null,
        winner: null,
        player1Score: 0,
        player2Score: 0,
        durationSeconds: Math.round(durationSeconds * 1.2),
        status: 'pending',
        isPlayerMatch: false,
      }
    );
  } else if (count <= 8) {
    // 6 or 8 Players -> Bracket 8 Besar
    if (count < 8) {
      // 5, 6, 7 players: top seeds get BYE to Semifinals
      const byeCount = 8 - count;
      const byePlayers = players.slice(0, byeCount);
      const activeContestants = players.slice(byeCount);

      const qfCount = Math.floor(activeContestants.length / 2);
      for (let i = 0; i < qfCount; i++) {
        const p1 = activeContestants[i * 2] || null;
        const p2 = activeContestants[i * 2 + 1] || null;
        matches.push({
          id: `match_qf${i + 1}`,
          roundIndex: 0,
          roundName: `Perempat Final ${i + 1}`,
          player1: p1,
          player2: p2,
          winner: null,
          player1Score: 0,
          player2Score: 0,
          durationSeconds,
          status: 'active',
          isPlayerMatch: Boolean(p1?.id === currentUserId || p2?.id === currentUserId),
        });
      }

      matches.push(
        {
          id: 'match_sf1',
          roundIndex: 1,
          roundName: 'Semifinal 1',
          player1: byePlayers[0] || null,
          player2: null,
          winner: null,
          player1Score: 0,
          player2Score: 0,
          durationSeconds,
          status: 'pending',
          isPlayerMatch: Boolean(byePlayers[0]?.id === currentUserId),
        },
        {
          id: 'match_sf2',
          roundIndex: 1,
          roundName: 'Semifinal 2',
          player1: byePlayers[1] || null,
          player2: null,
          winner: null,
          player1Score: 0,
          player2Score: 0,
          durationSeconds,
          status: 'pending',
          isPlayerMatch: Boolean(byePlayers[1]?.id === currentUserId),
        },
        {
          id: 'match_final',
          roundIndex: 2,
          roundName: 'Grand Final',
          player1: null,
          player2: null,
          winner: null,
          player1Score: 0,
          player2Score: 0,
          durationSeconds: Math.round(durationSeconds * 1.2),
          status: 'pending',
          isPlayerMatch: false,
        }
      );
    } else {
      // Exactly 8 players -> 4 QF + 2 SF + 1 Final
      for (let i = 0; i < 4; i++) {
        const p1 = players[i * 2] || null;
        const p2 = players[i * 2 + 1] || null;
        matches.push({
          id: `match_qf${i + 1}`,
          roundIndex: 0,
          roundName: `Perempat Final ${i + 1}`,
          player1: p1,
          player2: p2,
          winner: null,
          player1Score: 0,
          player2Score: 0,
          durationSeconds,
          status: 'active',
          isPlayerMatch: Boolean(p1?.id === currentUserId || p2?.id === currentUserId),
        });
      }

      matches.push(
        {
          id: 'match_sf1',
          roundIndex: 1,
          roundName: 'Semifinal 1',
          player1: null,
          player2: null,
          winner: null,
          player1Score: 0,
          player2Score: 0,
          durationSeconds,
          status: 'pending',
          isPlayerMatch: false,
        },
        {
          id: 'match_sf2',
          roundIndex: 1,
          roundName: 'Semifinal 2',
          player1: null,
          player2: null,
          winner: null,
          player1Score: 0,
          player2Score: 0,
          durationSeconds,
          status: 'pending',
          isPlayerMatch: false,
        },
        {
          id: 'match_final',
          roundIndex: 2,
          roundName: 'Grand Final',
          player1: null,
          player2: null,
          winner: null,
          player1Score: 0,
          player2Score: 0,
          durationSeconds: Math.round(durationSeconds * 1.2),
          status: 'pending',
          isPlayerMatch: false,
        }
      );
    }
  } else {
    // 9 to 16 players (10, 12, 14, 16)
    const byeCount = 16 - count;
    const byePlayers = players.slice(0, byeCount);
    const activeContestants = players.slice(byeCount);

    const r1Count = Math.floor(activeContestants.length / 2);
    for (let i = 0; i < r1Count; i++) {
      const p1 = activeContestants[i * 2] || null;
      const p2 = activeContestants[i * 2 + 1] || null;
      matches.push({
        id: `match_r1_${i + 1}`,
        roundIndex: 0,
        roundName: `Babak 16 Besar ${i + 1}`,
        player1: p1,
        player2: p2,
        winner: null,
        player1Score: 0,
        player2Score: 0,
        durationSeconds,
        status: 'active',
        isPlayerMatch: Boolean(p1?.id === currentUserId || p2?.id === currentUserId),
      });
    }

    // 4 Quarterfinals (pre-seeded with BYEs)
    for (let i = 0; i < 4; i++) {
      const seededBye = byePlayers[i] || null;
      matches.push({
        id: `match_qf${i + 1}`,
        roundIndex: 1,
        roundName: `Perempat Final ${i + 1}`,
        player1: seededBye,
        player2: null,
        winner: null,
        player1Score: 0,
        player2Score: 0,
        durationSeconds,
        status: 'pending',
        isPlayerMatch: Boolean(seededBye?.id === currentUserId),
      });
    }

    // 2 Semifinals and 1 Grand Final
    matches.push(
      {
        id: 'match_sf1',
        roundIndex: 2,
        roundName: 'Semifinal 1',
        player1: null,
        player2: null,
        winner: null,
        player1Score: 0,
        player2Score: 0,
        durationSeconds,
        status: 'pending',
        isPlayerMatch: false,
      },
      {
        id: 'match_sf2',
        roundIndex: 2,
        roundName: 'Semifinal 2',
        player1: null,
        player2: null,
        winner: null,
        player1Score: 0,
        player2Score: 0,
        durationSeconds,
        status: 'pending',
        isPlayerMatch: false,
      },
      {
        id: 'match_final',
        roundIndex: 3,
        roundName: 'Grand Final',
        player1: null,
        player2: null,
        winner: null,
        player1Score: 0,
        player2Score: 0,
        durationSeconds: Math.round(durationSeconds * 1.2),
        status: 'pending',
        isPlayerMatch: false,
      }
    );
  }

  return matches.map((m, idx) => ({
    ...m,
    levelIndex: m.levelIndex ?? (idx * 3 + 1) % 20,
  }));
}

/** Propagate winner of a match into the corresponding slot in next round */
export function propagateWinnerToNextRound(
  matches: CommunityTournamentMatch[],
  target: CommunityTournamentMatch,
  winner: CommunityTournamentPlayer | null,
  currentUserId: string
): void {
  if (!winner) return;

  // 1. match_r1_X (Round 1 / 16 Besar) -> match_qfX (Quarterfinals)
  if (target.id.startsWith('match_r1_')) {
    const r1Num = parseInt(target.id.replace('match_r1_', ''), 10);
    const qfIdx = matches.findIndex((m) => m.id === `match_qf${r1Num}`);
    if (qfIdx !== -1) {
      const qf = matches[qfIdx];
      matches[qfIdx] = {
        ...qf,
        player2: winner,
        isPlayerMatch: Boolean(qf.player1?.id === currentUserId || winner.id === currentUserId),
        status: qf.player1 ? 'active' : 'pending',
      };
    }
    return;
  }

  // 2. match_qfX (Quarterfinals) -> match_sf1 or match_sf2
  if (target.id.startsWith('match_qf')) {
    const qfNum = parseInt(target.id.replace('match_qf', ''), 10);
    const totalQFs = matches.filter((m) => m.id.startsWith('match_qf')).length;
    let sfIdx = -1;
    let isSlot1 = true;

    if (totalQFs <= 2) {
      // 6-player format with 2 byes pre-seeded in SF
      if (qfNum === 1) {
        sfIdx = matches.findIndex((m) => m.id === 'match_sf1');
        isSlot1 = false;
      } else {
        sfIdx = matches.findIndex((m) => m.id === 'match_sf2');
        isSlot1 = false;
      }
    } else {
      // 4 QFs: QF1 & QF2 feed SF1; QF3 & QF4 feed SF2
      if (qfNum <= 2) {
        sfIdx = matches.findIndex((m) => m.id === 'match_sf1');
        isSlot1 = qfNum === 1;
      } else {
        sfIdx = matches.findIndex((m) => m.id === 'match_sf2');
        isSlot1 = qfNum === 3;
      }
    }

    if (sfIdx !== -1) {
      const sf = matches[sfIdx];
      const nextP1 = isSlot1 ? winner : sf.player1;
      const nextP2 = !isSlot1 ? winner : sf.player2;
      matches[sfIdx] = {
        ...sf,
        player1: nextP1,
        player2: nextP2,
        isPlayerMatch: Boolean(nextP1?.id === currentUserId || nextP2?.id === currentUserId),
        status: nextP1 && nextP2 ? 'active' : 'pending',
      };
    }
    return;
  }

  // 3. match_sf1 or match_sf2 -> match_final
  if (target.id === 'match_sf1' || target.id === 'match_sf2') {
    const finalIdx = matches.findIndex((m) => m.id === 'match_final');
    if (finalIdx !== -1) {
      const finalMatch = matches[finalIdx];
      const isSlot1 = target.id === 'match_sf1';
      const nextP1 = isSlot1 ? winner : finalMatch.player1;
      const nextP2 = !isSlot1 ? winner : finalMatch.player2;
      matches[finalIdx] = {
        ...finalMatch,
        player1: nextP1,
        player2: nextP2,
        isPlayerMatch: Boolean(nextP1?.id === currentUserId || nextP2?.id === currentUserId),
        status: nextP1 && nextP2 ? 'active' : 'pending',
      };
    }
    return;
  }
}

/** Simulate concurrent AI vs AI matches in the same round */
export function simulateConcurrentMatches(
  tournament: CommunityTournament,
  currentRoundIndex: number,
  currentUserId: string
): CommunityTournament {
  const matches = [...tournament.matches];
  let changed = false;

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    // Find active non-player match in the current round with both contestants present
    if (
      m.roundIndex === currentRoundIndex &&
      m.status === 'active' &&
      !m.isPlayerMatch &&
      m.player1 &&
      m.player2
    ) {
      const p1Wins = Math.random() > 0.48;
      const scoreWinner = Math.floor(65 + Math.random() * 30);
      const scoreLoser = Math.floor(25 + Math.random() * 35);
      const p1Score = p1Wins ? scoreWinner : scoreLoser;
      const p2Score = p1Wins ? scoreLoser : scoreWinner;
      const winner = p1Wins ? m.player1 : m.player2;

      matches[i] = {
        ...m,
        status: 'completed',
        winner,
        player1Score: p1Score,
        player2Score: p2Score,
      };

      propagateWinnerToNextRound(matches, matches[i], winner, currentUserId);
      changed = true;
    }
  }

  if (!changed) return tournament;

  const updatedTournament: CommunityTournament = {
    ...tournament,
    matches,
  };
  saveActiveCommunityTournament(updatedTournament);
  return updatedTournament;
}

/** Advance match result and update bracket */
export function advanceTournamentMatch(
  tournament: CommunityTournament,
  matchId: string,
  winnerId: string,
  p1Score: number,
  p2Score: number,
  currentUserId: string
): {
  updatedTournament: CommunityTournament;
  trophyAwarded?: 'gold' | 'silver' | 'bronze';
  starsAwarded: number;
} {
  const matches = [...tournament.matches];
  const targetIdx = matches.findIndex((m) => m.id === matchId);
  if (targetIdx === -1) {
    return { updatedTournament: tournament, starsAwarded: 0 };
  }

  const target = matches[targetIdx];
  const winner = target.player1?.id === winnerId ? target.player1 : target.player2;
  const loser = target.player1?.id === winnerId ? target.player2 : target.player1;

  matches[targetIdx] = {
    ...target,
    winner,
    player1Score: p1Score,
    player2Score: p2Score,
    status: 'completed',
  };

  let trophyAwarded: 'gold' | 'silver' | 'bronze' | undefined;
  let starsAwarded = 0;
  let newStatus = tournament.status;
  let champion = tournament.champion;
  let runnerUp = tournament.runnerUp;

  // Check if target was the Grand Final
  if (target.roundName === 'Grand Final') {
    newStatus = 'completed';
    champion = winner || undefined;
    runnerUp = loser || undefined;

    if (winner?.id === currentUserId) {
      trophyAwarded = 'gold';
      starsAwarded = 200;
      addTrophy('gold');
    } else if (loser?.id === currentUserId) {
      trophyAwarded = 'silver';
      starsAwarded = 100;
      addTrophy('silver');
    }
  } else {
    // If user lost in Semifinal, they get Bronze
    if (target.roundName.startsWith('Semifinal') && loser?.id === currentUserId) {
      trophyAwarded = 'bronze';
      starsAwarded = 50;
      addTrophy('bronze');
    }

    // Universal winner advancement across all tournament formats
    propagateWinnerToNextRound(matches, target, winner, currentUserId);
  }

  const updatedTournament: CommunityTournament = {
    ...tournament,
    status: newStatus,
    matches,
    champion,
    runnerUp,
    completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
  };

  saveActiveCommunityTournament(updatedTournament);
  return { updatedTournament, trophyAwarded, starsAwarded };
}

/** Trophies Storage Management */
export function loadTrophies(): TrophyRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TROPHIES);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { gold: 0, silver: 0, bronze: 0, totalTournaments: 0 };
}

export function saveTrophies(trophies: TrophyRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY_TROPHIES, JSON.stringify(trophies));
  } catch {
    // ignore
  }
}

export function addTrophy(type: 'gold' | 'silver' | 'bronze'): TrophyRecord {
  const current = loadTrophies();
  const next: TrophyRecord = {
    ...current,
    [type]: current[type] + 1,
    totalTournaments: current.totalTournaments + 1,
    lastChampionDate: type === 'gold' ? new Date().toISOString() : current.lastChampionDate,
  };
  saveTrophies(next);
  return next;
}

/** Storage for Active Community Tournament */
export function loadActiveCommunityTournament(): CommunityTournament | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ACTIVE_TOURNAMENT);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function saveActiveCommunityTournament(tournament: CommunityTournament | null): void {
  try {
    if (tournament) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_TOURNAMENT, JSON.stringify(tournament));
    } else {
      localStorage.removeItem(STORAGE_KEY_ACTIVE_TOURNAMENT);
    }
  } catch {
    // ignore
  }
}

/** Storage for Public Tournaments List */
export function loadPublicTournaments(): CommunityTournament[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PUBLIC_TOURNAMENTS);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return DEFAULT_PUBLIC_TOURNAMENTS;
}

export function savePublicTournaments(list: CommunityTournament[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PUBLIC_TOURNAMENTS, JSON.stringify(list));
  } catch {
    // ignore
  }
}

/** Backward-compatibility aliases for legacy imports if needed */
export type TournamentRoundKey = 'round_of_16' | 'quarter_final' | 'semi_final' | 'final';
export interface TournamentDuelist {
  id: string;
  name: string;
  origin: string;
  avatar: string;
  title: string;
  speedRating: number;
  accuracyRating: number;
  isPlayer?: boolean;
}
export interface TournamentMatch {
  id: string;
  round: TournamentRoundKey;
  roundTitle: string;
  player1: TournamentDuelist;
  player2: TournamentDuelist;
  winner?: TournamentDuelist;
  player1Score?: number;
  player2Score?: number;
  durationSeconds: number;
  wordCount: 'short' | 'medium' | 'long';
  isPlayerMatch: boolean;
  status: 'pending' | 'active' | 'completed';
}
export interface TournamentCupState {
  id: string;
  seasonName: string;
  currentRound: TournamentRoundKey;
  matches: Record<TournamentRoundKey, TournamentMatch[]>;
  playerStatus: 'in_progress' | 'champion' | 'eliminated';
  eliminatedAtRound?: TournamentRoundKey;
  activeMatchId?: string;
  completedAt?: string;
}
export function createInitialTournamentState(_playerName?: string, _playerAvatar?: string): TournamentCupState {
  return {
    id: `cup_${Date.now()}`,
    seasonName: 'Piala Nusantara',
    currentRound: 'final',
    matches: {
      round_of_16: [],
      quarter_final: [],
      semi_final: [],
      final: [],
    },
    playerStatus: 'in_progress',
  };
}
export function loadTournamentState(): TournamentCupState | null {
  return null;
}
export function saveTournamentState(_state: TournamentCupState): void {}
export function advanceTournament(
  state: TournamentCupState,
  _playerWon: boolean,
  _pScore?: number,
  _oppScore?: number
): { nextState: TournamentCupState; trophyAwarded?: 'gold' | 'silver' | 'bronze' } {
  return { nextState: state };
}
