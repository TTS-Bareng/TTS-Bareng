import { MASCOTS } from '../assets/maskots';

export type TournamentRoundKey = 'round_of_16' | 'quarter_final' | 'semi_final' | 'final';

export interface TournamentDuelist {
  id: string;
  name: string;
  origin: string;
  avatar: string;
  title: string;
  speedRating: number; // 60 - 95 (detik per kata relatif)
  accuracyRating: number; // 70 - 98
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

export interface TrophyRecord {
  gold: number;
  silver: number;
  bronze: number;
  totalTournaments: number;
  lastChampionDate?: string;
}

const STORAGE_KEY_TOURNAMENT = 'tts_tournament_cup_state_v1';
const STORAGE_KEY_TROPHIES = 'tts_tournament_trophies_v1';

export const ROUND_NAMES: Record<TournamentRoundKey, { title: string; short: string; duration: number }> = {
  round_of_16: { title: 'Babak 16 Besar', short: '16 Besar', duration: 45 },
  quarter_final: { title: 'Perempat Final', short: '8 Besar', duration: 60 },
  semi_final: { title: 'Semifinal', short: '4 Besar', duration: 75 },
  final: { title: 'Grand Final Piala Nusantara', short: 'Grand Final', duration: 90 },
};

/** 15 AI Duelists with authentic Indonesian regional identities & unique personas */
export const AI_DUELISTS_POOL: TournamentDuelist[] = [
  {
    id: 'ai_budi_kilat',
    name: 'Budi Kilat',
    origin: 'Surabaya',
    avatar: MASCOTS.crosswordChampion,
    title: 'Sprint Master Jatim',
    speedRating: 92,
    accuracyRating: 88,
  },
  {
    id: 'ai_prof_raden',
    name: 'Prof. Raden',
    origin: 'Yogyakarta',
    avatar: MASCOTS.puzzleScholar,
    title: 'Kamus Berjalan Kraton',
    speedRating: 78,
    accuracyRating: 98,
  },
  {
    id: 'ai_siti_medan',
    name: 'Siti Horas',
    origin: 'Medan',
    avatar: MASCOTS.crosswordGirl,
    title: 'Pakar Pantun Deli',
    speedRating: 86,
    accuracyRating: 91,
  },
  {
    id: 'ai_dian_dewata',
    name: 'Dian Dewata',
    origin: 'Denpasar',
    avatar: MASCOTS.puzzleGamer,
    title: 'Seniman Kata Bali',
    speedRating: 81,
    accuracyRating: 93,
  },
  {
    id: 'ai_agus_jakarta',
    name: 'Agus Senopati',
    origin: 'Jakarta',
    avatar: MASCOTS.techSavvyWalker,
    title: 'Taktisi Duel Cepat',
    speedRating: 89,
    accuracyRating: 87,
  },
  {
    id: 'ai_tari_minang',
    name: 'Tari Minang',
    origin: 'Padang',
    avatar: MASCOTS.crosswordGirlSticker,
    title: 'Pemecah Sandi Ranah',
    speedRating: 83,
    accuracyRating: 94,
  },
  {
    id: 'ai_wayan_lombok',
    name: 'Wayan Rinjani',
    origin: 'Mataram',
    avatar: MASCOTS.puzzleExplorer,
    title: 'Penjelajah Puncak',
    speedRating: 80,
    accuracyRating: 92,
  },
  {
    id: 'ai_eko_semarang',
    name: 'Eko Lawang',
    origin: 'Semarang',
    avatar: MASCOTS.cheerfulBookBoy,
    title: 'Pena Emas Jawa',
    speedRating: 82,
    accuracyRating: 90,
  },
  {
    id: 'ai_maya_bandung',
    name: 'Maya Parahyangan',
    origin: 'Bandung',
    avatar: MASCOTS.indonesianPuzzleKid,
    title: 'Pujangga Pasundan',
    speedRating: 87,
    accuracyRating: 95,
  },
  {
    id: 'ai_rizky_phinisi',
    name: 'Rizky Phinisi',
    origin: 'Makassar',
    avatar: MASCOTS.crosswordThinker,
    title: 'Nakhoda Silang Bahari',
    speedRating: 88,
    accuracyRating: 89,
  },
  {
    id: 'ai_intan_bogor',
    name: 'Intan Hujan',
    origin: 'Bogor',
    avatar: MASCOTS.boySolvingPuzzle,
    title: 'Pemerhati Biota Raya',
    speedRating: 80,
    accuracyRating: 93,
  },
  {
    id: 'ai_fajar_maluku',
    name: 'Fajar Banda',
    origin: 'Ambon',
    avatar: MASCOTS.indonesianPuzzlePals,
    title: 'Mutiara Kata Timur',
    speedRating: 84,
    accuracyRating: 92,
  },
  {
    id: 'ai_gita_solo',
    name: 'Gita Keraton',
    origin: 'Surakarta',
    avatar: MASCOTS.batikWordsmith,
    title: 'Batik Wordsmith Klasik',
    speedRating: 79,
    accuracyRating: 97,
  },
  {
    id: 'ai_rendy_borneo',
    name: 'Rendy Khatulistiwa',
    origin: 'Pontianak',
    avatar: MASCOTS.puzzleMoment,
    title: 'Penjaga Rimba Borneo',
    speedRating: 85,
    accuracyRating: 89,
  },
  {
    id: 'ai_tiara_aceh',
    name: 'Tiara Serambi',
    origin: 'Banda Aceh',
    avatar: MASCOTS.friendsPlaying,
    title: 'Srikandi Kata Rencong',
    speedRating: 83,
    accuracyRating: 96,
  },
];

/** Shuffle utility */
function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Generate a brand-new 16-player tournament bracket */
export function createInitialTournamentState(
  playerName: string,
  playerAvatar?: string
): TournamentCupState {
  const playerDuelist: TournamentDuelist = {
    id: 'player_local',
    name: playerName || 'Kamu',
    origin: 'Indonesia',
    avatar: playerAvatar || MASCOTS.crosswordChampion,
    title: 'Challenger Piala',
    speedRating: 90,
    accuracyRating: 92,
    isPlayer: true,
  };

  const pool = shuffleArray(AI_DUELISTS_POOL);
  const contestants: TournamentDuelist[] = [playerDuelist, ...pool.slice(0, 15)];
  const seeded = shuffleArray(contestants);

  // Build 8 matches for Round of 16
  const roundOf16Matches: TournamentMatch[] = [];
  for (let i = 0; i < 8; i++) {
    const p1 = seeded[i * 2];
    const p2 = seeded[i * 2 + 1];
    const isPlayerMatch = Boolean(p1.isPlayer || p2.isPlayer);

    roundOf16Matches.push({
      id: `r16_m${i + 1}`,
      round: 'round_of_16',
      roundTitle: ROUND_NAMES.round_of_16.title,
      player1: p1,
      player2: p2,
      durationSeconds: ROUND_NAMES.round_of_16.duration,
      wordCount: 'short',
      isPlayerMatch,
      status: 'pending',
    });
  }

  // Pre-generate placeholder matches for subsequent rounds
  const quarterFinalMatches: TournamentMatch[] = Array.from({ length: 4 }).map((_, idx) => ({
    id: `qf_m${idx + 1}`,
    round: 'quarter_final',
    roundTitle: ROUND_NAMES.quarter_final.title,
    player1: { id: `qf_tbd_1_${idx}`, name: 'TBD', origin: '-', avatar: '', title: '-', speedRating: 80, accuracyRating: 85 },
    player2: { id: `qf_tbd_2_${idx}`, name: 'TBD', origin: '-', avatar: '', title: '-', speedRating: 80, accuracyRating: 85 },
    durationSeconds: ROUND_NAMES.quarter_final.duration,
    wordCount: 'medium',
    isPlayerMatch: false,
    status: 'pending',
  }));

  const semiFinalMatches: TournamentMatch[] = Array.from({ length: 2 }).map((_, idx) => ({
    id: `sf_m${idx + 1}`,
    round: 'semi_final',
    roundTitle: ROUND_NAMES.semi_final.title,
    player1: { id: `sf_tbd_1_${idx}`, name: 'TBD', origin: '-', avatar: '', title: '-', speedRating: 80, accuracyRating: 85 },
    player2: { id: `sf_tbd_2_${idx}`, name: 'TBD', origin: '-', avatar: '', title: '-', speedRating: 80, accuracyRating: 85 },
    durationSeconds: ROUND_NAMES.semi_final.duration,
    wordCount: 'medium',
    isPlayerMatch: false,
    status: 'pending',
  }));

  const finalMatches: TournamentMatch[] = [
    {
      id: 'f_m1',
      round: 'final',
      roundTitle: ROUND_NAMES.final.title,
      player1: { id: 'f_tbd_1', name: 'TBD', origin: '-', avatar: '', title: '-', speedRating: 80, accuracyRating: 85 },
      player2: { id: 'f_tbd_2', name: 'TBD', origin: '-', avatar: '', title: '-', speedRating: 80, accuracyRating: 85 },
      durationSeconds: ROUND_NAMES.final.duration,
      wordCount: 'long',
      isPlayerMatch: false,
      status: 'pending',
    },
  ];

  const state: TournamentCupState = {
    id: `cup_${Date.now()}`,
    seasonName: 'Piala Nusantara • Musim 1',
    currentRound: 'round_of_16',
    matches: {
      round_of_16: roundOf16Matches,
      quarter_final: quarterFinalMatches,
      semi_final: semiFinalMatches,
      final: finalMatches,
    },
    playerStatus: 'in_progress',
  };

  saveTournamentState(state);
  return state;
}

/** Simulate an AI-vs-AI match to determine plausible winner */
export function simulateAiMatch(match: TournamentMatch): TournamentMatch {
  if (match.isPlayerMatch || match.status === 'completed') return match;

  const score1 = Math.round(match.player1.speedRating * 0.6 + match.player1.accuracyRating * 0.4 + (Math.random() * 20 - 10));
  const score2 = Math.round(match.player2.speedRating * 0.6 + match.player2.accuracyRating * 0.4 + (Math.random() * 20 - 10));

  const winner = score1 >= score2 ? match.player1 : match.player2;
  return {
    ...match,
    winner,
    player1Score: Math.max(3, Math.min(8, Math.round(score1 / 15))),
    player2Score: Math.max(2, Math.min(8, Math.round(score2 / 15))),
    status: 'completed',
  };
}

/** Advance tournament after player match completes */
export function advanceTournament(
  state: TournamentCupState,
  playerWon: boolean,
  playerScore = 5,
  opponentScore = 3
): { nextState: TournamentCupState; trophyAwarded?: 'gold' | 'silver' | 'bronze' } {
  const currentRoundKey = state.currentRound;
  const currentMatches = state.matches[currentRoundKey];
  const playerMatchIdx = currentMatches.findIndex((m) => m.isPlayerMatch);

  if (playerMatchIdx === -1) {
    return { nextState: state };
  }

  const pMatch = currentMatches[playerMatchIdx];
  const player = pMatch.player1.isPlayer ? pMatch.player1 : pMatch.player2;
  const opponent = pMatch.player1.isPlayer ? pMatch.player2 : pMatch.player1;

  // Complete player match
  const updatedPlayerMatch: TournamentMatch = {
    ...pMatch,
    winner: playerWon ? player : opponent,
    player1Score: pMatch.player1.isPlayer ? playerScore : opponentScore,
    player2Score: pMatch.player1.isPlayer ? opponentScore : playerScore,
    status: 'completed',
  };

  // Simulate all remaining non-player matches in this round
  const simulatedMatches = currentMatches.map((m, idx) => {
    if (idx === playerMatchIdx) return updatedPlayerMatch;
    return simulateAiMatch(m);
  });

  const updatedMatches = {
    ...state.matches,
    [currentRoundKey]: simulatedMatches,
  };

  // If player lost: Player is eliminated
  if (!playerWon) {
    let trophyAwarded: 'gold' | 'silver' | 'bronze' | undefined;
    if (currentRoundKey === 'final') {
      trophyAwarded = 'silver';
      addTrophy('silver');
    } else if (currentRoundKey === 'semi_final') {
      trophyAwarded = 'bronze';
      addTrophy('bronze');
    }

    const eliminatedState: TournamentCupState = {
      ...state,
      matches: updatedMatches,
      playerStatus: 'eliminated',
      eliminatedAtRound: currentRoundKey,
      completedAt: new Date().toISOString(),
    };
    saveTournamentState(eliminatedState);
    return { nextState: eliminatedState, trophyAwarded };
  }

  // If player won the GRAND FINAL -> CHAMPION!
  if (currentRoundKey === 'final') {
    addTrophy('gold');
    const championState: TournamentCupState = {
      ...state,
      matches: updatedMatches,
      playerStatus: 'champion',
      completedAt: new Date().toISOString(),
    };
    saveTournamentState(championState);
    return { nextState: championState, trophyAwarded: 'gold' };
  }

  // Player advances to next round!
  let nextRoundKey: TournamentRoundKey = 'quarter_final';
  if (currentRoundKey === 'round_of_16') nextRoundKey = 'quarter_final';
  else if (currentRoundKey === 'quarter_final') nextRoundKey = 'semi_final';
  else if (currentRoundKey === 'semi_final') nextRoundKey = 'final';

  // Seed winners into the next round matches
  const roundWinners = simulatedMatches.map((m) => m.winner || m.player1);
  const nextRoundMatches = state.matches[nextRoundKey].map((m, idx) => {
    const w1 = roundWinners[idx * 2] || m.player1;
    const w2 = roundWinners[idx * 2 + 1] || m.player2;
    const isPlayerMatch = Boolean(w1.isPlayer || w2.isPlayer);
    return {
      ...m,
      player1: w1,
      player2: w2,
      isPlayerMatch,
      status: 'pending' as const,
    };
  });

  const advancedState: TournamentCupState = {
    ...state,
    currentRound: nextRoundKey,
    matches: {
      ...updatedMatches,
      [nextRoundKey]: nextRoundMatches,
    },
  };

  saveTournamentState(advancedState);
  return { nextState: advancedState };
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

/** Tournament Cup State Storage */
export function loadTournamentState(): TournamentCupState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TOURNAMENT);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function saveTournamentState(state: TournamentCupState): void {
  try {
    localStorage.setItem(STORAGE_KEY_TOURNAMENT, JSON.stringify(state));
  } catch {
    // ignore
  }
}
