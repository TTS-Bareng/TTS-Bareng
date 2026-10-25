import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';
import { signInWithApple, signInWithGoogle, resetPasswordForEmail } from '../lib/supabase';

const AppleLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.4c.64-.81 1.07-1.93.95-3.05-1 .04-2.18.66-2.82 1.41-.57.66-1.06 1.76-.93 2.85 1.12.09 2.23-.55 2.8-1.21Z" />
  </svg>
);

const GoogleLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
    />
  </svg>
);

type ScreenState = 'welcome' | 'register' | 'login';

export const InitialAuthView: React.FC = () => {
  const { proceedToOnboarding, loginWithEmail, openLegalModal, showGlobalToast } = useGameStore();

  const [screen, setScreen] = useState<ScreenState>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleAppleSignIn = async () => {
    if (isAppleLoading || isGoogleLoading) return;
    try {
      setIsAppleLoading(true);
      showGlobalToast('Menghubungkan ke Apple ID...');
      const res = await signInWithApple();
      if (res?.error) {
        showGlobalToast(res.error);
        setIsAppleLoading(false);
      }
    } catch (err: any) {
      showGlobalToast(err?.message || 'Gagal memulai Sign in with Apple.');
      setIsAppleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading || isAppleLoading) return;
    try {
      setIsGoogleLoading(true);
      showGlobalToast('Menghubungkan ke Akun Google...');
      const res = await signInWithGoogle();
      if (res?.error) {
        showGlobalToast(res.error);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      showGlobalToast(err?.message || 'Gagal memulai Sign in with Google.');
      setIsGoogleLoading(false);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      showGlobalToast('Silakan masukkan alamat surel Anda.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      showGlobalToast('Format alamat surel tidak valid.');
      return;
    }
    if (!password || password.length < 6) {
      showGlobalToast('Kata sandi minimal 6 karakter.');
      return;
    }

    proceedToOnboarding({
      email: cleanEmail,
      name: cleanEmail.split('@')[0],
      isGuest: false,
    });
    showGlobalToast('Pendaftaran akun berhasil! Menyiapkan profil...');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      showGlobalToast('Silakan masukkan alamat surel Anda.');
      return;
    }
    if (!password) {
      showGlobalToast('Silakan masukkan kata sandi.');
      return;
    }

    loginWithEmail(cleanEmail, cleanEmail.split('@')[0]);
    showGlobalToast('Berhasil masuk! Melanjutkan petualangan...');
  };

  const handleGuestSubmit = () => {
    proceedToOnboarding({
      name: 'Tamu',
      isGuest: true,
    });
    showGlobalToast('✨ Masuk sebagai Tamu (Mode Offline)');
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showGlobalToast('Ketikkan alamat surel Anda terlebih dahulu.');
      return;
    }
    showGlobalToast('Mengirim tautan reset kata sandi...');
    const res = await resetPasswordForEmail(cleanEmail);
    if (res.success) {
      showGlobalToast(`Tautan reset sandi dikirim ke ${cleanEmail}`);
    } else {
      showGlobalToast(res.error || 'Gagal mengirim email reset kata sandi.');
    }
  };

  return (
    <div className="flex-1 w-full min-h-[100dvh] flex flex-col justify-between select-none relative overflow-x-hidden overflow-y-auto no-scrollbar">
      {/* Ambient Radial Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-20 w-88 h-88 rounded-full bg-[var(--accent-light)] blur-3xl opacity-40" />
        <div className="absolute top-1/3 -right-20 w-88 h-88 rounded-full bg-[var(--accent-main)]/10 blur-3xl opacity-30" />
      </div>

      <AnimatePresence mode="wait">
        {/* ===================================================================
            SCREEN 1: WELCOME SCREEN (Ayo Mulai, Masuk, Mode Tamu, Legal 1 Line)
            =================================================================== */}
        {screen === 'welcome' && (
          <motion.div
            key="screen-welcome"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="flex-1 w-full max-w-[420px] mx-auto flex flex-col justify-between px-5 pt-[max(20px,calc(12px+env(safe-area-inset-top)))] pb-[max(20px,calc(12px+env(safe-area-inset-bottom)))] z-10"
          >
            {/* Center Visual & Welcoming Text */}
            <div className="flex-1 flex flex-col items-center justify-center text-center my-auto pt-4">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-3 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[var(--accent-light)] blur-2xl opacity-60 pointer-events-none" />
                <img
                  src={MASCOTS.puzzleExplorer}
                  alt="Maskot TTS Bareng"
                  className="w-full h-full object-contain filter drop-shadow-xl animate-float relative z-10"
                />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/25 mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-main)]">
                  Teka-Teki Silang Nusantara
                </span>
              </div>

              <h1 className="text-[23px] sm:text-[25px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
                Selamat Datang di TTS Bareng
              </h1>
              <p className="text-[12px] text-[var(--text-secondary)] font-medium max-w-[320px] mx-auto leading-relaxed mt-1.5">
                Jelajahi 500+ bab kata baku KBBI, duel kata 1v1 bareng sahabat, dan asah otakmu setiap hari.
              </p>
            </div>

            {/* Bottom Actions Container */}
            <div className="w-full flex flex-col items-center gap-2.5 pt-4 pb-2">
              {/* Button 1: Ayo mulai petualangan */}
              <button
                type="button"
                onClick={() => setScreen('register')}
                className="w-full h-12 rounded-2xl font-black text-[13px] text-[var(--accent-contrast)] flex items-center justify-center gap-2 cursor-pointer tactile-active shadow-md transition-transform border border-white/20"
                style={{ background: 'var(--accent-grad)' }}
              >
                <span>Ayo Mulai Petualangan</span>
                <ArrowRight className="w-4.5 h-4.5 stroke-[2.4]" />
              </button>

              {/* Button 2: Sudah punya akun? masuk */}
              <button
                type="button"
                onClick={() => setScreen('login')}
                className="w-full h-11.5 rounded-2xl bg-[var(--bg-card)] hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98] flex items-center justify-center gap-2 text-[12.5px] font-bold text-[var(--text-primary)] transition-all cursor-pointer border border-black/10 dark:border-white/15 shadow-xs"
              >
                <span>Sudah punya akun? Masuk</span>
              </button>

              {/* Link: Coba masuk mode tamu (teks polos tanpa kartu) */}
              <button
                type="button"
                onClick={handleGuestSubmit}
                className="text-[11.5px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1 cursor-pointer"
              >
                Coba masuk mode tamu
              </button>
            </div>

            {/* Bottom Legal Notice - Strictly 1 Line */}
            <div className="text-center pt-2 text-[9.5px] text-[var(--text-secondary)] whitespace-nowrap overflow-hidden text-ellipsis px-1">
              Dengan melanjutkan, berarti menyetujui{' '}
              <button
                type="button"
                onClick={() => openLegalModal('terms')}
                className="underline text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer font-medium"
              >
                Ketentuan Layanan
              </button>{' '}
              &{' '}
              <button
                type="button"
                onClick={() => openLegalModal('privacy')}
                className="underline text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer font-medium"
              >
                Kebijakan Privasi
              </button>{' '}
              TTS Bareng
            </div>
          </motion.div>
        )}

        {/* ===================================================================
            SCREEN 2: REGISTER SCREEN (Daftar dengan Apple/Google, Email, Sandi)
            (Tanpa teks mode tamu & tanpa keterangan privasi)
            =================================================================== */}
        {screen === 'register' && (
          <motion.div
            key="screen-register"
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.25 }}
            className="flex-1 w-full max-w-[420px] mx-auto flex flex-col justify-start px-5 pt-[max(20px,calc(10px+env(safe-area-inset-top)))] pb-[max(20px,calc(12px+env(safe-area-inset-bottom)))] z-10 overflow-y-auto no-scrollbar"
          >
            {/* Header with Back Button */}
            <div className="flex items-center gap-3 mb-5">
              <button
                type="button"
                onClick={() => setScreen('welcome')}
                aria-label="Kembali"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all cursor-pointer text-[var(--text-primary)] border border-black/5 dark:border-white/10"
              >
                <ArrowLeft className="w-4.5 h-4.5 stroke-[2.2]" />
              </button>
              <div>
                <h2 className="text-[19px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
                  Daftar Akun Baru
                </h2>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-none mt-0.5">
                  Mulai petualangan kata dan simpan rekor bermainmu
                </p>
              </div>
            </div>

            {/* Social Action Buttons */}
            <div className="flex flex-col gap-2.5">
              {/* Button: Daftar dengan Apple */}
              <button
                type="button"
                disabled={isAppleLoading || isGoogleLoading}
                onClick={handleAppleSignIn}
                className="w-full h-11.5 rounded-2xl bg-black text-white hover:bg-zinc-900 active:scale-[0.98] flex items-center justify-between px-4 text-[12.5px] font-semibold transition-all cursor-pointer shadow-xs border border-black/10 dark:border-white/20 select-none"
              >
                <div className="flex items-center gap-3">
                  <AppleLogoIcon className="w-4.5 h-4.5" />
                  <span>Daftar dengan Apple</span>
                </div>
                {isAppleLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 stroke-[2.2] text-white/60" />
                )}
              </button>

              {/* Button: Daftar dengan Google */}
              <button
                type="button"
                disabled={isGoogleLoading || isAppleLoading}
                onClick={handleGoogleSignIn}
                className="w-full h-11.5 rounded-2xl bg-[var(--bg-card)] hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98] flex items-center justify-between px-4 text-[12.5px] font-semibold text-[var(--text-primary)] transition-all cursor-pointer shadow-xs border border-black/10 dark:border-white/15 select-none"
              >
                <div className="flex items-center gap-3">
                  <GoogleLogoIcon className="w-4.5 h-4.5 shrink-0" />
                  <span>Daftar dengan Google</span>
                </div>
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-[var(--text-secondary)]/30 border-t-[var(--text-primary)] rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 stroke-[2.2] text-[var(--text-secondary)]" />
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-4.5 flex items-center justify-center">
              <div className="w-full border-t border-black/10 dark:border-white/10" />
              <span className="absolute px-3 text-[9.5px] uppercase font-bold tracking-wider text-[var(--text-secondary)] bg-[var(--bg-card)] rounded-full">
                atau daftar dengan surel
              </span>
            </div>

            {/* Form: Email & Password */}
            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3">
              {/* Input Email */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-1">
                  Alamat Surel
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-secondary)] stroke-[2]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    autoComplete="email"
                    className="w-full h-10.5 pl-10 pr-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[12.5px] font-semibold text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-main)]/30 transition-all"
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-1">
                  Kata Sandi (Min. 6 Karakter)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-secondary)] stroke-[2]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className="w-full h-10.5 pl-10 pr-10 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[12.5px] font-semibold text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-main)]/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Button: Daftar */}
              <button
                type="submit"
                className="w-full h-11.5 rounded-2xl font-black text-[13px] text-[var(--accent-contrast)] flex items-center justify-center gap-2 cursor-pointer tactile-active shadow-md mt-2 transition-transform border border-white/20"
                style={{ background: 'var(--accent-grad)' }}
              >
                <span>Daftar Akun Baru</span>
                <ArrowRight className="w-4.5 h-4.5 stroke-[2.4]" />
              </button>
            </form>
          </motion.div>
        )}

        {/* ===================================================================
            SCREEN 3: LOGIN SCREEN (Selamat Datang Kembali, Apple/Google, Lupa Pass)
            (Tanpa teks mode tamu & tanpa keterangan privasi)
            =================================================================== */}
        {screen === 'login' && (
          <motion.div
            key="screen-login"
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 25 }}
            transition={{ duration: 0.25 }}
            className="flex-1 w-full max-w-[420px] mx-auto flex flex-col justify-start px-5 pt-[max(20px,calc(10px+env(safe-area-inset-top)))] pb-[max(20px,calc(12px+env(safe-area-inset-bottom)))] z-10 overflow-y-auto no-scrollbar"
          >
            {/* Header with Back Button */}
            <div className="flex items-center gap-3 mb-5">
              <button
                type="button"
                onClick={() => setScreen('welcome')}
                aria-label="Kembali"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all cursor-pointer text-[var(--text-primary)] border border-black/5 dark:border-white/10"
              >
                <ArrowLeft className="w-4.5 h-4.5 stroke-[2.2]" />
              </button>
              <div>
                <h2 className="text-[19px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
                  Selamat Datang Kembali
                </h2>
                <p className="text-[11px] text-[var(--text-secondary)] font-medium leading-none mt-0.5">
                  Masuk untuk menyinkronkan rekor bab dan bintangmu
                </p>
              </div>
            </div>

            {/* Social Action Buttons */}
            <div className="flex flex-col gap-2.5">
              {/* Button: Masuk dengan Apple */}
              <button
                type="button"
                disabled={isAppleLoading || isGoogleLoading}
                onClick={handleAppleSignIn}
                className="w-full h-11.5 rounded-2xl bg-black text-white hover:bg-zinc-900 active:scale-[0.98] flex items-center justify-between px-4 text-[12.5px] font-semibold transition-all cursor-pointer shadow-xs border border-black/10 dark:border-white/20 select-none"
              >
                <div className="flex items-center gap-3">
                  <AppleLogoIcon className="w-4.5 h-4.5" />
                  <span>Masuk dengan Apple</span>
                </div>
                {isAppleLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 stroke-[2.2] text-white/60" />
                )}
              </button>

              {/* Button: Masuk dengan Google */}
              <button
                type="button"
                disabled={isGoogleLoading || isAppleLoading}
                onClick={handleGoogleSignIn}
                className="w-full h-11.5 rounded-2xl bg-[var(--bg-card)] hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98] flex items-center justify-between px-4 text-[12.5px] font-semibold text-[var(--text-primary)] transition-all cursor-pointer shadow-xs border border-black/10 dark:border-white/15 select-none"
              >
                <div className="flex items-center gap-3">
                  <GoogleLogoIcon className="w-4.5 h-4.5 shrink-0" />
                  <span>Masuk dengan Google</span>
                </div>
                {isGoogleLoading ? (
                  <div className="w-4 h-4 border-2 border-[var(--text-secondary)]/30 border-t-[var(--text-primary)] rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4 stroke-[2.2] text-[var(--text-secondary)]" />
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-4.5 flex items-center justify-center">
              <div className="w-full border-t border-black/10 dark:border-white/10" />
              <span className="absolute px-3 text-[9.5px] uppercase font-bold tracking-wider text-[var(--text-secondary)] bg-[var(--bg-card)] rounded-full">
                atau masuk dengan surel
              </span>
            </div>

            {/* Form: Email & Password */}
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
              {/* Input Email */}
              <div className="flex flex-col gap-1 text-left">
                <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-1">
                  Alamat Surel
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-secondary)] stroke-[2]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    autoComplete="email"
                    className="w-full h-10.5 pl-10 pr-3 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[12.5px] font-semibold text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-main)]/30 transition-all"
                  />
                </div>
              </div>

              {/* Input Password with "Lupa password?" in top right */}
              <div className="flex flex-col gap-1 text-left">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10.5px] font-bold text-[var(--accent-main)] hover:underline cursor-pointer"
                  >
                    Lupa password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-secondary)] stroke-[2]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full h-10.5 pl-10 pr-10 rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[12.5px] font-semibold text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-main)]/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Button: Masuk */}
              <button
                type="submit"
                className="w-full h-11.5 rounded-2xl font-black text-[13px] text-[var(--accent-contrast)] flex items-center justify-center gap-2 cursor-pointer tactile-active shadow-md mt-2 transition-transform border border-white/20"
                style={{ background: 'var(--accent-grad)' }}
              >
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4.5 h-4.5 stroke-[2.4]" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InitialAuthView;
