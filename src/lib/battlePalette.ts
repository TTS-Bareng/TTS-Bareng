import type { ThemeKey } from './themes';

export interface BattlePlayerColor {
  name: string;
  main: string;
  grad: string;
  text: string;
  glow: string;
  border: string;
}

export interface BattlePalette {
  p1: BattlePlayerColor;
  p2: BattlePlayerColor;
}

/**
 * Returns dynamic, visually contrasting Apple Liquid Glass color pairs
 * for 1v1 Tug-of-War battle based on the user's active theme.
 * Guaranteed: Player 1 (Local) and Player 2 (Opponent) will NEVER clash,
 * even when the user selects crimson red, berry blossom, or emerald sage!
 */
export function getBattlePalette(themeKey: ThemeKey): BattlePalette {
  switch (themeKey) {
    // 1. Red / Magenta / Berry themes -> Opponent gets Electric Cyan / Azure Blue
    case 'bordo':
    case 'blossom':
      return {
        p1: {
          name: 'Merah Tema',
          main: '#e11d48',
          grad: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
          text: '#ffffff',
          glow: 'rgba(244, 63, 94, 0.4)',
          border: 'rgba(251, 113, 133, 0.6)',
        },
        p2: {
          name: 'Biru Azure',
          main: '#0284c7',
          grad: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
          text: '#ffffff',
          glow: 'rgba(56, 189, 248, 0.4)',
          border: 'rgba(125, 211, 252, 0.6)',
        },
      };

    // 2. Blue / Sky / Navy themes -> Opponent gets Radiant Coral Rose
    case 'electric':
    case 'nube':
    case 'oxford':
      return {
        p1: {
          name: 'Biru Tema',
          main: '#2563eb',
          grad: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          text: '#ffffff',
          glow: 'rgba(59, 130, 246, 0.4)',
          border: 'rgba(96, 165, 250, 0.6)',
        },
        p2: {
          name: 'Mawar Coral',
          main: '#e11d48',
          grad: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
          text: '#ffffff',
          glow: 'rgba(244, 63, 94, 0.4)',
          border: 'rgba(251, 113, 133, 0.6)',
        },
      };

    // 3. Green / Sage / Matcha themes -> Opponent gets Ultra Royal Violet
    case 'sage':
    case 'racing':
      return {
        p1: {
          name: 'Hijau Tema',
          main: '#059669',
          grad: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
          text: '#ffffff',
          glow: 'rgba(16, 185, 129, 0.4)',
          border: 'rgba(52, 211, 153, 0.6)',
        },
        p2: {
          name: 'Ultra Violet',
          main: '#7c3aed',
          grad: 'linear-gradient(135deg, #a78bfa 0%, #6d28d9 100%)',
          text: '#ffffff',
          glow: 'rgba(167, 139, 250, 0.4)',
          border: 'rgba(196, 181, 253, 0.6)',
        },
      };

    // 4. Monochrome / Luxury Dark / Milky -> Cobalt Blue vs Crimson Rose
    default:
      return {
        p1: {
          name: 'Cobalt Blue',
          main: '#3b82f6',
          grad: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
          text: '#ffffff',
          glow: 'rgba(59, 130, 246, 0.4)',
          border: 'rgba(96, 165, 250, 0.6)',
        },
        p2: {
          name: 'Crimson Rose',
          main: '#e11d48',
          grad: 'linear-gradient(135deg, #fb7185 0%, #be123c 100%)',
          text: '#ffffff',
          glow: 'rgba(244, 63, 94, 0.4)',
          border: 'rgba(251, 113, 133, 0.6)',
        },
      };
  }
}
