import React from 'react';
import { Check } from 'lucide-react';
import type { ClueItem } from '../lib/crossword';
import { useGameStore } from '../store/useGameStore';

interface ClueRowProps {
  clue: ClueItem;
}

export const ClueRow: React.FC<ClueRowProps> = ({ clue }) => {
  const { activeClueId, solvedClues, selectClue } = useGameStore();
  const isActive = activeClueId === clue.id;
  const isSolved = solvedClues.includes(clue.id);

  return (
    <button
      type="button"
      onClick={() => selectClue(clue.id)}
      className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-150 flex items-start gap-2.5 cursor-pointer tactile-active ${
        isActive
          ? 'bg-[var(--accent-main)]/15 border border-[var(--accent-main)]/50 shadow-sm'
          : 'hover:bg-black/5 dark:hover:bg-white/10 border border-transparent'
      }`}
    >
      {/* Number Badge */}
      <span
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 mt-0.5 ${
          isActive
            ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)]'
            : isSolved
            ? 'bg-[var(--accent-light)] text-[var(--accent-main)]'
            : 'bg-black/10 dark:bg-white/20 text-[var(--text-primary)]'
        }`}
      >
        {isSolved ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : clue.number}
      </span>

      {/* Clue Text & Length */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-[13px] leading-[18px] font-medium ${
            isSolved
              ? 'line-through opacity-60 text-[var(--text-secondary)]'
              : 'text-[var(--text-primary)]'
          }`}
        >
          {clue.text}
        </p>
      </div>

      {/* Length pill */}
      <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-black/10 dark:bg-white/10 text-[var(--text-secondary)] shrink-0 self-center">
        {clue.length}
      </span>
    </button>
  );
};
