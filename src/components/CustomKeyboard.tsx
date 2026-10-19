import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Star, RotateCcw, Delete, ArrowRight } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

const ROW_1 = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];
const ROW_2 = ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'];
const ROW_3 = ['Z', 'X', 'C', 'V', 'B', 'N', 'M'];

export const CustomKeyboard: React.FC = () => {
  const {
    activeClueId,
    inputLetter,
    deleteLetter,
    closeKeyboard,
    checkAnswers,
    useHint,
    clearActiveWord,
    nextClue,
  } = useGameStore();

  const isVisible = activeClueId !== null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
          className="w-full flex flex-col z-30 select-none touch-manipulation relative overflow-hidden"
          style={{
            backgroundColor: 'var(--keyboard-bg)',
          }}
        >
          {/* Top Handle Pill (Tap to minimize) */}
          <div
            onClick={closeKeyboard}
            className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto my-1 cursor-pointer hover:bg-white/40 transition-colors shrink-0"
            title="Sembunyikan Keyboard"
          />

          {/* Quick Utility Action Bar */}
          <div className="w-full px-3 pt-0.5 pb-1 flex items-center justify-between gap-1.5 shrink-0">
            {/* 1. Check Current Word */}
            <button
              type="button"
              onClick={checkAnswers}
              className="flex-1 py-1.5 px-2.5 rounded-xl text-[10.5px] font-black flex items-center justify-center gap-1.5 cursor-pointer tactile-active shadow-sm transition-all"
              style={{
                background: 'var(--accent-grad)',
                color: 'var(--accent-contrast)',
              }}
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Periksa Kata</span>
            </button>

            {/* 2. Hint (-10★) */}
            <button
              type="button"
              onClick={useHint}
              className="py-1.5 px-3 rounded-xl text-[10.5px] font-bold flex items-center gap-1 border border-black/5 dark:border-white/10 shadow-xs cursor-pointer tactile-active bg-black/5 dark:bg-white/10 text-[var(--text-primary)] hover:bg-black/10"
            >
              <Star className="w-3.5 h-3.5 fill-[var(--accent-main)] text-[var(--accent-main)]" />
              <span>Hint (-10★)</span>
            </button>

            {/* 3. Clear Active Word */}
            <button
              type="button"
              onClick={clearActiveWord}
              title="Hapus Huruf Kata Ini"
              aria-label="Hapus Huruf Kata Ini"
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-black/5 dark:border-white/10 shadow-xs cursor-pointer tactile-active bg-black/5 dark:bg-white/10 text-[var(--text-primary)] hover:bg-black/10"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>

            {/* 4. Minimize / Hide Keyboard */}
            <button
              type="button"
              onClick={closeKeyboard}
              title="Sembunyikan Keyboard"
              aria-label="Sembunyikan Keyboard"
              className="w-8 h-8 rounded-xl flex items-center justify-center border border-black/5 dark:border-white/10 shadow-xs cursor-pointer tactile-active bg-black/5 dark:bg-white/10 text-[var(--text-primary)] hover:bg-black/10"
            >
              <ChevronDown className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* QWERTY Tactile Apple Liquid Keys */}
          <div className="w-full p-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex flex-col gap-1 select-none">
            {/* Row 1 */}
            <div className="flex justify-center gap-1">
              {ROW_1.map((char) => (
                <button
                  key={char}
                  type="button"
                  onClick={() => inputLetter(char)}
                  className="flex-1 h-10.5 max-w-[38px] rounded-[8px] font-black text-[15px] flex items-center justify-center tactile-active transition-transform active:scale-95 cursor-pointer shadow-xs"
                  style={{
                    backgroundColor: 'var(--key-bg)',
                    color: 'var(--key-text)',
                    boxShadow: 'var(--key-shadow)',
                  }}
                >
                  {char}
                </button>
              ))}
            </div>

            {/* Row 2 */}
            <div className="flex justify-center gap-1 px-2.5">
              {ROW_2.map((char) => (
                <button
                  key={char}
                  type="button"
                  onClick={() => inputLetter(char)}
                  className="flex-1 h-10.5 max-w-[38px] rounded-[8px] font-black text-[15px] flex items-center justify-center tactile-active transition-transform active:scale-95 cursor-pointer shadow-xs"
                  style={{
                    backgroundColor: 'var(--key-bg)',
                    color: 'var(--key-text)',
                    boxShadow: 'var(--key-shadow)',
                  }}
                >
                  {char}
                </button>
              ))}
            </div>

            {/* Row 3 */}
            <div className="flex justify-center gap-1">
              {/* Next Word Button */}
              <button
                type="button"
                onClick={nextClue}
                title="Petunjuk Berikutnya"
                aria-label="Petunjuk Berikutnya"
                className="flex-[1.3] h-10.5 rounded-[8px] font-bold text-[11px] flex items-center justify-center gap-1 tactile-active transition-transform active:scale-95 cursor-pointer shadow-xs bg-[var(--accent-light)] text-[var(--accent-main)]"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>

              {ROW_3.map((char) => (
                <button
                  key={char}
                  type="button"
                  onClick={() => inputLetter(char)}
                  className="flex-1 h-10.5 max-w-[38px] rounded-[8px] font-black text-[15px] flex items-center justify-center tactile-active transition-transform active:scale-95 cursor-pointer shadow-xs"
                  style={{
                    backgroundColor: 'var(--key-bg)',
                    color: 'var(--key-text)',
                    boxShadow: 'var(--key-shadow)',
                  }}
                >
                  {char}
                </button>
              ))}

              {/* Backspace Button */}
              <button
                type="button"
                onClick={deleteLetter}
                title="Hapus Huruf"
                aria-label="Hapus Huruf"
                className="flex-[1.3] h-10.5 rounded-[8px] font-bold text-[12px] flex items-center justify-center tactile-active transition-transform active:scale-95 cursor-pointer shadow-xs bg-black/10 dark:bg-white/10 text-[var(--text-primary)]"
              >
                <Delete className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CustomKeyboard;
