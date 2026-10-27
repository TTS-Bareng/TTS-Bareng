import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, RotateCcw, Share2, Swords, Crown } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import {
  getEloTier,
  type NationalEloLeaderboardEntry,
} from '../lib/eloSystem';
import { MASCOTS } from '../assets/maskots';
import { getBaseOrigin } from '../lib/deeplink';

export const LeaderboardModal: React.FC = () => {
  const {
    isLeaderboardOpen,
    closeLeaderboard,
    eloLeaderboard,
    isLoadingEloLeaderboard,
    loadEloLeaderboard,
    user,
    openShareModal,
    eloRating,
    isVip,
    battlesStats,
  } = useGameStore();

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
    await loadEloLeaderboard();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Combine real Supabase player leaderboard with user's current ELO
  const userTier = getEloTier(eloRating);
  const userEntry: NationalEloLeaderboardEntry = {
    rank: 0,
    id: user.id || 'user_current',
    name: user.name || 'Kamu',
    avatar: user.avatar || MASCOTS.crosswordChampion,
    elo: eloRating,
    tier: userTier.key,
    isVip,
    battlesWon: battlesStats.won,
    winRate: battlesStats.total > 0 ? Math.round((battlesStats.won / battlesStats.total) * 100) : 0,
  };

  const remoteEntries: NationalEloLeaderboardEntry[] = (eloLeaderboard || [])
    .filter((p) => p.id !== user.id && p.name !== user.name)
    .map((p) => {
      const tier = getEloTier(p.elo);
      return {
        rank: 0,
        id: p.id,
        name: p.name,
        avatar: p.avatar || MASCOTS.crosswordChampion,
        elo: p.elo,
        tier: tier.key,
        isVip: p.is_vip,
        battlesWon: 0,
        winRate: 0,
      };
    });

  const combinedEloLeaderboard = [userEntry, ...remoteEntries]
    .sort((a, b) => b.elo - a.elo)
    .map((item, idx) => ({ ...item, rank: idx + 1 }));

  const playerEloRank = combinedEloLeaderboard.find((e) => e.id === userEntry.id || e.id === 'user_current')?.rank || 1;

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
      shareUrl: getBaseOrigin(),
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
                      LIGA CATUR ELO
                    </span>
                    {isOffline && (
                      <span className="text-[7px] font-black px-1.5 py-0.2 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] uppercase">
                        OFFLINE
                      </span>
                    )}
                  </div>
                  <h3 className="text-[16px] font-black tracking-tight text-[var(--text-primary)] leading-tight">
                    Klasemen Master ELO
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
                  <RotateCcw className={`w-3.5 h-3.5 stroke-[2] ${isRefreshing || isLoadingEloLeaderboard ? 'animate-spin' : ''}`} />
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

            {/* Subtitle Pill Header */}
            <div className="w-full py-1.5 px-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between text-[var(--text-secondary)] text-[9.5px] font-bold shrink-0">
              <span className="flex items-center gap-1.5 text-[var(--accent-main)]">
                <Swords className="w-3 h-3 stroke-[2.2]" />
                <span>Papan Peringkat Duel Nasional</span>
              </span>
              <span className="uppercase font-black text-[8px] px-1.5 py-0.2 rounded bg-[var(--accent-light)] text-[var(--accent-main)]">
                {combinedEloLeaderboard.length} Master
              </span>
            </div>

            {/* Leaderboard List Container */}
            <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[360px] flex flex-col gap-2 relative z-10 pr-0.5">
              {isLoadingEloLeaderboard && combinedEloLeaderboard.length <= 1 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-8 text-center">
                  <RotateCcw className="w-6 h-6 text-[var(--accent-main)] animate-spin stroke-[2]" />
                  <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                    Memuat Klasemen ELO...
                  </span>
                </div>
              ) : (
                combinedEloLeaderboard.map((item) => {
                  const rank = item.rank;
                  const isCurrentUserItem = item.id === userEntry.id || item.id === 'user_current';
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
                              ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs font-black'
                              : rank === 2
                              ? 'bg-zinc-300 dark:bg-zinc-400 text-black shadow-xs font-black'
                              : rank === 3
                              ? 'bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/40 shadow-xs font-black'
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
                            <div className="absolute -top-1 -right-1 text-[11px] leading-none drop-shadow-sm text-[var(--accent-main)]">
                              <Crown className="w-3 h-3 fill-current" />
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
                            <span className="font-bold text-[var(--accent-main)]">
                              {tier.name}
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
                    <span>{userTier.name}</span>
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LeaderboardModal;
