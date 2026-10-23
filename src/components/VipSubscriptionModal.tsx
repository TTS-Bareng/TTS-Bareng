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
        {/* Dark Obsidian Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          onClick={closeVipModal}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Card (Royal Gold & Obsidian Liquid Glass) */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-[370px] max-h-[92vh] rounded-[32px] p-5 flex flex-col items-center gap-3.5 shadow-2xl z-10 border border-amber-500/30 liquid-glass-card overflow-hidden text-center bg-gradient-to-b from-[#18140a] via-[#120f08] to-[#0a0804]"
        >
          {/* Top Gold Specular Sheen */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-300/80 to-transparent pointer-events-none" />
          <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-amber-600/15 blur-3xl pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={closeVipModal}
            aria-label="Tutup"
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-white border border-white/10 cursor-pointer z-20"
          >
            <X className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* Mascot with Floating Gold Crown */}
          <div className="relative w-22 h-22 mt-1 flex items-center justify-center shrink-0">
            <motion.img
              initial={{ y: 6, scale: 0.92 }}
              animate={{ y: [0, -4, 0], scale: 1 }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              src={MASCOTS.crosswordChampion}
              alt="TTS Pass VIP Champion"
              className="w-full h-full object-contain filter drop-shadow-xl"
            />
            {/* Animated Gold Crown Badge */}
            <motion.div
              animate={{ rotate: [-4, 4, -4], y: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
              className="absolute -top-2 -right-1 w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-black flex items-center justify-center shadow-lg border border-amber-200"
            >
              <Crown className="w-4 h-4 fill-black stroke-black" />
            </motion.div>
          </div>

          {/* Header & Title */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center gap-1 shadow-xs">
              <Sparkles className="w-3 h-3 fill-amber-300" />
              <span>PASPOR ANGGOTA EKSKLUSIF</span>
            </span>
            <h3 className="text-[21px] font-black tracking-tight text-white mt-1.5 leading-tight">
              TTS Bareng VIP Pass
            </h3>
            <p className="text-[11.5px] text-amber-100/70 mt-0.5 leading-snug px-2">
              Kreasi teka-teki tanpa batas, mahkota juara, dan proteksi streak eksklusif.
            </p>
          </div>

          {/* VIP Benefits Bento Grid */}
          <div className="w-full rounded-2xl border border-amber-500/20 bg-black/40 backdrop-blur-md p-3 flex flex-col gap-2.5 text-left">
            {/* Benefit 1: Creator Studio */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <PenTool className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11.5px] font-black text-white block leading-tight">
                  Studio Kreator TTS Unlimited
                </span>
                <span className="text-[9.5px] text-zinc-400 leading-tight block">
                  Bebas bikin & terbitkan TTS kapan saja tanpa butuh tiket
                </span>
              </div>
              <Check className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            </div>

            {/* Benefit 2: Crown Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Crown className="w-4 h-4 fill-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11.5px] font-black text-white block leading-tight">
                  Lencana Mahkota Emas Juara
                </span>
                <span className="text-[9.5px] text-zinc-400 leading-tight block">
                  Tampil bermahkota di Leaderboard Global & Arena 1v1
                </span>
              </div>
              <Check className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            </div>

            {/* Benefit 3: Streak & ELO Shield */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Shield className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11.5px] font-black text-white block leading-tight">
                  Perlindungan Streak & ELO Otomatis
                </span>
                <span className="text-[9.5px] text-zinc-400 leading-tight block">
                  Bebas cemas streak terputus saat sibuk atau kalah duel
                </span>
              </div>
              <Check className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            </div>

            {/* Benefit 4: Ad-Free Experience */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
                <Ban className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11.5px] font-black text-white block leading-tight">
                  Bebas Gangguan Iklan 100%
                </span>
                <span className="text-[9.5px] text-zinc-400 leading-tight block">
                  Pengalaman asah otak murni, cepat, dan hening
                </span>
              </div>
              <Check className="w-4 h-4 text-amber-400 stroke-[2.5]" />
            </div>
          </div>

          {/* Pricing & Subscription Card */}
          <div className="w-full flex flex-col gap-2 mt-0.5">
            {isVip ? (
              <div className="w-full py-3 px-4 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-[12.5px] flex items-center justify-center gap-2">
                <Crown className="w-4 h-4 fill-amber-400" />
                <span>Status VIP Anda Saat Ini Aktif</span>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handlePurchaseVip}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-black font-black text-[13.5px] cursor-pointer tactile-active shadow-lg shadow-amber-500/25 flex items-center justify-between border border-amber-200/50 disabled:opacity-50 transition-all"
                >
                  <div className="flex items-center gap-1.5">
                    {isProcessing ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <Crown className="w-4 h-4 fill-black stroke-black" />
                    )}
                    <span>{isProcessing ? 'Menghubungkan StoreKit...' : 'Mulai Langganan VIP'}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-black text-[13px] block leading-tight">
                      Rp 29.000
                    </span>
                    <span className="text-[9px] font-bold text-black/70 block leading-tight">
                      per bulan
                    </span>
                  </div>
                </button>

                {/* Sachet Alternative Option */}
                <button
                  type="button"
                  onClick={handleSwitchToSachet}
                  className="text-[11px] text-amber-300/80 hover:text-amber-200 font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Cuma butuh 1x kreasi?</span>
                  <span className="text-amber-400 underline underline-offset-2">
                    Cek Paket Sachet Rp 5.000
                  </span>
                </button>
              </>
            )}

            {/* Apple Mandatory StoreKit Terms & Links */}
            <div className="flex flex-col gap-1 pt-1.5 border-t border-white/10 text-[9px] text-zinc-400 leading-tight">
              <div className="flex items-center justify-center gap-2.5">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleRestore}
                  className="hover:underline hover:text-white cursor-pointer font-medium"
                >
                  Pulihkan Pembelian
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => openLegalModal('terms')}
                  className="hover:underline hover:text-white cursor-pointer font-medium"
                >
                  Syarat & Ketentuan (EULA)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => openLegalModal('privacy')}
                  className="hover:underline hover:text-white cursor-pointer font-medium"
                >
                  Kebijakan Privasi
                </button>
              </div>
              <p className="text-[8px] text-zinc-500 mt-0.5">
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
