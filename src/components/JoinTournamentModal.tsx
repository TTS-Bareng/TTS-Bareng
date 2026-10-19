import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  QrCode,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export const JoinTournamentModal: React.FC = () => {
  const {
    isJoinTournamentOpen,
    closeJoinTournament,
    joinTournament,
    showGlobalToast,
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || code.length < 6) {
      showGlobalToast('Masukkan format kode turnamen yang valid (contoh: CUP-7721)', 2500);
      return;
    }

    const res = joinTournament(code.trim());
    if (res.success) {
      showGlobalToast(res.message, 2500);
      closeJoinTournament();
    } else {
      showGlobalToast(res.message, 2500);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeJoinTournament}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-[380px] rounded-[30px] p-5 liquid-glass-card border border-[var(--border-card)] shadow-2xl z-10 flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center text-[var(--accent-main)] shadow-2xs">
                <QrCode className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[8.5px] font-black uppercase tracking-wider text-[var(--accent-main)]">
                  GABUNG KAMAR
                </span>
                <h3 className="text-[17px] font-black text-[var(--text-primary)] leading-tight">
                  Gabung Turnamen
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={closeJoinTournament}
              className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer tactile-active"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
                Kode Turnamen
              </label>
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
              <span className="text-[9.5px] text-[var(--text-secondary)] text-center">
                Minta 4 digit kode kamar dari teman yang membuat turnamen
              </span>
            </div>

            {/* Benefit info */}
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)] flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[var(--accent-main)] shrink-0" />
              <span className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight">
                Turnamen bersifat kompetitif real-time. Pastikan koneksi internet stabil saat bertanding.
              </span>
            </div>

            {/* Action Submit */}
            <button
              type="submit"
              disabled={code.length < 6}
              className={`w-full py-3 rounded-2xl text-[13px] font-black flex items-center justify-center gap-2 shadow-md cursor-pointer tactile-active transition-all mt-1 ${
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
  );
};
