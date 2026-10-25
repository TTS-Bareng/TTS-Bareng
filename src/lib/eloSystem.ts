export type EloTierKey =
  | 'novice'
  | 'explorer'
  | 'wordsmith'
  | 'expert'
  | 'master'
  | 'grandmaster';

export interface EloTier {
  key: EloTierKey;
  name: string;
  title: string;
  minElo: number;
  maxElo: number;
  icon: string;
  badgeBg: string;
  badgeColor: string;
  glowClass?: string;
  description: string;
}

export const ELO_TIERS: Record<EloTierKey, EloTier> = {
  novice: {
    key: 'novice',
    name: 'Pelajar Kata',
    title: 'Pelajar Kata',
    minElo: 0,
    maxElo: 999,
    icon: '🔰',
    badgeBg: 'rgba(128, 128, 128, 0.15)',
    badgeColor: '#9ca3af',
    description: 'Pemain pemula yang sedang meniti pemahaman kata',
  },
  explorer: {
    key: 'explorer',
    name: 'Penjelajah Kosakata',
    title: 'Penjelajah Kosakata',
    minElo: 1000,
    maxElo: 1199,
    icon: '🧭',
    badgeBg: 'rgba(180, 83, 9, 0.15)',
    badgeColor: '#d97706',
    description: 'Pemain aktif yang rutin menaklukkan teka-teki harian',
  },
  wordsmith: {
    key: 'wordsmith',
    name: 'Pujangga Kata',
    title: 'Pujangga Kata',
    minElo: 1200,
    maxElo: 1399,
    icon: '✒️',
    badgeBg: 'rgba(148, 163, 184, 0.2)',
    badgeColor: '#cbd5e1',
    description: 'Mampu memecahkan teka-teki silang dengan kecepatan tinggi',
  },
  expert: {
    key: 'expert',
    name: 'Pakar Bahasa',
    title: 'Pakar Bahasa',
    minElo: 1400,
    maxElo: 1599,
    icon: '🏅',
    badgeBg: 'rgba(234, 179, 8, 0.2)',
    badgeColor: '#eab308',
    description: 'Pemain tangguh dengan akurasi dan wawasan kosakata luas',
  },
  master: {
    key: 'master',
    name: 'Cendekiawan Utama',
    title: 'Cendekiawan Utama',
    minElo: 1600,
    maxElo: 1799,
    icon: '💎',
    badgeBg: 'rgba(59, 130, 246, 0.2)',
    badgeColor: '#38bdf8',
    glowClass: 'shadow-[0_0_15px_rgba(56,189,248,0.35)]',
    description: 'Kandidat elit dengan penguasaan medan pertempuran 1v1',
  },
  grandmaster: {
    key: 'grandmaster',
    name: 'Grandmaster Silang (GM)',
    title: 'Grandmaster Silang (GM)',
    minElo: 1800,
    maxElo: 9999,
    icon: '👑',
    badgeBg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.35), rgba(234, 179, 8, 0.2))',
    badgeColor: '#fbbf24',
    glowClass: 'shadow-[0_0_22px_rgba(251,191,36,0.5)] ring-2 ring-amber-400/50',
    description: 'Gelar kehormatan tertinggi di jagat teka-teki silang nasional',
  },
};

/**
 * Returns the EloTier matching a player's rating
 */
export function getEloTier(elo: number): EloTier {
  if (elo >= 1800) return ELO_TIERS.grandmaster;
  if (elo >= 1600) return ELO_TIERS.master;
  if (elo >= 1400) return ELO_TIERS.expert;
  if (elo >= 1200) return ELO_TIERS.wordsmith;
  if (elo >= 1000) return ELO_TIERS.explorer;
  return ELO_TIERS.novice;
}

/**
 * Calculates progress towards the next ELO tier
 */
export function getEloTierProgress(elo: number): {
  currentTier: EloTier;
  nextTier: EloTier | null;
  progressPercent: number;
  pointsToNext: number;
} {
  const currentTier = getEloTier(elo);
  if (currentTier.key === 'grandmaster') {
    return {
      currentTier,
      nextTier: null,
      progressPercent: 100,
      pointsToNext: 0,
    };
  }

  const tiers: EloTierKey[] = ['novice', 'explorer', 'wordsmith', 'expert', 'master', 'grandmaster'];
  const currentIdx = tiers.indexOf(currentTier.key);
  const nextTier = ELO_TIERS[tiers[currentIdx + 1]];

  const range = nextTier.minElo - currentTier.minElo;
  const currentProgress = elo - currentTier.minElo;
  const progressPercent = Math.min(100, Math.max(0, Math.round((currentProgress / range) * 100)));
  const pointsToNext = Math.max(0, nextTier.minElo - elo);

  return {
    currentTier,
    nextTier,
    progressPercent,
    pointsToNext,
  };
}

/**
 * Standard FIDE Chess ELO delta calculation
 * @param playerElo Current ELO of the player
 * @param opponentElo Current ELO of the opponent
 * @param won True if player won, false if lost, null for draw
 * @param kFactor K-factor constant (default 32)
 */
export function calculateEloDelta(
  playerElo: number,
  opponentElo: number,
  won: boolean | 'draw',
  kFactor: number = 32
): number {
  const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
  const actualScore = won === 'draw' ? 0.5 : won ? 1 : 0;
  const delta = Math.round(kFactor * (actualScore - expectedScore));

  // Ensure minimum delta of +/- 1 on actual win/loss
  if (won === true && delta <= 0) return 1;
  if (won === false && delta >= 0) return -1;
  return delta;
}

export interface NationalEloLeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  elo: number;
  tier: EloTierKey;
  isVip?: boolean;
  battlesWon: number;
  winRate: number;
}

/**
 * Pre-populated National Top GM / Master Leaderboard (Empty - real players fetched from Supabase)
 */
export const NATIONAL_ELO_SEED_LEADERBOARD: NationalEloLeaderboardEntry[] = [];
