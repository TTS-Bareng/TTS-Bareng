import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Crown,
  Sparkles,
  Check,
  Shield,
  Ban,
  RefreshCw,
  PenTool,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';
import { revenueCatService } from '../lib/revenueCatService';
import { soundManager } from '../lib/audio';
import { haptic } from '../lib/haptics';

export const VipSubscriptionModal: React.FC = () => {
  const {
    isVipModalOpen,
    closeVipModal,
    isVip,
    setIsVip,
    openLegalModal,
    openSachetModal,
    showGlobalToast,
    soundEnabled,
    hapticEnabled,
  } = useGameStore();

  const [isProcessing, setIsProcessing] = useState(false);

  if (!isVipModalOpen) return null;

  const handlePurchaseVip = async () => {
    try {
      setIsProcessing(true);
      const res = await revenueCatService.purchaseVipMonthly();

      if (res.success || res.entitlementUnlocked) {
        setIsVip(true);
        if (soundEnabled) soundManager.playVictory();
        if (hapticEnabled) haptic.success([40, 80, 50]);
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        showGlobalToast('👑 Selamat! Akses TTS Pass VIP Berhasil Diaktifkan!', 4500);
        closeVipModal();
      } else if (res.cancelled) {
        showGlobalToast('Langganan dibatalkan.');
      } else if (res.error) {
        showGlobalToast(res.error);
      }
    } catch (err: any) {
      showGlobalToast(err?.message || 'Gagal memproses langganan VIP.');
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
        if (soundEnabled) soundManager.playVictory();
        if (hapticEnabled) haptic.success([30, 60, 40]);
        showGlobalToast('✨ Status Langganan VIP berhasil dipulihkan dari Apple ID!', 4000);
        closeVipModal();
      } else if (res.success) {
        showGlobalToast('Tidak ada langganan aktif yang ditemukan pada akun Apple ID ini.', 3500);
      } else {
        showGlobalToast(res.error || 'Gagal memulihkan pembelian.', 3500);
      }
    } catch {
      showGlobalToast('Gagal memulihkan pembelian.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSwitchToSachet = () => {
    closeVipModal();
    openSachetModal();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          exit={{ opacity: 0 }}
          onClick={closeVipModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Card (Pure Liquid Glass - Adaptive to Active Theme) */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-[370px] max-h-[92vh] rounded-[32px] p-5 flex flex-col items-center gap-3.5 shadow-2xl z-10 border border-black/10 dark:border-white/15 liquid-glass-card overflow-hidden text-center"
        >
          {/* Top Specular Sheen */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-[var(--accent-light)] blur-3xl pointer-events-none opacity-60" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-[var(--accent-main)]/10 blur-3xl pointer-events-none opacity-40" />

          {/* Close Button */}
          <button
            type="button"
            onClick={closeVipModal}
            aria-label="Tutup"
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer z-20"
          >
            <X className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* Mascot with Theme Crown */}
          <div className="relative w-22 h-22 mt-1 flex items-center justify-center shrink-0">
            <motion.img
              initial={{ y: 6, scale: 0.92 }}
              animate={{ y: [0, -4, 0], scale: 1 }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              src={MASCOTS.crosswordChampion}
              alt="TTS Pass VIP Champion"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
            {/* Animated Crown Badge matching Theme */}
            <motion.div
              animate={{ rotate: [-4, 4, -4], y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="absolute -top-2 -right-1 w-8 h-8 rounded-full shadow-md border border-white/20 flex items-center justify-center"
              style={{ background: 'var(--accent-grad)', color: 'var(--accent-contrast)' }}
            >
              <Crown className="w-4 h-4 fill-current stroke-current" />
            </motion.div>
          </div>

          {/* Header & Title */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/20 flex items-center gap-1 shadow-2xs">
              <Sparkles className="w-3 h-3 fill-current" />
              <span>PASPOR ANGGOTA EKSKLUSIF</span>
            </span>
            <h3 className="text-[20px] font-black tracking-tight text-[var(--text-primary)] mt-1.5 leading-tight">
              TTS Bareng VIP Pass
            </h3>
            <p className="text-[11.5px] text-[var(--text-secondary)] mt-0.5 leading-snug px-2">
              Kreasi teka-teki tanpa batas, mahkota juara, dan proteksi streak eksklusif.
            </p>
          </div>

          {/* VIP Benefits Bento Grid (Adaptive to Theme) */}
          <div className="w-full rounded-2xl border border-[var(--accent-main)]/20 bg-black/5 dark:bg-white/5 p-3 flex flex-col gap-2.5 text-left">
            {/* Benefit 1: Creator Studio */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center shrink-0 border border-[var(--accent-main)]/20">
                <PenTool className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11.5px] font-black text-[var(--text-primary)] block leading-tight">
                  Studio Kreator TTS Unlimited
                </span>
                <span className="text-[9.5px] text-[var(--text-secondary)] leading-tight block">
                  Bebas bikin & terbitkan TTS kapan saja tanpa butuh tiket
                </span>
              </div>
              <Check className="w-4 h-4 text-[var(--accent-main)] stroke-[2.5]" />
            </div>

            {/* Benefit 2: Crown Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center shrink-0 border border-[var(--accent-main)]/20">
                <Crown className="w-4 h-4 fill-current" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11.5px] font-black text-[var(--text-primary)] block leading-tight">
                  Lencana Mahkota Juara
                </span>
                <span className="text-[9.5px] text-[var(--text-secondary)] leading-tight block">
                  Tampil bermahkota di Leaderboard Global & Arena 1v1
                </span>
              </div>
              <Check className="w-4 h-4 text-[var(--accent-main)] stroke-[2.5]" />
            </div>

            {/* Benefit 3: Streak & ELO Shield */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center shrink-0 border border-[var(--accent-main)]/20">
                <Shield className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11.5px] font-black text-[var(--text-primary)] block leading-tight">
                  Perlindungan Streak & ELO Otomatis
                </span>
                <span className="text-[9.5px] text-[var(--text-secondary)] leading-tight block">
                  Bebas cemas streak terputus saat sibuk atau kalah duel
                </span>
              </div>
              <Check className="w-4 h-4 text-[var(--accent-main)] stroke-[2.5]" />
            </div>

            {/* Benefit 4: Ad-Free Experience */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center shrink-0 border border-[var(--accent-main)]/20">
                <Ban className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11.5px] font-black text-[var(--text-primary)] block leading-tight">
                  Bebas Gangguan Iklan 100%
                </span>
                <span className="text-[9.5px] text-[var(--text-secondary)] leading-tight block">
                  Pengalaman asah otak murni, cepat, dan hening
                </span>
              </div>
              <Check className="w-4 h-4 text-[var(--accent-main)] stroke-[2.5]" />
            </div>
          </div>

          {/* Pricing & Subscription Card */}
          <div className="w-full flex flex-col gap-2 mt-0.5">
            {isVip ? (
              <div className="w-full py-3 px-4 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] font-bold text-[12.5px] flex items-center justify-center gap-2">
                <Crown className="w-4 h-4 fill-current" />
                <span>Status VIP Anda Saat Ini Aktif</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePurchaseVip}
                  className="w-full py-3.5 px-4 rounded-2xl font-black text-[13.5px] cursor-pointer tactile-active shadow-md flex items-center justify-between border border-white/20 disabled:opacity-50 transition-all"
                  style={{ background: 'var(--accent-grad)', color: 'var(--accent-contrast)' }}
                >
                  <div className="flex items-center gap-2">
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Crown className="w-4 h-4 fill-current stroke-current" />
                    )}
                    <span>{isProcessing ? 'Menghubungkan StoreKit...' : 'Mulai Langganan VIP'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-[13px] block leading-tight">
                      Rp 29.000
                    </span>
                    <span className="text-[9px] font-bold opacity-80 block leading-tight">
                      per bulan
                    </span>
                  </div>
                </button>

                {/* Sachet Alternative Option */}
                <button
                  type="button"
                  onClick={handleSwitchToSachet}
                  className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Cuma butuh 1x kreasi?</span>
                  <span className="text-[var(--accent-main)] underline underline-offset-2">
                    Cek Paket Sachet Rp 5.000
                  </span>
                </button>
              </>
            )}

            {/* Apple Mandatory StoreKit Terms & Links */}
            <div className="flex flex-col gap-1 pt-1.5 border-t border-black/5 dark:border-white/10 text-[9px] text-[var(--text-secondary)] leading-tight">
              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleRestore}
                  className="hover:underline hover:text-[var(--text-primary)] cursor-pointer font-medium"
                >
                  Pulihkan Pembelian
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => openLegalModal('terms')}
                  className="hover:underline hover:text-[var(--text-primary)] cursor-pointer font-medium"
                >
                  Syarat & Ketentuan (EULA)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => openLegalModal('privacy')}
                  className="hover:underline hover:text-[var(--text-primary)] cursor-pointer font-medium"
                >
                  Kebijakan Privasi
                </button>
              </div>
              <p className="text-[8px] text-[var(--text-secondary)]/70 mt-0.5">
                Langganan bulanan diperpanjang otomatis melalui akun Apple ID Anda dan dapat dibatalkan sewaktu-waktu di Pengaturan Apple ID minimal 24 jam sebelum masa berakhir.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VipSubscriptionModal;
