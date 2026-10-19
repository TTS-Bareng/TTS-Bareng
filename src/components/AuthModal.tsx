import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, User, UserCheck } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';

export const AuthModal: React.FC = () => {
  const { isAuthOpen, closeAuth, loginAsGuest, loginWithEmail, user } = useGameStore();
  const [email, setEmail] = useState(user.email || '');
  const [name, setName] = useState(user.name !== 'Pemain TTS' && user.name !== 'Tamu' ? user.name : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginWithEmail(email.trim(), name.trim() || 'Pemain TTS');
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
