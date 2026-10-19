import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trophy,
  Users,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { REALMS } from '../lib/realms';
import { type TournamentFormat } from '../lib/tournament';

export const CreateTournamentModal: React.FC = () => {
  const {
    isCreateTournamentOpen,
    closeCreateTournament,
    createTournament,
    user,
    showGlobalToast,
  } = useGameStore();

  const [tourneyName, setTourneyName] = useState(`Piala Juara ${user?.name || 'Komunitas'}`);
  const [format, setFormat] = useState<TournamentFormat>('knockout_4');
  const [roundDuration, setRoundDuration] = useState<number>(60);
  const [selectedTheme, setSelectedTheme] = useState<string>('Semua Kategori (Acak)');

  if (!isCreateTournamentOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourneyName.trim()) {
      showGlobalToast('Nama turnamen wajib diisi', 2000);
      return;
    }

    createTournament(tourneyName, format, roundDuration, selectedTheme);
    showGlobalToast('Turnamen berhasil dibuat! Mengundang kawan...', 2500);
    closeCreateTournament();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCreateTournament}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-[400px] max-h-[90vh] overflow-y-auto rounded-[30px] p-5 liquid-glass-card border border-[var(--border-card)] shadow-2xl z-10 flex flex-col gap-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center text-[var(--accent-main)] shadow-2xs">
                <Trophy className="w-5 h-5 fill-current stroke-none" />
              </div>
              <div>
                <span className="text-[8.5px] font-black uppercase tracking-wider text-[var(--accent-main)]">
                  HOST KOMUNITAS
                </span>
                <h3 className="text-[17px] font-black text-[var(--text-primary)] leading-tight">
                  Buat Turnamen Baru
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCreateTournament}
              className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer tactile-active"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {/* Input Nama Turnamen */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
                Nama Turnamen
              </label>
              <input
                type="text"
                value={tourneyName}
                onChange={(e) => setTourneyName(e.target.value)}
                maxLength={32}
                placeholder="Contoh: Piala Jawara Malam"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)] text-[13px] font-bold text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-main)] transition-colors"
              />
            </div>

            {/* Pilihan Format Pertandingan */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                <span>Format Pertandingan</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div
                  onClick={() => setFormat('knockout_4')}
                  className={`p-3 rounded-2xl border cursor-pointer tactile-active transition-all flex flex-col gap-1 ${
                    format === 'knockout_4'
                      ? 'bg-[var(--accent-light)] border-[var(--accent-main)] text-[var(--accent-main)]'
                      : 'bg-black/5 dark:bg-white/5 border-[var(--border-card)] text-[var(--text-secondary)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-black text-[var(--text-primary)]">
                      4 Besar (SF + Final)
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-white/20">
                      ⚡ Cepat
                    </span>
                  </div>
                  <span className="text-[9px] font-medium leading-tight">
                    2 Babak eliminasi seru untuk 4 pemain.
                  </span>
                </div>

                <div
                  onClick={() => setFormat('knockout_8')}
                  className={`p-3 rounded-2xl border cursor-pointer tactile-active transition-all flex flex-col gap-1 ${
                    format === 'knockout_8'
                      ? 'bg-[var(--accent-light)] border-[var(--accent-main)] text-[var(--accent-main)]'
                      : 'bg-black/5 dark:bg-white/5 border-[var(--border-card)] text-[var(--text-secondary)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11.5px] font-black text-[var(--text-primary)]">
                      8 Besar (QF, SF, Final)
                    </span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-white/20">
                      🏆 Akbar
                    </span>
                  </div>
                  <span className="text-[9px] font-medium leading-tight">
                    3 Babak kompetitif untuk 8 peserta.
                  </span>
                </div>
              </div>
            </div>

            {/* Pilihan Durasi Ronde */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                <span>Durasi Per Babak</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[60, 90].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setRoundDuration(dur)}
                    className={`py-2 px-3 rounded-2xl border text-[11.5px] font-black cursor-pointer tactile-active transition-all ${
                      roundDuration === dur
                        ? 'bg-[var(--accent-light)] border-[var(--accent-main)] text-[var(--accent-main)]'
                        : 'bg-black/5 dark:bg-white/5 border-[var(--border-card)] text-[var(--text-secondary)]'
                    }`}
                  >
                    {dur} Detik
                  </button>
                ))}
              </div>
            </div>

            {/* Pilihan Kategori Soal */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                <span>Kategori Soal</span>
              </label>

              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)] text-[12px] font-bold text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-main)] transition-colors"
              >
                <option value="Semua Kategori (Acak)">Semua Kategori (Acak 61 Tema)</option>
                {REALMS.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Hadiah Pemenang */}
            <div className="p-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-main)]" />
                <span className="text-[11px] font-black text-[var(--text-primary)]">
                  Total Hadiah Juara
                </span>
              </div>
              <span className="text-[11px] font-black text-[var(--accent-main)]">
                🏆 Emas + 200 ★ Bintang
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[13px] font-black flex items-center justify-center gap-2 shadow-md cursor-pointer tactile-active hover:opacity-95 transition-opacity mt-1"
            >
              <span>Buat Turnamen & Buka Lobi</span>
              <ArrowRight className="w-4 h-4 stroke-[2.4]" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
