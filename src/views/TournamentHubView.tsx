import React, { useState } from 'react';
import {
  Trophy,
  Swords,
  Plus,
  QrCode,
  ArrowRight,
  Medal,
  Clock,
  Shield,
  Sparkles,
  Users,
  Copy,
  Share2,
  Play,
  LogOut,
  CheckCircle2,
  Crown,
  ScanLine,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { type CommunityTournamentMatch } from '../lib/tournament';
import { TournamentQrModal } from '../components/TournamentQrModal';
import { QrScannerModal } from '../components/QrScannerModal';
import { extractTournamentCodeFromText, extractRoomCodeFromText, createTournamentDeepLink } from '../lib/deeplink';
import { MASCOTS } from '../assets/maskots';

export const TournamentHubView: React.FC = () => {
  const {
    trophies,
    user,
    showGlobalToast,
    activeTournament,
    publicTournaments,
    openCreateTournament,
    openJoinTournament,
    joinTournament,
    leaveTournament,
    startTournamentLobby,
    startCommunityMatch,
  } = useGameStore();

  const [copiedCode, setCopiedCode] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const isHost = activeTournament?.hostId === (user.id || 'player_local');

  const handleCopyCode = () => {
    if (!activeTournament) return;
    navigator.clipboard.writeText(activeTournament.code);
    setCopiedCode(true);
    showGlobalToast(`Kode kamar ${activeTournament.code} berhasil disalin!`, 2000);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!activeTournament) return;
    const inviteLink = createTournamentDeepLink(activeTournament.code);
    const text = encodeURIComponent(
      `🏆 Ayo tanding di Turnamen TTS Bareng!\n\nKamar: *${activeTournament.name}*\nKode: *${activeTournament.code}*\nFormat: *${
        activeTournament.maxPlayers
      } Pemain (Sistem Gugur)*\n\nGabung sekarang di:\n${inviteLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleJoinPublicItem = (code: string) => {
    const res = joinTournament(code);
    showGlobalToast(res.message, 2500);
  };

  const handleScanSuccess = (scannedText: string) => {
    setIsScannerOpen(false);
    const resolvedCode =
      extractTournamentCodeFromText(scannedText) ||
      extractRoomCodeFromText(scannedText) ||
      scannedText.trim().toUpperCase();

    if (resolvedCode) {
      const res = joinTournament(resolvedCode);
      showGlobalToast(res.message, 2500);
    } else {
      showGlobalToast('Format QR turnamen tidak dikenali', 2500);
    }
  };

  // =========================================================================
  // VIEW 1: ACTIVE TOURNAMENT - LOBBY STATE
  // =========================================================================
  if (activeTournament && activeTournament.status === 'lobby') {
    const emptySlotsCount = Math.max(0, activeTournament.maxPlayers - activeTournament.players.length);

    return (
      <div className="w-full flex flex-col gap-3.5 relative z-10 pb-8">
        {/* Lobby Header Card */}
        <div
          className="w-full rounded-[26px] p-4 relative z-10 overflow-hidden border border-white/10 dark:border-white/15 shadow-sm"
          style={{
            background: 'var(--hero-grad, var(--accent-grad))',
            color: '#ffffff',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/30 pointer-events-none" />
          <div className="flex items-center justify-between mb-2 relative z-10">
            <span className="text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/25 inline-flex items-center gap-1.5">
              <Trophy className="w-3 h-3 stroke-[2.2]" />
              <span>LOBI TURNAMEN RESMI</span>
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-black/25 text-white">
              {activeTournament.players.length}/{activeTournament.maxPlayers} PEMAIN
            </span>
          </div>

          <h3 className="text-[20px] font-black text-white tracking-tight leading-tight mb-0.5">
            {activeTournament.name}
          </h3>
          <p className="text-[11px] text-white/85 leading-snug">
            Format: {activeTournament.maxPlayers} Pemain (Sistem Gugur) • Durasi: {activeTournament.roundDurationSeconds}s/babak
          </p>

          {/* Room Code Showcase with Actions */}
          <div className="mt-3.5 p-3 rounded-2xl bg-black/25 backdrop-blur-md border border-white/15 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span className="text-[8px] font-bold text-white/70 uppercase tracking-wider">
                KODE KAMAR TURNAMEN
              </span>
              <span className="text-[18px] font-black tracking-widest text-white leading-none mt-0.5 font-mono">
                {activeTournament.code}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyCode}
                className="py-1.5 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white text-[10.5px] font-bold flex items-center gap-1 cursor-pointer tactile-active transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'Disalin' : 'Salin'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-1.5 px-3 rounded-xl bg-white text-[10.5px] font-bold flex items-center gap-1 cursor-pointer tactile-active shadow-xs hover:opacity-95 transition-opacity"
                style={{ color: 'var(--hero-btn-text, #111113)' }}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Ajak WA</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white cursor-pointer tactile-active transition-colors"
                title="Lihat Tiket QR Turnamen"
              >
                <QrCode className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Players List in Lobby */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2]" />
              <span>PESERTA TERGABUNG ({activeTournament.players.length}/{activeTournament.maxPlayers})</span>
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] font-semibold">
              {activeTournament.players.length >= 2 ? 'Siap Dimulai' : 'Menunggu Minimal 2 Pemain'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {activeTournament.players.map((p, idx) => (
              <div
                key={p.id || idx}
                className="p-3 rounded-2xl liquid-glass-card border border-[var(--border-card)] flex items-center gap-2.5 shadow-xs"
              >
                <div className="w-9 h-9 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/30 flex items-center justify-center overflow-hidden shrink-0">
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[12px] font-black text-[var(--accent-main)]">
                      {p.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[12px] font-black text-[var(--text-primary)] truncate">
                      {p.name}
                    </span>
                    {p.isHost && (
                      <Crown className="w-3 h-3 text-[var(--accent-main)] shrink-0 fill-current" />
                    )}
                  </div>
                  <span className="text-[9px] font-bold text-[var(--accent-main)]">
                    {p.isHost ? 'Host Turnamen' : 'Peserta Siap'}
                  </span>
                </div>
              </div>
            ))}

            {Array.from({ length: emptySlotsCount }).map((_, idx) => (
              <div
                key={`empty_${idx}`}
                onClick={handleShareWhatsApp}
                className="p-3 rounded-2xl border border-dashed border-[var(--border-card)] bg-black/5 dark:bg-white/5 flex items-center gap-2.5 cursor-pointer tactile-active hover:border-[var(--accent-main)]/40 transition-colors"
              >
                <div className="w-9 h-9 rounded-full border border-dashed border-[var(--text-secondary)]/30 flex items-center justify-center text-[var(--text-secondary)] shrink-0">
                  <Plus className="w-4 h-4" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[11.5px] font-bold text-[var(--text-secondary)] truncate">
                    Slot {activeTournament.players.length + idx + 1}
                  </span>
                  <span className="text-[9px] text-[var(--accent-main)] font-bold">
                    + Undangan Teman
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lobby Action Controls */}
        <div className="flex flex-col gap-2 mt-1">
          {isHost ? (
            <button
              type="button"
              onClick={startTournamentLobby}
              disabled={activeTournament.players.length < 2}
              className={`w-full py-3 rounded-2xl text-[13px] font-black flex items-center justify-center gap-2 shadow-md cursor-pointer tactile-active transition-all ${
                activeTournament.players.length >= 2
                  ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] hover:opacity-95'
                  : 'bg-black/10 dark:bg-white/10 text-[var(--text-secondary)] opacity-50 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {activeTournament.players.length >= 2
                  ? 'Mulai Turnamen (Undi Bagan)'
                  : 'Menunggu Minimal 2 Pemain'}
              </span>
            </button>
          ) : (
            <div className="p-3 rounded-2xl liquid-glass-card border border-[var(--border-card)] text-center text-[11px] font-bold text-[var(--text-secondary)]">
              ⏳ Menunggu Host ({activeTournament.hostName}) memulai turnamen...
            </div>
          )}

          <button
            type="button"
            onClick={leaveTournament}
            className="w-full py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)] text-[var(--text-secondary)] hover:text-red-500 hover:border-red-500/30 text-[11.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer tactile-active transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isHost ? 'Batalkan Turnamen' : 'Tinggalkan Kamar'}</span>
          </button>
        </div>

        {/* Dedicated VIP Ticket Sleeve QR Modal */}
        <TournamentQrModal
          isOpen={showQrModal}
          onClose={() => setShowQrModal(false)}
          tournament={activeTournament}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE TOURNAMENT - IN PROGRESS (INTERACTIVE BRACKET)
  // =========================================================================
  if (activeTournament && activeTournament.status === 'in_progress') {
    const myId = user.id || 'player_local';

    return (
      <div className="w-full flex flex-col gap-3.5 relative z-10 pb-8">
        {/* Header Bagan */}
        <div
          className="w-full rounded-[26px] p-4 relative z-10 overflow-hidden border border-white/10 dark:border-white/15 shadow-sm"
          style={{
            background: 'var(--hero-grad, var(--accent-grad))',
            color: '#ffffff',
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/25 inline-flex items-center gap-1.5">
              <Swords className="w-3 h-3 stroke-[2.2]" />
              <span>BAGAN SISTEM GUGUR</span>
            </span>
            <span className="text-[10px] font-bold text-white/90">
              {activeTournament.name}
            </span>
          </div>

          <h3 className="text-[19px] font-black text-white tracking-tight leading-tight">
            Babak Eliminasi Sedang Berlangsung
          </h3>
          <p className="text-[11px] text-white/85 leading-snug">
            Kalahkan lawanmu untuk melaju ke babak berikutnya hingga Grand Final!
          </p>
        </div>

        {/* Bagan Pertandingan Visual */}
        <div className="flex flex-col gap-3">
          {activeTournament.matches.map((match: CommunityTournamentMatch) => {
            const isMyMatch = Boolean(match.player1?.id === myId || match.player2?.id === myId);
            const isCompleted = match.status === 'completed';
            const canPlay = isMyMatch && !isCompleted;

            return (
              <div
                key={match.id}
                className={`w-full p-3.5 rounded-[22px] liquid-glass-card border shadow-xs transition-all ${
                  canPlay
                    ? 'border-[var(--accent-main)] shadow-md ring-1 ring-[var(--accent-main)]/30'
                    : 'border-[var(--border-card)]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-main)]">
                    {match.roundName}
                  </span>
                  <span className="text-[9.5px] font-bold text-[var(--text-secondary)]">
                    {isCompleted ? 'Selesai' : `${match.durationSeconds} Detik`}
                  </span>
                </div>

                {/* Match Contestants */}
                <div className="grid grid-cols-2 gap-2 items-center">
                  {/* Player 1 */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      match.winner?.id === match.player1?.id
                        ? 'bg-[var(--accent-light)] border-[var(--accent-main)] font-black text-[var(--accent-main)]'
                        : 'bg-black/5 dark:bg-white/5 border-[var(--border-card)]'
                    }`}
                  >
                    <span className="text-[11.5px] font-bold text-[var(--text-primary)] truncate">
                      {match.player1?.name || 'TBD'}
                    </span>
                    {isCompleted && (
                      <span className="text-[11px] font-black ml-1">
                        {match.player1Score}
                      </span>
                    )}
                  </div>

                  {/* Player 2 */}
                  <div
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      match.winner?.id === match.player2?.id
                        ? 'bg-[var(--accent-light)] border-[var(--accent-main)] font-black text-[var(--accent-main)]'
                        : 'bg-black/5 dark:bg-white/5 border-[var(--border-card)]'
                    }`}
                  >
                    <span className="text-[11.5px] font-bold text-[var(--text-primary)] truncate">
                      {match.player2?.name || 'TBD'}
                    </span>
                    {isCompleted && (
                      <span className="text-[11px] font-black ml-1">
                        {match.player2Score}
                      </span>
                    )}
                  </div>
                </div>

                {/* If this is the user's active match, show play button */}
                {canPlay && (
                  <button
                    type="button"
                    onClick={() => startCommunityMatch(match.id)}
                    className="w-full mt-2.5 py-2.5 rounded-xl bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[12px] font-black flex items-center justify-center gap-1.5 cursor-pointer tactile-active shadow-md hover:opacity-95 transition-opacity"
                  >
                    <Swords className="w-3.5 h-3.5" />
                    <span>Tanding Sekarang ({match.roundName})</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.4]" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Exit Button */}
        <button
          type="button"
          onClick={leaveTournament}
          className="w-full py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-[var(--border-card)] text-[var(--text-secondary)] hover:text-red-500 text-[11.5px] font-bold flex items-center justify-center gap-1.5 cursor-pointer tactile-active transition-colors mt-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Tinggalkan Turnamen</span>
        </button>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: ACTIVE TOURNAMENT - COMPLETED STATE (PODIUM)
  // =========================================================================
  if (activeTournament && activeTournament.status === 'completed') {
    return (
      <div className="w-full flex flex-col items-center gap-4 relative z-10 pb-8 text-center">
        {/* Victory Card */}
        <div
          className="w-full rounded-[28px] p-5 relative z-10 overflow-hidden border border-white/15 shadow-2xl flex flex-col items-center gap-3"
          style={{
            background: 'var(--hero-grad, var(--accent-grad))',
            color: '#ffffff',
          }}
        >
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/30 shadow-lg">
            <Trophy className="w-8 h-8 fill-current stroke-none" />
          </div>

          <div>
            <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md">
              TURNAMEN SELESAI
            </span>
            <h3 className="text-[22px] font-black text-white tracking-tight leading-tight mt-1">
              Podium Juara {activeTournament.name}
            </h3>
          </div>

          {/* Podium Winner Cards */}
          <div className="w-full grid grid-cols-2 gap-2 mt-2">
            {/* 1st Place */}
            <div className="p-3 rounded-2xl bg-white/15 border border-white/25 flex flex-col items-center text-center">
              <span className="text-[18px] mb-1">🥇</span>
              <span className="text-[9px] font-bold text-white/80 uppercase">JUARA 1</span>
              <span className="text-[13px] font-black text-white truncate max-w-full">
                {activeTournament.champion?.name || 'Pemenang'}
              </span>
              <span className="text-[10px] font-bold text-white/90 mt-1">
                +200 ★ & Trofi Emas
              </span>
            </div>

            {/* 2nd Place */}
            <div className="p-3 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center text-center">
              <span className="text-[18px] mb-1">🥈</span>
              <span className="text-[9px] font-bold text-white/80 uppercase">RUNNER UP</span>
              <span className="text-[13px] font-black text-white truncate max-w-full">
                {activeTournament.runnerUp?.name || 'Runner Up'}
              </span>
              <span className="text-[10px] font-bold text-white/90 mt-1">
                +100 ★ & Trofi Perak
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={leaveTournament}
            className="w-full py-3 rounded-2xl bg-white text-[12.5px] font-black flex items-center justify-center gap-1.5 cursor-pointer tactile-active shadow-md hover:opacity-95 transition-opacity mt-2"
            style={{ color: 'var(--hero-btn-text, #111113)' }}
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.4]" />
            <span>Klaim Hadiah & Selesai</span>
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 4: DEFAULT TOURNAMENT HUB (NO ACTIVE TOURNAMENT)
  // =========================================================================
  return (
    <>
      <div className="w-full flex flex-col gap-3.5 relative z-10 pb-6">
        {/* 1. Header Trophy Showcase (Themed Hero Stage Card) */}
        <div
          className="w-full rounded-[28px] p-4 sm:p-5 relative z-10 overflow-hidden border border-white/15 dark:border-white/20 shadow-xl"
          style={{
            background: 'var(--hero-grad, var(--accent-grad))',
            color: '#ffffff',
          }}
        >
          {/* Ambient Top Glow & Specular Sheen */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-44 rounded-full bg-white/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/25 via-black/10 to-transparent pointer-events-none" />

          {/* Header Row: Badge & Status Pill (Nama user di pojok kanan dihapus sesuai permintaan) */}
          <div className="flex items-center justify-between relative z-10 mb-1">
            <span className="text-[8.5px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/25 inline-flex items-center gap-1.5 shadow-xs">
              <Trophy className="w-3 h-3 stroke-[2.4]" />
              <span>ARENA KOMPETISI RESMI</span>
            </span>

            <span className="text-[8.5px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/30 text-white/90 backdrop-blur-md border border-white/15 inline-flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>SISTEM GUGUR</span>
            </span>
          </div>

          {/* 3D Mascot Squad Overlay - 100% Solid & Vivid, Non-Transparent */}
          <div className="relative w-full flex items-center justify-center -my-1 py-1">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-52 h-28 rounded-full bg-white/15 blur-2xl" />
            </div>
            <img
              src={MASCOTS.tournamentChampions}
              alt="TTS Crossword Champions Tournament"
              className="w-full max-w-[320px] sm:max-w-[360px] h-auto object-contain relative z-10 select-none pointer-events-none drop-shadow-[0_16px_28px_rgba(0,0,0,0.4)] transition-transform hover:scale-[1.02] duration-300"
              loading="eager"
            />
          </div>

          {/* Title & Description Section */}
          <div className="relative z-10 text-center sm:text-left mt-1 mb-3">
            <h3 className="text-[21px] sm:text-[23px] font-black text-white tracking-tight leading-tight">
              Turnamen Komunitas
            </h3>
            <p className="text-[11.5px] text-white/85 leading-snug mt-1 max-w-[95%] mx-auto sm:mx-0">
              Buat turnamen sistem gugur bersama kawan, atau bergabung ke turnamen terbuka untuk memperebutkan trofi kejuaraan.
            </p>
          </div>

          {/* Player Trophies Bar (Themed Frosted Glass Inset) */}
          <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-black/25 dark:bg-black/35 backdrop-blur-md border border-white/15 relative z-10 shadow-inner">
            <div className="flex items-center gap-2 px-1.5 py-0.5">
              <div className="w-7 h-7 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Trophy className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[7.5px] font-extrabold text-white/75 uppercase tracking-wider truncate">
                  Emas
                </span>
                <span className="text-[12.5px] font-black text-white leading-none">
                  {trophies.gold} 🏆
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1.5 py-0.5 border-x border-white/15">
              <div className="w-7 h-7 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Medal className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[7.5px] font-extrabold text-white/75 uppercase tracking-wider truncate">
                  Perak
                </span>
                <span className="text-[12.5px] font-black text-white leading-none">
                  {trophies.silver} 🥈
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-1.5 py-0.5">
              <div className="w-7 h-7 rounded-xl bg-white/20 border border-white/20 flex items-center justify-center text-white shrink-0 shadow-xs">
                <Medal className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[7.5px] font-extrabold text-white/75 uppercase tracking-wider truncate">
                  Perunggu
                </span>
                <span className="text-[12.5px] font-black text-white leading-none">
                  {trophies.bronze} 🥉
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Quick Action Cards: Buat Turnamen, Gabung Kode, & Pindai QR (3 Segments) */}
        <div className="grid grid-cols-3 gap-2">
          {/* Card A: Buat Turnamen */}
          <div
            onClick={openCreateTournament}
            className="p-3 rounded-[22px] liquid-glass-card border border-[var(--border-card)] flex flex-col justify-between gap-2.5 cursor-pointer tactile-active group hover:border-[var(--accent-main)]/40 transition-all shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center text-[var(--accent-main)] shadow-2xs group-hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div>
              <h4 className="text-[12px] font-black text-[var(--text-primary)] leading-tight mb-0.5">
                Buat
              </h4>
              <p className="text-[8.5px] font-semibold text-[var(--text-secondary)] leading-tight">
                Host turnamen
              </p>
            </div>
            <div className="flex items-center gap-1 text-[9.5px] font-black text-[var(--accent-main)]">
              <span>Mulai</span>
              <ArrowRight className="w-2.5 h-2.5 stroke-[2.4] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card B: Gabung Turnamen */}
          <div
            onClick={openJoinTournament}
            className="p-3 rounded-[22px] liquid-glass-card border border-[var(--border-card)] flex flex-col justify-between gap-2.5 cursor-pointer tactile-active group hover:border-[var(--accent-main)]/40 transition-all shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center text-[var(--accent-main)] shadow-2xs group-hover:scale-105 transition-transform">
              <QrCode className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-[12px] font-black text-[var(--text-primary)] leading-tight mb-0.5">
                Gabung
              </h4>
              <p className="text-[8.5px] font-semibold text-[var(--text-secondary)] leading-tight">
                Ketik kode kamar
              </p>
            </div>
            <div className="flex items-center gap-1 text-[9.5px] font-black text-[var(--accent-main)]">
              <span>Ketik</span>
              <ArrowRight className="w-2.5 h-2.5 stroke-[2.4] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Card C: Pindai QR Turnamen */}
          <div
            onClick={() => setIsScannerOpen(true)}
            className="p-3 rounded-[22px] liquid-glass-card border border-[var(--border-card)] flex flex-col justify-between gap-2.5 cursor-pointer tactile-active group hover:border-[var(--accent-main)]/40 transition-all shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center text-[var(--accent-main)] shadow-2xs group-hover:scale-105 transition-transform">
              <ScanLine className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-[12px] font-black text-[var(--text-primary)] leading-tight mb-0.5">
                Pindai QR
              </h4>
              <p className="text-[8.5px] font-semibold text-[var(--text-secondary)] leading-tight">
                Scan tiket kawan
              </p>
            </div>
            <div className="flex items-center gap-1 text-[9.5px] font-black text-[var(--accent-main)]">
              <span>Scan</span>
              <ArrowRight className="w-2.5 h-2.5 stroke-[2.4] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* 3. Daftar Turnamen Terbuka (Public Waiting Rooms) */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2]" />
              <span>TURNAMEN TERBUKA</span>
            </span>
            <span className="text-[10px] text-[var(--text-secondary)] font-semibold">
              {publicTournaments.length} Lobi Menunggu
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {publicTournaments.map((item) => (
              <div
                key={item.id}
                className="w-full p-3.5 rounded-[22px] liquid-glass-card border border-[var(--border-card)] flex items-center justify-between gap-3 shadow-xs hover:border-[var(--accent-main)]/30 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)] shrink-0">
                    <Trophy className="w-4 h-4 fill-current stroke-none" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)]">
                        {item.code}
                      </span>
                      <span className="text-[9px] font-bold text-[var(--text-secondary)] truncate">
                        Host: {item.hostName}
                      </span>
                    </div>
                    <h4 className="text-[13px] font-black text-[var(--text-primary)] leading-tight truncate">
                      {item.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[9.5px] text-[var(--text-secondary)] font-semibold mt-0.5">
                      <span>{item.maxPlayers} Pemain</span>
                      <span>•</span>
                      <span className="text-[var(--accent-main)] font-bold">
                        {item.players.length}/{item.maxPlayers} Masuk
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleJoinPublicItem(item.code)}
                  className="py-1.5 px-3.5 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[10.5px] font-black flex items-center gap-1 shrink-0 cursor-pointer tactile-active hover:opacity-95 shadow-xs transition-opacity"
                >
                  <span>Ikut</span>
                  <ArrowRight className="w-3 h-3 stroke-[2.4]" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Format Regulasi & Hadiah Turnamen (Themed Bento) */}
        <div className="w-full rounded-[24px] p-3.5 sm:p-4 liquid-glass-card border border-[var(--border-card)] flex flex-col gap-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2]" />
              <span className="text-[12px] font-black text-[var(--text-primary)]">
                Format & Regulasi Turnamen
              </span>
            </div>
            <span className="text-[8.5px] text-[var(--accent-main)] font-bold">
              Pemain Asli 100%
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col items-center text-center">
              <Users className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2] mb-1" />
              <span className="text-[11px] font-black text-[var(--text-primary)]">
                4-16 Slot
              </span>
              <span className="text-[8px] text-[var(--text-secondary)] mt-0.5">
                Sistem Gugur
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col items-center text-center">
              <Clock className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2] mb-1" />
              <span className="text-[11px] font-black text-[var(--text-primary)]">
                60-90s
              </span>
              <span className="text-[8px] text-[var(--text-secondary)] mt-0.5">
                Waktu Ronde
              </span>
            </div>

            <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col items-center text-center">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2] mb-1" />
              <span className="text-[11px] font-black text-[var(--text-primary)]">
                +200 ★
              </span>
              <span className="text-[8px] text-[var(--text-secondary)] mt-0.5">
                Hadiah Juara
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Camera Modal for Tournament QR Codes */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
};

export default TournamentHubView;
