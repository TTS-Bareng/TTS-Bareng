import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Shuffle, RotateCcw, Check, X, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { findClueById } from '../lib/crossword';
import { soundManager } from '../lib/audio';
import { haptic } from '../lib/haptics';

function scrambleLetters(word: string, _seed = 0): string[] {
  const letters = word.toUpperCase().split('');
  if (letters.length <= 2) return letters;

  const scrambled = [...letters];
  let attempts = 0;
  // Ensure the scrambled version is not identical to the original word
  while (attempts < 10) {
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]];
    }
    if (scrambled.join('') !== word.toUpperCase()) break;
    attempts++;
  }
  return scrambled;
}

export const AnagramWheelDrawer: React.FC = () => {
  const {
    level,
    activeClueId,
    isAnagramDrawerOpen,
    closeAnagramDrawer,
    applyAnagramWord,
    soundEnabled,
    hapticEnabled,
  } = useGameStore();

  const activeClue = useMemo(() => {
    return findClueById(level, activeClueId);
  }, [level, activeClueId]);

  const dragControls = useDragControls();
  const targetAnswer = activeClue?.answer?.toUpperCase() || '';
  const [shuffleKey, setShuffleKey] = useState(0);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [prevClueId, setPrevClueId] = useState<string | null>(activeClueId);

  // Reset selection and shuffle when active clue changes
  if (activeClueId !== prevClueId) {
    setPrevClueId(activeClueId);
    setSelectedIndices([]);
    setShuffleKey(0);
  }

  // Derive scrambled letters from targetAnswer and shuffle key
  const bankLetters = useMemo(() => {
    if (!targetAnswer) return [];
    return scrambleLetters(targetAnswer, shuffleKey);
  }, [targetAnswer, shuffleKey]);

  const handleReshuffle = useCallback(() => {
    if (!targetAnswer) return;
    setShuffleKey((prev) => prev + 1);
    setSelectedIndices([]);
    if (soundEnabled) soundManager.playKeyClick();
    if (hapticEnabled) {
      haptic.medium(15);
    }
  }, [targetAnswer, soundEnabled, hapticEnabled]);

  const handlePickLetter = (bankIdx: number) => {
    if (selectedIndices.includes(bankIdx)) return;
    if (selectedIndices.length >= targetAnswer.length) return;

    setSelectedIndices((prev) => [...prev, bankIdx]);
    if (soundEnabled) soundManager.playKeyClick();
    if (hapticEnabled) {
      haptic.light(8);
    }
  };

  const handleRemoveLetter = (indexInSelected: number) => {
    setSelectedIndices((prev) => prev.filter((_, idx) => idx !== indexInSelected));
    if (soundEnabled) soundManager.playFocusTick();
  };

  const handleClearTrial = () => {
    setSelectedIndices([]);
    if (soundEnabled) soundManager.playFocusTick();
  };

  const currentSpelled = selectedIndices.map((idx) => bankLetters[idx]).join('');
  const isMatch = currentSpelled === targetAnswer;

  const handleApplyToBoard = () => {
    if (!currentSpelled) return;
    applyAnagramWord(currentSpelled);
    if (soundEnabled) soundManager.playReward();
  };

  return (
    <AnimatePresence>
      {isAnagramDrawerOpen && activeClue && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 select-none">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAnagramDrawer}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer Window with Native Drag-to-Dismiss */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 350) {
                closeAnagramDrawer();
              }
            }}
            className="relative w-full max-w-[430px] rounded-t-[32px] px-5 pt-5 pb-[max(1.25rem,calc(0.75rem+env(safe-area-inset-bottom)))] liquid-glass-card border-t border-[var(--accent-main)]/30 shadow-2xl flex flex-col items-center overflow-hidden z-10"
            style={{
              background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-surface) 100%)',
            }}
          >
            {/* Top specular highlight */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* Grab Handle Header - Draggable on mobile */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="w-full flex flex-col items-center pt-0 pb-2 cursor-grab active:cursor-grabbing touch-none select-none shrink-0"
            >
              <div
                onClick={closeAnagramDrawer}
                className="w-12 h-1.5 rounded-full bg-black/20 dark:bg-white/25 mx-auto hover:bg-black/30 dark:hover:bg-white/40 transition-colors"
              />
            </div>

            {/* Header Row - Also draggable */}
            <div
              onPointerDown={(e) => {
                if ((e.target as HTMLElement).closest('button')) return;
                dragControls.start(e);
              }}
              className="w-full flex items-center justify-between mb-2 cursor-grab active:cursor-grabbing select-none"
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                  style={{
                    background: 'var(--accent-main)',
                    color: 'var(--accent-contrast)',
                  }}
                >
                  {activeClue.direction === 'across' ? 'Mendatar' : 'Menurun'} {activeClue.number}
                </span>
                <span className="text-[10.5px] font-bold text-[var(--text-secondary)]">
                  {activeClue.length} Huruf
                </span>
              </div>

              <button
                type="button"
                onClick={closeAnagramDrawer}
                className="w-7 h-7 rounded-full bg-white/10 dark:bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer tactile-active"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          {/* Clue Text Definition */}
          <div className="w-full text-left p-3 rounded-2xl bg-white/5 border border-white/10 mb-4">
            <p className="text-[12px] font-semibold text-[var(--text-primary)] leading-snug">
              {activeClue.text}
            </p>
          </div>

          {/* Trial Word Slot Bar */}
          <div className="w-full flex items-center justify-center gap-1.5 mb-4 px-1 min-h-[52px]">
            {Array.from({ length: targetAnswer.length }).map((_, slotIdx) => {
              const letter = selectedIndices[slotIdx] !== undefined ? bankLetters[selectedIndices[slotIdx]] : '';
              return (
                <button
                  key={`slot-${slotIdx}`}
                  type="button"
                  onClick={() => selectedIndices[slotIdx] !== undefined && handleRemoveLetter(slotIdx)}
                  className={`w-9.5 h-11 sm:w-11 sm:h-12 rounded-[14px] flex items-center justify-center font-black text-base sm:text-lg transition-all tactile-active ${
                    letter
                      ? isMatch
                        ? 'bg-emerald-500 text-white shadow-sm border border-emerald-400'
                        : 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs border border-[var(--accent-main)]'
                      : 'bg-black/5 dark:bg-white/5 border-2 border-dashed border-black/10 dark:border-white/15 text-transparent'
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {/* Helper Instruction & Controls Bar */}
          <div className="w-full flex items-center justify-between mb-3 px-1 text-[10.5px] font-semibold text-[var(--text-secondary)]">
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-main)]" />
              <span>Susun huruf acak berikut:</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReshuffle}
                className="flex items-center gap-1 py-1 px-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-[var(--text-primary)] text-[10px] font-bold cursor-pointer tactile-active"
              >
                <Shuffle className="w-3 h-3 stroke-[2.2]" />
                <span>Kocok</span>
              </button>

              {selectedIndices.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearTrial}
                  className="flex items-center gap-1 py-1 px-2.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-[var(--text-secondary)] text-[10px] font-bold cursor-pointer tactile-active"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Ulang</span>
                </button>
              )}
            </div>
          </div>

          {/* Scramble Letter Bank Tiles */}
          <div className="w-full flex flex-wrap items-center justify-center gap-2 mb-4 px-2">
            {bankLetters.map((char, bankIdx) => {
              const isUsed = selectedIndices.includes(bankIdx);
              return (
                <button
                  key={`bank-${bankIdx}`}
                  type="button"
                  disabled={isUsed}
                  onClick={() => handlePickLetter(bankIdx)}
                  className={`w-10 h-11 sm:w-12 sm:h-12 rounded-[16px] font-black text-base sm:text-lg flex items-center justify-center transition-all tactile-active ${
                    isUsed
                      ? 'bg-black/5 dark:bg-white/5 text-[var(--text-secondary)]/30 border border-transparent scale-90 cursor-not-allowed'
                      : 'bg-white/10 dark:bg-white/10 hover:bg-white/20 text-[var(--text-primary)] border border-black/5 dark:border-white/15 shadow-sm active:scale-95 cursor-pointer'
                  }`}
                >
                  {char}
                </button>
              );
            })}
          </div>

          {/* Action CTAs */}
          <div className="w-full flex flex-col gap-2 pt-1">
            {currentSpelled.length === targetAnswer.length && (
              <button
                type="button"
                onClick={handleApplyToBoard}
                className="w-full py-3 px-4 rounded-full font-black text-xs inline-flex items-center justify-center gap-2 transition-all tactile-active shadow-md cursor-pointer"
                style={{
                  background: isMatch ? '#10B981' : 'var(--accent-grad)',
                  color: '#FFFFFF',
                }}
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>
                  {isMatch ? 'Tepat! Terapkan ke Papan' : 'Terapkan Tebakan ke Papan'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={closeAnagramDrawer}
              className="w-full py-2.5 px-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-[var(--text-primary)] font-bold text-xs transition-all tactile-active cursor-pointer"
            >
              Kembali ke Papan
            </button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
};
