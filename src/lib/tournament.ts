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
  nextMatchId?: string;
  nextSlot?: 1 | 2;
  startedAt?: string;
  deadlineAt?: string;
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
const STORAGE_KEY_PUBLIC_TOURNAMENTS = 'tts_public_tournaments_v3';
const STORAGE_KEY_TROPHIES = 'tts_tournament_trophies_v1';

/** Sanitizer to permanently filter out any legacy dummy, stale, or full-bot tournaments */
export function isDummyTournament(t: CommunityTournament): boolean {
  if (!t) return true;
  const host = (t.hostName || '').trim();
  const id = (t.id || '').trim();
  if (['Budi Santoso', 'Eko Lawang'].includes(host)) return true;
  if (id.startsWith('tourney_pub_') || id.startsWith('tourney-dummy-')) return true;

  // Non-lobby tournaments should not appear in public lobby listings
  if (t.status && t.status !== 'lobby') return true;

  // Tournaments older than 2 hours in lobby are stale/abandoned
  if (t.createdAt && t.createdAt !== 'Baru saja') {
    const createdMs = Date.parse(t.createdAt);
    if (!isNaN(createdMs) && Date.now() - createdMs > 2 * 3600 * 1000) {
      return true;
    }
  }

  // Full lobbies (players.length >= maxPlayers) cannot accept new players
  if (Array.isArray(t.players) && t.maxPlayers && t.players.length >= t.maxPlayers) {
    return true;
  }

  // Lobbies with 100% bots (zero human players) are orphaned bot rooms
  if (Array.isArray(t.players) && t.players.length > 0) {
    const hasHuman = t.players.some((p) => p && !p.id.startsWith('bot_'));
    if (!hasHuman) return true;
  }

  return false;
}

export function sanitizePublicTournaments(list: CommunityTournament[]): CommunityTournament[] {
  if (!Array.isArray(list)) return [];
  return list.filter((t) => !isDummyTournament(t));
}

/** Generate random 4-digit tournament code: CUP-XXXX */
export function generateTournamentCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `CUP-${digits}`;
}

/** Initial public tournaments when fresh (Zero Dummy Data Rule) */
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
    createdAt: new Date().toISOString(),
  };

  saveActiveCommunityTournament(newTourney);
  return newTourney;
}

function getRoundTitle(roundIdx: number, totalRounds: number, matchIdxInRound: number): string {
  const distFromFinal = totalRounds - 1 - roundIdx;
  if (distFromFinal === 0) return 'Grand Final';
  if (distFromFinal === 1) return `Semifinal ${matchIdxInRound + 1}`;
  if (distFromFinal === 2) return `Perempat Final ${matchIdxInRound + 1}`;
  if (distFromFinal === 3) return `Babak 16 Besar ${matchIdxInRound + 1}`;
  return `Babak ${roundIdx + 1} #${matchIdxInRound + 1}`;
}

function getMatchIdentifier(roundIdx: number, totalRounds: number, matchIdxInRound: number): string {
  const distFromFinal = totalRounds - 1 - roundIdx;
  if (distFromFinal === 0) return 'match_final';
  if (distFromFinal === 1) return `match_sf${matchIdxInRound + 1}`;
  if (distFromFinal === 2) return `match_qf${matchIdxInRound + 1}`;
  if (distFromFinal === 3) return `match_r1_${matchIdxInRound + 1}`;
  return `match_r${roundIdx}_${matchIdxInRound + 1}`;
}

