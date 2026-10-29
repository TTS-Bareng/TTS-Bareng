import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trophy,
  Users,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  ChevronDown,
  Check,
  Search,
  Dice5,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { REALMS } from '../lib/realms';
import { type TournamentFormat } from '../lib/tournament';

const PLAYER_COUNT_OPTIONS = [4, 6, 8, 10, 12, 14, 16] as const;

export const CreateTournamentModal: React.FC = () => {
  const {
    isCreateTournamentOpen,
    closeCreateTournament,
    createTournament,
    user,
    showGlobalToast,
  } = useGameStore();

  const [tourneyName, setTourneyName] = useState(`Piala Juara ${user?.name || 'Komunitas'}`);
  const [maxPlayers, setMaxPlayers] = useState<number>(8);
  const [format, setFormat] = useState<TournamentFormat>('knockout_8');
  const [roundDuration, setRoundDuration] = useState<number>(60);
  const [selectedTheme, setSelectedTheme] = useState<string>('Semua Kategori (Acak)');
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [themeSearchQuery, setThemeSearchQuery] = useState('');

  // Filter themes based on search query
  const filteredThemes = useMemo(() => {
    if (!themeSearchQuery.trim()) return REALMS;
    const q = themeSearchQuery.toLowerCase();
    return REALMS.filter((r) => r.name.toLowerCase().includes(q));
  }, [themeSearchQuery]);

  if (!isCreateTournamentOpen) return null;

  const handleSelectMaxPlayers = (count: number) => {
    setMaxPlayers(count);
    if (count <= 4) {
      setFormat('knockout_4');
    } else {
      setFormat('knockout_8');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tourneyName.trim()) {
      showGlobalToast('Nama turnamen wajib diisi', 2000);
      return;
    }

    createTournament(tourneyName, format, roundDuration, selectedTheme, maxPlayers);
    showGlobalToast('Turnamen berhasil dibuat! Mengundang kawan...', 2500);
    closeCreateTournament();
  };

  return (
    <AnimatePresence>
      <div
        style={{ background: 'var(--bg-gradient, var(--bg-app))' }}
        className="fixed inset-0 z-50 flex flex-col select-none overflow-hidden transition-colors duration-300"
      >
        {/* Sticky Header Top */}
        <div className="w-full max-w-md mx-auto px-4 pt-[max(14px,env(safe-area-inset-top))] pb-3 flex items-center justify-between shrink-0 border-b border-black/5 dark:border-white/10 relative z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center text-[var(--accent-main)] shadow-2xs">
              <Trophy className="w-4.5 h-4.5 fill-current stroke-none" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-wider text-[var(--accent-main)]">
                HOST TURNAMEN KOMUNITAS
              </span>
              <h3 className="text-[17px] font-black text-[var(--text-primary)] leading-tight">
                Buat Turnamen Baru
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCreateTournament}
            aria-label="Tutup"
            className="w-8.5 h-8.5 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="w-full max-w-md mx-auto flex-1 overflow-y-auto no-scrollbar px-4 py-4 flex flex-col gap-4">
          <form id="create-tourney-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Input Nama Turnamen */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
                Nama Turnamen
              </label>
              <input
                type="text"
                value={tourneyName}
                onChange={(e) => setTourneyName(e.target.value)}
                maxLength={32}
                placeholder="Contoh: Piala Jawara Malam"
                className="w-full px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)] text-[13.5px] font-bold text-[var(--text-primary)] focus:outline-hidden focus:border-[var(--accent-main)] transition-colors"
              />
            </div>

            {/* Jumlah Peserta Turnamen (4, 6, 8, 10, 12, 14, 16) */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10.5px] font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                  <span>Jumlah Peserta</span>
                </label>
                <span className="text-[11px] font-black text-[var(--accent-main)]">
                  {maxPlayers} Pemain
                </span>
              </div>

              {/* Segmented Pill Selector (Apple Style) */}
              <div className="grid grid-cols-7 gap-1 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)]">
                {PLAYER_COUNT_OPTIONS.map((count) => {
                  const isSelected = maxPlayers === count;
                  return (
                    <button
                      key={count}
                      type="button"
                      onClick={() => handleSelectMaxPlayers(count)}
                      className={`py-2 rounded-xl text-[11px] font-black transition-all cursor-pointer tactile-active flex flex-col items-center justify-center ${
                        isSelected
                          ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs scale-[1.02]'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span>{count}</span>
                    </button>
                  );
                })}
              </div>

              <div className="text-[9.5px] text-[var(--text-secondary)] font-medium px-1">
                {maxPlayers <= 4 && '4 Pemain: Babak Semifinal & Grand Final.'}
                {maxPlayers === 6 && '6 Pemain: 2 Peserta Unggulan (Bye) + Semifinal + Final.'}
                {maxPlayers === 8 && '8 Pemain: Perempat Final, Semifinal, dan Grand Final.'}
                {maxPlayers >= 10 && `${maxPlayers} Pemain: Babak Penyisihan, 8 Besar, Semifinal, dan Grand Final.`}
              </div>
            </div>

            {/* Modern Apple-Style Glass Dropdown: Kategori Soal */}
            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10.5px] font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                <span>Kategori Soal Babak</span>
              </label>

              {/* Trigger Button */}
              <button
                type="button"
                onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                className="w-full px-4 py-3 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)] flex items-center justify-between text-left cursor-pointer tactile-active hover:border-[var(--accent-main)]/50 transition-all shadow-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-[15px]">
                    {selectedTheme === 'Semua Kategori (Acak)' ? 'ACAK' : 'TEMA'}
                  </span>
                  <span className="text-[12.5px] font-bold text-[var(--text-primary)] truncate">
                    {selectedTheme}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[var(--text-secondary)] transition-transform duration-200 shrink-0 ${
                    isThemeDropdownOpen ? 'rotate-180 text-[var(--accent-main)]' : ''
                  }`}
                />
              </button>

              {/* Apple Glass Dropdown Popover */}
              <AnimatePresence>
                {isThemeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute top-full left-0 right-0 mt-1.5 p-2.5 rounded-2xl backdrop-blur-2xl bg-white/95 dark:bg-[#1c1c1e]/95 border border-black/10 dark:border-white/15 shadow-2xl z-50 flex flex-col gap-2 max-h-[320px]"
                  >
                    {/* Search Input Filter */}
                    <div className="relative flex items-center px-2.5 py-2 rounded-xl bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10">
                      <Search className="w-3.5 h-3.5 text-[var(--text-secondary)] mr-2 shrink-0" />
                      <input
                        type="text"
                        value={themeSearchQuery}
                        onChange={(e) => setThemeSearchQuery(e.target.value)}
                        placeholder="Cari dari 61 tema soal..."
                        className="w-full bg-transparent text-[11.5px] font-bold text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-hidden"
                      />
                    </div>

                    {/* Scrollable Categories List */}
                    <div className="overflow-y-auto no-scrollbar flex flex-col gap-0.5 max-h-[250px] pr-0.5">
                      {/* Option 1: Semua Kategori (Acak) */}
                      <div
                        onClick={() => {
                          setSelectedTheme('Semua Kategori (Acak)');
                          setIsThemeDropdownOpen(false);
                          setThemeSearchQuery('');
                        }}
                        className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left cursor-pointer transition-colors ${
                          selectedTheme === 'Semua Kategori (Acak)'
                            ? 'bg-[var(--accent-light)] text-[var(--accent-main)] font-black'
                            : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Dice5 className="w-3.5 h-3.5 text-[var(--accent-main)] shrink-0" />
                          <span className="text-[12px] truncate font-bold">
                            Semua Kategori (Acak 61 Tema)
                          </span>
                        </div>
                        {selectedTheme === 'Semua Kategori (Acak)' && (
                          <Check className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[3] shrink-0" />
                        )}
                      </div>

                      {/* Filtered Themes from REALMS */}
                      {filteredThemes.map((r) => {
                        const isChosen = selectedTheme === r.name;
                        return (
                          <div
                            key={r.id}
                            onClick={() => {
                              setSelectedTheme(r.name);
                              setIsThemeDropdownOpen(false);
                              setThemeSearchQuery('');
                            }}
                            className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left cursor-pointer transition-colors ${
                              isChosen
                                ? 'bg-[var(--accent-light)] text-[var(--accent-main)] font-black'
                                : 'hover:bg-black/5 dark:hover:bg-white/5 text-[var(--text-primary)]'
                            }`}
                          >
                            <span className="text-[12px] truncate font-bold">
                              {r.name}
                            </span>
                            {isChosen && (
                              <Check className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[3] shrink-0" />
                            )}
                          </div>
                        );
                      })}

                      {filteredThemes.length === 0 && (
                        <div className="p-4 text-center text-[11px] text-[var(--text-secondary)] font-bold">
                          Tema tidak ditemukan
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pilihan Durasi Ronde */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10.5px] font-black uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                <span>Durasi Ronde Duel</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[60, 90].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setRoundDuration(dur)}
                    className={`py-2.5 px-3 rounded-2xl border text-[12px] font-black cursor-pointer tactile-active transition-all ${
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

            {/* Hadiah Pemenang */}
            <div
              className="p-3.5 rounded-[22px] border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden flex items-center justify-between"
              style={{
                background: 'linear-gradient(145deg, var(--accent-light) 0%, var(--bg-card) 65%, var(--accent-light) 100%)',
              }}
            >
              <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
              <div className="flex items-center gap-2 relative z-10">
                <Sparkles className="w-4 h-4 text-[var(--accent-main)]" />
                <span className="text-[11px] font-black text-[var(--text-primary)]">
                  Total Hadiah Juara
                </span>
              </div>
              <span className="text-[11.5px] font-black text-[var(--accent-main)] relative z-10">
                Trofi Emas + 200 Bintang
              </span>
            </div>
          </form>
        </div>

        {/* Sticky Bottom Action Bar */}
        <div className="w-full max-w-md mx-auto px-4 pt-3 pb-[max(16px,calc(10px+env(safe-area-inset-bottom)))] shrink-0 border-t border-black/5 dark:border-white/10 bg-inherit/90 backdrop-blur-md relative z-20">
          <button
            type="submit"
            form="create-tourney-form"
            className="w-full py-3.5 rounded-2xl bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[13px] font-black flex items-center justify-center gap-2 shadow-md cursor-pointer tactile-active hover:opacity-95 transition-opacity"
          >
            <span>Buat Turnamen & Buka Lobi</span>
            <ArrowRight className="w-4 h-4 stroke-[2.4]" />
          </button>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default CreateTournamentModal;
