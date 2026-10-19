import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Settings, Star, Clock, ChevronDown, Zap, LogOut, Swords, Shield, Trophy } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { getBattlePalette } from '../lib/battlePalette';

export const Header: React.FC = () => {
  const {
    user,
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
    finishDailyRush,
    activeRoomCode,
    mabarPeers,
    leaveMabarSession,
    partnerReconnecting,
    battleConfig,
    battleCurrentRound,
    battleScores,
    battleTimeLeft,
    activeTournamentMatch,
    theme,
  } = useGameStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Live timer ticking while in game (classic mode)
  useEffect(() => {
    if (isLevelCompleteOpen || gameMode === 'daily_rush' || gameMode === '1v1_battle') return;

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
  const isBattle = gameMode === '1v1_battle';
  const palette = getBattlePalette(theme);
  const tournamentOpponent = activeTournamentMatch
    ? (activeTournamentMatch.player1.isPlayer ? activeTournamentMatch.player2 : activeTournamentMatch.player1)
    : null;
  const partnerPeer = mabarPeers.find((p) => p.name !== user.name);
  const partnerName = tournamentOpponent?.name || partnerPeer?.name || 'Lawan';

  return (
    <header className="w-full px-3.5 pt-[max(12px,env(safe-area-inset-top))] pb-1.5 flex flex-col gap-1.5 select-none shrink-0 z-20">
      <div className="flex items-center justify-between">
        {/* Back Button Bulat Kaca */}
        <button
          type="button"
          onClick={() => {
            if (activeTournamentMatch) {
              if (window.confirm('Tinggalkan babak Piala Nusantara? Pertandingan ini akan dibatalkan.')) {
                setCurrentTab('arena');
              }
              return;
            }
            if (isBattle) {
              if (window.confirm('Tinggalkan duel 1v1 yang sedang berjalan?')) {
                setCurrentTab('arena');
              }
              return;
            }
            if (isDailyRush) {
              if (window.confirm('Keluar dari sesi Daily Rush? Sisa waktu akan hangus.')) {
                finishDailyRush(false);
                setCurrentTab('home');
              }
              return;
            }
            setCurrentTab(previousTab && previousTab !== 'game' ? previousTab : 'arena');
          }}
          aria-label="Kembali"
          className="w-9 h-9 rounded-full flex items-center justify-center liquid-glass-card border border-black/5 dark:border-white/10 shadow-xs cursor-pointer tactile-active text-[var(--text-primary)] hover:opacity-90"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
        </button>

        {/* Center: Stage Bab & Level or Daily Rush Mode or 1v1 Battle or Mabar Mode */}
        {activeTournamentMatch ? (
          <div className="flex flex-col items-center text-center px-2 py-0.5">
            <div className="flex items-center gap-1 leading-none mb-0.5">
              <Trophy className="w-2.5 h-2.5 text-amber-500 fill-amber-500 stroke-[2]" />
              <span className="text-[8.5px] font-black uppercase tracking-wider text-amber-500">
                PIALA NUSANTARA • {activeTournamentMatch.roundTitle.toUpperCase()}
              </span>
            </div>
            <h2 className="text-[13.5px] font-black tracking-tight leading-tight text-[var(--text-primary)]">
              vs {tournamentOpponent?.name} ({tournamentOpponent?.origin})
            </h2>
          </div>
        ) : isBattle ? (
          <div className="flex flex-col items-center text-center px-2 py-0.5">
            <div className="flex items-center gap-1 leading-none mb-0.5">
              <Swords className="w-2.5 h-2.5 text-[var(--accent-main)] stroke-[3]" />
              <span className="text-[8.5px] font-black uppercase tracking-wider text-[var(--accent-main)]">
                RONDE {battleCurrentRound}/{battleConfig.rounds} • TUG-OF-WAR
              </span>
            </div>
            <h2 className="text-[14.5px] font-black tracking-tight leading-tight text-[var(--text-primary)]">
              {level.title}
            </h2>
          </div>
        ) : isDailyRush ? (
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
        ) : activeRoomCode ? (
          <div className="flex items-center gap-2 px-1.5 py-0.5 max-w-[55%] sm:max-w-[60%]">
            {/* Overlapping player avatars pill with connectivity dot */}
            <div className="flex items-center -space-x-1.5 shrink-0 relative">
              <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 border border-white/40 flex items-center justify-center shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] font-black">{user.name?.charAt(0) || 'K'}</span>
                )}
              </div>
              {mabarPeers.length > 1 ? (
                <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 border border-white/40 flex items-center justify-center shrink-0">
                  {mabarPeers.find((p) => p.name !== user.name)?.avatar ? (
                    <img
                      src={mabarPeers.find((p) => p.name !== user.name)?.avatar}
                      alt="Partner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-black">
                      {mabarPeers.find((p) => p.name !== user.name)?.name?.charAt(0) || 'T'}
                    </span>
                  )}
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 border border-dashed border-black/20 dark:border-white/20 flex items-center justify-center text-[10px] font-bold text-[var(--text-secondary)] shrink-0">
                  +
                </div>
              )}
            </div>

            <div className="flex flex-col text-left overflow-hidden">
              <div className="flex items-center gap-1 leading-none mb-0.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    partnerReconnecting
                      ? 'bg-amber-400 animate-ping'
                      : mabarPeers.length >= 2
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-400'
                  }`}
                />
                <span className="text-[8px] font-black uppercase tracking-wider text-[var(--accent-main)] truncate">
                  {partnerReconnecting
                    ? `MENYAMBUNG • ${activeRoomCode}`
                    : mabarPeers.length >= 2
                    ? `MABAR • ${activeRoomCode}`
                    : `MENUNGGU • ${activeRoomCode}`}
                </span>
              </div>
              <h2 className="text-[13.5px] font-black tracking-tight leading-tight text-[var(--text-primary)] truncate">
                {level.title}
              </h2>
            </div>
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

        {/* Right: Exit Mabar / Star Capsule / Settings */}
        <div className="flex items-center gap-1.5">
          {activeRoomCode && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Keluar dari sesi mabar Kamar ${activeRoomCode}?`)) {
                  leaveMabarSession();
                  setCurrentTab('arena');
                }
              }}
              aria-label="Keluar Sesi Mabar"
              className="w-8 h-8 rounded-full flex items-center justify-center liquid-glass-card border border-rose-500/25 text-rose-500 hover:bg-rose-500/10 cursor-pointer tactile-active shadow-xs"
              title="Keluar Sesi Mabar"
            >
              <LogOut className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          )}

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

      {/* Live Micro-Progress Bar & Live Timer / Daily Rush Countdown / 1v1 Tug-of-War Bar */}
      {isBattle ? (
        <div className="w-full flex flex-col gap-1 px-0.5 pt-0.5">
          <div className="flex items-center justify-between text-[9px] font-black">
            {/* Player 1 (Kamu) Score Chip */}
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full shadow-2xs"
              style={{ background: palette.p1.grad, color: palette.p1.text }}
            >
              <Shield className="w-2.5 h-2.5" />
              <span>{user.name || 'Kamu'}: {battleScores.local} Pts</span>
            </div>

            {/* Countdown Timer in Center */}
            <div
              className={`flex items-center gap-1 text-[10px] font-black ${
                battleTimeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-[var(--text-primary)]'
              }`}
            >
              <Clock className="w-3 h-3 stroke-[2.2]" />
              <span>{formatDuration(battleTimeLeft)}</span>
            </div>

            {/* Player 2 (Lawan) Score Chip */}
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full shadow-2xs"
              style={{ background: palette.p2.grad, color: palette.p2.text }}
            >
              <span>{partnerName}: {battleScores.partner} Pts</span>
              <Swords className="w-2.5 h-2.5" />
            </div>
          </div>

          {/* Real-time Dynamic Tug-of-War Split Bar */}
          <div className="w-full h-2 rounded-full overflow-hidden flex bg-black/10 dark:bg-white/10 border border-black/5 dark:border-white/10 relative">
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${
                  battleScores.local + battleScores.partner === 0
                    ? 50
                    : Math.max(5, Math.min(95, Math.round((battleScores.local / (battleScores.local + battleScores.partner)) * 100)))
                }%`,
                background: palette.p1.grad,
              }}
            />
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{
                width: `${
                  battleScores.local + battleScores.partner === 0
                    ? 50
                    : Math.max(5, Math.min(95, 100 - Math.round((battleScores.local / (battleScores.local + battleScores.partner)) * 100)))
                }%`,
                background: palette.p2.grad,
              }}
            />
            {/* Center Split Pin */}
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-0.5 bg-white shadow-xs z-10 opacity-80" />
          </div>
        </div>
      ) : (
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
      )}
    </header>
  );
};

export default Header;
