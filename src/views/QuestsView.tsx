import React, { useState, useMemo } from 'react';
import {
  Star,
  Flame,
  Check,
  Gift,
  Trophy,
  Brain,
  Zap,
  ArrowUpRight,
  BookOpen,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import confetti from 'canvas-confetti';
import { MASCOTS } from '../assets/maskots';

interface CircularProgressProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  gradientId: string;
  isThemedHero?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percent,
  size = 60,
  strokeWidth = 5,
  gradientId,
  isThemedHero = false,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <defs>
        {isThemedHero ? (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.75" />
          </linearGradient>
        ) : (
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-main)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--accent-main)" stopOpacity="0.4" />
          </linearGradient>
        )}
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={isThemedHero ? 'rgba(255, 255, 255, 0.25)' : 'currentColor'}
        strokeWidth={strokeWidth}
        className={isThemedHero ? '' : 'opacity-15 text-[var(--text-secondary)]'}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
};

export const QuestsView: React.FC = () => {
  const {
    stars,
    streak,
    levels,
    levelRecords,
    currentLevelIndex,
    solvedClues,
    setCurrentTab,
    selectLevel,
    addStars,
  } = useGameStore();

  const [today] = useState(() => new Date());

  const currentLevel = levels[currentLevelIndex] || levels[0];
  const totalWordsInCurrentLevel =
    (currentLevel.clues?.across?.length || 0) + (currentLevel.clues?.down?.length || 0) || 8;
  const solvedCountInCurrentLevel = solvedClues.length;

  // --- Real Stats Calculation (Zero Dummy Data) ---
  const totalSolvedWords = useMemo(() => {
    return levels.reduce((sum, lvl) => {
      const rec = levelRecords[lvl.id];
      return sum + (rec?.solved?.length || 0);
    }, 0);
  }, [levels, levelRecords]);

  const completedLevelsCount = useMemo(() => {
    return levels.filter((lvl) => levelRecords[lvl.id]?.completed).length;
  }, [levels, levelRecords]);

  // --- 7 Weekday Calendar Strip (Derived from real Date & Streak) ---
  const weekDays = useMemo(() => {
    const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - currentDayOfWeek + i);
      const dayName = dayLabels[d.getDay()];
      const dateNum = d.getDate();
      const isToday = i === currentDayOfWeek;
      const daysDiffFromToday = currentDayOfWeek - i;
      // Mark as played if within streak days before today
      const hasPlayed = daysDiffFromToday >= 0 && daysDiffFromToday < streak;

      return {
        dayName,
        dateNum,
        isToday,
        hasPlayed,
      };
    });
  }, [today, streak]);

  // --- Daily Quests Tracking with Real State & Persistence ---
  const todayKey = useMemo(() => today.toISOString().slice(0, 10), [today]);
  const storageClaimKey = `tts_quest_claims_${todayKey}`;

  const [claimedQuests, setClaimedQuests] = useState<{
    words: boolean;
    level: boolean;
    anagram: boolean;
    grandChest: boolean;
  }>(() => {
    if (typeof window === 'undefined') {
      return { words: false, level: false, anagram: false, grandChest: false };
    }
    const saved = localStorage.getItem(storageClaimKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return { words: false, level: false, anagram: false, grandChest: false };
  });

  const saveClaims = (updated: typeof claimedQuests) => {
    setClaimedQuests(updated);
    localStorage.setItem(storageClaimKey, JSON.stringify(updated));
  };

  // Quest 1: Pecahkan 5 Kata
  const wordsTarget = 5;
  const wordsProgress = Math.min(wordsTarget, Math.max(totalSolvedWords, solvedCountInCurrentLevel));
  const isWordsQuestComplete = wordsProgress >= wordsTarget;

  // Quest 2: Tuntaskan 1 Bab Lengkap
  const isLevelQuestComplete =
    completedLevelsCount > 0 || (levelRecords[currentLevel.id]?.completed ?? false);

  // Quest 3: Selesaikan Wawasan Kata Hari Ini / Anagram
  const isDailyWordDone = useMemo(() => {
    if (typeof window === 'undefined') return false;
    let found = false;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('tts_quest_word_claimed_') || key === 'tts_quest_anagram_done')) {
        found = true;
        break;
      }
    }
    return found;
  }, []);

  const completedQuestsCount =
    (isWordsQuestComplete ? 1 : 0) + (isLevelQuestComplete ? 1 : 0) + (isDailyWordDone ? 1 : 0);
  const questProgressPercent = Math.round((completedQuestsCount / 3) * 100);
  const isGrandChestAvailable = completedQuestsCount === 3;

  const handleClaimQuest = (questKey: 'words' | 'level' | 'anagram', rewardStars: number) => {
    if (claimedQuests[questKey]) return;
    addStars(rewardStars);
    saveClaims({ ...claimedQuests, [questKey]: true });
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.65 },
    });
  };

  const handleClaimGrandChest = () => {
    if (!isGrandChestAvailable || claimedQuests.grandChest) return;
    addStars(50);
    saveClaims({ ...claimedQuests, grandChest: true });
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
  };

  return (
    <div className="w-full flex-1 flex flex-col gap-3 px-3.5 pt-[max(18px,env(safe-area-inset-top))] pb-[max(90px,calc(75px+env(safe-area-inset-bottom)))] select-none overflow-y-auto relative">
      {/* 1. Header: Typographic Title + Stars Badge */}
      <header className="flex items-center justify-between px-0.5 relative z-10 shrink-0">
        <div>
          <span className="text-[9.5px] font-black uppercase tracking-wider text-[var(--accent-main)] block leading-none mb-0.5">
            TANTANGAN HARIAN
          </span>
          <h2 className="text-[18px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
            Misi & Prestasi
          </h2>
        </div>

        {/* Unified Glass Stars Pill */}
        <div className="h-8.5 px-3 rounded-full flex items-center gap-1.5 liquid-glass-card border border-black/5 dark:border-white/10">
          <Star className="w-3.5 h-3.5 fill-current text-[var(--accent-main)]" />
          <span className="text-[11.5px] font-black text-[var(--text-primary)]">
            {stars}
          </span>
          <span className="text-[8px] uppercase font-bold text-[var(--text-secondary)]">
            Bintang
          </span>
        </div>
      </header>

      {/* 2. Duolingo-Style Reactive Streak Hero Card */}
      <div
        className="w-full shrink-0 rounded-[26px] p-4 relative z-10 overflow-hidden border border-[var(--accent-main)]/20 shadow-xs group flex flex-col gap-3"
        style={{
          background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
        }}
      >
        <div className="relative z-10 pr-6 sm:pr-10">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-6 h-6 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/30 flex items-center justify-center text-[var(--accent-main)]">
              <Flame className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-[17px] font-black text-[var(--text-primary)] leading-none">
              {streak} Hari Streak
            </span>
          </div>
          <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight max-w-[75%]">
            {streak === 0
              ? 'Streak kamu padam! Pecahkan 1 kata untuk menyalakan api hari ini.'
              : 'Luar biasa! Pertahankan konsistensi bermainmu setiap hari.'}
          </p>
        </div>

        {/* 7 Weekday Calendar Strip (Integrated inside Streak Card) */}
        <div className="w-full flex items-center justify-between gap-1.5 pt-2.5 border-t border-black/5 dark:border-white/10 relative z-10">
          {weekDays.map((d, idx) => (
            <div
              key={idx}
              className={`flex-1 py-1.5 rounded-[16px] flex flex-col items-center justify-between transition-all ${
                d.isToday
                  ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-2xs'
                  : 'bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10'
              }`}
            >
              {/* Dot indicator if played/streak active */}
              <div className="h-1 flex items-center justify-center mb-0.5">
                {d.hasPlayed && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      d.isToday ? 'bg-[var(--accent-contrast)]' : 'bg-[var(--accent-main)]'
                    }`}
                  />
                )}
              </div>

              <span
                className={`text-[8.5px] font-bold uppercase leading-none block mb-0.5 ${
                  d.isToday ? 'text-[var(--accent-contrast)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {d.dayName}
              </span>

              <span
                className={`text-[11.5px] font-black leading-none block ${
                  d.isToday ? 'text-[var(--accent-contrast)]' : 'text-[var(--text-primary)]'
                }`}
              >
                {d.dateNum}
              </span>
            </div>
          ))}
        </div>

        {/* Large Solid Mascot Overlay - Pinned to bottom-right edge of card, solid 100% */}
        <img
          src={streak === 0 ? MASCOTS.lostStreakBoy : MASCOTS.cheerfulBookBoy}
          alt={streak === 0 ? 'Mascot Sedih Streak Padam' : 'Mascot Semangat Streak'}
          className="absolute -bottom-2 -right-1 w-32 sm:w-38 h-36 sm:h-42 object-contain object-bottom pointer-events-none select-none z-0 filter drop-shadow-md group-hover:scale-105 transition-transform"
        />
      </div>

      {/* 3. Peti Hadiah Harian (Grand Quest Chest Hero Card with Themed Gradient) */}
      <div
        className="w-full shrink-0 rounded-[26px] p-4 relative z-10 overflow-hidden border border-white/10 dark:border-white/15 shadow-sm group flex flex-col gap-3"
        style={{
          background: 'var(--hero-grad, var(--accent-grad))',
          color: '#ffffff',
        }}
      >
        {/* Specular Top Highlight & Ambient Soft Blur */}
        <div className="absolute top-0 inset-x-0 h-px bg-white/30 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-black/25 blur-2xl pointer-events-none" />

        {/* Top Meta Row */}
        <div className="flex items-center justify-between relative z-10">
          <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/25">
            RESET 00:00 WIB • PETI HADIAH
          </span>
          <span className="text-[11px] font-black text-white">
            +50 ★ Bintang
          </span>
        </div>

        {/* Middle Content Row: Info & Radial Progress & Mascot */}
        {/* Middle Content Row: Info & Radial Progress */}
        <div className="relative z-10 pr-6 sm:pr-10">
          <h3 className="text-[19px] sm:text-[20px] font-black text-white tracking-tight leading-tight mb-1 max-w-[75%]">
            Peti Hadiah Harian
          </h3>
          <p className="text-[10.5px] text-white/85 leading-tight mb-2.5 max-w-[70%]">
            {claimedQuests.grandChest
              ? 'Hadiah utama harian berhasil kamu buka! Kembali besok untuk peti berikutnya.'
              : isGrandChestAvailable
              ? 'Semua 3 misi hari ini tuntas! Buka peti sekarang untuk bonus 50 bintang.'
              : `Selesaikan ${3 - completedQuestsCount} misi lagi untuk membuka peti bonus harian.`}
          </p>

          {/* Radial Progress & Counts */}
          <div className="flex items-center gap-2">
            <div className="relative inline-flex items-center justify-center shrink-0">
              <CircularProgress
                percent={questProgressPercent}
                size={52}
                strokeWidth={4.5}
                gradientId="grad-quests-hero"
                isThemedHero
              />
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[11px] font-black text-white leading-none">
                  {completedQuestsCount}/3
                </span>
              </div>
            </div>
            <span className="text-[9px] font-bold text-white/90">
              {questProgressPercent}% Selesai
            </span>
          </div>
        </div>

        {/* Action Button inside Hero Card */}
        <button
          type="button"
          disabled={!isGrandChestAvailable || claimedQuests.grandChest}
          onClick={handleClaimGrandChest}
          className={`w-full py-2.5 rounded-2xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-all relative z-10 ${
            claimedQuests.grandChest
              ? 'bg-white/20 text-white/80 border border-white/25 cursor-default'
              : isGrandChestAvailable
              ? 'bg-white shadow-sm cursor-pointer tactile-active hover:opacity-95'
              : 'bg-white/15 text-white/70 border border-white/20 cursor-not-allowed'
          }`}
          style={
            isGrandChestAvailable && !claimedQuests.grandChest
              ? { color: 'var(--hero-btn-text, #111113)' }
              : undefined
          }
        >
          {claimedQuests.grandChest ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Peti Berhasil Diklaim</span>
            </>
          ) : isGrandChestAvailable ? (
            <>
              <Gift className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Buka Peti (+50 ★ Bonus)</span>
            </>
          ) : (
            <>
              <Gift className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Kunci Peti ({completedQuestsCount}/3 Misi Tuntas)</span>
            </>
          )}
        </button>

        {/* Large Tactile Treasure Chest Emblem - Middle-right floating overlay (mirrors streak flame on home) */}
        <div className="absolute right-4 sm:right-7 top-1/2 -translate-y-[52%] w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center pointer-events-none select-none z-0 group-hover:scale-110 transition-transform">
          <div className="w-full h-full rounded-3xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-6 transition-transform">
            <Gift className="w-14 h-14 sm:w-16 sm:h-16 text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.35)] stroke-[1.8]" />
          </div>
        </div>
      </div>

      {/* Section Sub-heading */}
      <div className="flex items-center justify-between px-0.5 z-10 relative pt-1 shrink-0">
        <h4 className="text-[13.5px] font-black text-[var(--text-primary)] tracking-tight">
          Misi Hari Ini
        </h4>
        <span className="text-[9px] font-bold text-[var(--accent-main)]">
          {completedQuestsCount}/3 Tuntas
        </span>
      </div>

      {/* 4. Asymmetric Bento Grid (2-Column Layout) */}
      <div className="grid grid-cols-12 gap-2.5 z-10 relative shrink-0">
        {/* Kolom Kiri: Tall Bento Card (Misi 1: Pecahkan 5 Kata) */}
        <div
          className="col-span-6 rounded-[24px] p-3.5 sm:p-4 flex flex-col justify-between border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden group transition-all"
          style={{
            background: 'linear-gradient(145deg, var(--accent-light) 0%, var(--bg-card) 65%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8.5px] font-black px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)]">
                +15 ★
              </span>
              <div className="w-6.5 h-6.5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center text-[var(--accent-main)]">
                <Brain className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
            </div>

            <h5 className="text-[13px] font-black text-[var(--text-primary)] tracking-tight leading-tight mb-1">
              Kosakata Silang
            </h5>
            <p className="text-[9.5px] text-[var(--text-secondary)] leading-tight mb-3">
              Pecahkan 5 kata bersilangan pada level TTS aktif hari ini.
            </p>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between text-[8px] text-[var(--text-secondary)] mb-1">
              <span>Progres</span>
              <span className="font-bold text-[var(--text-primary)]">
                {wordsProgress}/{wordsTarget} Kata
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden mb-2.5">
              <div
                className="h-full rounded-full bg-[var(--accent-main)] transition-all duration-500"
                style={{ width: `${(wordsProgress / wordsTarget) * 100}%` }}
              />
            </div>

            {/* Action Button */}
            {claimedQuests.words ? (
              <div className="w-full py-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-center text-[9px] font-bold text-[var(--text-secondary)]">
                ✓ Selesai
              </div>
            ) : isWordsQuestComplete ? (
              <button
                type="button"
                onClick={() => handleClaimQuest('words', 15)}
                className="w-full py-2 rounded-xl bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[9.5px] font-black cursor-pointer tactile-active shadow-xs text-center hover:opacity-95"
              >
                Klaim +15 ★
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentTab('game')}
                className="w-full py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-primary)] text-[9px] font-bold cursor-pointer tactile-active flex items-center justify-center gap-1 transition-colors"
              >
                <span>Pecahkan Kata</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Kolom Kanan: Stack 2 Bento Cards */}
        <div className="col-span-6 flex flex-col gap-2.5">
          {/* Card Kanan Atas: Misi 2 (Tuntaskan 1 Bab) */}
          <div
            className="rounded-[22px] p-3 sm:p-3.5 flex flex-col justify-between border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden group transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
            }}
          >
            <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)]">
                  +20 ★
                </span>
                <div className="w-6 h-6 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center text-[var(--accent-main)]">
                  <Trophy className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
              </div>

              <h5 className="text-[12px] font-black text-[var(--text-primary)] tracking-tight leading-tight mb-0.5">
                Penakluk Bab
              </h5>
              <p className="text-[8.5px] text-[var(--text-secondary)] leading-tight mb-2">
                Tuntaskan seluruh kata dalam satu bab penuh.
              </p>
            </div>

            <div className="relative z-10">
              {claimedQuests.level ? (
                <div className="w-full py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-center text-[8.5px] font-bold text-[var(--text-secondary)]">
                  ✓ Selesai
                </div>
              ) : isLevelQuestComplete ? (
                <button
                  type="button"
                  onClick={() => handleClaimQuest('level', 20)}
                  className="w-full py-1.5 rounded-lg bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[9px] font-black cursor-pointer tactile-active shadow-xs hover:opacity-95"
                >
                  Klaim +20 ★
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => selectLevel(currentLevelIndex)}
                  className="w-full py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-primary)] text-[8.5px] font-bold cursor-pointer tactile-active flex items-center justify-center gap-0.5 transition-colors"
                >
                  <span>Bab {currentLevelIndex + 1}</span>
                  <ArrowUpRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>

          {/* Card Kanan Bawah: Misi 3 (Wawasan Kata Hari Ini) */}
          <div
            className="rounded-[22px] p-3 sm:p-3.5 flex flex-col justify-between border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden group transition-all"
            style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
            }}
          >
            <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)]">
                  +15 ★
                </span>
                <div className="w-6 h-6 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center text-[var(--accent-main)]">
                  <Zap className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
              </div>

              <h5 className="text-[12px] font-black text-[var(--text-primary)] tracking-tight leading-tight mb-0.5">
                Wawasan Kata
              </h5>
              <p className="text-[8.5px] text-[var(--text-secondary)] leading-tight mb-2">
                Buka definisi Kata Hari Ini KBBI di Beranda.
              </p>
            </div>

            <div className="relative z-10">
              {claimedQuests.anagram ? (
                <div className="w-full py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-center text-[8.5px] font-bold text-[var(--text-secondary)]">
                  ✓ Selesai
                </div>
              ) : isDailyWordDone ? (
                <button
                  type="button"
                  onClick={() => handleClaimQuest('anagram', 15)}
                  className="w-full py-1.5 rounded-lg bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[9px] font-black cursor-pointer tactile-active shadow-xs hover:opacity-95"
                >
                  Klaim +15 ★
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setCurrentTab('home')}
                  className="w-full py-1.5 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-primary)] text-[8.5px] font-bold cursor-pointer tactile-active flex items-center justify-center gap-0.5 transition-colors"
                >
                  <span>Buka Beranda</span>
                  <ArrowUpRight className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Stat Bento Grid (Zero Dummy Data with Themed Gradients) */}
      <div className="grid grid-cols-2 gap-2.5 z-10 relative shrink-0">
        {/* Stat Box 1: Kata Terpecahkan */}
        <div
          className="rounded-[22px] p-3.5 flex flex-col justify-between border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 75%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

          <div className="flex items-center justify-between mb-1 relative z-10">
            <span className="text-[8.5px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
              TOTAL KATA
            </span>
            <BookOpen className="w-3.5 h-3.5 text-[var(--accent-main)]" />
          </div>
          <div className="flex items-baseline justify-between mt-1 relative z-10">
            <span className="text-[24px] font-black text-[var(--text-primary)] leading-none">
              {totalSolvedWords}
            </span>
            <span className="text-[8px] font-bold text-[var(--accent-main)] uppercase">
              Kata Tuntas
            </span>
          </div>
        </div>

        {/* Stat Box 2: Bab Tuntas */}
        <div
          className="rounded-[22px] p-3.5 flex flex-col justify-between border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 75%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

          <div className="flex items-center justify-between mb-1 relative z-10">
            <span className="text-[8.5px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
              BAB SELESAI
            </span>
            <Trophy className="w-3.5 h-3.5 text-[var(--accent-main)]" />
          </div>
          <div className="flex items-baseline justify-between mt-1 relative z-10">
            <span className="text-[24px] font-black text-[var(--text-primary)] leading-none">
              {completedLevelsCount}
              <span className="text-[13px] text-[var(--text-secondary)] font-normal">
                /{levels.length}
              </span>
            </span>
            <span className="text-[8px] font-bold text-[var(--accent-main)] uppercase">
              Bab
            </span>
          </div>
        </div>
      </div>

      {/* 6. Bottom Bento Action Card (Theme Gradient Accent) */}
      <div
        onClick={() => {
          selectLevel(currentLevelIndex);
          setCurrentTab('game');
        }}
        role="button"
        tabIndex={0}
        className="w-full p-3.5 rounded-[24px] flex items-center justify-between cursor-pointer tactile-active z-10 relative group border border-white/20 hover:border-white/35 transition-all shadow-md shrink-0 overflow-hidden"
        style={{
          background: 'var(--accent-grad)',
          color: 'var(--accent-contrast)',
        }}
      >
        {/* Top specular sheen highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-white/30 pointer-events-none" />

        <div className="flex items-center gap-2.5 min-w-0 relative z-10">
          <div className="w-8.5 h-8.5 rounded-xl bg-[var(--accent-contrast)]/15 border border-[var(--accent-contrast)]/20 flex items-center justify-center text-[var(--accent-contrast)] shrink-0 shadow-2xs">
            <BookOpen className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[8.5px] font-black uppercase tracking-wider text-[var(--accent-contrast)] leading-none opacity-90">
                LANJUTKAN TANTANGAN
              </span>
              <span className="text-[8px] text-[var(--accent-contrast)]/75 font-semibold">
                • {solvedCountInCurrentLevel}/{totalWordsInCurrentLevel} Kata
              </span>
            </div>
            <p className="text-[13px] font-black text-[var(--accent-contrast)] truncate leading-tight">
              Bab {currentLevelIndex + 1}: {currentLevel.title}
            </p>
          </div>
        </div>

        {/* Action Button ↗ */}
        <div className="w-8 h-8 rounded-full bg-[var(--accent-contrast)] text-[var(--accent-main)] flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform relative z-10">
          <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
};

export default QuestsView;
