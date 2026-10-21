import React, { useState, useEffect } from 'react';
import {
  Users,
  Swords,
  Copy,
  Zap,
  Flame,
  Star,
  Play,
  ArrowRight,
  Radio,
  Sparkles,
  Trophy,
  Shield,
  Clock,
  RotateCcw,
  QrCode,
  Share2,
  X,
  ScanLine,
} from 'lucide-react';
import QRCode from 'qrcode';
import { useGameStore } from '../store/useGameStore';
import confetti from 'canvas-confetti';
import { MASCOTS } from '../assets/maskots';
import { createDeepLink, shareOrCopy } from '../lib/deeplink';
import { copyToClipboard } from '../lib/clipboard';
import { QrScannerModal } from '../components/QrScannerModal';
import { BattleLobbyModal } from '../components/BattleLobbyModal';
import { mabarRealtime } from '../lib/mabarRealtime';

export const SocialView: React.FC<{ isEmbedded?: boolean }> = ({ isEmbedded = false }) => {
  const {
    user,
    stars,
    streak,
    setCurrentTab,
    selectLevel,
    currentLevelIndex,
    activeRoomCode,
    setActiveRoomCode,
    showGlobalToast,
    mabarPeers,
    isQrModalOpen,
    openQrModal,
    closeQrModal,
    isScannerOpen,
    openScanner,
    closeScanner,
    openBattleLobby,
    openQuickMatchModal,
  } = useGameStore();

  const [activeSegment, setActiveSegment] = useState<'coop' | 'battle'>('coop');
  const [localRoomCode, setLocalRoomCode] = useState<string>(() => {
    return `TTS-${Math.floor(1000 + Math.random() * 9000)}`;
  });
  const roomCode = activeRoomCode || localRoomCode;
  const isRoomActive = Boolean(activeRoomCode);
  const [inputCode, setInputCode] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');

  const isCustomImageAvatar = Boolean(
    user.avatar && (
      user.avatar.startsWith('data:') ||
      user.avatar.startsWith('http') ||
      user.avatar.startsWith('/') ||
      user.avatar.includes('.webp') ||
      user.avatar.includes('.png')
    )
  );

  // Generate real scannable QR code on room code change using deep link URL
  useEffect(() => {
    const inviteLink = createDeepLink({ room: roomCode });
    QRCode.toDataURL(inviteLink, {
      width: 240,
      margin: 1.5,
      color: {
        dark: '#18181B',
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch(() => setQrCodeDataUrl(''));
  }, [roomCode]);

  const handleShareRoom = async () => {
    const inviteLink = createDeepLink({ room: roomCode });
    const result = await shareOrCopy({
      title: 'Mabar TTS Bareng',
      text: `Ayo main bareng teka-teki silang di TTS Bareng! Masuk ke Kamar ${roomCode}:`,
      url: inviteLink,
    });

    if (result === 'shared') {
      showGlobalToast('Tautan berhasil dibagikan!');
    } else if (result === 'copied') {
      showGlobalToast('Tautan kamar disalin!');
    }
  };

  const handleCopyLink = async () => {
    const inviteLink = createDeepLink({ room: roomCode });
    const success = await copyToClipboard(inviteLink);
    if (success) {
      showGlobalToast('Tautan kamar disalin!');
    } else {
      showGlobalToast(`Kode kamar: ${roomCode}`);
    }
  };

  const handleCreateRoom = () => {
    const nextCode = `TTS-${Math.floor(1000 + Math.random() * 9000)}`;
    setLocalRoomCode(nextCode);
    setActiveRoomCode(nextCode);
    confetti({
      particleCount: 35,
      spread: 50,
      origin: { y: 0.6 },
    });
    showGlobalToast(`Kamar ${nextCode} siap`);
  };

  const handleJoinRoom = (targetCode?: string) => {
    const raw = targetCode || inputCode;
    const clean = raw.trim().toUpperCase();
    if (!clean) {
      showGlobalToast('Masukkan kode kamar');
      return;
    }
    showGlobalToast(`Bergabung ke ${clean}...`);
    setLocalRoomCode(clean);
    setActiveRoomCode(clean);
    setInputCode('');
  };

  const handleScanSuccess = (scannedCode: string) => {
    handleJoinRoom(scannedCode);
  };

  const handleLaunchGame = () => {
    setActiveRoomCode(roomCode);
    selectLevel(currentLevelIndex);
    mabarRealtime.broadcastGameStart(currentLevelIndex);
    setCurrentTab('game');
  };

  return (
    <div
      className={
        isEmbedded
          ? 'w-full flex flex-col gap-3 relative'
          : 'w-full flex-1 flex flex-col gap-3 px-3.5 pt-[max(18px,env(safe-area-inset-top))] pb-[max(90px,calc(75px+env(safe-area-inset-bottom)))] select-none overflow-y-auto relative'
      }
    >
      {/* 1. Header: Typographic Title + Live Pill (Skipped when embedded in ArenaView) */}
      {!isEmbedded && (
        <header className="flex items-center justify-between px-0.5 relative z-10 shrink-0">
          <div>
            <span className="text-[9.5px] font-black uppercase tracking-wider text-[var(--accent-main)] block leading-none mb-0.5">
              MABAR & KOMUNITAS
            </span>
            <h2 className="text-[18px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
              Multiplayer Arena
            </h2>
          </div>

          {/* Live Streak & Stars Pill */}
          <div className="h-8.5 px-3 rounded-full flex items-center gap-2.5 liquid-glass-card border border-black/5 dark:border-white/10">
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
        </header>
      )}

      {/* 2. Mode Segmented Switcher (Liquid Glass Capsule) */}
      <div className="w-full h-10 p-1 rounded-full liquid-glass-card border border-black/5 dark:border-white/10 flex items-center z-10 relative shrink-0">
        <button
          type="button"
          onClick={() => setActiveSegment('coop')}
          className={`flex-1 h-full rounded-full text-[10.5px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer tactile-active ${
            activeSegment === 'coop'
              ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Users className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Mabar Co-op</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSegment('battle')}
          className={`flex-1 h-full rounded-full text-[10.5px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer tactile-active ${
            activeSegment === 'battle'
              ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Swords className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>1v1 Arena</span>
        </button>
      </div>

      {/* --- SEGMENT 1: MABAR CO-OP --- */}
      {activeSegment === 'coop' && (
        <>
          {/* Card 1: Hero Co-op Room Card (Themed Gradient + Big Mascot Friends) */}
          <div
            className="w-full shrink-0 rounded-[26px] p-4 relative z-10 overflow-hidden border border-white/10 dark:border-white/15 shadow-sm group flex flex-col gap-3"
            style={{
              background: 'var(--hero-grad, var(--accent-grad))',
              color: '#ffffff',
            }}
          >
            {/* Ambient Lighting & Top Specular Sheen */}
            <div className="absolute top-0 inset-x-0 h-px bg-white/30 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-black/25 blur-2xl pointer-events-none" />

            {/* Top Meta Row */}
            <div className="flex items-center justify-between mb-2 relative z-10">
              <span className="text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/25">
                LIVE CO-OP • 1 PAPAN REAL-TIME
              </span>
              <span className="text-[10px] font-bold text-white/90">
                2 Pemain
              </span>
            </div>

            {/* Middle Row: Content on Left */}
            <div className="relative z-10 max-w-[62%] sm:max-w-[65%] mb-2">
              <h3 className="text-[19px] sm:text-[20px] font-black text-white tracking-tight leading-tight mb-1">
                Main Bareng 1 Papan
              </h3>
              <p className="text-[10.5px] text-white/85 leading-tight">
                Pecahkan teka-teki bersama teman secara real-time dengan kursor tersinkronisasi.
              </p>
            </div>

            {/* Compact Unified Room Pill: Code + Share + Copy + QR + Refresh */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 w-fit max-w-[75%] mb-2 relative z-10">
              <div className="flex items-center gap-1.5 pl-2.5 pr-1">
                <Radio
                  className={`w-3 h-3 text-white shrink-0 ${
                    isRoomActive ? 'animate-pulse text-white' : 'opacity-85'
                  }`}
                />
                <span className="text-[11.5px] font-black text-white tracking-wider">
                  {roomCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleShareRoom}
                title="Bagikan Tautan Mabar"
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer tactile-active transition-colors shrink-0"
              >
                <Share2 className="w-3 h-3 stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                title="Salin Tautan"
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer tactile-active transition-colors shrink-0"
              >
                <Copy className="w-3 h-3 stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={openQrModal}
                title="Kode QR"
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer tactile-active transition-colors shrink-0"
              >
                <QrCode className="w-3 h-3 stroke-[2.2]" />
              </button>
              <button
                type="button"
                onClick={handleCreateRoom}
                title="Ganti Kode Baru"
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer tactile-active transition-colors shrink-0"
              >
                <RotateCcw className="w-3 h-3 stroke-[2.2]" />
              </button>
            </div>

            {/* Overlapping Player Avatars Pill */}
            <div className="flex items-center gap-2 mb-2.5 relative z-10">
              <div className="flex -space-x-1.5 overflow-hidden">
                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white/40 bg-white/25 overflow-hidden flex items-center justify-center text-[10px] font-black text-white shrink-0">
                  {isCustomImageAvatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user.name?.charAt(0) || 'P'}</span>
                  )}
                </div>
                {mabarPeers.length > 1 ? (
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white/40 bg-white/25 overflow-hidden flex items-center justify-center text-[10px] font-black text-white shrink-0">
                    {mabarPeers.find((p) => p.name !== user.name)?.avatar ? (
                      <img
                        src={mabarPeers.find((p) => p.name !== user.name)?.avatar}
                        alt="Teman Mabar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{mabarPeers.find((p) => p.name !== user.name)?.name?.charAt(0) || 'T'}</span>
                    )}
                  </div>
                ) : (
                  <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white/40 bg-white/15 flex items-center justify-center text-[10px] font-black text-white/80 shrink-0">
                    +
                  </div>
                )}
              </div>
              <span className="text-[9.5px] font-bold text-white/90">
                {mabarPeers.length >= 2 ? '2/2 Terhubung (Papan Siap Live!)' : '1/2 Menunggu Teman...'}
              </span>
            </div>

            {/* Primary Action Button (Left Aligned) */}
            <div className="flex items-center gap-2 justify-start relative z-10">
              <button
                type="button"
                onClick={handleLaunchGame}
                className="py-1.5 px-3.5 rounded-full bg-white text-[10.5px] font-black inline-flex items-center gap-1.5 cursor-pointer tactile-active shadow-sm group-hover:scale-105 transition-transform"
                style={{ color: 'var(--hero-btn-text, #111113)' }}
              >
                <Play className="w-3 h-3 fill-current stroke-[0]" />
                <span>Mulai Mabar</span>
              </button>

              <button
                type="button"
                onClick={handleShareRoom}
                className="py-1.5 px-3 rounded-full bg-white/20 hover:bg-white/30 text-white border border-white/25 text-[10.5px] font-black inline-flex items-center gap-1.5 cursor-pointer tactile-active transition-colors"
              >
                <Share2 className="w-3 h-3 stroke-[2.2]" />
                <span>Undang Teman</span>
              </button>
            </div>

            {/* Large Solid Mascot Overlay - Pinned to bottom-right edge of card, enlarged for prominence */}
            <img
              src={MASCOTS.friendsPlaying}
              alt="Mascot Mabar Friends"
              className="absolute -bottom-2 sm:-bottom-3 -right-1 sm:-right-2 w-48 sm:w-56 h-48 sm:h-56 object-contain object-bottom pointer-events-none select-none z-0 filter drop-shadow-xl group-hover:scale-105 transition-transform"
            />
          </div>

          {/* Card 2: Gabung Kamar Teman (Themed Bento Card) */}
          <div
            className="w-full shrink-0 rounded-[24px] p-3.5 sm:p-4 relative z-10 flex flex-col gap-2 border border-[var(--accent-main)]/20 shadow-xs overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
            }}
          >
            <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

            <div className="flex items-center justify-between px-0.5 relative z-10">
              <span className="text-[12px] font-black text-[var(--text-primary)]">
                Punya Kode Kamar Teman?
              </span>
              <button
                type="button"
                onClick={openScanner}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] text-[9.5px] font-black cursor-pointer tactile-active hover:opacity-90 transition-opacity"
              >
                <ScanLine className="w-3 h-3 stroke-[2.2]" />
                <span>Pindai QR</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pt-0.5 relative z-10">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                  placeholder="Misal: TTS-8821"
                  className="w-full h-9.5 pl-3.5 pr-10 rounded-xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15 text-[12.5px] font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-main)]"
                />
                <button
                  type="button"
                  onClick={openScanner}
                  title="Pindai QR Kode Kamar"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-[var(--accent-main)] hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer tactile-active transition-colors"
                >
                  <ScanLine className="w-4 h-4 stroke-[2.2]" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleJoinRoom()}
                className="h-9.5 px-4.5 rounded-xl bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[11px] font-black flex items-center gap-1.5 cursor-pointer tactile-active shrink-0 hover:opacity-95 shadow-2xs"
              >
                <span>Gabung</span>
                <ArrowRight className="w-3 h-3 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Card 3: Tantangan Kolaborasi Harian (Bento with Mascot Pals) */}
          <div
            className="w-full shrink-0 rounded-[24px] p-4 relative z-10 overflow-hidden border border-black/5 dark:border-white/10 shadow-xs group"
            style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
            }}
          >
            <div className="relative z-10 pr-6 sm:pr-10">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-6 h-6 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-[8.5px] font-black uppercase tracking-wider text-[var(--text-primary)]">
                  MISI KOLABORASI
                </span>
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)] ml-auto">
                  +30 ★
                </span>
              </div>
              <h4 className="text-[15px] font-black text-[var(--text-primary)] tracking-tight leading-tight mb-1 max-w-[75%]">
                Tantangan Dua Kepala
              </h4>
              <p className="text-[10px] text-[var(--text-secondary)] leading-snug max-w-[70%]">
                Selesaikan 1 bab penuh bersama teman untuk membuka bonus prestasi dan aksesoris profil.
              </p>
            </div>

            {/* Large Solid Mascot Overlay - Pinned to bottom-right edge of card, solid 100% */}
            <img
              src={MASCOTS.indonesianPuzzlePals}
              alt="Mascot Komunitas Pals"
              className="absolute -bottom-2 -right-1 w-32 sm:w-38 h-36 sm:h-42 object-contain object-bottom pointer-events-none select-none z-0 filter drop-shadow-md group-hover:scale-105 transition-transform"
            />
          </div>
        </>
      )}

      {/* --- SEGMENT 2: 1V1 ARENA BATTLE --- */}
      {activeSegment === 'battle' && (
        <>
          {/* Card 0: Cari Lawan Cepat (Quick Match Hero Card) */}
          <div
            className="w-full shrink-0 rounded-[26px] p-4 relative z-10 overflow-hidden border border-[var(--accent-main)]/30 shadow-md group flex flex-col gap-2.5"
            style={{
              background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 55%, var(--accent-light) 100%)',
            }}
          >
            {/* Top Meta */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-2xs">
                ONLINE MATCHMAKING
              </span>
              <div className="flex items-center gap-1.5 text-[10px] font-black text-[var(--accent-main)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Antrean Aktif</span>
              </div>
            </div>

            <div className="relative z-10 max-w-[70%]">
              <h3 className="text-[17px] sm:text-[18px] font-black text-[var(--text-primary)] tracking-tight leading-tight mb-1">
                Cari Lawan Cepat 1v1
              </h3>
              <p className="text-[10.5px] text-[var(--text-secondary)] leading-snug">
                Tanding instan tanpa perlu membagikan kode kamar. Temukan penantang setara dalam 5–8 detik!
              </p>
            </div>

            <div className="flex items-center gap-2 relative z-10 pt-0.5">
              <button
                type="button"
                onClick={() => openQuickMatchModal('speed_race')}
                className="py-2.5 px-4 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[11px] font-black inline-flex items-center gap-1.5 cursor-pointer tactile-active shadow-sm hover:opacity-95 transition-all"
              >
                <Zap className="w-3.5 h-3.5 stroke-[2.4]" />
                <span>Cari Lawan Sekarang</span>
              </button>
            </div>

            {/* Background Accent Mascot */}
            <img
              src={MASCOTS.crosswordChampion}
              alt="Quick Match 1v1"
              className="absolute -bottom-2 -right-1 w-32 sm:w-36 h-32 sm:h-36 object-contain object-bottom pointer-events-none select-none z-0 filter drop-shadow-md opacity-90 group-hover:scale-105 transition-transform"
            />
          </div>

          {/* Card 1: Tug of War (Hero Themed Gradient Card + Mascot Scholar) */}
          <div
            className="w-full shrink-0 rounded-[26px] p-4 relative z-10 overflow-hidden border border-white/10 dark:border-white/15 shadow-sm group flex flex-col gap-3"
            style={{
              background: 'var(--hero-grad, var(--accent-grad))',
              color: '#ffffff',
            }}
          >
            {/* Ambient Lighting & Top Specular Sheen */}
            <div className="absolute top-0 inset-x-0 h-px bg-white/30 pointer-events-none" />
            <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-black/25 blur-2xl pointer-events-none" />

            {/* Top Meta */}
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[8.5px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/25">
                1V1 REALTIME • 1 PAPAN
              </span>
              <span className="text-[10.5px] font-bold text-white/90">
                Sesi Rebutan
              </span>
            </div>

            {/* Content & Micro Battle Chip */}
            <div className="relative z-10 max-w-[62%] sm:max-w-[65%] mb-1">
              <h3 className="text-[19px] sm:text-[20px] font-black text-white tracking-tight leading-tight mb-1">
                Tug-of-War Petak
              </h3>
              <p className="text-[10.5px] text-white/85 leading-tight mb-2">
                Dua pemain bertarung di 1 papan yang sama. Pemain tercepat mengunci kotak dengan warnanya!
              </p>

              {/* Micro Gamified Battle Chip */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[9.5px] font-bold mb-1">
                <Shield className="w-3 h-3 stroke-[2.2]" />
                <span>+10 Poin / Huruf • Kunci Permanen</span>
              </div>
            </div>

            {/* Action Button (Left Aligned) */}
            <div className="flex items-center gap-2 justify-start relative z-10">
              <button
                type="button"
                onClick={() => openBattleLobby('tug_of_war')}
                className="py-1.5 px-3.5 rounded-full bg-white text-[10.5px] font-black inline-flex items-center gap-1.5 cursor-pointer tactile-active shadow-sm group-hover:scale-105 transition-transform"
                style={{ color: 'var(--hero-btn-text, #111113)' }}
              >
                <Swords className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Tantang Teman</span>
              </button>
            </div>

            {/* Large Solid Mascot Overlay - Plush Crossword Duel 1v1 */}
            <img
              src={MASCOTS.crosswordDuel}
              alt="Mascot Crossword Duel 1v1"
              className="absolute -bottom-2 -right-1 w-44 sm:w-52 h-40 sm:h-48 object-contain object-bottom pointer-events-none select-none z-0 filter drop-shadow-lg group-hover:scale-105 transition-transform"
            />
          </div>

          {/* Card 2: Speed Race 5x5 (Themed Bento) */}
          <div
            className="w-full shrink-0 rounded-[24px] p-4 relative z-10 border border-[var(--accent-main)]/20 shadow-xs flex flex-col gap-2.5 group overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/30 flex items-center justify-center text-[var(--accent-main)]">
                  <Zap className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-[14px] font-black text-[var(--text-primary)] leading-tight">
                    Speed Race (Kisi 5x5)
                  </h4>
                  <span className="text-[9px] text-[var(--text-secondary)]">
                    Papan terpisah dengan live progress lawan
                  </span>
                </div>
              </div>
              <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
                60s SPRINT
              </span>
            </div>

            <p className="text-[10px] text-[var(--text-secondary)] leading-snug">
              Papan 5x5 identik. Pemain pertama yang memecahkan 100% kisi kata langsung memenangkan ronde.
            </p>

            <button
              type="button"
              onClick={() => openBattleLobby('speed_race')}
              className="w-full py-2.5 rounded-2xl bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[11px] font-black flex items-center justify-center gap-1.5 cursor-pointer tactile-active shadow-2xs hover:opacity-95 transition-opacity"
            >
              <Zap className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Mulai Speed Race 60s</span>
            </button>
          </div>

          {/* Card 3: Format Pertandingan & Regulasi (3-Column Bento) */}
          <div
            className="w-full shrink-0 rounded-[24px] p-3.5 sm:p-4 relative z-10 flex flex-col gap-2.5 border border-[var(--accent-main)]/20 shadow-xs overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
            }}
          >
            <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2]" />
                <span className="text-[12px] font-black text-[var(--text-primary)]">
                  Regulasi & Hadiah 1v1
                </span>
              </div>
              <span className="text-[8.5px] text-[var(--accent-main)] font-bold">
                Fair Play System
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 relative z-10">
              <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col items-center text-center">
                <Clock className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2] mb-1" />
                <span className="text-[11px] font-black text-[var(--text-primary)]">
                  60-90s
                </span>
                <span className="text-[8px] text-[var(--text-secondary)] mt-0.5">
                  Sesi Cepat
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col items-center text-center">
                <Shield className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2] mb-1" />
                <span className="text-[11px] font-black text-[var(--text-primary)]">
                  +10 Poin
                </span>
                <span className="text-[8px] text-[var(--text-secondary)] mt-0.5">
                  Kunci Petak
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col items-center text-center">
                <Star className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2] mb-1" />
                <span className="text-[11px] font-black text-[var(--text-primary)]">
                  +25 ★
                </span>
                <span className="text-[8px] text-[var(--text-secondary)] mt-0.5">
                  Hadiah Menang
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --- FULL SCREEN TICKET MABAR MODAL (Foto Keempat Plan & Go) --- */}
      {isQrModalOpen && (
        <div
          style={{
            background: 'var(--bg-gradient, var(--bg-app))',
          }}
          className="fixed inset-0 z-50 flex flex-col justify-between items-center p-4 sm:p-6 overflow-y-auto select-none transition-colors duration-300"
        >
          {/* Top Brand Header & Close */}
          <div className="w-full max-w-[360px] flex items-center justify-between shrink-0 pt-1 px-1">
            {/* User Profile Pill with Theme Accent Gradient */}
            <div
              style={{ background: 'var(--accent-grad)' }}
              className="h-9 px-3.5 rounded-full text-white font-bold text-xs tracking-tight flex items-center gap-2 shadow-md border border-white/20 backdrop-blur-md"
            >
              <div className="w-5.5 h-5.5 rounded-full overflow-hidden bg-white/25 border border-white/30 shrink-0 flex items-center justify-center">
                <img
                  src={user.avatar || MASCOTS.crosswordChampion}
                  alt="Avatar Profil"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="truncate max-w-[130px] font-black text-white">{user.name || 'Jawara TTS'}</span>
            </div>

            {/* Close Button (X) with Theme Accent Gradient */}
            <button
              type="button"
              onClick={closeQrModal}
              style={{ background: 'var(--accent-grad)' }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-white cursor-pointer tactile-active shadow-md border border-white/20 hover:opacity-95 transition-all"
              title="Tutup"
            >
              <X className="w-4 h-4 stroke-[2.4] text-white" />
            </button>
          </div>

          {/* THE PHYSICAL TICKET SLEEVE (DIPANJANGIN LAGI) */}
          <div className="relative w-full max-w-[340px] rounded-[34px] shadow-2xl overflow-visible my-auto py-2">
            {/* Floating Avatar Sticker 1: Top Right (DIPERBESAR) */}
            <div className="absolute -top-4 -right-3 z-30 flex items-center gap-2 pointer-events-none">
              <div className="px-3 py-1 rounded-full bg-white text-slate-900 font-black text-[10.5px] shadow-lg border border-slate-200/90 tracking-tight">
                Ayo mabar!
              </div>
              <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-xl shrink-0 border-2 border-white">
                <img
                  src={MASCOTS.cheerfulBookBoy}
                  alt="Avatar Teman"
                  className="w-full h-full rounded-full object-cover bg-amber-50"
                />
              </div>
            </div>

            {/* Sleeve with Theme Accent Gradient & Overlay Texture */}
            <div
              style={{
                background: 'var(--hero-grad, var(--accent-grad))',
                color: '#ffffff',
              }}
              className="w-full ticket-sleeve-notch pt-16 pb-12 px-7 text-white flex flex-col items-center text-center relative overflow-hidden shadow-xs"
            >
              {/* Ambient Specular Sheen Glows */}
              <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-white/15 blur-2xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-black/20 blur-xl pointer-events-none" />
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

              {/* Crossword Blueprint Grid Watermark Texture Overlay */}
              <svg
                className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern id="ticket-grid" width="22" height="22" patternUnits="userSpaceOnUse">
                    <rect x="0" y="0" width="21" height="21" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2,2" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#ticket-grid)" />
              </svg>

              {/* Vintage Boarding Stamp Watermark on Top Right */}
              <div className="absolute top-4 right-5 border border-dashed border-white/25 rounded-lg px-2 py-0.5 rotate-[-6deg] pointer-events-none flex items-center gap-1 text-[8px] font-mono text-white/60 tracking-wider">
                <span>MABAR PASS</span>
              </div>

              <h2 className="text-[30px] font-black tracking-tight leading-[1.1] text-white drop-shadow-sm relative z-10">
                Kamu Diajak<br />Mabar TTS!
              </h2>

              <p className="text-[9.5px] font-extrabold uppercase tracking-widest text-white/85 mt-3.5 mb-1 relative z-10">
                SATU PAPAN • ADU KATA • TAKLUKKAN BERSAMA
              </p>

              <div className="absolute bottom-3 right-4 border border-dashed border-white/35 rounded-lg px-2.5 py-0.5 rotate-6 text-[8.5px] font-mono text-white/85 pointer-events-none bg-black/15 backdrop-blur-xs z-10">
                ROOM #{roomCode}
              </div>
            </div>

            {/* Perforated Tear Line (Zig-zag) */}
            <div
              style={{
                backgroundColor: 'var(--bg-app)',
              }}
              className="w-full h-4 perforation-edge"
            />

            {/* Floating Avatar Sticker 2: Bottom Left (DIPERBESAR & LEBIH KE BAWAH BIAR GAK MENGHALANGI TEKS) */}
            <div className="absolute bottom-1 -left-3.5 z-30 flex items-center gap-2 pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-white p-0.5 shadow-xl shrink-0 border-2 border-white">
                <img
                  src={MASCOTS.crosswordGirl}
                  alt="Avatar Pemain"
                  className="w-full h-full rounded-full object-cover bg-rose-50"
                />
              </div>
              <div className="px-3 py-1 rounded-full bg-white text-slate-900 font-black text-[10.5px] shadow-lg border border-slate-200/90 tracking-tight">
                Nungguin kamu nih
              </div>
            </div>

            {/* White Ticket Base / QR Stub Sliding Out (DIPANJANGIN LAGI) */}
            <div className="w-full bg-white rounded-b-[34px] p-7 pt-5 pb-12 flex flex-col items-center text-center shadow-lg border-t border-slate-100">
              {/* Real Scannable QR Code Frame */}
              <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200/80 shadow-xs flex flex-col items-center my-2">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code Kamar Mabar"
                    className="w-40 h-40 rounded-xl object-contain"
                  />
                ) : (
                  <div className="w-40 h-40 flex items-center justify-center text-xs text-slate-400">
                    Membuat QR...
                  </div>
                )}
                <span className="text-[14px] font-black tracking-widest text-slate-900 mt-2.5 font-mono">
                  PIN: {roomCode.split('').join(' ')}
                </span>
              </div>

              {/* Host Subtitle */}
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-3.5">
                MABAR DENGAN
              </div>
              <div className="text-[14px] font-black text-slate-900 mt-0.5 tracking-tight truncate max-w-[250px]">
                {user?.name ? `${user.name.toUpperCase()} & TEMAN-TEMAN` : 'JAWARA & TEMAN-TEMAN'}
              </div>
            </div>
          </div>

          {/* Bottom Instructions & Action Buttons (Warna Teks WA Putih Terang) */}
          <div className="w-full max-w-[340px] flex flex-col items-center shrink-0 pb-3">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
              PINDAI QR ATAU KLIK UNTUK BERGABUNG
            </span>

            <div className="w-full grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleShareRoom}
                style={{
                  background: 'var(--accent-grad)',
                }}
                className="py-3.5 rounded-2xl font-black text-xs text-white flex items-center justify-center gap-2 cursor-pointer tactile-active shadow-md hover:opacity-95 transition-all"
              >
                <Share2 className="w-4 h-4 stroke-[2.2] text-white" />
                <span className="text-white">Bagikan WA</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-3.5 rounded-2xl bg-white/90 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 border border-black/10 dark:border-white/15 text-[var(--text-primary)] font-black text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer tactile-active transition-all"
              >
                <Copy className="w-4 h-4 stroke-[2.2]" />
                <span>Salin Link</span>
              </button>
            </div>

            <span className="text-[9.5px] text-[var(--text-secondary)] font-bold tracking-wide uppercase mt-3">
              TTS Bareng - Mabar Teka Teki Silang
            </span>
          </div>
        </div>
      )}

      {/* --- 1V1 TUG-OF-WAR BATTLE LOBBY MODAL --- */}
      <BattleLobbyModal />

      {/* --- DAILY RUSH BRIEFING MODAL --- */}
      

      {/* --- QR CODE CAMERA & GALLERY SCANNER MODAL --- */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={closeScanner}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};

export default SocialView;
