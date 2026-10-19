export type ThemeKey =
  | 'obsidian'
  | 'espresso'
  | 'oxford'
  | 'milky'
  | 'sage'
  | 'nube'
  | 'bordo'
  | 'racing'
  | 'electric'
  | 'blossom';

export interface ThemeConfig {
  id: ThemeKey;
  name: string;
  description: string;
  previewBg: string;
  previewAccent: string;
  vars: Record<string, string>;
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  // 1. WARM OBSIDIAN (Dark Mode) — Apple Monochrome Luxury
  obsidian: {
    id: 'obsidian',
    name: 'Warm Obsidian',
    description: 'Apple Dark Luxury • Hitam Murni #111113 & Platinum',
    previewBg: '#111113',
    previewAccent: '#F5F5F4',
    vars: {
      '--bg-app': '#111113',
      '--bg-gradient':
        'radial-gradient(ellipse 85% 55% at 50% -6%, rgba(255, 255, 255, 0.065) 0%, rgba(255, 255, 255, 0.015) 50%, transparent 80%), linear-gradient(180deg, #161619 0%, #111113 55%, #0B0B0D 100%)',
      '--bg-card': 'rgba(24, 24, 28, 0.85)',
      '--border-card': 'rgba(255, 255, 255, 0.12)',
      '--text-primary': '#F5F5F4',
      '--text-secondary': '#A8A29E',
      '--accent-main': '#F5F5F4',
      '--accent-contrast': '#111113',
      '--accent-grad': 'linear-gradient(135deg, #FFFFFF 0%, #D6D3D1 100%)',
      '--hero-grad': 'linear-gradient(135deg, #2A2A33 0%, #16161B 100%)',
      '--hero-btn-text': '#111113',
      '--accent-light': 'rgba(245, 245, 244, 0.14)',
      '--badge-bg': 'rgba(245, 245, 244, 0.12)',
      '--badge-text': '#F5F5F4',
      '--keyboard-bg': '#141418',
      '--key-bg': '#1E1E24',
      '--key-text': '#F5F5F4',
      '--key-shadow': '0 2px 4px rgba(0, 0, 0, 0.6)',
      '--tile-bg': '#1E1E24',
      '--tile-text': '#F5F5F4',
      '--tile-border': 'rgba(255, 255, 255, 0.15)',
      '--tile-active-border': '#F5F5F4',
    },
  },

  // 2. NOCTURNE ESPRESSO (Warm Dark Mode) — Roasted Cocoa & Ink
  espresso: {
    id: 'espresso',
    name: 'Nocturne Espresso',
    description: 'Warm Dark • Roasted Cocoa #191716 & Vanilla Ink',
    previewBg: '#191716',
    previewAccent: '#EDE8E1',
    vars: {
      '--bg-app': '#191716',
      '--bg-gradient':
        'radial-gradient(ellipse 85% 55% at 50% -6%, rgba(255, 242, 226, 0.055) 0%, rgba(255, 242, 226, 0.012) 50%, transparent 80%), linear-gradient(180deg, #221E1B 0%, #191716 55%, #131211 100%)',
      '--bg-card': 'rgba(35, 32, 30, 0.85)',
      '--border-card': 'rgba(237, 232, 225, 0.13)',
      '--text-primary': '#EDE8E1',
      '--text-secondary': '#B5ACA2',
      '--accent-main': '#EDE8E1',
      '--accent-contrast': '#191716',
      '--accent-grad': 'linear-gradient(135deg, #F5ECE4 0%, #D6CEC2 100%)',
      '--hero-grad': 'linear-gradient(135deg, #362E2A 0%, #201C1A 100%)',
      '--hero-btn-text': '#191716',
      '--accent-light': 'rgba(237, 232, 225, 0.14)',
      '--badge-bg': 'rgba(237, 232, 225, 0.12)',
      '--badge-text': '#EDE8E1',
      '--keyboard-bg': '#161413',
      '--key-bg': '#262220',
      '--key-text': '#EDE8E1',
      '--key-shadow': '0 2px 4px rgba(0, 0, 0, 0.5)',
      '--tile-bg': '#262220',
      '--tile-text': '#EDE8E1',
      '--tile-border': 'rgba(237, 232, 225, 0.18)',
      '--tile-active-border': '#EDE8E1',
    },
  },

