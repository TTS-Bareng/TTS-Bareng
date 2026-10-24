import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, RotateCcw, Clock, Sparkles, Zap, Award, Share2, Swords, Crown, ChevronRight } from 'lucide-react';
import { useGameStore, getTodayDateString } from '../store/useGameStore';
import {
  NATIONAL_ELO_SEED_LEADERBOARD,
  getEloTier,
  type NationalEloLeaderboardEntry,
} from '../lib/eloSystem';
import { MASCOTS } from '../assets/maskots';
import { gameCenterService } from '../lib/gameCenterService';

export const LeaderboardModal: React.FC = () => {
  const {
    isLeaderboardOpen,
    closeLeaderboard,
    nationalLeaderboard,
    isLoadingLeaderboard,
    loadNationalLeaderboard,
    dailyRushRecord,
    user,
    openShareModal,
    eloRating,
    isVip,
    battlesStats,
  } = useGameStore();

  const [activeTab, setActiveTab] = useState<'daily_rush' | 'elo_rating'>('daily_rush');
  const [todayStr] = useState(getTodayDateString);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' ? !navigator.onLine : false);

  React.useEffect(() => {
    const onOnline = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadNationalLeaderboard(todayStr);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Find user rank if present in the daily rush leaderboard
  const userRankIndex = nationalLeaderboard.findIndex(
    (r) => r.user_name === user.name && r.rush_date === todayStr
  );
  const userRank = userRankIndex !== -1 ? userRankIndex + 1 : null;

  // Combine seed leaderboard with user's current ELO
  const userTier = getEloTier(eloRating);
  const userEntry: NationalEloLeaderboardEntry = {
    rank: 0,
    id: 'user_current',
    name: user.name || 'Kamu',
    avatar: user.avatar || MASCOTS.crosswordChampion,
    elo: eloRating,
    tier: userTier.key,
    isVip,
    battlesWon: battlesStats.won,
    winRate: battlesStats.total > 0 ? Math.round((battlesStats.won / battlesStats.total) * 100) : 0,
  };

  const combinedEloLeaderboard = [...NATIONAL_ELO_SEED_LEADERBOARD, userEntry]
    .sort((a, b) => b.elo - a.elo)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const playerEloRank = combinedEloLeaderboard.find((e) => e.id === 'user_current')?.rank || 11;

  const handleShareDailyRush = () => {
    openShareModal({
      badge: userRank ? `DAILY RUSH #${userRank}` : 'DAILY RUSH',
      title: 'Top Jawara Daily Rush!',
      subtitle: `${dailyRushRecord?.score || 0} poin berhasil dicapai dalam 90 detik pada Papan Peringkat Nasional TTS Bareng.`,
      mascot: MASCOTS.crosswordChampion,
      stats: [
        { label: 'POIN', value: `${dailyRushRecord?.score || 0}` },
        { label: 'PERINGKAT', value: userRank ? `#${userRank}` : '-' },
        { label: 'WAKTU', value: `${dailyRushRecord?.timeSpent || 90}s` },
      ],
      shareUrl: window.location.origin,
      shareText: `Saya mencetak skor ${dailyRushRecord?.score || 0} poin di Daily Rush TTS Bareng! Bisakah kamu mengalahkan peringkatku?`,
    });
  };

  const handleShareEloRank = () => {
    openShareModal({
      badge: `PERINGKAT #${playerEloRank} ELO NASIONAL`,
      title: `${userTier.name} di TTS Bareng!`,
      subtitle: `Saya telah meraih rating ${eloRating} ELO dengan ${battlesStats.won} kemenangan di Papan Peringkat Catur TTS Nasional.`,
      mascot: MASCOTS.crosswordChampion,
      stats: [
        { label: 'RATING ELO', value: `${eloRating}` },
        { label: 'PERINGKAT', value: `#${playerEloRank}` },
        { label: 'MENANG 1V1', value: `${battlesStats.won}` },
      ],
      shareUrl: window.location.origin,
      shareText: `Saya bergelar ${userTier.name} (${eloRating} ELO) di Papan Peringkat TTS Bareng! Berani adu kecerdasan kata denganku?`,
    });
  };

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
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[8.5px] font-black uppercase tracking-wider text-[var(--accent-main)] block leading-none">
                      {activeTab === 'daily_rush' ? 'DAILY RUSH 90S' : 'LIGA CATUR ELO'}
                    </span>
                    {isOffline && (
                      <span className="text-[7px] font-black px-1.5 py-0.2 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 uppercase">
                        OFFLINE
                      </span>
                    )}
                  </div>
                  <h3 className="text-[16px] font-black tracking-tight text-[var(--text-primary)] leading-tight">
                    {activeTab === 'daily_rush' ? 'Peringkat Nasional' : 'Klasemen Master ELO'}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {activeTab === 'daily_rush' && (
                  <button
                    type="button"
                    onClick={handleRefresh}
                    title="Segarkan Peringkat"
                    aria-label="Segarkan Peringkat"
                    className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 stroke-[2] ${isRefreshing || isLoadingLeaderboard ? 'animate-spin' : ''}`} />
                  </button>
                )}

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

            {/* Segmented Tab Switcher */}
            <div className="w-full grid grid-cols-2 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 relative z-10 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('daily_rush')}
                className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black cursor-pointer tactile-active flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'daily_rush'
                    ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Daily Rush 90s</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('elo_rating')}
                className={`py-1.5 px-2 rounded-xl text-[10.5px] font-black cursor-pointer tactile-active flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'elo_rating'
                    ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Swords className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Peringkat ELO</span>
              </button>
            </div>

            {/* Leaderboard List / Podium Container */}
            <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[360px] flex flex-col gap-2 relative z-10 pr-0.5">
              {isOffline && (
                <div className="w-full py-1.5 px-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-amber-600 dark:text-amber-400 text-[9px] font-bold shrink-0">
                  <span>Mode Offline • Rekor tersimpan di perangkat</span>
                  <span className="uppercase font-black text-[7.5px] px-1.5 py-0.2 rounded bg-amber-500/20">Lokal</span>
                </div>
              )}
              {activeTab === 'daily_rush' ? (
                isLoadingLeaderboard && nationalLeaderboard.length === 0 ? (
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
                      {isOffline ? 'Papan Peringkat Tersimpan' : 'Belum Ada Rekor Hari Ini'}
                    </span>
                    <p className="text-[10px] text-[var(--text-secondary)] max-w-[220px] leading-tight">
                      {isOffline
                        ? (dailyRushRecord?.date === todayStr
                            ? `Rekor lokal Anda hari ini: ${dailyRushRecord.score} poin. Skor akan otomatis diunggah saat koneksi pulih.`
                            : 'Mainkan tantangan Daily Rush 90 detik untuk mencatat rekor lokal Anda.')
                        : 'Jadilah yang pertama menyelesaikan tantangan Daily Rush 90 detik dan raih posisi teratas!'}
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
                )
              ) : (
                /* ELO Rating Chess Leaderboard */
                combinedEloLeaderboard.map((item) => {
                  const rank = item.rank;
                  const isCurrentUserItem = item.id === 'user_current';
                  const tier = getEloTier(item.elo);

                  return (
                    <div
                      key={item.id}
                      className={`w-full p-2.5 rounded-2xl flex items-center justify-between gap-2 border transition-all ${
                        isCurrentUserItem
                          ? 'border-[var(--accent-main)] bg-[var(--accent-light)] shadow-xs ring-1 ring-[var(--accent-main)]/50'
                          : 'border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {/* Rank Badge */}
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            rank === 1
                              ? 'bg-amber-400 text-black shadow-xs font-black'
                              : rank === 2
                              ? 'bg-zinc-300 dark:bg-zinc-400 text-black shadow-xs font-black'
                              : rank === 3
                              ? 'bg-amber-700 text-white shadow-xs font-black'
                              : 'text-[var(--text-secondary)] font-bold'
                          }`}
                        >
                          {rank}
                        </div>

                        {/* Player Avatar */}
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 shrink-0 border border-black/10 dark:border-white/15 relative">
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                          {item.tier === 'grandmaster' && (
                            <div className="absolute -top-1 -right-1 text-[11px] leading-none drop-shadow-sm">
                              👑
                            </div>
                          )}
                        </div>

                        {/* Player Info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-[11.5px] font-black text-[var(--text-primary)] truncate block leading-tight">
                              {item.name}
                            </span>
                            {item.isVip && (
                              <Crown className="w-2.5 h-2.5 text-[var(--accent-main)] fill-current shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[8.5px] text-[var(--text-secondary)] mt-0.5">
                            <span className="font-bold" style={{ color: tier.badgeColor }}>
                              {tier.icon} {tier.name}
                            </span>
                            <span>•</span>
                            <span>{item.winRate}% Menang</span>
                          </div>
                        </div>
                      </div>

                      {/* ELO Rating Badge */}
                      <div className="text-right shrink-0">
                        <span className={`text-[13px] font-black block leading-none font-mono ${
                          item.tier === 'grandmaster' ? 'text-[var(--accent-main)]' : 'text-[var(--text-primary)]'
                        }`}>
                          {item.elo}
                        </span>
                        <span className="text-[7.5px] font-bold text-[var(--text-secondary)] uppercase">
                          ELO
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pinned User Record Footer Card */}
            {activeTab === 'daily_rush' ? (
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

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex items-center gap-1 text-[var(--accent-main)]">
                    <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span className="text-[11.5px] font-black">
                      {dailyRushRecord?.date === todayStr ? `${dailyRushRecord.score} Pts` : '+50 ★'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleShareDailyRush}
                    className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[var(--text-primary)] flex items-center justify-center cursor-pointer tactile-active transition-all"
                    title="Bagikan Rekor"
                  >
                    <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="w-full shrink-0 p-2.5 rounded-2xl border border-[var(--accent-main)]/30 bg-[var(--accent-light)] flex items-center justify-between gap-2 relative z-10"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-[var(--accent-main)] text-[var(--accent-contrast)] flex items-center justify-center text-[10px] font-black shrink-0">
                    #{playerEloRank}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-[10.5px] font-black text-[var(--text-primary)] block leading-tight truncate">
                        {user.name}
                      </span>
                      {isVip && <Crown className="w-2.5 h-2.5 text-[var(--accent-main)] fill-current shrink-0" />}
                    </div>
                    <span className="text-[8px] text-[var(--text-secondary)] flex items-center gap-1">
                      <span>{userTier.icon} {userTier.name}</span>
                      <span>•</span>
                      <span>{battlesStats.won}W / {battlesStats.lost}L</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[12px] font-black text-[var(--accent-main)] font-mono leading-none">
                      {eloRating} ELO
                    </span>
                    <span className="text-[7.5px] font-bold text-[var(--text-secondary)] uppercase">
                      Peringkat #{playerEloRank}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleShareEloRank}
                    className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[var(--text-primary)] flex items-center justify-center cursor-pointer tactile-active transition-all"
                    title="Bagikan Gelar ELO"
                  >
                    <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  </button>
                </div>
              </div>
            )}

            {/* Apple Game Center Leaderboard Shortcut */}
            <button
              type="button"
              onClick={() => gameCenterService.openDashboard('leaderboards')}
              className="w-full shrink-0 py-2 px-3 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/5 dark:border-white/10 text-[var(--text-primary)] font-bold text-[10.5px] flex items-center justify-between gap-2 cursor-pointer tactile-active transition-all relative z-10"
            >
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="8.5" cy="8.5" r="3.5" fill="#FF375F" fillOpacity="0.9" />
                  <circle cx="15.5" cy="8.5" r="3.5" fill="#30D158" fillOpacity="0.9" />
                  <circle cx="8.5" cy="15.5" r="3.5" fill="#0A84FF" fillOpacity="0.9" />
                  <circle cx="15.5" cy="15.5" r="3.5" fill="#FFD60A" fillOpacity="0.9" />
                </svg>
                <span className="truncate">Peringkat Apple Game Center</span>
              </div>
              <div className="flex items-center gap-1 text-[8.5px] font-black text-[var(--accent-main)] uppercase shrink-0">
                <span>Buka</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
