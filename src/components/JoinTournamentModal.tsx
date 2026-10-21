import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  QrCode,
  ArrowRight,
  ShieldCheck,
  ScanLine,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { QrScannerModal } from './QrScannerModal';
import { extractTournamentCodeFromText, extractRoomCodeFromText } from '../lib/deeplink';
import { fetchTournamentByCodeFromDb } from '../lib/supabase';

export const JoinTournamentModal: React.FC = () => {
  const {
    isJoinTournamentOpen,
    closeJoinTournament,
    joinTournament,
    showGlobalToast,
    isScannerOpen,
    openScanner,
    closeScanner,
  } = useGameStore();

  const [code, setCode] = useState('');

  if (!isJoinTournamentOpen) return null;

  const handleFormatInput = (val: string) => {
    let clean = val.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    if (!clean.startsWith('CUP-') && clean.length > 0) {
      if (clean.startsWith('CUP')) {
        clean = clean.replace('CUP', 'CUP-');
      } else if (!clean.includes('-')) {
        clean = `CUP-${clean}`;
      }
    }
    setCode(clean.slice(0, 8));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.length < 6) {
      showGlobalToast('Masukkan format kode turnamen yang valid (contoh: CUP-7721)', 2500);
      return;
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = useGameStore.getState().publicTournaments.find((t) => t.code === cleanCode);
    if (!existing) {
      const fromDb = await fetchTournamentByCodeFromDb(cleanCode);
      if (fromDb) {
        useGameStore.getState().receivePublicTournament(fromDb);
      }
    }

    const res = joinTournament(cleanCode);
    if (res.success) {
      showGlobalToast(res.message, 2500);
      closeJoinTournament();
    } else {
      showGlobalToast(res.message, 2500);
    }
  };

  const handleScanSuccess = async (scannedText: string) => {
    closeScanner();
    const resolvedCode =
      extractTournamentCodeFromText(scannedText) ||
      extractRoomCodeFromText(scannedText) ||
      scannedText.trim().toUpperCase();

    if (resolvedCode) {
      showGlobalToast(`Kode terdeteksi: ${resolvedCode}`);

      const cleanCode = resolvedCode.trim().toUpperCase();
      const existing = useGameStore.getState().publicTournaments.find((t) => t.code === cleanCode);
      if (!existing) {
        const fromDb = await fetchTournamentByCodeFromDb(cleanCode);
        if (fromDb) {
          useGameStore.getState().receivePublicTournament(fromDb);
        }
      }

      const res = joinTournament(cleanCode);
      showGlobalToast(res.message, 2500);
      if (res.success) {
        closeJoinTournament();
      }
    } else {
      showGlobalToast('Format QR turnamen tidak dikenali', 2500);
    }
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 select-none overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            onClick={closeJoinTournament}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card (Apple Liquid Glass matching PlayerIdModal) */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-[380px] max-h-[92vh] overflow-y-auto no-scrollbar rounded-[28px] p-4 sm:p-5 flex flex-col gap-3.5 shadow-2xl z-10 border border-black/10 dark:border-white/15 liquid-glass-card my-auto"
          >
            {/* Top Specular Sheen Highlight */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center text-[var(--accent-main)] shadow-2xs">
                  <QrCode className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8.5px] font-black uppercase tracking-wider text-[var(--accent-main)]">
                    GABUNG KAMAR KOMPETISI
                  </span>
                  <h3 className="text-[16px] font-black text-[var(--text-primary)] leading-tight">
                    Gabung Turnamen
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={closeJoinTournament}
                aria-label="Tutup"
                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer"
              >
                <X className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
            </div>

            {/* Quick Action: Pindai QR Turnamen Banner */}
            <button
              type="button"
              onClick={openScanner}
              className="w-full p-3 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] flex items-center justify-between cursor-pointer tactile-active hover:opacity-95 transition-opacity shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/40 dark:bg-white/10 flex items-center justify-center shrink-0">
                  <ScanLine className="w-4 h-4 stroke-[2.4]" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[12px] font-black leading-tight">
                    Pindai QR Turnamen
                  </span>
                  <span className="text-[9.5px] text-[var(--text-secondary)] font-medium leading-tight">
                    Scan tiket atau layar teman secara instan
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 stroke-[2.4]" />
            </button>

            {/* Divider "Atau Masukkan Kode" */}
            <div className="flex items-center gap-2 my-0.5">
              <div className="flex-1 h-px bg-[var(--border-card)]" />
              <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                ATAU MASUKKAN KODE
              </span>
              <div className="flex-1 h-px bg-[var(--border-card)]" />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3 relative z-10">
              <div className="flex flex-col gap-1.5">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => handleFormatInput(e.target.value)}
                    placeholder="CUP-XXXX"
                    maxLength={8}
                    className="w-full px-3.5 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)] text-[16px] tracking-widest font-black text-[var(--text-primary)] uppercase focus:outline-hidden focus:border-[var(--accent-main)] transition-colors text-center"
                  />
                </div>
                <span className="text-[9.5px] text-[var(--text-secondary)] text-center font-medium">
                  Minta 4 digit kode kamar turnamen dari host
                </span>
              </div>

              {/* Benefit Info */}
              <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)] flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[var(--accent-main)] shrink-0" />
                <span className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight">
                  Turnamen real-time sistem gugur. Pastikan sinyal internet stabil saat pertandingan dimulai.
                </span>
              </div>

              {/* Action Submit */}
              <button
                type="submit"
                disabled={code.length < 6}
                className={`w-full py-3 rounded-2xl text-[12.5px] font-black flex items-center justify-center gap-2 shadow-md cursor-pointer tactile-active transition-all mt-1 ${
                  code.length >= 6
                    ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] hover:opacity-95'
                    : 'bg-black/10 dark:bg-white/10 text-[var(--text-secondary)] opacity-50 cursor-not-allowed'
                }`}
              >
                <span>Masuk ke Turnamen</span>
                <ArrowRight className="w-4 h-4 stroke-[2.4]" />
              </button>
            </form>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* QR Scanner Camera Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={closeScanner}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
};

export default JoinTournamentModal;
