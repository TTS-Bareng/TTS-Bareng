import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { findClueById } from '../lib/crossword';

export const ActiveClueBar: React.FC = () => {
  const { level, activeClueId, userInputs, nextClue, prevClue } = useGameStore();

  const activeClue = findClueById(level, activeClueId);
  if (!activeClue) return null;

  // Calculate progress: how many letters in this clue are filled
  const filledCount = activeClue.cells.filter(([r, c]) => !!userInputs[`${r},${c}`]).length;

  return (
    <div
      className="w-full flex items-center justify-between px-3 py-2 border-b border-[var(--border-card)] backdrop-blur-md select-none"
      style={{ backgroundColor: 'var(--glass-fill, var(--bg-card))' }}
    >
      {/* Previous Clue Button */}
      <button
        type="button"
        onClick={prevClue}
        aria-label="Petunjuk Sebelumnya"
        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 text-[var(--text-primary)] shrink-0 transition-transform cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
      </button>

      {/* Clue Text & Progress */}
      <div className="flex-1 mx-2 text-center overflow-hidden">
        <div className="flex items-center justify-center gap-1.5 mb-0.5">
          <span
            className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--accent-main)', color: 'var(--accent-contrast)' }}
          >
            {activeClue.direction === 'across' ? 'Mendatar' : 'Menurun'} {activeClue.number}
          </span>
          <span className="text-[11px] font-bold text-[var(--text-secondary)]">
            ({filledCount}/{activeClue.length})
          </span>
        </div>
        <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-tight truncate px-1">
          {activeClue.text}
        </p>
      </div>

      {/* Next Clue Button */}
      <button
        type="button"
        onClick={nextClue}
        aria-label="Petunjuk Berikutnya"
        className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 text-[var(--text-primary)] shrink-0 transition-transform cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 stroke-[2.2]" />
      </button>
    </div>
  );
};
