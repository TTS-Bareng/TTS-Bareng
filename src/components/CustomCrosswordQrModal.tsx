import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Play, PenTool, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';
import { createCustomCrosswordDeepLink } from '../lib/deeplink';
import { copyToClipboard } from '../lib/clipboard';
import { shareToWhatsApp, shareNative } from '../lib/nativeShare';

export const CustomCrosswordQrModal: React.FC = () => {
  const {
    isCustomCrosswordQrOpen,
    customCrosswordQrData,
    closeCustomCrosswordQrModal,
    playCustomCrossword,
    showGlobalToast,
    user,
  } = useGameStore();

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const item = customCrosswordQrData;

  useEffect(() => {
    if (item && isCustomCrosswordQrOpen) {
      const inviteLink = createCustomCrosswordDeepLink({
        title: item.title,
        category: item.category,
        wordsList: item.wordsList,
      });

      QRCode.toDataURL(inviteLink, {
        width: 260,
        margin: 1.5,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch(() => setQrCodeDataUrl(''));
    }
  }, [item, isCustomCrosswordQrOpen]);

  if (!isCustomCrosswordQrOpen || !item) return null;

  const totalWords =
    (item.level?.clues?.across?.length || 0) + (item.level?.clues?.down?.length || 0) ||
    item.wordsList?.length ||
    0;

  const inviteLink = createCustomCrosswordDeepLink({
    title: item.title,
    category: item.category,
    wordsList: item.wordsList,
  });

  const creatorName = user?.name || 'Kreator Komunitas';

  const handleCopyLink = async () => {
    const success = await copyToClipboard(inviteLink);
    if (success) {
      showGlobalToast('Tautan TTS Kustom berhasil disalin ke clipboard!', 3000);
    } else {
      showGlobalToast('Gagal menyalin tautan.');
    }
  };

  const handleShareWhatsApp = async () => {
    const text =
      `Ayo pecahkan TTS Karyaku: *"${item.title}"*!\n\n` +
      `Kategori: *${item.category || 'Kreasi'}*\n` +
      `Jumlah Kata: *${totalWords} Kata*\n` +
      `Kreator: *${creatorName}*\n\n` +
      `Buka dan mainkan langsung di aplikasi TTS Bareng:\n${inviteLink}`;

    const res = await shareToWhatsApp({ text, url: inviteLink });
    if (res === 'copied') {
      showGlobalToast('Pesan undangan disalin ke clipboard!');
    }
  };

  const handleShareNative = async () => {
    const text = `Ayo mainkan TTS Karyaku: "${item.title}" (${totalWords} Kata) di TTS Bareng!`;
    const res = await shareNative({
      title: item.title,
      text,
      url: inviteLink,
    });
    if (res === 'shared') {
      showGlobalToast('Undangan berhasil dibagikan!');
    } else if (res === 'copied') {
      showGlobalToast('Tautan berhasil disalin ke clipboard!');
    }
  };

  const handlePlayNow = () => {
    closeCustomCrosswordQrModal();
    playCustomCrossword(item);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none overflow-y-auto">
        <div className="relative w-full max-w-[340px] flex flex-col items-center my-auto">
          {/* Close Button on Top Right */}
          <button
            type="button"
            onClick={closeCustomCrosswordQrModal}
            aria-label="Tutup Tiket TTS Kustom"
            className="absolute -top-11 right-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer tactile-active transition-colors z-20 backdrop-blur-md border border-white/20"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Ticket Body Container */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="w-full flex flex-col items-center shadow-2xl relative rounded-[34px] overflow-hidden select-none"
          >
            {/* Top Sleeve with Notch */}
            <div
              style={{
                background: 'var(--accent-grad)',
                color: 'var(--accent-contrast, #ffffff)',
              }}
              className="w-full ticket-sleeve-notch pt-10 pb-9 px-6 text-white flex flex-col items-center text-center relative overflow-hidden shadow-xs"
            >
              {/* Ambient Specular Sheen Glows */}
              <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-white/15 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-black/20 blur-xl pointer-events-none" />
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

              {/* Crossword Blueprint Grid Watermark Texture */}
              <svg
                className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="custom-ticket-grid" width="22" height="22" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="21" height="21" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2,2" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#custom-ticket-grid)" />
              </svg>

              {/* Creator Studio Stamp Watermark */}
              <div className="absolute top-3.5 right-4 border border-dashed border-white/35 rounded-lg px-2 py-0.5 rotate-[-4deg] pointer-events-none flex items-center gap-1 text-[8px] font-mono text-white/90 tracking-wider">
                <PenTool className="w-2.5 h-2.5" />
                <span>STUDIO KREATOR</span>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/20 border border-white/20 text-[9px] font-black uppercase tracking-wider mb-2 relative z-10">
                <Sparkles className="w-3 h-3 text-white" />
                <span>Undangan Teka-Teki Silang</span>
              </div>

              <h2 className="text-[23px] font-black tracking-tight leading-[1.2] text-white drop-shadow-sm relative z-10 px-2 line-clamp-2">
                {item.title}
              </h2>

              <p className="text-[9.5px] font-extrabold uppercase tracking-widest text-white/90 mt-2 mb-0.5 relative z-10">
                {totalWords} KATA • {item.category || 'KREASI SENDIRI'}
              </p>

              <div className="mt-1 text-[9px] text-white/80 font-medium relative z-10">
                Karya: <span className="font-bold text-white">{creatorName}</span>
              </div>
            </div>

            {/* Perforated Tear Line */}
            <div
              style={{
                backgroundColor: 'var(--bg-app)',
              }}
              className="w-full h-4 perforation-edge"
            />

            {/* Floating Mascot Sticker */}
            <div className="absolute bottom-1 -left-3.5 z-30 flex items-center gap-2 pointer-events-none">
              <div className="w-11 h-11 rounded-full bg-white p-0.5 shadow-xl shrink-0 border-2 border-white">
                <img
                  src={MASCOTS.crosswordThinker}
                  alt="Maskot Kreator"
                  className="w-full h-full rounded-full object-cover bg-[var(--accent-light)]"
                />
              </div>
              <div className="px-2.5 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-primary)] font-black text-[10px] shadow-lg border border-black/10 dark:border-white/15/90 tracking-tight">
                Pecahkan Teka-Teki!
              </div>
            </div>

            {/* White Ticket Base / QR Stub */}
            <div className="w-full bg-[var(--bg-card)] text-[var(--text-primary)] rounded-b-[34px] p-5 pt-3.5 pb-8 flex flex-col items-center text-center shadow-lg border-t border-black/10 dark:border-white/10">
              {/* Scannable QR Code Frame */}
              <div className="p-3 rounded-2xl bg-white border border-black/10 shadow-xs flex flex-col items-center my-1.5">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code TTS Kustom"
                    className="w-40 h-40 rounded-xl object-contain"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-xs text-[var(--text-secondary)]">
                    Membuat QR...
                  </div>
                )}
                <span className="text-[11px] font-black tracking-wider text-[var(--text-primary)] mt-2 font-mono">
                  PINDAI DENGAN KAMERA / APP
                </span>
              </div>

              <p className="text-[10px] text-[var(--text-secondary)] font-medium max-w-[260px] leading-relaxed mt-1">
                Arahkan kamera HP kawanmu ke QR code di atas, atau bagikan tautan via WhatsApp.
              </p>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2 mt-4">
                {/* 1. WhatsApp Button */}
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20BD5A] active:scale-98 text-white font-black text-[12px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer tactile-active"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Kirim ke WhatsApp</span>
                </button>

                {/* 2. Secondary Row: Salin & Share Sheet */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="py-2 px-3 rounded-xl bg-black/5 dark:bg-white/10 hover:opacity-85 active:scale-98 text-[var(--text-primary)] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer tactile-active border border-black/10 dark:border-white/10"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin Tautan</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleShareNative}
                    className="py-2 px-3 rounded-xl bg-black/5 dark:bg-white/10 hover:opacity-85 active:scale-98 text-[var(--text-primary)] font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer tactile-active border border-black/10 dark:border-white/10"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Bagikan...</span>
                  </button>
                </div>

                {/* 3. Uji Mainkan */}
                <button
                  type="button"
                  onClick={handlePlayNow}
                  className="w-full py-2 px-4 rounded-xl bg-[var(--accent-main)] hover:opacity-90 active:scale-98 text-[var(--accent-contrast)] font-black text-[11.5px] flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer tactile-active mt-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Uji Mainkan Sekarang</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
