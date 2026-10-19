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
