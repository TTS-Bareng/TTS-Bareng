import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  RotateCcw,
  Home,
  Medal,
  Shield,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';

export const TournamentResultModal: React.FC = () => {
  const {
    isTournamentResultOpen,
    closeTournamentResult,
    tournamentResultData,
    setCurrentTab,
    user,
  } = useGameStore();

  if (!isTournamentResultOpen || !tournamentResultData) return null;

  const {
    won,
    roundTitle,
    trophyAwarded,
    opponent,
    playerScore,
    opponentScore,
  } = tournamentResultData;

  const isChampion = won && trophyAwarded === 'gold';

  const handleOpenBracket = () => {
    closeTournamentResult();
    setCurrentTab('arena');
  };

  const handleReturnHome = () => {
    closeTournamentResult();
    setCurrentTab('arena');
  };

  const handleRetry = () => {
    closeTournamentResult();
    setCurrentTab('arena');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 select-none">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
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
          {/* Top Specular Sheen Highlight */}
          <div className="absolute top-0 inset-x-0 h-px bg-white/40 pointer-events-none" />
          <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-white/15 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-black/20 blur-2xl pointer-events-none" />

          {/* Celebratory Mascot */}
          <div className="relative w-24 h-24 my-0.5 flex items-center justify-center shrink-0">
            <motion.img
              initial={{ y: 8, scale: 0.9 }}
              animate={{ y: [0, -6, 0], scale: 1 }}
              transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
              src={won ? MASCOTS.crosswordChampion : MASCOTS.crosswordDuel}
              alt="Hasil Piala Turnamen"
              className="w-full h-full object-contain filter drop-shadow-xl"
            />
          </div>

          {/* Title & Stage Badge */}
          <div className="flex flex-col items-center">
            <span className="text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-white backdrop-blur-sm">
              TURNAMEN RESMI • {roundTitle.toUpperCase()}
            </span>

            <h3 className="text-[20px] font-black tracking-tight leading-tight mt-1 text-white">
              {isChampion
                ? '🏆 JUARA TURNAMEN!'
                : won
                ? 'LOLOS KE BABAK BERIKUTNYA!'
                : 'TERELIMINASI'}
            </h3>

            <p className="text-[11px] text-white/90 leading-snug mt-0.5 max-w-[90%]">
              {isChampion
                ? 'Luar biasa! Kamu berhasil menaklukkan seluruh lawan dan merebut Trofi Emas!'
                : won
                ? `Selamat! Kamu berhasil menaklukkan ${opponent.name}.`
                : `Pertandingan sengit melawan ${opponent.name}. Jangan patah arang!`}
            </p>
          </div>

          {/* Trophy Awarded Banner (If Gold / Silver / Bronze) */}
          {trophyAwarded && (
            <div className="w-full p-2.5 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center gap-2 backdrop-blur-sm animate-pulse">
              {trophyAwarded === 'gold' && (
                <>
                  <Trophy className="w-5 h-5 fill-current text-white shrink-0" />
                  <span className="text-[11.5px] font-black text-white">
                    +1 Trofi Emas & 200★ Berhasil Diraih!
                  </span>
                </>
              )}
              {trophyAwarded === 'silver' && (
                <>
                  <Medal className="w-5 h-5 fill-current text-white shrink-0" />
                  <span className="text-[11.5px] font-black text-white">
                    +1 Trofi Perak & 100★ Diraih!
                  </span>
                </>
              )}
              {trophyAwarded === 'bronze' && (
                <>
                  <Shield className="w-5 h-5 fill-current text-white shrink-0" />
                  <span className="text-[11.5px] font-black text-white">
                    +1 Trofi Perunggu & 50★ Diraih!
                  </span>
                </>
              )}
            </div>
          )}

          {/* Score Comparison Card */}
          <div className="w-full p-3 rounded-2xl bg-black/20 border border-white/15 flex items-center justify-between">
            {/* Player 1 (Local) */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 border border-white/30 mb-1">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[11px] font-black flex items-center justify-center h-full">
                    {user.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-[11px] font-black truncate max-w-[90px]">{user.name || 'Kamu'}</span>
              <span className="text-[16px] font-black text-white mt-0.5">{playerScore} Pts</span>
            </div>

            {/* VS Pill */}
            <div className="px-2 py-1 rounded-full bg-white/20 text-[9px] font-black uppercase text-white/90">
              VS
            </div>

            {/* Opponent */}
            <div className="flex flex-col items-center flex-1">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 border border-white/30 mb-1">
                <img src={opponent.avatar} alt={opponent.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] font-black truncate max-w-[90px]">{opponent.name}</span>
              <span className="text-[16px] font-black text-white mt-0.5">{opponentScore} Pts</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="w-full flex flex-col gap-2 mt-1">
            <button
              type="button"
              onClick={handleOpenBracket}
              className="w-full py-2.5 rounded-2xl bg-white text-[12.5px] font-black flex items-center justify-center gap-1.5 cursor-pointer tactile-active shadow-md hover:opacity-95 transition-opacity"
              style={{ color: 'var(--hero-btn-text, #111113)' }}
            >
              <Trophy className="w-4 h-4 stroke-[2.2]" />
              <span>Lihat Bagan Turnamen</span>
            </button>

            {!won ? (
              <button
                type="button"
                onClick={handleRetry}
                className="w-full py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-[11.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer tactile-active transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Mulai Musim Baru</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleReturnHome}
                className="w-full py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white text-[11.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer tactile-active transition-colors"
              >
                <Home className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Kembali ke Arena</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TournamentResultModal;
