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
 * Pre-populated National Top GM / Master Leaderboard
 */
export const NATIONAL_ELO_SEED_LEADERBOARD: NationalEloLeaderboardEntry[] = [
  {
    rank: 1,
    id: 'gm_kevin',
    name: 'Kevin Sanjaya (GM)',
    avatar: '/maskot/Fierce Plush Crossword Champion.webp',
    elo: 2140,
    tier: 'grandmaster',
    isVip: true,
    battlesWon: 184,
    winRate: 88,
  },
  {
    rank: 2,
    id: 'gm_maya',
    name: 'Maya Kusuma (GM)',
    avatar: '/maskot/3D Plush Crossword Thinker.webp',
    elo: 1985,
    tier: 'grandmaster',
    isVip: true,
    battlesWon: 142,
    winRate: 81,
  },
  {
    rank: 3,
    id: 'gm_aris',
    name: 'Aris Pratama (GM)',
    avatar: '/maskot/Plush Crossword Duel 1v1.webp',
    elo: 1890,
    tier: 'grandmaster',
    isVip: false,
    battlesWon: 126,
    winRate: 78,
  },
  {
    rank: 4,
    id: 'm_hendra',
    name: 'Hendra Saputra',
    avatar: '/maskot/A vibrant 3D mascot.webp',
    elo: 1765,
    tier: 'master',
    isVip: true,
    battlesWon: 110,
    winRate: 74,
  },
  {
    rank: 5,
    id: 'm_rina',
    name: 'Rina Melati',
    avatar: '/maskot/Crossword Girl Sticker.webp',
    elo: 1720,
    tier: 'master',
    isVip: false,
    battlesWon: 98,
    winRate: 71,
  },
  {
    rank: 6,
    id: 'm_siti',
    name: 'Siti Rahma',
    avatar: '/maskot/Crossword Girl.webp',
    elo: 1650,
    tier: 'master',
    isVip: true,
    battlesWon: 89,
    winRate: 68,
  },
  {
    rank: 7,
    id: 'exp_bagus',
    name: 'Bagus Wijaya',
    avatar: '/maskot/Cheerful Book Boy.webp',
    elo: 1540,
    tier: 'expert',
    isVip: false,
    battlesWon: 76,
    winRate: 64,
  },
  {
    rank: 8,
    id: 'exp_dewi',
    name: 'Dewi Kartika',
    avatar: '/maskot/Puzzle Explorer.webp',
    elo: 1480,
    tier: 'expert',
    isVip: false,
    battlesWon: 65,
    winRate: 62,
  },
  {
    rank: 9,
    id: 'exp_fajar',
    name: 'Fajar Hidayat',
    avatar: '/maskot/Puzzle Scholar.webp',
    elo: 1420,
    tier: 'expert',
    isVip: true,
    battlesWon: 58,
    winRate: 59,
  },
  {
    rank: 10,
    id: 'wrd_clarissa',
    name: 'Clarissa Tania',
    avatar: '/maskot/Puzzle Moment.webp',
    elo: 1350,
    tier: 'wordsmith',
    isVip: false,
    battlesWon: 48,
    winRate: 56,
  },
];