/** Generate a realistic knockout bracket from real joined players (2 to 16 players) */
export function generateKnockoutBracket(
  players: CommunityTournamentPlayer[],
  _format: TournamentFormat,
  durationSeconds: number,
  currentUserId: string
): CommunityTournamentMatch[] {
  const count = players.length;
  if (count < 2) return [];

  // Determine smallest power-of-two bracket size (min 2, max 16)
  let bracketSize = 2;
  while (bracketSize < count && bracketSize < 16) {
    bracketSize *= 2;
  }

  const totalRounds = Math.max(1, Math.round(Math.log2(bracketSize)));
  const matches: CommunityTournamentMatch[] = [];

  // 1. Pre-build all match slots across all rounds (Round 0 up to Grand Final)
  for (let r = 0; r < totalRounds; r++) {
    const matchesInRound = bracketSize / Math.pow(2, r + 1);
    for (let m = 0; m < matchesInRound; m++) {
      const matchId = getMatchIdentifier(r, totalRounds, m);
      const isFinal = r === totalRounds - 1;
      const nextMatchId = !isFinal
        ? getMatchIdentifier(r + 1, totalRounds, Math.floor(m / 2))
        : undefined;
      const nextSlot = !isFinal ? ((m % 2 === 0 ? 1 : 2) as 1 | 2) : undefined;

      matches.push({
        id: matchId,
        roundIndex: r,
        roundName: getRoundTitle(r, totalRounds, m),
        player1: null,
        player2: null,
        winner: null,
        player1Score: 0,
        player2Score: 0,
        durationSeconds: isFinal ? Math.round(durationSeconds * 1.2) : durationSeconds,
        status: 'pending',
        isPlayerMatch: false,
        nextMatchId,
        nextSlot,
      });
    }
  }

  // 2. Seed players and BYEs into Round 0 matches
  const round0MatchesCount = bracketSize / 2;
  const byeCount = bracketSize - count; // Guaranteed < round0MatchesCount because bracketSize/2 < count <= bracketSize

  for (let m = 0; m < round0MatchesCount; m++) {
    const matchIdx = matches.findIndex(
      (match) => match.roundIndex === 0 && match.id === getMatchIdentifier(0, totalRounds, m)
    );
    if (matchIdx === -1) continue;

    const p1 = players[m] || null;
    // Matches with index >= (round0MatchesCount - byeCount) receive a BYE (player2 = null)
    const p2 = m < round0MatchesCount - byeCount ? (players[round0MatchesCount + m] || null) : null;

    const isBye = Boolean(p1 && !p2);
    const isPlayerMatch = Boolean(p1?.id === currentUserId || p2?.id === currentUserId);
    const isActive = !isBye;
    const now = Date.now();
    const duration = matches[matchIdx]?.durationSeconds || durationSeconds;
    const deadline = new Date(now + Math.max(90, duration + 45) * 1000).toISOString();

    matches[matchIdx] = {
      ...matches[matchIdx],
      player1: p1,
      player2: p2,
      isPlayerMatch,
      status: isBye ? 'completed' : 'active',
      winner: isBye ? p1 : null,
      player1Score: isBye ? 1 : 0,
      player2Score: 0,
      startedAt: isActive ? new Date(now).toISOString() : undefined,
      deadlineAt: isActive ? deadline : undefined,
    };
  }

  // 3. Auto-advance any BYEs from Round 0 into subsequent rounds
  const round0Completed = matches.filter((m) => m.roundIndex === 0 && m.status === 'completed' && m.winner);
  for (const completedMatch of round0Completed) {
    propagateWinnerToNextRound(matches, completedMatch, completedMatch.winner, currentUserId);
  }

  // 4. In any round, if both player1 and player2 are present and match is pending, activate it
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    if (match.status === 'pending' && match.player1 && match.player2) {
      const now = Date.now();
      const duration = match.durationSeconds || durationSeconds;
      const deadline = new Date(now + Math.max(90, duration + 45) * 1000).toISOString();
      matches[i] = {
        ...match,
        status: 'active',
        isPlayerMatch: Boolean(
          match.player1.id === currentUserId || match.player2.id === currentUserId
        ),
        startedAt: match.startedAt || new Date(now).toISOString(),
        deadlineAt: match.deadlineAt || deadline,
      };
    }
  }

  return matches.map((m, idx) => ({
    ...m,
    levelIndex: m.levelIndex ?? (idx * 3 + 1) % 20,
  }));
}

/** Helper to activate next match slot with wall-clock timestamps */
function activateMatchSlot(
  match: CommunityTournamentMatch,
  p1: CommunityTournamentPlayer | null,
  p2: CommunityTournamentPlayer | null,
  currentUserId: string
): CommunityTournamentMatch {
  const isActive = Boolean(p1 && p2);
  const now = Date.now();
  const duration = match.durationSeconds || 60;
  const deadline = new Date(now + Math.max(90, duration + 45) * 1000).toISOString();
  return {
    ...match,
    player1: p1,
    player2: p2,
    isPlayerMatch: Boolean(p1?.id === currentUserId || p2?.id === currentUserId),
    status: isActive ? 'active' : 'pending',
    startedAt: isActive ? (match.startedAt || new Date(now).toISOString()) : match.startedAt,
    deadlineAt: isActive ? (match.deadlineAt || deadline) : match.deadlineAt,
  };
}

