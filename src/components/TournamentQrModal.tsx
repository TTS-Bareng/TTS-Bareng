import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, Copy, Trophy } from 'lucide-react';
import QRCode from 'qrcode';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';
import { createTournamentDeepLink } from '../lib/deeplink';
import { copyToClipboard } from '../lib/clipboard';
import { shareToWhatsApp } from '../lib/nativeShare';
import { type CommunityTournament } from '../lib/tournament';

interface TournamentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: CommunityTournament | null;
}

export const TournamentQrModal: React.FC<TournamentQrModalProps> = ({
  isOpen,
  onClose,
  tournament,
}) => {
  const { showGlobalToast } = useGameStore();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  useEffect(() => {
    if (tournament && isOpen) {
      const inviteLink = createTournamentDeepLink(tournament.code);
      QRCode.toDataURL(inviteLink, {
        width: 240,
        margin: 1.5,
        color: {
          dark: '#111827',
          light: '#FFFFFF',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch(() => setQrCodeDataUrl(''));
    }
  }, [tournament, isOpen]);

  if (!isOpen || !tournament) return null;

  const inviteLink = createTournamentDeepLink(tournament.code);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(inviteLink);
    if (success) {
      showGlobalToast(`Tautan turnamen ${tournament.code} berhasil disalin!`, 2500);
    } else {
      showGlobalToast(`Kode kamar turnamen: ${tournament.code}`, 2500);
    }
  };

  const handleShareWhatsApp = async () => {
    const text =
      `🏆 Ayo bergabung ke Turnamen TTS Bareng!\n\n` +
      `Kamar: *${tournament.name}*\n` +
      `Kode PIN: *${tournament.code}*\n` +
      `Format: *${tournament.maxPlayers} Pemain (Sistem Gugur)*\n\n` +
      `Klik tautan ini untuk langsung bertanding:\n${inviteLink}`;

    const res = await shareToWhatsApp({ text, url: inviteLink });
    if (res === 'copied') {
      showGlobalToast('Tautan turnamen disalin ke clipboard!');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md select-none overflow-y-auto">
        <div className="relative w-full max-w-[340px] flex flex-col items-center my-auto">
          {/* Close Button on Top Right */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Tiket Turnamen"
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
                background: 'var(--hero-grad, var(--accent-grad))',
                color: '#ffffff',
              }}
              className="w-full ticket-sleeve-notch pt-12 pb-10 px-6 text-white flex flex-col items-center text-center relative overflow-hidden shadow-xs"
            >
              {/* Ambient Specular Sheen Glows */}
              <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-white/15 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-black/20 blur-xl pointer-events-none" />
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

              {/* Crossword Blueprint Grid Watermark Texture Overlay */}
              <svg
                className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="tourney-ticket-grid" width="22" height="22" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="21" height="21" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2,2" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#tourney-ticket-grid)" />
              </svg>

              {/* Vintage Tournament Stamp Watermark on Top Right */}
              <div className="absolute top-4 right-5 border border-dashed border-white/30 rounded-lg px-2 py-0.5 rotate-[-6deg] pointer-events-none flex items-center gap-1 text-[8px] font-mono text-white/80 tracking-wider">
                <Trophy className="w-2.5 h-2.5" />
                <span>TOURNAMENT PASS</span>
              </div>

              <h2 className="text-[26px] font-black tracking-tight leading-[1.15] text-white drop-shadow-sm relative z-10">
                Undangan Resmi<br />Turnamen TTS!
              </h2>

              <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/85 mt-2.5 mb-1 relative z-10">
                SISTEM GUGUR • REBUT TROFI EMAS • JUARA KOMUNITAS
              </p>

              <div className="absolute bottom-3 right-4 border border-dashed border-white/35 rounded-lg px-2.5 py-0.5 rotate-6 text-[8.5px] font-mono text-white/90 pointer-events-none bg-black/20 backdrop-blur-xs z-10">
                CUP #{tournament.code}
              </div>
            </div>

            {/* Perforated Tear Line (Zig-zag) */}
            <div
              style={{
                backgroundColor: 'var(--bg-app)',
              }}
              className="w-full h-4 perforation-edge"
            />

            {/* Floating Mascot Sticker */}
            <div className="absolute bottom-1 -left-3.5 z-30 flex items-center gap-2 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-xl shrink-0 border-2 border-white">
                <img
                  src={MASCOTS.crosswordChampion}
                  alt="Avatar Juara"
                  className="w-full h-full rounded-full object-cover bg-amber-50"
                />
              </div>
              <div className="px-3 py-1 rounded-full bg-white text-slate-900 font-black text-[10.5px] shadow-lg border border-slate-200/90 tracking-tight">
                Rebut Trofi Emas! 🏆
              </div>
            </div>

            {/* White Ticket Base / QR Stub */}
            <div className="w-full bg-white rounded-b-[34px] p-6 pt-4 pb-11 flex flex-col items-center text-center shadow-lg border-t border-slate-100">
              {/* Real Scannable QR Code Frame */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 shadow-xs flex flex-col items-center my-2">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code Kamar Turnamen"
                    className="w-40 h-40 rounded-xl object-contain"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400">
                    Membuat QR...
                  </div>
                )}
                <span className="text-[14px] font-black tracking-widest text-slate-900 mt-2.5 font-mono">
                  PIN: {tournament.code.split('').join(' ')}
                </span>
              </div>

              {/* Tournament Name & Host info */}
              <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400 mt-2.5">
                TURNAMEN RESMI
              </div>
              <div className="text-[14px] font-black text-slate-900 mt-0.5 tracking-tight truncate max-w-[260px]">
                {tournament.name.toUpperCase()}
              </div>
              <span className="text-[10px] font-bold text-slate-500 mt-0.5">
                Host: {tournament.hostName} • Kuota: {tournament.maxPlayers} Pemain
              </span>
            </div>
          </motion.div>

          {/* Bottom Instructions & Action Buttons */}
          <div className="w-full max-w-[340px] flex flex-col items-center shrink-0 pt-3">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
              PINDAI QR ATAU KLIK UNTUK BERGABUNG
            </span>

            <div className="w-full grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                style={{
                  background: 'var(--accent-grad)',
                }}
                className="py-3 rounded-2xl font-black text-xs text-white flex items-center justify-center gap-2 cursor-pointer tactile-active shadow-md hover:opacity-95 transition-all"
              >
                <Share2 className="w-4 h-4 stroke-[2.2] text-white" />
                <span className="text-white">Bagikan WA</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-3 rounded-2xl bg-white/90 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 border border-black/10 dark:border-white/15 text-[var(--text-primary)] font-black text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer tactile-active transition-all"
              >
                <Copy className="w-4 h-4 stroke-[2.2]" />
                <span>Salin Link</span>
              </button>
            </div>

            <span className="text-[9.5px] text-[var(--text-secondary)] font-bold tracking-wide uppercase mt-3">
              TTS Bareng - Arena Turnamen Komunitas
            </span>
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default TournamentQrModal;
