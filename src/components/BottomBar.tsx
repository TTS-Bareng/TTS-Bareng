import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { GlossyButton } from './GlossyButton';

export const BottomBar: React.FC = () => {
  const { activeClueId, nextClue, prevClue } = useGameStore();

  const isNavActive = activeClueId !== null;

  return (
    <div className="w-full flex items-center justify-center gap-3 py-1 select-none">
      {/* Previous Clue (<) */}
      <button
        type="button"
        onClick={prevClue}
        disabled={!isNavActive}
        aria-label="Petunjuk Sebelumnya"
        className={`w-11 h-11 rounded-full flex items-center justify-center border border-[var(--border-card)] backdrop-blur-md transition-all ${
          isNavActive
            ? 'bg-white/10 hover:bg-white/20 active:scale-95 text-[var(--text-primary)] cursor-pointer shadow-sm'
            : 'bg-white/5 text-[var(--text-secondary)] opacity-35 cursor-not-allowed'
        }`}
      >
        <ChevronLeft className="w-5 h-5 stroke-[2.4]" />
      </button>

      {/* Glossy Pill: Periksa */}
      <GlossyButton />

      {/* Next Clue (>) */}
      <button
        type="button"
        onClick={nextClue}
        disabled={!isNavActive}
        aria-label="Petunjuk Berikutnya"
        className={`w-11 h-11 rounded-full flex items-center justify-center border border-[var(--border-card)] backdrop-blur-md transition-all ${
          isNavActive
            ? 'bg-white/10 hover:bg-white/20 active:scale-95 text-[var(--text-primary)] cursor-pointer shadow-sm'
            : 'bg-white/5 text-[var(--text-secondary)] opacity-35 cursor-not-allowed'
        }`}
      >
        <ChevronRight className="w-5 h-5 stroke-[2.4]" />
      </button>
    </div>
  );
};
