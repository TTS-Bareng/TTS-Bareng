# Behavioral Guidelines & Project Rules (Prinsip Karpathy)

Behavioral guidelines to reduce common LLM coding mistakes and enforce strict UI/UX excellence.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

---

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

---

## 5. UI/UX & Color System Rules (MANDATORY)

### Home Screen as the Design System Blueprint (Based Model)
Halaman Beranda (`HomeView.tsx`) adalah standar baku untuk merestyling dan mereform halaman lainnya (`GameView`, `StatsView`, `SettingsView`, modal-modal):
- **Material Apple Liquid Glass**: `liquid-glass-card`, `rounded-[20px]`–`rounded-[24px]`, multi-layer specular sheen (`inset 0 1px 0 rgba(255,255,255,0.18)`), high blur (`backdrop-filter: blur(28px) saturate(180%)`).
- **Ritme Spasi & Padding Navbar**: `gap-3` (12px), container `pt-[20px] pb-[90px]` menjamin kartu terbawah melayang lega ~16px di atas floating navbar (`h-[62px]` pada `bottom-3`). Tidak boleh menempel tipis ke navbar.
- **Zero Dummy Data**: Seluruh angka, progres target, chart bar, dan petunjuk wajib 100% terikat ke state riil (`useGameStore`, `levelRecords`, `solvedClues`, data level, atau `localStorage`).
- **Strict Content Distinction**: Setiap kartu dan ticker harus memiliki konten yang berbeda (contoh: Kata Hari Ini fokus pada kosakata puitis KBBI; Trivia Pill fokus pada sejarah TTS & linguistik).

### Strict 3-Color Maximum Palette Rule
- **Never use more than 3 colors in any view:**
  1. **Base Canvas / Background**: Dark OLED (`#0a0a0d`), Studio Light (`#f0f0f2`), or Theme canvas.
  2. **Monochrome Ink / Surfaces**: Pure White (`#ffffff`), Pure Black (`#000000`), and neutral zinc/slate shades for text, borders, glass cards, and hairlines.
  3. **Theme Accent (Single Color)**: Exactly ONE accent color derived from the active theme variables (`var(--accent-main)`, `var(--accent-grad)`, `var(--accent-light)`).
- **Zero Foreign Leaked Colors:**
  - **NO HARDCODED AMBER, YELLOW, OR ORANGE** unless the active theme is specifically Sunset Coral or Amber!
  - In Berry Blossom: stars, flames, badges, sparkles, and buttons MUST use berry/rose (`var(--accent-main)`) or neutral monochrome.
  - In Neo Blue: stars, flames, badges, sparkles, and buttons MUST use electric blue (`var(--accent-main)`) or neutral monochrome.
  - In Apple Dark Monochrome: everything is 100% monochrome (white, gray, black). Zero colored noise.
  - In Apple Light Monochrome: everything is 100% monochrome (black, zinc, white).

### No Over Shadow & No Glowing Shadow Rule
- **Zero glowing neon shadows:** Do not use colorful glowing box-shadows or high-opacity colored halos (e.g. `rgba(59, 76, 246, 0.4)` or huge fuzzy glows).
- **No diffuse ambient glow orbs:** Do not place fuzzy `blur-3xl` colored ambient circles that create messy light pollution on the background.
- **Strictly tactile shadows:** Use only subtle, realistic ambient occlusion (`0 2px 8px rgba(0,0,0,0.04)` for light mode, `0 8px 24px rgba(0,0,0,0.45)` for dark mode) with 1px specular insets.

### Theme Canvas Standard (Apple Light Base for Colored Themes)
- All colored themes (`neoblue`, `sunset`, `forest`, `blossom`) and `nube` MUST use the **Apple Light neutral white base canvas**:
  - Background: `#F0F0F2` (pure Apple studio light)
  - Card background: `#FFFFFF`
  - Text primary: `#000000` (crisp black, never tinted)
  - Text secondary: `#52525B` (neutral dark gray, never tinted)
  - Borders: `rgba(15, 23, 42, 0.06)`
  - Keyboard: `#E4E4E7`, keys `#FFFFFF`, text `#000000`
  - **Only the accent** (`--accent-main`, `--accent-light`, `--accent-grad`) uses the theme's specific hue.
- Only `obsidian` uses Apple Dark Monochrome (`#0A0A0D` canvas, `#FFFFFF` accent).
