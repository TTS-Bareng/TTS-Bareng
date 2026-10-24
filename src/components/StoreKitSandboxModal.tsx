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
  <svg className={className} viewBox="0 0 170 170" fill="currentColor">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.98-5.77-8.91-10.37-18.99-13.8-30.24-3.43-11.25-5.15-22.13-5.15-32.63 0-14.7 3.73-26.79 11.19-36.26 7.46-9.47 16.7-14.3 27.72-14.5 4.9.12 10.45 1.45 16.66 3.99 6.2 2.54 10.15 3.86 11.83 3.97 1.85-.11 5.99-1.48 12.42-4.1 6.43-2.63 12.08-3.83 16.96-3.6 12.63.74 22.84 5.37 30.63 13.88-11.09 6.74-16.51 16.03-16.27 27.87.24 9.4 3.84 17.26 10.8 23.58 6.96 6.32 15.22 10.01 24.78 11.08-2.35 7.18-5.12 14.35-8.31 21.51zM119.22 31.84c0-7.39 2.65-14.28 7.95-20.68 5.3-6.4 11.84-10.45 19.62-12.16.21 1.28.32 2.45.32 3.5 0 7.39-2.82 14.38-8.47 20.97-5.64 6.58-12.28 10.51-19.92 11.78-.32-1.16-.49-2.3-.49-3.41z" />
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
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                <AppleLogoIcon className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-black tracking-tight text-white">App Store</span>
                  <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/25 text-blue-300 border border-blue-400/30">
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
              <span className="text-[10px] text-sky-400 font-semibold mt-0.5">
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
              <Lock className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
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
                  ? 'bg-emerald-500 text-white'
                  : 'bg-blue-600 hover:bg-blue-500 active:scale-98 text-white'
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
