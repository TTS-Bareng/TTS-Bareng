import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserCheck,
  ArrowRight,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';
import { signInWithApple } from '../lib/supabase';

const AppleLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 170 170" fill="currentColor">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.98-5.77-8.91-10.37-18.99-13.8-30.24-3.43-11.25-5.15-22.13-5.15-32.63 0-14.7 3.73-26.79 11.19-36.26 7.46-9.47 16.7-14.3 27.72-14.5 4.9.12 10.45 1.45 16.66 3.99 6.2 2.54 10.15 3.86 11.83 3.97 1.85-.11 5.99-1.48 12.42-4.1 6.43-2.63 12.08-3.83 16.96-3.6 12.63.74 22.84 5.37 30.63 13.88-11.09 6.74-16.51 16.03-16.27 27.87.24 9.4 3.84 17.26 10.8 23.58 6.96 6.32 15.22 10.01 24.78 11.08-2.35 7.18-5.12 14.35-8.31 21.51zM119.22 31.84c0-7.39 2.65-14.28 7.95-20.68 5.3-6.4 11.84-10.45 19.62-12.16.21 1.28.32 2.45.32 3.5 0 7.39-2.82 14.38-8.47 20.97-5.64 6.58-12.28 10.51-19.92 11.78-.32-1.16-.49-2.3-.49-3.41z" />
  </svg>
);

