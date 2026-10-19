import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Compass,
  Users,
  Play,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  BookOpen,
  Flame,
  Trophy,
  Dices,
  ChevronDown,
  Trees,
  Mountain,
  UtensilsCrossed,
  RotateCcw,
  MapPin,
  Home,
  Building2,
  Briefcase,
  Car,
  Smartphone,
  Palette,
  Music,
  ShoppingBag,
  Heart,
  Atom,
  ShieldCheck,
  Zap,
  Smile,
  Coins,
  Scale,
  Landmark,
  Hourglass,
  Brain,
  Telescope,
  Globe,
  History,
  Leaf,
  Radio,
  Lightbulb,
  Orbit,
  FlaskConical,
  Castle,
  Dna,
  Binary,
  Tv,
  Popcorn,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';
import { SocialView } from './SocialView';
import { type LevelData } from '../lib/crossword';
import { REALMS, getRealmForLevel, getLevelsByRealm, type RealmDefinition } from '../lib/realms';

/** Map of Realm IDs to themed Lucide icons */
const REALM_ICONS: Record<string, React.ElementType> = {
  theme_1_rumah: Home,
  theme_2_kuliner: UtensilsCrossed,
  theme_3_kota: MapPin,
  theme_4_bangunan: Building2,
  theme_5_sifat: Sparkles,
  theme_6_satwa: Trees,
  theme_7_profesi: Briefcase,
  theme_8_dolanan: Dices,
  theme_9_transportasi: Car,
  theme_10_alam: Mountain,
  theme_11_teknologi: Smartphone,
  theme_12_hobi: Palette,
  theme_13_musik: Music,
  theme_14_belanja: ShoppingBag,
  theme_15_kesehatan: Heart,
  theme_16_ipa: Atom,
  theme_17_ips: Users,
  theme_18_pkn: ShieldCheck,
  theme_19_katakerja: Zap,
  theme_20_katasifat: Smile,
  theme_21_ekonomi: Coins,
  theme_22_hukum: Scale,
  theme_23_politik: Landmark,
  theme_24_antropologi: Hourglass,
  theme_25_psikologi: Brain,
  theme_26_astronomi: Telescope,
  theme_27_geografi: Globe,
  theme_28_sejarah: History,
  theme_29_ekologi: Leaf,
  theme_30_media: Radio,
  theme_31_filosofi: Lightbulb,
  theme_32_fisika: Orbit,
  theme_33_kimia: FlaskConical,
  theme_34_sejarahdunia: Castle,
  theme_35_biologimolekuler: Dna,
  theme_36_matematika: Binary,
  theme_37_nostalgia: Tv,
  theme_38_popculture: Popcorn,
};

