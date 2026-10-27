import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  Star,
  ArrowRight,
  Home,
  Sparkles,
  Clock,
  BookOpen,
  Share2,
  Users,
  Flame,
  Loader2,
  X,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';
import { createDeepLink } from '../lib/deeplink';
import { mabarRealtime } from '../lib/mabarRealtime';

export const LevelCompleteModal: React.FC = () => {
  const {
    isLevelCompleteOpen,
    closeLevelComplete,
    restartLevel,
    goToNextLevel,
    setCurrentTab,
    level,
    levels,
    currentLevelIndex,
    levelRecords,
    openLexicon,
    openShareModal,
    activeRoomCode,
    mabarPeers,
    user,
    clueAuthors,
    nextLevelProposal,
    isWaitingForPartnerNextLevel,
    proposeNextLevel,
    acceptNextLevelProposal,
    cancelNextLevelProposal,
    gameMode,
  } = useGameStore();

  if (!isLevelCompleteOpen || gameMode === '1v1_battle') return null;

  const totalWords = (level.clues?.across?.length || 0) + (level.clues?.down?.length || 0);
  const starsEarned = totalWords * 10;
  const hasNextLevel = currentLevelIndex < levels.length - 1;

  const currentRecord = levelRecords[level.id];
  const timeSpent = currentRecord?.timeSpent || 35;
  const accuracy = currentRecord?.accuracy || 100;
  const rating = currentRecord?.rating || (accuracy >= 90 ? 3 : accuracy >= 75 ? 2 : 1);

  const isMabar = !!activeRoomCode;
  const partnerPeer = mabarPeers.find((p) => p.name !== user.name) || mabarPeers[0];
  const partnerName = partnerPeer?.name || 'Rekan Mabar';
  const partnerAvatar = partnerPeer?.avatar || MASCOTS.crosswordBoard;

  const rawLocalCount = Object.values(clueAuthors).filter((a) => a === 'local').length;
  const rawPartnerCount = Object.values(clueAuthors).filter((a) => a === 'partner').length;
  const hasAuthorRecords = rawLocalCount + rawPartnerCount > 0;
  const localSolvedCount = hasAuthorRecords ? rawLocalCount : Math.ceil(totalWords / 2);
  const partnerSolvedCount = hasAuthorRecords ? rawPartnerCount : Math.floor(totalWords / 2);

  let contributionBadge = 'Kerjasama Imbang';
  if (localSolvedCount > partnerSolvedCount) {
    contributionBadge = 'Kamu Kontributor Terbanyak';
  } else if (partnerSolvedCount > localSolvedCount) {
    contributionBadge = `${partnerName} Kontributor Terbanyak`;
  }

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Find featured vocabulary word (longest word in the chapter)
  const allClues = [...(level.clues?.across || []), ...(level.clues?.down || [])];
  const featuredClue = allClues.reduce(
    (max, curr) => (curr.answer.length > (max?.answer.length || 0) ? curr : max),
    allClues[0]
  );

  const handleShareLevel = () => {
    const levelUrl = createDeepLink({ level: currentLevelIndex + 1 });
    const formattedTime = formatDuration(timeSpent);
    openShareModal({
      badge: isMabar ? `MABAR BAB ${currentLevelIndex + 1} TUNTAS` : `BAB ${currentLevelIndex + 1} TUNTAS`,
      title: isMabar ? 'Duo Pemecah Kata!' : 'Gokil! Bab Ini Rata Kanan!',
      subtitle: isMabar
        ? `Kami berdua menuntaskan seluruh ${totalWords} kata teka-teki silang pada ${level.title} bersama!`
        : `Semua ${totalWords} kata teka-teki silang pada ${level.title} berhasil kamu tuntaskan dengan akurasi ${accuracy}%.`,
      mascot: MASCOTS.crosswordChampion,
      stats: [
        { label: 'WAKTU', value: formattedTime },
        { label: 'KATA', value: `${totalWords} KATA` },
        {
          label: isMabar ? 'DUO' : 'BINTANG',
          value: isMabar ? `${localSolvedCount} vs ${partnerSolvedCount}` : `${rating} ★`,
        },
      ],
      shareUrl: levelUrl,
      shareText: isMabar
        ? `Kami menyelesaikan Bab ${currentLevelIndex + 1} (${level.title}) bersama di TTS Bareng! Bisakah kamu dan rekanmu menuntaskannya?`
        : `Saya menyelesaikan Bab ${currentLevelIndex + 1} (${level.title}) dalam ${formattedTime} dengan akurasi ${accuracy}% di TTS Bareng! Bisakah kamu menuntaskannya?`,
    });
  };

  return (
    <AnimatePresence>
      {isLevelCompleteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          style={{
            background: 'var(--hero-grad, var(--accent-grad))',
            color: '#ffffff',
          }}
          className="fixed inset-0 z-50 flex flex-col items-center select-none overflow-y-auto no-scrollbar text-white"
        >
          {/* Top Specular Sheen Highlight & Ambient Glows */}
          <div className="fixed top-0 inset-x-0 h-px bg-white/40 pointer-events-none z-10" />
          <div className="fixed -top-14 -right-14 w-52 h-52 rounded-full bg-white/15 blur-3xl pointer-events-none" />
          <div className="fixed -bottom-14 -left-14 w-52 h-52 rounded-full bg-black/25 blur-3xl pointer-events-none" />

          {/* Top Dismiss Button Bar */}
          <div className="w-full max-w-[420px] flex justify-end px-4 pt-3 shrink-0 relative z-20">
            <button
              type="button"
              onClick={closeLevelComplete}
              aria-label="Tutup"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 border border-white/20 text-white tactile-active transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Centered Main Victory Content */}
          <div className="w-full max-w-[360px] flex-1 flex flex-col items-center justify-between p-4 pb-8 pt-1 text-center relative z-10 gap-3 my-auto">

            {/* Celebratory Mascot (Fierce Plush Crossword Champion) */}
            <div className="relative w-28 h-28 my-0.5 flex items-center justify-center shrink-0">
              <motion.img
                initial={{ y: 10, scale: 0.9 }}
                animate={{ y: [0, -6, 0], scale: 1 }}
                transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
                src={MASCOTS.crosswordChampion}
                alt="Selebrasi Kemenangan"
                className="w-full h-full object-contain filter drop-shadow-xl"
              />
            </div>

            {/* 3 Animated Performance Stars Rating */}
            <div className="flex items-center justify-center gap-2 my-0.5">
              {[1, 2, 3].map((starIdx) => (
                <motion.div
                  key={starIdx}
                  initial={{ scale: 0, rotate: -25 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15 + starIdx * 0.12, type: 'spring', damping: 14 }}
                >
                  <Star
                    className={`w-6 h-6 ${
                      starIdx <= rating
                        ? 'fill-white text-white drop-shadow-md'
                        : 'text-white/30 stroke-[1.5]'
                    }`}
                  />
                </motion.div>
              ))}
            </div>

            {/* Title & Badge */}
            <div>
              <span className="text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 border border-white/30 text-white backdrop-blur-sm">
                {isMabar ? `MABAR CO-OP • BAB ${currentLevelIndex + 1} TUNTAS` : `BAB ${currentLevelIndex + 1} TUNTAS`}
              </span>
              <h3 className="text-[19px] font-black tracking-tight text-white mt-1.5 leading-tight">
                {isMabar ? 'Duo Pemecah Kata!' : 'Luar Biasa, Jawara!'}
              </h3>
              <p className="text-[10.5px] text-white/85 mt-0.5 leading-snug px-1">
                {isMabar
                  ? `Seluruh ${totalWords} kata pada ${level.title} berhasil dituntaskan bersama.`
                  : `Seluruh ${totalWords} kata teka-teki silang pada ${level.title} berhasil dipecahkan.`}
              </p>
            </div>

            {/* Co-op Contribution Podium Card (2 Bento Columns) */}
            {isMabar && (
              <div className="w-full flex flex-col gap-2 p-2.5 rounded-2xl border border-white/20 bg-black/20 dark:bg-black/30 backdrop-blur-md my-0.5">
                <div className="flex items-center justify-between text-[8.5px] font-black uppercase tracking-wider text-white/85 border-b border-white/10 pb-1.5 px-0.5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 stroke-[2.2]" />
                    <span>Podium Kontribusi</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/15 text-[8px] font-bold text-white border border-white/20">
                    {contributionBadge}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Local Player */}
                  <div className="flex flex-col items-center p-2 rounded-xl bg-white/10 border border-white/15 relative overflow-hidden">
                    {localSolvedCount >= partnerSolvedCount && localSolvedCount > 0 && (
                      <div className="absolute top-1.5 right-1.5">
                        <Flame className="w-3 h-3 text-white fill-white/80" />
                      </div>
                    )}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 border border-white/30 shrink-0 mb-1 flex items-center justify-center">
                      <img
                        src={user.avatar || MASCOTS.crosswordChampion}
                        alt="Kamu"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white/90 truncate max-w-[90px]">Kamu</span>
                    <span className="text-[13px] font-black text-white mt-0.5">{localSolvedCount} Kata</span>
                  </div>

                  {/* Remote Partner */}
                  <div className="flex flex-col items-center p-2 rounded-xl bg-white/10 border border-white/15 relative overflow-hidden">
                    {partnerSolvedCount >= localSolvedCount && partnerSolvedCount > 0 && (
                      <div className="absolute top-1.5 right-1.5">
                        <Flame className="w-3 h-3 text-white fill-white/80" />
                      </div>
                    )}
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white/20 border border-white/30 shrink-0 mb-1 flex items-center justify-center">
                      <img
                        src={partnerAvatar}
                        alt={partnerName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-white/90 truncate max-w-[90px]">{partnerName}</span>
                    <span className="text-[13px] font-black text-white mt-0.5">{partnerSolvedCount} Kata</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bento Metrik Kemenangan Riil (3 Kolom: Waktu, Akurasi, Bintang) */}
            <div className="w-full grid grid-cols-3 gap-1.5 p-2 rounded-2xl border border-white/20 bg-black/15 dark:bg-black/25 backdrop-blur-md my-0.5">
              <div className="flex flex-col items-center">
                <span className="text-[8.5px] text-white/75 font-medium">{isMabar ? 'Durasi Duo' : 'Waktu'}</span>
                <div className="flex items-center gap-1 text-white font-black text-[13px] mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-white" />
                  <span>{formatDuration(timeSpent)}</span>
                </div>
              </div>

              <div className="flex flex-col items-center border-x border-white/15">
                <span className="text-[8.5px] text-white/75 font-medium">Akurasi</span>
                <div className="flex items-center gap-1 text-white font-black text-[13px] mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                  <span>{accuracy}%</span>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-[8.5px] text-white/75 font-medium">Bintang</span>
                <div className="flex items-center gap-0.5 text-white font-black text-[13px] mt-0.5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>+{starsEarned}</span>
                </div>
              </div>
            </div>

            {/* Vocabulary Payoff Card (Wawasan Kosakata Bab Ini) */}
            {featuredClue && (
              <div className="w-full p-2.5 rounded-2xl border border-white/20 bg-black/15 dark:bg-black/25 backdrop-blur-md text-left flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-white">
                    <BookOpen className="w-3 h-3 stroke-[2.2]" />
                    <span className="text-[8px] font-black uppercase tracking-wider text-white/90">
                      Wawasan Kosakata Bab
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      closeLevelComplete();
                      openLexicon();
                    }}
                    className="text-[8.5px] text-white font-bold hover:underline cursor-pointer tactile-active flex items-center gap-0.5 opacity-90 hover:opacity-100"
                  >
                    <span>Buku Kosakata</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[12.5px] font-black tracking-wider uppercase text-white">
                    {featuredClue.answer}
                  </span>
                </div>
                <p className="text-[10px] text-white/80 leading-snug line-clamp-2">
                  {featuredClue.text}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-1.5 pt-0.5">
              {hasNextLevel ? (
                isMabar ? (
                  isWaitingForPartnerNextLevel ? (
                    <div className="w-full flex flex-col gap-1">
                      <button
                        type="button"
                        disabled
                        className="w-full py-2.5 px-4 rounded-full font-black text-[12px] bg-white/90 shadow-md flex items-center justify-center gap-2 opacity-95"
                        style={{ color: 'var(--hero-btn-text, #111113)' }}
                      >
                        <Loader2 className="w-4 h-4 stroke-[2.5] animate-spin text-[var(--accent-main)]" />
                        <span>Menunggu {partnerName} Siap...</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => cancelNextLevelProposal(true)}
                        className="text-[9.5px] text-white/70 hover:text-white underline cursor-pointer py-0.5"
                      >
                        Batalkan Ajakan
                      </button>
                    </div>
                  ) : nextLevelProposal ? (
                    <div className="w-full flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={acceptNextLevelProposal}
                        className="w-full py-2.5 px-4 rounded-full font-black text-[12px] bg-white cursor-pointer tactile-active shadow-md transition-transform flex items-center justify-center gap-2 animate-pulse"
                        style={{ color: 'var(--hero-btn-text, #111113)' }}
                      >
                        <Sparkles className="w-4 h-4 stroke-[2.5] text-[var(--accent-main)]" />
                        <span>Ikut {nextLevelProposal.senderName} ke Bab {nextLevelProposal.targetLevelIndex + 1}!</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => cancelNextLevelProposal(true)}
                        className="text-[9.5px] text-white/70 hover:text-white underline cursor-pointer py-0.5"
                      >
                        Tolak Ajakan
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => proposeNextLevel((currentLevelIndex + 1) % levels.length)}
                      className="w-full py-2.5 px-4 rounded-full font-black text-[12px] bg-white cursor-pointer tactile-active shadow-md transition-transform"
                      style={{ color: 'var(--hero-btn-text, #111113)' }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <span>Lanjut Bab Berikutnya Bersama</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </span>
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      goToNextLevel();
                      closeLevelComplete();
                    }}
                    className="w-full py-2.5 px-4 rounded-full font-black text-[12px] bg-white cursor-pointer tactile-active shadow-md transition-transform"
                    style={{ color: 'var(--hero-btn-text, #111113)' }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>Lanjut Bab Berikutnya</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </span>
                  </button>
                )
              ) : null}

              <button
                type="button"
                onClick={handleShareLevel}
                className="w-full py-2 rounded-full border border-white/30 font-bold text-[11px] text-white flex items-center justify-center gap-1.5 cursor-pointer tactile-active bg-white/20 hover:bg-white/30 backdrop-blur-sm"
              >
                <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>{isMabar ? 'Bagikan Kemenangan Duo' : 'Tantang Teman di Bab Ini'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (isMabar) {
                    mabarRealtime.broadcastLevelChange(currentLevelIndex);
                  }
                  restartLevel();
                  closeLevelComplete();
                }}
                className="w-full py-2 rounded-full border border-white/25 font-bold text-[11px] text-white flex items-center justify-center gap-1.5 cursor-pointer tactile-active bg-white/15 hover:bg-white/25 backdrop-blur-sm"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>{isMabar ? 'Main Ulang Bab Bersama' : 'Main Ulang Bab Ini'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeLevelComplete();
                  setCurrentTab('arena');
                }}
                className="w-full py-1.5 rounded-full text-[10.5px] font-semibold text-white/80 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Kembali ke Arena</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelCompleteModal;
