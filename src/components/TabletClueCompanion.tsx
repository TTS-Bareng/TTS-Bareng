import React, { useState } from 'react';
import { CheckCircle2, Trophy, Swords, Sparkles, BookOpen } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { type ClueItem } from '../lib/crossword';

export const TabletClueCompanion: React.FC = () => {
  const {
    level,
    currentLevelIndex,
    activeClueId,
    selectClue,
    solvedClues,
    gameMode,
    activeTournamentMatch,
    battleScores,
    user,
    mabarPeers,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'all' | 'across' | 'down'>('all');

  const acrossClues = level.clues?.across || [];
  const downClues = level.clues?.down || [];
  const totalClues = acrossClues.length + downClues.length;
  const solvedCount = solvedClues.length;
  const progressPercent = totalClues > 0 ? Math.round((solvedCount / totalClues) * 100) : 0;

  const displayedClues: ClueItem[] =
    activeTab === 'across'
      ? acrossClues
      : activeTab === 'down'
      ? downClues
      : [...acrossClues, ...downClues].sort((a, b) => a.number - b.number);

  const isBattle = gameMode === '1v1_battle';
  const tournamentOpponent = activeTournamentMatch
    ? activeTournamentMatch.player1.isPlayer
      ? activeTournamentMatch.player2
      : activeTournamentMatch.player1
    : null;
  const partnerPeer = mabarPeers.find((p) => p.name !== user.name);
  const opponentName = tournamentOpponent?.name || partnerPeer?.name || 'Lawan';

  return (
    <aside
      className="hidden md:flex md:w-[42%] lg:w-[40%] flex-col min-h-0 border-l border-black/5 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.015] p-3.5 gap-3 select-none overflow-hidden"
      aria-label="Panel Petunjuk Layar Lebar"
    >
      {/* Top Header Section */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)] flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-[14px] font-black text-[var(--text-primary)] leading-tight">
                Petunjuk Kata
              </h3>
              <span className="text-[9.5px] font-semibold text-[var(--text-secondary)]">
                Bab {currentLevelIndex + 1} • {level.category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)] text-[10.5px] font-black">
            <span>{solvedCount}/{totalClues}</span>
            <span className="text-[8.5px] font-bold opacity-80">({progressPercent}%)</span>
          </div>
        </div>

        {/* Direction Tabs: Semua / Mendatar / Menurun */}
        <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[10px] font-black">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`py-1 rounded-xl transition-all cursor-pointer tactile-active ${
              activeTab === 'all'
                ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Semua ({totalClues})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('across')}
            className={`py-1 rounded-xl transition-all cursor-pointer tactile-active ${
              activeTab === 'across'
                ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Mendatar ({acrossClues.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('down')}
            className={`py-1 rounded-xl transition-all cursor-pointer tactile-active ${
              activeTab === 'down'
                ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Menurun ({downClues.length})
          </button>
        </div>
      </div>

      {/* Scrollable Clues List */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
        {displayedClues.map((clue) => {
          const isSolved = solvedClues.includes(clue.id);
          const isActive = activeClueId === clue.id;

          return (
            <div
              key={clue.id}
              onClick={() => selectClue(clue.id)}
              className={`w-full p-2.5 rounded-2xl text-left transition-all cursor-pointer tactile-active flex items-start gap-2.5 border ${
                isActive
                  ? 'border-[var(--accent-main)] bg-[var(--accent-light)] shadow-xs ring-1 ring-[var(--accent-main)]/30'
                  : isSolved
                  ? 'border-emerald-500/25 bg-emerald-500/5 dark:bg-emerald-500/10 opacity-90 hover:opacity-100'
                  : 'border-black/5 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.03] hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
              }`}
            >
              {/* Number and Direction Badge */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[11px] shrink-0 ${
                  isActive
                    ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-2xs'
                    : isSolved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]'
                }`}
              >
                {isSolved ? (
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  clue.number
                )}
              </div>

              {/* Clue Text & Metadata */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full ${
                      clue.direction === 'across'
                        ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400'
                        : 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {clue.direction === 'across' ? 'Mendatar' : 'Menurun'}
                  </span>
                  <span className="text-[8.5px] font-semibold text-[var(--text-secondary)]">
                    {clue.answer.length} Huruf
                  </span>
                  {isActive && (
                    <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] ml-auto">
                      Dipilih
                    </span>
                  )}
                </div>

                <p
                  className={`text-[11.5px] leading-snug line-clamp-2 ${
                    isActive
                      ? 'text-[var(--text-primary)] font-bold'
                      : isSolved
                      ? 'text-[var(--text-secondary)] font-medium'
                      : 'text-[var(--text-primary)] font-medium'
                  }`}
                >
                  {clue.text}
                </p>

                {/* If solved, show revealed word */}
                {isSolved && (
                  <div className="mt-1 flex items-center gap-1 text-[10.5px] font-black tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">
                    <span>{clue.answer}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Bottom Context Card (Duel status or Level insights) */}
      <div className="shrink-0 pt-2 border-t border-black/5 dark:border-white/10">
        {isBattle ? (
          <div className="p-3 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/30 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-main)] text-[var(--accent-contrast)] flex items-center justify-center shrink-0 shadow-2xs">
                {activeTournamentMatch ? (
                  <Trophy className="w-4 h-4 fill-current stroke-none" />
                ) : (
                  <Swords className="w-4 h-4 stroke-[2.2]" />
                )}
              </div>
              <div>
                <span className="text-[8.5px] font-black uppercase tracking-wider text-[var(--accent-main)] block">
                  {activeTournamentMatch ? 'PIALA NUSANTARA' : 'DUEL 1V1'}
                </span>
                <span className="text-[11.5px] font-black text-[var(--text-primary)] leading-tight">
                  vs {opponentName}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-[12px] font-black text-[var(--text-primary)]">
                {battleScores.local} - {battleScores.partner}
              </div>
              <span className="text-[8.5px] font-bold text-[var(--text-secondary)]">
                Poin Papan
              </span>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
            <Sparkles className="w-4 h-4 text-[var(--accent-main)] shrink-0" />
            <span>Sentuh petunjuk di atas untuk langsung beralih ke kata tersebut di papan.</span>
          </div>
        )}
      </div>
    </aside>
  );
};

export default TabletClueCompanion;
