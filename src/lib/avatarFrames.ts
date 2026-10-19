import type { AvatarFrameKey } from '../store/useGameStore';

export interface AvatarFrameDefinition {
  id: AvatarFrameKey;
  name: string;
  subtitle: string;
  ringClass: string;
  glowClass: string;
  badgeIcon: string;
  badgeLabel: string;
  unlockRequirement: string;
  checkUnlocked: (context: {
    trophies: { gold: number; silver: number; bronze: number };
    stars: number;
    completedLevelsCount: number;
  }) => boolean;
}

export const AVATAR_FRAMES: AvatarFrameDefinition[] = [
  {
    id: 'classic',
    name: 'Klasik Minimalis',
    subtitle: 'Presisi Apple Liquid Glass asli',
    ringClass: 'border-2 border-white/60 dark:border-white/40',
    glowClass: 'shadow-xs',
    badgeIcon: '✨',
    badgeLabel: 'Default',
    unlockRequirement: 'Tersedia untuk semua pemain',
    checkUnlocked: () => true,
  },
  {
    id: 'champion_gold',
    name: 'Emas Kejuaraan',
    subtitle: 'Aura Sang Juara Piala Nusantara',
    ringClass: 'border-2 border-amber-300 dark:border-amber-400',
    glowClass: 'shadow-[0_0_14px_rgba(251,191,36,0.5)] ring-1 ring-amber-400/80',
    badgeIcon: '🏆',
    badgeLabel: 'Piala Nusantara',
    unlockRequirement: 'Raih minimal 1 Trofi Emas Piala Nusantara',
    checkUnlocked: ({ trophies }) => (trophies?.gold || 0) > 0,
  },
  {
    id: 'sapphire',
    name: 'Safir Cakrawala',
    subtitle: 'Kilau safir biru kosmik yang elegan',
    ringClass: 'border-2 border-sky-400 dark:border-sky-300',
    glowClass: 'shadow-[0_0_14px_rgba(56,189,248,0.5)] ring-1 ring-sky-300/80',
    badgeIcon: '💎',
    badgeLabel: '300★ Bintang',
    unlockRequirement: 'Kumpulkan total 300 Bintang Pengetahuan',
    checkUnlocked: ({ stars }) => (stars || 0) >= 300,
  },
  {
    id: 'emerald',
    name: 'Zamrud Khatulistiwa',
    subtitle: 'Pancaran hijau zamrud Nusantara',
    ringClass: 'border-2 border-emerald-400 dark:border-emerald-300',
    glowClass: 'shadow-[0_0_14px_rgba(52,211,153,0.5)] ring-1 ring-emerald-300/80',
    badgeIcon: '🌿',
    badgeLabel: '10 Bab Level',
    unlockRequirement: 'Selesaikan minimal 10 Bab Level Kata',
    checkUnlocked: ({ completedLevelsCount }) => (completedLevelsCount || 0) >= 10,
  },
];

export function getAvatarFrame(id?: AvatarFrameKey): AvatarFrameDefinition {
  const found = AVATAR_FRAMES.find((f) => f.id === id);
  return found || AVATAR_FRAMES[0];
}