/** Propagate winner of a match into the corresponding slot in next round */
export function propagateWinnerToNextRound(
  matches: CommunityTournamentMatch[],
  target: CommunityTournamentMatch,
  winner: CommunityTournamentPlayer | null,
  currentUserId: string
): void {
  if (!winner) return;

  // Primary path: using explicit nextMatchId and nextSlot
  if (target.nextMatchId) {
    const nextIdx = matches.findIndex((m) => m.id === target.nextMatchId);
    if (nextIdx !== -1) {
      const nextMatch = matches[nextIdx];
      const isSlot1 = target.nextSlot === 1;
      const nextP1 = isSlot1 ? winner : nextMatch.player1;
      const nextP2 = !isSlot1 ? winner : nextMatch.player2;
      matches[nextIdx] = activateMatchSlot(nextMatch, nextP1, nextP2, currentUserId);
    }
    return;
  }

  // Fallback for legacy match IDs
  if (target.id.startsWith('match_r1_')) {
    const r1Num = parseInt(target.id.replace('match_r1_', ''), 10);
    const qfTargetNum = Math.ceil(r1Num / 2);
    const isSlot1 = r1Num % 2 === 1;
    const qfIdx = matches.findIndex((m) => m.id === `match_qf${qfTargetNum}`);
    if (qfIdx !== -1) {
      const qf = matches[qfIdx];
      const nextP1 = isSlot1 ? winner : qf.player1;
      const nextP2 = !isSlot1 ? winner : qf.player2;
      matches[qfIdx] = activateMatchSlot(qf, nextP1, nextP2, currentUserId);
    }
    return;
  }

  if (target.id.startsWith('match_qf')) {
    const qfNum = parseInt(target.id.replace('match_qf', ''), 10);
    const sfTargetNum = Math.ceil(qfNum / 2);
    const isSlot1 = qfNum % 2 === 1;
    const sfIdx = matches.findIndex((m) => m.id === `match_sf${sfTargetNum}`);
    if (sfIdx !== -1) {
      const sf = matches[sfIdx];
      const nextP1 = isSlot1 ? winner : sf.player1;
      const nextP2 = !isSlot1 ? winner : sf.player2;
      matches[sfIdx] = activateMatchSlot(sf, nextP1, nextP2, currentUserId);
    }
    return;
  }

  if (target.id === 'match_sf1' || target.id === 'match_sf2') {
    const finalIdx = matches.findIndex((m) => m.id === 'match_final');
    if (finalIdx !== -1) {
      const finalMatch = matches[finalIdx];
      const isSlot1 = target.id === 'match_sf1';
      const nextP1 = isSlot1 ? winner : finalMatch.player1;
      const nextP2 = !isSlot1 ? winner : finalMatch.player2;
      matches[finalIdx] = activateMatchSlot(finalMatch, nextP1, nextP2, currentUserId);
    }
    return;
  }
}

/**
 * Recursively simulate all active bot-vs-bot matches across rounds.
 * If the player is eliminated or forceCompleteAll is true, it simulates through
 * the Grand Final so the tournament reaches 'completed' status with champion & runner-up.
 */