/** Crossword Grid Pattern Overlay (Oversized Graphic Watermark Texture) */
const CrosswordPatternOverlay: React.FC<{ level: LevelData }> = ({ level }) => {
  // Extract real clue words from current level
  const firstAcross = (level.clues?.across?.[0]?.answer || 'KATA').toUpperCase();
  const firstDown = (level.clues?.down?.[0]?.answer || 'TEKA').toUpperCase();

  // Find intersection index if available
  let acrossIntersectIdx = -1;
  let downIntersectIdx = -1;

  for (let a = 0; a < firstAcross.length; a++) {
    const d = firstDown.indexOf(firstAcross[a]);
    if (d !== -1) {
      acrossIntersectIdx = a;
      downIntersectIdx = d;
      break;
    }
  }

  if (acrossIntersectIdx === -1) {
    acrossIntersectIdx = Math.min(2, Math.max(0, firstAcross.length - 1));
    downIntersectIdx = Math.min(1, Math.max(0, firstDown.length - 1));
  }

  // Trim to fit pattern nicely
  const displayAcross = firstAcross.slice(0, 6);
  const displayDown = firstDown.slice(0, 5);

  const acrossRow = downIntersectIdx;
  const downCol = acrossIntersectIdx;

  const rows = [0, 1, 2, 3, 4];
  const cols = [0, 1, 2, 3, 4, 5];

  return (
    <div
      aria-hidden="true"
      className="absolute -right-2 sm:right-3 top-2 pointer-events-none select-none z-0 opacity-[0.22] dark:opacity-[0.28] group-hover:opacity-[0.34] transition-opacity duration-500"
    >
      <div className="grid grid-cols-6 gap-1.5 transform -rotate-1 sm:-rotate-2 origin-top-right">
        {rows.map((r) =>
          cols.map((c) => {
            const isAcross = r === acrossRow && c < displayAcross.length;
            const isDown = c === downCol && r < displayDown.length;
            const isIntersect = isAcross && isDown;

            let letter = '';
            let cellNum: number | null = null;

            if (isAcross) {
              letter = displayAcross[c];
              if (c === 0) cellNum = 1;
            } else if (isDown) {
              letter = displayDown[r];
              if (r === 0) cellNum = 2;
            }

            const isFilled = isAcross || isDown;

            // Companion blank cell for authentic crossword grid texture
            const isCompanionBlank =
              !isFilled &&
              ((r === acrossRow - 1 && c === 0) ||
                (r === acrossRow + 1 && c === displayAcross.length - 1) ||
                (r === 0 && c === downCol + 1));

            if (!isFilled && !isCompanionBlank) {
              return <div key={`${r}-${c}`} className="w-8 h-8 sm:w-9 sm:h-9" />;
            }

            return (
              <div
                key={`${r}-${c}`}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-[7px] sm:rounded-[8px] relative flex items-center justify-center font-black text-[13.5px] sm:text-[15px] select-none ${
                  isIntersect
                    ? 'bg-white/30 text-white border border-white/50 shadow-sm'
                    : isFilled
                    ? 'bg-white/15 text-white/90 border border-white/25'
                    : 'border border-dashed border-white/15 bg-white/[0.04]'
                }`}
              >
                {cellNum && (
                  <span className="absolute top-0.5 left-1 text-[6.5px] font-bold text-white/70 leading-none">
                    {cellNum}
                  </span>
                )}
                <span>{letter}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export const ArenaView: React.FC<{ initialMode?: 'solo' | 'mabar' }> = ({
  initialMode = 'solo',
}) => {
  const {
    levels,
    currentLevelIndex,
    selectLevel,
    playRandomLevel,
    setCurrentTab,
    levelRecords,
    stars,
    streak,
    openLexicon,
    solvedClues,
    currentTab,
    openTournament,
    trophies,
  } = useGameStore();

  const [selectedHubMode, setSelectedHubMode] = useState<'solo' | 'mabar' | null>(null);
  const hubMode = selectedHubMode ?? (currentTab === 'social' ? 'mabar' : initialMode);

  const currentLevel = levels[currentLevelIndex] || levels[0];
  const activeRealm = getRealmForLevel(currentLevel);

  // Accordion state: default expands the realm containing the current active level
  const [expandedRealmId, setExpandedRealmId] = useState<string | null>(activeRealm.id);

  const toggleRealm = (realmId: string) => {
    setExpandedRealmId((prev) => (prev === realmId ? null : realmId));
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalWordsInCurrent =
    (currentLevel.clues?.across?.length || 0) + (currentLevel.clues?.down?.length || 0) || 8;
  const solvedCountInCurrent = solvedClues.length;
  const currentProgressPercent = Math.min(
    100,
    Math.round((solvedCountInCurrent / totalWordsInCurrent) * 100)
  );

  const totalCompletedLevels = Object.values(levelRecords).filter((r) => r.completed).length;

  const handleStartActiveLevel = () => {
    selectLevel(currentLevelIndex);
    setCurrentTab('game');
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-3 px-3.5 pt-[max(18px,env(safe-area-inset-top))] pb-[max(90px,calc(75px+env(safe-area-inset-bottom)))] select-none overflow-y-auto relative">
      {/* 1. Header: Typographic Title + Live Streak & Stars Pill */}
      <header className="flex items-center justify-between px-0.5 relative z-10 shrink-0">
        <div>
          <span className="text-[9.5px] font-black uppercase tracking-wider text-[var(--accent-main)] block leading-none mb-0.5">
            PUSAT PERMAINAN
          </span>
          <h2 className="text-[18px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
            Arena & Petualangan
          </h2>
        </div>

        {/* Live Streak & Stars Pill */}
        <div className="h-8.5 px-3 rounded-full flex items-center gap-2.5 liquid-glass-card">
          <div className="flex items-center gap-1 text-[var(--accent-main)]">
            <Flame className="w-3.5 h-3.5 fill-current text-[var(--accent-main)]" />
            <span className="text-[11.5px] font-black text-[var(--text-primary)]">
              {streak}
            </span>
          </div>
          <span className="w-0.5 h-3 bg-black/10 dark:bg-white/15 rounded-full" />
          <div className="flex items-center gap-1 text-[var(--accent-main)]">
            <Star className="w-3.5 h-3.5 fill-current text-[var(--accent-main)]" />
            <span className="text-[11.5px] font-black text-[var(--text-primary)]">
              {stars}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Primary Segmented Switch: Petualangan Solo vs Mabar & Arena */}
      <div className="w-full h-11 p-1 rounded-full liquid-glass-card flex items-center z-10 relative shrink-0">
        <button
          type="button"
          onClick={() => setSelectedHubMode('solo')}
          className={`flex-1 h-full rounded-full text-[11px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer tactile-active ${
            hubMode === 'solo'
              ? 'liquid-glass-tile-active shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Compass className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Petualangan Solo</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedHubMode('mabar')}
          className={`flex-1 h-full rounded-full text-[11px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer tactile-active ${
            hubMode === 'mabar'
              ? 'liquid-glass-tile-active shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Users className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Mabar & Komunitas</span>
        </button>
      </div>

      {/* ============================================================
          MODE 1: PETUALANGAN SOLO
          ============================================================ */}
      {hubMode === 'solo' && (
        <div className="flex flex-col gap-3 relative z-10">
          {/* Hero Card: Resume Bab Aktif */}
          <div
            onClick={handleStartActiveLevel}
            className="w-full shrink-0 rounded-[26px] p-4 relative z-10 cursor-pointer tactile-active group transition-all overflow-hidden border border-white/10 dark:border-white/15 shadow-sm"
            style={{
              background: 'var(--hero-grad, var(--accent-grad))',
              color: '#ffffff',
            }}
          >
            {/* Ambient Lighting & Top Specular Sheen */}
            <div className="absolute top-0 inset-x-0 h-px bg-white/30 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-black/25 blur-2xl pointer-events-none" />

            {/* Crossword Grid Pattern Overlay (Oversized Graphic Watermark Texture) */}
            <CrosswordPatternOverlay level={currentLevel} />

            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/25 inline-flex items-center gap-1.5">
                <Compass className="w-3 h-3 stroke-[2.2]" />
                <span>ALAM {activeRealm.tag.toUpperCase()}</span>
              </span>
              <span className="text-[10px] font-bold text-white/90">
                Bab {currentLevelIndex + 1} • {solvedCountInCurrent}/{totalWordsInCurrent} Kata
              </span>
            </div>

            <div className="relative z-10 mb-1 pr-6 sm:pr-10">
              <h3 className="text-[20px] font-black text-white tracking-tight leading-tight mb-1 max-w-[75%]">
                {currentLevel.title}
              </h3>
              <p className="text-[10.5px] text-white/85 leading-tight mb-1 max-w-[70%]">
                Jelajahi petualangan kosakata di alam {activeRealm.name.toLowerCase()}.
              </p>
            </div>

            {/* Shortened Progress Bar on the left */}
            <div className="w-[58%] my-2 relative z-10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9.5px] font-bold text-white/85">
                  Progres Bab
                </span>
                <span className="text-[9.5px] font-black text-white">
                  {currentProgressPercent}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-black/25 overflow-hidden p-0.5 border border-white/20">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-white"
                  style={{
                    width: `${Math.max(solvedCountInCurrent > 0 ? currentProgressPercent : 12, 12)}%`,
                  }}
                />
              </div>
            </div>

            {/* Action Button on the left */}
            <div className="flex items-center gap-2 justify-start mt-2 relative z-10">
              <div
                className="py-1.5 px-3.5 rounded-full bg-white text-[10.5px] font-black flex items-center gap-1.5 group-hover:scale-105 transition-transform shadow-sm"
                style={{ color: 'var(--hero-btn-text, #111113)' }}
              >
                <Compass className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Mulai Jelajah</span>
              </div>
            </div>

            {/* Large Solid Mascot Overlay - Indonesian Puzzle Kid (Cultural & Thematic) */}
            <img
              src={MASCOTS.indonesianPuzzleKid}
              alt="Mascot Penjelajah Alam Nusantara"
              className="absolute -bottom-2 -right-1 w-36 sm:w-44 h-40 sm:h-48 object-contain object-bottom pointer-events-none select-none z-0 filter drop-shadow-lg group-hover:scale-105 transition-transform"
            />
          </div>

          {/* Quick Utility Bar: Progres Kelulusan + Main Acak + Buku Kosakata */}
          <div className="w-full p-3 rounded-[24px] liquid-glass-card flex items-center justify-between gap-2 relative z-10">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center border border-[var(--accent-main)]/20 shadow-2xs shrink-0">
                <Trophy className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider truncate">
                  PROGRES KELULUSAN
                </span>
                <span className="text-[12px] font-black leading-none text-[var(--text-primary)] truncate">
                  {totalCompletedLevels}/{levels.length} Bab Selesai
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Tombol Main Acak (Shuffle Play) */}
              <button
                type="button"
                onClick={playRandomLevel}
                title="Pilih level acak tanpa mikir bab"
                className="py-1.5 px-3 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[10px] font-black flex items-center gap-1.5 cursor-pointer tactile-active hover:opacity-95 shadow-xs transition-all"
              >
                <Dices className="w-3.5 h-3.5 stroke-[2.4]" />
                <span>Main Acak</span>
              </button>

              {/* Tombol Glosarium Kosakata */}
              <button
                type="button"
                onClick={openLexicon}
                title="Buka buku kosakata KBBI"
                className="py-1.5 px-2.5 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 text-[var(--text-primary)] text-[10px] font-bold flex items-center gap-1 cursor-pointer tactile-active hover:opacity-90 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 stroke-[2.2]" />
                <span className="hidden sm:inline">Glosarium</span>
              </button>
            </div>
          </div>

          {/* Banner: Piala Nusantara Cup Knockout Entry */}
          <div
            onClick={openTournament}
            className="w-full p-3.5 rounded-[24px] relative z-10 flex items-center justify-between gap-3 border border-amber-500/30 shadow-xs cursor-pointer tactile-active group overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, var(--bg-card) 60%, rgba(245,158,11,0.18) 100%)',
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/35 flex items-center justify-center text-amber-500 shrink-0 shadow-2xs">
                <Trophy className="w-5 h-5 fill-amber-500 stroke-none" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold">
                    TURNAMEN NASIONAL
                  </span>
                  <span className="text-[9px] font-bold text-[var(--text-secondary)]">
                    {trophies.gold} 🏆 Emas
                  </span>
                </div>
                <h4 className="text-[13px] font-black text-[var(--text-primary)] tracking-tight leading-tight truncate">
                  Piala Nusantara (16 Besar)
                </h4>
              </div>
            </div>

            <div className="py-1.5 px-3 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center gap-1 shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <span>Buka Bagan</span>
              <Trophy className="w-3 h-3 fill-white stroke-none" />
            </div>
          </div>

          {/* 30 Kategori Tematik (Accordion Bento Architecture) */}
          <div className="flex flex-col gap-2.5 pt-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2]" />
                <span>30 KATEGORI TEMATIK</span>
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] font-semibold">
                {levels.length} Bab Terstruktur
              </span>
            </div>

            {/* List of 30 Themes */}
            <div className="space-y-2.5">
              {REALMS.map((realm: RealmDefinition, realmIdx: number) => {
                const realmLevels = getLevelsByRealm(realm.id, levels);
                const isExpanded = expandedRealmId === realm.id;
                const RealmIconComponent = REALM_ICONS[realm.id] || Compass;

                // Calculate progress inside this realm
                const completedInRealm = realmLevels.filter(
                  ({ level }) => !!levelRecords[level.id]?.completed
                ).length;
                const totalInRealm = realmLevels.length;
                const realmPercent =
                  totalInRealm > 0 ? Math.round((completedInRealm / totalInRealm) * 100) : 0;
                const isRealmFullyCompleted =
                  totalInRealm > 0 && completedInRealm === totalInRealm;

                return (
                  <div
                    key={realm.id}
                    className={`w-full rounded-[24px] overflow-hidden transition-all ${
                      isRealmFullyCompleted
                        ? 'border border-white/20 shadow-md'
                        : 'liquid-glass-card'
                    }`}
                    style={
                      isRealmFullyCompleted
                        ? { background: 'var(--accent-grad)' }
                        : undefined
                    }
                  >
                    {/* Realm Bento Header Accordion Button */}
                    <div
                      onClick={() => toggleRealm(realm.id)}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer tactile-active group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Realm Icon Badge */}
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${
                            isRealmFullyCompleted
                              ? 'bg-white/20 text-[var(--accent-contrast)] border border-white/30 backdrop-blur-sm'
                              : isExpanded
                              ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                              : 'bg-black/5 dark:bg-white/10 text-[var(--text-primary)] border border-black/5 dark:border-white/10'
                          }`}
                        >
                          <RealmIconComponent className="w-5 h-5 stroke-[2.2]" />
                        </div>

                        {/* Realm Title & Meta */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span
                              className={`text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                isRealmFullyCompleted
                                  ? 'bg-white/20 text-[var(--accent-contrast)]'
                                  : 'bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]'
                              }`}
                            >
                              TEMA {realmIdx + 1} • {realm.tag}
                            </span>
                            {isRealmFullyCompleted && (
                              <span className="text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/25 border border-white/35 text-[var(--accent-contrast)] font-bold backdrop-blur-sm">
                                Sempurna
                              </span>
                            )}
                          </div>

                          <h4
                            className={`text-[14px] font-black tracking-tight leading-tight truncate ${
                              isRealmFullyCompleted
                                ? 'text-[var(--accent-contrast)]'
                                : 'text-[var(--text-primary)]'
                            }`}
                          >
                            {realm.name}
                          </h4>

                          <p
                            className={`text-[10px] font-medium line-clamp-1 mt-0.5 ${
                              isRealmFullyCompleted
                                ? 'text-[var(--accent-contrast)]/80'
                                : 'text-[var(--text-secondary)]'
                            }`}
                          >
                            {realm.subtitle}
                          </p>

                          {/* Micro Progress Bar */}
                          <div className="flex items-center gap-2 mt-1.5">
                            <div
                              className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                                isRealmFullyCompleted
                                  ? 'bg-black/25'
                                  : 'bg-black/5 dark:bg-white/10'
                              }`}
                            >
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isRealmFullyCompleted
                                    ? 'bg-[var(--accent-contrast)]'
                                    : 'bg-[var(--accent-main)]'
                                }`}
                                style={{ width: `${realmPercent}%` }}
                              />
                            </div>
                            <span
                              className={`text-[9.5px] font-bold shrink-0 ${
                                isRealmFullyCompleted
                                  ? 'text-[var(--accent-contrast)]'
                                  : 'text-[var(--text-secondary)]'
                              }`}
                            >
                              {completedInRealm}/{totalInRealm} ({realmPercent}%)
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Chevron */}
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          isRealmFullyCompleted
                            ? 'bg-white/20 text-[var(--accent-contrast)]'
                            : 'bg-black/5 dark:bg-white/10 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'
                        }`}
                      >
                        <ChevronDown
                          className={`w-4 h-4 stroke-[2.5] transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </div>

                    {/* Expanded Chapter Sub-List */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className={`overflow-hidden border-t ${
                            isRealmFullyCompleted
                              ? 'border-white/15 bg-black/15'
                              : 'border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]'
                          }`}
                        >
                          <div className="p-2.5 sm:p-3 space-y-2">
                            {realmLevels.map(({ level: lvl, index }) => {
                              const record = levelRecords[lvl.id];
                              const isCurrent = index === currentLevelIndex;
                              const isCompleted = !!record?.completed;
                              const totalWords =
                                (lvl.clues?.across?.length || 0) + (lvl.clues?.down?.length || 0);
                              const rating = record?.rating || (isCompleted ? 3 : 0);
                              const bestTime = record?.timeSpent
                                ? formatDuration(record.timeSpent)
                                : null;
                              const accuracy = record?.accuracy;

                              return (
                                <div
                                  key={lvl.id}
                                  onClick={() => {
                                    selectLevel(index);
                                    setCurrentTab('game');
                                  }}
                                  style={
                                    isCompleted
                                      ? { background: 'var(--accent-grad)' }
                                      : undefined
                                  }
                                  className={`w-full rounded-[18px] p-3 relative z-10 transition-all cursor-pointer tactile-active flex items-center justify-between gap-2.5 overflow-hidden group ${
                                    isCompleted
                                      ? 'border border-white/25 shadow-sm text-[var(--accent-contrast)]'
                                      : isCurrent
                                      ? 'bg-[var(--accent-light)] border-2 border-[var(--accent-main)] shadow-xs dark:bg-[var(--accent-main)]/15'
                                      : 'bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/5 opacity-85 hover:opacity-100 hover:bg-black/[0.04] dark:hover:bg-white/[0.05]'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    {/* Chapter Number / Status Badge */}
                                    <div
                                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-[12px] shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${
                                        isCompleted
                                          ? 'bg-white/25 text-[var(--accent-contrast)] border border-white/35 backdrop-blur-sm'
                                          : isCurrent
                                          ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-2xs'
                                          : 'bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]'
                                      }`}
                                    >
                                      {isCompleted ? (
                                        <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />
                                      ) : (
                                        index + 1
                                      )}
                                    </div>

                                    {/* Level Details */}
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1.5 mb-0.5">
                                        <span
                                          className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                                            isCompleted
                                              ? 'bg-white/20 text-[var(--accent-contrast)]'
                                              : 'bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]'
                                          }`}
                                        >
                                          {lvl.category}
                                        </span>
                                        {isCurrent && !isCompleted && (
                                          <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.2 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] font-bold">
                                            Aktif
                                          </span>
                                        )}
                                        {isCompleted && (
                                          <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.2 rounded-full bg-white/25 text-[var(--accent-contrast)] border border-white/30 font-bold backdrop-blur-sm">
                                            Selesai
                                          </span>
                                        )}
                                      </div>

                                      <h5
                                        className={`text-[13px] font-black tracking-tight leading-tight truncate ${
                                          isCompleted
                                            ? 'text-[var(--accent-contrast)]'
                                            : 'text-[var(--text-primary)]'
                                        }`}
                                      >
                                        {lvl.title}
                                      </h5>

                                      {/* Micro stats row */}
                                      <div
                                        className={`flex items-center gap-2 mt-0.5 text-[9.5px] font-semibold ${
                                          isCompleted
                                            ? 'text-[var(--accent-contrast)]/80'
                                            : 'text-[var(--text-secondary)]'
                                        }`}
                                      >
                                        <span>{totalWords} Kata</span>

                                        {bestTime && (
                                          <span
                                            className={`flex items-center gap-0.5 ${
                                              isCompleted
                                                ? 'text-[var(--accent-contrast)]'
                                                : 'text-[var(--text-primary)]'
                                            }`}
                                          >
                                            <Clock
                                              className={`w-2.5 h-2.5 stroke-[2.2] ${
                                                isCompleted
                                                  ? 'text-[var(--accent-contrast)]'
                                                  : 'text-[var(--accent-main)]'
                                              }`}
                                            />
                                            <span>{bestTime}</span>
                                          </span>
                                        )}

                                        {accuracy !== undefined && (
                                          <span
                                            className={`flex items-center gap-0.5 ${
                                              isCompleted
                                                ? 'text-[var(--accent-contrast)]'
                                                : 'text-[var(--text-primary)]'
                                            }`}
                                          >
                                            <Sparkles
                                              className={`w-2.5 h-2.5 stroke-[2.2] ${
                                                isCompleted
                                                  ? 'text-[var(--accent-contrast)]'
                                                  : 'text-[var(--accent-main)]'
                                              }`}
                                            />
                                            <span>{accuracy}%</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Right side: Star rating + Replay or Play button */}
                                  <div className="shrink-0 flex items-center gap-2">
                                    {isCompleted ? (
                                      <>
                                        <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-white/20 border border-white/25 backdrop-blur-sm">
                                          {[1, 2, 3].map((starIdx) => (
                                            <Star
                                              key={starIdx}
                                              className={`w-3 h-3 ${
                                                starIdx <= rating
                                                  ? 'fill-[var(--accent-contrast)] text-[var(--accent-contrast)]'
                                                  : 'text-[var(--accent-contrast)]/30 stroke-[1.5]'
                                              }`}
                                            />
                                          ))}
                                        </div>
                                        <div
                                          className="w-7.5 h-7.5 rounded-full flex items-center justify-center bg-white/20 text-[var(--accent-contrast)] hover:bg-white/30 border border-white/25 transition-all"
                                          title="Main Lagi"
                                        >
                                          <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                                        </div>
                                      </>
                                    ) : (
                                      <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${
                                          isCurrent
                                            ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                                            : 'bg-black/5 dark:bg-white/10 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:bg-black/10'
                                        }`}
                                      >
                                        <Play className="w-3.5 h-3.5 fill-current ml-0.5 stroke-[0]" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODE 2: MABAR & KOMUNITAS (SocialView Engine)
          ============================================================ */}
      {hubMode === 'mabar' && (
        <div className="relative z-10">
          <SocialView isEmbedded />
        </div>
      )}
    </div>
  );
};

export default ArenaView;
