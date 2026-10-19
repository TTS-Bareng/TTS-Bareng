import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

interface ClueListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClueListDrawer: React.FC<ClueListDrawerProps> = ({ isOpen, onClose }) => {
  const { level, currentLevelIndex, activeClueId, solvedClues, selectClue } = useGameStore();
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');

  if (!isOpen) return null;

  const currentClues = selectedDirection === 'across' ? level.clues.across : level.clues.down;
  const totalClues = level.clues.across.length + level.clues.down.length;
  const solvedCount = solvedClues.length;

  const handleClueClick = (clueId: string) => {
    selectClue(clueId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-up Glass Sheet Container */}
      <div
        className="relative w-full max-w-[430px] mx-auto max-h-[72vh] rounded-t-[32px] p-4.5 flex flex-col gap-3 shadow-2xl border-t border-black/5 dark:border-white/15 z-10 overflow-hidden liquid-glass-card"
      >
        {/* Specular Top Sheen */}
        <div className="absolute top-0 inset-x-0 h-px bg-white/25 pointer-events-none" />

        {/* Top Handle Pill */}
        <div
          onClick={onClose}
          className="w-10 h-1.5 rounded-full bg-black/15 dark:bg-white/20 mx-auto cursor-pointer hover:bg-white/40 transition-colors shrink-0"
        />

        {/* Header */}
        <div className="flex items-center justify-between pb-1 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-black tracking-tight leading-tight">
                Daftar Semua Petunjuk
              </h3>
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
                {solvedCount}/{totalClues} Selesai
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] mt-0.5 font-medium">
              Bab {currentLevelIndex + 1} • {level.title}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-primary)] cursor-pointer tactile-active"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* Direction Segmented Switcher */}
        <div className="flex bg-black/5 dark:bg-white/10 rounded-full p-1 shrink-0">
          <button
            type="button"
            onClick={() => setSelectedDirection('across')}
            className={`flex-1 py-1.5 rounded-full text-[11.5px] font-black transition-all cursor-pointer tactile-active ${
              selectedDirection === 'across'
                ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Mendatar ({level.clues.across.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedDirection('down')}
            className={`flex-1 py-1.5 rounded-full text-[11.5px] font-black transition-all cursor-pointer tactile-active ${
              selectedDirection === 'down'
                ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Menurun ({level.clues.down.length})
          </button>
        </div>

        {/* Clues Scrollable List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {currentClues.map((clue) => {
            const isSolved = solvedClues.includes(clue.id);
            const isActive = activeClueId === clue.id;

            return (
              <div
                key={clue.id}
                onClick={() => handleClueClick(clue.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer tactile-active flex items-start justify-between gap-2.5 ${
                  isActive
                    ? 'bg-[var(--accent-main)]/15 border-[var(--accent-main)] shadow-xs'
                    : isSolved
                    ? 'bg-black/[0.02] dark:bg-white/[0.02] border-black/5 dark:border-white/5 opacity-60'
                    : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 hover:border-[var(--accent-main)]/30'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0 flex-1">
                  {/* Number Badge */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 ${
                      isSolved
                        ? 'bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/20'
                        : isActive
                        ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)]'
                        : 'bg-black/10 dark:bg-white/10 text-[var(--text-secondary)]'
                    }`}
                  >
                    {isSolved ? (
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                    ) : (
                      clue.number
                    )}
                  </div>

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-[12px] font-bold leading-snug ${
                        isSolved
                          ? 'line-through text-[var(--text-secondary)]'
                          : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {clue.text}
                    </p>
                  </div>
                </div>

                {/* Length Badge */}
                <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[var(--text-secondary)] shrink-0 self-center">
                  {clue.length} Huruf
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClueListDrawer;
