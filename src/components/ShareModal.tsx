import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';
import { shareOrCopy } from '../lib/deeplink';
import { copyToClipboard } from '../lib/clipboard';

export const ShareModal: React.FC = () => {
  const { isShareModalOpen, shareModalData, closeShareModal, showGlobalToast } = useGameStore();

  if (!isShareModalOpen || !shareModalData) {
    return null;
  }

  const handleShare = async () => {
    const url = shareModalData.shareUrl || window.location.origin;
    const text = shareModalData.shareText || shareModalData.subtitle;
    const result = await shareOrCopy({
      title: shareModalData.title,
      text,
      url,
    });

    if (result === 'shared') {
      showGlobalToast('Prestasi berhasil dibagikan!');
    } else if (result === 'copied') {
      showGlobalToast('Tautan prestasi disalin ke clipboard!');
    }
  };

  const handleCopy = async () => {
    const url = shareModalData.shareUrl || window.location.origin;
    const text = shareModalData.shareText || `${shareModalData.title}\n${shareModalData.subtitle}\nMain di: ${url}`;
    const success = await copyToClipboard(text);
    if (success) {
      showGlobalToast('Teks & tautan disalin ke clipboard!');
    } else {
      showGlobalToast('Gagal menyalin tautan');
    }
  };

  const mascotSrc = shareModalData.mascot || MASCOTS.crosswordChampion;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          onClick={closeShareModal}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Card Content (Adaptive Liquid Glass Bento) */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 340 }}
          className="relative w-full max-w-[340px] rounded-[32px] p-5 text-center flex flex-col items-center gap-3 shadow-2xl z-10 border border-black/10 dark:border-white/15 liquid-glass-card text-[var(--text-primary)] overflow-hidden"
        >
          {/* Top Ambient Specular Light */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          <div className="absolute -top-12 inset-x-0 flex justify-center pointer-events-none">
            <div className="w-56 h-56 rounded-full bg-[var(--accent-light)] blur-3xl pointer-events-none opacity-60" />
          </div>

          {/* Top Navigation: Badge & Close Button */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <span className="px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[10px] font-black uppercase tracking-wider text-[var(--accent-main)] shadow-2xs">
              {shareModalData.badge}
            </span>
            <button
              type="button"
              onClick={closeShareModal}
              className="w-7 h-7 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 flex items-center justify-center text-[var(--text-primary)] transition-all cursor-pointer tactile-active border border-black/5 dark:border-white/10"
              title="Tutup"
            >
              <X className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>

          {/* Centerpiece: Real Plush Mascot Floating */}
          <div className="relative z-10 w-36 h-36 my-1 flex items-center justify-center shrink-0">
            <motion.img
              initial={{ y: 8, scale: 0.92 }}
              animate={{ y: [0, -6, 0], scale: 1 }}
              transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
              src={mascotSrc}
              alt="Maskot Jawara"
              className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.25)]"
            />
          </div>

          {/* Title & Subtext */}
          <div className="relative z-10 flex flex-col items-center px-1">
            <h2 className="text-[20px] font-black tracking-tight leading-[1.15] text-[var(--text-primary)]">
              {shareModalData.title}
            </h2>
            <p className="text-[11.5px] text-[var(--text-secondary)] mt-1 font-medium leading-relaxed max-w-[280px]">
              {shareModalData.subtitle}
            </p>
          </div>

          {/* Metrics Strip */}
          {shareModalData.stats && shareModalData.stats.length > 0 && (
            <div className="relative z-10 w-full grid grid-cols-3 gap-2 my-0.5">
              {shareModalData.stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl py-2 px-1 flex flex-col items-center bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10"
                >
                  <span className="text-[8.5px] text-[var(--text-secondary)] font-bold uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <span className="text-[13px] font-black text-[var(--text-primary)] mt-0.5 font-mono">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons: Theme Adaptive Grad & Secondary */}
          <div className="relative z-10 w-full flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={handleShare}
              className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-md border border-white/20 tactile-active"
              style={{ background: 'var(--accent-grad)', color: 'var(--accent-contrast)' }}
            >
              <Share2 className="w-4 h-4 stroke-[2.2]" />
              <span>BAGIKAN PRESTASI</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2.5 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-primary)] font-bold text-[11px] flex items-center justify-center gap-1.5 border border-black/5 dark:border-white/10 transition-all cursor-pointer tactile-active"
            >
              <Copy className="w-3.5 h-3.5 stroke-[2]" />
              <span>Salin Tautan</span>
            </button>
          </div>

          {/* Footer Branding Resmi */}
          <span className="relative z-10 text-[9px] text-[var(--text-secondary)]/60 font-bold tracking-wide uppercase pt-0.5">
            TTS Bareng - Mabar Teka Teki Silang
          </span>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
