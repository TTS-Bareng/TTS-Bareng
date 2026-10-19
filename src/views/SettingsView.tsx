import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  LogOut,
  Check,
  Camera,
  Smartphone,
  Compass,
  HelpCircle,
  HardDrive,
  Download,
  Upload,
  Flame,
  Star,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { THEMES, type ThemeKey } from '../lib/themes';
import { MASCOTS } from '../assets/maskots';
import { promptPWAInstall, onInstallabilityChange } from '../lib/pwa';

export const SettingsView: React.FC = () => {
  const {
    user,
    theme,
    setTheme,
    soundEnabled,
    toggleSound,
    hapticEnabled,
    toggleHaptic,
    openAuth,
    logout,
    resetAllProgress,
    stars,
    streak,
    levelRecords,
    autoAdvanceEnabled,
    toggleAutoAdvance,
    errorFeedbackMode,
    setErrorFeedbackMode,
    openAvatarPicker,
    setCurrentTab,
  } = useGameStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    return onInstallabilityChange((canInstall) => {
      setIsInstallable(canInstall);
    });
  }, []);

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await promptPWAInstall();
      if (accepted) {
        showToast('Aplikasi berhasil dipasang!');
      }
    } else {
      showToast('Aplikasi siap dimainkan 100% offline.');
    }
  };

  const [confirmHint, setConfirmHint] = useState<boolean>(() => {
    return localStorage.getItem('tts_confirm_hint') === 'true';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const themeList = Object.values(THEMES);

  // Real Storage Calculation
  const storageUsageKB = useMemo(() => {
    try {
      let totalLength = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tts_')) {
          totalLength += (localStorage.getItem(key) || '').length;
        }
      }
      return (totalLength / 1024).toFixed(1);
    } catch {
      return '12.4';
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2400);
  };

  const handleToggleHaptics = () => {
    toggleHaptic();
  };

  const handleToggleConfirmHint = () => {
    const next = !confirmHint;
    setConfirmHint(next);
    localStorage.setItem('tts_confirm_hint', String(next));
  };

  const handleExportBackup = () => {
    try {
      const backupData = {
        version: 2,
        exportedAt: new Date().toISOString(),
        user,
        stars,
        streak,
        theme,
        levelRecords,
      };
      const blob = new Blob([JSON.stringify(backupData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tts_quest_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Cadangan data berhasil diunduh!');
    } catch {
      showToast('Gagal membuat berkas cadangan.');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') {
          if (parsed.user) localStorage.setItem('tts_quest_user', JSON.stringify(parsed.user));
          if (typeof parsed.stars === 'number')
            localStorage.setItem('tts_quest_stars', String(parsed.stars));
          if (typeof parsed.streak === 'number')
            localStorage.setItem('tts_quest_streak', String(parsed.streak));
          if (parsed.theme) localStorage.setItem('tts_quest_theme', parsed.theme);
          if (parsed.levelRecords)
            localStorage.setItem('tts_quest_records', JSON.stringify(parsed.levelRecords));

          showToast('Data berhasil dipulihkan! Memuat ulang...');
          setTimeout(() => {
            window.location.reload();
          }, 800);
        } else {
          showToast('Format berkas tidak valid.');
        }
      } catch {
        showToast('Gagal membaca berkas cadangan.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const currentThemeObj = THEMES[theme] || THEMES.obsidian;

  return (
    <div className="w-full flex-1 flex flex-col gap-3 px-3.5 pt-[max(18px,env(safe-area-inset-top))] pb-[max(90px,calc(75px+env(safe-area-inset-bottom)))] select-none overflow-y-auto relative">
      {/* Toast Notification Floating Pill */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full liquid-glass-card shadow-lg flex items-center gap-2 border border-[var(--accent-main)]/30 animate-in fade-in slide-in-from-top-3">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-main)]" />
          <span className="text-[11px] font-bold text-[var(--text-primary)]">
            {toastMessage}
          </span>
        </div>
      )}

      {/* 1. Header: Back Button + Typographic Title + Live PWA Status Pill */}
      <header className="flex items-center justify-between px-0.5 relative z-10 shrink-0">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setCurrentTab('profile')}
            title="Kembali ke Profil"
            aria-label="Kembali ke Profil"
            className="w-8.5 h-8.5 rounded-full liquid-glass-tile border border-black/5 dark:border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer tactile-active shadow-xs"
          >
            <ChevronLeft className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>
          <div>
            <span className="text-[9.5px] font-black uppercase tracking-wider text-[var(--accent-main)] block leading-none mb-0.5">
              SISTEM & PREFERENSI
            </span>
            <h2 className="text-[18px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
              Pengaturan
            </h2>
          </div>
        </div>

        {/* Live PWA Status / Install Pill */}
        <button
          type="button"
          onClick={handleInstallClick}
          title={isInstallable ? 'Pasang TTS Quest ke Perangkat' : 'Aplikasi Siap Offline'}
          className="h-8.5 px-3 rounded-full flex items-center gap-1.5 liquid-glass-card border border-black/5 dark:border-white/10 shadow-xs cursor-pointer tactile-active group"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-main)] animate-pulse" />
          <span className="text-[10px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
            {isInstallable ? 'Pasang Aplikasi' : 'PWA Siap Offline'}
          </span>
        </button>
      </header>

      {/* 2. Hero Bento Card: Profil Pengguna & Akses Cepat with Vibrant Theme Accent Gradient */}
      <div
        className="w-full rounded-[26px] p-4 relative z-10 overflow-hidden border border-white/10 dark:border-white/15 shadow-sm group"
        style={{
          background: 'var(--hero-grad, var(--accent-grad))',
          color: '#ffffff',
        }}
      >
        {/* Ambient Lighting & Top Specular Sheen */}
        <div className="absolute top-0 inset-x-0 h-px bg-white/30 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/20 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-black/25 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          {/* Avatar Button */}
          <button
            type="button"
            onClick={openAvatarPicker}
            title="Ganti Foto Profil"
            className="w-13 h-13 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center p-1 overflow-hidden relative group cursor-pointer tactile-active shrink-0 shadow-sm"
          >
            {isCustomImageAvatar ? (
              <img
                src={user.avatar}
                alt="Foto Profil"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            ) : (
              <img
                src={MASCOTS.crosswordChampion}
                alt="Foto Profil"
                className="w-full h-full object-contain filter drop-shadow-sm"
              />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
              <Camera className="w-4 h-4" />
            </div>
          </button>

          {/* User Info & Edit Action */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[15px] font-black text-white truncate block leading-tight">
                {user.name}
              </span>
              <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-white/20 text-white shrink-0">
                {user.isGuest ? 'Tamu' : 'Terhubung'}
              </span>
            </div>

            <button
              type="button"
              onClick={openAvatarPicker}
              className="text-[10px] text-white/85 hover:text-white font-bold hover:underline block text-left cursor-pointer mb-2 transition-colors"
            >
              Ubah Foto & Nama Profil →
            </button>

            {/* Quick Stats Badges inside Profile */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-white">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-[10.5px] font-black text-white">
                  {stars}
                </span>
                <span className="text-[7.5px] uppercase font-bold text-white/80">
                  ★
                </span>
              </div>
              <span className="w-0.5 h-2.5 bg-white/30 rounded-full" />
              <div className="flex items-center gap-1 text-white">
                <Flame className="w-3 h-3 fill-current" />
                <span className="text-[10.5px] font-black text-white">
                  {streak}
                </span>
                <span className="text-[7.5px] uppercase font-bold text-white/80">
                  Hari
                </span>
              </div>
            </div>
          </div>

          {/* Auth Action Button */}
          <div className="shrink-0">
            {user.isGuest ? (
              <button
                type="button"
                onClick={openAuth}
                className="px-3.5 py-1.5 rounded-full font-black text-[10.5px] bg-white cursor-pointer tactile-active shadow-sm group-hover:scale-105 transition-transform"
                style={{ color: 'var(--hero-btn-text, #111113)' }}
              >
                Masuk
              </button>
            ) : (
              <button
                type="button"
                onClick={logout}
                title="Keluar Akun"
                aria-label="Keluar Akun"
                className="w-8 h-8 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 border border-white/20 text-white cursor-pointer tactile-active transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bento Card 2: Tema Tampilan (Compact Swatch Pill Strip) */}
      <div
        className="w-full rounded-[24px] p-3.5 relative z-10 overflow-hidden border border-[var(--accent-main)]/20 shadow-xs"
        style={{
          background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
        }}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
        <div className="flex items-center justify-between mb-2 px-0.5 relative z-10">
          <span className="text-[12.5px] font-black text-[var(--text-primary)] tracking-tight">
            Tema Tampilan
          </span>
          <span className="text-[8.5px] font-black px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
            {currentThemeObj.name}
          </span>
        </div>

        {/* Compact Horizontal Scrollable Swatch Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {themeList.map((t) => {
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id as ThemeKey)}
                className={`w-[98px] shrink-0 p-2 rounded-xl flex flex-col items-center gap-1.5 transition-all cursor-pointer tactile-active border ${
                  isSelected
                    ? 'border-[var(--accent-main)] ring-2 ring-[var(--accent-main)]/25 bg-[var(--accent-light)] shadow-xs'
                    : 'border-black/5 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:border-black/10 dark:hover:border-white/20'
                }`}
              >
                {/* Swatch Circle */}
                <div
                  className="w-7 h-7 rounded-full shadow-sm flex items-center justify-center p-0.5 relative"
                  style={{ backgroundColor: t.previewBg }}
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: t.previewAccent }}
                  >
                    {isSelected && (
                      <Check
                        className="w-2.5 h-2.5 stroke-[3.5]"
                        style={{
                          color: THEMES[t.id as ThemeKey]?.vars['--accent-contrast'] || '#FFFFFF',
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Theme Name */}
                <span className="text-[9.5px] font-bold text-[var(--text-primary)] truncate max-w-full block">
                  {t.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Bento Grid 3: Kontrol Permainan & Sensasi Taktil (2x2 Bento Tiles) */}
      <div className="grid grid-cols-2 gap-2.5 z-10 relative">
        {/* Tile 1: Efek Suara */}
        <button
          type="button"
          onClick={toggleSound}
          className="rounded-[22px] p-3 flex flex-col justify-between text-left cursor-pointer tactile-active relative overflow-hidden border border-[var(--accent-main)]/20 shadow-xs"
          style={{
            background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 stroke-[2.2]" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 stroke-[2.2]" />
              )}
            </div>

            {/* Apple Style Switch */}
            <div
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                soundEnabled ? 'bg-[var(--accent-main)]' : 'bg-black/20 dark:bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                  soundEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          <div className="relative z-10">
            <span className="text-[11.5px] font-black text-[var(--text-primary)] block leading-tight">
              Efek Suara
            </span>
            <span className="text-[8.5px] text-[var(--text-secondary)] font-medium block truncate mt-0.5">
              {soundEnabled ? 'Ketukan & Chime' : 'Mode Hening'}
            </span>
          </div>
        </button>

        {/* Tile 2: Getaran Haptik */}
        <button
          type="button"
          onClick={handleToggleHaptics}
          className="rounded-[22px] p-3 flex flex-col justify-between text-left cursor-pointer tactile-active relative overflow-hidden border border-[var(--accent-main)]/20 shadow-xs"
          style={{
            background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
              <Smartphone className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>

            {/* Apple Style Switch */}
            <div
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                hapticEnabled ? 'bg-[var(--accent-main)]' : 'bg-black/20 dark:bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                  hapticEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          <div className="relative z-10">
            <span className="text-[11.5px] font-black text-[var(--text-primary)] block leading-tight">
              Getaran Haptik
            </span>
            <span className="text-[8.5px] text-[var(--text-secondary)] font-medium block truncate mt-0.5">
              {hapticEnabled ? 'Sentuhan Taktil' : 'Nonaktif'}
            </span>
          </div>
        </button>

        {/* Tile 3: Lompat Kotak Otomatis */}
        <button
          type="button"
          onClick={toggleAutoAdvance}
          className="rounded-[22px] p-3 flex flex-col justify-between text-left cursor-pointer tactile-active relative overflow-hidden border border-[var(--accent-main)]/20 shadow-xs"
          style={{
            background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
              <Compass className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>

            {/* Apple Style Switch */}
            <div
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                autoAdvanceEnabled ? 'bg-[var(--accent-main)]' : 'bg-black/20 dark:bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                  autoAdvanceEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          <div className="relative z-10">
            <span className="text-[11.5px] font-black text-[var(--text-primary)] block leading-tight">
              Lompat Kotak
            </span>
            <span className="text-[8.5px] text-[var(--text-secondary)] font-medium block truncate mt-0.5">
              {autoAdvanceEnabled ? 'Maju Otomatis' : 'Manual'}
            </span>
          </div>
        </button>

        {/* Tile 4: Konfirmasi Petunjuk Bintang */}
        <button
          type="button"
          onClick={handleToggleConfirmHint}
          className="rounded-[22px] p-3 flex flex-col justify-between text-left cursor-pointer tactile-active relative overflow-hidden border border-[var(--accent-main)]/20 shadow-xs"
          style={{
            background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
          <div className="flex items-center justify-between mb-2 relative z-10">
            <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
              <HelpCircle className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>

            {/* Apple Style Switch */}
            <div
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                confirmHint ? 'bg-[var(--accent-main)]' : 'bg-black/20 dark:bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                  confirmHint ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </div>
          </div>

          <div className="relative z-10">
            <span className="text-[11.5px] font-black text-[var(--text-primary)] block leading-tight">
              Bantuan Bintang
            </span>
            <span className="text-[8.5px] text-[var(--text-secondary)] font-medium block truncate mt-0.5">
              {confirmHint ? 'Tanya Dahulu' : 'Buka Langsung'}
            </span>
          </div>
        </button>
      </div>

      {/* 5. Mode Umpan Balik Kesalahan (Gentle vs Purist) */}
      <div
        className="w-full rounded-[24px] p-3.5 relative z-10 overflow-hidden border border-[var(--accent-main)]/20 shadow-xs"
        style={{
          background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
        }}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
        <div className="flex items-center justify-between mb-1 px-0.5 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-main)]" />
            <span className="text-[12.5px] font-black text-[var(--text-primary)] tracking-tight">
              Umpan Balik Kesalahan
            </span>
          </div>
          <span className="text-[8.5px] text-[var(--accent-main)] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-main)]/10 border border-[var(--accent-main)]/20">
            {errorFeedbackMode === 'gentle' ? 'Lembut' : 'Purist'}
          </span>
        </div>

        <p className="text-[9.5px] text-[var(--text-secondary)] leading-tight mb-2.5 px-0.5 relative z-10">
          {errorFeedbackMode === 'gentle'
            ? 'Kotak bergetar dan bergoyang lembut seketika kata selesai diisi jika ada huruf yang belum pas.'
            : 'Mode klasik tanpa indikasi salah di tengah bermain. Evaluasi murni saat teka-teki rampung.'}
        </p>

        {/* Apple-style Segmented Control */}
        <div className="flex items-center p-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 relative z-10 gap-1">
          <button
            type="button"
            onClick={() => setErrorFeedbackMode('gentle')}
            className={`flex-1 py-1.5 px-3 rounded-full text-[10.5px] font-bold transition-all tactile-active cursor-pointer flex items-center justify-center gap-1.5 ${
              errorFeedbackMode === 'gentle'
                ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sparkles className="w-3 h-3 stroke-[2.2]" />
            <span>Lembut (Gentle)</span>
          </button>
          <button
            type="button"
            onClick={() => setErrorFeedbackMode('purist')}
            className={`flex-1 py-1.5 px-3 rounded-full text-[10.5px] font-bold transition-all tactile-active cursor-pointer flex items-center justify-center gap-1.5 ${
              errorFeedbackMode === 'purist'
                ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <ShieldCheck className="w-3 h-3 stroke-[2.2]" />
            <span>Purist (Klasik)</span>
          </button>
        </div>
      </div>

      {/* 6. Bento Card 4: Manajemen Data & Cadangan Offline */}
      <div
        className="w-full rounded-[24px] p-3.5 relative z-10 overflow-hidden border border-[var(--accent-main)]/20 shadow-xs"
        style={{
          background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
        }}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
        <div className="flex items-center justify-between mb-1 px-0.5 relative z-10">
          <div className="flex items-center gap-2">
            <HardDrive className="w-3.5 h-3.5 text-[var(--accent-main)]" />
            <span className="text-[12.5px] font-black text-[var(--text-primary)] tracking-tight">
              Penyimpanan & Cadangan
            </span>
          </div>
          <span className="text-[8.5px] text-[var(--text-secondary)] font-bold">
            {storageUsageKB} KB Terpakai
          </span>
        </div>

        <p className="text-[9.5px] text-[var(--text-secondary)] leading-tight mb-3 px-0.5 relative z-10">
          Seluruh kata dan riwayat level tersimpan aman di peramban. Cadangkan data Anda
          sebelum berganti ponsel atau peramban.
        </p>

        {/* 2 Quick Action Buttons: Export & Import */}
        <div className="grid grid-cols-2 gap-2 relative z-10">
          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportBackup}
            className="py-2.5 px-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center gap-1.5 text-[10.5px] font-bold text-[var(--text-primary)] hover:border-[var(--accent-main)]/30 cursor-pointer tactile-active"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent-main)]" />
            <span>Cadangkan</span>
          </button>

          {/* Import JSON */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center gap-1.5 text-[10.5px] font-bold text-[var(--text-primary)] hover:border-[var(--accent-main)]/30 cursor-pointer tactile-active"
          >
            <Upload className="w-3.5 h-3.5 text-[var(--accent-main)]" />
            <span>Pulihkan</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportBackup}
            className="hidden"
          />
        </div>
      </div>

      {/* 7. Bento Card 5: Zona Keamanan & Reset Data */}
      <div
        className="w-full rounded-[24px] p-3.5 relative z-10 overflow-hidden border border-[var(--accent-main)]/20 shadow-xs"
        style={{
          background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
        }}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
        {showResetConfirm ? (
          <div className="flex flex-col gap-2.5 relative z-10">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[var(--accent-main)]" />
              <span className="text-[12px] font-black text-[var(--text-primary)]">
                Konfirmasi Hapus Seluruh Data?
              </span>
            </div>
            <p className="text-[9.5px] text-[var(--text-secondary)] leading-tight">
              Tindakan ini akan mengembalikan seluruh kemajuan bab, bintang, dan streak ke kondisi awal.
            </p>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => {
                  resetAllProgress();
                  setShowResetConfirm(false);
                  showToast('Semua kemajuan berhasil direset.');
                }}
                className="flex-1 py-2 rounded-xl bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-[var(--text-primary)] font-bold text-[11px] cursor-pointer tactile-active"
              >
                Ya, Reset Progres
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] font-bold text-[11px] cursor-pointer tactile-active"
              >
                Batal
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="w-full flex items-center justify-between text-left cursor-pointer tactile-active group relative z-10"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center text-[var(--text-secondary)]">
                <RotateCcw className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <div>
                <span className="text-[11.5px] font-bold text-[var(--text-primary)] block leading-tight">
                  Atur Ulang Progres
                </span>
                <span className="text-[8.5px] text-[var(--text-secondary)] block">
                  Hapus bab & kemajuan lokal
                </span>
              </div>
            </div>

            <span className="text-[8.5px] font-bold px-2 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
              Reset
            </span>
          </button>
        )}
      </div>

      {/* 7. Footer Info (No Forced Pill - Natural End) */}
      <footer className="flex flex-col items-center justify-center gap-1.5 text-[9px] text-[var(--text-secondary)] z-10 relative pt-2 pb-1">
        <div className="flex items-center gap-2">
          <img src="/logo-dark.webp" alt="TTS Bareng" className="w-5 h-5 rounded-md object-contain hidden dark:block" />
          <img src="/logo-light.webp" alt="TTS Bareng" className="w-5 h-5 rounded-md object-contain block dark:hidden" />
          <span className="font-black text-[11px] text-[var(--text-primary)] tracking-tight">TTS Bareng</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-main)]" />
          <span>v1.0 • Mabar Teka Teki Silang • Standar KBBI</span>
        </div>
      </footer>
    </div>
  );
};

export default SettingsView;
