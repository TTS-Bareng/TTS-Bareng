import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Flame, X, Sparkles, Plus } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';

export const StreakSavedModal: React.FC = () => {
  const {
    isStreakSavedModalOpen,
    closeStreakSavedModal,
    streak,
    streakShields,
    buyStreakShield,
    stars,
  } = useGameStore();

  if (!isStreakSavedModalOpen) return null;

  const handleBuyShield = () => {
    const success = buyStreakShield();
    if (success) {
      closeStreakSavedModal();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 select-none">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeStreakSavedModal}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-[390px] rounded-[30px] p-5 liquid-glass-card border border-[var(--accent-main)]/30 shadow-2xl flex flex-col items-center text-center overflow-hidden z-10"
          style={{
            background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-surface) 100%)',
          }}
        >
          {/* Top edge specular highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={closeStreakSavedModal}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 dark:bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/20 transition-all cursor-pointer tactile-active z-20"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Mascot / Shield Visual Presentation */}
          <div className="relative mt-2 mb-3">
            <div className="w-20 h-20 rounded-[24px] bg-[var(--accent-light)] border-2 border-[var(--accent-main)]/40 flex items-center justify-center text-[var(--accent-main)] shadow-xl relative z-10">
              <Shield className="w-10 h-10 fill-[var(--accent-main)]/20 stroke-[2.2]" />
            </div>

            {/* Mascot Peek on the side */}
            <img
              src={MASCOTS.crosswordChampion}
              alt="Mascot Penyelamat Streak"
              className="absolute -right-12 -bottom-2 w-20 h-20 object-contain pointer-events-none select-none filter drop-shadow-md z-20"
            />
          </div>

          {/* Pill Badge */}
          <span className="px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[10px] font-black text-[var(--accent-main)] uppercase tracking-wider mb-2 inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" />
            <span>Perisai Runtun Terpakai</span>
          </span>

          {/* Title */}
          <h2 className="text-xl font-black text-[var(--text-primary)] tracking-tight leading-snug">
            Streak {streak} Hari<br />Berhasil Diselamatkan!
          </h2>

          <p className="text-[11.5px] text-[var(--text-secondary)] mt-2 max-w-[290px] leading-relaxed">
            Kemarin kamu berhalangan bermain. 1 Perisai Runtun telah otomatis digunakan untuk menjaga api semangatmu tetap menyala.
          </p>

          {/* Bento Status Card */}
          <div className="w-full rounded-[20px] p-3.5 my-4 bg-white/5 border border-white/10 flex items-center justify-around">
            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">
                Streak Terjaga
              </span>
              <div className="flex items-center gap-1 text-[var(--accent-main)] font-black text-sm">
                <Flame className="w-4 h-4 fill-current" />
                <span>{streak} Hari</span>
              </div>
            </div>

            <div className="h-7 w-px bg-white/10" />

            <div className="flex flex-col items-center">
              <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-0.5">
                Sisa Perisai
              </span>
              <div className="flex items-center gap-1 text-[var(--text-primary)] font-black text-sm">
                <Shield className="w-4 h-4 text-[var(--text-secondary)]" />
                <span>{streakShields} / 2 Slot</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2 relative z-10">
            {streakShields < 2 && (
              <button
                type="button"
                onClick={handleBuyShield}
                disabled={stars < 100}
                className="w-full py-3 px-4 rounded-full font-black text-xs inline-flex items-center justify-center gap-2 transition-all tactile-active shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--accent-grad)',
                  color: 'var(--accent-contrast)',
                }}
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Isi Ulang Perisai (100★)</span>
              </button>
            )}

            <button
              type="button"
              onClick={closeStreakSavedModal}
              className="w-full py-2.5 px-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-[var(--text-primary)] font-black text-xs transition-all tactile-active cursor-pointer"
            >
              Lanjut Bermain
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