  // 3. OXFORD NAVY (Dark Mode) — Archival Midnight Ink & Platinum
  oxford: {
    id: 'oxford',
    name: 'Oxford Navy',
    description: 'Midnight Dark • Archival Navy #101520 & Platinum',
    previewBg: '#101520',
    previewAccent: '#F1F5F9',
    vars: {
      '--bg-app': '#101520',
      '--bg-gradient':
        'radial-gradient(ellipse 85% 55% at 50% -6%, rgba(210, 230, 255, 0.075) 0%, rgba(210, 230, 255, 0.015) 50%, transparent 80%), linear-gradient(180deg, #151B28 0%, #101520 55%, #0A0D14 100%)',
      '--bg-card': 'rgba(21, 27, 41, 0.85)',
      '--border-card': 'rgba(255, 255, 255, 0.12)',
      '--text-primary': '#F1F5F9',
      '--text-secondary': '#94A3B8',
      '--accent-main': '#F1F5F9',
      '--accent-contrast': '#0A0D14',
      '--accent-grad': 'linear-gradient(135deg, #FFFFFF 0%, #CBD5E1 100%)',
      '--hero-grad': 'linear-gradient(135deg, #1C273C 0%, #0F1624 100%)',
      '--hero-btn-text': '#0A0D14',
      '--accent-light': 'rgba(241, 245, 249, 0.14)',
      '--badge-bg': 'rgba(241, 245, 249, 0.12)',
      '--badge-text': '#F1F5F9',
      '--keyboard-bg': '#0D121B',
      '--key-bg': '#1A2234',
      '--key-text': '#F1F5F9',
      '--key-shadow': '0 2px 4px rgba(0, 0, 0, 0.6)',
      '--tile-bg': '#1A2234',
      '--tile-text': '#F1F5F9',
      '--tile-border': 'rgba(255, 255, 255, 0.16)',
      '--tile-active-border': '#F1F5F9',
    },
  },

  // 4. MILKY GLASS (Light Opalescent Mode) — #F8FAFC & Titanium Ink
  milky: {
    id: 'milky',
    name: 'Milky Glass',
    description: 'Opalescent Frost • Kaca Susu Halus #F8FAFC & Tinta Titanium',
    previewBg: '#F8FAFC',
    previewAccent: '#0F172A',
    vars: {
      '--bg-app': '#F8FAFC',
      '--bg-gradient':
        'radial-gradient(ellipse 90% 60% at 50% -8%, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.55) 60%, transparent 100%), linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 55%, #E2E8F0 100%)',
      '--bg-card': 'rgba(255, 255, 255, 0.92)',
      '--border-card': 'rgba(15, 23, 42, 0.08)',
      '--text-primary': '#0F172A',
      '--text-secondary': '#475569',
      '--accent-main': '#0F172A',
      '--accent-contrast': '#FFFFFF',
      '--accent-grad': 'linear-gradient(135deg, #334155 0%, #0F172A 100%)',
      '--hero-grad': 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
      '--hero-btn-text': '#0F172A',
      '--accent-light': 'rgba(15, 23, 42, 0.08)',
      '--badge-bg': 'rgba(15, 23, 42, 0.07)',
      '--badge-text': '#0F172A',
      '--keyboard-bg': '#E2E8F0',
      '--key-bg': '#FFFFFF',
      '--key-text': '#0F172A',
      '--key-shadow': '0 2px 4px rgba(15, 23, 42, 0.06)',
      '--tile-bg': '#FFFFFF',
      '--tile-text': '#0F172A',
      '--tile-border': 'rgba(15, 23, 42, 0.12)',
      '--tile-active-border': '#0F172A',
    },
  },

  // 5. KYOTO MATCHA (Light Mode) — Authentic Matcha Washi Paper #DBE6DB
  sage: {
    id: 'sage',
    name: 'Kyoto Matcha',
    description: 'Matcha Washi • Kertas Hijau Sage #DBE6DB & Tinta Lumut',
    previewBg: '#DBE6DB',
    previewAccent: '#122416',
    vars: {
      '--bg-app': '#DBE6DB',
      '--bg-gradient':
        'radial-gradient(ellipse 85% 55% at 50% -6%, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 50%, transparent 80%), linear-gradient(180deg, #EAF2EA 0%, #DBE6DB 55%, #C8DAC8 100%)',
      '--bg-card': 'rgba(229, 239, 229, 0.88)',
      '--border-card': 'rgba(18, 36, 22, 0.12)',
      '--text-primary': '#122416',
      '--text-secondary': '#3E5443',
      '--accent-main': '#122416',
      '--accent-contrast': '#FFFFFF',
      '--accent-grad': 'linear-gradient(135deg, #243E2A 0%, #122416 100%)',
      '--hero-grad': 'linear-gradient(135deg, #243E2A 0%, #122416 100%)',
      '--hero-btn-text': '#122416',
      '--accent-light': 'rgba(18, 36, 22, 0.1)',
      '--badge-bg': 'rgba(18, 36, 22, 0.08)',
      '--badge-text': '#122416',
      '--keyboard-bg': '#CDDDCD',
      '--key-bg': '#E8F2E8',
      '--key-text': '#122416',
      '--key-shadow': '0 2px 4px rgba(18, 36, 22, 0.08)',
      '--tile-bg': '#E8F2E8',
      '--tile-text': '#122416',
      '--tile-border': 'rgba(18, 36, 22, 0.16)',
      '--tile-active-border': '#122416',
    },
  },

