import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Zap,
  Compass,
  Users,
  Flame,
  PencilLine,
  BookOpen,
} from 'lucide-react';
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

interface FeatureSlide {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  mascot: string;
  microWidget: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    pill: string;
  };
}

const FEATURE_SLIDES: FeatureSlide[] = [
  {
    id: 'adventure',
    badge: '500+ Bab • 5.000+ Kosakata',
    badgeColor: 'bg-[var(--accent-light)] text-[var(--accent-main)] border-[var(--accent-main)]/25',
    title: '500+ Bab Siap Dieksplorasi',
    description: 'Jelajahi lebih dari 500 bab teka-teki silang dengan 5.000+ kosakata baku Nusantara.',
    mascot: MASCOTS.puzzleExplorer,
    microWidget: {
      icon: <Compass className="w-4 h-4 text-[var(--accent-main)]" />,
      title: '500+ Bab & 5.000+ Kata',
      subtitle: 'Sabang sampai Merauke siap dimainkan',
      pill: 'Koleksi Terlengkap',
    },
  },
  {
    id: 'mabar',
    badge: 'Duel 1v1 & Turnamen',
    badgeColor: 'bg-[var(--accent-light)] text-[var(--accent-main)] border-[var(--accent-main)]/25',
    title: 'Mabar Bareng Teman',
    description: 'Tanding kecepatan tebak kata 1v1 via Kode Kamar atau turnamen komunitas.',
    mascot: MASCOTS.crosswordDuel,
    microWidget: {
      icon: <Users className="w-4 h-4 text-[var(--accent-main)]" />,
      title: 'Duel 1v1 Sedang Berlangsung',
      subtitle: 'Kamu ⚡ 120 vs Lawan 95 Pts',
      pill: 'Unggul +25',
    },
  },
  {
    id: 'streak',
    badge: 'Tantangan Harian',
    badgeColor: 'bg-[var(--accent-light)] text-[var(--accent-main)] border-[var(--accent-main)]/25',
    title: 'Asah Otak Tiap Hari',
    description: 'Mainkan Daily Rush setiap pagi, pertahankan rentetan api, dan raih bintang.',
    mascot: MASCOTS.cheerfulBookBoy,
    microWidget: {
      icon: <Flame className="w-4 h-4 text-[var(--accent-main)] fill-[var(--accent-main)]" />,
      title: 'Rentetan 7 Hari Aktif',
      subtitle: 'Bonus Harian • +50 Bintang',
      pill: '🔥 Membara',
    },
  },
  {
    id: 'studio',
    badge: 'Studio Kreator',
    badgeColor: 'bg-[var(--accent-light)] text-[var(--accent-main)] border-[var(--accent-main)]/25',
    title: 'Rancang & Bagikan TTS',
    description: 'Susun kata rahasiamu sendiri di kisi lalu bagikan via tautan atau QR Code.',
    mascot: MASCOTS.crosswordBoard,
    microWidget: {
      icon: <PencilLine className="w-4 h-4 text-[var(--accent-main)]" />,
      title: 'Studio TTS Interaktif',
      subtitle: 'Kisi 8x8 • Siap Main',
      pill: 'QR Siap',
    },
  },
  {
    id: 'kbbi',
    badge: 'Kamus KBBI & Budaya',
    badgeColor: 'bg-[var(--accent-light)] text-[var(--accent-main)] border-[var(--accent-main)]/25',
    title: 'Kosakata Resmi KBBI',
    description: 'Perkaya wawasan bahasa Indonesia dengan definisi baku resmi KBBI.',
    mascot: MASCOTS.batikWordsmith,
    microWidget: {
      icon: <BookOpen className="w-4 h-4 text-[var(--accent-main)]" />,
      title: 'Leksikon Terverifikasi',
      subtitle: 'Swakarya: pekerjaan mandiri',
      pill: 'Baku KBBI',
    },
  },
];

