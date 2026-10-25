import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, UserCheck } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';
import { signInWithApple, signInWithGoogle } from '../lib/supabase';

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

export const AuthModal: React.FC = () => {
  const { isAuthOpen, closeAuth, loginAsGuest, loginWithEmail, user, showGlobalToast } = useGameStore();
  const [email, setEmail] = useState(user.email || '');
  const [name, setName] = useState(user.name !== 'Pemain TTS' && user.name !== 'Tamu' ? user.name : '');
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithEmail(email.trim(), name.trim() || 'Pemain TTS');
  };

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
      showGlobalToast(err?.message || 'Gagal masuk dengan Apple ID.');
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
      showGlobalToast(err?.message || 'Gagal masuk dengan Akun Google.');
      setIsGoogleLoading(false);
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

            {/* Apple Sign-In Button (Official Apple HIG Standard) */}
            <button
              type="button"
              disabled={isAppleLoading || isGoogleLoading}
              onClick={handleAppleSignIn}
              className="w-full h-10.5 rounded-full bg-black text-white hover:bg-zinc-900 active:scale-[0.98] flex items-center justify-center gap-2 text-[12px] font-semibold transition-all cursor-pointer shadow-sm border border-black/10 dark:border-white/20 select-none"
            >
              {isAppleLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Menghubungkan...</span>
                </>
              ) : (
                <>
                  <AppleLogoIcon className="w-4 h-4 -mt-0.5" />
                  <span>Masuk dengan Apple ID</span>
                </>
              )}
            </button>

            {/* Google Sign-In Button */}
            <button
              type="button"
              disabled={isGoogleLoading || isAppleLoading}
              onClick={handleGoogleSignIn}
              className="w-full h-10.5 rounded-full bg-[var(--bg-card)] hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98] flex items-center justify-center gap-2 text-[12px] font-semibold text-[var(--text-primary)] transition-all cursor-pointer shadow-sm border border-black/10 dark:border-white/15 select-none"
            >
              {isGoogleLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[var(--text-secondary)]/30 border-t-[var(--text-primary)] rounded-full animate-spin" />
                  <span>Menghubungkan...</span>
                </>
              ) : (
                <>
                  <GoogleLogoIcon className="w-4 h-4 shrink-0" />
                  <span>Masuk dengan Akun Google</span>
                </>
              )}
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
