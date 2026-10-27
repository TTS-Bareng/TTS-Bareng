import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Star, X, Check, Share2, Sparkles, Trophy, Brain, Flame } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { shareOrCopy, getBaseOrigin } from '../lib/deeplink';

const ACHIEVEMENT_ICONS: Record<string, React.ElementType> = {
  first_step: Sparkles,
  level_master: Trophy,
  word_scholar: Brain,
  star_hoarder: Star,
  streak_warrior: Flame,
  grandmaster: Award,
};

export const AchievementDetailModal: React.FC = () => {
  const {
    isAchievementModalOpen,
    closeAchievementDetail,
    selectedAchievement,
    claimedAchievementRewards,
    claimAchievementReward,
  } = useGameStore();

  if (!isAchievementModalOpen || !selectedAchievement) return null;

  const isClaimed = !!claimedAchievementRewards[selectedAchievement.id];
  const canClaim = selectedAchievement.unlocked && !isClaimed;

  const handleClaim = () => {
    claimAchievementReward(selectedAchievement.id);
  };

  const handleShare = () => {
    shareOrCopy({
      title: `Lencana Prestasi TTS Bareng: ${selectedAchievement.title}`,
      text: `Saya telah meraih lencana kehormatan "${selectedAchievement.title}" (${selectedAchievement.rarity}) di TTS Bareng! Bisakah kamu melampaui pencapaian ini?`,
      url: getBaseOrigin(),
    });
  };

  const rarityColor = {
    Umum: '#94A3B8',
    Langka: '#38BDF8',
    Epik: '#A855F7',
    Legendaris: '#F59E0B',
  }[selectedAchievement.rarity] || '#F59E0B';

  const BadgeIcon = ACHIEVEMENT_ICONS[selectedAchievement.id] || Award;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAchievementDetail}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window Container (Apple Liquid Glass) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-[360px] rounded-[30px] p-5.5 liquid-glass-card border border-black/10 dark:border-white/15 shadow-2xl flex flex-col items-center text-center overflow-hidden z-10"
        >
          {/* Top specular highlight */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={closeAchievementDetail}
            className="absolute top-4 right-4 w-7.5 h-7.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer tactile-active z-20"
            aria-label="Tutup"
          >
            <X className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* Badge Icon Display */}
          <div className="relative mt-2 mb-3">
            <div
              className="w-20 h-20 rounded-[24px] flex items-center justify-center shadow-lg relative z-10"
              style={{
                backgroundColor: `${rarityColor}18`,
                borderColor: `${rarityColor}40`,
                borderWidth: 2,
                color: rarityColor,
              }}
            >
              <BadgeIcon className="w-10 h-10 stroke-[2.2]" />
            </div>

            {/* Rarity Pill */}
            <div
              className="absolute -bottom-2 inset-x-0 mx-auto w-fit px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-sm z-20"
              style={{
                backgroundColor: rarityColor,
                color: '#FFFFFF',
              }}
            >
              {selectedAchievement.rarity}
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="text-[18px] font-black text-[var(--text-primary)] tracking-tight leading-tight mt-1">
            {selectedAchievement.title}
          </h3>

          <p className="text-[12px] text-[var(--text-secondary)] mt-1.5 max-w-[290px] leading-relaxed font-medium">
            {selectedAchievement.desc}
          </p>

          {/* Progress Box */}
          <div className="w-full rounded-[22px] p-3.5 my-3 bg-black/[0.03] dark:bg-white/[0.05] border border-black/5 dark:border-white/10 text-left">
            <div className="flex items-center justify-between text-[11px] font-bold mb-1.5">
              <span className="text-[var(--text-secondary)]">Status Progres</span>
              <span className={selectedAchievement.unlocked ? 'text-[var(--accent-main)]' : 'text-[var(--text-primary)]'}>
                {selectedAchievement.unlocked ? 'Telah Terbuka ✓' : selectedAchievement.progress}
              </span>
            </div>

            <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-[var(--accent-main)]"
                style={{ width: `${selectedAchievement.percent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[9.5px] text-[var(--text-secondary)] mt-1.5 font-medium">
              <span>Hadiah: +25 Bintang (★)</span>
              <span>{selectedAchievement.percent}% Tercapai</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="w-full flex flex-col gap-2 relative z-10">
            {canClaim ? (
              <button
                type="button"
                onClick={handleClaim}
                className="w-full py-3 px-4 rounded-full bg-[var(--accent-main)] hover:opacity-95 text-[var(--accent-contrast)] font-black text-[12.5px] inline-flex items-center justify-center gap-2 transition-all tactile-active shadow-md cursor-pointer"
              >
                <Star className="w-4 h-4 fill-current" />
                <span>Klaim Hadiah (+25★)</span>
              </button>
            ) : isClaimed ? (
              <div className="w-full py-2.5 px-4 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] font-bold text-[12px] inline-flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Hadiah +25★ Telah Diklaim</span>
              </div>
            ) : (
              <div className="w-full py-2.5 px-4 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[var(--text-secondary)] font-bold text-[11.5px] inline-flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                <span>Selesaikan Syarat untuk Membuka</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 mt-0.5">
              <button
                type="button"
                onClick={handleShare}
                className="py-2.5 px-3 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 text-[var(--text-primary)] font-bold text-[12px] inline-flex items-center justify-center gap-1.5 transition-all tactile-active cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Bagikan</span>
              </button>

              <button
                type="button"
                onClick={closeAchievementDetail}
                className="py-2.5 px-3 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/10 text-[var(--text-primary)] font-bold text-[12px] inline-flex items-center justify-center transition-all tactile-active cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
