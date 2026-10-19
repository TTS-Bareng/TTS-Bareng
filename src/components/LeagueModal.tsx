import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Award,
  Crown,
  Zap,
  Sparkles,
  X,
  Check,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';

interface LeagueTierDef {
  id: string;
  name: string;
  subtitle: string;
  minXp: number;
  icon: React.FC<{ className?: string }>;
  color: string;
  badgeBg: string;
}

const LEAGUE_TIERS: LeagueTierDef[] = [
  {
    id: 'diamond',
    name: 'Divisi Berlian',
    subtitle: 'Legenda Kata Tertinggi',
    minXp: 5000,
    icon: Crown,
    color: '#38BDF8',
    badgeBg: 'rgba(56, 189, 248, 0.15)',
  },
  {
    id: 'sapphire',
    name: 'Divisi Safir',
    subtitle: 'Mahaguru Silang Kata',
    minXp: 3000,
    icon: Sparkles,
    color: '#60A5FA',
    badgeBg: 'rgba(96, 165, 250, 0.15)',
  },
  {
    id: 'gold',
    name: 'Divisi Emas',
    subtitle: 'Cendekiawan Bahasa',
    minXp: 1500,
    icon: Trophy,
    color: '#FBBF24',
    badgeBg: 'rgba(251, 191, 36, 0.15)',
  },
  {
    id: 'silver',
    name: 'Divisi Perak',
    subtitle: 'Penjelajah Tangguh',
    minXp: 500,
    icon: Award,
    color: '#CBD5E1',
    badgeBg: 'rgba(203, 213, 225, 0.15)',
  },
  {
    id: 'bronze',
    name: 'Divisi Perunggu',
    subtitle: 'Langkah Awal Penantang',
    minXp: 0,
    icon: Zap,
    color: '#F97316',
    badgeBg: 'rgba(249, 115, 22, 0.15)',
  },
];

function computeLeagueTimeLeft(): string {
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday
  const daysUntilMonday = ((8 - day) % 7) || 7;
  const targetMonday = new Date(now);
  targetMonday.setDate(now.getDate() + daysUntilMonday);
  targetMonday.setHours(0, 0, 0, 0);

  const diffMs = targetMonday.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  return `${diffDays} hari ${diffHours} jam`;
}

