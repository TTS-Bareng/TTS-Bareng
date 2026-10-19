import React, { useState } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

interface ClueListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClueListDrawer: React.FC<ClueListDrawerProps> = ({ isOpen, onClose }) => {
  const { level, currentLevelIndex, activeClueId, solvedClues, selectClue } = useGameStore();
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');
  const dragControls = useDragControls();

  const currentClues = selectedDirection === 'across' ? level.clues.across : level.clues.down;
  const totalClues = level.clues.across.length + level.clues.down.length;
  const solvedCount = solvedClues.length;

  const handleClueClick = (clueId: string) => {
    selectClue(clueId);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Slide-up Glass Sheet Container with Native Drag-to-Dismiss */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 350) {
                onClose();
              }
            }}
            className="relative w-full max-w-[430px] mx-auto max-h-[74vh] rounded-t-[32px] px-4.5 pt-4.5 pb-[max(1.125rem,calc(0.75rem+env(safe-area-inset-bottom)))] flex flex-col gap-3 shadow-2xl border-t border-black/5 dark:border-white/15 z-10 overflow-hidden liquid-glass-card"
          >
            {/* Specular Top Sheen */}
            <div className="absolute top-0 inset-x-0 h-px bg-white/25 pointer-events-none" />

            {/* Top Handle Pill - Draggable */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="w-full flex flex-col items-center pt-0 pb-1 cursor-grab active:cursor-grabbing touch-none select-none shrink-0"
            >
              <div
                onClick={onClose}
                className="w-12 h-1.5 rounded-full bg-black/20 dark:bg-white/25 mx-auto hover:bg-black/30 dark:hover:bg-white/40 transition-colors"
              />
            </div>

            {/* Header - Also draggable */}
            <div
              onPointerDown={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                dragControls.start(e);
              }}
              className="flex items-center justify-between pb-1 shrink-0 cursor-grab active:cursor-grabbing select-none"
            >
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
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
};

export default ClueListDrawer;
