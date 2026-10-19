import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Swords,
  Clock,
  Share2,
  Copy,
  X,
  SlidersHorizontal,
  Check,
  Flame,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useGameStore, type BattleConfig } from '../store/useGameStore';
import { getBattlePalette } from '../lib/battlePalette';
import { MASCOTS } from '../assets/maskots';
import { createDeepLink, shareOrCopy } from '../lib/deeplink';

export const BattleLobbyModal: React.FC = () => {
  const {
    isBattleLobbyOpen,
    closeBattleLobby,
    battleConfig,
    setBattleConfig,
    startBattleMatch,
    theme,
    user,
    mabarPeers,
    activeRoomCode,
    setActiveRoomCode,
    showGlobalToast,
  } = useGameStore();

  const [copied, setCopied] = useState(false);

  if (!isBattleLobbyOpen) return null;

  const palette = getBattlePalette(theme);

  // If there is no active room, generate a room code so players can invite someone
  const roomCode = activeRoomCode || 'TTS-1V1';
  const partner = mabarPeers.find((p) => p.name !== user.name);
  const isOpponentReady = Boolean(partner);

  const handleEnsureRoom = () => {
    if (!activeRoomCode) {
      const nextCode = `TTS-${Math.floor(1000 + Math.random() * 9000)}`;
      setActiveRoomCode(nextCode);
      return nextCode;
    }
    return activeRoomCode;
  };

  const handleShare = async () => {
    const code = handleEnsureRoom();
    const inviteLink = createDeepLink({ room: code });
    const result = await shareOrCopy({
      title: 'Tantangan Duel 1v1 TTS Quest',
      text: `Ayo bertarung teka-teki silang 1v1 Tug-of-War di TTS Quest! Masuk ke Kamar ${code}:`,
      url: inviteLink,
    });
    if (result === 'shared') {
      showGlobalToast('Tautan duel dibagikan!');
    } else if (result === 'copied') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showGlobalToast('Tautan kamar duel disalin!');
    }
  };

  const handleCopyLink = async () => {
    const code = handleEnsureRoom();
    const inviteLink = createDeepLink({ room: code });
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showGlobalToast('Tautan duel disalin!');
    }
  };

  const handleStart = () => {
    handleEnsureRoom();
    startBattleMatch();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 select-none">
        {/* Dark Backdrop with blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeBattleLobby}
          className="absolute inset-0 bg-black/65 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-[360px] max-h-[92vh] overflow-y-auto rounded-[30px] p-4 text-center flex flex-col gap-3 shadow-2xl z-10 border border-white/20 bg-[var(--bg-card)] text-[var(--text-primary)]"
        >
          {/* Top Specular Sheen Line */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={closeBattleLobby}
            aria-label="Tutup"
            className="absolute top-3.5 right-3.5 w-7 h-7 rounded-full flex items-center justify-center liquid-glass-card border border-black/10 dark:border-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] tactile-active z-20"
          >
            <X className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Header Title with Mascot Badge */}
          <div className="flex flex-col items-center pt-1">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] text-[9px] font-black uppercase tracking-wider mb-1 border border-[var(--accent-main)]/20">
              <Swords className="w-3 h-3 stroke-[2.5]" />
              <span>LOBBY DUEL 1V1 • TUG-OF-WAR</span>
            </div>
            <h3 className="text-[17px] font-black tracking-tight leading-tight">
              Tantangan Rebutan Petak
            </h3>
            <p className="text-[10px] text-[var(--text-secondary)] max-w-[260px] leading-tight mt-0.5">
              Kunci petak kata dengan warnamu. Pemain dengan poin petak terbanyak memenangkan ronde!
            </p>
          </div>

          {/* VS Card: Player 1 (Kamu) vs Player 2 (Lawan) with Adaptive Contrast */}
          <div className="w-full rounded-[22px] p-3 liquid-glass-card border border-black/5 dark:border-white/10 flex items-center justify-between gap-2 relative overflow-hidden">
            {/* Player 1 (Local) */}
            <div className="flex-1 flex flex-col items-center text-center gap-1 z-10">
              <div className="w-12 h-12 rounded-full overflow-hidden p-0.5 relative" style={{ background: palette.p1.grad }}>
                <img
                  src={user.avatar || MASCOTS.crosswordChampion}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full bg-white/20"
                />
              </div>
              <span className="text-[11px] font-black truncate max-w-[90px]">{user.name || 'Kamu'}</span>
              <span
                className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs"
                style={{ background: palette.p1.grad, color: palette.p1.text }}
              >
                {palette.p1.name}
              </span>
            </div>

            {/* Central VS Badge */}
            <div className="flex flex-col items-center justify-center shrink-0 z-10 px-1">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] shadow-sm">
                <Swords className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-[8px] font-black text-[var(--text-secondary)] mt-1">VS</span>
            </div>

            {/* Player 2 (Opponent) */}
            <div className="flex-1 flex flex-col items-center text-center gap-1 z-10">
              <div
                className="w-12 h-12 rounded-full overflow-hidden p-0.5 relative"
                style={{ background: isOpponentReady ? palette.p2.grad : 'rgba(128,128,128,0.25)' }}
              >
                {partner?.avatar ? (
                  <img src={partner.avatar} alt={partner.name} className="w-full h-full object-cover rounded-full bg-white/20" />
                ) : (
                  <div className="w-full h-full rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[18px]">
                    <Sparkles className="w-5 h-5 text-[var(--text-secondary)] stroke-[1.8]" />
                  </div>
                )}
              </div>
              <span className="text-[11px] font-black truncate max-w-[90px]">
                {partner?.name || 'Menunggu Lawan'}
              </span>
              <span
                className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs"
                style={{
                  background: isOpponentReady ? palette.p2.grad : 'rgba(128,128,128,0.2)',
                  color: isOpponentReady ? palette.p2.text : 'var(--text-secondary)',
                }}
              >
                {palette.p2.name}
              </span>
            </div>
          </div>

          {/* Preferences Bento Panel */}
          <div className="w-full rounded-[22px] p-3 liquid-glass-card border border-black/5 dark:border-white/10 flex flex-col gap-2.5 text-left">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-1.5">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2]" />
                <span className="text-[11px] font-black">Pengaturan Pertandingan</span>
              </div>
              <span className="text-[8px] font-bold text-[var(--text-secondary)]">Sinkron Realtime</span>
            </div>

            {/* 1. Rounds Picker */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px] font-bold text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5 text-[var(--accent-main)]" />
                  <span>Jumlah Ronde</span>
                </span>
                <span className="font-black text-[var(--text-primary)]">
                  {battleConfig.rounds === 1 ? 'Sudden Death' : battleConfig.rounds === 3 ? 'Best of 3' : 'Marathon 5'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {([1, 3, 5] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setBattleConfig({ rounds: r })}
                    className={`py-1.5 rounded-xl text-[10px] font-black cursor-pointer tactile-active transition-all border text-center ${
                      battleConfig.rounds === r
                        ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] border-[var(--accent-main)] shadow-xs'
                        : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {r} Ronde
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Duration Picker */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px] font-bold text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5 text-[var(--accent-main)]" />
                  <span>Durasi per Ronde</span>
                </span>
                <span className="font-black text-[var(--text-primary)]">
                  {battleConfig.durationSeconds} Detik
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {([60, 90, 120] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setBattleConfig({ durationSeconds: d })}
                    className={`py-1.5 rounded-xl text-[10px] font-black cursor-pointer tactile-active transition-all border text-center ${
                      battleConfig.durationSeconds === d
                        ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] border-[var(--accent-main)] shadow-xs'
                        : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {d}s {d === 60 ? 'Sprint' : d === 90 ? 'Standar' : 'Santai'}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Word Count / Difficulty Picker */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-[9px] font-bold text-[var(--text-secondary)]">
                <span className="flex items-center gap-1">
                  <Layers className="w-2.5 h-2.5 text-[var(--accent-main)]" />
                  <span>Ukuran Papan / Kata</span>
                </span>
                <span className="font-black text-[var(--text-primary)] uppercase">
                  {battleConfig.wordCount === 'short' ? '4-6 Kata' : battleConfig.wordCount === 'medium' ? '6-8 Kata' : '8+ Kata'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {(['short', 'medium', 'long'] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setBattleConfig({ wordCount: w as BattleConfig['wordCount'] })}
                    className={`py-1.5 rounded-xl text-[10px] font-black cursor-pointer tactile-active transition-all border text-center ${
                      battleConfig.wordCount === w
                        ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] border-[var(--accent-main)] shadow-xs'
                        : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {w === 'short' ? 'Pendek' : w === 'medium' ? 'Sedang' : 'Panjang'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Room Code & Invite Strip */}
          <div className="w-full flex items-center justify-between p-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
            <div className="flex flex-col text-left pl-1">
              <span className="text-[7.5px] font-black uppercase tracking-wider text-[var(--text-secondary)]">KODE KAMAR DUEL</span>
              <span className="text-[12px] font-black tracking-wider text-[var(--accent-main)]">{roomCode}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1 rounded-xl text-[9.5px] font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 cursor-pointer tactile-active flex items-center gap-1 text-[var(--text-primary)]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="px-2.5 py-1 rounded-xl text-[9.5px] font-bold bg-[var(--accent-light)] text-[var(--accent-main)] hover:opacity-90 cursor-pointer tactile-active flex items-center gap-1"
              >
                <Share2 className="w-3 h-3" />
                <span>Undang</span>
              </button>
            </div>
          </div>

          {/* Start Battle CTA Button */}
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-3 rounded-full text-white font-black text-[13px] tracking-wide shadow-lg cursor-pointer tactile-active flex items-center justify-center gap-2 hover:opacity-95"
            style={{ background: 'var(--hero-grad, var(--accent-grad))' }}
          >
            <Swords className="w-4 h-4 stroke-[2.5]" />
            <span>{isOpponentReady ? 'Mulai Duel Sekarang!' : 'Mulai Duel (Uji Coba Papan)'}</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
