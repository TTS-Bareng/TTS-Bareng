import React, { useState, useRef, useMemo } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  Smartphone,
  Compass,
  HelpCircle,
  HardDrive,
  Download,
  Upload,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  Scale,
  BookOpen,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { THEMES, type ThemeKey } from '../lib/themes';

export const SettingsView: React.FC = () => {
  const {
    theme,
    setTheme,
    soundEnabled,
    toggleSound,
    hapticEnabled,
    toggleHaptic,
    resetAllProgress,
    deleteAccountAndData,
    autoAdvanceEnabled,
    toggleAutoAdvance,
    errorFeedbackMode,
    setErrorFeedbackMode,
    setCurrentTab,
    openLegalModal,
  } = useGameStore();

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteAccountConfirm, setShowDeleteAccountConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      const state = useGameStore.getState();
      const backupData = {
        version: 2,
        exportedAt: new Date().toISOString(),
        user: state.user,
        stars: state.stars,
        streak: state.streak,
        theme: state.theme,
        levelRecords: state.levelRecords,
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

      {/* 1. Header: Back Button + Typographic Title */}
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
      </header>

      {/* 2. Group 1: Tampilan & Kontrol Permainan */}
      <div
        className="w-full rounded-[24px] p-3.5 relative z-10 overflow-hidden border border-[var(--accent-main)]/20 shadow-xs"
        style={{
          background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
        }}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

        {/* 2.1 Tema Tampilan */}
        <div className="flex items-center justify-between mb-2 px-0.5 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-main)]" />
            <span className="text-[12.5px] font-black text-[var(--text-primary)] tracking-tight">
              Tema Tampilan
            </span>
          </div>
          <span className="text-[8.5px] font-black px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
            {currentThemeObj.name}
          </span>
        </div>

        {/* Compact Horizontal Scrollable Swatch Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar relative z-10">
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

        {/* Separator */}
        <div className="w-full h-px bg-black/5 dark:bg-white/10 my-3 relative z-10" />

        {/* 2.2 2x2 Bento Switch Tiles */}
        <div className="grid grid-cols-2 gap-2 relative z-10">
          {/* Tile 1: Efek Suara */}
          <button
            type="button"
            onClick={toggleSound}
            className="rounded-[18px] p-2.5 flex flex-col justify-between text-left cursor-pointer tactile-active bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-[var(--accent-main)]/20 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-6.5 h-6.5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
                {soundEnabled ? (
                  <Volume2 className="w-3.5 h-3.5 stroke-[2.2]" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 stroke-[2.2]" />
                )}
              </div>

              {/* Apple Switch */}
              <div
                className={`w-8.5 h-4.5 rounded-full p-0.5 transition-colors ${
                  soundEnabled ? 'bg-[var(--accent-main)]' : 'bg-black/20 dark:bg-white/20'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transform transition-transform ${
                    soundEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-black text-[var(--text-primary)] block leading-tight">
                Efek Suara
              </span>
              <span className="text-[8px] text-[var(--text-secondary)] font-medium block truncate mt-0.5">
                {soundEnabled ? 'Ketukan & Chime' : 'Mode Hening'}
              </span>
            </div>
          </button>

          {/* Tile 2: Getaran Haptik */}
          <button
            type="button"
            onClick={handleToggleHaptics}
            className="rounded-[18px] p-2.5 flex flex-col justify-between text-left cursor-pointer tactile-active bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-[var(--accent-main)]/20 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-6.5 h-6.5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
                <Smartphone className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>

              {/* Apple Switch */}
              <div
                className={`w-8.5 h-4.5 rounded-full p-0.5 transition-colors ${
                  hapticEnabled ? 'bg-[var(--accent-main)]' : 'bg-black/20 dark:bg-white/20'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transform transition-transform ${
                    hapticEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-black text-[var(--text-primary)] block leading-tight">
                Getaran Haptik
              </span>
              <span className="text-[8px] text-[var(--text-secondary)] font-medium block truncate mt-0.5">
                {hapticEnabled ? 'Sentuhan Taktil' : 'Nonaktif'}
              </span>
            </div>
          </button>

          {/* Tile 3: Lompat Kotak */}
          <button
            type="button"
            onClick={toggleAutoAdvance}
            className="rounded-[18px] p-2.5 flex flex-col justify-between text-left cursor-pointer tactile-active bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-[var(--accent-main)]/20 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-6.5 h-6.5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
                <Compass className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>

              {/* Apple Switch */}
              <div
                className={`w-8.5 h-4.5 rounded-full p-0.5 transition-colors ${
                  autoAdvanceEnabled ? 'bg-[var(--accent-main)]' : 'bg-black/20 dark:bg-white/20'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transform transition-transform ${
                    autoAdvanceEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-black text-[var(--text-primary)] block leading-tight">
                Lompat Kotak
              </span>
              <span className="text-[8px] text-[var(--text-secondary)] font-medium block truncate mt-0.5">
                {autoAdvanceEnabled ? 'Maju Otomatis' : 'Manual'}
              </span>
            </div>
          </button>

          {/* Tile 4: Bantuan Bintang */}
          <button
            type="button"
            onClick={handleToggleConfirmHint}
            className="rounded-[18px] p-2.5 flex flex-col justify-between text-left cursor-pointer tactile-active bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-[var(--accent-main)]/20 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-6.5 h-6.5 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)]">
                <HelpCircle className="w-3.5 h-3.5 stroke-[2.2]" />
              </div>

              {/* Apple Switch */}
              <div
                className={`w-8.5 h-4.5 rounded-full p-0.5 transition-colors ${
                  confirmHint ? 'bg-[var(--accent-main)]' : 'bg-black/20 dark:bg-white/20'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white shadow-xs transform transition-transform ${
                    confirmHint ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>

            <div>
              <span className="text-[11px] font-black text-[var(--text-primary)] block leading-tight">
                Bantuan Bintang
              </span>
              <span className="text-[8px] text-[var(--text-secondary)] font-medium block truncate mt-0.5">
                {confirmHint ? 'Tanya Dahulu' : 'Buka Langsung'}
              </span>
            </div>
          </button>
        </div>

        {/* Separator */}
        <div className="w-full h-px bg-black/5 dark:bg-white/10 my-3 relative z-10" />

        {/* 2.3 Mode Umpan Balik Kesalahan */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-1 px-0.5">
            <span className="text-[11.5px] font-black text-[var(--text-primary)] tracking-tight">
              Umpan Balik Kesalahan
            </span>
            <span className="text-[8px] text-[var(--accent-main)] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-main)]/10 border border-[var(--accent-main)]/20">
              {errorFeedbackMode === 'gentle' ? 'Lembut' : 'Purist'}
            </span>
          </div>

          <p className="text-[9px] text-[var(--text-secondary)] leading-tight mb-2 px-0.5">
            {errorFeedbackMode === 'gentle'
              ? 'Kotak bergetar dan bergoyang lembut jika ada huruf yang belum pas saat kata selesai.'
              : 'Mode klasik tanpa indikasi salah di tengah bermain. Evaluasi murni saat teka-teki rampung.'}
          </p>

          {/* Segmented Control */}
          <div className="flex items-center p-1 rounded-full bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10 gap-1">
            <button
              type="button"
              onClick={() => setErrorFeedbackMode('gentle')}
              className={`flex-1 py-1.5 px-3 rounded-full text-[10px] font-bold transition-all tactile-active cursor-pointer flex items-center justify-center gap-1.5 ${
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
              className={`flex-1 py-1.5 px-3 rounded-full text-[10px] font-bold transition-all tactile-active cursor-pointer flex items-center justify-center gap-1.5 ${
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
      </div>

      {/* 3. Group 2: Penyimpanan & Cadangan Data */}
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

        <p className="text-[9.5px] text-[var(--text-secondary)] leading-tight mb-2.5 px-0.5 relative z-10">
          Seluruh kemajuan dan riwayat tersimpan aman di perangkat Anda. Unduh cadangan JSON sebelum berganti ponsel atau peramban.
        </p>

        {/* 2 Quick Action Buttons: Export & Import */}
        <div className="grid grid-cols-2 gap-2 relative z-10">
          <button
            type="button"
            onClick={handleExportBackup}
            className="py-2.5 px-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center gap-1.5 text-[10.5px] font-bold text-[var(--text-primary)] hover:border-[var(--accent-main)]/30 cursor-pointer tactile-active"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent-main)]" />
            <span>Cadangkan JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center gap-1.5 text-[10.5px] font-bold text-[var(--text-primary)] hover:border-[var(--accent-main)]/30 cursor-pointer tactile-active"
          >
            <Upload className="w-3.5 h-3.5 text-[var(--accent-main)]" />
            <span>Pulihkan JSON</span>
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

      {/* 4. Group 3: Informasi Legal & Pengelolaan Akun */}
      <div
        className="w-full rounded-[24px] p-3.5 relative z-10 overflow-hidden border border-[var(--accent-main)]/20 shadow-xs"
        style={{
          background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
        }}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
        <div className="flex items-center gap-2 mb-2 px-0.5 relative z-10">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-main)]" />
          <span className="text-[12.5px] font-black text-[var(--text-primary)] tracking-tight">
            Legalitas & Pengelolaan Akun
          </span>
        </div>

        {/* Legal Link Rows */}
        <div className="flex flex-col gap-1.5 relative z-10">
          {/* Kebijakan Privasi */}
          <button
            type="button"
            onClick={() => openLegalModal('privacy')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-[var(--accent-main)]/30 transition-all cursor-pointer tactile-active group text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--text-secondary)]">
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[var(--text-primary)] block leading-tight">
                  Kebijakan Privasi
                </span>
                <span className="text-[8.5px] text-[var(--text-secondary)] block">
                  Bebas pelacak & 100% data lokal
                </span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
          </button>

          {/* Syarat Ketentuan */}
          <button
            type="button"
            onClick={() => openLegalModal('terms')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-[var(--accent-main)]/30 transition-all cursor-pointer tactile-active group text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--text-secondary)]">
                <Scale className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[var(--text-primary)] block leading-tight">
                  Ketentuan Layanan
                </span>
                <span className="text-[8.5px] text-[var(--text-secondary)] block">
                  Penggunaan wajar & sportivitas mabar
                </span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
          </button>

          {/* Atribusi KBBI */}
          <button
            type="button"
            onClick={() => openLegalModal('kbbi')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-[var(--accent-main)]/30 transition-all cursor-pointer tactile-active group text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--text-secondary)]">
                <BookOpen className="w-3.5 h-3.5 stroke-[2]" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[var(--text-primary)] block leading-tight">
                  Atribusi Resmi Bahasa (KBBI)
                </span>
                <span className="text-[8.5px] text-[var(--text-secondary)] block">
                  Badan Pengembangan & Pembinaan Bahasa
                </span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
          </button>
        </div>

        {/* Separator before Account Management */}
        <div className="w-full h-px bg-black/5 dark:bg-white/10 my-3 relative z-10" />

        {/* Danger Actions: Reset & Delete */}
        <div className="flex flex-col gap-2 relative z-10">
          {/* Action 1: Atur Ulang Progres Bab */}
          {showResetConfirm ? (
            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                <span className="text-[11.5px] font-black text-[var(--text-primary)]">
                  Atur Ulang Semua Bab?
                </span>
              </div>
              <p className="text-[9.5px] text-[var(--text-secondary)] leading-tight">
                Kemajuan bab dan jawaban kata akan direset ke awal. Profil pemain Anda tetap tersimpan.
              </p>
              <div className="flex gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    resetAllProgress();
                    setShowResetConfirm(false);
                    showToast('Semua kemajuan bab direset.');
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-black/10 dark:bg-white/15 border border-black/10 dark:border-white/20 text-[var(--text-primary)] font-bold text-[10.5px] cursor-pointer tactile-active"
                >
                  Ya, Reset Bab
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="flex-1 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] font-bold text-[10.5px] cursor-pointer tactile-active"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowResetConfirm(true);
                setShowDeleteAccountConfirm(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-[var(--accent-main)]/30 transition-all cursor-pointer tactile-active group text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-[var(--text-secondary)]">
                  <RotateCcw className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-[var(--text-primary)] block leading-tight">
                    Atur Ulang Progres Bab
                  </span>
                  <span className="text-[8.5px] text-[var(--text-secondary)] block">
                    Kembalikan status bab ke kondisi belum dipecahkan
                  </span>
                </div>
              </div>
              <span className="text-[8.5px] font-bold px-2 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                Reset
              </span>
            </button>
          )}

          {/* Action 2: Hapus Akun & Data (Apple 5.1.1v Requirement) */}
          {showDeleteAccountConfirm ? (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
                <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="text-[11.5px] font-black">
                  Hapus Permanen Akun & Semua Data?
                </span>
              </div>
              <p className="text-[9.5px] text-[var(--text-secondary)] leading-tight">
                Sesuai Apple App Store Guideline 5.1.1(v), tindakan ini akan <strong>menghapus total identitas pemain</strong>, nama, foto avatar kustom, bintang, streak, dan seluruh data lokal dari perangkat Anda tanpa dapat dipulihkan.
              </p>
              <div className="flex gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    deleteAccountAndData();
                    setShowDeleteAccountConfirm(false);
                    showToast('Akun & seluruh data berhasil dihapus.');
                  }}
                  className="flex-1 py-1.5 rounded-lg bg-red-500 text-white font-bold text-[10.5px] cursor-pointer tactile-active shadow-sm"
                >
                  Ya, Hapus Permanen
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteAccountConfirm(false)}
                  className="flex-1 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] font-bold text-[10.5px] cursor-pointer tactile-active"
                >
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowDeleteAccountConfirm(true);
                setShowResetConfirm(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:border-red-500/30 transition-all cursor-pointer tactile-active group text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-red-600 dark:text-red-400 block leading-tight">
                    Hapus Akun & Data (Apple 5.1.1v)
                  </span>
                  <span className="text-[8.5px] text-[var(--text-secondary)] block">
                    Purge total identitas & penyimpanan lokal
                  </span>
                </div>
              </div>
              <span className="text-[8.5px] font-bold px-2 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
                Hapus
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 5. Footer Info */}
      <footer className="flex flex-col items-center justify-center gap-1.5 text-[9px] text-[var(--text-secondary)] z-10 relative pt-2 pb-1">
        <div className="flex items-center gap-2">
          <img src="/logo-dark.webp" alt="TTS Bareng" className="w-5 h-5 rounded-md object-contain hidden dark:block" />
          <img src="/logo-light.webp" alt="TTS Bareng" className="w-5 h-5 rounded-md object-contain block dark:hidden" />
          <span className="font-black text-[11px] text-[var(--text-primary)] tracking-tight">TTS Bareng</span>
        </div>
        <button
          type="button"
          onClick={() => openLegalModal('privacy')}
          className="flex items-center gap-1.5 text-[9.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent-main)]" />
          <span>v1.2.0 • Standar KBBI • Kebijakan Privasi & Ketentuan</span>
        </button>
      </footer>
    </div>
  );
};

export default SettingsView;
