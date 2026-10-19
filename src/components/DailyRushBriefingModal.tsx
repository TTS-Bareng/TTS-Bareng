import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Clock,
  Flame,
  Trophy,
  Star,
  X,
  Play,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useGameStore, getTodayDateString } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';

function computeDayOfYear(): number {
  const d = new Date();
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const diff = d.getTime() - startOfYear.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function computeFormattedDate(): string {
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

export const DailyRushBriefingModal: React.FC = () => {
  const {
    isDailyRushBriefingOpen,
    closeDailyRushBriefing,
    startDailyRush,
    dailyRushRecord,
    levels,
  } = useGameStore();

  const [todayStr] = useState(getTodayDateString);
  const [dayOfYear] = useState(computeDayOfYear);
  const [formattedDate] = useState(computeFormattedDate);

  const todayPlayed = dailyRushRecord?.date === todayStr;

  const { todayLevel, wordCount } = useMemo(() => {
    const dailyIdx = (dayOfYear * 7 + 13) % (levels.length || 1);
    const lvl = levels[dailyIdx] || levels[0];
    const wc = (lvl?.clues?.across?.length || 0) + (lvl?.clues?.down?.length || 0);
    return { todayLevel: lvl, wordCount: wc };
  }, [levels, dayOfYear]);

  if (!isDailyRushBriefingOpen) return null;

  const handleStart = () => {
    startDailyRush();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 select-none">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDailyRushBriefing}
          className="absolute inset-0 bg-black/65 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-[360px] max-h-[92vh] overflow-y-auto rounded-[30px] p-4 text-center flex flex-col gap-3 shadow-2xl z-10 border border-white/20 bg-[var(--bg-card)] text-[var(--text-primary)]"
        >
          {/* Top Specular Sheen Line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={closeDailyRushBriefing}
            aria-label="Tutup"
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full flex items-center justify-center liquid-glass-card border border-black/10 dark:border-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] tactile-active z-20"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Header Title with Mascot Pill */}
          <div className="flex flex-col items-center pt-1">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] text-[9px] font-black uppercase tracking-wider mb-1 border border-[var(--accent-main)]/20">
              <Zap className="w-3 h-3 stroke-[2.5]" />
              <span>TANTANGAN NASIONAL • 00:00 WIB</span>
            </div>
            <h3 className="text-[17px] font-black tracking-tight leading-tight">
              Daily Rush 90 Detik
            </h3>
            <p className="text-[10px] text-[var(--text-secondary)] leading-tight mt-0.5 capitalize">
              {formattedDate}
            </p>
          </div>

          {/* Hero Chapter Card with Mascot */}
          <div
            className="w-full rounded-[24px] p-3.5 relative overflow-hidden text-white text-left flex flex-col justify-between shadow-md"
            style={{
              background: 'var(--hero-grad, var(--accent-grad))',
            }}
          >
            <div className="absolute top-0 inset-x-0 h-px bg-white/30 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-[65%]">
              <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/25 inline-block mb-1">
                KISI SERAGAM HARI INI
              </span>
              <h4 className="text-[15px] font-black tracking-tight leading-tight mb-1 text-white">
                {todayLevel?.title || 'Edisi Nusantara'}
              </h4>
              <div className="flex items-center gap-2 text-[9.5px] font-bold text-white/90">
                <span className="flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>{wordCount} Kata</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>90 Detik</span>
                </span>
              </div>
            </div>

            {/* Reward Pill */}
            <div className="relative z-10 mt-3 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-[9px] font-bold text-white w-fit">
              <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>{todayPlayed ? 'Skor Tertinggi Diperbarui' : 'Hadiah Tuntas: +50 ★ Bintang'}</span>
            </div>

            {/* Mascot Overlay */}
            <img
              src={MASCOTS.indonesianPuzzleKid}
              alt="Mascot Daily Rush"
              className="absolute -bottom-2 -right-1 w-32 h-34 object-contain object-bottom pointer-events-none select-none z-0 filter drop-shadow-md"
            />
          </div>

          {/* Scoring Formula Bento (4 Factors) */}
          <div className="w-full rounded-[22px] p-3 liquid-glass-card border border-black/5 dark:border-white/10 flex flex-col gap-2 text-left">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-primary)]">
                Formula Poin Daily Rush
              </span>
              <span className="text-[8px] font-bold text-[var(--accent-main)]">Peringkat Nasional</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[9.5px]">
              <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col">
                <div className="flex items-center gap-1 text-[var(--text-secondary)] mb-0.5">
                  <Clock className="w-2.5 h-2.5 text-rose-500" />
                  <span className="font-bold">Kecepatan</span>
                </div>
                <span className="text-[12px] font-black text-rose-500 leading-none">+12 Pts</span>
                <span className="text-[7.5px] text-[var(--text-secondary)] mt-0.5">per detik sisa waktu</span>
              </div>

              <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col">
                <div className="flex items-center gap-1 text-[var(--text-secondary)] mb-0.5">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-500" />
                  <span className="font-bold">Akurasi</span>
                </div>
                <span className="text-[12px] font-black text-emerald-500 leading-none">+600 Pts</span>
                <span className="text-[7.5px] text-[var(--text-secondary)] mt-0.5">maksimal 100% akurat</span>
              </div>

              <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col">
                <div className="flex items-center gap-1 text-[var(--text-secondary)] mb-0.5">
                  <Flame className="w-2.5 h-2.5 text-amber-500" />
                  <span className="font-bold">Kombo Cepat</span>
                </div>
                <span className="text-[12px] font-black text-amber-500 leading-none">+25 Pts</span>
                <span className="text-[7.5px] text-[var(--text-secondary)] mt-0.5">per kata beruntun</span>
              </div>

              <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col">
                <div className="flex items-center gap-1 text-[var(--text-secondary)] mb-0.5">
                  <Trophy className="w-2.5 h-2.5 text-sky-500" />
                  <span className="font-bold">Papan Tuntas</span>
                </div>
                <span className="text-[12px] font-black text-sky-500 leading-none">+200 Pts</span>
                <span className="text-[7.5px] text-[var(--text-secondary)] mt-0.5">bonus pecah seluruh kata</span>
              </div>
            </div>
          </div>

          {/* Today's Existing Record Pill if played */}
          {todayPlayed && dailyRushRecord && (
            <div className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-left">
              <div>
                <span className="text-[8px] uppercase tracking-wider text-[var(--text-secondary)] font-bold block">
                  REKOR TERBAIK HARI INI
                </span>
                <span className="text-[13px] font-black text-[var(--accent-main)]">
                  {dailyRushRecord.score} Poin ({dailyRushRecord.timeSpent}s • {dailyRushRecord.accuracy}%)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[8px] font-black bg-[var(--accent-light)] text-[var(--accent-main)]">
                {dailyRushRecord.completed ? 'Selesai' : 'Tercatat'}
              </span>
            </div>
          )}

          {/* Start Button CTA */}
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-3 rounded-full text-white font-black text-[13px] tracking-wide shadow-lg cursor-pointer tactile-active flex items-center justify-center gap-2 hover:opacity-95"
            style={{ background: 'var(--hero-grad, var(--accent-grad))' }}
          >
            <Play className="w-3.5 h-3.5 fill-current stroke-[0]" />
            <span>{todayPlayed ? 'Mainkan Lagi (Perbaiki Skor)' : 'Mulai Tantangan Sekarang (90s)'}</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
