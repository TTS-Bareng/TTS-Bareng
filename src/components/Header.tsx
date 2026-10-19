import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Star, Clock, ChevronDown, Zap } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export const Header: React.FC = () => {
  const {
    stars,
    openSettings,
    setCurrentTab,
    previousTab,
    level,
    currentLevelIndex,
    solvedClues,
    openLevelSelect,
    levelStartTime,
    isLevelCompleteOpen,
    gameMode,
    dailyRushTimeLeft,
  } = useGameStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live timer ticking while in game (classic mode)
  useEffect(() => {
    if (isLevelCompleteOpen || gameMode === 'daily_rush') return;

    const updateTimer = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - levelStartTime) / 1000)));
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [levelStartTime, isLevelCompleteOpen, gameMode]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalClues = (level.clues.across?.length || 0) + (level.clues.down?.length || 0);
  const solvedCount = solvedClues.length;
  const progressPercent = totalClues > 0 ? Math.round((solvedCount / totalClues) * 100) : 0;
  const isDailyRush = gameMode === 'daily_rush';

  return (
    <header className="w-full px-3.5 pt-3 pb-1.5 flex flex-col gap-1.5 select-none shrink-0 z-20">
      <div className="flex items-center justify-between">
        {/* Back Button Bulat Kaca */}
        <button
          type="button"
          onClick={() => setCurrentTab(previousTab && previousTab !== 'game' ? previousTab : 'arena')}
          aria-label="Kembali"
          className="w-9 h-9 rounded-full flex items-center justify-center liquid-glass-card border border-black/5 dark:border-white/10 shadow-xs cursor-pointer tactile-active text-[var(--text-primary)] hover:opacity-90"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Center: Stage Bab & Level or Daily Rush Mode */}
        {isDailyRush ? (
          <div className="flex flex-col items-center text-center px-2 py-0.5">
            <div className="flex items-center gap-1 leading-none mb-0.5">
              <Zap className="w-2.5 h-2.5 text-[var(--accent-main)] stroke-[3]" />
              <span className="text-[8.5px] font-black uppercase tracking-wider text-[var(--accent-main)]">
                DAILY RUSH • 90S KILAT
              </span>
            </div>
            <h2 className="text-[14.5px] font-black tracking-tight leading-tight text-[var(--text-primary)]">
              {level.title}
            </h2>
          </div>
        ) : (
          <motion.button
            type="button"
            key={level.id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            onClick={openLevelSelect}
            className="flex flex-col items-center text-center px-2 py-0.5 rounded-xl tactile-active cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
            title="Buka Daftar Bab"
            aria-label="Buka Daftar Bab"
          >
            <div className="flex items-center gap-1 leading-none mb-0.5">
              <span className="text-[8.5px] font-black uppercase tracking-wider text-[var(--accent-main)]">
                BAB {currentLevelIndex + 1} • LEVEL {currentLevelIndex + 1}
              </span>
              <ChevronDown className="w-2.5 h-2.5 text-[var(--accent-main)] stroke-[3] group-hover:translate-y-0.5 transition-transform" />
            </div>
            <h2 className="text-[14.5px] font-black tracking-tight leading-tight text-[var(--text-primary)]">
              {level.title}
            </h2>
          </motion.button>
        )}

        {/* Right: Star Capsule & Settings */}
        <div className="flex items-center gap-1.5">
          <div className="h-8 px-2.5 rounded-full flex items-center gap-1.5 liquid-glass-card border border-black/5 dark:border-white/10 shadow-xs">
            <Star className="w-3.5 h-3.5 fill-[var(--accent-main)] text-[var(--accent-main)] drop-shadow-2xs" />
            <span className="text-[11.5px] font-black text-[var(--text-primary)]">
              {stars}
            </span>
          </div>

          <button
            type="button"
            onClick={openSettings}
            aria-label="Pengaturan"
            className="w-8 h-8 rounded-full flex items-center justify-center liquid-glass-card border border-black/5 dark:border-white/10 shadow-xs cursor-pointer tactile-active text-[var(--text-primary)] hover:opacity-90"
          >
            <Settings className="w-3.5 h-3.5 stroke-[2]" />
          </button>
        </div>
      </div>

      {/* Live Micro-Progress Bar & Live Timer / Daily Rush Countdown */}
      <div className="w-full flex items-center justify-between gap-2.5 px-0.5 pt-0.5">
        <div className={`flex items-center gap-1 text-[9.5px] font-bold shrink-0 ${
          isDailyRush
            ? dailyRushTimeLeft <= 10
              ? 'text-[var(--accent-main)] font-black animate-pulse'
              : 'text-[var(--text-primary)] font-black'
            : 'text-[var(--text-secondary)]'
        }`}>
          {isDailyRush ? (
            <Zap className="w-3 h-3 text-[var(--accent-main)] stroke-[2.5]" />
          ) : (
            <Clock className="w-3 h-3 text-[var(--accent-main)] stroke-[2.2]" />
          )}
          <span>{formatDuration(isDailyRush ? dailyRushTimeLeft : elapsedSeconds)}</span>
        </div>

        <div className="flex-1 h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{
              width: `${Math.max(3, isDailyRush ? Math.round((dailyRushTimeLeft / 90) * 100) : progressPercent)}%`,
              background: isDailyRush && dailyRushTimeLeft <= 10 ? 'var(--accent-main)' : 'var(--accent-grad)',
            }}
          />
        </div>

        <span className="text-[9.5px] font-bold shrink-0 text-[var(--text-secondary)]">
          {solvedCount}/{totalClues} Kata ({progressPercent}%)
        </span>
      </div>
    </header>
  );
};

export default Header;
