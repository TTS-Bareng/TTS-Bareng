import React, { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { ClueRow } from './ClueRow';
import { findClueById } from '../lib/crossword';

export const ClueCard: React.FC = () => {
  const { level, activeClueId } = useGameStore();
  const activeClue = findClueById(level, activeClueId);
  const [selectedTab, setSelectedTab] = useState<'across' | 'down'>('across');

  // If active clue is selected and user hasn't explicitly clicked tab during this clue, follow clue direction
  const tab = activeClue ? activeClue.direction : selectedTab;

  const activeClues = tab === 'across' ? level.clues.across : level.clues.down;

  return (
    <div
      className="w-full rounded-[24px] border border-[var(--border-card)] flex flex-col p-3.5 select-none transition-all duration-200 liquid-glass-card"
      style={{
        maxHeight: '36dvh',
      }}
    >
      {/* Segmented Pill: Mendatar / Menurun */}
      <div className="flex bg-black/10 dark:bg-white/10 rounded-full p-1 mb-2.5 shrink-0">
        <button
          type="button"
          onClick={() => setSelectedTab('across')}
          className={`flex-1 py-1.5 rounded-full text-[13px] font-bold transition-all duration-200 cursor-pointer ${
            tab === 'across'
              ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Mendatar ({level.clues.across.length})
        </button>
        <button
          type="button"
          onClick={() => setSelectedTab('down')}
          className={`flex-1 py-1.5 rounded-full text-[13px] font-bold transition-all duration-200 cursor-pointer ${
            tab === 'down'
              ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          Menurun ({level.clues.down.length})
        </button>
      </div>

      {/* Clues List */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {activeClues.map((clue) => (
          <ClueRow key={clue.id} clue={clue} />
        ))}
      </div>
    </div>
  );
};
