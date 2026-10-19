import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Star, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { REALMS } from '../lib/realms';

export const LevelSelectModal: React.FC = () => {
  const {
    isLevelSelectOpen,
    closeLevelSelect,
    levels,
    currentLevelIndex,
    levelRecords,
    selectLevel,
    stars,
  } = useGameStore();

  const [selectedFilterRealm, setSelectedFilterRealm] = useState<string>('all');

  if (!isLevelSelectOpen) return null;

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalCompleted = Object.values(levelRecords).filter((r) => r.completed).length;

  const filteredLevels = levels
    .map((lvl, index) => ({ lvl, index }))
    .filter(({ lvl }) => {
      if (selectedFilterRealm === 'all') return true;
      const realm = REALMS.find((r) => r.id === selectedFilterRealm);
      return realm && lvl.category ? realm.categories.includes(lvl.category) : true;
    });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col justify-end select-none">
        {/* Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          exit={{ opacity: 0 }}
          onClick={closeLevelSelect}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Slide-up Glass Sheet (Apple Liquid Glass) */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-[430px] mx-auto max-h-[84vh] rounded-t-[32px] p-4.5 flex flex-col gap-2.5 shadow-2xl border-t border-black/5 dark:border-white/15 z-10 overflow-hidden liquid-glass-card"
        >
          {/* Top Specular Sheen Highlight */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Top Handle Pill */}
          <div
            onClick={closeLevelSelect}
            className="w-10 h-1.5 rounded-full bg-black/15 dark:bg-white/20 mx-auto cursor-pointer hover:bg-black/25 dark:hover:bg-white/35 transition-colors shrink-0"
          />

          {/* Header */}
          <div className="flex items-center justify-between pb-0.5 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[16px] font-black tracking-tight leading-tight">
                  Pilih Babak Kata
                </h3>
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
                  {totalCompleted}/{levels.length} Selesai
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 font-medium">
                Ganti babak langsung tanpa keluar dari arena permainan
              </p>
            </div>

            <button
              type="button"
              onClick={closeLevelSelect}
              aria-label="Tutup"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-primary)] cursor-pointer tactile-active border border-black/5 dark:border-white/10"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Quick Summary Pill Bar */}
          <div className="flex items-center justify-between p-2 rounded-2xl liquid-glass-card shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6.5 h-6.5 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center border border-[var(--accent-main)]/20">
                <Star className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-[7.5px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                  Total Tabungan
                </span>
                <span className="text-[11.5px] font-black leading-none">
                  {stars} Bintang
                </span>
              </div>
            </div>

            <span className="text-[9px] text-[var(--accent-main)] font-bold">
              {REALMS.length} Alam Nusantara
            </span>
          </div>

          {/* Horizontal Scrollable Realm Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedFilterRealm('all')}
              className={`px-2.5 py-1 rounded-full text-[9.5px] font-black shrink-0 transition-all cursor-pointer tactile-active ${
                selectedFilterRealm === 'all'
                  ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-2xs'
                  : 'bg-black/5 dark:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-black/5 dark:border-white/10'
              }`}
            >
              Semua ({levels.length})
            </button>
            {REALMS.map((r) => {
              const isSelected = selectedFilterRealm === r.id;
              const countInRealm = levels.filter((l) => l.category && r.categories.includes(l.category)).length;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedFilterRealm(r.id)}
                  className={`px-2.5 py-1 rounded-full text-[9.5px] font-bold shrink-0 transition-all cursor-pointer tactile-active ${
                    isSelected
                      ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-2xs'
                      : 'bg-black/5 dark:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-black/5 dark:border-white/10'
                  }`}
                >
                  {r.tag} ({countInRealm})
                </button>
              );
            })}
          </div>

          {/* Scrollable Chapter List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
            {filteredLevels.map(({ lvl, index }) => {
              const record = levelRecords[lvl.id];
              const isCurrent = index === currentLevelIndex;
              const isCompleted = !!record?.completed;
              const totalWords = (lvl.clues?.across?.length || 0) + (lvl.clues?.down?.length || 0);
              const rating = record?.rating || (isCompleted ? 3 : 0);
              const bestTime = record?.timeSpent ? formatDuration(record.timeSpent) : null;
              const accuracy = record?.accuracy;

              return (
                <div
                  key={lvl.id}
                  onClick={() => {
                    selectLevel(index);
                    closeLevelSelect();
                  }}
                  style={
                    isCompleted
                      ? { background: 'var(--accent-grad)' }
                      : isCurrent
                      ? { background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)' }
                      : undefined
                  }
                  className={`w-full rounded-[20px] p-3 sm:p-3.5 relative z-10 transition-all cursor-pointer tactile-active flex items-center justify-between gap-2.5 overflow-hidden group ${
                    isCompleted
                      ? 'border border-white/25 shadow-sm text-[var(--accent-contrast)]'
                      : isCurrent
                      ? 'border border-[var(--accent-main)]/30 shadow-xs'
                      : 'opacity-85 hover:opacity-100 liquid-glass-card border border-black/5 dark:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 relative z-10">
                    {/* Chapter Number Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-[12.5px] shrink-0 shadow-2xs ${
                        isCompleted
                          ? 'bg-white/25 text-[var(--accent-contrast)] border border-white/35 backdrop-blur-sm'
                          : isCurrent
                          ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                          : 'bg-black/5 dark:bg-white/10 text-[var(--text-secondary)] border border-black/5 dark:border-white/10'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.5]" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* Level Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                            isCompleted
                              ? 'bg-white/20 text-[var(--accent-contrast)]'
                              : 'bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]'
                          }`}
                        >
                          {lvl.category || 'Eksplorasi'}
                        </span>
                        {isCurrent && !isCompleted && (
                          <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)]">
                            Aktif
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-white/25 text-[var(--accent-contrast)] border border-white/30 font-bold backdrop-blur-sm">
                            Tuntas
                          </span>
                        )}
                      </div>

                      <h4
                        className={`text-[13.5px] font-black tracking-tight leading-tight truncate ${
                          isCompleted
                            ? 'text-[var(--accent-contrast)]'
                            : 'text-[var(--text-primary)]'
                        }`}
                      >
                        {lvl.title}
                      </h4>

                      {/* Micro stats row */}
                      <div
                        className={`flex items-center gap-2 mt-0.5 text-[9.5px] font-semibold ${
                          isCompleted
                            ? 'text-[var(--accent-contrast)]/80'
                            : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        <span>{totalWords} Kata</span>

                        {bestTime && (
                          <span
                            className={`flex items-center gap-0.5 ${
                              isCompleted
                                ? 'text-[var(--accent-contrast)]'
                                : 'text-[var(--text-primary)]'
                            }`}
                          >
                            <Clock
                              className={`w-2.5 h-2.5 stroke-[2.2] ${
                                isCompleted
                                  ? 'text-[var(--accent-contrast)]'
                                  : 'text-[var(--accent-main)]'
                              }`}
                            />
                            <span>{bestTime}</span>
                          </span>
                        )}

                        {accuracy !== undefined && (
                          <span
                            className={`flex items-center gap-0.5 ${
                              isCompleted
                                ? 'text-[var(--accent-contrast)]'
                                : 'text-[var(--text-primary)]'
                            }`}
                          >
                            <Sparkles
                              className={`w-2.5 h-2.5 stroke-[2.2] ${
                                isCompleted
                                  ? 'text-[var(--accent-contrast)]'
                                  : 'text-[var(--accent-main)]'
                              }`}
                            />
                            <span>{accuracy}%</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side: 1-3 Stars rating or Play button */}
                  <div className="flex flex-col items-end gap-1 shrink-0 relative z-10">
                    {isCompleted ? (
                      <div className="flex items-center gap-0.5 px-2 py-1 rounded-full bg-white/20 border border-white/25 backdrop-blur-sm">
                        {[1, 2, 3].map((starIdx) => (
                          <Star
                            key={starIdx}
                            className={`w-3 h-3 ${
                              starIdx <= rating
                                ? 'fill-[var(--accent-contrast)] text-[var(--accent-contrast)]'
                                : 'text-[var(--accent-contrast)]/30 stroke-[1.5]'
                            }`}
                          />
                        ))}
                      </div>
                    ) : (
                      <div
                        className={`w-7.5 h-7.5 rounded-full flex items-center justify-center transition-transform hover:scale-105 shadow-2xs ${
                          isCurrent
                            ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)]'
                            : 'bg-black/5 dark:bg-white/10 text-[var(--text-primary)]'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current ml-0.5 stroke-[0]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LevelSelectModal;