export const InitialAuthView: React.FC = () => {
  const { proceedToOnboarding, loginWithEmail, openLegalModal, showGlobalToast } = useGameStore();

  const [activeSlide, setActiveSlide] = useState(0);
  const [sheetMode, setSheetMode] = useState<'choices' | 'email'>('choices');
  const [mode, setMode] = useState<'register' | 'login'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Auto-advance showcase carousel every 4.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % FEATURE_SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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
      proceedToOnboarding({
        email: cleanEmail,
        isGuest: false,
      });
      showGlobalToast('Pendaftaran akun berhasil! Menyiapkan profil...');
    } else {
      // Returning user login: direct restore without forcing avatar onboarding
      loginWithEmail(cleanEmail, '');
      showGlobalToast('Berhasil masuk! Melanjutkan petualangan...');
    }
  };

  const handleGuestSubmit = () => {
    proceedToOnboarding({
      isGuest: true,
    });
    showGlobalToast('Masuk sebagai Tamu. Selamat bermain!');
  };

  const handleForgotPassword = () => {
    showGlobalToast('Tautan pemulihan kata sandi telah dikirim ke surel terdaftar.');
  };

  const currentFeature = FEATURE_SLIDES[activeSlide];

  return (
    <div className="flex-1 w-full flex flex-col justify-between select-none relative overflow-x-hidden overflow-y-auto no-scrollbar">
      {/* Ambient Radial Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-20 w-88 h-88 rounded-full bg-[var(--accent-light)] blur-3xl opacity-40" />
        <div className="absolute top-1/3 -right-20 w-88 h-88 rounded-full bg-[var(--accent-main)]/10 blur-3xl opacity-30" />
      </div>

      {/* TOP HALF: Feature Showcase Carousel */}
      <div className="flex-1 min-h-[300px] max-h-[460px] flex flex-col items-center justify-center px-4 pt-[max(16px,env(safe-area-inset-top))] pb-2 relative z-10 w-full max-w-[420px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFeature.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -40) {
                setActiveSlide((prev) => (prev + 1) % FEATURE_SLIDES.length);
              } else if (info.offset.x > 40) {
                setActiveSlide((prev) => (prev - 1 + FEATURE_SLIDES.length) % FEATURE_SLIDES.length);
              }
            }}
            className="w-full flex flex-col items-center text-center cursor-grab active:cursor-grabbing"
          >
            {/* Mascot Visual Stage */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-1.5 flex items-center justify-center">
              <img
                src={currentFeature.mascot}
                alt={currentFeature.title}
                className="w-full h-full object-contain filter drop-shadow-xl animate-float"
              />
            </div>

            {/* Feature Category Badge */}
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider border mb-1 ${currentFeature.badgeColor}`}
            >
              {currentFeature.badge}
            </span>

            {/* Feature Headline */}
            <h1 className="text-[20px] sm:text-[22px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
              {currentFeature.title}
            </h1>

            {/* Feature Description */}
            <p className="text-[11.5px] text-[var(--text-secondary)] font-medium mt-0.5 leading-snug max-w-[310px]">
              {currentFeature.description}
            </p>

            {/* Interactive Feature Micro-Widget Preview (Inspired by Accrual reference) */}
            <div className="w-full max-w-[320px] mt-2.5 px-3 py-2 rounded-2xl bg-white/70 dark:bg-zinc-800/70 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                  {currentFeature.microWidget.icon}
                </div>
                <div className="text-left">
                  <p className="text-[11.5px] font-bold text-[var(--text-primary)] leading-tight">
                    {currentFeature.microWidget.title}
                  </p>
                  <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight">
                    {currentFeature.microWidget.subtitle}
                  </p>
                </div>
              </div>
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-main)]/10 text-[var(--accent-main)] border border-[var(--accent-main)]/20 shrink-0">
                {currentFeature.microWidget.pill}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center gap-1.5 mt-3">
          {FEATURE_SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveSlide(idx)}
              className={`transition-all duration-300 cursor-pointer ${
                activeSlide === idx
                  ? 'w-5 h-1.5 rounded-full bg-[var(--accent-main)] shadow-xs'
                  : 'w-1.5 h-1.5 rounded-full bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40'
              }`}
              aria-label={`Ke slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* BOTTOM HALF: Liquid Frosted Bottom Sheet */}
      <motion.div
        layout
        className="w-full max-w-[420px] mx-auto z-20 shrink-0 px-1 sm:px-0"
      >
        <div className="relative rounded-t-[32px] sm:rounded-3xl bg-[var(--bg-card)]/95 backdrop-blur-2xl border-t sm:border border-black/10 dark:border-white/10 shadow-2xl p-4 sm:p-5 pt-3 pb-[max(20px,calc(12px+env(safe-area-inset-bottom)))] flex flex-col gap-2.5 overflow-hidden">
          {/* Top Specular Sheen Highlight */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent pointer-events-none" />

          {/* Drag Handle Bar */}
          <div className="w-10 h-1 rounded-full bg-black/15 dark:bg-white/20 mx-auto mb-1" />

          <AnimatePresence mode="wait">
            {sheetMode === 'choices' ? (
              /* State 1: Fast Choices (Apple, Email, Guest) */
              <motion.div
                key="choices-sheet"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-2.5"
              >
                {/* Sheet Header */}
                <div className="text-center">
                  <h2 className="text-[18px] sm:text-[19px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
                    Selamat Datang di TTS Bareng
                  </h2>
                  <p className="text-[11px] text-[var(--text-secondary)] font-medium max-w-[310px] mx-auto leading-snug mt-0.5">
                    Pilih cara masuk untuk menyimpan rekor kata dan mabar teka-teki silang nusantara.
                  </p>
                </div>

                {/* Action 1: Sign in with Apple (HIG Standard) */}
                <button
                  type="button"
                  disabled={isAppleLoading || isGoogleLoading}
                  onClick={handleAppleSignIn}
                  className="w-full h-11.5 rounded-2xl bg-black text-white hover:bg-zinc-900 active:scale-[0.98] flex items-center justify-between px-4 text-[12.5px] font-semibold transition-all cursor-pointer shadow-xs border border-black/10 dark:border-white/20 select-none"
                >
                  <div className="flex items-center gap-3">
                    <AppleLogoIcon className="w-4.5 h-4.5" />
                    <span>Lanjutkan dengan Apple</span>
                  </div>
                  {isAppleLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 stroke-[2.2] text-white/60" />
                  )}
                </button>

                {/* Action 2: Sign in with Google */}
                <button
                  type="button"
                  disabled={isGoogleLoading || isAppleLoading}
                  onClick={handleGoogleSignIn}
                  className="w-full h-11.5 rounded-2xl bg-[var(--bg-card)] hover:bg-black/5 dark:hover:bg-white/10 active:scale-[0.98] flex items-center justify-between px-4 text-[12.5px] font-semibold text-[var(--text-primary)] transition-all cursor-pointer shadow-xs border border-black/10 dark:border-white/15 select-none"
                >
                  <div className="flex items-center gap-3">
                    <GoogleLogoIcon className="w-4.5 h-4.5 shrink-0" />
                    <span>Lanjutkan dengan Google</span>
                  </div>
                  {isGoogleLoading ? (
                    <div className="w-4 h-4 border-2 border-[var(--text-secondary)]/30 border-t-[var(--text-primary)] rounded-full animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4 stroke-[2.2] text-[var(--text-secondary)]" />
                  )}
                </button>

                {/* Action 3: Continue with Email (Expands to Form) */}
                <button
                  type="button"
                  disabled={isGoogleLoading || isAppleLoading}
                  onClick={() => {
                    setMode('register');
                    setSheetMode('email');
                  }}
                  className="w-full h-11.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-[0.98] flex items-center justify-between px-4 text-[12.5px] font-bold text-[var(--text-primary)] transition-all cursor-pointer border border-black/5 dark:border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="w-4.5 h-4.5 text-[var(--accent-main)]" />
                    <span>Lanjutkan dengan Surel</span>
                  </div>
                  <ArrowRight className="w-4 h-4 stroke-[2.2] text-[var(--text-secondary)]" />
                </button>

                {/* Action 3: Guest Mode (Instant Play) */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={handleGuestSubmit}
                    className="w-full h-11.5 rounded-2xl border border-[var(--accent-main)]/30 bg-[var(--accent-main)]/10 hover:bg-[var(--accent-main)]/15 active:scale-[0.98] flex items-center justify-between px-4 text-[12.5px] font-bold text-[var(--text-primary)] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Zap className="w-4.5 h-4.5 text-[var(--accent-main)] fill-[var(--accent-main)]" />
                      <span>Lanjut tanpa Akun (Mode Tamu)</span>
                    </div>
                    <ArrowRight className="w-4 h-4 stroke-[2.2] text-[var(--accent-main)]" />
                  </button>
                  <p className="text-[10px] text-center text-[var(--text-secondary)] font-medium">
                    Data tersimpan di perangkat • Tanpa cadangan cloud
                  </p>
                </div>

                {/* Divider */}
                <div className="relative my-0.5 flex items-center justify-center">
                  <div className="w-full border-t border-black/10 dark:border-white/10" />
                  <span className="absolute px-3 text-[9.5px] uppercase font-bold tracking-wider text-[var(--text-secondary)] bg-[var(--bg-card)] rounded-full">
                    atau
                  </span>
                </div>

                {/* Switch to Login directly */}
                <div className="text-center">
                  <p className="text-[11.5px] text-[var(--text-secondary)] font-medium">
                    Sudah punya akun?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setSheetMode('email');
                      }}
                      className="font-black text-[var(--accent-main)] hover:underline cursor-pointer ml-0.5"
                    >
                      Masuk
                    </button>
                  </p>
                </div>
              </motion.div>
            ) : (
              /* State 2: Inline Email Login & Registration Form */
              <motion.div
                key="email-sheet"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-2.5"
              >
                {/* Back to Choices Button */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSheetMode('choices')}
                    className="flex items-center gap-1.5 text-[11.5px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer py-0.5"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Opsi Lain</span>
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-main)]">
                    {mode === 'login' ? 'Masuk Surel' : 'Daftar Surel'}
                  </span>
                </div>

                {/* Segmented Tab Switcher (Masuk / Daftar) */}
                <div className="flex p-1 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/5 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className={`flex-1 py-1.5 text-[12px] font-black rounded-xl transition-all cursor-pointer ${
                      mode === 'login'
                        ? 'bg-white dark:bg-zinc-800 text-[var(--text-primary)] shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className={`flex-1 py-1.5 text-[12px] font-black rounded-xl transition-all cursor-pointer ${
                      mode === 'register'
                        ? 'bg-white dark:bg-zinc-800 text-[var(--text-primary)] shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Daftar Baru
                  </button>
                </div>

                {/* Email Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                  {/* Email Field */}
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-secondary)] stroke-[2]" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Alamat Surel / Email"
                      className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-black/10 dark:border-white/15 bg-white/60 dark:bg-zinc-800/60 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-main)]/30 focus:border-[var(--accent-main)]/70 transition-all font-medium"
                    />
                  </div>

                  {/* Password Field */}
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-secondary)] stroke-[2]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Kata Sandi (Min. 6 Karakter)"
                      className="w-full h-10 pl-10 pr-10 rounded-xl border border-black/10 dark:border-white/15 bg-white/60 dark:bg-zinc-800/60 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-main)]/30 focus:border-[var(--accent-main)]/70 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      className="absolute right-3 top-2.5 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 stroke-[2]" /> : <Eye className="w-4 h-4 stroke-[2]" />}
                    </button>
                  </div>

                  {/* Confirm Password (Register Only) */}
                  <AnimatePresence>
                    {mode === 'register' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: -4 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                        exit={{ opacity: 0, height: 0, marginTop: -4 }}
                        transition={{ duration: 0.18 }}
                        className="relative overflow-hidden"
                      >
                        <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[var(--text-secondary)] stroke-[2]" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Ulangi Kata Sandi"
                          className="w-full h-10 pl-10 pr-10 rounded-xl border border-black/10 dark:border-white/15 bg-white/60 dark:bg-zinc-800/60 text-[13px] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-main)]/30 focus:border-[var(--accent-main)]/70 transition-all font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                          className="absolute right-3 top-2.5 p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
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

                  {/* Forgot Password Link (Login Mode) */}
                  {mode === 'login' && (
                    <div className="flex justify-end -mt-0.5 px-0.5">
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
                    className="w-full h-10.5 rounded-xl font-black text-[13px] text-[var(--accent-contrast)] flex items-center justify-center gap-2 cursor-pointer tactile-active shadow-md mt-0.5 transition-transform border border-white/20"
                    style={{ background: 'var(--accent-grad)' }}
                  >
                    <span>{mode === 'register' ? 'Daftar Akun Baru' : 'Masuk Sekarang'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legal Footer (Terms of Service & Privacy Policy - Guaranteed 1 Line) */}
          <div className="text-center pt-1 text-[9.5px] text-[var(--text-secondary)] whitespace-nowrap overflow-hidden text-ellipsis px-1">
            Menyetujui{' '}
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
        </div>
      </motion.div>
    </div>
  );
};

export default InitialAuthView;


