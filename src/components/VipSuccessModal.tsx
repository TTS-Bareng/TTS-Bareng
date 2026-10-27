import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Sparkles, Flame, BookOpen, PenTool, ExternalLink, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGameStore } from '../store/useGameStore';
import { soundManager } from '../lib/audio';
import { haptic } from '../lib/haptics';

export const VipSuccessModal: React.FC = () => {
  const {
    isVipSuccessModalOpen,
    vipSuccessData,
    closeVipSuccessModal,
    openCancelSubModal,
    soundEnabled,
    hapticEnabled,
  } = useGameStore();

  useEffect(() => {
    if (isVipSuccessModalOpen) {
      if (soundEnabled) soundManager.playVictory();
      if (hapticEnabled) haptic.success([40, 80, 50]);
      confetti({
        particleCount: 160,
        spread: 90,
        origin: { y: 0.55 },
      });
    }
  }, [isVipSuccessModalOpen, soundEnabled, hapticEnabled]);

  if (!isVipSuccessModalOpen) return null;

  const planTitle = vipSuccessData?.planName || 'Keanggotaan VIP';
  const isLifetime =
    planTitle.toLowerCase().includes('lifetime') ||
    planTitle.toLowerCase().includes('seumur hidup');

  const expiryLabel = isLifetime
    ? 'Akses Seumur Hidup (Aktif Permanen)'
    : vipSuccessData?.expiryDate
    ? `Aktif hingga ${vipSuccessData.expiryDate}`
    : 'Langganan Aktif (Diperpanjang Otomatis)';

  const VIP_PRIVILEGES = [
    {
      icon: <Sparkles className="w-3.5 h-3.5" />,
      title: 'Bebas Iklan Selamanya',
      desc: 'Bermain TTS dan buka petunjuk tanpa jeda sponsor.',
    },
    {
      icon: <BookOpen className="w-3.5 h-3.5" />,
      title: 'Buka Semua 500+ Bab',
      desc: 'Akses penuh ke seluruh teka-teki silang & konten masa depan.',
    },
    {
      icon: <PenTool className="w-3.5 h-3.5" />,
      title: 'Studio Kreator Sepuasnya',
      desc: 'Buat dan bagikan teka-teki kreasimu tanpa batas tiket.',
    },
    {
      icon: <Flame className="w-3.5 h-3.5" />,
      title: 'Perlindungan Rentetan Api',
      desc: 'Streak harian selalu terlindungi jika sempat terlewat.',
    },
    {
      icon: <Crown className="w-3.5 h-3.5" />,
      title: 'Lencana Mahkota Prestise',
      desc: 'Tampil terverifikasi VIP di profil dan peringkat.',
    },
  ];

  const handleManageClick = () => {
    closeVipSuccessModal();
    openCancelSubModal();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          exit={{ opacity: 0 }}
          onClick={closeVipSuccessModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-[375px] max-h-[92vh] overflow-y-auto rounded-[30px] border border-[var(--border-card)] p-5 select-none shadow-2xl liquid-glass-card text-[var(--text-primary)]"
        >
          {/* Top Specular Sheen */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={closeVipSuccessModal}
            aria-label="Tutup"
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 transition-all cursor-pointer z-10"
          >
            <X className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* Celebratory Hero Badge */}
          <div className="text-center mb-3">
            <div className="relative inline-flex items-center justify-center mb-2">
              <div className="w-14 h-14 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/30 flex items-center justify-center text-[var(--accent-main)] shadow-md">
                <Crown className="w-7 h-7 stroke-[2.2] fill-current" />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] flex items-center justify-center shadow-xs">
                <Sparkles className="w-2.5 h-2.5" />
              </div>
            </div>

            <h3 className="text-[17px] font-black tracking-tight">
              Selamat Datang di VIP Klub!
            </h3>
            <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
              Seluruh fitur eksklusif telah aktif di akun Anda.
            </p>
          </div>

          {/* Subscription Validity Bento Card */}
          <div
            className="rounded-[20px] p-3 border border-[var(--accent-main)]/25 shadow-xs relative overflow-hidden mb-3"
            style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[8.5px] font-black text-[var(--accent-main)] uppercase tracking-wider">
                Status Keanggotaan
              </span>
              <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/25 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-main)] animate-pulse" />
                AKTIF
              </span>
            </div>
            <div className="text-[13px] font-black tracking-tight text-[var(--text-primary)]">
              {planTitle}
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] font-medium mt-0.5">
              {expiryLabel}
            </div>
          </div>

          {/* VIP Privileges List */}
          <div className="space-y-1.5 mb-4">
            <span className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-wider px-1 block mb-1">
              Hak Istimewa VIP Anda:
            </span>

            {VIP_PRIVILEGES.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-2 rounded-[14px] bg-black/[0.025] dark:bg-white/[0.035] border border-black/5 dark:border-white/10"
              >
                <div className="w-6 h-6 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)] flex items-center justify-center shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-black leading-tight text-[var(--text-primary)]">
                    {item.title}
                  </div>
                  <div className="text-[9.5px] text-[var(--text-secondary)] leading-tight mt-0.5">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={closeVipSuccessModal}
            className="w-full py-3 px-4 rounded-xl font-black text-[13px] cursor-pointer tactile-active shadow-md flex items-center justify-center gap-2 border border-white/20 transition-all mb-2"
            style={{ background: 'var(--accent-grad)', color: 'var(--accent-contrast)' }}
          >
            <span>Mulai Petualangan VIP</span>
            <Sparkles className="w-4 h-4" />
          </button>

          {/* Manage Subscription Deep Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleManageClick}
              className="text-[10.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors underline cursor-pointer inline-flex items-center gap-1"
            >
              <span>Kelola atau Batalkan Langganan di Apple ID</span>
              <ExternalLink className="w-2.5 h-2.5 stroke-[2.2]" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default VipSuccessModal;