export const LeagueModal: React.FC = () => {
  const {
    isLeagueModalOpen,
    closeLeagueModal,
    weeklyLeagueXp,
    weeklyLeagueWeekKey,
  } = useGameStore();

  const currentTier = useMemo(() => {
    return LEAGUE_TIERS.find((t) => weeklyLeagueXp >= t.minXp) || LEAGUE_TIERS[LEAGUE_TIERS.length - 1];
  }, [weeklyLeagueXp]);

  const nextTier = useMemo(() => {
    const curIdx = LEAGUE_TIERS.findIndex((t) => t.id === currentTier.id);
    if (curIdx > 0) return LEAGUE_TIERS[curIdx - 1];
    return null;
  }, [currentTier]);

  const progressPercent = useMemo(() => {
    if (!nextTier) return 100;
    const range = nextTier.minXp - currentTier.minXp;
    const progress = weeklyLeagueXp - currentTier.minXp;
    return Math.min(100, Math.max(8, Math.round((progress / range) * 100)));
  }, [weeklyLeagueXp, currentTier, nextTier]);

  const timeLeft = useMemo(() => computeLeagueTimeLeft(), []);

  if (!isLeagueModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeLeagueModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-[400px] max-h-[90vh] rounded-[30px] p-5 liquid-glass-card border border-black/10 dark:border-white/15 shadow-2xl flex flex-col overflow-hidden z-10"
        >
          {/* Top specular highlight */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs"
                style={{ backgroundColor: currentTier.badgeBg, color: currentTier.color }}
              >
                <currentTier.icon className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-[var(--text-primary)] leading-none">
                  {currentTier.name}
                </h3>
                <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                  Musim Mingguan {weeklyLeagueWeekKey}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeLeagueModal}
              className="w-7.5 h-7.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer tactile-active"
              aria-label="Tutup"
            >
              <X className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
            {/* Current Standing Hero Bento */}
            <div
              className="rounded-[22px] p-4 relative overflow-hidden border border-white/15 shadow-sm"
              style={{
                background: 'var(--accent-grad)',
                color: 'var(--accent-contrast)',
              }}
            >
              <div className="flex items-center justify-between mb-2 relative z-10">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/25">
                  Posisi Kamu Saat Ini
                </span>
                <span className="text-xs font-black">
                  {weeklyLeagueXp.toLocaleString('id-ID')} Poin Liga
                </span>
              </div>

              <div className="flex items-center justify-between relative z-10">
                <div>
                  <h4 className="text-base font-black leading-tight">
                    {currentTier.name}
                  </h4>
                  <p className="text-[10.5px] opacity-90 leading-tight">
                    {nextTier
                      ? `Kurang ${(nextTier.minXp - weeklyLeagueXp).toLocaleString('id-ID')} Poin lagi untuk promosi ke ${nextTier.name}.`
                      : 'Kamu berada di puncak divisi tertinggi!'}
                  </p>
                </div>
              </div>

              {/* Progress Bar to Next Tier */}
              {nextTier && (
                <div className="mt-3 relative z-10">
                  <div className="w-full h-2 rounded-full bg-black/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-white transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold mt-1 opacity-80">
                    <span>{currentTier.name} ({currentTier.minXp})</span>
                    <span>{nextTier.name} ({nextTier.minXp})</span>
                  </div>
                </div>
              )}

              {/* Decorative Mascot Illustration */}
              <img
                src={MASCOTS.crosswordChampion}
                alt="Maskot Liga"
                className="absolute -right-3 -bottom-5 w-24 h-24 object-contain opacity-25 pointer-events-none select-none"
              />
            </div>

            {/* League Ladder Tiers */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider block">
                Jenjang Tangga 5 Divisi
              </span>

              {LEAGUE_TIERS.map((tier) => {
                const isCurrent = tier.id === currentTier.id;
                const TierIcon = tier.icon;
                return (
                  <div
                    key={tier.id}
                    className={`rounded-[18px] p-3 border transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-[var(--accent-light)] border-[var(--accent-main)]/40 shadow-xs'
                        : 'bg-white/5 border-white/10 opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: tier.badgeBg, color: tier.color }}
                      >
                        <TierIcon className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-black text-[var(--text-primary)]">
                            {tier.name}
                          </h5>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[8px] font-black">
                              AKTIF
                            </span>
                          )}
                        </div>
                        <span className="text-[9.5px] text-[var(--text-secondary)]">
                          {tier.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-black text-[var(--text-primary)] block">
                        {tier.minXp === 0 ? '0+' : `${tier.minXp.toLocaleString('id-ID')}+`}
                      </span>
                      <span className="text-[8px] text-[var(--text-secondary)] uppercase">
                        Poin
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* How to Earn League Points Bento */}
            <div className="rounded-[20px] p-3.5 bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 space-y-2">
              <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-wider block">
                Cara Mengumpulkan Poin Liga:
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                  <Flame className="w-3.5 h-3.5 text-[var(--accent-main)] mx-auto mb-1" />
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] block">Daily Rush</span>
                  <span className="text-[10.5px] font-black text-[var(--text-primary)]">+Skor Pts</span>
                </div>
                <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                  <Check className="w-3.5 h-3.5 text-[var(--accent-main)] mx-auto mb-1" />
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] block">Bab Solo</span>
                  <span className="text-[10.5px] font-black text-[var(--text-primary)]">+50 Pts</span>
                </div>
                <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                  <Trophy className="w-3.5 h-3.5 text-[var(--accent-main)] mx-auto mb-1" />
                  <span className="text-[9px] font-bold text-[var(--text-secondary)] block">Mabar & 1v1</span>
                  <span className="text-[10.5px] font-black text-[var(--text-primary)]">+100 Pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bar with Countdown */}
          <div className="pt-3 border-t border-black/5 dark:border-white/10 flex items-center justify-between shrink-0">
            <div>
              <span className="text-[9px] text-[var(--text-secondary)] block">
                Reset Mingguan Dalam:
              </span>
              <span className="text-xs font-black text-[var(--text-primary)]">
                {timeLeft}
              </span>
            </div>

            <button
              type="button"
              onClick={closeLeagueModal}
              className="py-2 px-4 rounded-full font-black text-xs inline-flex items-center gap-1.5 transition-all tactile-active cursor-pointer shadow-sm"
              style={{
                background: 'var(--accent-grad)',
                color: 'var(--accent-contrast)',
              }}
            >
              <span>Mengerti</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