  // 6. CRISP IVORY (Clean White / Light) — Clear Liquid Glass
  nube: {
    id: 'nube',
    name: 'Apple Light Mono',
    description: 'Crisp Ivory • Studio Putih Bersih #FCFCFA & Ink',
    previewBg: '#FCFCFA',
    previewAccent: '#18181B',
    vars: {
      '--bg-app': '#FCFCFA',
      '--bg-gradient':
        'radial-gradient(ellipse 85% 55% at 50% -6%, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.45) 50%, transparent 80%), linear-gradient(180deg, #FFFFFF 0%, #FAFAFC 55%, #F2F2F7 100%)',
      '--bg-card': 'rgba(255, 255, 255, 0.92)',
      '--border-card': 'rgba(15, 23, 42, 0.075)',
      '--text-primary': '#18181B',
      '--text-secondary': '#3F3F46',
      '--accent-main': '#18181B',
      '--accent-contrast': '#FFFFFF',
      '--accent-grad': 'linear-gradient(135deg, #27272A 0%, #09090B 100%)',
      '--hero-grad': 'linear-gradient(135deg, #27272A 0%, #09090B 100%)',
      '--hero-btn-text': '#18181B',
      '--accent-light': 'rgba(24, 24, 27, 0.08)',
      '--badge-bg': 'rgba(24, 24, 27, 0.06)',
      '--badge-text': '#18181B',
      '--keyboard-bg': '#E4E4E7',
      '--key-bg': '#FFFFFF',
      '--key-text': '#000000',
      '--key-shadow': '0 2px 4px rgba(0, 0, 0, 0.08)',
      '--tile-bg': '#FFFFFF',
      '--tile-text': '#000000',
      '--tile-border': '#E4E4E7',
      '--tile-active-border': '#18181B',
    },
  },

  // 7. BORDO ROYALE (Light Mode Accent) — Deep Wine #6C151E
  bordo: {
    id: 'bordo',
    name: 'Bordo Royale',
    description: 'Studio Light • Aksen Anggur Bordo (#6C151E)',
    previewBg: '#F0F0F2',
    previewAccent: '#6C151E',
    vars: {
      '--bg-app': '#F0F0F2',
      '--bg-gradient': 'radial-gradient(ellipse at 50% 0%, #F7F7F9 0%, #F0F0F2 80%)',
      '--bg-card': 'rgba(255, 255, 255, 0.95)',
      '--border-card': 'rgba(15, 23, 42, 0.07)',
      '--text-primary': '#000000',
      '--text-secondary': '#52525B',
      '--accent-main': '#6C151E',
      '--accent-contrast': '#FFFFFF',
      '--accent-grad': 'linear-gradient(135deg, #871D28 0%, #6C151E 100%)',
      '--hero-grad': 'linear-gradient(135deg, #871D28 0%, #6C151E 100%)',
      '--hero-btn-text': '#6C151E',
      '--accent-light': 'rgba(108, 21, 30, 0.12)',
      '--badge-bg': 'rgba(108, 21, 30, 0.1)',
      '--badge-text': '#6C151E',
      '--keyboard-bg': '#E4E4E7',
      '--key-bg': '#FFFFFF',
      '--key-text': '#000000',
      '--key-shadow': '0 2px 4px rgba(0, 0, 0, 0.08)',
      '--tile-bg': '#FFFFFF',
      '--tile-text': '#000000',
      '--tile-border': '#E4E4E7',
      '--tile-active-border': '#6C151E',
    },
  },

  // 8. RACING GREEN (Light Mode Accent) — Pantone 20-0182 TPM #002B2A
  racing: {
    id: 'racing',
    name: 'Racing Green',
    description: 'Pantone 20-0182 • Aksen British Racing Green (#002B2A)',
    previewBg: '#F0F0F2',
    previewAccent: '#002B2A',
    vars: {
      '--bg-app': '#F0F0F2',
      '--bg-gradient': 'radial-gradient(ellipse at 50% 0%, #F7F7F9 0%, #F0F0F2 80%)',
      '--bg-card': 'rgba(255, 255, 255, 0.95)',
      '--border-card': 'rgba(15, 23, 42, 0.07)',
      '--text-primary': '#000000',
      '--text-secondary': '#52525B',
      '--accent-main': '#002B2A',
      '--accent-contrast': '#FFFFFF',
      '--accent-grad': 'linear-gradient(135deg, #0A4240 0%, #002B2A 100%)',
      '--hero-grad': 'linear-gradient(135deg, #0A4240 0%, #002B2A 100%)',
      '--hero-btn-text': '#002B2A',
      '--accent-light': 'rgba(0, 43, 42, 0.12)',
      '--badge-bg': 'rgba(0, 43, 42, 0.1)',
      '--badge-text': '#002B2A',
      '--keyboard-bg': '#E4E4E7',
      '--key-bg': '#FFFFFF',
      '--key-text': '#000000',
      '--key-shadow': '0 2px 4px rgba(0, 0, 0, 0.08)',
      '--tile-bg': '#FFFFFF',
      '--tile-text': '#000000',
      '--tile-border': '#E4E4E7',
      '--tile-active-border': '#002B2A',
    },
  },