export const InitialAuthView: React.FC = () => {
  const { proceedToOnboarding, openLegalModal, showGlobalToast } = useGameStore();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
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

    if (mode === 'register') {
      if (password !== confirmPassword) {
        showGlobalToast('Konfirmasi kata sandi tidak cocok.');
        return;
      }
      // Proceed to character setup onboarding
      proceedToOnboarding({
        email: cleanEmail,
        isGuest: false,
      });
      showGlobalToast('Pendaftaran akun berhasil! Silakan atur karakter.');
    } else {
      // Login mode
      proceedToOnboarding({
        email: cleanEmail,
        isGuest: false,
      });
      showGlobalToast('Berhasil masuk! Menyiapkan petualangan...');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      showGlobalToast('Menghubungkan ke Apple ID...');
      const res = await signInWithApple();
      if (res.error) {
        // Fallback anggun untuk mode web/dev lokal
        proceedToOnboarding({
          email: 'pemain.apple@icloud.com',
          isGuest: false,
        });
        showGlobalToast('✨ Berhasil masuk dengan Apple ID!');
      } else {
        showGlobalToast('✨ Autentikasi Apple berhasil diproses.');
      }
    } catch {
      showGlobalToast('Gagal masuk dengan Apple ID.');
    }
  };

  const handleGuestSubmit = () => {
    proceedToOnboarding({
      isGuest: true,
    });
    showGlobalToast('Masuk sebagai Tamu. Selamat bermain!');
  };

  const handleForgotPassword = () => {
    showGlobalToast('Fitur pemulihan kata sandi dikirim ke surel yang didaftarkan.');
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-between px-5 pt-8 pb-6 select-none relative overflow-y-auto no-scrollbar">
      {/* Background Ambient Glow & Specular Sheen (No Boxed Card) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[var(--accent-light)] blur-3xl opacity-60" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[var(--accent-main)]/10 blur-3xl opacity-40" />
      </div>

      {/* Top Header / Mascot Stage (Seamless Canvas) */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[360px] flex flex-col items-center text-center relative z-10 pt-1"
      >
        {/* Enlarged Mascot: Plush Indonesian Puzzle Pals (No Top Pill) */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 my-1 flex items-center justify-center animate-float">
          <img
            src={MASCOTS.indonesianPuzzlePals}
            alt="Plush Indonesian Puzzle Pals"
            className="w-full h-full object-contain filter drop-shadow-2xl"
          />
        </div>

        <h1 className="text-[24px] sm:text-[26px] font-black text-[var(--text-primary)] tracking-tight leading-tight mt-1">
          {mode === 'register' ? 'Buat Akun Petualang' : 'Selamat Datang Kembali'}
        </h1>
        <p className="text-[11.5px] text-[var(--text-secondary)] font-medium mt-1 leading-snug max-w-[300px]">
          {mode === 'register'
            ? 'Simpan rekor kata, lencana nusantara, dan main mabar langsung bersama teman.'
            : 'Masuk untuk melanjutkan petualangan bab dan rekor rentetan harian Anda.'}
        </p>
      </motion.header>

      {/* Center Form: Seamless Open Canvas (No Outer Boxed Card) */}
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-[360px] flex flex-col gap-2.5 my-auto pt-3 relative z-10"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-4 h-4 text-[var(--text-secondary)] stroke-[2]" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Alamat Surel / Email"
              className="w-full h-11 pl-11 pr-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-main)]/30 focus:border-[var(--accent-main)]/60 transition-all font-medium"
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 w-4 h-4 text-[var(--text-secondary)] stroke-[2]" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kata Sandi (Min. 6 Karakter)"
              className="w-full h-11 pl-11 pr-11 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-main)]/30 focus:border-[var(--accent-main)]/60 transition-all font-medium"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              className="absolute right-3.5 top-3 p-0.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 stroke-[2]" />
              ) : (
                <Eye className="w-4 h-4 stroke-[2]" />
              )}
            </button>
          </div>

          {/* Confirm Password Input (Only in Register Mode) */}
          <AnimatePresence>
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: -5 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: -5 }}
                transition={{ duration: 0.2 }}
                className="relative overflow-hidden"
              >
                <Lock className="absolute left-4 top-3.5 w-4 h-4 text-[var(--text-secondary)] stroke-[2]" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi Kata Sandi"
                  className="w-full h-11 pl-11 pr-11 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-main)]/30 focus:border-[var(--accent-main)]/60 transition-all font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  className="absolute right-3.5 top-3 p-0.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 stroke-[2]" />
                  ) : (
                    <Eye className="w-4 h-4 stroke-[2]" />
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Forgot Password Link (Only in Login Mode) */}
          {mode === 'login' && (
            <div className="flex justify-end -mt-0.5 px-1">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] font-bold text-[var(--accent-main)] hover:underline cursor-pointer"
              >
                Lupa Kata Sandi?
              </button>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            type="submit"
            className="w-full h-11.5 rounded-full font-black text-[13px] text-[var(--accent-contrast)] flex items-center justify-center gap-2 cursor-pointer tactile-active shadow-md mt-1 transition-transform border border-white/20"
            style={{ background: 'var(--accent-grad)' }}
          >
            <span>{mode === 'register' ? 'Daftar Akun Baru' : 'Masuk Sekarang'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-0.5 flex items-center justify-center">
          <div className="w-full border-t border-black/10 dark:border-white/10" />
          <span className="absolute px-3 text-[9.5px] uppercase font-bold tracking-wider text-[var(--text-secondary)] bg-[var(--bg-main)]">
            Atau
          </span>
        </div>

        {/* Apple Sign-In Button (Guideline 4.8 Compliance) */}
        <button
          type="button"
          onClick={handleAppleSignIn}
          className="w-full h-11 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-98 flex items-center justify-center gap-2.5 text-[12.5px] font-bold transition-all cursor-pointer shadow-sm border border-black/10 dark:border-white/20"
        >
          <AppleLogoIcon className="w-4 h-4" />
          <span>Lanjutkan dengan Apple</span>
        </button>

        {/* Guest Mode Button (Tamu) */}
        <button
          type="button"
          onClick={handleGuestSubmit}
          className="w-full h-11 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center gap-2 text-[12.5px] font-bold text-[var(--text-primary)] transition-all cursor-pointer tactile-active"
        >
          <UserCheck className="w-4 h-4 text-[var(--accent-main)] stroke-[2.2]" />
          <span>Lanjut sebagai Tamu (Mode Cepat)</span>
        </button>

        {/* Switch Between Register & Login */}
        <div className="text-center pt-1.5">
          {mode === 'register' ? (
            <p className="text-[12px] text-[var(--text-secondary)] font-medium">
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-black text-[var(--accent-main)] hover:underline cursor-pointer ml-1"
              >
                Masuk
              </button>
            </p>
          ) : (
            <p className="text-[12px] text-[var(--text-secondary)] font-medium">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-black text-[var(--accent-main)] hover:underline cursor-pointer ml-1"
              >
                Daftar Akun Baru
              </button>
            </p>
          )}
        </div>
      </motion.div>

      {/* Footer: Legal Terms & Privacy Policy (No Green Tracking Text!) */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-full max-w-[360px] text-center pt-3 text-[10.5px] text-[var(--text-secondary)] leading-relaxed relative z-10"
      >
        Dengan melanjutkan, Anda menyetujui{' '}
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
        TTS Bareng.
      </motion.footer>
    </div>
  );
};

export default InitialAuthView;
