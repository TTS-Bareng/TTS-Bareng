import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  X,
  Swords,
  Clock,
  RotateCcw,
  Shield,
  Medal,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import {
  type TournamentRoundKey,
  ROUND_NAMES,
  type TournamentMatch,
} from '../lib/tournament';

const ROUND_KEYS: TournamentRoundKey[] = [
  'round_of_16',
  'quarter_final',
  'semi_final',
  'final',
];

export const TournamentCupModal: React.FC = () => {
  const {
    isTournamentOpen,
    closeTournament,
    tournamentState,
    resetTournament,
    startTournamentMatch,
    trophies,
  } = useGameStore();

  const [selectedRound, setSelectedRound] = useState<TournamentRoundKey>(
    tournamentState.currentRound || 'round_of_16'
  );

  if (!isTournamentOpen) return null;

  const currentRoundKey = tournamentState.currentRound;
  const currentMatches = tournamentState.matches[selectedRound] || [];
  const activePlayerMatch = tournamentState.matches[currentRoundKey]?.find((m) => m.isPlayerMatch);
  const isPlayerEliminated = tournamentState.playerStatus === 'eliminated';
  const isPlayerChampion = tournamentState.playerStatus === 'champion';

  const upcomingOpponent = activePlayerMatch
    ? activePlayerMatch.player1.isPlayer
      ? activePlayerMatch.player2
      : activePlayerMatch.player1
    : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 select-none">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeTournament}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-[430px] h-[92vh] max-h-[820px] rounded-[32px] liquid-glass-modal p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-2xl z-10 border border-white/20 dark:border-white/10"
          style={{
            background: 'var(--bg-card)',
          }}
        >
          {/* Top Specular Sheen */}
          <div className="absolute top-0 inset-x-0 h-px bg-white/40 pointer-events-none" />

          {/* Header Section */}
          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-xs">
                  <Trophy className="w-5 h-5 fill-amber-500 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-[17px] font-black text-[var(--text-primary)] leading-tight flex items-center gap-1.5">
                    <span>Piala Nusantara</span>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
                      16 Besar
                    </span>
                  </h3>
                  <span className="text-[10px] font-semibold text-[var(--text-secondary)]">
                    Turnamen Sistem Gugur Nusantara • Musim 1
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeTournament}
                aria-label="Tutup"
                className="w-8 h-8 rounded-full flex items-center justify-center liquid-glass-card border border-black/5 dark:border-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer tactile-active"
              >
                <X className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>

            {/* Trophy Records Showcase Pill */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[10px] font-black">
              <span className="text-[var(--text-secondary)] uppercase tracking-wider text-[8.5px]">
                Koleksi Trofi:
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-500">
                  <Trophy className="w-3.5 h-3.5 fill-amber-500 stroke-none" />
                  <span>{trophies.gold} Emas</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Medal className="w-3.5 h-3.5 stroke-[2]" />
                  <span>{trophies.silver} Perak</span>
                </div>
                <div className="flex items-center gap-1 text-amber-700 dark:text-amber-600">
                  <Shield className="w-3.5 h-3.5 stroke-[2]" />
                  <span>{trophies.bronze} Perunggu</span>
                </div>
              </div>
            </div>

            {/* Round Tab Selector */}
            <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
              {ROUND_KEYS.map((rKey) => {
                const isActive = selectedRound === rKey;
                const isCurrentLive = currentRoundKey === rKey;
                const rInfo = ROUND_NAMES[rKey];

                return (
                  <button
                    key={rKey}
                    type="button"
                    onClick={() => setSelectedRound(rKey)}
                    className={`py-1.5 px-1 rounded-xl text-[10px] font-black flex flex-col items-center transition-all cursor-pointer tactile-active ${
                      isActive
                        ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{rInfo.short}</span>
                    {isCurrentLive && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full mt-0.5 animate-pulse ${
                          isActive ? 'bg-[var(--accent-contrast)]' : 'bg-amber-500'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matches Bracket Scroll Area */}
          <div className="flex-1 overflow-y-auto my-2.5 pr-0.5 space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
                {ROUND_NAMES[selectedRound].title} • {currentMatches.length} Pertandingan
              </span>
              <span className="text-[9.5px] font-bold text-[var(--accent-main)]">
                Durasi {ROUND_NAMES[selectedRound].duration}s
              </span>
            </div>

            {currentMatches.map((match: TournamentMatch, idx: number) => {
              const isMatchFinished = match.status === 'completed';
              const isCurrentPlayerMatch = match.isPlayerMatch && !isMatchFinished;
              const isPlayerParticipating = match.isPlayerMatch;

              return (
                <div
                  key={match.id}
                  className={`w-full p-2.5 rounded-2xl transition-all relative overflow-hidden border ${
                    isCurrentPlayerMatch
                      ? 'border-amber-400 bg-amber-500/10 dark:bg-amber-500/15 ring-2 ring-amber-400/30 shadow-md'
                      : isPlayerParticipating
                      ? 'border-[var(--accent-main)]/50 bg-[var(--accent-light)]'
                      : 'border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.02]'
                  }`}
                >
                  {/* Top Match Tag */}
                  <div className="flex items-center justify-between text-[8px] font-bold text-[var(--text-secondary)] mb-1.5">
                    <span>MATCH #{idx + 1}</span>
                    {isCurrentPlayerMatch && (
                      <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-black animate-pulse">
                        PERTANDINGANMU!
                      </span>
                    )}
                    {isMatchFinished && (
                      <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black">
                        SELESAI
                      </span>
                    )}
                  </div>

                  {/* Duelist Row 1 */}
                  <div
                    className={`flex items-center justify-between p-1.5 rounded-xl transition-colors ${
                      match.winner?.id === match.player1.id
                        ? 'bg-emerald-500/15 font-black text-emerald-600 dark:text-emerald-400'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 border border-white/30 shrink-0">
                        {match.player1.avatar ? (
                          <img
                            src={match.player1.avatar}
                            alt={match.player1.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-black flex items-center justify-center h-full">
                            {match.player1.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11.5px] font-black truncate flex items-center gap-1">
                          {match.player1.name}
                          {match.player1.isPlayer && (
                            <span className="text-[8px] px-1 py-0.2 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)]">
                              Kamu
                            </span>
                          )}
                        </span>
                        <span className="text-[8.5px] text-[var(--text-secondary)] truncate">
                          {match.player1.origin} • {match.player1.title}
                        </span>
                      </div>
                    </div>

                    <div className="text-[12px] font-black shrink-0 px-2">
                      {isMatchFinished ? match.player1Score ?? '-' : `${match.player1.speedRating}⚡`}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="my-1 border-t border-black/5 dark:border-white/10" />

                  {/* Duelist Row 2 */}
                  <div
                    className={`flex items-center justify-between p-1.5 rounded-xl transition-colors ${
                      match.winner?.id === match.player2.id
                        ? 'bg-emerald-500/15 font-black text-emerald-600 dark:text-emerald-400'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-white/20 border border-white/30 shrink-0">
                        {match.player2.avatar ? (
                          <img
                            src={match.player2.avatar}
                            alt={match.player2.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-black flex items-center justify-center h-full">
                            {match.player2.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11.5px] font-black truncate flex items-center gap-1">
                          {match.player2.name}
                          {match.player2.isPlayer && (
                            <span className="text-[8px] px-1 py-0.2 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)]">
                              Kamu
                            </span>
                          )}
                        </span>
                        <span className="text-[8.5px] text-[var(--text-secondary)] truncate">
                          {match.player2.origin} • {match.player2.title}
                        </span>
                      </div>
                    </div>

                    <div className="text-[12px] font-black shrink-0 px-2">
                      {isMatchFinished ? match.player2Score ?? '-' : `${match.player2.speedRating}⚡`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action / Match Preview Card */}
          <div className="shrink-0 pt-2 border-t border-black/5 dark:border-white/10">
            {isPlayerChampion ? (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-7 h-7 text-amber-500 fill-amber-500 shrink-0" />
                  <div>
                    <h4 className="text-[13px] font-black text-amber-500 leading-tight">
                      JUARA PIALA NUSANTARA!
                    </h4>
                    <span className="text-[9.5px] font-medium text-[var(--text-secondary)]">
                      Kamu menaklukkan 15 duelists nusantara!
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resetTournament}
                  className="px-3 py-2 rounded-xl bg-amber-500 text-white text-[10.5px] font-black flex items-center gap-1 cursor-pointer tactile-active shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Musim Baru</span>
                </button>
              </div>
            ) : isPlayerEliminated ? (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-between gap-2">
                <div>
                  <h4 className="text-[13px] font-black text-rose-500 leading-tight">
                    Perjuangan Terhenti
                  </h4>
                  <span className="text-[9.5px] font-medium text-[var(--text-secondary)]">
                    Kamu tereliminasi di {ROUND_NAMES[tournamentState.eliminatedAtRound || 'round_of_16'].short}.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={resetTournament}
                  className="px-3 py-2 rounded-xl bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[10.5px] font-black flex items-center gap-1 cursor-pointer tactile-active shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Coba Lagi</span>
                </button>
              </div>
            ) : upcomingOpponent ? (
              <div className="flex flex-col gap-2">
                <div className="p-2.5 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-white/20 border border-white/40 shrink-0">
                      <img
                        src={upcomingOpponent.avatar}
                        alt={upcomingOpponent.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[8.5px] font-black uppercase text-[var(--accent-main)] tracking-wider">
                        LAWAN BERIKUTNYA • {ROUND_NAMES[currentRoundKey].short}
                      </span>
                      <h4 className="text-[13px] font-black text-[var(--text-primary)] leading-tight">
                        {upcomingOpponent.name} ({upcomingOpponent.origin})
                      </h4>
                      <span className="text-[9px] text-[var(--text-secondary)]">
                        {upcomingOpponent.title} • Kecepatan: {upcomingOpponent.speedRating}⚡
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-[10px] font-black text-[var(--text-primary)]">
                      <Clock className="w-3 h-3 text-[var(--accent-main)]" />
                      <span>{ROUND_NAMES[currentRoundKey].duration}s</span>
                    </div>
                    <span className="text-[8.5px] font-bold text-[var(--text-secondary)]">
                      Speed Race
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={startTournamentMatch}
                  className="w-full py-3 rounded-2xl bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[13px] font-black flex items-center justify-center gap-2 cursor-pointer tactile-active shadow-md hover:opacity-95 transition-all"
                >
                  <Swords className="w-4 h-4 stroke-[2.5]" />
                  <span>Mulai Babak Ini ⚡</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={resetTournament}
                className="w-full py-2.5 rounded-2xl bg-black/5 dark:bg-white/10 text-[var(--text-primary)] text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer tactile-active"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Bracket Turnamen</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TournamentCupModal;
