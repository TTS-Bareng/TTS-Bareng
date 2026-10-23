import React, { useState, useMemo } from 'react';
import {
  Star,
  Flame,
  Trophy,
  Brain,
  Award,
  Sparkles,
  Camera,
  Settings,
  ArrowRight,
  Check,
  BookOpen,
  Compass,
  Zap,
  Crown,
  Medal,
  Shield,
  ChevronRight,
  PenTool,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { getEloTier } from '../lib/eloSystem';
import { getAvatarFrame } from '../lib/avatarFrames';

interface CircularProgressProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  gradientId: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  percent,
  size = 64,
  strokeWidth = 5.5,
  gradientId,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--accent-main)" stopOpacity="1" />
          <stop offset="100%" stopColor="var(--accent-main)" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="opacity-15 text-[var(--text-secondary)]"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="transparent"
        stroke={`url(#${gradientId})`}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700 ease-out"
      />
    </svg>
  );
};

export const ProfileView: React.FC = () => {
  const {
    user,
    openAuth,
    stars,
    streak,
    streakShields,
    buyStreakShield,
    weeklyLeagueXp,
    openLeagueModal,
    openAchievementDetail,
    claimedAchievementRewards,
    levels,
    levelRecords,
    openLexicon,
    setCurrentTab,
    setArenaSubTab,
    openAvatarPicker,
    openPlayerIdModal,
    trophies,
    eloRating,
    customTtsTickets,
    isVip,
    openVipModal,
    openCustomCrosswordModal,
    openLeaderboard,
  } = useGameStore();

  const [toastMessage] = useState<string | null>(null);

  const isCustomImageAvatar = Boolean(
    user.avatar && (
      user.avatar.startsWith('data:') ||
      user.avatar.startsWith('http') ||
      user.avatar.startsWith('/') ||
      user.avatar.includes('.webp') ||
      user.avatar.includes('.png')
    )
  );

  const activeFrame = getAvatarFrame(user.avatarFrame);

  // Compute real statistics (Zero Dummy Data)
  const totalCompletedLevels = useMemo(() => {
    return Object.values(levelRecords).filter((r) => r.completed).length;
  }, [levelRecords]);

  const totalWordsInApp = useMemo(() => {
    return levels.reduce((sum, lvl) => {
      return sum + (lvl.clues?.across?.length || 0) + (lvl.clues?.down?.length || 0);
    }, 0);
  }, [levels]);

  const totalSolvedWords = useMemo(() => {
    let count = 0;
    for (const lvl of levels) {
      const rec = levelRecords[lvl.id];
      if (rec?.solved) {
        count += rec.solved.length;
      }
    }
    return count;
  }, [levels, levelRecords]);

  const accuracy = useMemo(() => {
    if (totalWordsInApp === 0) return 0;
    return Math.min(100, Math.round((totalSolvedWords / totalWordsInApp) * 100));
  }, [totalSolvedWords, totalWordsInApp]);

  // Authentic Honors Badges (Lencana Kehormatan 100% Data Riil)
  const achievements = useMemo(() => {
    return [
      {
        id: 'first_word',
        title: 'Langkah Awal',
        desc: 'Pecahkan kata silang pertama Anda',
        icon: Sparkles,
        rarity: 'Umum' as const,
        percent: Math.min(100, Math.round((totalSolvedWords / 1) * 100)),
        rewardStars: 25,
        unlocked: totalSolvedWords >= 1,
        progress: `${Math.min(totalSolvedWords, 1)}/1 Kata`,
      },
      {
        id: 'chapter_one',
        title: 'Penakluk Bab 1',
        desc: 'Tuntaskan Bab 1 Horizon Kata',
        icon: Trophy,
        rarity: 'Umum' as const,
        percent: levelRecords['level_1_santai']?.completed ? 100 : 0,
        rewardStars: 25,
        unlocked: !!levelRecords['level_1_santai']?.completed,
        progress: levelRecords['level_1_santai']?.completed ? 'Selesai' : '0/1 Bab',
      },
      {
        id: 'word_master_10',
        title: 'Kolektor Kata',
        desc: 'Pecahkan 10 kata teka-teki silang',
        icon: Brain,
        rarity: 'Umum' as const,
        percent: Math.min(100, Math.round((totalSolvedWords / 10) * 100)),
        rewardStars: 25,
        unlocked: totalSolvedWords >= 10,
        progress: `${Math.min(totalSolvedWords, 10)}/10 Kata`,
      },
      {
        id: 'word_master_25',
        title: 'Pujangga Muda',
        desc: 'Pecahkan 25 kata teka-teki silang',
        icon: Award,
        rarity: 'Langka' as const,
        percent: Math.min(100, Math.round((totalSolvedWords / 25) * 100)),
        rewardStars: 25,
        unlocked: totalSolvedWords >= 25,
        progress: `${Math.min(totalSolvedWords, 25)}/25 Kata`,
      },
      {
        id: 'word_master_50',
        title: 'Ahli Leksikon',
        desc: 'Kuasai 50 kata teka-teki silang',
        icon: BookOpen,
        rarity: 'Langka' as const,
        percent: Math.min(100, Math.round((totalSolvedWords / 50) * 100)),
        rewardStars: 25,
        unlocked: totalSolvedWords >= 50,
        progress: `${Math.min(totalSolvedWords, 50)}/50 Kata`,
      },
      {
        id: 'word_master_100',
        title: 'Begawan Bahasa',
        desc: 'Pecahkan 100 kosakata nusantara',
        icon: Crown,
        rarity: 'Epik' as const,
        percent: Math.min(100, Math.round((totalSolvedWords / 100) * 100)),
        rewardStars: 25,
        unlocked: totalSolvedWords >= 100,
        progress: `${Math.min(totalSolvedWords, 100)}/100 Kata`,
      },
      {
        id: 'streak_3',
        title: 'Semangat Menyala',
        desc: 'Pertahankan rentetan bermain 3 hari berturut-turut',
        icon: Flame,
        rarity: 'Umum' as const,
        percent: Math.min(100, Math.round((streak / 3) * 100)),
        rewardStars: 25,
        unlocked: streak >= 3,
        progress: `${Math.min(streak, 3)}/3 Hari`,
      },
      {
        id: 'streak_7',
        title: 'Api Abadi',
        desc: 'Pertahankan streak bermain 7 hari',
        icon: Zap,
        rarity: 'Langka' as const,
        percent: Math.min(100, Math.round((streak / 7) * 100)),
        rewardStars: 25,
        unlocked: streak >= 7,
        progress: `${Math.min(streak, 7)}/7 Hari`,
      },
      {
        id: 'explorer_10',
        title: 'Penjelajah Bab',
        desc: 'Tuntaskan minimal 10 bab permainan',
        icon: Compass,
        rarity: 'Langka' as const,
        percent: Math.min(100, Math.round((totalCompletedLevels / 10) * 100)),
        rewardStars: 25,
        unlocked: totalCompletedLevels >= 10,
        progress: `${Math.min(totalCompletedLevels, 10)}/10 Bab`,
      },
      {
        id: 'star_collector',
        title: 'Bintang Terang',
        desc: 'Kumpulkan 150 bintang petualangan',
        icon: Star,
        rarity: 'Epik' as const,
        percent: Math.min(100, Math.round((stars / 150) * 100)),
        rewardStars: 25,
        unlocked: stars >= 150,
        progress: `${Math.min(stars, 150)}/150★`,
      },
      {
        id: 'star_master_500',
        title: 'Bintang Kejora',
        desc: 'Kumpulkan 500 bintang petualangan',
        icon: Medal,
        rarity: 'Epik' as const,
        percent: Math.min(100, Math.round((stars / 500) * 100)),
        rewardStars: 25,
        unlocked: stars >= 500,
        progress: `${Math.min(stars, 500)}/500★`,
      },
      {
        id: 'all_chapters',
        title: 'Sang Mahaguru',
        desc: 'Selesaikan seluruh bab petualangan nusantara',
        icon: Trophy,
        rarity: 'Legendaris' as const,
        percent: levels.length > 0 ? Math.min(100, Math.round((totalCompletedLevels / levels.length) * 100)) : 0,
        rewardStars: 25,
        unlocked: totalCompletedLevels >= levels.length && levels.length > 0,
        progress: `${totalCompletedLevels}/${levels.length} Bab`,
      },
    ];
  }, [totalSolvedWords, levelRecords, streak, stars, totalCompletedLevels, levels.length]);

  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  const playerTitle = useMemo(() => {
    if (totalCompletedLevels >= 50 || totalSolvedWords >= 200) return 'Begawan Kosakata';
    if (totalCompletedLevels >= 25 || totalSolvedWords >= 100) return 'Ahli Leksikon';
    if (totalCompletedLevels >= 10 || totalSolvedWords >= 50) return 'Pujangga Muda';
    if (totalCompletedLevels >= 3 || totalSolvedWords >= 15) return 'Penjelajah Kata';
    return 'Perintis Bahasa';
  }, [totalCompletedLevels, totalSolvedWords]);

  return (
    <div className="w-full flex-1 flex flex-col gap-3 px-3.5 pt-[max(18px,env(safe-area-inset-top))] pb-[max(90px,calc(75px+env(safe-area-inset-bottom)))] select-none overflow-y-auto relative">
      {/* Toast Alert Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full liquid-glass-card border border-[var(--accent-main)]/40 shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-[var(--accent-main)]" />
          <span className="text-[12px] font-bold text-[var(--text-primary)]">
            {toastMessage}
          </span>
        </div>
      )}

      {/* 1. Header: Typographic Title + Live Stars Pill + Settings Button */}
      <header className="flex items-center justify-between px-0.5 relative z-10 shrink-0">
        <div>
          <span className="text-[9.5px] font-black uppercase tracking-wider text-[var(--accent-main)] block leading-none mb-0.5">
            PROFIL & PRESTASI
          </span>
          <h2 className="text-[18px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
            Identitas & Lencana
          </h2>
        </div>

        {/* Right Actions: Live Streak & Stars Pill + Settings Icon Button */}
        <div className="flex items-center gap-2">
          <div className="h-8.5 px-3 rounded-full flex items-center gap-2.5 liquid-glass-card border border-black/5 dark:border-white/10 shadow-xs">
            <div className="flex items-center gap-1 text-[var(--accent-main)]">
              <Flame className="w-3.5 h-3.5 fill-current text-[var(--accent-main)]" />
              <span className="text-[11.5px] font-black text-[var(--text-primary)]">
                {streak}
              </span>
            </div>
            <span className="w-0.5 h-3 bg-black/10 dark:bg-white/15 rounded-full" />
            <div className="flex items-center gap-1 text-[var(--accent-main)]">
              <Star className="w-3.5 h-3.5 fill-current text-[var(--accent-main)]" />
              <span className="text-[11.5px] font-black text-[var(--text-primary)]">
                {stars}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('settings')}
            title="Pengaturan"
            aria-label="Buka Pengaturan"
            className="w-8.5 h-8.5 rounded-full liquid-glass-tile border border-black/5 dark:border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer tactile-active shadow-xs"
          >
            <Settings className="w-4 h-4 stroke-[2]" />
          </button>
        </div>
      </header>

      {/* Card 1: Apple VIP Digital Passport */}
      <div
        onClick={openPlayerIdModal}
        title="Buka Kartu Identitas Resmi"
        className="w-full shrink-0 rounded-[24px] p-4 relative z-10 overflow-hidden border border-white/15 dark:border-white/20 shadow-md flex flex-col gap-3.5 group cursor-pointer tactile-active hover:border-white/35 transition-all"
        style={{
          background: 'var(--hero-grad, var(--accent-grad))',
          color: '#ffffff',
        }}
      >
        {/* Specular Top Sheen & Subtle Ambient Reflections */}
        <div className="absolute top-0 inset-x-0 h-px bg-white/40 pointer-events-none" />
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-black/25 blur-2xl pointer-events-none" />

        {/* Subtle Guilloche / Holographic Passport Watermark (Vector Shield) */}
        <div className="absolute -right-3 -bottom-4 w-36 h-36 opacity-[0.08] pointer-events-none select-none text-white flex items-center justify-center">
          <Shield className="w-full h-full stroke-[1.2]" />
        </div>

        {/* Top Header Row: Status Chip on Left, Fast Action Pill on Right */}
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 dark:bg-black/30 backdrop-blur-md border border-white/20 text-white shadow-xs">
            <span
              className={`w-1.5 h-1.5 rounded-full ${user.isGuest ? 'bg-amber-300' : 'bg-emerald-300'} animate-pulse`}
            />
            <span className="text-[9px] font-black uppercase tracking-wider">
              PASPOR • {user.isGuest ? 'TAMU' : 'TERVERIFIKASI'}
            </span>
            <ChevronRight className="w-3 h-3 text-white/70 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {user.isGuest ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openAuth();
              }}
              className="px-3 py-1 rounded-full bg-white text-[10.5px] font-black inline-flex items-center gap-1.5 cursor-pointer tactile-active shadow-xs hover:bg-white/95 transition-all"
              style={{ color: 'var(--hero-btn-text, #111113)' }}
            >
              <Sparkles className="w-3 h-3" />
              <span>Masuk / Sinkron</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openAvatarPicker();
              }}
              className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 text-white text-[10px] font-bold inline-flex items-center gap-1.5 cursor-pointer tactile-active hover:bg-white/30 transition-all shadow-xs"
            >
              <Camera className="w-3 h-3 stroke-[2.2]" />
              <span>Ubah Foto</span>
            </button>
          )}
        </div>

        {/* Middle Section: Hero Avatar & Player Identity */}
        <div className="flex items-center gap-3.5 relative z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openAvatarPicker();
            }}
            title="Ganti Foto Profil"
            aria-label="Ganti Foto Profil"
            className="relative group cursor-pointer tactile-active shrink-0"
          >
            <div className={`w-14 h-14 rounded-full p-0.5 ${activeFrame.ringClass} ${activeFrame.glowClass} flex items-center justify-center overflow-hidden shadow-sm transition-all duration-300`}>
              <div className="w-full h-full rounded-full overflow-hidden bg-black/25 flex items-center justify-center">
                {isCustomImageAvatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-[20px] font-black text-white uppercase">
                    {user.name?.charAt(0) || 'P'}
                  </span>
                )}
              </div>
            </div>

            <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-white text-zinc-900 flex items-center justify-center shadow-xs">
              <Camera className="w-2.5 h-2.5 stroke-[2.5]" />
            </div>
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <h3 className="text-[19px] sm:text-[21px] font-black text-white tracking-tight leading-tight truncate">
                {user.name}
              </h3>
              <span className="text-[10px] font-bold text-white/80 shrink-0">
                @{user.name.toLowerCase().replace(/\s+/g, '_')}
              </span>
            </div>

            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[9.5px] font-black uppercase tracking-wider text-white/95 px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs border border-white/20">
                <Medal className="w-2.5 h-2.5 stroke-[2.5]" />
                {playerTitle}
              </span>
              <span className="text-[10px] text-white/80 truncate">
                {user.email || 'Pemain TTS Bareng'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Section: 3 VIP Micro-Pills (Real Passport Metrics) */}
        <div className="grid grid-cols-3 gap-2 relative z-10 pt-1 border-t border-white/15">
          <div className="py-1.5 px-2 rounded-xl bg-black/15 dark:bg-black/25 backdrop-blur-md border border-white/15 flex items-center justify-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-white/90 stroke-[2.2]" />
            <span className="text-[11px] font-black text-white leading-none">
              {totalCompletedLevels} <span className="text-[9px] font-semibold text-white/75">Bab</span>
            </span>
          </div>

          <div className="py-1.5 px-2 rounded-xl bg-black/15 dark:bg-black/25 backdrop-blur-md border border-white/15 flex items-center justify-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-current text-white/90" />
            <span className="text-[11px] font-black text-white leading-none">
              {stars} <span className="text-[9px] font-semibold text-white/75">★</span>
            </span>
          </div>

          <div className="py-1.5 px-2 rounded-xl bg-black/15 dark:bg-black/25 backdrop-blur-md border border-white/15 flex items-center justify-center gap-1.5">
            <Flame className="w-3.5 h-3.5 fill-current text-white/90" />
            <span className="text-[11px] font-black text-white leading-none">
              {streak} <span className="text-[9px] font-semibold text-white/75">Hari</span>
            </span>
          </div>
        </div>
      </div>

      {/* Card 1.5: VIP Membership Banner */}
      <div
        onClick={openVipModal}
        className="w-full shrink-0 rounded-[20px] p-3.5 relative z-10 overflow-hidden border border-amber-500/30 shadow-xs flex items-center justify-between gap-3 cursor-pointer tactile-active hover:border-amber-500/50 transition-all bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent backdrop-blur-md"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-black flex items-center justify-center shrink-0 shadow-xs border border-amber-200/50">
            <Crown className="w-5 h-5 fill-black stroke-black" />
          </div>
          <div className="min-w-0 text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[12.5px] font-black text-[var(--text-primary)] tracking-tight">
                {isVip ? 'TTS Pass VIP Aktif' : 'Tingkatkan ke TTS Pass VIP'}
              </span>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                {isVip ? 'UNLIMITED' : 'RP 29.000/BLN'}
              </span>
            </div>
            <p className="text-[9.5px] text-[var(--text-secondary)] truncate mt-0.5">
              {isVip
                ? 'Nikmati kreasi tanpa batas & mahkota emas juara'
                : 'Bebas bikin TTS kustom, lencana mahkota & pelindung streak'}
            </p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
      </div>

      {/* Card 2: Penguasaan Kata & Akurasi (Word Mastery Bento) */}
      <div
        className="w-full shrink-0 rounded-[24px] p-4 relative z-10 flex items-center justify-between gap-3.5 border border-[var(--accent-main)]/20 shadow-xs overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
        }}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

        <div className="relative inline-flex items-center justify-center shrink-0 z-10">
          <CircularProgress
            percent={accuracy}
            size={64}
            strokeWidth={5.5}
            gradientId="grad-profile-accuracy"
          />
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-[14px] font-black text-[var(--text-primary)] leading-none">
              {accuracy}%
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 relative z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[13.5px] font-black text-[var(--text-primary)] tracking-tight">
              Akurasi Kata
            </span>
            <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
              {totalSolvedWords}/{totalWordsInApp} Kata
            </span>
          </div>
          <p className="text-[9.5px] text-[var(--text-secondary)] leading-tight mb-2">
            {accuracy >= 80
              ? 'Penguasaan kosakata Anda sangat tinggi!'
              : accuracy >= 40
              ? 'Bagus! Selesaikan bab berikutnya untuk menambah kata.'
              : 'Pecahkan teka-teki silang untuk meningkatkan akurasi.'}
          </p>
          <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent-main)] transition-all duration-500"
              style={{ width: `${Math.max(6, accuracy)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card 3: 2x2 Bento Metrik Progres */}
      <div className="grid grid-cols-2 gap-2.5 z-10 relative shrink-0">
        {/* Metrik 1: Bab Selesai (Beralih ke tab Arena) */}
        <div
          onClick={() => setCurrentTab('arena')}
          title="Buka Arena Petualangan Bab"
          className="rounded-[22px] p-3.5 flex flex-col justify-between border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden cursor-pointer tactile-active hover:border-[var(--accent-main)]/50 transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

          <div className="flex items-center justify-between mb-1.5 relative z-10">
            <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
              <Trophy className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              ARENA BAB ↗
            </span>
          </div>
          <div className="relative z-10">
            <span className="text-[20px] font-black text-[var(--text-primary)] block leading-none mb-0.5">
              {totalCompletedLevels}
              <span className="text-[12px] text-[var(--text-secondary)] font-normal">
                /{levels.length}
              </span>
            </span>
            <span className="text-[8.5px] font-medium text-[var(--text-secondary)]">
              Bab Selesai
            </span>
          </div>
        </div>

        {/* Metrik 2: Kata Terpecahkan (Buka Buku Kosakata) */}
        <div
          onClick={openLexicon}
          title="Buka Buku Kosakata KBBI"
          className="rounded-[22px] p-3.5 flex flex-col justify-between border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden cursor-pointer tactile-active hover:border-[var(--accent-main)]/50 transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

          <div className="flex items-center justify-between mb-1.5 relative z-10">
            <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
              <Brain className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              LEKSIKON ↗
            </span>
          </div>
          <div className="relative z-10">
            <span className="text-[20px] font-black text-[var(--text-primary)] block leading-none mb-0.5">
              {totalSolvedWords}
            </span>
            <span className="text-[8.5px] font-medium text-[var(--text-secondary)]">
              Kata Tuntas
            </span>
          </div>
        </div>

        {/* Metrik 3: Streak Harian */}
        <div
          className="rounded-[22px] p-3.5 flex flex-col justify-between border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

          <div className="flex items-center justify-between mb-1.5 relative z-10">
            <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
              <Flame className="w-3.5 h-3.5 fill-current text-[var(--accent-main)]" />
            </div>
            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              RENTETAN
            </span>
          </div>
          <div className="relative z-10">
            <span className="text-[20px] font-black text-[var(--text-primary)] block leading-none mb-0.5">
              {streak} Hari
            </span>
            <span className="text-[8.5px] font-medium text-[var(--text-secondary)]">
              Streak Aktif
            </span>
          </div>
        </div>

        {/* Metrik 4: Lencana Terbuka */}
        <div
          className="rounded-[22px] p-3.5 flex flex-col justify-between border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

          <div className="flex items-center justify-between mb-1.5 relative z-10">
            <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
              <Award className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              PRESTASI
            </span>
          </div>
          <div className="relative z-10">
            <span className="text-[20px] font-black text-[var(--text-primary)] block leading-none mb-0.5">
              {unlockedAchievementsCount}
              <span className="text-[12px] text-[var(--text-secondary)] font-normal">
                /{achievements.length}
              </span>
            </span>
            <span className="text-[8.5px] font-medium text-[var(--text-secondary)]">
              Lencana Dibuka
            </span>
          </div>
        </div>
      </div>

      {/* Retention Engine Bento: Perisai Runtun & Divisi Liga */}
      <div className="w-full shrink-0 grid grid-cols-2 gap-3 relative z-10">
        {/* Left: Perisai Runtun (Streak Shield) */}
        <div
          className="rounded-[22px] p-3.5 flex flex-col justify-between border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center text-[var(--accent-main)]">
                <Shield className="w-3.5 h-3.5 fill-current/20 stroke-[2.2]" />
              </div>
              {/* 2-slot indicator */}
              <div className="flex items-center gap-1">
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black ${
                    streakShields >= 1
                      ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)]'
                      : 'border border-dashed border-current/30 text-[var(--text-secondary)]'
                  }`}
                  title="Slot Perisai 1"
                >
                  {streakShields >= 1 ? '✓' : '+'}
                </div>
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black ${
                    streakShields >= 2
                      ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)]'
                      : 'border border-dashed border-current/30 text-[var(--text-secondary)]'
                  }`}
                  title="Slot Perisai 2"
                >
                  {streakShields >= 2 ? '✓' : '+'}
                </div>
              </div>
            </div>

            <h4 className="text-[12px] font-black text-[var(--text-primary)] leading-tight mb-0.5">
              Perisai Runtun
            </h4>
            <p className="text-[8.5px] text-[var(--text-secondary)] leading-tight">
              {streakShields > 0
                ? `${streakShields} perisai siap menjaga streak.`
                : 'Kosong. Beli perisai untuk jaga streak.'}
            </p>
          </div>

          <div className="mt-2.5">
            {streakShields < 2 ? (
              <button
                type="button"
                onClick={buyStreakShield}
                disabled={stars < 100}
                className="w-full py-1.5 px-2 rounded-full font-black text-[9.5px] inline-flex items-center justify-center gap-1 transition-all tactile-active cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--accent-grad)',
                  color: 'var(--accent-contrast)',
                }}
              >
                <span>Beli (+100★)</span>
              </button>
            ) : (
              <span className="text-[9px] font-bold text-emerald-400 block text-center py-1">
                Slot Maksimal Aktif ✓
              </span>
            )}
          </div>
        </div>

        {/* Right: Divisi Liga Mingguan */}
        <div
          onClick={openLeagueModal}
          className="rounded-[22px] p-3.5 flex flex-col justify-between border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden cursor-pointer tactile-active hover:border-[var(--accent-main)]/50 transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center text-[var(--accent-main)]">
                <Crown className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <span className="text-[8px] font-black text-[var(--accent-main)] uppercase tracking-wider">
                LIGA ↗
              </span>
            </div>

            <h4 className="text-[12px] font-black text-[var(--text-primary)] leading-tight mb-0.5">
              {weeklyLeagueXp >= 5000
                ? 'Divisi Berlian'
                : weeklyLeagueXp >= 3000
                ? 'Divisi Safir'
                : weeklyLeagueXp >= 1500
                ? 'Divisi Emas'
                : weeklyLeagueXp >= 500
                ? 'Divisi Perak'
                : 'Divisi Perunggu'}
            </h4>
            <p className="text-[8.5px] text-[var(--text-secondary)] leading-tight">
              {weeklyLeagueXp.toLocaleString('id-ID')} Poin Liga minggu ini.
            </p>
          </div>

          <div className="mt-2.5">
            <button
              type="button"
              className="w-full py-1.5 px-2 rounded-full bg-white/10 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[var(--text-primary)] font-black text-[9.5px] inline-flex items-center justify-center gap-1 transition-all"
            >
              <span>Lihat Tangga Liga</span>
            </button>
          </div>
        </div>
      </div>

      {/* ELO Rating & Custom Crossword Creator Pass Bento */}
      <div className="w-full shrink-0 grid grid-cols-2 gap-3 relative z-10">
        {/* Left: ELO Rating Chess Rank */}
        <div
          onClick={openLeaderboard}
          className="rounded-[22px] p-3.5 flex flex-col justify-between border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden cursor-pointer tactile-active hover:border-[var(--accent-main)]/50 transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
          <div className="flex items-center justify-between mb-1.5">
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-[15px]">
              {getEloTier(eloRating).icon}
            </div>
            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
              LIGA ELO ↗
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[20px] font-black text-[var(--text-primary)] font-mono leading-none">
                {eloRating}
              </span>
              <span className="text-[9px] font-bold text-[var(--accent-main)]">
                ELO
              </span>
            </div>
            <span className="text-[8.5px] font-medium text-[var(--text-secondary)] mt-0.5 block truncate">
              {getEloTier(eloRating).name}
            </span>
          </div>
        </div>

        {/* Right: Studio Kreator & Tiket TTS */}
        <div
          onClick={openCustomCrosswordModal}
          className="rounded-[22px] p-3.5 flex flex-col justify-between border border-indigo-500/25 shadow-xs relative overflow-hidden cursor-pointer tactile-active hover:border-indigo-500/50 transition-all"
          style={{
            background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.08) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
          <div className="flex items-center justify-between mb-1.5">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
              <PenTool className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            {isVip ? (
              <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400">
                VIP AKTIF
              </span>
            ) : (
              <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                KREATOR ↗
              </span>
            )}
          </div>
          <div>
            <span className="text-[14px] font-black text-[var(--text-primary)] block leading-tight">
              {isVip ? 'Bebas Kreasi' : `${customTtsTickets} Tiket TTS`}
            </span>
            <span className="text-[8.5px] font-medium text-[var(--text-secondary)] mt-0.5 block">
              Bikin TTS Custom
            </span>
          </div>
        </div>
      </div>

      {/* Card: Lemari Trofi Turnamen */}
      <div
        onClick={() => {
          setCurrentTab('arena');
          setArenaSubTab('tournament');
        }}
        className="w-full shrink-0 rounded-[24px] p-4 relative z-10 flex flex-col gap-2.5 border border-[var(--accent-main)]/20 shadow-xs overflow-hidden cursor-pointer tactile-active group transition-all hover:border-[var(--accent-main)]/40"
        style={{
          background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
        }}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center text-[var(--accent-main)] shadow-2xs group-hover:scale-105 transition-transform">
              <Trophy className="w-4 h-4 fill-current stroke-none" />
            </div>
            <div>
              <h4 className="text-[13px] font-black text-[var(--text-primary)] leading-tight flex items-center gap-1.5">
                <span>Lemari Trofi Turnamen</span>
                <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
                  TURNAMEN
                </span>
              </h4>
              <span className="text-[9px] text-[var(--text-secondary)]">
                {trophies.totalTournaments} Musim Diikuti {trophies.lastChampionDate ? '• Pernah Juara' : ''}
              </span>
            </div>
          </div>

          <div className="w-6 h-6 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* 3 Trofi Pods */}
        <div className="grid grid-cols-3 gap-2 relative z-10">
          {/* Trofi Emas */}
          <div className="p-2 rounded-2xl bg-[var(--accent-light)]/40 border border-[var(--accent-main)]/25 flex flex-col items-center text-center">
            <Trophy className="w-4 h-4 fill-current text-[var(--accent-main)] stroke-none mb-1 drop-shadow-xs" />
            <span className="text-[14px] font-black text-[var(--accent-main)] leading-none">
              {trophies.gold}
            </span>
            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase mt-0.5">
              Juara Emas
            </span>
          </div>

          {/* Trofi Perak */}
          <div className="p-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)] flex flex-col items-center text-center">
            <Medal className="w-4 h-4 text-slate-400 stroke-[2] mb-1" />
            <span className="text-[14px] font-black text-[var(--text-primary)] leading-none">
              {trophies.silver}
            </span>
            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase mt-0.5">
              Perak (Final)
            </span>
          </div>

          {/* Trofi Perunggu */}
          <div className="p-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)] flex flex-col items-center text-center">
            <Shield className="w-4 h-4 text-[var(--accent-main)] stroke-[2] mb-1" />
            <span className="text-[14px] font-black text-[var(--text-primary)] leading-none">
              {trophies.bronze}
            </span>
            <span className="text-[8px] font-bold text-[var(--text-secondary)] uppercase mt-0.5">
              Perunggu (Top 4)
            </span>
          </div>
        </div>
      </div>

      {/* Card 4: Lencana Kehormatan Showcase */}
      <div
        className="w-full shrink-0 rounded-[24px] p-4 relative z-10 flex flex-col gap-2.5 border border-white/20 shadow-md overflow-hidden"
        style={{
          background: 'var(--accent-grad)',
          color: 'var(--accent-contrast)',
        }}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-white/30 pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[var(--accent-contrast)]" />
            <span className="text-[13px] font-black text-[var(--accent-contrast)]">
              Lencana Kehormatan
            </span>
          </div>
          <span
            className="text-[8.5px] font-black px-2 py-0.5 rounded-full border border-current/20"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              color: 'var(--accent-contrast)',
            }}
          >
            {unlockedAchievementsCount}/{achievements.length} Terbuka
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 relative z-10 max-h-[300px] overflow-y-auto pr-1">
          {achievements.map((item) => {
            const IconComponent = item.icon;
            const isClaimed = !!claimedAchievementRewards[item.id];
            const canClaim = item.unlocked && !isClaimed;
            return (
              <div
                key={item.id}
                onClick={() => {
                  openAchievementDetail({
                    id: item.id,
                    title: item.title,
                    desc: item.desc,
                    rarity: item.rarity,
                    unlocked: item.unlocked,
                    progress: item.progress,
                    percent: item.percent,
                    rewardStars: item.rewardStars,
                  });
                }}
                className={`rounded-[20px] p-3 border transition-all flex flex-col justify-between cursor-pointer tactile-active hover:scale-[1.02] ${
                  item.unlocked
                    ? 'bg-[var(--accent-contrast)]/10 border-[var(--accent-contrast)]/20 shadow-xs backdrop-blur-xs'
                    : 'bg-[var(--accent-contrast)]/5 border-[var(--accent-contrast)]/10 opacity-55'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div
                    className={`w-7.5 h-7.5 rounded-xl flex items-center justify-center ${
                      item.unlocked
                        ? 'bg-[var(--accent-contrast)]/15 border border-[var(--accent-contrast)]/25 text-[var(--accent-contrast)]'
                        : 'bg-[var(--accent-contrast)]/5 text-[var(--accent-contrast)]/60'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5 stroke-[2.2]" />
                  </div>

                  <span
                    className={`text-[7.5px] font-bold px-1.5 py-0.5 rounded-full ${
                      canClaim
                        ? 'bg-amber-400 text-stone-900 font-black animate-pulse'
                        : item.unlocked
                        ? 'bg-[var(--accent-contrast)]/15 text-[var(--accent-contrast)] border border-[var(--accent-contrast)]/20'
                        : 'bg-[var(--accent-contrast)]/5 text-[var(--accent-contrast)]/60 border border-[var(--accent-contrast)]/10'
                    }`}
                  >
                    {canClaim ? 'KLAIM +25★' : item.progress}
                  </span>
                </div>

                <div>
                  <h4 className="text-[11.5px] font-black text-[var(--accent-contrast)] leading-tight mb-0.5">
                    {item.title}
                  </h4>
                  <p
                    className={`text-[8.5px] leading-tight line-clamp-2 ${
                      item.unlocked
                        ? 'text-[var(--accent-contrast)]/80'
                        : 'text-[var(--accent-contrast)]/55'
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Card 5: Quick Link to Pengaturan Sistem */}
      <div
        onClick={() => setCurrentTab('settings')}
        className="w-full shrink-0 rounded-[22px] p-3.5 relative z-10 flex items-center justify-between gap-3 border border-[var(--accent-main)]/20 shadow-xs overflow-hidden cursor-pointer tactile-active group"
        style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
        }}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

        <div className="flex items-center gap-2.5 min-w-0 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)] shrink-0">
            <Settings className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="min-w-0">
            <span className="text-[11.5px] font-black text-[var(--text-primary)] block leading-tight truncate">
              Pengaturan Sistem
            </span>
            <span className="text-[9px] text-[var(--text-secondary)] block truncate mt-0.5">
              Tema 10 warna, audio taktil, cadangan data & keamanan
            </span>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform relative z-10">
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </div>
      </div>

    </div>
  );
};

export default ProfileView;