  // 9. ELECTRIC NAVY (Light Mode Accent) — Pantone 280C #001960
  electric: {
    id: 'electric',
    name: 'Electric Navy',
    description: 'Pantone 280C • Aksen Biru Elektrik Royal (#001960)',
    previewBg: '#F0F0F2',
    previewAccent: '#001960',
    vars: {
      '--bg-app': '#F0F0F2',
      '--bg-gradient': 'radial-gradient(ellipse at 50% 0%, #F7F7F9 0%, #F0F0F2 80%)',
      '--bg-card': 'rgba(255, 255, 255, 0.95)',
      '--border-card': 'rgba(15, 23, 42, 0.07)',
      '--text-primary': '#000000',
      '--text-secondary': '#52525B',
      '--accent-main': '#001960',
      '--accent-contrast': '#FFFFFF',
      '--accent-grad': 'linear-gradient(135deg, #0A2F8C 0%, #001960 100%)',
      '--hero-grad': 'linear-gradient(135deg, #0A2F8C 0%, #001960 100%)',
      '--hero-btn-text': '#001960',
      '--accent-light': 'rgba(0, 25, 96, 0.12)',
      '--badge-bg': 'rgba(0, 25, 96, 0.1)',
      '--badge-text': '#001960',
      '--keyboard-bg': '#E4E4E7',
      '--key-bg': '#FFFFFF',
      '--key-text': '#000000',
      '--key-shadow': '0 2px 4px rgba(0, 0, 0, 0.08)',
      '--tile-bg': '#FFFFFF',
      '--tile-text': '#000000',
      '--tile-border': '#E4E4E7',
      '--tile-active-border': '#001960',
    },
  },

  // 10. BERRY BLOSSOM (Light Mode Accent) — #E11D48
  blossom: {
    id: 'blossom',
    name: 'Berry Blossom',
    description: 'Apple Light • Aksen Mawar Berry (#E11D48)',
    previewBg: '#F0F0F2',
    previewAccent: '#E11D48',
    vars: {
      '--bg-app': '#F0F0F2',
      '--bg-gradient': 'radial-gradient(ellipse at 50% 0%, #F7F7F9 0%, #F0F0F2 80%)',
      '--bg-card': 'rgba(255, 255, 255, 0.95)',
      '--border-card': 'rgba(15, 23, 42, 0.07)',
      '--text-primary': '#000000',
      '--text-secondary': '#52525B',
      '--accent-main': '#E11D48',
      '--accent-contrast': '#FFFFFF',
      '--accent-grad': 'linear-gradient(135deg, #FB7185 0%, #E11D48 100%)',
      '--hero-grad': 'linear-gradient(135deg, #FB7185 0%, #E11D48 100%)',
      '--hero-btn-text': '#E11D48',
      '--accent-light': 'rgba(225, 29, 72, 0.12)',
      '--badge-bg': 'rgba(225, 29, 72, 0.1)',
      '--badge-text': '#E11D48',
      '--keyboard-bg': '#E4E4E7',
      '--key-bg': '#FFFFFF',
      '--key-text': '#000000',
      '--key-shadow': '0 2px 4px rgba(0, 0, 0, 0.08)',
      '--tile-bg': '#FFFFFF',
      '--tile-text': '#000000',
      '--tile-border': '#E4E4E7',
      '--tile-active-border': '#E11D48',
    },
  },
};

export const DARK_THEME_IDS: ThemeKey[] = ['obsidian', 'espresso', 'oxford'];

export function applyTheme(themeKey: ThemeKey) {
  const theme = THEMES[themeKey] || THEMES.obsidian;
  const root = document.documentElement;
  root.setAttribute('data-theme', theme.id);
  root.classList.toggle('dark', DARK_THEME_IDS.includes(theme.id));
  root.classList.toggle('light', !DARK_THEME_IDS.includes(theme.id));

  for (const [prop, val] of Object.entries(theme.vars)) {
    root.style.setProperty(prop, val);
  }
}
