import React, { useMemo } from 'react';
import {
  Trophy,
  Star,
  CheckCircle2,
  Flame,
  Award,
  Brain,
  Sparkles,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

interface CircularProgressProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  gradientId: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percent,
  size = 66,
  strokeWidth = 6,
  gradientId,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-main)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--accent-main)" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="opacity-15 text-[var(--text-secondary)]"
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

export const StatsView: React.FC = () => {
  const { stars, streak, levels, levelRecords } = useGameStore();

  // --- Real Stats Computation (Zero Dummy Data) ---
  const { totalSolvedWords, totalCompletedLevels, totalWordsInApp, accuracy } = useMemo(() => {
    let solvedWords = 0;
    let completedLvl = 0;
    let wordsCount = 0;

    for (const lvl of levels) {
      const totalInLvl = (lvl.clues?.across?.length || 0) + (lvl.clues?.down?.length || 0);
      wordsCount += totalInLvl;
      const rec = levelRecords[lvl.id];
      if (rec) {
        solvedWords += rec.solved?.length || 0;
        if (rec.completed) completedLvl++;
      }
    }

    const acc = wordsCount > 0 ? Math.round((solvedWords / wordsCount) * 100) : 0;
    return {
      totalSolvedWords: solvedWords,
      totalCompletedLevels: completedLvl,
      totalWordsInApp: wordsCount,
      accuracy: acc,
    };
  }, [levels, levelRecords]);

  const achievements = useMemo(
    () => [
      {
        id: 'first_step',
        title: 'Langkah Pertama',
        desc: 'Selesaikan 1 kata pertama Anda',
        icon: Sparkles,
        unlocked: totalSolvedWords >= 1,
        progress: `${Math.min(1, totalSolvedWords)}/1`,
      },
      {
        id: 'level_master',
        title: 'Penakluk Bab',
        desc: 'Selesaikan minimal 1 bab lengkap',
        icon: Trophy,
        unlocked: totalCompletedLevels >= 1,
        progress: `${Math.min(1, totalCompletedLevels)}/1`,
      },
      {
        id: 'word_scholar',
        title: 'Kamus Berjalan',
        desc: 'Pecahkan total 10 kata bersilangan',
        icon: Brain,
        unlocked: totalSolvedWords >= 10,
        progress: `${Math.min(10, totalSolvedWords)}/10`,
      },
      {
        id: 'star_hoarder',
        title: 'Kolektor Bintang',
        desc: 'Kumpulkan lebih dari 150 bintang',
        icon: Star,
        unlocked: stars >= 150,
        progress: `${Math.min(150, stars)}/150`,
      },
      {
        id: 'streak_warrior',
        title: 'Konsisten & Tangguh',
        desc: 'Capai streak bermain 3 hari berturut',
        icon: Flame,
        unlocked: streak >= 3,
        progress: `${Math.min(3, streak)}/3`,
      },
      {
        id: 'grandmaster',
        title: 'Master TTS Bareng',
        desc: 'Tuntaskan seluruh bab yang tersedia',
        icon: Award,
        unlocked: totalCompletedLevels >= levels.length && levels.length > 0,
        progress: `${totalCompletedLevels}/${levels.length}`,
      },
    ],
    [totalSolvedWords, totalCompletedLevels, stars, streak, levels.length]
  );

  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="w-full flex-1 flex flex-col gap-3 px-3.5 pt-[20px] pb-[90px] select-none overflow-y-auto relative">
      {/* 1. Header: Typographic Title + Live Pill */}
      <header className="flex items-center justify-between px-0.5 relative z-10">
        <div>
          <span className="text-[9.5px] font-black uppercase tracking-wider text-[var(--accent-main)] block leading-none mb-0.5">
            TTS Bareng
          </span>
          <h2 className="text-[17px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
            Statistik & Rekor
          </h2>
        </div>

        {/* Live Streak & Stars Pill */}
        <div className="h-8.5 px-3 rounded-full flex items-center gap-2 liquid-glass-card">
          <div className="flex items-center gap-1 text-[var(--accent-main)]">
            <Flame className="w-3.5 h-3.5 fill-current text-[var(--accent-main)]" />
            <span className="text-[11.5px] font-black text-[var(--text-primary)]">
              {streak}
            </span>
          </div>
          <span className="w-0.5 h-3 bg-[var(--text-secondary)]/25 rounded-full" />
          <div className="flex items-center gap-1 text-[var(--accent-main)]">
            <Star className="w-3.5 h-3.5 fill-current text-[var(--accent-main)]" />
            <span className="text-[11.5px] font-black text-[var(--text-primary)]">
              {stars}
            </span>
          </div>
        </div>
      </header>

      {/* 2. Hero Summary Card: Radial Accuracy & Penguasaan Kata */}
      <div className="w-full rounded-[24px] p-3.5 liquid-glass-card relative z-10">
        <div className="flex items-center justify-between gap-3">
          {/* Radial Accuracy Gauge */}
          <div className="relative inline-flex items-center justify-center shrink-0">
            <CircularProgress
              percent={accuracy}
              size={66}
              strokeWidth={5.5}
              gradientId="grad-stats-accuracy"
            />
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[14.5px] font-black text-[var(--text-primary)] leading-none">
                {accuracy}%
              </span>
            </div>
          </div>

          {/* Info Overview */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[13px] font-black text-[var(--text-primary)] tracking-tight">
                Penguasaan Kata
              </span>
              <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
                {totalSolvedWords}/{totalWordsInApp} Kata
              </span>
            </div>

            <p className="text-[9.5px] text-[var(--text-secondary)] leading-tight mb-2">
              {accuracy >= 80
                ? 'Luar biasa! Tingkat penguasaan kosakata Anda sangat tinggi.'
                : accuracy >= 40
                ? 'Bagus! Lanjutkan eksplorasi bab untuk memperluas kosa kata.'
                : 'Mulai petualangan kata Anda dan pecahkan lebih banyak bab.'}
            </p>

            {/* Progress bar line */}
            <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--accent-main)] transition-all duration-500"
                style={{ width: `${Math.max(6, accuracy)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bento Grid 4 Metrik Riil (Apple Liquid Glass) */}
      <div className="grid grid-cols-2 gap-2.5 z-10 relative">
        {/* Metrik 1: Level Selesai */}
        <div className="liquid-glass-card rounded-[22px] p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="w-6.5 h-6.5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
              <Trophy className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-[8px] font-bold text-[var(--text-secondary)]">Bab</span>
          </div>

          <div>
            <span className="text-[18px] font-black text-[var(--text-primary)] block leading-none mb-0.5">
              {totalCompletedLevels}
              <span className="text-[11px] text-[var(--text-secondary)] font-normal">
                /{levels.length}
              </span>
            </span>
            <span className="text-[8.5px] font-medium text-[var(--text-secondary)]">
              Bab Selesai
            </span>
          </div>
        </div>

        {/* Metrik 2: Total Bintang */}
        <div className="liquid-glass-card rounded-[22px] p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="w-6.5 h-6.5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-[8px] font-bold text-[var(--text-secondary)]">Tabungan</span>
          </div>

          <div>
            <span className="text-[18px] font-black text-[var(--text-primary)] block leading-none mb-0.5">
              {stars}
            </span>
            <span className="text-[8.5px] font-medium text-[var(--text-secondary)]">
              Total Bintang
            </span>
          </div>
        </div>

        {/* Metrik 3: Kata Terpecahkan */}
        <div className="liquid-glass-card rounded-[22px] p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="w-6.5 h-6.5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-[8px] font-bold text-[var(--text-secondary)]">Kosa Kata</span>
          </div>

          <div>
            <span className="text-[18px] font-black text-[var(--text-primary)] block leading-none mb-0.5">
              {totalSolvedWords}
            </span>
            <span className="text-[8.5px] font-medium text-[var(--text-secondary)]">
              Kata Terpecahkan
            </span>
          </div>
        </div>

        {/* Metrik 4: Konsistensi Streak */}
        <div className="liquid-glass-card rounded-[22px] p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="w-6.5 h-6.5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
              <Flame className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-[8px] font-bold text-[var(--text-secondary)]">Ritme</span>
          </div>

          <div>
            <span className="text-[18px] font-black text-[var(--text-primary)] block leading-none mb-0.5">
              {streak} Hari
            </span>
            <span className="text-[8.5px] font-medium text-[var(--text-secondary)]">
              Streak Aktif
            </span>
          </div>
        </div>
      </div>

      {/* 4. Section Pencapaian & Lencana Prestasi */}
      <div className="z-10 relative">
        <div className="flex items-center justify-between mb-2 px-0.5">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[var(--accent-main)]" />
            <h3 className="text-[13px] font-black text-[var(--text-primary)] tracking-tight">
              Lencana Pencapaian
            </h3>
          </div>
          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
            {unlockedAchievementsCount}/{achievements.length} Terbuka
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {achievements.map((ach) => {
            const IconComponent = ach.icon;
            return (
              <div
                key={ach.id}
                className={`liquid-glass-card rounded-[20px] p-2.5 flex items-center gap-2.5 transition-all ${
                  ach.unlocked ? '' : 'opacity-65'
                }`}
              >
                {/* Icon Container */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    ach.unlocked
                      ? 'bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)] shadow-xs'
                      : 'bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[var(--text-secondary)]'
                  }`}
                >
                  <IconComponent className="w-4 h-4 stroke-[2.2]" />
                </div>

                {/* Text Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-[var(--text-primary)] leading-tight block">
                      {ach.title}
                    </span>
                    <span className="text-[7.5px] text-[var(--text-secondary)] font-bold">
                      {ach.progress}
                    </span>
                  </div>
                  <span className="text-[8.5px] text-[var(--text-secondary)] leading-tight block truncate mt-0.5">
                    {ach.desc}
                  </span>
                </div>

                {/* Badge Status */}
                <div className="shrink-0">
                  {ach.unlocked ? (
                    <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
                      Selesai
                    </span>
                  ) : (
                    <span className="text-[8px] font-semibold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[var(--text-secondary)]">
                      Terkunci
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsView;
