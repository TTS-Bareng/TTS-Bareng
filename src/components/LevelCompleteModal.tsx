import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Star, ArrowRight, Home, Sparkles, Clock, BookOpen, Share2 } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';
import { createDeepLink, shareOrCopy } from '../lib/deeplink';

export const LevelCompleteModal: React.FC = () => {
  const {
    isLevelCompleteOpen,
    closeLevelComplete,
    restartLevel,
    goToNextLevel,
    setCurrentTab,
    level,
    levels,
    currentLevelIndex,
    levelRecords,
    openLexicon,
    showGlobalToast,
  } = useGameStore();

  const totalWords = (level.clues?.across?.length || 0) + (level.clues?.down?.length || 0);
  const starsEarned = totalWords * 10;
  const hasNextLevel = currentLevelIndex < levels.length - 1;

  const currentRecord = levelRecords[level.id];
  const timeSpent = currentRecord?.timeSpent || 35;
  const accuracy = currentRecord?.accuracy || 100;
  const rating = currentRecord?.rating || (accuracy >= 90 ? 3 : accuracy >= 75 ? 2 : 1);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Find featured vocabulary word (longest word in the chapter)
  const allClues = [...(level.clues?.across || []), ...(level.clues?.down || [])];
  const featuredClue = allClues.reduce(
    (max, curr) => (curr.answer.length > (max?.answer.length || 0) ? curr : max),
    allClues[0]
  );

  const handleShareLevel = async () => {
    const levelUrl = createDeepLink({ level: currentLevelIndex + 1 });
    const formattedTime = formatDuration(timeSpent);
    const result = await shareOrCopy({
      title: `Tantangan TTS Quest: ${level.title}`,
      text: `Saya menyelesaikan Bab ${currentLevelIndex + 1} (${level.title}) dalam ${formattedTime} dengan akurasi ${accuracy}%! Bisakah kamu menuntaskannya?`,
      url: levelUrl,
    });

    if (result === 'shared') {
      showGlobalToast('Tautan tantangan dibagikan!');
    } else if (result === 'copied') {
      showGlobalToast('Tautan tantangan bab disalin!');
    }
  };

  return (
    <AnimatePresence>
      {isLevelCompleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            onClick={closeLevelComplete}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card Content (Vibrant Hero Gradient) */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 25 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            style={{
              background: 'var(--hero-grad, var(--accent-grad))',
              color: '#ffffff',
            }}
            className="relative w-full max-w-[340px] max-h-[92vh] overflow-y-auto rounded-[32px] p-5 text-center flex flex-col items-center gap-3 shadow-2xl z-10 border border-white/20 text-white"
          >
            {/* Top Specular Sheen Highlight & Ambient Glow */}
            <div className="absolute top-0 inset-x-0 h-px bg-white/40 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-black/20 blur-2xl pointer-events-none" />

            {/* Celebratory Mascot (Fierce Plush Crossword Champion) */}
            <div className="relative w-28 h-28 my-0.5 flex items-center justify-center shrink-0">
              <motion.img
                initial={{ y: 10, scale: 0.9 }}
                animate={{ y: [0, -6, 0], scale: 1 }}
                transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
                src={MASCOTS.crosswordChampion}
                alt="Selebrasi Kemenangan"
                className="w-full h-full object-contain filter drop-shadow-xl"
              />
            </div>

            {/* 3 Animated Performance Stars Rating */}
            <div className="flex items-center justify-center gap-2 my-0.5">
              {[1, 2, 3].map((starIdx) => (
                <motion.div
                  key={starIdx}
                  initial={{ scale: 0, rotate: -25 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15 + starIdx * 0.12, type: 'spring', damping: 14 }}
                >
                  <Star
                    className={`w-6 h-6 ${
                      starIdx <= rating
                        ? 'fill-white text-white drop-shadow-md'
                        : 'text-white/30 stroke-[1.5]'
                    }`}
                  />
                </motion.div>
              ))}
            </div>

            {/* Title & Badge */}
            <div>
              <span className="text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-white backdrop-blur-sm">
                BAB {currentLevelIndex + 1} TUNTAS
              </span>
              <h3 className="text-[19px] font-black tracking-tight text-white mt-1.5 leading-tight">
                Luar Biasa, Jawara!
              </h3>
              <p className="text-[10.5px] text-white/85 mt-0.5 leading-snug px-1">
                Seluruh {totalWords} kata teka-teki silang pada {level.title} berhasil dipecahkan.
              </p>
            </div>

            {/* Bento Metrik Kemenangan Riil (3 Kolom: Waktu, Akurasi, Bintang) */}
            <div className="w-full grid grid-cols-3 gap-1.5 p-2 rounded-2xl border border-white/20 bg-black/15 dark:bg-black/25 backdrop-blur-md my-0.5">
              <div className="flex flex-col items-center">
                <span className="text-[8.5px] text-white/75 font-medium">Waktu</span>
                <div className="flex items-center gap-1 text-white font-black text-[13px] mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-white" />
                  <span>{formatDuration(timeSpent)}</span>
                </div>
              </div>

              <div className="flex flex-col items-center border-x border-white/15">
                <span className="text-[8.5px] text-white/75 font-medium">Akurasi</span>
                <div className="flex items-center gap-1 text-white font-black text-[13px] mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>{accuracy}%</span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[8.5px] text-white/75 font-medium">Bintang</span>
                <div className="flex items-center gap-0.5 text-white font-black text-[13px] mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>+{starsEarned}</span>
                </div>
              </div>
            </div>

            {/* Vocabulary Payoff Card (Wawasan Kosakata Bab Ini) */}
            {featuredClue && (
              <div className="w-full p-2.5 rounded-2xl border border-white/20 bg-black/15 dark:bg-black/25 backdrop-blur-md text-left flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-white">
                    <BookOpen className="w-3 h-3 stroke-[2.2]" />
                    <span className="text-[8px] font-black uppercase tracking-wider text-white/90">
                      Wawasan Kosakata Bab
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      closeLevelComplete();
                      openLexicon();
                    }}
                    className="text-[8.5px] text-white font-bold hover:underline cursor-pointer tactile-active flex items-center gap-0.5 opacity-90 hover:opacity-100"
                  >
                    <span>Buku Kosakata</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[12.5px] font-black tracking-wider uppercase text-white">
                    {featuredClue.answer}
                  </span>
                </div>
                <p className="text-[10px] text-white/80 leading-snug line-clamp-2">
                  {featuredClue.text}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-1.5 pt-0.5">
              {hasNextLevel ? (
                <button
                  type="button"
                  onClick={() => {
                    goToNextLevel();
                    closeLevelComplete();
                  }}
                  className="w-full py-2.5 px-4 rounded-full font-black text-[12px] bg-white cursor-pointer tactile-active shadow-md transition-transform"
                  style={{ color: 'var(--hero-btn-text, #111113)' }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>Lanjut Bab Berikutnya</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </span>
                </button>
              ) : null}

              <button
                type="button"
                onClick={handleShareLevel}
                className="w-full py-2 rounded-full border border-white/30 font-bold text-[11px] text-white flex items-center justify-center gap-1.5 cursor-pointer tactile-active bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Tantang Teman di Bab Ini</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  restartLevel();
                  closeLevelComplete();
                }}
                className="w-full py-2 rounded-full border border-white/25 font-bold text-[11px] text-white flex items-center justify-center gap-1.5 cursor-pointer tactile-active bg-white/15 hover:bg-white/25 backdrop-blur-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Main Ulang Bab Ini</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeLevelComplete();
                  setCurrentTab('arena');
                }}
                className="w-full py-1.5 rounded-full text-[10.5px] font-semibold text-white/80 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Kembali ke Arena</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LevelCompleteModal;
