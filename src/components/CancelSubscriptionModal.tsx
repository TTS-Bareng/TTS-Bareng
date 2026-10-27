import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { revenueCatService } from '../lib/revenueCatService';
import { haptic } from '../lib/haptics';

export const CancelSubscriptionModal: React.FC = () => {
  const { isCancelSubModalOpen, closeCancelSubModal, hapticEnabled } = useGameStore();

  if (!isCancelSubModalOpen) return null;

  const handleOpenAppleSettings = () => {
    if (hapticEnabled) haptic.selection();
    revenueCatService.openAppleSubscriptionSettings();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          exit={{ opacity: 0 }}
          onClick={closeCancelSubModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-[360px] rounded-[28px] border border-[var(--border-card)] p-5 select-none shadow-2xl liquid-glass-card overflow-hidden text-[var(--text-primary)]"
        >
          {/* Top Specular Sheen */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={closeCancelSubModal}
            aria-label="Tutup"
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 transition-all cursor-pointer z-10"
          >
            <X className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* Header Icon */}
          <div className="text-center mb-3">
            <div className="w-12 h-12 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)] flex items-center justify-center mx-auto mb-2 shadow-xs">
              <ShieldCheck className="w-6 h-6 stroke-[2]" />
            </div>
            <h3 className="text-[16px] font-black tracking-tight">
              Kelola & Pembatalan Langganan
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
              Kebijakan resmi langganan App Store (Apple ID)
            </p>
          </div>

          {/* Policy Information Bento Box */}
          <div className="space-y-2 mb-4">
            <div className="rounded-[18px] p-3 border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)' }}
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[var(--accent-main)] shrink-0 mt-0.5 stroke-[2.2]" />
                <div className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                  <span className="font-bold text-[var(--text-primary)] block mb-0.5">
                    Hak Akses Anda Tetap Terjamin
                  </span>
                  Jika Anda membatalkan perpanjangan otomatis, status VIP Anda tetap aktif sepenuhnya hingga akhir periode langganan berjalan. Apple tidak akan menagihkan biaya untuk periode selanjutnya.
                </div>
              </div>
            </div>

            <div className="rounded-[18px] p-3 bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 text-[11px] text-[var(--text-secondary)]">
              <span className="font-bold text-[var(--text-primary)] block mb-1">
                Cara Membatalkan via Apple ID:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-[10.5px]">
                <li>Ketuk tombol di bawah untuk membuka Pengaturan Apple.</li>
                <li>Pilih <span className="font-bold text-[var(--text-primary)]">TTS Bareng</span>.</li>
                <li>Pilih <span className="font-bold text-[var(--text-primary)]">Batalkan Langganan</span>.</li>
              </ol>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleOpenAppleSettings}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-[12.5px] cursor-pointer tactile-active shadow-md flex items-center justify-center gap-2 border border-white/20 transition-all"
              style={{ background: 'var(--accent-grad)', color: 'var(--accent-contrast)' }}
            >
              <span>Buka Pengaturan Apple ID</span>
              <ExternalLink className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>

            <button
              type="button"
              onClick={closeCancelSubModal}
              className="w-full py-2 px-4 rounded-xl font-bold text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer text-center"
            >
              Kembali
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CancelSubscriptionModal;
