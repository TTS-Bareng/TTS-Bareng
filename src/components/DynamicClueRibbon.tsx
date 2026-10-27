import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, ListOrdered, ChevronDown, ChevronUp, Shuffle, Check } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { findClueById } from '../lib/crossword';

interface DynamicClueRibbonProps {
  onOpenDrawer?: () => void;
}

export const DynamicClueRibbon: React.FC<DynamicClueRibbonProps> = ({ onOpenDrawer }) => {
  const {
    level,
    activeClueId,
    nextClue,
    prevClue,
    selectClue,
    solvedClues,
    openAnagramDrawer,
  } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // Fallback to first clue if none is active
  const activeClue = findClueById(level, activeClueId) || level.clues.across[0] || level.clues.down[0];

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Detect horizontal swipe intent (min 35px horizontal, deltaX > 1.4 * deltaY)
    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      if (deltaX < 0) {
        nextClue();
      } else {
        prevClue();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (!activeClue) {
    return (
      <div className="w-full px-3.5 pb-2 select-none z-20">
        <div className="w-full rounded-[22px] p-3 liquid-glass-card border border-black/5 dark:border-white/10 shadow-lg text-center">
          <p className="text-[12px] font-bold text-[var(--text-secondary)]">
            Ketuk salah satu kotak pada kisi untuk membaca petunjuk kata
          </p>
        </div>
      </div>
    );
  }

  // Ensure store knows this clue is active if it was fallback
  const handleSelectIfNone = () => {
    if (!activeClueId && activeClue) {
      selectClue(activeClue.id);
    }
  };

  return (
    <div className={`w-full px-3 select-none z-20 shrink-0 ${activeClueId ? 'pb-1' : 'pb-3.5'}`}>
      <div
        onClick={handleSelectIfNone}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full rounded-[22px] p-3 border border-black/5 dark:border-white/15 shadow-xl flex flex-col gap-1.5 transition-all relative overflow-hidden liquid-glass-card touch-pan-y"
      >
        {/* Specular Top Sheen Highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-white/25 pointer-events-none" />

        {/* ROW 1: STATUS, ARAH, JUMLAH HURUF & NAVIGASI */}
        <div className="flex items-center justify-between gap-1.5 relative z-10">
          <div className="flex items-center gap-1 min-w-0 flex-wrap">
            {/* Direction Pill Badge */}
            <span
              className="text-[9.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs shrink-0"
              style={{
                background: 'var(--accent-main)',
                color: 'var(--accent-contrast)',
              }}
            >
              {activeClue.direction === 'across' ? 'Mendatar' : 'Menurun'} {activeClue.number}
            </span>

            {/* Letter Count Badge */}
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 shrink-0 text-[var(--text-secondary)]">
              {activeClue.length} Huruf
            </span>

            {/* Solved Status Badge */}
            {solvedClues.includes(activeClue.id) && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/25 flex items-center gap-0.5 shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
                <span>Selesai</span>
              </span>
            )}
          </div>

          {/* Quick Navigation & Clue List Drawer Buttons */}
          <div className="flex items-center gap-1 shrink-0 z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevClue();
              }}
              title="Petunjuk Sebelumnya"
              aria-label="Petunjuk Sebelumnya"
              className="w-7.5 h-7.5 rounded-full flex items-center justify-center border border-black/5 dark:border-white/10 shadow-xs cursor-pointer tactile-active bg-[var(--accent-light)] text-[var(--accent-main)]"
            >
              <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextClue();
              }}
              title="Petunjuk Berikutnya"
              aria-label="Petunjuk Berikutnya"
              className="w-7.5 h-7.5 rounded-full flex items-center justify-center border border-black/5 dark:border-white/10 shadow-xs cursor-pointer tactile-active bg-[var(--accent-light)] text-[var(--accent-main)]"
            >
              <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <button
              type="button"
              disabled={solvedClues.includes(activeClue.id)}
              onClick={(e) => {
                e.stopPropagation();
                openAnagramDrawer();
              }}
              title="Bantuan Putar Huruf (Anagram Wheel)"
              aria-label="Bantuan Putar Huruf"
              className="w-7.5 h-7.5 rounded-full flex items-center justify-center border border-black/5 dark:border-white/10 shadow-xs cursor-pointer tactile-active bg-black/5 dark:bg-white/10 text-[var(--accent-main)] hover:bg-[var(--accent-light)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Shuffle className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>

            {onOpenDrawer && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDrawer();
                }}
                title="Lihat Seluruh Petunjuk"
                aria-label="Lihat Seluruh Petunjuk"
                className="w-7.5 h-7.5 rounded-full flex items-center justify-center border border-black/5 dark:border-white/10 shadow-xs cursor-pointer tactile-active bg-black/5 dark:bg-white/10 text-[var(--text-primary)]"
              >
                <ListOrdered className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
            )}
          </div>
        </div>

        {/* ROW 2: TEKS DEFINISI PENUH (TIDAK KAKU TERPOTONG + EXPANDABLE) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="relative z-10 cursor-pointer group mt-0.5"
        >
          <p
            className={`text-[12.5px] font-bold leading-snug transition-all duration-300 text-[var(--text-primary)] ${
              isExpanded ? '' : 'line-clamp-2'
            }`}
          >
            {activeClue.text}
          </p>

          <div className="flex items-center justify-between mt-1 text-[8.5px] opacity-65">
            <span className="text-[var(--text-secondary)]">
              {isExpanded ? 'Definisi lengkap' : 'Ketuk untuk membaca definisi lengkap'}
            </span>
            <span className="font-bold flex items-center gap-0.5 text-[var(--accent-main)]">
              {isExpanded ? (
                <>
                  <span>Ciutkan</span>
                  <ChevronUp className="w-2.5 h-2.5 stroke-[2.5]" />
                </>
              ) : (
                <>
                  <span>Perluas</span>
                  <ChevronDown className="w-2.5 h-2.5 stroke-[2.5]" />
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicClueRibbon;
