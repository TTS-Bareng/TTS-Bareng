import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Swords, Zap, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { type CommunityTournament } from '../lib/tournament';

interface TournamentBracketDrawingOverlayProps {
  tournament: CommunityTournament;
  myId: string;
  onComplete: () => void;
}

export const TournamentBracketDrawingOverlay: React.FC<TournamentBracketDrawingOverlayProps> = ({
  tournament,
  myId,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'shuffling' | 'drawing' | 'ready'>('shuffling');

  // Find user's first round match
  const myMatch = tournament.matches.find(
    (m) => m.player1?.id === myId || m.player2?.id === myId
  );
  const opponent = myMatch
    ? myMatch.player1?.id === myId
      ? myMatch.player2
      : myMatch.player1
    : null;

  useEffect(() => {
    // Stage 1: Shuffling (0 - 1000ms)
    const t1 = setTimeout(() => {
      setPhase('drawing');
    }, 1100);

    // Stage 2: Ready & Confetti (1100 - 2400ms)
    const t2 = setTimeout(() => {
      setPhase('ready');
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
    }, 2000);

    // Auto complete at 3200ms
    const t3 = setTimeout(() => {
      onComplete();
    }, 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div
      style={{ background: 'var(--bg-gradient, var(--bg-app))' }}
      className="fixed inset-0 z-50 flex flex-col justify-between items-center p-4 sm:p-6 overflow-hidden select-none transition-colors duration-300"
    >
      {/* Top Meta Header */}
      <div className="w-full max-w-sm flex items-center justify-between pt-[max(12px,env(safe-area-inset-top))] relative z-10">
        <span className="text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] inline-flex items-center gap-1.5 shadow-2xs">
          <Zap className="w-3 h-3 stroke-[2.4]" />
          <span>SISTEM GUGUR ELEKTRONIK</span>
        </span>
        <button
          type="button"
          onClick={onComplete}
          className="text-[10px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10"
        >
          Lewati ➔
        </button>
      </div>

      {/* Main Center Dramatic Animation */}
      <div className="w-full max-w-sm my-auto flex flex-col items-center text-center gap-4 relative z-10">
        {/* Animated Trophy Emblem */}
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-[var(--accent-main)]/20 blur-2xl animate-pulse" />
          <motion.div
            initial={{ scale: 0.8, rotate: -8 }}
            animate={{ scale: [0.8, 1.05, 1], rotate: [0, 4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
            className="w-20 h-20 rounded-3xl bg-[var(--accent-light)] border border-[var(--accent-main)]/30 flex items-center justify-center text-[var(--accent-main)] shadow-xl relative z-10"
          >
            <Trophy className="w-10 h-10 fill-current" />
          </motion.div>
        </div>

        {/* Phase Titles */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-main)]">
            {tournament.name}
          </span>
          <h3 className="text-[20px] sm:text-[22px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
            {phase === 'shuffling' && 'Mengacak Slot Peserta...'}
            {phase === 'drawing' && 'Menghubungkan Garis Bagan...'}
            {phase === 'ready' && 'Bagan Pertandingan Terbentuk!'}
          </h3>
          <p className="text-[11px] text-[var(--text-secondary)] max-w-[90%]">
            Format: {tournament.maxPlayers} Pemain • {tournament.matches.length} Pertandingan Eliminasi
          </p>
        </div>

        {/* Dynamic Matchup Spotlight Card */}
        <AnimatePresence mode="wait">
          {phase === 'ready' ? (
            <motion.div
              key="ready-spotlight"
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full rounded-[26px] p-4 border border-[var(--accent-main)]/30 shadow-lg relative overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, var(--accent-light) 0%, var(--bg-card) 65%, var(--accent-light) 100%)',
              }}
            >
              <div className="absolute top-0 inset-x-0 h-px bg-white/30 pointer-events-none" />
              <div className="flex items-center justify-between mb-2">
                <span className="text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)]">
                  BABAK PERTAMAMU
                </span>
                <span className="text-[10px] font-bold text-[var(--accent-main)]">
                  {myMatch?.roundName || 'Babak 1'}
                </span>
              </div>

              <div className="grid grid-cols-5 items-center gap-2 my-2">
                {/* Player You */}
                <div className="col-span-2 flex flex-col items-center">
                  <div className="w-11 h-11 rounded-2xl bg-[var(--accent-main)] text-[var(--accent-contrast)] flex items-center justify-center font-black text-[14px] shadow-sm mb-1 border-2 border-white/20">
                    Kamu
                  </div>
                  <span className="text-[11px] font-black text-[var(--text-primary)] truncate max-w-full">
                    Kamu
                  </span>
                </div>

                {/* VS Icon */}
                <div className="col-span-1 flex flex-col items-center justify-center">
                  <div className="w-7 h-7 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/30 flex items-center justify-center text-[var(--accent-main)]">
                    <Swords className="w-3.5 h-3.5 stroke-[2.4]" />
                  </div>
                </div>

                {/* Opponent */}
                <div className="col-span-2 flex flex-col items-center">
                  <div className="w-11 h-11 rounded-2xl bg-black/5 dark:bg-white/10 text-[var(--text-primary)] flex items-center justify-center font-black text-[14px] shadow-sm mb-1 border border-[var(--border-card)]">
                    {opponent?.avatar ? (
                      <img src={opponent.avatar} alt={opponent.name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      opponent?.name?.charAt(0) || '?'
                    )}
                  </div>
                  <span className="text-[11px] font-black text-[var(--text-primary)] truncate max-w-full">
                    {opponent?.name || 'TBD (Menunggu)'}
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-[var(--border-card)] flex items-center justify-between text-[10px] text-[var(--text-secondary)] font-medium">
                <span>Durasi: {tournament.roundDurationSeconds}s/ronde</span>
                <span className="text-[var(--accent-main)] font-black flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Siap Tanding</span>
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="shuffling-preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full grid grid-cols-2 gap-2"
            >
              {tournament.players.slice(0, 4).map((p, i) => (
                <motion.div
                  key={p.id || i}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 0.6, delay: i * 0.1, repeat: Infinity }}
                  className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)] flex items-center gap-2"
                >
                  <div className="w-6 h-6 rounded-lg bg-[var(--accent-light)] text-[var(--accent-main)] text-[10px] font-black flex items-center justify-center">
                    {i + 1}
                  </div>
                  <span className="text-[11px] font-bold text-[var(--text-primary)] truncate">
                    {p.name}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA Button */}
      <div className="w-full max-w-sm pb-[max(14px,env(safe-area-inset-bottom))] relative z-10">
        <button
          type="button"
          onClick={onComplete}
          className="w-full py-3.5 rounded-2xl bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[13px] font-black flex items-center justify-center gap-2 shadow-md cursor-pointer tactile-active hover:opacity-95 transition-opacity"
        >
          <Sparkles className="w-4 h-4" />
          <span>Buka Bagan Pertandingan</span>
        </button>
      </div>
    </div>
  );
};
