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

const STORAGE_KEY_ACTIVE_TOURNAMENT = 'tts_active_tournament_v2';
const STORAGE_KEY_PUBLIC_TOURNAMENTS = 'tts_public_tournaments_v2';
const STORAGE_KEY_TROPHIES = 'tts_tournament_trophies_v1';

/** Generate random 4-digit tournament code: CUP-XXXX */
export function generateTournamentCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `CUP-${digits}`;
}

/** Initial public tournaments when fresh */
export const DEFAULT_PUBLIC_TOURNAMENTS: CommunityTournament[] = [
  {
    id: 'tourney_pub_1',
    code: 'CUP-7721',
    name: 'Piala Jawara Nusantara',
    hostId: 'host_budi',
    hostName: 'Budi Santoso',
    format: 'knockout_4',
    roundDurationSeconds: 60,
    themeCategory: 'Olahraga & Wisata',
    status: 'lobby',
    maxPlayers: 4,
    players: [
      { id: 'host_budi', name: 'Budi Santoso', avatar: MASCOTS.crosswordChampion, isHost: true, isReady: true },
      { id: 'player_siti', name: 'Siti Rahma', avatar: MASCOTS.crosswordGirl, isHost: false, isReady: true },
    ],
    matches: [],
    createdAt: 'Baru saja',
  },
  {
    id: 'tourney_pub_2',
    code: 'CUP-5510',
    name: 'Duel Kosakata Cepat',
    hostId: 'host_eko',
    hostName: 'Eko Lawang',
    format: 'sprint',
    roundDurationSeconds: 60,
    themeCategory: 'Bahasa & Sastra',
    status: 'lobby',
    maxPlayers: 4,
    players: [
      { id: 'host_eko', name: 'Eko Lawang', avatar: MASCOTS.cheerfulBookBoy, isHost: true, isReady: true },
    ],
    matches: [],
    createdAt: '5m lalu',
  },
];

/** Create a new community tournament instance */
export function createCommunityTournament(
  hostPlayer: { id: string; name: string; avatar?: string },
  options: {
    name: string;
    format: TournamentFormat;
    roundDurationSeconds: number;
    themeCategory: string;
  }
): CommunityTournament {
  const maxPlayers = options.format === 'knockout_8' ? 8 : 4;
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

/** Generate a realistic knockout bracket from real joined players */
export function generateKnockoutBracket(
  players: CommunityTournamentPlayer[],
  format: TournamentFormat,
  durationSeconds: number,
  currentUserId: string
): CommunityTournamentMatch[] {
  const matches: CommunityTournamentMatch[] = [];

  if (format === 'knockout_4' || format === 'sprint') {
    // 4 Players -> 2 Semifinals + 1 Grand Final
    const p1 = players[0] || null;
    const p2 = players[1] || null;
    const p3 = players[2] || null;
    const p4 = players[3] || null;

    const sf1: CommunityTournamentMatch = {
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
    };

    const sf2: CommunityTournamentMatch = {
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
    };

    const finalMatch: CommunityTournamentMatch = {
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
    };

    matches.push(sf1, sf2, finalMatch);
  } else {
    // 8 Players -> 4 Quarterfinals + 2 Semifinals + 1 Grand Final
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

  return matches;
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

    // Advance winner to next round match (e.g. SF -> Final)
    if (tournament.format === 'knockout_4' || tournament.format === 'sprint') {
      const finalIdx = matches.findIndex((m) => m.id === 'match_final');
      if (finalIdx !== -1) {
        const finalMatch = matches[finalIdx];
        if (target.id === 'match_sf1') {
          matches[finalIdx] = {
            ...finalMatch,
            player1: winner,
            isPlayerMatch: Boolean(winner?.id === currentUserId || finalMatch.player2?.id === currentUserId),
            status: finalMatch.player2 ? 'active' : 'pending',
          };
        } else if (target.id === 'match_sf2') {
          matches[finalIdx] = {
            ...finalMatch,
            player2: winner,
            isPlayerMatch: Boolean(winner?.id === currentUserId || finalMatch.player1?.id === currentUserId),
            status: finalMatch.player1 ? 'active' : 'pending',
          };
        }
      }
    } else {
      // 8-player bracket propagation
      if (target.id.startsWith('match_qf')) {
        const qfNum = parseInt(target.id.replace('match_qf', ''), 10);
        const sfIdx = qfNum <= 2 ? matches.findIndex((m) => m.id === 'match_sf1') : matches.findIndex((m) => m.id === 'match_sf2');
        if (sfIdx !== -1) {
          const sf = matches[sfIdx];
          const isSlot1 = qfNum % 2 === 1;
          matches[sfIdx] = {
            ...sf,
            player1: isSlot1 ? winner : sf.player1,
            player2: !isSlot1 ? winner : sf.player2,
            isPlayerMatch: Boolean(
              (isSlot1 ? winner?.id : sf.player1?.id) === currentUserId ||
              (!isSlot1 ? winner?.id : sf.player2?.id) === currentUserId
            ),
            status: (isSlot1 ? sf.player2 : sf.player1) ? 'active' : 'pending',
          };
        }
      } else if (target.id.startsWith('match_sf')) {
        const finalIdx = matches.findIndex((m) => m.id === 'match_final');
        if (finalIdx !== -1) {
          const finalMatch = matches[finalIdx];
          if (target.id === 'match_sf1') {
            matches[finalIdx] = {
              ...finalMatch,
              player1: winner,
              isPlayerMatch: Boolean(winner?.id === currentUserId || finalMatch.player2?.id === currentUserId),
              status: finalMatch.player2 ? 'active' : 'pending',
            };
          } else {
            matches[finalIdx] = {
              ...finalMatch,
              player2: winner,
              isPlayerMatch: Boolean(winner?.id === currentUserId || finalMatch.player1?.id === currentUserId),
              status: finalMatch.player1 ? 'active' : 'pending',
            };
          }
        }
      }
    }
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
