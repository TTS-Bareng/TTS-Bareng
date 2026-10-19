import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Zap,
  Star,
  RotateCcw,
  Home,
  Share2,
  Clock,
  Sparkles,
  Flame,
  Award,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';

export const DailyRushResultModal: React.FC = () => {
  const {
    isDailyRushResultOpen,
    closeDailyRushResult,
    dailyRushLastRunResult,
    startDailyRush,
    openLeaderboard,
    openShareModal,
    setCurrentTab,
    nationalLeaderboard,
    user,
  } = useGameStore();

  if (!isDailyRushResultOpen || !dailyRushLastRunResult) return null;

  const {
    score,
    speedScore,
    accuracyScore,
    streakScore,
    completionBonus,
    timeSpent,
    accuracy,
    isFullSolved,
    isNewBest,
    date,
  } = dailyRushLastRunResult;

  // Find user's live national rank if present
  const rankIdx = nationalLeaderboard.findIndex(
    (r) => r.user_name === user.name && r.rush_date === date
  );
  const nationalRank = rankIdx !== -1 ? rankIdx + 1 : null;

  const handleShareStory = () => {
    openShareModal({
      badge: nationalRank ? `DAILY RUSH #${nationalRank}` : 'DAILY RUSH 90S',
      title: isFullSolved ? 'Top Jawara Daily Rush!' : 'Skor Daily Rush Nasional',
      subtitle: `${score} poin berhasil dicapai dalam ${timeSpent} detik pada Papan Peringkat Nasional TTS Quest.`,
      mascot: isFullSolved ? MASCOTS.crosswordChampion : MASCOTS.indonesianPuzzleKid,
      stats: [
        { label: 'SKOR', value: `${score}` },
        { label: 'WAKTU', value: `${timeSpent}s` },
        { label: 'AKURASI', value: `${accuracy}%` },
      ],
      shareUrl: window.location.origin,
      shareText: `Saya mencetak skor ${score} poin di Daily Rush TTS Quest hari ini! Bisakah kamu mengalahkan peringkatku?`,
    });
  };

  const handleViewLeaderboard = () => {
    closeDailyRushResult();
    openLeaderboard();
  };

  const handlePlayAgain = () => {
    closeDailyRushResult();
    startDailyRush();
  };

  const handleGoHome = () => {
    closeDailyRushResult();
    setCurrentTab('home');
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

        {/* Modal Window */}
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
              src={isFullSolved ? MASCOTS.crosswordChampion : MASCOTS.indonesianPuzzleKid}
              alt="Hasil Daily Rush"
              className="w-full h-full object-contain filter drop-shadow-xl"
            />
          </div>

          {/* Title & Stage Badge */}
          <div className="flex flex-col items-center">
            <span className="text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-white backdrop-blur-sm">
              {isFullSolved ? 'DAILY RUSH • PAPAN TUNTAS' : 'DAILY RUSH • WAKTU HABIS'}
            </span>
            <h3 className="text-[20px] font-black tracking-tight text-white mt-1.5 leading-tight">
              {isFullSolved ? 'Luar Biasa, Kilat!' : 'Pertarungan Sengit!'}
            </h3>
            <p className="text-[10.5px] text-white/85 mt-0.5 leading-snug px-1">
              {isFullSolved
                ? `Semua kata berhasil dipecahkan dalam ${timeSpent} detik dengan akurasi ${accuracy}%.`
                : `Waktu 90 detik berakhir. Akurasi tercatat ${accuracy}% dalam ${timeSpent} detik.`}
            </p>
          </div>

          {/* Big Glowing Total Score Card */}
          <div className="w-full rounded-2xl border border-white/25 bg-black/25 dark:bg-black/35 backdrop-blur-md p-3 flex flex-col items-center gap-1 shadow-inner relative overflow-hidden">
            <div className="flex items-center gap-1 text-[8.5px] font-black uppercase tracking-wider text-white/80">
              <Zap className="w-3 h-3 text-amber-300 fill-current" />
              <span>TOTAL SKOR DAILY RUSH</span>
            </div>
            <div className="text-[36px] font-black tracking-tight text-amber-300 leading-none my-0.5 drop-shadow-sm">
              {score}
            </div>

            {/* Sub-label: National Rank or New Record */}
            <div className="flex items-center gap-1.5">
              {isNewBest && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-zinc-950 text-[8px] font-black uppercase tracking-wider shadow-2xs">
                  Rekor Terbaik Baru!
                </span>
              )}
              {nationalRank ? (
                <span className="text-[9px] font-bold text-white/90">
                  Peringkat Nasional: #{nationalRank}
                </span>
              ) : (
                <span className="text-[9px] font-bold text-white/80">
                  Tersinkron ke Leaderboard
                </span>
              )}
            </div>
          </div>

          {/* 4 Bento Factors Breakdown */}
          <div className="w-full rounded-2xl border border-white/20 bg-black/20 dark:bg-black/30 backdrop-blur-md p-2.5 flex flex-col gap-1.5 text-left">
            <span className="text-[8px] font-black uppercase tracking-wider text-white/70 px-0.5">
              Rincian Perolehan Poin
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[9.5px]">
              <div className="p-2 rounded-xl bg-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-white/80 text-[8px]">
                    <Clock className="w-2.5 h-2.5" />
                    <span>Kecepatan ({Math.max(0, 90 - timeSpent)}s)</span>
                  </div>
                  <span className="text-white font-bold">Sisa Waktu</span>
                </div>
                <span className="font-black text-rose-300">+{speedScore}</span>
              </div>

              <div className="p-2 rounded-xl bg-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-white/80 text-[8px]">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>Akurasi ({accuracy}%)</span>
                  </div>
                  <span className="text-white font-bold">Kerapian</span>
                </div>
                <span className="font-black text-emerald-300">+{accuracyScore}</span>
              </div>

              <div className="p-2 rounded-xl bg-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-white/80 text-[8px]">
                    <Flame className="w-2.5 h-2.5" />
                    <span>Kombo Streak</span>
                  </div>
                  <span className="text-white font-bold">Kecepatan Kata</span>
                </div>
                <span className="font-black text-amber-300">+{streakScore}</span>
              </div>

              <div className="p-2 rounded-xl bg-white/10 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1 text-white/80 text-[8px]">
                    <Award className="w-2.5 h-2.5" />
                    <span>Bonus Selesai</span>
                  </div>
                  <span className="text-white font-bold">{isFullSolved ? 'Full Clear' : 'Parsial'}</span>
                </div>
                <span className="font-black text-sky-300">+{completionBonus}</span>
              </div>
            </div>
          </div>

          {/* Star Reward Chip if solved */}
          {isFullSolved && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full py-1.5 px-3 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center gap-1.5 text-white text-[10.5px] font-black"
            >
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>Hadiah Harian: +50 Bintang Ditambahkan!</span>
            </motion.div>
          )}

          {/* Action CTAs */}
          <div className="w-full flex flex-col gap-2 mt-0.5">
            <button
              type="button"
              onClick={handleViewLeaderboard}
              className="w-full py-3 rounded-full bg-white text-zinc-900 font-black text-[12px] cursor-pointer tactile-active shadow-lg flex items-center justify-center gap-2 hover:bg-white/95"
            >
              <Trophy className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Lihat Peringkat Nasional</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShareStory}
                className="py-2.5 rounded-full bg-white/20 border border-white/30 text-white font-bold text-[11px] cursor-pointer tactile-active hover:bg-white/25 flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-3 h-3" />
                <span>Bagikan Rekor</span>
              </button>

              <button
                type="button"
                onClick={handlePlayAgain}
                className="py-2.5 rounded-full bg-white/20 border border-white/30 text-white font-bold text-[11px] cursor-pointer tactile-active hover:bg-white/25 flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Main Lagi</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoHome}
              className="w-full py-1.5 text-white/80 hover:text-white text-[10.5px] font-bold cursor-pointer tactile-active flex items-center justify-center gap-1"
            >
              <Home className="w-3 h-3" />
              <span>Kembali ke Beranda</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