export function simulateAllBotMatches(
  tournament: CommunityTournament,
  currentUserId: string,
  options?: { forceCompleteAll?: boolean }
): CommunityTournament {
  const matches = [...tournament.matches];
  let newStatus = tournament.status;
  let champion = tournament.champion;
  let runnerUp = tournament.runnerUp;
  let changed = false;

  // Determine if player has any ongoing match
  const playerHasFutureMatch = matches.some(
    (m) =>
      m.isPlayerMatch &&
      (m.status === 'active' || m.status === 'pending' || (m.status === 'completed' && m.winner?.id === currentUserId))
  );

  const shouldSimulateToFinality = Boolean(options?.forceCompleteAll || !playerHasFutureMatch);

  let loopSafety = 0;
  while (loopSafety < 20) {
    loopSafety++;
    let simulatedThisRound = false;

    for (let i = 0; i < matches.length; i++) {
      const m = matches[i];
      if (m.status !== 'active') continue;
      if (m.isPlayerMatch) continue; // Strict Zero Dummy Data Rule: NEVER fake human match outcomes!

      const isBotVsBot = Boolean(
        m.player1?.id.startsWith('bot_') && m.player2?.id.startsWith('bot_')
      );
      if (!isBotVsBot || !m.player1 || !m.player2) continue;

      // If player is still actively competing, only simulate matches at or behind current round
      if (!shouldSimulateToFinality) {
        const playerActiveMatch = matches.find((pm) => pm.isPlayerMatch && pm.status === 'active');
        const playerRound = playerActiveMatch?.roundIndex ?? 0;
        if (m.roundIndex > playerRound) continue;
      }

      const p1Wins = Math.random() > 0.48;
      const scoreWinner = Math.floor(65 + Math.random() * 30);
      const scoreLoser = Math.floor(25 + Math.random() * 35);
      const p1Score = p1Wins ? scoreWinner : scoreLoser;
      const p2Score = p1Wins ? scoreLoser : scoreWinner;
      const winner = p1Wins ? m.player1 : m.player2;
      const loser = p1Wins ? m.player2 : m.player1;

      matches[i] = {
        ...m,
        status: 'completed',
        winner,
        player1Score: p1Score,
        player2Score: p2Score,
      };

      const isFinal = m.roundName === 'Grand Final' || m.id === 'match_final';
      if (isFinal) {
        newStatus = 'completed';
        champion = winner || undefined;
        runnerUp = loser || undefined;
      } else {
        propagateWinnerToNextRound(matches, matches[i], winner, currentUserId);
      }

      simulatedThisRound = true;
      changed = true;
    }

    if (!simulatedThisRound) break;
  }

  if (!changed) return tournament;

  const updatedTournament: CommunityTournament = {
    ...tournament,
    status: newStatus,
    matches,
    champion,
    runnerUp,
    completedAt: newStatus === 'completed' ? new Date().toISOString() : tournament.completedAt,
  };

  saveActiveCommunityTournament(updatedTournament);
  return updatedTournament;
}

/** Backward compatibility alias for simulateConcurrentMatches */
export function simulateConcurrentMatches(
  tournament: CommunityTournament,
  _currentRoundIndex: number,
  currentUserId: string
): CommunityTournament {
  return simulateAllBotMatches(tournament, currentUserId);
}

/**
 * Wall-clock lifecycle validator:
 * Reconciles match deadlines, detects player abandonment (W.O.), and auto-resolves stale tournaments.
 */
