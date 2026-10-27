import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Zap,
  X,
  CheckCircle2,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import {
  quickMatchmaking,
  type MatchFoundResult,
} from '../lib/quickMatchmaking';
import { getEloTier } from '../lib/eloSystem';
import { MASCOTS } from '../assets/maskots';
import { soundManager } from '../lib/audio';
import { haptic } from '../lib/haptics';

export const QuickMatchModal: React.FC = () => {
  const {
    isQuickMatchModalOpen,
    closeQuickMatchModal,
    startQuickMatchBattle,
    battleConfig,
    setBattleConfig,
    user,
    soundEnabled,
    hapticEnabled,
    levels,
    eloRating,
  } = useGameStore();

  const [queueState, setQueueState] = useState<'searching' | 'matched'>('searching');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [matchedData, setMatchedData] = useState<MatchFoundResult | null>(null);

  const matchedRef = useRef<MatchFoundResult | null>(null);

  const isSpeedRace = battleConfig.mode === 'speed_race';
  const isOffline = typeof navigator !== 'undefined' && !navigator.onLine;

  // Handle Matchmaking Start & Teardown
  useEffect(() => {
    if (!isQuickMatchModalOpen) {
      quickMatchmaking.cancelSearch();
      setQueueState('searching');
      setElapsedSeconds(0);
      setCountdown(3);
      setMatchedData(null);
      matchedRef.current = null;
      return;
    }

    setQueueState('searching');
    setElapsedSeconds(0);
    setCountdown(3);
    setMatchedData(null);
    matchedRef.current = null;

    if (soundEnabled) soundManager.playFocusTick();
    if (hapticEnabled) haptic.selection();

    // Start timer for searching display
    const elapsedInterval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    quickMatchmaking.startSearch({
      user: {
        id: user.name,
        name: user.name || 'Pemain',
        avatar: user.avatar || MASCOTS.crosswordChampion,
        stars: 100,
        rating: eloRating,
      },
      mode: battleConfig.mode === 'speed_race' ? 'speed_race' : 'tug_of_war',
      totalLevels: levels.length || 60,
      onStatusChange: (status) => {
        setQueueState(status);
      },
      onMatchFound: (result) => {
        clearInterval(elapsedInterval);
        matchedRef.current = result;
        setMatchedData(result);
        setQueueState('matched');

        if (soundEnabled) soundManager.playReward();
        if (hapticEnabled) haptic.success([30, 60, 30]);

        // Start 3-second countdown before game starts
        let currentCount = 3;
        setCountdown(3);
        const countInterval = setInterval(() => {
          currentCount -= 1;
          setCountdown(currentCount);
          if (soundEnabled) soundManager.playFocusTick();
          if (hapticEnabled) haptic.light(15);

          if (currentCount <= 0) {
            clearInterval(countInterval);
            startQuickMatchBattle(result);
          }
        }, 1000);
      },
    });

    return () => {
      clearInterval(elapsedInterval);
      quickMatchmaking.cancelSearch();
    };
  }, [
    isQuickMatchModalOpen,
    battleConfig.mode,
    user.name,
    user.avatar,
    levels.length,
    soundEnabled,
    hapticEnabled,
    startQuickMatchBattle,
  ]);

  if (!isQuickMatchModalOpen) return null;

  const handleCancel = () => {
    if (soundEnabled) soundManager.playFocusTick();
    quickMatchmaking.cancelSearch();
    closeQuickMatchModal();
  };

  const handleSwitchMode = (mode: 'speed_race' | 'tug_of_war') => {
    if (queueState === 'matched') return;
    if (soundEnabled) soundManager.playFocusTick();
    if (hapticEnabled) haptic.selection();

    setBattleConfig({
      mode,
      durationSeconds: mode === 'speed_race' ? 60 : 90,
      rounds: mode === 'speed_race' ? 1 : 3,
      wordCount: 'short',
    });
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          exit={{ opacity: 0 }}
          onClick={handleCancel}
          className="absolute inset-0 bg-black/65 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="relative w-full max-w-[350px] rounded-[32px] p-5 text-center flex flex-col items-center gap-3.5 shadow-2xl z-10 border border-black/5 dark:border-white/15 liquid-glass-card overflow-hidden"
        >
          {/* Top Specular Sheen */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Close / Cancel Button */}
          <button
            type="button"
            onClick={handleCancel}
            aria-label="Tutup"
            className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer z-20"
          >
            <X className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>

          {/* ============================================================
              STATE 1: SEARCHING / MENCARI LAWAN
              ============================================================ */}
          {queueState === 'searching' && (
            <div className="w-full flex flex-col items-center gap-3">
              {/* Header Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border bg-[var(--accent-light)] border-[var(--accent-main)]/25 text-[var(--accent-main)]">
                <Swords className="w-3 h-3" />
                <span className="text-[9.5px] font-black uppercase tracking-wider">
                  {isOffline ? 'LATIHAN TANDING BOT (OFFLINE)' : 'CARI LAWAN CEPAT 1V1'}
                </span>
              </div>

              {/* Radar Scanning Visual Container */}
              <div className="relative w-36 h-36 flex items-center justify-center my-2">
                {/* Concentric Ripple Rings */}
                <motion.div
                  animate={{ scale: [1, 2.1], opacity: [0.65, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full border border-[var(--accent-main)]/40 pointer-events-none"
                />
                <motion.div
                  animate={{ scale: [1, 2.1], opacity: [0.65, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: 0.7, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full border border-[var(--accent-main)]/30 pointer-events-none"
                />
                <motion.div
                  animate={{ scale: [1, 2.1], opacity: [0.65, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, delay: 1.4, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full border border-[var(--accent-main)]/20 pointer-events-none"
                />

                {/* Central Player Avatar */}
                <div className="relative w-18 h-18 rounded-full p-1 bg-[var(--accent-grad)] shadow-xl z-10 flex items-center justify-center overflow-hidden">
                  <img
                    src={user.avatar || MASCOTS.crosswordChampion}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full bg-white/20"
                  />
                  <div className="absolute inset-0 rounded-full border-2 border-white/60 pointer-events-none" />
                </div>
              </div>

              {/* Title & Searching Status */}
              <div className="flex flex-col items-center">
                <h3 className="text-[17px] font-black tracking-tight text-[var(--text-primary)] leading-tight">
                  {isOffline ? 'Memulai Sparing Bot AI...' : 'Mencari Penantang...'}
                </h3>
                <span className="text-[14px] font-black text-[var(--accent-main)] mt-0.5 tracking-wider font-mono">
                  {formatTimer(elapsedSeconds)}
                </span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[9.5px] font-bold text-[var(--text-secondary)] mt-1">
                  <span className="text-[12px]">{getEloTier(eloRating).icon}</span>
                  <span>Rating: <strong className="text-[var(--text-primary)] font-black">{eloRating} ELO</strong> ({getEloTier(eloRating).title})</span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-1 leading-snug max-w-[260px]">
                  Memindai pemain online di seluruh Indonesia. Duel akan segera dimulai!
                </p>
              </div>

              {/* Mode Switcher Buttons */}
              <div className="w-full max-w-[280px] grid grid-cols-2 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 mt-1">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('speed_race')}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-black cursor-pointer tactile-active flex items-center justify-center gap-1 transition-all ${
                    isSpeedRace
                      ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Zap className="w-3 h-3 stroke-[2.4]" />
                  <span>Speed Race 60s</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchMode('tug_of_war')}
                  className={`py-1.5 px-2 rounded-xl text-[10px] font-black cursor-pointer tactile-active flex items-center justify-center gap-1 transition-all ${
                    !isSpeedRace
                      ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Swords className="w-3 h-3 stroke-[2.4]" />
                  <span>Tug-of-War</span>
                </button>
              </div>

              {/* Cancel Button */}
              <button
                type="button"
                onClick={handleCancel}
                className="w-full py-2.5 rounded-2xl bg-black/5 dark:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-bold text-[12px] cursor-pointer tactile-active transition-colors mt-0.5"
              >
                Batalkan Pencarian
              </button>
            </div>
          )}

          {/* ============================================================
              STATE 2: MATCHED / LAWAN DITEMUKAN!
              ============================================================ */}
          {queueState === 'matched' && matchedData && (
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full flex flex-col items-center gap-3 pt-1"
            >
              {/* Match Found Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)]">
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {matchedData.opponent.isBot ? 'SPARING BOT AI SIAP!' : 'LAWAN DITEMUKAN!'}
                </span>
              </div>

              <h3 className="text-[18px] font-black tracking-tight text-[var(--text-primary)] leading-tight">
                Bersiap untuk Bertanding!
              </h3>

              {/* VS Confrontation Card */}
              <div className="w-full rounded-[24px] p-3.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between gap-2 my-1">
                {/* Player 1 (You) */}
                <div className="flex-1 flex flex-col items-center text-center gap-1">
                  <div className="w-13 h-13 rounded-full overflow-hidden p-0.5 bg-[var(--accent-grad)] shadow-sm relative">
                    <img
                      src={user.avatar || MASCOTS.crosswordChampion}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-full bg-white/20"
                    />
                  </div>
                  <span className="text-[11px] font-black truncate max-w-[95px] text-[var(--text-primary)]">
                    {user.name || 'Kamu'}
                  </span>
                  <span className="text-[7.5px] font-black px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)]">
                    {eloRating} ELO • {getEloTier(eloRating).title}
                  </span>
                </div>

                {/* Center Swords / Lightning Badge */}
                <div className="flex flex-col items-center justify-center shrink-0 px-1">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] shadow-sm">
                    {isSpeedRace ? (
                      <Zap className="w-4 h-4 stroke-[2.5]" />
                    ) : (
                      <Swords className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </div>
                  <span className="text-[9px] font-black text-[var(--text-secondary)] mt-1 tracking-wider">
                    VS
                  </span>
                </div>

                {/* Player 2 (Opponent) */}
                <div className="flex-1 flex flex-col items-center text-center gap-1">
                  <div className="w-13 h-13 rounded-full overflow-hidden p-0.5 bg-[var(--accent-grad)] shadow-sm relative">
                    <img
                      src={matchedData.opponent.avatar || MASCOTS.crosswordDuel}
                      alt={matchedData.opponent.name}
                      className="w-full h-full object-cover rounded-full bg-white/20"
                    />
                  </div>
                  <span className="text-[11px] font-black truncate max-w-[95px] text-[var(--text-primary)]">
                    {matchedData.opponent.name}
                  </span>
                  {(() => {
                    const oppElo = (matchedData.opponent as { rating?: number }).rating || 1100;
                    return (
                      <span className="text-[7.5px] font-black px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/20">
                        {oppElo} ELO • {getEloTier(oppElo).title}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Countdown Bar & Starting Indicator */}
              <div className="w-full flex flex-col items-center gap-1.5 mt-1">
                <div className="text-[28px] font-black text-[var(--accent-main)] font-mono tracking-tight leading-none animate-pulse">
                  {countdown}
                </div>
                <span className="text-[10.5px] font-bold text-[var(--text-secondary)]">
                  Memulai duel dalam {countdown} detik...
                </span>
                <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mt-1">
                  <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                    className="h-full bg-[var(--accent-main)] rounded-full"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
