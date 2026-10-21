import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
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
  ScanLine,
  Zap,
  ArrowLeft,
  Users,
  QrCode,
} from 'lucide-react';
import { useGameStore, type BattleConfig } from '../store/useGameStore';
import { getBattlePalette } from '../lib/battlePalette';
import { MASCOTS } from '../assets/maskots';
import { createDeepLink, shareOrCopy } from '../lib/deeplink';
import { copyToClipboard } from '../lib/clipboard';
import { getEloTier } from '../lib/eloSystem';

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
    openScanner,
    openQuickMatchModal,
    eloRating,
  } = useGameStore();

  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  // Ensure active room code exists as soon as lobby opens
  useEffect(() => {
    if (isBattleLobbyOpen && !activeRoomCode) {
      const nextCode = `TTS-${Math.floor(1000 + Math.random() * 9000)}`;
      setActiveRoomCode(nextCode);
    }
  }, [isBattleLobbyOpen, activeRoomCode, setActiveRoomCode]);

  // Generate QR code data URL whenever room code updates
  useEffect(() => {
    if (!isBattleLobbyOpen) return;
    const code = activeRoomCode || 'TTS-1V1';
    const inviteLink = createDeepLink({ room: code });
    QRCode.toDataURL(inviteLink, {
      width: 220,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''));
  }, [isBattleLobbyOpen, activeRoomCode]);

  if (!isBattleLobbyOpen) return null;

  const palette = getBattlePalette(theme);
  const roomCode = activeRoomCode || 'TTS-1V1';
  const partner = mabarPeers.find((p) => p.name !== user.name);
  const isOpponentReady = Boolean(partner);
  const isSpeedRace = battleConfig.mode === 'speed_race';

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
    const modeName = isSpeedRace ? 'Speed Race 60s' : 'Tug-of-War';
    const result = await shareOrCopy({
      title: `Tantangan Duel 1v1 ${modeName} - TTS Bareng`,
      text: `Ayo bertarung duel 1v1 ${modeName} di TTS Bareng! Masuk ke Kamar ${code}:`,
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
    const success = await copyToClipboard(inviteLink);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showGlobalToast('Tautan duel disalin!');
    } else {
      showGlobalToast(`Kode kamar: ${code}`);
    }
  };

  const handleStart = () => {
    handleEnsureRoom();
    startBattleMatch();
  };

  const handleSwitchMode = (mode: 'tug_of_war' | 'speed_race') => {
    setShowQr(false);
    if (mode === 'speed_race') {
      setBattleConfig({ mode: 'speed_race', durationSeconds: 60, wordCount: 'short' });
    } else {
      setBattleConfig({ mode: 'tug_of_war' });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] select-none overflow-hidden"
      >
        {/* Top Specular Sheen Line */}
        <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none z-20" />

        {/* Top Header Bar */}
        <header className="w-full shrink-0 flex flex-col gap-2.5 px-4 pt-3 pb-2.5 border-b border-black/5 dark:border-white/10 bg-[var(--bg-app)]/80 backdrop-blur-md z-20">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={closeBattleLobby}
              aria-label="Kembali"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full liquid-glass-card border border-black/10 dark:border-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] tactile-active"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
              <span className="text-[11px] font-bold">Kembali</span>
            </button>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/20 shadow-2xs">
              {isSpeedRace ? (
                <Zap className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <Swords className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
              <span className="text-[10px] font-black uppercase tracking-wider">
                {isSpeedRace ? 'SPEED RACE 60S' : 'TUG-OF-WAR 1V1'}
              </span>
            </div>

            <button
              type="button"
              onClick={closeBattleLobby}
              aria-label="Tutup"
              className="w-7 h-7 rounded-full flex items-center justify-center liquid-glass-card border border-black/10 dark:border-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] tactile-active"
            >
              <X className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Mode Switch Tabs */}
          <div className="w-full max-w-[420px] mx-auto grid grid-cols-2 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
            <button
              type="button"
              onClick={() => handleSwitchMode('tug_of_war')}
              className={`py-1.5 px-3 rounded-xl text-[11px] font-black cursor-pointer tactile-active flex items-center justify-center gap-1.5 transition-all ${
                !isSpeedRace
                  ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Swords className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Tug-of-War</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('speed_race')}
              className={`py-1.5 px-3 rounded-xl text-[11px] font-black cursor-pointer tactile-active flex items-center justify-center gap-1.5 transition-all ${
                isSpeedRace
                  ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Zap className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Speed Race 60s</span>
            </button>
          </div>
        </header>

        {/* Scrollable Center Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 max-w-[440px] mx-auto w-full no-scrollbar">
          {/* Header Title Banner */}
          <div className="flex flex-col items-center text-center pt-0.5">
            <h3 className="text-[17px] font-black tracking-tight leading-tight">
              {isSpeedRace ? 'Sprint Cepat 60 Detik' : 'Tantangan Rebutan Petak'}
            </h3>
            <p className="text-[10.5px] text-[var(--text-secondary)] max-w-[300px] leading-snug mt-1">
              {isSpeedRace
                ? 'Pecahkan seluruh petak kata secepat mungkin dalam 60 detik. Pemain tercepat menang telak!'
                : 'Kunci petak kata dengan warnamu. Pemain dengan poin petak terbanyak memenangkan ronde!'}
            </p>
          </div>

          {/* VS Card: Player 1 (Kamu) vs Player 2 (Lawan) */}
          <div className="w-full rounded-[22px] p-3.5 liquid-glass-card border border-black/5 dark:border-white/10 flex items-center justify-between gap-2 relative overflow-hidden">
            {/* Player 1 (Local) */}
            <div className="flex-1 flex flex-col items-center text-center gap-1 z-10">
              <div
                className="w-13 h-13 rounded-full overflow-hidden p-0.5 relative shadow-sm"
                style={{ background: palette.p1.grad }}
              >
                <img
                  src={user.avatar || MASCOTS.crosswordChampion}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full bg-white/20"
                />
              </div>
              <span className="text-[11px] font-black truncate max-w-[95px]">{user.name || 'Kamu'}</span>
              <span className="text-[7.5px] font-black px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-[var(--text-secondary)]">
                {eloRating} ELO • {getEloTier(eloRating).title}
              </span>
              <span
                className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs"
                style={{ background: palette.p1.grad, color: palette.p1.text }}
              >
                {palette.p1.name}
              </span>
            </div>

            {/* Central VS Badge */}
            <div className="flex flex-col items-center justify-center shrink-0 z-10 px-1">
              <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] shadow-sm">
                {isSpeedRace ? (
                  <Zap className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <Swords className="w-4 h-4 stroke-[2.5]" />
                )}
              </div>
              <span className="text-[8.5px] font-black text-[var(--text-secondary)] mt-1 tracking-wider">VS</span>
            </div>

            {/* Player 2 (Opponent) */}
            <div className="flex-1 flex flex-col items-center text-center gap-1 z-10">
              <div
                className="w-13 h-13 rounded-full overflow-hidden p-0.5 relative shadow-sm"
                style={{ background: isOpponentReady ? palette.p2.grad : 'rgba(128,128,128,0.25)' }}
              >
                {partner?.avatar ? (
                  <img
                    src={partner.avatar}
                    alt={partner.name}
                    className="w-full h-full object-cover rounded-full bg-white/20"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-[18px]">
                    <Sparkles className="w-5 h-5 text-[var(--text-secondary)] stroke-[1.8] animate-pulse" />
                  </div>
                )}
              </div>
              <span className="text-[11px] font-black truncate max-w-[95px]">
                {partner?.name || 'Menunggu Lawan'}
              </span>
              <span
                className="text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs"
                style={{
                  background: isOpponentReady ? palette.p2.grad : 'rgba(128,128,128,0.2)',
                  color: isOpponentReady ? palette.p2.text : 'var(--text-secondary)',
                }}
              >
                {isOpponentReady ? palette.p2.name : 'Belum Terhubung'}
              </span>
            </div>
          </div>

          {/* Preferences Bento Panel (Pengaturan Pertandingan) */}
          <div className="w-full rounded-[22px] p-3.5 liquid-glass-card border border-black/5 dark:border-white/10 flex flex-col gap-2.5 text-left">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-1.5">
              <div className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2]" />
                <span className="text-[11px] font-black">Pengaturan Pertandingan</span>
              </div>
              <span className="text-[8px] font-bold text-[var(--text-secondary)]">Sinkron Otomatis</span>
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

            {/* 3. Word Count / Board Size Picker */}
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

          {/* Room Code & Invitation Bento Card (Di Bawah Pengaturan Pertandingan) */}
          <div className="w-full rounded-[22px] p-3.5 liquid-glass-card border border-black/5 dark:border-white/10 flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-1.5 px-0.5">
              <div className="flex items-center gap-1.5 text-left">
                <Users className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2]" />
                <span className="text-[11px] font-black">Kode Kamar & Undangan</span>
              </div>
              <span className="text-[8.5px] font-bold text-[var(--text-secondary)]">
                {isOpponentReady ? 'Lawan Terhubung' : 'Siap Ditantang'}
              </span>
            </div>

            {/* Room Code Strip with Copy */}
            <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
              <div className="flex flex-col text-left pl-1">
                <span className="text-[7.5px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
                  KODE KAMAR DUEL
                </span>
                <span className="text-[14px] font-black tracking-wider text-[var(--accent-main)] font-mono">
                  {roomCode}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 cursor-pointer tactile-active flex items-center gap-1.5 text-[var(--text-primary)] border border-black/5 dark:border-white/10 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Tersalin' : 'Salin Tautan'}</span>
              </button>
            </div>

            {/* Action Buttons: Lihat QR, Pindai QR Lawan, Undang WA */}
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => setShowQr(!showQr)}
                className={`py-2 px-1.5 rounded-xl text-[10px] font-black cursor-pointer tactile-active flex items-center justify-center gap-1 transition-all border text-center ${
                  showQr
                    ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] border-[var(--accent-main)] shadow-xs'
                    : 'bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/10 text-[var(--text-primary)] hover:bg-black/10'
                }`}
              >
                <QrCode className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>{showQr ? 'Tutup QR' : 'Lihat QR'}</span>
              </button>

              <button
                type="button"
                onClick={openScanner}
                className="py-2 px-1.5 rounded-xl text-[10px] font-black bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/25 hover:opacity-95 cursor-pointer tactile-active flex items-center justify-center gap-1 transition-all shadow-2xs"
              >
                <ScanLine className="w-3.5 h-3.5 stroke-[2.4]" />
                <span>Pindai QR</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="py-2 px-1.5 rounded-xl text-[10px] font-black bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[var(--text-primary)] hover:bg-black/10 cursor-pointer tactile-active flex items-center justify-center gap-1 transition-all"
              >
                <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Undang WA</span>
              </button>
            </div>

            {/* Expandable Scannable QR Frame (Only when showQr is true) */}
            <AnimatePresence>
              {showQr && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden flex flex-col items-center gap-2 pt-1 border-t border-black/5 dark:border-white/10"
                >
                  <div className="p-2.5 rounded-2xl bg-white shadow-md border border-black/10 flex items-center justify-center mt-1">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="QR Code Kamar"
                        className="w-32 h-32 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 flex items-center justify-center text-[10px] text-zinc-400">
                        Membuat QR...
                      </div>
                    )}
                  </div>
                  <p className="text-[9.5px] text-[var(--text-secondary)] text-center max-w-[240px] leading-tight pb-0.5">
                    Arahkan kamera lawan ke QR ini untuk masuk duel secara instan
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Sticky Action Bar */}
        <footer className="w-full shrink-0 p-4 border-t border-black/5 dark:border-white/10 bg-[var(--bg-app)]/90 backdrop-blur-xl z-20">
          <div className="w-full max-w-[440px] mx-auto">
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-3.5 rounded-full text-white font-black text-[13px] tracking-wide shadow-lg cursor-pointer tactile-active flex items-center justify-center gap-2 hover:opacity-95 transition-transform"
              style={{ background: 'var(--hero-grad, var(--accent-grad))' }}
            >
              {isSpeedRace ? (
                <Zap className="w-4 h-4 stroke-[2.5]" />
              ) : (
                <Swords className="w-4 h-4 stroke-[2.5]" />
              )}
              <span>
                {isOpponentReady
                  ? 'Mulai Duel Sekarang!'
                  : isSpeedRace
                  ? 'Mulai Solo Sprint (Uji Papan)'
                  : 'Mulai Duel (Uji Coba Papan)'}
              </span>
            </button>

            {!isOpponentReady && (
              <button
                type="button"
                onClick={() => {
                  closeBattleLobby();
                  openQuickMatchModal(battleConfig.mode);
                }}
                className="w-full mt-2 py-2.5 rounded-full bg-black/5 dark:bg-white/10 text-[var(--text-primary)] font-bold text-[11.5px] cursor-pointer tactile-active flex items-center justify-center gap-1.5 hover:bg-black/10 dark:hover:bg-white/15 transition-all"
              >
                <Zap className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                <span>Cari Lawan Cepat Online (Acak)</span>
              </button>
            )}
          </div>
        </footer>
      </motion.div>
    </AnimatePresence>
  );
};

export default BattleLobbyModal;
