import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Flame, Zap, X } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { notificationService } from '../lib/notificationService';
import { MASCOTS } from '../assets/maskots';
import { soundManager } from '../lib/audio';
import { haptic } from '../lib/haptics';

export const NotificationPromptModal: React.FC = () => {
  const {
    isNotificationPromptOpen,
    closeNotificationPrompt,
    setNotificationsEnabled,
    streak,
    soundEnabled,
    hapticEnabled,
    showGlobalToast,
  } = useGameStore();

  if (!isNotificationPromptOpen) return null;

  const handleEnable = async () => {
    if (soundEnabled) soundManager.playReward();
    if (hapticEnabled) haptic.success([20, 40, 20]);

    const granted = await notificationService.requestPermission();
    if (granted) {
      setNotificationsEnabled(true);
      await notificationService.scheduleDailyRetention(streak);
      showGlobalToast('🔔 Pengingat aktif! Streak dan Daily Rush kamu aman.', 3000);
    } else {
      showGlobalToast('Izin notifikasi tidak diberikan.', 2500);
    }
    closeNotificationPrompt();
  };

  const handleDismiss = () => {
    if (soundEnabled) soundManager.playFocusTick();
    closeNotificationPrompt();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
        {/* Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          exit={{ opacity: 0 }}
          onClick={handleDismiss}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Card Content (Apple Liquid Glass) */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-[340px] rounded-[30px] p-5 text-center flex flex-col gap-3 shadow-2xl z-10 border border-black/5 dark:border-white/15 liquid-glass-card overflow-hidden"
        >
          {/* Top Specular Sheen Highlight */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Tutup"
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer z-20"
          >
            <X className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* Header with Mascot */}
          <div className="flex flex-col items-center mt-1">
            <div className="relative w-22 h-22 mb-1 flex items-center justify-center">
              <img
                src={MASCOTS.cheerfulBookBoy}
                alt="Pengingat Streak"
                className="w-full h-full object-contain filter drop-shadow-md animate-float"
              />
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/25 mb-1.5">
              <Bell className="w-3 h-3 text-[var(--accent-main)] fill-current" />
              <span className="text-[9.5px] font-black uppercase tracking-wider text-[var(--accent-main)]">
                Pengingat Cerdas
              </span>
            </div>

            <h2 className="text-[18px] font-black tracking-tight text-[var(--text-primary)] leading-tight">
              Jaga Api Streak-mu!
            </h2>
            <p className="text-[11.5px] text-[var(--text-secondary)] font-medium mt-1 leading-snug">
              Dapatkan pengingat sebelum streak {streak > 1 ? `${streak} hari` : ''} kamu hangus dan saat Daily Rush 90s dimulai.
            </p>
          </div>

          {/* Features Highlights */}
          <div className="flex flex-col gap-2 p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-left my-1">
            <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-primary)]">
              <Flame className="w-3.5 h-3.5 text-[var(--accent-main)] fill-current shrink-0" />
              <span>Peringatan darurat jam 21:00 jika belum main</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-[var(--text-primary)]">
              <Zap className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.5] shrink-0" />
              <span>Info tantangan kilat Daily Rush setiap pagi</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 mt-1">
            <button
              type="button"
              onClick={handleEnable}
              className="w-full py-3 rounded-2xl bg-[var(--accent-main)] text-[var(--accent-contrast)] font-black text-[13px] flex items-center justify-center gap-1.5 cursor-pointer tactile-active shadow-md hover:opacity-95 transition-opacity"
            >
              <Bell className="w-4 h-4 fill-current" />
              <span>Nyalakan Pengingat</span>
            </button>

            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2 text-[12px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Nanti Saja
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
