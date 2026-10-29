import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Lock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { soundManager } from '../lib/audio';
import { haptic } from '../lib/haptics';

const AppleLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.4c.64-.81 1.07-1.93.95-3.05-1 .04-2.18.66-2.82 1.41-.57.66-1.06 1.76-.93 2.85 1.12.09 2.23-.55 2.8-1.21Z" />
  </svg>
);

export const StoreKitSandboxModal: React.FC = () => {
  const {
    isStoreKitModalOpen,
    storeKitModalData,
    closeStoreKitModal,
    user,
  } = useGameStore();

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isStoreKitModalOpen || !storeKitModalData) {
    return null;
  }

  const {
    productTitle,
    productPrice,
    productPeriod,
    onSuccess,
    onCancel,
  } = storeKitModalData;

  const handleConfirmPurchase = () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const { soundEnabled, hapticEnabled } = useGameStore.getState();
    if (soundEnabled) soundManager.playKeyClick();
    if (hapticEnabled) haptic.selection();

    // Simulate StoreKit sandbox receipt verification delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      if (soundEnabled) soundManager.playVictory();
      if (hapticEnabled) haptic.success([40, 80, 50]);

      setTimeout(() => {
        setIsSuccess(false);
        closeStoreKitModal();
        onSuccess();
      }, 700);
    }, 1400);
  };

  const handleCancelPurchase = () => {
    if (isProcessing) return;
    const { soundEnabled, hapticEnabled } = useGameStore.getState();
    if (soundEnabled) soundManager.playKeyClick();
    if (hapticEnabled) haptic.selection();
    setIsProcessing(false);
    setIsSuccess(false);
    closeStoreKitModal();
    onCancel();
  };

  const accountEmail = user?.email && user.email.includes('@')
    ? user.email
    : 'sandbox.tester@apple.id';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 select-none">
        {/* Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          exit={{ opacity: 0 }}
          onClick={handleCancelPurchase}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Apple StoreKit 2 Native Style Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-[430px] rounded-t-[32px] sm:rounded-[32px] bg-[#1C1C1E] text-white p-5 pt-4 pb-[max(1.5rem,calc(1rem+env(safe-area-inset-bottom)))] flex flex-col gap-3.5 shadow-2xl border-t sm:border border-white/10 z-10 overflow-hidden font-sans"
        >
          {/* Top Handle Pill */}
          <div className="w-full flex justify-center pb-1">
            <div className="w-10 h-1.5 rounded-full bg-white/20" />
          </div>

          {/* Header Row: Apple StoreKit Sandbox Badge */}
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/30 flex items-center justify-center text-[var(--accent-main)]">
                <AppleLogoIcon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-black tracking-tight text-white">App Store</span>
                  <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/30">
                    StoreKit 2 Sandbox
                  </span>
                </div>
                <span className="text-[9.5px] text-white/50">Lingkungan Uji Coba Pengembang</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleCancelPurchase}
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* App & Product Identity Pod */}
          <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08]">
            <img
              src="/logo-dark.webp"
              alt="TTS Bareng"
              className="w-12 h-12 rounded-xl object-contain bg-black/40 border border-white/10 p-1 shrink-0 shadow-md"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-medium text-white/60 truncate">TTS Bareng • Teka Teki Silang</span>
              <span className="text-[14px] font-black text-white leading-tight truncate">
                {productTitle}
              </span>
              <span className="text-[10px] text-[var(--accent-main)] font-semibold mt-0.5">
                Syntheticae Studio (In-App Purchase)
              </span>
            </div>
          </div>

          {/* Pricing & Subscription Terms Box */}
          <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-black/40 border border-white/10">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-white/70 font-medium">Biaya Tagihan:</span>
              <div className="flex items-baseline gap-1 text-right">
                <span className="text-[17px] font-black font-mono text-white tracking-tight">
                  {productPrice}
                </span>
                {productPeriod && (
                  <span className="text-[11px] text-white/60 font-medium">
                    {productPeriod}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px]">
              <span className="text-white/50">Akun Sandbox Apple ID:</span>
              <span className="font-mono text-white/80 font-bold truncate max-w-[200px]">
                {accountEmail}
              </span>
            </div>

            <div className="flex items-start gap-1.5 pt-1 text-[8.5px] text-white/40 leading-relaxed">
              <Lock className="w-3 h-3 text-[var(--accent-main)] shrink-0 mt-0.5" />
              <span>
                Pembayaran ditagihkan ke Akun Apple ID Sandbox. Tidak ada uang riil yang dipotong selama pengujian.
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-1">
            <button
              type="button"
              disabled={isProcessing || isSuccess}
              onClick={handleConfirmPurchase}
              className={`w-full h-12 rounded-2xl font-black text-[13px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                isSuccess
                  ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)]'
                  : 'bg-[var(--accent-main)] hover:opacity-90 active:scale-98 text-[var(--accent-contrast)]'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi dengan StoreKit 2...</span>
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Pembelian Berhasil Disetujui!</span>
                </>
              ) : (
                <>
                  <AppleLogoIcon className="w-4 h-4" />
                  <span>Konfirmasi Pembelian Sandbox</span>
                </>
              )}
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleCancelPurchase}
              className="w-full py-2.5 rounded-xl text-[11px] font-bold text-white/60 hover:text-white/90 hover:bg-white/5 transition-colors cursor-pointer text-center"
            >
              Batalkan Transaksi
            </button>
          </div>

          {/* Native Disclaimer Pill */}
          <div className="flex items-center justify-center gap-1.5 pt-1 text-[8px] text-white/35 text-center leading-tight">
            <AlertCircle className="w-2.5 h-2.5 shrink-0" />
            <span>
              Simulasi Web Sandbox. Pada perangkat iPhone, lembar ini otomatis dijalankan langsung oleh iOS StoreKit 2 Face ID.
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StoreKitSandboxModal;
