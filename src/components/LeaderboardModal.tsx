import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, RotateCcw, Clock, Sparkles, Zap, Award } from 'lucide-react';
import { useGameStore, getTodayDateString } from '../store/useGameStore';

export const LeaderboardModal: React.FC = () => {
  const {
    isLeaderboardOpen,
    closeLeaderboard,
    nationalLeaderboard,
    isLoadingLeaderboard,
    loadNationalLeaderboard,
    dailyRushRecord,
    user,
  } = useGameStore();

  const [todayStr] = useState(getTodayDateString);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNationalLeaderboard(todayStr);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Find user rank if present in the leaderboard
  const userRankIndex = nationalLeaderboard.findIndex(
    (r) => r.user_name === user.name && r.rush_date === todayStr
  );
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

  return (
    <AnimatePresence>
      {isLeaderboardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            onClick={closeLeaderboard}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card Content (Apple Liquid Glass) */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-[360px] max-h-[88vh] rounded-[28px] p-4 sm:p-5 flex flex-col gap-3 shadow-2xl z-10 border border-black/5 dark:border-white/15 liquid-glass-card overflow-hidden"
          >
            {/* Top Specular Sheen Highlight */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* Header: Title + Action Controls */}
            <div className="flex items-center justify-between relative z-10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] flex items-center justify-center shrink-0">
                  <Trophy className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <span className="text-[8.5px] font-black uppercase tracking-wider text-[var(--accent-main)] block leading-none mb-0.5">
                    DAILY RUSH 90S
                  </span>
                  <h3 className="text-[16px] font-black tracking-tight text-[var(--text-primary)] leading-tight">
                    Peringkat Nasional
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleRefresh}
                  title="Segarkan Peringkat"
                  aria-label="Segarkan Peringkat"
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer"
                >
                  <RotateCcw className={`w-3.5 h-3.5 stroke-[2] ${isRefreshing || isLoadingLeaderboard ? 'animate-spin' : ''}`} />
                </button>

                <button
                  type="button"
                  onClick={closeLeaderboard}
                  aria-label="Tutup"
                  className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5 stroke-[2.2]" />
                </button>
              </div>
            </div>

            {/* Leaderboard List / Podium Container */}
            <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[360px] flex flex-col gap-2 relative z-10 pr-0.5">
              {isLoadingLeaderboard && nationalLeaderboard.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <RotateCcw className="w-6 h-6 text-[var(--accent-main)] animate-spin stroke-[2]" />
                  <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                    Memuat Peringkat Nasional...
                  </span>
                </div>
              ) : nationalLeaderboard.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <Award className="w-8 h-8 text-[var(--accent-main)] stroke-[1.8] opacity-80" />
                  <span className="text-[12px] font-black text-[var(--text-primary)]">
                    Belum Ada Rekor Hari Ini
                  </span>
                  <p className="text-[10px] text-[var(--text-secondary)] max-w-[200px] leading-tight">
                    Jadilah yang pertama menyelesaikan tantangan Daily Rush 90 detik dan raih posisi teratas!
                  </p>
                </div>
              ) : (
                nationalLeaderboard.map((item, index) => {
                  const rank = index + 1;
                  const isTop3 = rank <= 3;
                  const isCurrentUserItem = item.user_name === user.name;

                  return (
                    <div
                      key={item.id || `${item.user_name}-${index}`}
                      className={`w-full p-2.5 rounded-2xl flex items-center justify-between gap-2 border transition-all ${
                        isCurrentUserItem
                          ? 'border-[var(--accent-main)] bg-[var(--accent-light)] shadow-xs'
                          : 'border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5'
                      }`}
                    >
                      {/* Rank Number + Avatar + Name */}
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Rank Badge */}
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            rank === 1
                              ? 'bg-amber-400 text-black shadow-xs'
                              : rank === 2
                              ? 'bg-zinc-300 dark:bg-zinc-400 text-black shadow-xs'
                              : rank === 3
                              ? 'bg-amber-700 text-white shadow-xs'
                              : 'text-[var(--text-secondary)] font-bold'
                          }`}
                        >
                          {rank}
                        </div>

                        {/* Player Avatar */}
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 shrink-0 border border-black/10 dark:border-white/15">
                          {item.user_avatar ? (
                            <img
                              src={item.user_avatar}
                              alt={item.user_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[11px] font-black text-[var(--accent-main)]">
                              {item.user_name.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Player Name & Badge */}
                        <div className="min-w-0">
                          <span className="text-[11.5px] font-black text-[var(--text-primary)] truncate block leading-tight">
                            {item.user_name} {isCurrentUserItem && '(Anda)'}
                          </span>
                          <div className="flex items-center gap-1.5 text-[8.5px] text-[var(--text-secondary)] mt-0.5">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5" />
                              {item.time_spent}s
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              {item.accuracy}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div className="text-right shrink-0">
                        <span className={`text-[12.5px] font-black block leading-none ${
                          isTop3 ? 'text-[var(--accent-main)]' : 'text-[var(--text-primary)]'
                        }`}>
                          {item.score}
                        </span>
                        <span className="text-[7.5px] font-bold text-[var(--text-secondary)] uppercase">
                          Pts
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pinned User Record Footer Card */}
            <div
              className="w-full shrink-0 p-2.5 rounded-2xl border border-[var(--accent-main)]/30 bg-[var(--accent-light)] flex items-center justify-between gap-2 relative z-10"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-[var(--accent-main)] text-[var(--accent-contrast)] flex items-center justify-center text-[10px] font-black shrink-0">
                  {userRank ? `#${userRank}` : '-'}
                </div>
                <div className="min-w-0">
                  <span className="text-[10.5px] font-black text-[var(--text-primary)] block leading-tight truncate">
                    {user.name}
                  </span>
                  <span className="text-[8px] text-[var(--text-secondary)]">
                    {dailyRushRecord?.date === todayStr
                      ? `Rekor: ${dailyRushRecord.score} Pts • ${dailyRushRecord.timeSpent}s`
                      : 'Belum ada rekor hari ini'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[var(--accent-main)] shrink-0">
                <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="text-[11.5px] font-black">
                  {dailyRushRecord?.date === todayStr ? `${dailyRushRecord.score} Pts` : '+50 ★'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