export function verifyAndReconcileTournamentLifecycle(
  tournament: CommunityTournament,
  currentUserId: string
): { updatedTournament: CommunityTournament; wasForfeited: boolean; wasCompleted: boolean } {
  let tourney = { ...tournament, matches: [...tournament.matches] };
  let wasForfeited = false;
  let wasCompleted = false;

  if (tourney.status === 'completed') {
    return { updatedTournament: tourney, wasForfeited: false, wasCompleted: false };
  }

  const now = Date.now();
  const createdAtMs = Date.parse(tourney.createdAt);
  const isStale = !isNaN(createdAtMs) && now - createdAtMs > 2 * 3600 * 1000;

  for (let i = 0; i < tourney.matches.length; i++) {
    const m = tourney.matches[i];
    if (m.status !== 'active') continue;

    const deadlineMs = m.deadlineAt ? Date.parse(m.deadlineAt) : null;
    const isOverdue = deadlineMs ? now > deadlineMs : isStale;

    if (isOverdue) {
      if (m.isPlayerMatch) {
        // Player abandoned match or closed app past deadline -> Walkover (W.O.) Loss
        const opponent = m.player1?.id === currentUserId ? m.player2 : m.player1;
        const p1IsPlayer = m.player1?.id === currentUserId;
        tourney.matches[i] = {
          ...m,
          status: 'completed',
          winner: opponent,
          player1Score: p1IsPlayer ? 0 : 75,
          player2Score: p1IsPlayer ? 75 : 0,
        };
        propagateWinnerToNextRound(tourney.matches, tourney.matches[i], opponent, currentUserId);
        wasForfeited = true;
      } else {
        // Bot vs Bot overdue match
        const isBotVsBot = Boolean(m.player1?.id.startsWith('bot_') && m.player2?.id.startsWith('bot_'));
        if (isBotVsBot && m.player1 && m.player2) {
          const winner = Math.random() > 0.5 ? m.player1 : m.player2;
          tourney.matches[i] = {
            ...m,
            status: 'completed',
            winner,
            player1Score: 60,
            player2Score: 40,
          };
          propagateWinnerToNextRound(tourney.matches, tourney.matches[i], winner, currentUserId);
        }
      }
    }
  }

  // If player was forfeited, or has no active/pending matches left, simulate remaining bot matches to completion
  const hasActivePlayerMatch = tourney.matches.some(
    (m) => m.isPlayerMatch && (m.status === 'active' || m.status === 'pending')
  );

  if (!hasActivePlayerMatch || isStale) {
    tourney = simulateAllBotMatches(tourney, currentUserId, { forceCompleteAll: true });
    if (tourney.status === 'completed') {
      wasCompleted = true;
    }
  }

  saveActiveCommunityTournament(tourney);
  return { updatedTournament: tourney, wasForfeited, wasCompleted };
}

/** Advance match result and update bracket (Idempotent) */
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
  // Idempotency Guard: if match is already completed, do not re-process
  if (target.status === 'completed' && target.winner) {
    return { updatedTournament: tournament, starsAwarded: 0 };
  }

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
  const isFinal = target.roundName === 'Grand Final' || target.id === 'match_final';
  if (isFinal) {
    newStatus = 'completed';
    champion = winner || undefined;
    runnerUp = loser || undefined;

    if (winner?.id === currentUserId) {
      trophyAwarded = 'gold';
      starsAwarded = 200;
    } else if (loser?.id === currentUserId) {
      trophyAwarded = 'silver';
      starsAwarded = 100;
    }
  } else {
    // If user lost in Semifinal, they get Bronze
    if (target.roundName.startsWith('Semifinal') && loser?.id === currentUserId) {
      trophyAwarded = 'bronze';
      starsAwarded = 50;
    }

    // Universal winner advancement across all tournament formats
    propagateWinnerToNextRound(matches, target, winner, currentUserId);
  }

  let updatedTournament: CommunityTournament = {
    ...tournament,
    status: newStatus,
    matches,
    champion,
    runnerUp,
    completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
  };

  // If player lost and was eliminated, automatically simulate all remaining bot matches to Grand Final!
  if (loser?.id === currentUserId && newStatus !== 'completed') {
    updatedTournament = simulateAllBotMatches(updatedTournament, currentUserId, { forceCompleteAll: true });
  }

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
    if (raw) {
      const parsed = JSON.parse(raw);
      // Stale completed tournament sessions (> 30m) should be cleared
      if (parsed.status === 'completed') {
        const completedMs = parsed.completedAt ? Date.parse(parsed.completedAt) : 0;
        if (!completedMs || Date.now() - completedMs > 30 * 60 * 1000) {
          localStorage.removeItem(STORAGE_KEY_ACTIVE_TOURNAMENT);
          return null;
        }
      }
      return parsed;
    }
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
    // Purge legacy storage keys that held dummy tournaments
    localStorage.removeItem('tts_public_tournaments_v1');
    localStorage.removeItem('tts_public_tournaments_v2');

    const raw = localStorage.getItem(STORAGE_KEY_PUBLIC_TOURNAMENTS);
    if (raw) {
      const parsed = JSON.parse(raw);
      return sanitizePublicTournaments(parsed);
    }
  } catch {
    // ignore
  }
  return DEFAULT_PUBLIC_TOURNAMENTS;
}

export function savePublicTournaments(list: CommunityTournament[]): void {
  try {
    const cleanList = sanitizePublicTournaments(list);
    localStorage.setItem(STORAGE_KEY_PUBLIC_TOURNAMENTS, JSON.stringify(cleanList));
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
