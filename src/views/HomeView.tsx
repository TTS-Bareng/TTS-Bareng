import React, { useState, useMemo } from 'react';
import {
  Star,
  Flame,
  BookOpen,
  Play,
  Map,
  ChevronDown,
  Users,
  Trophy,
  Shield,
  Crown,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import confetti from 'canvas-confetti';
import { type LevelData } from '../lib/crossword';
import { MASCOTS } from '../assets/maskots';
import { getAvatarFrame } from '../lib/avatarFrames';

/** Crossword Grid Pattern Overlay (Oversized Graphic Watermark Texture) */
const CrosswordPatternOverlay: React.FC<{ level: LevelData }> = ({ level }) => {
  // Extract real clue words from current level
  const firstAcross = (level.clues?.across?.[0]?.answer || 'KATA').toUpperCase();
  const firstDown = (level.clues?.down?.[0]?.answer || 'TEKA').toUpperCase();

  // Find intersection index if available
  let acrossIntersectIdx = -1;
  let downIntersectIdx = -1;

  for (let a = 0; a < firstAcross.length; a++) {
    const d = firstDown.indexOf(firstAcross[a]);
    if (d !== -1) {
      acrossIntersectIdx = a;
      downIntersectIdx = d;
      break;
    }
  }

  if (acrossIntersectIdx === -1) {
    acrossIntersectIdx = Math.min(2, Math.max(0, firstAcross.length - 1));
    downIntersectIdx = Math.min(1, Math.max(0, firstDown.length - 1));
  }

  // Trim to fit pattern nicely
  const displayAcross = firstAcross.slice(0, 6);
  const displayDown = firstDown.slice(0, 5);

  const acrossRow = downIntersectIdx;
  const downCol = acrossIntersectIdx;

  const rows = [0, 1, 2, 3, 4];
  const cols = [0, 1, 2, 3, 4, 5];

  return (
    <div
      aria-hidden="true"
      className="absolute -right-2 sm:right-3 top-2 pointer-events-none select-none z-0 opacity-[0.22] dark:opacity-[0.28] group-hover:opacity-[0.34] transition-opacity duration-500"
    >
      <div className="grid grid-cols-6 gap-1.5 transform -rotate-1 sm:-rotate-2 origin-top-right">
        {rows.map((r) =>
          cols.map((c) => {
            const isAcross = r === acrossRow && c < displayAcross.length;
            const isDown = c === downCol && r < displayDown.length;
            const isIntersect = isAcross && isDown;

            let letter = '';
            let cellNum: number | null = null;

            if (isAcross) {
              letter = displayAcross[c];
              if (c === 0) cellNum = 1;
            } else if (isDown) {
              letter = displayDown[r];
              if (r === 0) cellNum = 2;
            }

            const isFilled = isAcross || isDown;

            // Companion blank cell for authentic crossword grid texture
            const isCompanionBlank =
              !isFilled &&
              ((r === acrossRow - 1 && c === 0) ||
                (r === acrossRow + 1 && c === displayAcross.length - 1) ||
                (r === 0 && c === downCol + 1));

            if (!isFilled && !isCompanionBlank) {
              return <div key={`${r}-${c}`} className="w-8 h-8 sm:w-9 sm:h-9" />;
            }

            return (
              <div
                key={`${r}-${c}`}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-[7px] sm:rounded-[8px] relative flex items-center justify-center font-black text-[13.5px] sm:text-[15px] select-none ${
                  isIntersect
                    ? 'bg-white/30 text-white border border-white/50 shadow-sm'
                    : isFilled
                    ? 'bg-white/15 text-white/90 border border-white/25'
                    : 'border border-dashed border-white/15 bg-white/[0.04]'
                }`}
              >
                {cellNum && (
                  <span className="absolute top-0.5 left-1 text-[6.5px] font-bold text-white/70 leading-none">
                    {cellNum}
                  </span>
                )}
                <span>{letter}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// 1. Curated Indonesian Vocabulary (Kata Hari Ini) - Authentic KBBI Words
const KATA_HARI_INI_LIST = [
  {
    word: 'Swastamita',
    phonetic: '/swas·ta·mi·ta/ • nomina',
    definition: 'Pemandangan indah saat matahari terbenam perlahan.',
    example: 'Mengagumi swastamita jingga di tepi pantai nan tenang.',
  },
  {
    word: 'Arunika',
    phonetic: '/a·ru·ni·ka/ • nomina',
    definition: 'Cahaya matahari saat fajar merekah di ufuk timur.',
    example: 'Menanti arunika hangat merebak di puncak bukit.',
  },
  {
    word: 'Renjana',
    phonetic: '/ren·ja·na/ • nomina',
    definition: 'Rasa rindu atau cinta kasih yang amat mendalam.',
    example: 'Tertuang renjana dalam bait-bait gurindam puitis.',
  },
  {
    word: 'Candramawa',
    phonetic: '/can·dra·ma·wa/ • adjektiva',
    definition: 'Hitam bercampur putih pada corak bulu kucing.',
    example: 'Kucing candramawa anggun melintas beranda rumah.',
  },
  {
    word: 'Nirmala',
    phonetic: '/nir·ma·la/ • adjektiva',
    definition: 'Suci tanpa noda dan cela; bersih dan murni.',
    example: 'Hati nirmala memancarkan ketenangan batin yang tulus.',
  },
  {
    word: 'Saujana',
    phonetic: '/sau·ja·na/ • nomina',
    definition: 'Jauh sejauh mata memandang; jarak pandang luas.',
    example: 'Saujana padang savana membentang menghijau asri.',
  },
  {
    word: 'Derana',
    phonetic: '/de·ra·na/ • adjektiva',
    definition: 'Tahan dan tabah menghadapi kesukaran hidup.',
    example: 'Pribadi derana tegar melangkah di tengah terpaan ujian.',
  },
  {
    word: 'Bianglala',
    phonetic: '/bi·ang·la·la/ • nomina',
    definition: 'Lengkung pelangi penuh rona warna di cakrawala.',
    example: 'Bianglala menawan muncul seusai rintik gerimis reda.',
  },
];

function computeDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function computeTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 11) return 'Selamat Pagi';
  if (hour >= 11 && hour < 15) return 'Selamat Siang';
  if (hour >= 15 && hour < 19) return 'Selamat Sore';
  return 'Selamat Malam';
}

export const HomeView: React.FC = () => {
  const {
    selectLevel,
    levels,
    levelRecords,
    currentLevelIndex,
    stars,
    streak,
    streakShields,
    user,
    solvedClues,
    setCurrentTab,
    addStars,
    openLexicon,
    isVip,
    openVipModal,
    openAvatarPicker,
    openLevelSelect,
  } = useGameStore();

  const currentLevel = levels[currentLevelIndex] || levels[0];
  const totalWords =
    (currentLevel.clues?.across?.length || 0) + (currentLevel.clues?.down?.length || 0) || 8;
  const solvedCount = solvedClues.length;
  const progressPercent = Math.min(100, Math.round((solvedCount / totalWords) * 100));

  // Compute real total solved words across all levels (Zero Dummy Data)
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

  // Dynamic Date-based Word of the Day & Greeting
  const [dayOfYear] = useState(computeDayOfYear);
  const [timeGreeting] = useState(computeTimeGreeting);
  const todayWordData = KATA_HARI_INI_LIST[dayOfYear % KATA_HARI_INI_LIST.length];

  const wordStorageKey = `tts_quest_word_claimed_${todayWordData.word}`;
  const [isWordFlipped, setIsWordFlipped] = useState<boolean>(false);
  const [isWordRewardClaimed, setIsWordRewardClaimed] = useState<boolean>(() => {
    return localStorage.getItem(wordStorageKey) === 'true';
  });

  const handleFlipWord = () => {
    setIsWordFlipped(!isWordFlipped);
    if (!isWordRewardClaimed) {
      setIsWordRewardClaimed(true);
      localStorage.setItem(wordStorageKey, 'true');
      localStorage.setItem(`tts_quest_daily_word_done_${new Date().toISOString().slice(0, 10)}`, 'true');
      addStars(5);
      confetti({
        particleCount: 35,
        spread: 45,
        origin: { y: 0.8 },
      });
    }
  };

  const handleStartPlay = () => {
    selectLevel(currentLevelIndex);
    setCurrentTab('game');
  };

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

  const cleanCategory = (currentLevel.category || 'Eksplorasi').toUpperCase();

  return (
    <div className="w-full flex-1 flex flex-col gap-3 px-3.5 pt-[max(18px,env(safe-area-inset-top))] pb-[max(90px,calc(75px+env(safe-area-inset-bottom)))] select-none overflow-y-auto relative">
      {/* 1. Fluid Modern Profile Header (Unboxed & Dynamic Island Capsule) */}
      <header className="w-full shrink-0 flex items-center justify-between gap-2.5 px-1 pt-0.5 pb-0.5 relative z-10 select-none">
        {/* Left: Avatar + Identity with Greeting */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={openAvatarPicker}
            title="Ganti Foto Profil"
            aria-label="Ganti Foto Profil"
            className="relative cursor-pointer tactile-active shrink-0"
          >
            <div className={`w-10.5 h-10.5 rounded-full p-0.5 ${activeFrame.ringClass} ${activeFrame.glowClass} flex items-center justify-center shadow-2xs transition-all duration-300`}>
              <div className="w-full h-full rounded-full overflow-hidden bg-[var(--bg-card)] flex items-center justify-center border border-white/20">
                {isCustomImageAvatar ? (
                  <img
                    src={user.avatar}
                    alt="Foto Profil"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-[15px] font-black text-[var(--accent-main)] uppercase">
                    {user.name?.charAt(0) || 'P'}
                  </span>
                )}
              </div>
            </div>
          </button>

          {/* User Name & Time-based Greeting */}
          <div className="min-w-0">
            <span className="text-[10px] text-[var(--text-secondary)] font-semibold leading-none block mb-1">
              {timeGreeting},
            </span>
            <div className="flex items-center gap-1.5">
              <h2 className="text-[15px] font-black text-[var(--text-primary)] tracking-tight leading-none truncate">
                {user.name}
              </h2>
              {isVip ? (
                <button
                  type="button"
                  onClick={openVipModal}
                  className="text-[7.5px] font-black px-1.5 py-0.5 rounded-full uppercase leading-none flex items-center gap-0.5 shadow-2xs cursor-pointer hover:scale-105 transition-transform border border-white/20"
                  style={{ background: 'var(--accent-grad)', color: 'var(--accent-contrast)' }}
                >
                  <Crown className="w-2.5 h-2.5 fill-current stroke-current" />
                  <span>VIP</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openVipModal}
                  className="text-[7.5px] font-bold px-1.5 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)] uppercase leading-none flex items-center gap-0.5 cursor-pointer hover:opacity-85 transition-opacity"
                >
                  <Crown className="w-2.5 h-2.5 stroke-[2.2]" />
                  <span>VIP</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Dynamic Island Stats Capsule & Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Dynamic Island Stats Pill (Streak & Perisai, Bintang, Kosakata) */}
          <div className="h-8.5 px-2.5 rounded-full liquid-glass-card flex items-center gap-2 shadow-2xs">
            {/* Streak & Shield */}
            <div
              className="flex items-center gap-1 text-[var(--accent-main)]"
              title={streakShields > 0 ? `Streak ${streak} Hari (${streakShields} Perisai Aktif)` : `Streak ${streak} Hari`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span className="text-[11.5px] font-black text-[var(--text-primary)] leading-none">
                {streak}
              </span>
              {streakShields > 0 && (
                <Shield className="w-2.5 h-2.5 fill-current/30 stroke-[2.2]" />
              )}
            </div>

            <span className="w-px h-3 bg-black/10 dark:bg-white/15 rounded-full" />

            {/* Stars */}
            <div className="flex items-center gap-1 text-[var(--accent-main)]" title="Total Bintang">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-[11.5px] font-black text-[var(--text-primary)] leading-none">
                {stars}
              </span>
            </div>

            <span className="w-px h-3 bg-black/10 dark:bg-white/15 rounded-full" />

            {/* Solved Words / Lexicon */}
            <button
              type="button"
              onClick={openLexicon}
              title="Buka Buku Kosakata KBBI"
              className="flex items-center gap-1 text-[var(--accent-main)] cursor-pointer hover:opacity-85 transition-opacity tactile-active"
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[2.2]" />
              <span className="text-[11.5px] font-black text-[var(--text-primary)] leading-none">
                {totalSolvedWords}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Card 1: Solo Quest Map (Horizon Kata) */}
      <div
        onClick={handleStartPlay}
        className="w-full shrink-0 rounded-[26px] p-4 relative z-10 cursor-pointer tactile-active group transition-all overflow-hidden border border-white/10 dark:border-white/15 shadow-sm"
        style={{
          background: 'var(--hero-grad, var(--accent-grad))',
          color: '#ffffff',
        }}
      >
        {/* Soft specular ambient lighting highlights */}
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-black/25 blur-2xl pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-px bg-white/30 pointer-events-none" />

        {/* Crossword Grid Pattern Overlay (Oversized Graphic Watermark Texture) */}
        <CrosswordPatternOverlay level={currentLevel} />

        {/* Top meta row */}
        <div className="flex items-center justify-between mb-2 relative z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openLevelSelect();
            }}
            className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/25 hover:bg-white/30 transition-colors cursor-pointer flex items-center gap-1 tactile-active"
            title="Buka Peta & Pilihan Bab"
          >
            <span>BAB {currentLevelIndex + 1} • {cleanCategory}</span>
            <ChevronDown className="w-2.5 h-2.5 stroke-[3]" />
          </button>
          <span className="text-[11px] font-bold text-white/90">
            {solvedCount}/{totalWords} Kata
          </span>
        </div>

        {/* Middle row: Title & description overlaying over mascot */}
        <div className="relative z-10 mb-2 pr-6 sm:pr-10">
          <h3 className="text-[20px] font-black text-white tracking-tight leading-tight mb-1 max-w-[75%]">
            {currentLevel.title}
          </h3>
          <p className="text-[10.5px] text-white/85 leading-tight mb-1 max-w-[70%]">
            Selesaikan kata bersilangan untuk membuka bab berikutnya.
          </p>
        </div>

        {/* Sleek Shortened Progress Bar on the left */}
        <div className="w-[58%] my-2 relative z-10">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9.5px] font-bold text-white/85">
              Progres Bab
            </span>
            <span className="text-[9.5px] font-black text-white">
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-black/25 overflow-hidden p-0.5 border border-white/20">
            <div
              className="h-full rounded-full transition-all duration-500 bg-white"
              style={{
                width: `${Math.max(solvedCount > 0 ? progressPercent : 12, 12)}%`,
              }}
            />
          </div>
        </div>

        {/* Action Buttons on the left, not cutting across mascot */}
        <div className="flex items-center gap-2 justify-start mt-2 relative z-10">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openLevelSelect();
            }}
            className="py-1.5 px-3 rounded-full bg-white/20 hover:bg-white/30 text-white text-[10.5px] font-bold border border-white/25 backdrop-blur-md tactile-active flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Map className="w-3 h-3 stroke-[2.2]" />
            <span>Peta Bab</span>
          </button>
          <div
            className="py-1.5 px-3.5 rounded-full bg-white text-[10.5px] font-black flex items-center gap-1.5 group-hover:scale-105 transition-transform shadow-sm"
            style={{ color: 'var(--hero-btn-text, #111113)' }}
          >
            <Play className="w-3 h-3 fill-current stroke-[0]" />
            <span>Lanjut Main</span>
          </div>
        </div>

        {/* Large Solid Mascot Overlay - Fierce Plush Crossword Champion */}
        <img
          src={MASCOTS.crosswordChampion}
          alt="Mascot Juara Petualangan Solo"
          className="absolute -bottom-2 -right-1 w-36 sm:w-44 h-40 sm:h-48 object-contain object-bottom pointer-events-none select-none z-0 filter drop-shadow-lg group-hover:scale-105 transition-transform"
        />
      </div>

      {/* 3. Two-Column Grid: Turnamen Komunitas (Half, Left) + Streak Card (Half, Right) */}
      <div className="w-full grid grid-cols-2 gap-3 shrink-0">
        {/* Left: Turnamen Komunitas (Half Card) */}
        <div
          onClick={() => setCurrentTab('arena')}
          className="rounded-[24px] p-3.5 relative z-10 cursor-pointer tactile-active group transition-all overflow-hidden border border-[var(--accent-main)]/20 shadow-xs flex flex-col justify-between min-h-[175px]"
          style={{
            background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
          }}
        >
          {/* Top meta */}
          <div className="flex items-center justify-between gap-1 mb-2 relative z-10">
            <div className="flex items-center gap-1 min-w-0">
              <div className="w-5 h-5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] flex items-center justify-center shrink-0">
                <Trophy className="w-3 h-3 stroke-[2.2]" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider text-[var(--text-primary)] truncate">
                KOMPETISI
              </span>
            </div>
            <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)]">
              PIALA
            </span>
          </div>

          {/* Title & Desc */}
          <div className="relative z-10 mb-1">
            <h4 className="text-[14.5px] font-black text-[var(--text-primary)] tracking-tight leading-tight mb-0.5">
              Turnamen
            </h4>
            <p className="text-[9.5px] text-[var(--text-secondary)] leading-tight line-clamp-2">
              Sistem gugur & piala kejuaraan komunitas.
            </p>
          </div>

          {/* Bottom Action */}
          <div className="relative z-10 flex items-end justify-between mt-auto pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[9.5px] font-black shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              <Trophy className="w-2.5 h-2.5 fill-current stroke-[0]" />
              <span>Buka</span>
            </div>
          </div>

          {/* Large Solid Mascot Overlay (Official Tournament Champions with Gold Trophy) */}
          <img
            src={MASCOTS.tournamentChampions}
            alt="Mascot Turnamen TTS Bareng"
            className="absolute -bottom-1 -right-2 w-32 sm:w-38 h-26 sm:h-30 object-contain object-right-bottom pointer-events-none select-none z-0 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] group-hover:scale-105 transition-transform"
          />
        </div>

        {/* Right: Gamified Streak Card (Half Card, Styled identically to Daily Rush, with Big Flame Logo in Corner) */}
        <div
          onClick={() => setCurrentTab('quests')}
          className="rounded-[24px] p-3.5 relative z-10 cursor-pointer tactile-active group transition-all overflow-hidden border border-[var(--accent-main)]/20 shadow-xs flex flex-col justify-between min-h-[175px]"
          style={{
            background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
          }}
        >
          {/* Top meta */}
          <div className="flex items-center justify-between gap-1 mb-2 relative z-10">
            <div className="flex items-center gap-1 min-w-0">
              <div className="w-5 h-5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] flex items-center justify-center shrink-0">
                <Flame className="w-3 h-3 fill-current stroke-[0]" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-wider text-[var(--text-primary)] truncate">
                STREAK API
              </span>
            </div>
            <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)] shrink-0">
              {streak > 0 ? 'AKTIF' : 'PADAM'}
            </span>
          </div>

          {/* Title & Desc */}
          <div className="relative z-10 mb-1">
            <div className="flex items-baseline gap-1">
              <span className="text-[24px] sm:text-[28px] font-black text-[var(--text-primary)] tracking-tight leading-none">
                {streak}
              </span>
              <span className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-wider">
                Hari
              </span>
            </div>
            <p className="text-[9.5px] text-[var(--text-secondary)] leading-tight line-clamp-2 mt-0.5">
              {streak === 0
                ? 'Pecahkan 1 kata hari ini!'
                : 'Api belajarmu tetap menyala!'}
            </p>
          </div>

          {/* Bottom Action + Big Prominent Flame Logo in Corner (mirrors mascot) */}
          <div className="relative z-10 flex items-end justify-between mt-auto pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[9.5px] font-black shadow-2xs group-hover:scale-105 transition-transform shrink-0">
              <Flame className="w-2.5 h-2.5 fill-current stroke-[0]" />
              <span>Misi</span>
            </div>

            {/* Big Tactile Theme Flame Emblem in bottom-right corner */}
            <div className="relative -mb-2.5 -mr-1.5 w-20 h-22 sm:w-24 sm:h-26 flex items-center justify-center pointer-events-none select-none group-hover:scale-110 transition-transform shrink-0">
              <Flame
                className="w-16 h-18 sm:w-20 sm:h-22 text-[var(--accent-main)] fill-[var(--accent-main)] filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.06)] dark:drop-shadow-[0_4px_10px_rgba(0,0,0,0.25)] transition-all"
                strokeWidth={1.2}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mabar Co-op / Tantang Teman Pill Bar (Theme Gradient Accent) */}
      <div
        onClick={() => setCurrentTab('social')}
        title="Buka Mabar & Arena Komunitas"
        className="w-full h-11 px-3.5 rounded-full flex items-center justify-between gap-2.5 relative z-10 shrink-0 shadow-md cursor-pointer tactile-active hover:opacity-95 transition-all border border-white/25 overflow-hidden group"
        style={{ background: 'var(--accent-grad)' }}
      >
        {/* Top specular sheen highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-white/30 pointer-events-none" />

        {/* Left: Icon + Teks Mabar */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-6.5 h-6.5 rounded-full bg-white/20 border border-white/30 text-[var(--accent-contrast)] flex items-center justify-center shrink-0 backdrop-blur-sm shadow-2xs group-hover:scale-105 transition-transform">
            <Users className="w-3.5 h-3.5 stroke-[2.4]" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className="text-[11px] font-black text-[var(--accent-contrast)] tracking-tight truncate">
              Mabar 1 Papan:
            </span>
            <span className="text-[10px] font-medium text-[var(--accent-contrast)]/85 truncate">
              Pecahkan kata bareng teman via link WA!
            </span>
          </div>
        </div>

        {/* Right: Action Capsule Button */}
        <div
          className="px-3 py-1 rounded-full bg-white text-[10px] font-black shadow-xs shrink-0 group-hover:scale-105 transition-transform"
          style={{ color: 'var(--hero-btn-text, #111113)' }}
        >
          <span>Mabar</span>
        </div>
      </div>

      {/* 5. Hero Card 3: Candramawa (Kata Hari Ini KBBI) */}
      <div
        onClick={handleFlipWord}
        className="w-full shrink-0 rounded-[26px] p-4 relative z-10 cursor-pointer tactile-active transition-all group overflow-hidden border border-black/5 dark:border-white/10 shadow-xs"
        style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
        }}
      >
        <div className="flex items-center justify-between mb-1.5 relative z-10">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-[9px] font-black uppercase tracking-wider text-[var(--text-primary)]">
              KATA HARI INI • KBBI
            </span>
          </div>
          {!isWordRewardClaimed && (
            <span className="text-[8.5px] font-black px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)]">
              +5 Bintang
            </span>
          )}
        </div>

        {/* Middle text content (overlaps on top of the enlarged mascot) */}
        <div className="relative z-10 my-1 pr-6 sm:pr-10">
          <div className="flex items-baseline gap-1.5 flex-wrap mb-1">
            <span className="text-[18px] font-black text-[var(--text-primary)] tracking-tight">
              {todayWordData.word}
            </span>
            <span className="text-[9.5px] text-[var(--text-secondary)] font-medium italic">
              {todayWordData.phonetic}
            </span>
          </div>
          <p className="text-[10.5px] text-[var(--text-primary)] font-medium leading-snug mb-2 max-w-[75%]">
            "{todayWordData.definition}"
          </p>
        </div>

        {/* Bottom bar (Sentence example & Button overlaying on top of mascot) */}
        <div className="pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between relative z-10">
          <span
            className={`text-[9.5px] truncate pr-2 ${
              isWordFlipped
                ? 'font-semibold italic text-[var(--text-primary)]'
                : 'font-medium text-[var(--text-secondary)]'
            }`}
          >
            {isWordFlipped ? `Contoh: "${todayWordData.example}"` : 'Ketuk untuk contoh kalimat'}
          </span>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[9.5px] font-black shadow-2xs group-hover:scale-105 transition-transform shrink-0">
            <BookOpen className="w-2.5 h-2.5 stroke-[2.2]" />
            <span>{isWordFlipped ? 'Definisi' : 'Contoh'}</span>
          </div>
        </div>

        {/* Large Solid Mascot Overlay - Pinned to bottom-right edge of card, solid 100% */}
        <img
          src={MASCOTS.batikWordsmith}
          alt="Mascot Pujangga"
          className="absolute -bottom-2 -right-1 w-36 sm:w-44 h-40 sm:h-48 object-contain object-bottom pointer-events-none select-none z-0 filter drop-shadow-md group-hover:scale-105 transition-transform"
        />
      </div>
    </div>
  );
};

export default HomeView;
