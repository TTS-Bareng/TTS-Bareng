import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Star, PenTool, Check, Crown, Flame, RefreshCw } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';
import { revenueCatService } from '../lib/revenueCatService';

export const SachetOfferModal: React.FC = () => {
  const {
    isSachetModalOpen,
    closeSachetModal,
    purchaseSachetPack,
    openCustomCrosswordModal,
    openLegalModal,
    showGlobalToast,
    isVip,
    setIsVip,
  } = useGameStore();

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isSachetModalOpen) return null;

  const handlePurchase = async () => {
    try {
      setIsProcessing(true);
      const result = await revenueCatService.purchaseSachetStarter();

      if (result.success) {
        purchaseSachetPack();
        if (result.entitlementUnlocked) {
          setIsVip(true);
        }
      } else if (result.cancelled) {
        showGlobalToast('Pembelian dibatalkan.');
      } else if (result.error) {
        showGlobalToast(result.error);
      }
    } catch (err: any) {
      showGlobalToast(err?.message || 'Gagal memproses transaksi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    try {
      setIsProcessing(true);
      const res = await revenueCatService.restorePurchases();
      if (res.isVip) {
        setIsVip(true);
        showGlobalToast('✨ Status VIP Anda berhasil dipulihkan dari Apple ID!', 4000);
      } else if (res.success) {
        showGlobalToast('Tidak ada langganan aktif yang ditemukan di Apple ID ini.', 3500);
      } else {
        showGlobalToast(res.error || 'Gagal memulihkan pembelian.', 3500);
      }
    } catch {
      showGlobalToast('Gagal memulihkan pembelian.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpgradeVip = () => {
    closeSachetModal();
    openCustomCrosswordModal();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          exit={{ opacity: 0 }}
          onClick={closeSachetModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Card Content (Apple Liquid Glass) */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-[340px] max-h-[92vh] rounded-[32px] p-5 flex flex-col items-center gap-3.5 shadow-2xl z-10 border border-amber-500/25 liquid-glass-card overflow-hidden text-center"
        >
          {/* Top Specular Sheen Highlight */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300/60 to-transparent pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-amber-400/15 blur-2xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={closeSachetModal}
            aria-label="Tutup"
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer"
          >
            <X className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* Mascot / Icon Badge */}
          <div className="relative w-20 h-20 mt-1 flex items-center justify-center shrink-0">
            <motion.img
              initial={{ y: 6, scale: 0.92 }}
              animate={{ y: [0, -4, 0], scale: 1 }}
              transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
              src={MASCOTS.crosswordChampion}
              alt="Paket Pemula"
              className="w-full h-full object-contain filter drop-shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black font-black text-[9px] px-2 py-0.5 rounded-full shadow-md flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5 fill-black" />
              <span>HEMAT 75%</span>
            </div>
          </div>

          {/* Title & Tagline */}
          <div className="flex flex-col items-center">
            <span className="text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              PAKET SACHET PEMULA
            </span>
            <h3 className="text-[19px] font-black tracking-tight text-[var(--text-primary)] mt-1.5 leading-tight">
              Starter Pack Pejuang Kata
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-snug px-1">
              Dukungan instan untuk menjaga streak dan kreasi teka-teki pertamamu!
            </p>
          </div>

          {/* Benefits Bento Box */}
          <div className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 p-3 flex flex-col gap-2 text-left">
            {/* Benefit 1: Stars */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-500 flex items-center justify-center shrink-0 border border-amber-400/30">
                <Star className="w-4 h-4 fill-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11.5px] font-black text-[var(--text-primary)] block leading-tight">
                  +150 Bintang
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] leading-tight">
                  Untuk buka bantuan petak & tebak kata darurat
                </span>
              </div>
              <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
            </div>

            {/* Benefit 2: Streak Shields */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0 border border-rose-500/30">
                <Flame className="w-4 h-4 fill-rose-500" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11.5px] font-black text-[var(--text-primary)] block leading-tight">
                  3x Pelindung Streak
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] leading-tight">
                  Otomatis melindungi rentetan hari bila kamu lupa bermain
                </span>
              </div>
              <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
            </div>

            {/* Benefit 3: Custom Crossword Ticket */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0 border border-indigo-500/30">
                <PenTool className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11.5px] font-black text-[var(--text-primary)] block leading-tight">
                  1x Tiket Bikin TTS Custom
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] leading-tight">
                  Bikin TTS unik sendiri & tantang teman-temanmu
                </span>
              </div>
              <Check className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
            </div>
          </div>

          {/* Pricing & CTA Button */}
          <div className="w-full flex flex-col gap-2 mt-0.5">
            <button
              type="button"
              disabled={isProcessing}
              onClick={handlePurchase}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black text-[13px] cursor-pointer tactile-active shadow-lg shadow-amber-500/25 flex items-center justify-between border border-amber-300/40 disabled:opacity-50 transition-opacity"
            >
              <div className="flex items-center gap-1.5">
                {isProcessing ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <Sparkles className="w-4 h-4 fill-black" />
                )}
                <span>{isProcessing ? 'Memproses Transaksi...' : 'Beli Paket Pemula'}</span>
              </div>
              <div className="px-2 py-0.5 rounded-lg bg-black/20 text-black font-mono font-black text-[12px]">
                Rp 5.000
              </div>
            </button>

            {/* VIP Pass Upsell Link */}
            {!isVip && (
              <button
                type="button"
                onClick={handleUpgradeVip}
                className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--accent-main)] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
              >
                <Crown className="w-3 h-3 text-amber-500" />
                <span>Ingin bikin TTS sepuasnya tanpa batas? Cek TTS Pass VIP</span>
              </button>
            )}

            {/* Apple Guideline 3.1.1 Mandatory Compliance Links */}
            <div className="flex items-center justify-center gap-2 pt-1 border-t border-black/5 dark:border-white/5 text-[9px] text-[var(--text-secondary)]">
              <button
                type="button"
                onClick={handleRestore}
                disabled={isProcessing}
                className="hover:underline hover:text-[var(--text-primary)] cursor-pointer"
              >
                Pulihkan Pembelian
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegalModal('terms')}
                className="hover:underline hover:text-[var(--text-primary)] cursor-pointer"
              >
                EULA / Ketentuan
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => openLegalModal('privacy')}
                className="hover:underline hover:text-[var(--text-primary)] cursor-pointer"
              >
                Privasi
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
