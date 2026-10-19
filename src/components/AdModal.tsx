import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Video, X, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';

export const AdModal: React.FC = () => {
  const { isAdModalOpen, closeAdModal, rewardAdWatch } = useGameStore();
  const [isWatching, setIsWatching] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const startSimulatedAd = () => {
    setIsWatching(true);
    setCountdown(3);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsWatching(false);
          rewardAdWatch();
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <AnimatePresence>
      {isAdModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            onClick={isWatching ? undefined : closeAdModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card (Apple Liquid Glass) */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 25 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-[325px] rounded-[30px] p-5 text-center select-none shadow-2xl z-10 border border-black/5 dark:border-white/15 liquid-glass-card overflow-hidden flex flex-col items-center gap-3"
          >
            {/* Top Specular Sheen Highlight */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* Close button (if not watching) */}
            {!isWatching && (
              <button
                type="button"
                onClick={closeAdModal}
                aria-label="Tutup"
                className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer z-20"
              >
                <X className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
            )}

            {/* Mascot Visual with Floating Stars Badge */}
            <div className="relative w-24 h-24 my-1 flex items-center justify-center">
              <img
                src={MASCOTS.cheerfulBookBoy}
                alt="Maskot Hadiah Bintang"
                className="w-full h-full object-contain filter drop-shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] border border-white/30 flex items-center gap-1 shadow-md">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10px] font-black">+30 ★</span>
              </div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)] mb-1">
                <Sparkles className="w-3 h-3" />
                <span>BANTUAN KATA</span>
              </div>
              <h3 className="text-[17px] font-black tracking-tight text-[var(--text-primary)] leading-tight">
                Tabungan Bintang Habis
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1 leading-snug px-1">
                Anda memerlukan minimal 10 ★ untuk membuka petunjuk huruf di papan kata.
              </p>
            </div>

            {/* Simulated Video Ad watching */}
            <div className="w-full">
              {isWatching ? (
                <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-main)] border-t-transparent animate-spin" />
                  <span className="text-[12.5px] font-black text-[var(--text-primary)]">
                    Menonton Tayangan... ({countdown}s)
                  </span>
                  <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                    Bintang akan otomatis ditambahkan ke akun
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={startSimulatedAd}
                  className="w-full h-11 rounded-full font-bold text-[13px] text-[var(--accent-contrast)] flex items-center justify-center gap-2 cursor-pointer tactile-active shadow-sm transition-transform border border-white/20"
                  style={{ background: 'var(--accent-grad)' }}
                >
                  <Video className="w-4 h-4 stroke-[2.2]" />
                  <span>Tonton Tayangan (+30 ★)</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AdModal;
