import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, Trophy, Users, Play, X, Clock, Sparkles } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export const ActiveGameResumeBanner: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    gameMode,
    level,
    currentLevelIndex,
    userInputs,
    solvedClues,
    isLevelCompleteOpen,
    isBattleResultOpen,
    isTournamentResultOpen,
    battleTimeLeft,
    tickBattleTimer,
    finishBattleRound,
    activeRoomCode,
    activeTournamentMatch,
    activeCommunityMatchId,
    leaveMabarSession,
    showGlobalToast,
  } = useGameStore();

  const isBattle = gameMode === '1v1_battle';
  const isTourney = Boolean(activeTournamentMatch || activeCommunityMatchId);
  const isMabar = Boolean(activeRoomCode && !isBattle);

  const totalClues = (level?.clues?.across?.length || 0) + (level?.clues?.down?.length || 0);
  const isSoloActive =
    gameMode === 'classic' &&
    !activeRoomCode &&
    (Object.keys(userInputs).length > 0 || solvedClues.length > 0) &&
    solvedClues.length < totalClues &&
    !isLevelCompleteOpen;

  const hasActiveSession = (isBattle || isTourney || isMabar || isSoloActive) && currentTab !== 'game';

  // Keep ticking battle timer in background when player is outside Game tab
  useEffect(() => {
    if (!isBattle || isBattleResultOpen || isTournamentResultOpen || currentTab === 'game') return;

    const timer = setInterval(() => {
      tickBattleTimer();
    }, 1000);

    return () => clearInterval(timer);
  }, [isBattle, isBattleResultOpen, isTournamentResultOpen, currentTab, tickBattleTimer]);

  if (!hasActiveSession) return null;

  const formatTime = (seconds: number) => {
    const m = Math.floor(Math.max(0, seconds) / 60);
    const s = Math.max(0, seconds) % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleResume = () => {
    setCurrentTab('game');
  };

  const handleForfeit = () => {
    if (isBattle) {
      if (window.confirm('Menyerah dari duel? Pertandingan akan dinyatakan kalah.')) {
        finishBattleRound();
      }
      return;
    }
    if (isTourney) {
      if (window.confirm('Tinggalkan babak turnamen? Pertandingan akan dibatalkan.')) {
        finishBattleRound();
      }
      return;
    }
    if (isMabar) {
      if (window.confirm('Tinggalkan sesi mabar bersama kawan?')) {
        leaveMabarSession();
        showGlobalToast('Keluar dari sesi mabar');
      }
      return;
    }
    if (isSoloActive) {
      if (window.confirm('Tinggalkan bab permainan ini?')) {
        useGameStore.setState({ userInputs: {}, solvedClues: [], lockedCells: {} });
        showGlobalToast('Sesi bab direset');
      }
    }
  };

  const isTimeCritical = isBattle && battleTimeLeft <= 15;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 35, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 25, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="fixed bottom-[max(76px,calc(64px+env(safe-area-inset-bottom)))] inset-x-3.5 max-w-[430px] mx-auto z-40 select-none pointer-events-auto"
      >
        <div
          className={`w-full rounded-[24px] p-3 border shadow-2xl flex items-center justify-between gap-3 relative overflow-hidden backdrop-blur-xl transition-all ${
            isTimeCritical
              ? 'border-red-500/50 bg-red-950/80 text-white animate-pulse'
              : 'border-[var(--accent-main)]/35 liquid-glass-card text-[var(--text-primary)]'
          }`}
          style={{
            background: isTimeCritical
              ? undefined
              : 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
          }}
        >
          {/* Top Specular Sheen */}
          <div className="absolute top-0 inset-x-0 h-px bg-white/30 pointer-events-none" />

          {/* Left Info Column */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-xs border ${
                isBattle
                  ? 'bg-[var(--accent-light)] border-[var(--accent-main)]/30 text-[var(--accent-main)]'
                  : isTourney
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-500'
                  : isMabar
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-500'
                  : 'bg-[var(--accent-light)] border-[var(--accent-main)]/25 text-[var(--accent-main)]'
              }`}
            >
              {isBattle ? (
                <Swords className="w-4 h-4 stroke-[2.4]" />
              ) : isTourney ? (
                <Trophy className="w-4 h-4 fill-current stroke-none" />
              ) : isMabar ? (
                <Users className="w-4 h-4 stroke-[2.2]" />
              ) : (
                <Sparkles className="w-4 h-4 stroke-[2.2]" />
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span
                  className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full border ${
                    isBattle
                      ? 'bg-[var(--accent-light)] border-[var(--accent-main)]/30 text-[var(--accent-main)]'
                      : isTourney
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-500'
                      : isMabar
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-500'
                      : 'bg-black/5 dark:bg-white/10 border-black/10 dark:border-white/15 text-[var(--text-secondary)]'
                  }`}
                >
                  {isBattle ? 'DUEL 1V1 AKTIF' : isTourney ? 'TURNAMEN' : isMabar ? 'MABAR LIVE' : 'PERMAINAN AKTIF'}
                </span>

                {isBattle && (
                  <span
                    className={`text-[9px] font-mono font-black flex items-center gap-0.5 ${
                      isTimeCritical ? 'text-red-400 font-bold' : 'text-[var(--accent-main)]'
                    }`}
                  >
                    <Clock className="w-2.5 h-2.5" />
                    <span>{formatTime(battleTimeLeft)}</span>
                  </span>
                )}
              </div>

              <h5 className="text-[12px] font-black leading-tight truncate">
                {level?.title || `Bab ${currentLevelIndex + 1}`}
              </h5>
              <span className="text-[8.5px] text-[var(--text-secondary)] font-medium">
                {solvedClues.length}/{totalClues} Kata Selesai
              </span>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 relative z-10">
            <button
              type="button"
              onClick={handleResume}
              className="py-1.5 px-3 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[11px] font-black flex items-center gap-1 cursor-pointer tactile-active shadow-sm hover:opacity-95 transition-opacity"
            >
              <Play className="w-3 h-3 fill-current stroke-none" />
              <span>Kembali</span>
            </button>

            <button
              type="button"
              onClick={handleForfeit}
              title="Akhiri Permainan"
              aria-label="Akhiri Permainan"
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer tactile-active transition-colors border border-black/5 dark:border-white/10"
            >
              <X className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ActiveGameResumeBanner;
