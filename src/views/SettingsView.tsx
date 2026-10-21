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
  Palette,
  Shield,
  ChevronRight,
  Music,
  Bell,
} from 'lucide-react';
import { useGameStore, type SoundPackKey } from '../store/useGameStore';
import { THEMES, type ThemeKey } from '../lib/themes';
import { soundManager } from '../lib/audio';
import { notificationService } from '../lib/notificationService';

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
    openPlayerIdModal,
    user,
    setSoundPack,
    restartOnboarding,
    notificationsEnabled,
    setNotificationsEnabled,
    streak,
    showGlobalToast,
    ambientEnabled,
    toggleAmbient,
    ambientVolume,
    setAmbientVolume,
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

  const handleToggleNotifications = async () => {
    if (soundEnabled) soundManager.playFocusTick();
    if (hapticEnabled) toggleHaptic();
    if (!notificationsEnabled) {
      const granted = await notificationService.requestPermission();
      if (granted) {
        setNotificationsEnabled(true);
        await notificationService.scheduleDailyRetention(streak);
        showGlobalToast('🔔 Pengingat aktif! Streak dan Daily Rush kamu aman.', 3000);
      } else {
        showGlobalToast('Izin notifikasi belum diaktifkan di sistem perangkat.', 2800);
      }
    } else {
      setNotificationsEnabled(false);
      showGlobalToast('Pengingat notifikasi dinonaktifkan.', 2500);
    }
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
    <div className="w-full flex-1 flex flex-col gap-4 px-3.5 pt-[max(18px,env(safe-area-inset-top))] pb-[110px] select-none overflow-y-auto relative">
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
      <header className="flex items-center gap-2.5 px-0.5 shrink-0 pt-0.5">
        <button
          type="button"
          onClick={() => setCurrentTab('profile')}
          title="Kembali ke Profil"
          aria-label="Kembali ke Profil"
          className="w-8.5 h-8.5 rounded-full liquid-glass-tile border border-black/5 dark:border-white/10 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer tactile-active shadow-xs shrink-0"
        >
          <ChevronLeft className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>
        <div>
          <span className="text-[9.5px] font-black uppercase tracking-wider text-[var(--accent-main)] block leading-none mb-0.5">
            SISTEM & PREFERENSI
          </span>
          <h1 className="text-[18px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
            Pengaturan
          </h1>
        </div>
      </header>

      {/* 2. Group 1: Tema Tampilan (Apple Wallpaper/Theme Picker Style) */}
      <section className="w-full shrink-0 flex flex-col gap-1.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-1">
          TAMPILAN & WARNA
        </span>
        <div
          className="w-full rounded-[22px] p-3.5 border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
          <div className="flex items-center justify-between mb-2 px-0.5 relative z-10">
            <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
              <Palette className="w-3.5 h-3.5 text-[var(--accent-main)]" />
              <span className="text-[12px] font-bold">Tema Aplikasi</span>
            </div>
            <span className="text-[8.5px] font-black px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
              {currentThemeObj.name}
            </span>
          </div>

          {/* Horizontal Swatch Strip - Kotak Rounded Miniature Previews */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar px-0.5 relative z-10">
            {themeList.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id as ThemeKey)}
                  className={`flex flex-col items-center gap-1.5 p-1.5 rounded-[14px] transition-all cursor-pointer tactile-active shrink-0 ${
                    isSelected
                      ? 'bg-[var(--accent-light)] border border-[var(--accent-main)]/35 ring-1.5 ring-[var(--accent-main)]/25 shadow-xs'
                      : 'bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 hover:border-black/15'
                  }`}
                >
                  {/* Kotak Rounded Swatch Tile Preview */}
                  <div
                    className="w-[64px] h-[38px] rounded-[9px] p-1.5 flex flex-col justify-between border border-black/10 dark:border-white/15 relative overflow-hidden shadow-2xs"
                    style={{ backgroundColor: t.previewBg }}
                  >
                    {/* Top Row: Mini accent bar + Selected check badge */}
                    <div className="flex items-center justify-between">
                      <div
                        className="w-4 h-1.5 rounded-full shadow-2xs"
                        style={{ backgroundColor: t.previewAccent }}
                      />
                      {isSelected && (
                        <div
                          className="w-3.5 h-3.5 rounded-[4px] flex items-center justify-center shadow-xs"
                          style={{ backgroundColor: t.previewAccent }}
                        >
                          <Check
                            className="w-2.5 h-2.5 stroke-[3.5]"
                            style={{
                              color: THEMES[t.id as ThemeKey]?.vars['--accent-contrast'] || '#FFFFFF',
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Bottom Row: 3 mini crossword block tiles (kotak rounded) */}
                    <div className="flex items-center gap-1">
                      <div
                        className="w-2.5 h-2.5 rounded-[3px] shadow-2xs"
                        style={{ backgroundColor: t.previewAccent }}
                      />
                      <div
                        className="w-2.5 h-2.5 rounded-[3px] border border-black/15 dark:border-white/20 bg-white/20"
                      />
                      <div
                        className="w-2.5 h-2.5 rounded-[3px] border border-black/15 dark:border-white/20 bg-white/20"
                      />
                    </div>
                  </div>

                  {/* Theme Name */}
                  <span
                    className={`text-[9.5px] truncate max-w-[68px] leading-tight text-center ${
                      isSelected
                        ? 'font-black text-[var(--text-primary)]'
                        : 'font-semibold text-[var(--text-secondary)]'
                    }`}
                  >
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Group 2: Preferensi Permainan (iOS Grouped Inset List) */}
      <section className="w-full shrink-0 flex flex-col gap-1.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-1">
          PENGALAMAN BERMAIN
        </span>
        <div
          className="w-full rounded-[22px] overflow-hidden border border-[var(--accent-main)]/20 shadow-xs relative divide-y divide-black/5 dark:divide-white/10"
          style={{
            background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
          {/* Row 1: Efek Suara */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-7.5 h-7.5 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center shrink-0">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 stroke-[2.2]" />
                ) : (
                  <VolumeX className="w-4 h-4 stroke-[2.2]" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[12px] font-bold text-[var(--text-primary)] block leading-tight">
                  Efek Suara
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block truncate">
                  Ketukan ketik huruf dan nada selesai
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                soundEnabled ? 'bg-[var(--accent-main)]' : 'bg-black/20 dark:bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                  soundEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sub-row: Sound Pack Selector (Only if soundEnabled) */}
          {soundEnabled && (
            <div className="px-3 pb-3 pt-1 border-t border-black/5 dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9.5px] font-black uppercase tracking-wider text-[var(--accent-main)] flex items-center gap-1">
                  <Music className="w-3 h-3" />
                  <span>Paket Karakter Suara Ketikan</span>
                </span>
                <span className="text-[8.5px] font-semibold text-[var(--text-secondary)]">
                  Sentuh untuk uji
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  {
                    id: 'apple_tactile' as SoundPackKey,
                    name: 'Apple Tactile',
                    desc: 'Mekanis iOS',
                    icon: '🍎',
                    play: () => soundManager.playKeyClick(),
                  },
                  {
                    id: 'gamelan_classic' as SoundPackKey,
                    name: 'Gamelan',
                    desc: 'Slendro Lonceng',
                    icon: '🔔',
                    play: () => soundManager.playGamelanBell(),
                  },
                  {
                    id: 'acoustic_nylon' as SoundPackKey,
                    name: 'Akustik Dawai',
                    desc: 'Senar Gitar',
                    icon: '🎸',
                    play: () => soundManager.playAcousticStrum(),
                  },
                ].map((pack) => {
                  const isSelected = (user.soundPack || 'apple_tactile') === pack.id;
                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => {
                        setSoundPack(pack.id);
                        pack.play();
                      }}
                      className={`p-2 rounded-xl flex flex-col items-center text-center gap-1 transition-all cursor-pointer tactile-active border ${
                        isSelected
                          ? 'bg-[var(--accent-light)] border-[var(--accent-main)]/40 ring-1 ring-[var(--accent-main)]/30 shadow-2xs'
                          : 'bg-black/[0.02] dark:bg-white/[0.03] border-black/5 dark:border-white/10 hover:border-black/15'
                      }`}
                    >
                      <span className="text-[14px]">{pack.icon}</span>
                      <span className="text-[10px] font-black text-[var(--text-primary)] leading-tight">
                        {pack.name}
                      </span>
                      <span className="text-[8px] text-[var(--text-secondary)] leading-tight">
                        {pack.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sub-row: Musik Latar Santai (Focus Lo-Fi) */}
          <div className="flex items-center justify-between p-3 border-t border-black/5 dark:border-white/5">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-7.5 h-7.5 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center shrink-0">
                <Music className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-[12px] font-bold text-[var(--text-primary)] block leading-tight">
                  Musik Latar Santai (Focus Lo-Fi)
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block truncate">
                  Dengungan hangat untuk fokus & relaksasi berpikir
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleAmbient}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                ambientEnabled ? 'bg-[var(--accent-main)]' : 'bg-black/20 dark:bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                  ambientEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Sub-row: Ambient Volume Slider */}
          {ambientEnabled && (
            <div className="px-3 pb-3 pt-1 flex items-center gap-3 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/5 dark:border-white/5">
              <span className="text-[9.5px] font-bold text-[var(--text-secondary)] shrink-0">
                Volume: {Math.round(ambientVolume * 100)}%
              </span>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                className="w-full accent-[var(--accent-main)] cursor-pointer h-1.5 rounded-full bg-black/10 dark:bg-white/20"
              />
            </div>
          )}

          {/* Row 2: Getaran Haptik */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-7.5 h-7.5 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-[12px] font-bold text-[var(--text-primary)] block leading-tight">
                  Getaran Haptik
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block truncate">
                  Umpan balik getaran saat mengetik & memilih kotak
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleHaptics}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                hapticEnabled ? 'bg-[var(--accent-main)]' : 'bg-black/20 dark:bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                  hapticEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Row 3: Lompat Kotak Otomatis */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-7.5 h-7.5 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-[12px] font-bold text-[var(--text-primary)] block leading-tight">
                  Lompat Kotak Otomatis
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block truncate">
                  Langsung maju ke kotak kosong berikutnya
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleAutoAdvance}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                autoAdvanceEnabled ? 'bg-[var(--accent-main)]' : 'bg-black/20 dark:bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                  autoAdvanceEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Row 4: Konfirmasi Bantuan Bintang */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-7.5 h-7.5 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center shrink-0">
                <HelpCircle className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-[12px] font-bold text-[var(--text-primary)] block leading-tight">
                  Konfirmasi Bantuan Bintang
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block truncate">
                  Tampilkan dialog persetujuan sebelum memakai bintang
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleConfirmHint}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                confirmHint ? 'bg-[var(--accent-main)]' : 'bg-black/20 dark:bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                  confirmHint ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Row 5: Pengingat Notifikasi & Streak */}
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <div className="w-7.5 h-7.5 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <span className="text-[12px] font-bold text-[var(--text-primary)] block leading-tight">
                  Pengingat Notifikasi & Streak
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block truncate">
                  Teka-teki harian 10:00 & darurat streak 21:00
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggleNotifications}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                notificationsEnabled ? 'bg-[var(--accent-main)]' : 'bg-black/20 dark:bg-white/20'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform ${
                  notificationsEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Row 5: Umpan Balik Kesalahan */}
          <div className="p-3 bg-black/[0.02] dark:bg-white/[0.02]">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                <span className="text-[12px] font-bold">Umpan Balik Kesalahan</span>
              </div>
              <span className="text-[8.5px] font-black px-2 py-0.5 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--accent-main)]">
                {errorFeedbackMode === 'gentle' ? 'Lembut' : 'Purist'}
              </span>
            </div>
            <p className="text-[9px] text-[var(--text-secondary)] leading-tight mb-2">
              {errorFeedbackMode === 'gentle'
                ? 'Kotak bergetar dan bergoyang lembut jika ada huruf yang keliru saat kata selesai.'
                : 'Mode murni tanpa indikasi salah di tengah permainan. Penilaian saat bab tuntas.'}
            </p>
            <div className="flex items-center p-1 rounded-xl bg-black/5 dark:bg-white/10 gap-1 border border-black/5 dark:border-white/10">
              <button
                type="button"
                onClick={() => setErrorFeedbackMode('gentle')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all tactile-active cursor-pointer flex items-center justify-center gap-1.5 ${
                  errorFeedbackMode === 'gentle'
                    ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Sparkles className="w-3 h-3 stroke-[2.2]" />
                <span>Lembut (Gentle)</span>
              </button>
              <button
                type="button"
                onClick={() => setErrorFeedbackMode('purist')}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all tactile-active cursor-pointer flex items-center justify-center gap-1.5 ${
                  errorFeedbackMode === 'purist'
                    ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <ShieldCheck className="w-3 h-3 stroke-[2.2]" />
                <span>Purist (Klasik)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Group 3: Penyimpanan & Cadangan Data */}
      <section className="w-full shrink-0 flex flex-col gap-1.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-1">
          PENYIMPANAN & CADANGAN
        </span>
        <div
          className="w-full rounded-[22px] p-3.5 border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden flex flex-col gap-2.5"
          style={{
            background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-7.5 h-7.5 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center shrink-0">
                <HardDrive className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[12px] font-bold text-[var(--text-primary)] block leading-tight">
                  Penyimpanan Lokal
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block">
                  100% offline di perangkat ini
                </span>
              </div>
            </div>
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[var(--text-secondary)] border border-black/5 dark:border-white/10">
              {storageUsageKB} KB
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 relative z-10">
            <button
              type="button"
              onClick={handleExportBackup}
              className="py-2 px-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center gap-1.5 text-[10.5px] font-bold text-[var(--text-primary)] hover:border-[var(--accent-main)]/30 cursor-pointer tactile-active transition-colors shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent-main)]" />
              <span>Cadangkan JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="py-2 px-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center gap-1.5 text-[10.5px] font-bold text-[var(--text-primary)] hover:border-[var(--accent-main)]/30 cursor-pointer tactile-active transition-colors shadow-2xs"
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
      </section>

      {/* 5. Group 4: Informasi & Legalitas */}
      <section className="w-full shrink-0 flex flex-col gap-1.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-1">
          INFORMASI & LEGALITAS
        </span>
        <div
          className="w-full rounded-[22px] overflow-hidden border border-[var(--accent-main)]/20 shadow-xs relative divide-y divide-black/5 dark:divide-white/10"
          style={{
            background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />
          <button
            type="button"
            onClick={() => openLegalModal('privacy')}
            className="w-full flex items-center justify-between p-3 hover:bg-black/3 dark:hover:bg-white/5 transition-colors cursor-pointer text-left tactile-active group relative z-10"
          >
            <div className="flex items-center gap-3">
              <div className="w-7.5 h-7.5 rounded-xl bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <span className="text-[12px] font-bold text-[var(--text-primary)] block leading-tight">
                  Kebijakan Privasi
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block">
                  Bebas pelacak & tanpa iklan pihak ketiga
                </span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => openLegalModal('terms')}
            className="w-full flex items-center justify-between p-3 hover:bg-black/3 dark:hover:bg-white/5 transition-colors cursor-pointer text-left tactile-active group relative z-10"
          >
            <div className="flex items-center gap-3">
              <div className="w-7.5 h-7.5 rounded-xl bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] flex items-center justify-center shrink-0">
                <Scale className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <span className="text-[12px] font-bold text-[var(--text-primary)] block leading-tight">
                  Ketentuan Layanan
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block">
                  Penggunaan wajar & sportivitas mabar
                </span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
          </button>

          <button
            type="button"
            onClick={() => openLegalModal('kbbi')}
            className="w-full flex items-center justify-between p-3 hover:bg-black/3 dark:hover:bg-white/5 transition-colors cursor-pointer text-left tactile-active group relative z-10"
          >
            <div className="flex items-center gap-3">
              <div className="w-7.5 h-7.5 rounded-xl bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <span className="text-[12px] font-bold text-[var(--text-primary)] block leading-tight">
                  Atribusi Resmi Bahasa (KBBI)
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block">
                  Badan Pengembangan & Pembinaan Bahasa
                </span>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
          </button>
        </div>
      </section>

      {/* 6. Group 5: Pengelolaan Akun & Zona Berbahaya */}
      <section className="w-full shrink-0 flex flex-col gap-1.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-red-500/80 px-1">
          PENGELOLAAN DATA & AKUN
        </span>
        <div
          className="w-full rounded-[22px] overflow-hidden border border-red-500/20 shadow-xs relative divide-y divide-black/5 dark:divide-white/10"
          style={{
            background: 'linear-gradient(135deg, var(--accent-light) 0%, var(--bg-card) 60%, var(--accent-light) 100%)',
          }}
        >
          <div className="absolute top-0 inset-x-0 h-px bg-white/20 pointer-events-none" />

          {/* Kartu Identitas Pemain */}
          <button
            type="button"
            onClick={openPlayerIdModal}
            className="w-full flex items-center justify-between p-3 hover:bg-black/3 dark:hover:bg-white/5 transition-colors cursor-pointer text-left tactile-active group relative z-10"
          >
            <div className="flex items-center gap-3">
              <div className="w-7.5 h-7.5 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/20 flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[12px] font-bold text-[var(--text-primary)] block leading-tight">
                  Kartu Identitas Pemain
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block">
                  Rincian ID ({user.id || 'TTS-8842'}), surel, dan profil
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-black text-[var(--accent-main)] px-2 py-0.5 rounded-md bg-[var(--accent-light)] border border-[var(--accent-main)]/20">
                {user.id || 'TTS-8842'}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
            </div>
          </button>

          {/* Putar Ulang Sambutan & Onboarding */}
          <button
            type="button"
            onClick={restartOnboarding}
            className="w-full flex items-center justify-between p-3 hover:bg-black/3 dark:hover:bg-white/5 transition-colors cursor-pointer text-left tactile-active group relative z-10"
          >
            <div className="flex items-center gap-3">
              <div className="w-7.5 h-7.5 rounded-xl bg-black/5 dark:bg-white/5 text-[var(--accent-main)] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 stroke-[2]" />
              </div>
              <div>
                <span className="text-[12px] font-bold text-[var(--text-primary)] block leading-tight">
                  Putar Ulang Sambutan & Onboarding
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] block">
                  Tinjau alur pendaftaran awal & tutorial
                </span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]" />
          </button>

          {/* Reset Progres Bab */}
          <div className="p-3">
            {showResetConfirm ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                  <RotateCcw className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                  <span className="text-[11.5px] font-black">Atur Ulang Semua Bab?</span>
                </div>
                <p className="text-[9px] text-[var(--text-secondary)] leading-tight">
                  Kemajuan bab dan jawaban kata akan kembali ke awal. Profil pemain Anda tetap aman.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      resetAllProgress();
                      setShowResetConfirm(false);
                      showToast('Semua kemajuan bab direset.');
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-black/10 dark:bg-white/15 text-[var(--text-primary)] font-bold text-[10px] cursor-pointer tactile-active"
                  >
                    Ya, Reset Bab
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] font-bold text-[10px] cursor-pointer tactile-active"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7.5 h-7.5 rounded-xl bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-[12px] font-bold text-[var(--text-primary)] block leading-tight">
                      Atur Ulang Progres Bab
                    </span>
                    <span className="text-[9px] text-[var(--text-secondary)] block">
                      Reset status seluruh bab teka-teki silang
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirm(true);
                    setShowDeleteAccountConfirm(false);
                  }}
                  className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-black/5 dark:border-white/10 transition-colors cursor-pointer tactile-active"
                >
                  Reset
                </button>
              </div>
            )}
          </div>

          {/* Hapus Akun & Data (Apple 5.1.1v) */}
          <div className="p-3">
            {showDeleteAccountConfirm ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-red-500 dark:text-red-400">
                  <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span className="text-[11.5px] font-black">Hapus Permanen Akun & Data?</span>
                </div>
                <p className="text-[9px] text-[var(--text-secondary)] leading-tight">
                  Sesuai Apple App Store Guideline 5.1.1(v), tindakan ini akan <strong>menghapus total identitas pemain</strong>, avatar, bintang, streak, dan riwayat lokal dari perangkat ini tanpa dapat dipulihkan.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      deleteAccountAndData();
                      setShowDeleteAccountConfirm(false);
                      showToast('Akun & seluruh data berhasil dihapus.');
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-red-500 text-white font-bold text-[10px] cursor-pointer tactile-active shadow-xs"
                  >
                    Ya, Hapus Permanen
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteAccountConfirm(false)}
                    className="flex-1 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 text-[var(--text-secondary)] font-bold text-[10px] cursor-pointer tactile-active"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7.5 h-7.5 rounded-xl bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div>
                    <span className="text-[12px] font-bold text-red-600 dark:text-red-400 block leading-tight">
                      Hapus Akun & Data (Apple 5.1.1v)
                    </span>
                    <span className="text-[9px] text-[var(--text-secondary)] block">
                      Purge total identitas & penyimpanan lokal
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteAccountConfirm(true);
                    setShowResetConfirm(false);
                  }}
                  className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 transition-colors cursor-pointer tactile-active"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 7. Footer Info */}
      <footer className="w-full shrink-0 flex flex-col items-center justify-center gap-1.5 text-[9px] text-[var(--text-secondary)] pt-2 pb-2">
        <div className="flex items-center gap-2">
          <img src="/logo-dark.webp" alt="TTS Bareng" className="w-4.5 h-4.5 rounded-md object-contain hidden dark:block" />
          <img src="/logo-light.webp" alt="TTS Bareng" className="w-4.5 h-4.5 rounded-md object-contain block dark:hidden" />
          <span className="font-black text-[10.5px] text-[var(--text-primary)] tracking-tight">TTS Bareng</span>
        </div>
        <button
          type="button"
          onClick={() => openLegalModal('privacy')}
          className="flex items-center gap-1.5 text-[9px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-3 h-3 text-[var(--accent-main)]" />
          <span>v1.2.0 • Standar KBBI • Kebijakan Privasi</span>
        </button>
      </footer>
    </div>
  );
};

export default SettingsView;
