import React, { useState, useMemo, useEffect } from 'react';
import QRCode from 'qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  Shield,
  Sparkles,
  Camera,
  Edit3,
  LogOut,
  Calendar,
  Mail,
  User,
  Trophy,
  Star,
  Flame,
  Brain,
  ChevronRight,
  QrCode,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { copyToClipboard } from '../lib/clipboard';

export const PlayerIdModal: React.FC = () => {
  const {
    isPlayerIdModalOpen,
    closePlayerIdModal,
    user,
    updateUserName,
    openAuth,
    openAvatarPicker,
    logout,
    levels,
    levelRecords,
    stars,
    streak,
    showGlobalToast,
  } = useGameStore();

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user.name);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!isPlayerIdModalOpen) return;
    const rawId = user.id || 'TTS-8842';
    QRCode.toDataURL(`TTS-PASSPORT:${rawId}`, {
      width: 200,
      margin: 1,
      color: { dark: '#111113', light: '#FFFFFF' },
    }).then(setQrDataUrl).catch(() => {});
  }, [isPlayerIdModalOpen, user.id]);

  // Compute real progression stats (Zero Dummy Data)
  const totalCompletedLevels = useMemo(() => {
    return Object.values(levelRecords).filter((rec) => rec.completed).length;
  }, [levelRecords]);

  const { totalSolvedWords } = useMemo(() => {
    let solvedCount = 0;
    levels.forEach((lvl) => {
      const rec = levelRecords[lvl.id];
      if (rec?.solved) {
        solvedCount += rec.solved.length;
      }
    });

    return {
      totalSolvedWords: solvedCount,
    };
  }, [levels, levelRecords]);

  const playerTitle = useMemo(() => {
    if (totalCompletedLevels >= 50 || totalSolvedWords >= 200) return 'Begawan Kosakata';
    if (totalCompletedLevels >= 25 || totalSolvedWords >= 100) return 'Ahli Leksikon';
    if (totalCompletedLevels >= 10 || totalSolvedWords >= 50) return 'Pujangga Muda';
    if (totalCompletedLevels >= 3 || totalSolvedWords >= 15) return 'Penjelajah Kata';
    return 'Perintis Bahasa';
  }, [totalCompletedLevels, totalSolvedWords]);

  if (!isPlayerIdModalOpen) return null;

  const playerId = user.id || 'TTS-8842';

  const handleCopyId = async () => {
    const success = await copyToClipboard(playerId);
    if (success) {
      setCopied(true);
      showGlobalToast(`ID Pemain ${playerId} berhasil disalin!`);
      setTimeout(() => setCopied(false), 2200);
    } else {
      showGlobalToast(`ID Pemain: ${playerId}`);
    }
  };

  const formatPassportChipId = (id: string): string => {
    if (!id) return '#TTS-8842';
    if (id.startsWith('guest_')) {
      return `TAMU #${id.replace('guest_', '').slice(0, 6).toUpperCase()}`;
    }
    const clean = id.replace(/-/g, '');
    return `#${clean.slice(0, 8).toUpperCase()}`;
  };

  const formatAccountDetailId = (id: string): string => {
    if (!id) return 'TTS-8842';
    if (id.startsWith('guest_')) {
      return `guest_${id.replace('guest_', '').slice(0, 8)}`;
    }
    const clean = id.replace(/-/g, '');
    if (clean.length <= 12) return `#${clean.toUpperCase()}`;
    return `${clean.slice(0, 8).toUpperCase()}...${clean.slice(-4).toUpperCase()}`;
  };

  const handleStartEdit = () => {
    setNameInput(user.name);
    setIsEditing(true);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      showGlobalToast('Nama tidak boleh kosong.');
      return;
    }
    updateUserName(trimmed);
    setIsEditing(false);
    showGlobalToast('Nama profil berhasil diperbarui!');
  };

  const handleCancelEdit = () => {
    setNameInput(user.name);
    setIsEditing(false);
  };

  const handleOpenAuth = () => {
    closePlayerIdModal();
    openAuth();
  };

  const handleOpenAvatar = () => {
    closePlayerIdModal();
    openAvatarPicker();
  };

  const handleLogout = () => {
    logout();
    setConfirmLogout(false);
    closePlayerIdModal();
    showGlobalToast('Anda telah keluar dari akun.');
  };

  const isCustomImageAvatar =
    user.avatar &&
    (user.avatar.startsWith('/') ||
      user.avatar.startsWith('data:') ||
      user.avatar.startsWith('http'));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
        {/* Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          exit={{ opacity: 0 }}
          onClick={closePlayerIdModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Window Container (Apple Liquid Glass) */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-[370px] max-h-[92vh] overflow-y-auto no-scrollbar rounded-[28px] p-4 sm:p-5 flex flex-col gap-3.5 shadow-2xl z-10 border border-black/10 dark:border-white/15 liquid-glass-card"
        >
          {/* Top Specular Sheen */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[var(--accent-main)] stroke-[2.2]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
                KARTU IDENTITAS PEMAIN
              </span>
            </div>

            <button
              type="button"
              onClick={closePlayerIdModal}
              aria-label="Tutup"
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>

          {/* Hero VIP Passport Card with Holographic Specular Accent */}
          <div
            className="w-full rounded-[22px] p-4 relative overflow-hidden border border-white/20 dark:border-white/25 shadow-md flex flex-col gap-3 group"
            style={{
              background: 'var(--hero-grad, var(--accent-grad))',
              color: '#ffffff',
            }}
          >
            {/* Holographic Specular Gradient Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/12 to-transparent pointer-events-none opacity-60" />
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-black/25 blur-2xl pointer-events-none" />

            {/* Subtle Watermark Shield in Background */}
            <div className="absolute -right-2 -bottom-2 w-32 h-32 opacity-[0.09] pointer-events-none select-none text-white flex items-center justify-center">
              <Shield className="w-full h-full stroke-[1.2]" />
            </div>

            {/* Passport Header: Chip Status & Copy ID */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/20 dark:bg-black/35 backdrop-blur-md border border-white/20 text-white shadow-xs">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${user.isGuest ? 'bg-white/50' : 'bg-white'} animate-pulse`}
                />
                <span className="text-[8.5px] font-black uppercase tracking-wider">
                  {user.isGuest ? 'AKUN TAMU' : 'TERVERIFIKASI'}
                </span>
              </div>

              {/* ID Code Pill + Copy Button */}
              <button
                type="button"
                onClick={handleCopyId}
                title="Salin ID Pemain"
                className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white inline-flex items-center gap-1.5 cursor-pointer tactile-active shadow-xs transition-all shrink-0"
              >
                <span className="text-[10px] font-mono font-black tracking-wider">
                  {formatPassportChipId(playerId)}
                </span>
                {copied ? (
                  <Check className="w-3 h-3 text-white stroke-[3]" />
                ) : (
                  <Copy className="w-2.5 h-2.5 text-white/90 stroke-[2.2]" />
                )}
              </button>
            </div>

            {/* Avatar & Player Name Section */}
            <div className="flex items-center gap-3 relative z-10">
              <button
                type="button"
                onClick={handleOpenAvatar}
                title="Ganti Foto Profil"
                aria-label="Ganti Foto Profil"
                className="relative group cursor-pointer tactile-active shrink-0"
              >
                <div className="w-13 h-13 rounded-full p-0.5 bg-white/25 border-2 border-white/50 flex items-center justify-center overflow-hidden shadow-sm">
                  <div className="w-full h-full rounded-full overflow-hidden bg-black/25 flex items-center justify-center">
                    {isCustomImageAvatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span className="text-[18px] font-black text-white uppercase">
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
                {isEditing ? (
                  <form onSubmit={handleSaveName} className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      maxLength={24}
                      autoFocus
                      placeholder="Nama Panggilan"
                      className="w-full px-2.5 py-1 rounded-lg bg-black/30 border border-white/30 text-[13px] font-bold text-white placeholder-white/50 focus:outline-hidden focus:ring-1 focus:ring-white"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="submit"
                        className="px-2.5 py-0.5 rounded-md bg-white text-zinc-900 text-[10px] font-black cursor-pointer tactile-active"
                      >
                        Simpan
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-2.5 py-0.5 rounded-md bg-white/20 text-white text-[10px] font-bold cursor-pointer tactile-active"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-[18px] font-black text-white tracking-tight leading-tight truncate">
                        {user.name}
                      </h3>
                      <button
                        type="button"
                        onClick={handleStartEdit}
                        title="Ubah Nama"
                        className="w-5 h-5 rounded-md bg-white/15 hover:bg-white/25 flex items-center justify-center text-white/90 cursor-pointer tactile-active transition-all"
                      >
                        <Edit3 className="w-2.5 h-2.5 stroke-[2.2]" />
                      </button>
                    </div>
                    <span className="text-[10px] text-white/80 block leading-tight">
                      @{user.name.toLowerCase().replace(/\s+/g, '_')}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-white/95 px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs border border-white/15">
                    {playerTitle}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Inset Grouped List: Detail Akun & Sistem */}
          <div className="w-full rounded-[20px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 p-1 flex flex-col divide-y divide-black/5 dark:divide-white/10">
            {/* Row 1: ID Pemain + QR Toggle */}
            <div className="flex flex-col p-2.5 gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <User className="w-3.5 h-3.5 stroke-[2]" />
                  <span className="text-[11.5px] font-bold text-[var(--text-primary)]">
                    ID Pemain
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-[var(--text-secondary)]">
                    {formatAccountDetailId(playerId)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowQrCode((prev) => !prev)}
                    title="Tampilkan QR ID Pemain"
                    className="px-2 py-1 rounded-md bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/25 text-[9.5px] font-black flex items-center gap-1 cursor-pointer tactile-active"
                  >
                    <QrCode className="w-3 h-3 stroke-[2.2]" />
                    <span>{showQrCode ? 'Tutup QR' : 'QR ID'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="p-1 rounded-md bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-primary)] cursor-pointer tactile-active"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-[var(--accent-main)] stroke-[3]" />
                    ) : (
                      <Copy className="w-3 h-3 stroke-[2]" />
                    )}
                  </button>
                </div>
              </div>
              {showQrCode && qrDataUrl && (
                <div className="w-full py-2.5 px-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col items-center gap-1.5">
                  <img
                    src={qrDataUrl}
                    alt="QR ID Pemain"
                    className="w-28 h-28 rounded-xl border border-black/10 shadow-xs"
                  />
                  <span className="text-[9.5px] font-semibold text-[var(--text-secondary)] text-center">
                    Pindai lewat menu Tambah Teman untuk berteman instan
                  </span>
                </div>
              )}
            </div>

            {/* Row 2: Email & Sinkronisasi */}
            <div className="flex items-center justify-between p-2.5">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Mail className="w-3.5 h-3.5 stroke-[2]" />
                <span className="text-[11.5px] font-bold text-[var(--text-primary)]">
                  Surel Akun
                </span>
              </div>
              <div>
                {user.email ? (
                  <span className="text-[11px] font-bold text-[var(--text-primary)] max-w-[150px] truncate block text-right">
                    {user.email}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenAuth}
                    className="inline-flex items-center gap-1 text-[10px] font-black text-[var(--accent-main)] hover:underline cursor-pointer"
                  >
                    <span>Hubungkan Email</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Row 3: Tanggal Bergabung */}
            <div className="flex items-center justify-between p-2.5">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Calendar className="w-3.5 h-3.5 stroke-[2]" />
                <span className="text-[11.5px] font-bold text-[var(--text-primary)]">
                  Bergabung
                </span>
              </div>
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                {user.joinedAt || 'Mode Tamu'}
              </span>
            </div>
          </div>

          {/* 2x2 Bento Mini: Reputasi & Prestasi Riil */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-[16px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)] shrink-0">
                <Trophy className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-[8.5px] font-bold text-[var(--text-secondary)] uppercase block">
                  Bab Selesai
                </span>
                <span className="text-[13px] font-black text-[var(--text-primary)] leading-none">
                  {totalCompletedLevels} <span className="text-[9.5px] text-[var(--text-secondary)] font-normal">/{levels.length}</span>
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-[16px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)] shrink-0">
                <Star className="w-3.5 h-3.5 fill-current text-[var(--accent-main)]" />
              </div>
              <div className="min-w-0">
                <span className="text-[8.5px] font-bold text-[var(--text-secondary)] uppercase block">
                  Total Bintang
                </span>
                <span className="text-[13px] font-black text-[var(--text-primary)] leading-none">
                  {stars} <span className="text-[9.5px] text-[var(--text-secondary)] font-normal">Pts</span>
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-[16px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)] shrink-0">
                <Brain className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-[8.5px] font-bold text-[var(--text-secondary)] uppercase block">
                  Kosakata
                </span>
                <span className="text-[13px] font-black text-[var(--text-primary)] leading-none">
                  {totalSolvedWords} <span className="text-[9.5px] text-[var(--text-secondary)] font-normal">Kata</span>
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-[16px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)] shrink-0">
                <Flame className="w-3.5 h-3.5 fill-current text-[var(--accent-main)]" />
              </div>
              <div className="min-w-0">
                <span className="text-[8.5px] font-bold text-[var(--text-secondary)] uppercase block">
                  Rentetan
                </span>
                <span className="text-[13px] font-black text-[var(--text-primary)] leading-none">
                  {streak} <span className="text-[9.5px] text-[var(--text-secondary)] font-normal">Hari</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="flex flex-col gap-2 mt-0.5">
            {user.isGuest ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleOpenAuth}
                  className="w-full h-10.5 rounded-full font-bold text-[13px] text-[var(--accent-contrast)] flex items-center justify-center gap-2 cursor-pointer tactile-active shadow-sm border border-white/20 transition-transform"
                  style={{ background: 'var(--accent-grad)' }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Masuk / Sinkronkan Akun</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full h-9 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--accent-main)] flex items-center justify-center gap-1.5 text-[11.5px] font-bold transition-all cursor-pointer tactile-active"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar dari Sesi Tamu</span>
                </button>
              </div>
            ) : (
              <div>
                {confirmLogout ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex-1 h-9.5 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] hover:opacity-90 text-[12px] font-bold cursor-pointer tactile-active transition-all"
                    >
                      Ya, Keluar Akun
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmLogout(false)}
                      className="flex-1 h-9.5 rounded-full bg-black/5 dark:bg-white/10 text-[var(--text-primary)] text-[12px] font-bold cursor-pointer tactile-active transition-all"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmLogout(true)}
                    className="w-full h-10 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--accent-main)] flex items-center justify-center gap-2 text-[12.5px] font-bold transition-all cursor-pointer tactile-active"
                  >
                    <LogOut className="w-4 h-4 stroke-[2]" />
                    <span>Keluar dari Akun</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PlayerIdModal;
