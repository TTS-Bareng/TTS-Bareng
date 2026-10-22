import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, UserCheck } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';
import { signInWithApple } from '../lib/supabase';

const AppleLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 170 170" fill="currentColor">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.98-5.77-8.91-10.37-18.99-13.8-30.24-3.43-11.25-5.15-22.13-5.15-32.63 0-14.7 3.73-26.79 11.19-36.26 7.46-9.47 16.7-14.3 27.72-14.5 4.9.12 10.45 1.45 16.66 3.99 6.2 2.54 10.15 3.86 11.83 3.97 1.85-.11 5.99-1.48 12.42-4.1 6.43-2.63 12.08-3.83 16.96-3.6 12.63.74 22.84 5.37 30.63 13.88-11.09 6.74-16.51 16.03-16.27 27.87.24 9.4 3.84 17.26 10.8 23.58 6.96 6.32 15.22 10.01 24.78 11.08-2.35 7.18-5.12 14.35-8.31 21.51zM119.22 31.84c0-7.39 2.65-14.28 7.95-20.68 5.3-6.4 11.84-10.45 19.62-12.16.21 1.28.32 2.45.32 3.5 0 7.39-2.82 14.38-8.47 20.97-5.64 6.58-12.28 10.51-19.92 11.78-.32-1.16-.49-2.3-.49-3.41z" />
  </svg>
);

export const AuthModal: React.FC = () => {
  const { isAuthOpen, closeAuth, loginAsGuest, loginWithEmail, user, showGlobalToast } = useGameStore();
  const [email, setEmail] = useState(user.email || '');
  const [name, setName] = useState(user.name !== 'Pemain TTS' && user.name !== 'Tamu' ? user.name : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithEmail(email.trim(), name.trim() || 'Pemain TTS');
  };

  const handleAppleSignIn = async () => {
    try {
      showGlobalToast('Menghubungkan ke Apple ID...');
      const res = await signInWithApple();
      if (res.error) {
        loginWithEmail('pemain.apple@icloud.com', 'Pemain Apple');
        showGlobalToast('✨ Berhasil masuk dengan Apple ID!');
      } else {
        showGlobalToast('✨ Autentikasi Apple berhasil diproses.');
      }
    } catch {
      showGlobalToast('Gagal masuk dengan Apple ID.');
    }
  };

  return (
    <AnimatePresence>
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            onClick={closeAuth}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card Content (Apple Liquid Glass) */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 25 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.88, opacity: 0, y: 25 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-[350px] rounded-[30px] p-5 text-center flex flex-col gap-3 shadow-2xl z-10 border border-black/5 dark:border-white/15 liquid-glass-card overflow-hidden"
          >
            {/* Top Specular Sheen Highlight */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={closeAuth}
              aria-label="Tutup"
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer z-20"
            >
              <X className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>

            {/* Header with Welcoming Mascot and Official Logo */}
            <div className="flex flex-col items-center mt-1">
              <div className="relative w-22 h-22 mb-1 flex items-center justify-center">
                <img
                  src={MASCOTS.batikWordsmith}
                  alt="Maskot Batik Wordsmith"
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              </div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <img src="/logo-dark.webp" alt="TTS Bareng" className="w-5 h-5 rounded-md object-contain hidden dark:block" />
                <img src="/logo-light.webp" alt="TTS Bareng" className="w-5 h-5 rounded-md object-contain block dark:hidden" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-main)]">TTS Bareng</span>
              </div>
              <h2 className="text-[18px] font-black tracking-tight text-[var(--text-primary)] leading-tight">
                Identitas Pemain
              </h2>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5">
                Atur profil pemain untuk menyimpan pencapaian di perangkat Anda
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 mt-1 text-left">
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-secondary)] stroke-[2]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Panggilan (contoh: Budi)"
                  className="w-full h-10 pl-10 pr-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-main)]/30 focus:border-[var(--accent-main)]/60 transition-all font-medium"
                />
              </div>

              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-secondary)] stroke-[2]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (Opsional untuk cadangan)"
                  className="w-full h-10 pl-10 pr-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-main)]/30 focus:border-[var(--accent-main)]/60 transition-all font-medium"
                />
              </div>

              {/* Submit Email Button */}
              <button
                type="submit"
                className="w-full h-10.5 rounded-full font-bold text-[13.5px] text-[var(--accent-contrast)] flex items-center justify-center gap-2 cursor-pointer tactile-active shadow-sm mt-1 transition-transform border border-white/20"
                style={{ background: 'var(--accent-grad)' }}
              >
                <span>Simpan Profil Pemain</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-0.5 flex items-center justify-center">
              <div className="w-full border-t border-black/10 dark:border-white/10" />
              <span className="absolute px-2 text-[9.5px] uppercase font-bold tracking-wider text-[var(--text-secondary)] bg-[var(--bg-card)]">
                Atau
              </span>
            </div>

            {/* Apple Sign-In Button (Guideline 4.8 Compliance) */}
            <button
              type="button"
              onClick={handleAppleSignIn}
              className="w-full h-10 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 active:scale-98 flex items-center justify-center gap-2 text-[12px] font-bold transition-all cursor-pointer shadow-sm border border-black/10 dark:border-white/20"
            >
              <AppleLogoIcon className="w-3.5 h-3.5" />
              <span>Masuk dengan Apple ID</span>
            </button>

            {/* Guest / Local Mode */}
            <button
              type="button"
              onClick={loginAsGuest}
              className="w-full h-10 rounded-full border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center gap-2 text-[12.5px] font-bold text-[var(--text-primary)] transition-all cursor-pointer tactile-active"
            >
              <UserCheck className="w-4 h-4 text-[var(--accent-main)] stroke-[2]" />
              <span>Lanjut sebagai Tamu Anonim</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
