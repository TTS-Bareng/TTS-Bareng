import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Swords,
  Star,
  RotateCcw,
  ArrowRight,
  Home,
  Shield,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { getBattlePalette } from '../lib/battlePalette';
import { getEloTier } from '../lib/eloSystem';
import { MASCOTS } from '../assets/maskots';

export const BattleResultModal: React.FC = () => {
  const {
    isBattleResultOpen,
    closeBattleResult,
    battleConfig,
    battleCurrentRound,
    battleRoundWins,
    battleScores,
    battleWinner,
    startNextBattleRound,
    rematchBattle,
    setCurrentTab,
    theme,
    user,
    mabarPeers,
    eloRating,
    lastEloDelta,
  } = useGameStore();

  if (!isBattleResultOpen) return null;

  const palette = getBattlePalette(theme);
  const partner = mabarPeers.find((p) => p.name !== user.name);
  const partnerName = partner?.name || 'Lawan';

  const isMatchOver = battleWinner !== null;
  const isLocalWinner = isMatchOver
    ? battleWinner === 'local'
    : battleScores.local > battleScores.partner;
  const isDraw = isMatchOver
    ? battleWinner === 'draw'
    : battleScores.local === battleScores.partner;

  const totalPoints = battleScores.local + battleScores.partner;
  const localShare = totalPoints > 0 ? Math.round((battleScores.local / totalPoints) * 100) : 50;
  const partnerShare = 100 - localShare;

  const handleReturnHome = () => {
    closeBattleResult();
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
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
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
              src={isLocalWinner ? MASCOTS.crosswordChampion : MASCOTS.crosswordDuel}
              alt="Hasil Duel"
              className="w-full h-full object-contain filter drop-shadow-xl"
            />
          </div>

          {/* Title & Stage Badge */}
          <div className="flex flex-col items-center">
            <span className="text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-white backdrop-blur-sm">
              {isMatchOver
                ? `HASIL AKHIR DUEL • ${battleConfig.rounds} RONDE`
                : `RONDE ${battleCurrentRound}/${battleConfig.rounds} TUNTAS`}
            </span>
            <h3 className="text-[19px] font-black tracking-tight text-white mt-1.5 leading-tight">
              {isDraw
                ? 'Duel Imbang!'
                : isLocalWinner
                ? isMatchOver
                  ? 'Jawara Papan TTS!'
                  : 'Ronde Milikmu!'
                : isMatchOver
                ? `${partnerName} Menang!`
                : `${partnerName} Memimpin!`}
            </h3>
            <p className="text-[10px] text-white/85 mt-0.5 leading-snug px-2">
              {isMatchOver
                ? isLocalWinner
                  ? `Kemenangan luar biasa atas ${partnerName}! Petak katamu mendominasi arena.`
                  : `Pertarungan sengit! Terus asah strategimu di duel berikutnya.`
                : `Ronde ${battleCurrentRound} selesai. Siapkan strategi untuk ronde selanjutnya!`}
            </p>
          </div>

          {/* Duel Score Podium Bento */}
          <div className="w-full rounded-2xl border border-white/20 bg-black/25 dark:bg-black/35 backdrop-blur-md p-3 flex flex-col gap-2.5">
            {/* Wins Pill Header */}
            <div className="flex items-center justify-between text-[8.5px] font-black uppercase tracking-wider text-white/80 border-b border-white/10 pb-1.5 px-0.5">
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3 stroke-[2.2]" />
                <span>Skor & Kemenangan Ronde</span>
              </span>
              <span className="font-bold text-white">
                Ronde: {battleRoundWins.local} - {battleRoundWins.partner}
              </span>
            </div>

            {/* Players VS Columns */}
            <div className="grid grid-cols-2 gap-2">
              {/* Local Player */}
              <div
                className="p-2.5 rounded-xl border flex flex-col items-center gap-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderColor: palette.p1.border,
                }}
              >
                <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white">
                  <Shield className="w-3 h-3" />
                  <span className="truncate max-w-[80px]">{user.name || 'Kamu'}</span>
                </div>
                <div className="text-[20px] font-black text-white leading-none">
                  {battleScores.local}
                  <span className="text-[9px] font-bold opacity-80 ml-0.5">Pts</span>
                </div>
                <span className="text-[8px] font-bold text-white/80">
                  {battleRoundWins.local} Ronde Menang
                </span>
              </div>

              {/* Opponent Player */}
              <div
                className="p-2.5 rounded-xl border flex flex-col items-center gap-1"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderColor: palette.p2.border,
                }}
              >
                <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white">
                  <Swords className="w-3 h-3" />
                  <span className="truncate max-w-[80px]">{partnerName}</span>
                </div>
                <div className="text-[20px] font-black text-white leading-none">
                  {battleScores.partner}
                  <span className="text-[9px] font-bold opacity-80 ml-0.5">Pts</span>
                </div>
                <span className="text-[8px] font-bold text-white/80">
                  {battleRoundWins.partner} Ronde Menang
                </span>
              </div>
            </div>

            {/* Tug-of-War Split Meter */}
            <div className="w-full flex flex-col gap-1">
              <div className="flex items-center justify-between text-[8px] font-bold text-white/80 px-0.5">
                <span>{user.name || 'Kamu'} ({localShare}%)</span>
                <span>{partnerName} ({partnerShare}%)</span>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden flex bg-black/30 border border-white/20">
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{ width: `${localShare}%`, background: palette.p1.grad }}
                />
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{ width: `${partnerShare}%`, background: palette.p2.grad }}
                />
              </div>
            </div>
          </div>

          {/* Winner Star Bounty Award */}
          {isMatchOver && isLocalWinner && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-full py-2 px-3 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center gap-2 text-white shadow-xs"
            >
              <Star className="w-4 h-4 fill-amber-300 text-amber-300 drop-shadow-sm" />
              <span className="text-[11px] font-black tracking-wide">
                Hadiah Juara: +30 Bintang Ditambahkan!
              </span>
            </motion.div>
          )}

          {/* ELO Rating Update Card */}
          {isMatchOver && (
            <div className="w-full py-2.5 px-3 rounded-2xl bg-black/30 border border-white/20 backdrop-blur-md flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="text-[18px]">{getEloTier(eloRating).icon}</span>
                <div className="flex flex-col text-left">
                  <span className="text-[8px] font-bold text-white/70 uppercase tracking-wider">
                    Peringkat ELO Nasional
                  </span>
                  <span className="text-[12px] font-black leading-tight text-white">
                    {getEloTier(eloRating).title} • {eloRating}
                  </span>
                </div>
              </div>
              {lastEloDelta !== null && (
                <div
                  className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${
                    lastEloDelta > 0
                      ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400/40'
                      : lastEloDelta < 0
                      ? 'bg-rose-500/30 text-rose-300 border-rose-400/40'
                      : 'bg-white/20 text-white/80 border-white/30'
                  }`}
                >
                  {lastEloDelta > 0 ? `+${lastEloDelta}` : lastEloDelta} ELO
                </div>
              )}
            </div>
          )}

          {/* Action CTAs */}
          <div className="w-full flex flex-col gap-2 mt-1">
            {!isMatchOver ? (
              <button
                type="button"
                onClick={startNextBattleRound}
                className="w-full py-3 rounded-full bg-white text-zinc-900 font-black text-[12.5px] cursor-pointer tactile-active shadow-lg flex items-center justify-center gap-2 hover:bg-white/95"
              >
                <span>Lanjut Ronde {battleCurrentRound + 1}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={rematchBattle}
                className="w-full py-3 rounded-full bg-white text-zinc-900 font-black text-[12.5px] cursor-pointer tactile-active shadow-lg flex items-center justify-center gap-2 hover:bg-white/95"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>Tanding Ulang</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleReturnHome}
              className="w-full py-2 rounded-full border border-white/30 text-white font-bold text-[11px] cursor-pointer tactile-active hover:bg-white/10 flex items-center justify-center gap-1.5"
            >
              <Home className="w-3.5 h-3.5 stroke-[2]" />
              <span>Kembali ke Arena</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
