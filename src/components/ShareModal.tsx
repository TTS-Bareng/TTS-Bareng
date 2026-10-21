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

        {/* Modal Card Content (Apple Liquid Glass Card Gradient) */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 340 }}
          style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.09) 0%, rgba(255, 255, 255, 0.025) 100%), #141418',
            boxShadow: '0 24px 60px -10px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
          }}
          className="relative w-full max-w-[340px] rounded-[36px] p-5.5 text-center flex flex-col items-center gap-3 shadow-2xl z-10 border border-white/15 text-white overflow-hidden"
        >
          {/* Top Ambient Specular Light */}
          <div className="absolute -top-12 inset-x-0 flex justify-center pointer-events-none">
            <div className="w-56 h-56 rounded-full bg-white/5 blur-3xl pointer-events-none" />
          </div>

          {/* Top Navigation: Badge & Close Button */}
          <div className="relative z-10 flex items-center justify-between w-full">
            <span className="px-3.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur-md">
              {shareModalData.badge}
            </span>
            <button
              type="button"
              onClick={closeShareModal}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer tactile-active"
              title="Tutup"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Centerpiece: Real Plush Mascot Floating */}
          <div className="relative z-10 w-44 h-44 my-1 flex items-center justify-center shrink-0">
            <motion.img
              initial={{ y: 8, scale: 0.92 }}
              animate={{ y: [0, -8, 0], scale: 1 }}
              transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
              src={mascotSrc}
              alt="Maskot Jawara"
              className="w-full h-full object-contain filter drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)]"
            />
          </div>

          {/* Title & Subtext (Urbanist, Strict Monokrom, No Rainbow Text) */}
          <div className="relative z-10 flex flex-col items-center px-1">
            <h2 className="text-[23px] font-black tracking-tight leading-[1.12] text-white">
              {shareModalData.title}
            </h2>
            <p className="text-[11.5px] text-white/70 mt-1.5 font-medium leading-relaxed max-w-[280px]">
              {shareModalData.subtitle}
            </p>
          </div>

          {/* Metrics Strip: Non-Accent Card Gradient */}
          {shareModalData.stats && shareModalData.stats.length > 0 && (
            <div className="relative z-10 w-full grid grid-cols-3 gap-2 my-1">
              {shareModalData.stats.map((stat, idx) => (
                <div
                  key={idx}
                  className="metric-glass-card rounded-2xl py-2 px-1 flex flex-col items-center"
                >
                  <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider">
                    {stat.label}
                  </span>
                  <span className="text-[13px] font-black text-white mt-0.5">
                    {stat.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons: Duolingo Tactile 3D White Button + Copy */}
          <div className="relative z-10 w-full flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={handleShare}
              className="w-full py-3.5 rounded-2xl btn-tactile-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Share2 className="w-4 h-4 text-slate-900 stroke-[2.2]" />
              <span className="text-slate-900">BAGIKAN PRESTASI</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-bold text-[11px] flex items-center justify-center gap-1.5 border border-white/10 transition-all cursor-pointer tactile-active"
            >
              <Copy className="w-3.5 h-3.5 stroke-[2]" />
              <span>Salin Tautan</span>
            </button>
          </div>

          {/* Footer Branding Resmi (Font Urbanist) */}
          <span className="relative z-10 text-[9.5px] text-white/45 font-bold tracking-wide uppercase pt-1">
            TTS Bareng - Mabar Teka Teki Silang
          </span>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
