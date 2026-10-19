import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export const GlossyButton: React.FC = () => {
  const { checkAnswers, userInputs } = useGameStore();

  const hasAnyInput = Object.keys(userInputs).length > 0;

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96, y: 1 }}
      onClick={checkAnswers}
      disabled={!hasAnyInput}
      aria-label="Periksa Jawaban"
      className={`relative w-[180px] h-[50px] rounded-full flex items-center justify-center gap-2 cursor-pointer select-none overflow-hidden outline-none transition-all duration-200 ${
        hasAnyInput ? 'opacity-100' : 'opacity-50 cursor-not-allowed'
      }`}
      style={{
        background: 'var(--accent-grad)',
        boxShadow: 'var(--shadow-glossy)',
      }}
    >
      {/* Liquid gloss top reflection curve */}
      <div
        className="absolute top-0 left-0 right-0 h-[50%] rounded-t-full pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, 0.15) 80%, rgba(255, 255, 255, 0) 100%)',
        }}
      />

      {/* Button Text & Icon */}
      <div className="relative z-10 flex items-center gap-1.5 drop-shadow-sm">
        <Sparkles className="w-4 h-4 text-[var(--accent-contrast)] fill-[var(--accent-contrast)]/30" />
        <span className="text-[15px] font-bold text-[var(--accent-contrast)] tracking-[0.2px]">
          Periksa
        </span>
      </div>
    </motion.button>
  );
};
