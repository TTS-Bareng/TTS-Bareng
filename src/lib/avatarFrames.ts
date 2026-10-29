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
    badgeIcon: 'I',
    badgeLabel: 'Default',
    unlockRequirement: 'Tersedia untuk semua pemain',
    checkUnlocked: () => true,
  },
  {
    id: 'champion_gold',
    name: 'Emas Kejuaraan',
    subtitle: 'Aura Sang Juara Piala Nusantara',
    ringClass: 'border-2 border-[var(--accent-main)]',
    glowClass: 'shadow-[0_0_14px_rgba(251,191,36,0.5)]',
    badgeIcon: 'II',
    badgeLabel: 'Piala Nusantara',
    unlockRequirement: 'Raih minimal 1 Trofi Emas Piala Nusantara',
    checkUnlocked: ({ trophies }) => (trophies?.gold || 0) > 0,
  },
  {
    id: 'sapphire',
    name: 'Safir Cakrawala',
    subtitle: 'Kilau safir biru kosmik yang elegan',
    ringClass: 'border-2 border-[var(--accent-main)]/85',
    glowClass: 'shadow-[0_0_14px_rgba(56,189,248,0.5)]',
    badgeIcon: 'III',
    badgeLabel: '300 Bintang',
    unlockRequirement: 'Kumpulkan total 300 Bintang Pengetahuan',
    checkUnlocked: ({ stars }) => (stars || 0) >= 300,
  },
  {
    id: 'emerald',
    name: 'Zamrud Khatulistiwa',
    subtitle: 'Pancaran hijau zamrud Nusantara',
    ringClass: 'border-2 border-[var(--accent-main)]/75',
    glowClass: 'shadow-[0_0_14px_rgba(52,211,153,0.5)]',
    badgeIcon: 'IV',
    badgeLabel: '10 Bab Level',
    unlockRequirement: 'Selesaikan minimal 10 Bab Level Kata',
    checkUnlocked: ({ completedLevelsCount }) => (completedLevelsCount || 0) >= 10,
  },
];

export function getAvatarFrame(id?: AvatarFrameKey): AvatarFrameDefinition {
  const found = AVATAR_FRAMES.find((f) => f.id === id);
  return found || AVATAR_FRAMES[0];
}
