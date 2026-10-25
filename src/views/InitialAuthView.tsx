import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Compass,
  Users,
  Flame,
  PencilLine,
  BookOpen,
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

type ScreenState = 'welcome' | 'register' | 'login';

export const InitialAuthView: React.FC = () => {
  const { proceedToOnboarding, loginWithEmail, openLegalModal, showGlobalToast } = useGameStore();

  const [screen, setScreen] = useState<ScreenState>('welcome');
  const [activeSlide, setActiveSlide] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResetPromptOpen, setIsResetPromptOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

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

  const handleGuestSubmit = () => {
    proceedToOnboarding({
      isGuest: true,
    });
    showGlobalToast('Masuk sebagai Tamu. Selamat bermain!');
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
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      showGlobalToast('Format alamat surel tidak valid.');
      return;
    }
    if (!password || password.length < 6) {
      showGlobalToast('Kata sandi minimal 6 karakter.');
      return;
    }

    loginWithEmail(cleanEmail, '');
    showGlobalToast('Berhasil masuk! Melanjutkan petualangan...');
  };

  const handleSendResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = resetEmail.trim() || email.trim();
    if (!clean || !clean.includes('@') || !clean.includes('.')) {
      showGlobalToast('Masukkan alamat surel yang valid untuk reset password.');
      return;
    }
    setIsSendingReset(true);
    const res = await resetPasswordForEmail(clean);
    setIsSendingReset(false);
    if (res.success) {
      showGlobalToast('Tautan reset password berhasil dikirim ke surel Anda.');
      setIsResetPromptOpen(false);
    } else {
      showGlobalToast(res.error || 'Gagal mengirim email reset password.');
    }
  };

  const currentFeature = FEATURE_SLIDES[activeSlide];

  return (
    <div className="flex-1 w-full min-h-screen flex flex-col justify-between select-none relative overflow-x-hidden overflow-y-auto no-scrollbar">
      {/* Ambient Radial Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-20 w-88 h-88 rounded-full bg-[var(--accent-light)] blur-3xl opacity-40" />
        <div className="absolute top-1/3 -right-20 w-88 h-88 rounded-full bg-[var(--accent-main)]/10 blur-3xl opacity-30" />
      </div>

      {/* =========================================================================
          TOP HALF: Feature Showcase Carousel (Always present & interactive)
          ========================================================================= */}
      <div className="flex-1 min-h-[260px] max-h-[440px] flex flex-col items-center justify-center px-4 pt-[max(16px,env(safe-area-inset-top))] pb-3 relative z-10 w-full max-w-[420px] mx-auto">
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
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 mb-1 flex items-center justify-center">
              <img
                src={currentFeature.mascot}
                alt={currentFeature.title}
                className="w-full h-full object-contain filter drop-shadow-xl animate-float"
              />
            </div>

            {/* Feature Category Badge */}
            <span
              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border mb-1 ${currentFeature.badgeColor}`}
            >
              {currentFeature.badge}
            </span>

            {/* Feature Headline */}
            <h1 className="text-[19px] sm:text-[21px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
              {currentFeature.title}
            </h1>

            {/* Feature Description */}
            <p className="text-[11px] text-[var(--text-secondary)] font-medium mt-0.5 leading-snug max-w-[310px]">
              {currentFeature.description}
            </p>

            {/* Micro-Widget Feature Preview Card */}
            <div className="w-full max-w-[320px] mt-2 px-3 py-1.5 rounded-2xl bg-white/70 dark:bg-zinc-800/70 border border-black/5 dark:border-white/10 backdrop-blur-md shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0">
                  {currentFeature.microWidget.icon}
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold text-[var(--text-primary)] leading-tight">
                    {currentFeature.microWidget.title}
                  </p>
                  <p className="text-[9.5px] text-[var(--text-secondary)] font-medium leading-tight">
                    {currentFeature.microWidget.subtitle}
                  </p>
                </div>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-main)]/10 text-[var(--accent-main)] border border-[var(--accent-main)]/20 shrink-0">
                {currentFeature.microWidget.pill}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Pagination Dots */}
        <div className="flex items-center gap-1.5 mt-2.5">
          {FEATURE_SLIDES.map((_, idx) => (
            <button
              key={idx}
              type="button"
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

      {/* =========================================================================
          BOTTOM HALF: Liquid Frosted Bottom Sheet (No drag handle '-')
          ========================================================================= */}
      <motion.div
        layout
        className="w-full max-w-[420px] mx-auto z-20 shrink-0 px-2 sm:px-0"
      >
        <div className="relative rounded-t-[32px] sm:rounded-3xl bg-[var(--bg-card)]/95 backdrop-blur-2xl border-t sm:border border-black/10 dark:border-white/10 shadow-2xl p-4 sm:p-5 pt-4 pb-[max(20px,calc(12px+env(safe-area-inset-bottom)))] flex flex-col gap-3 overflow-hidden">
          {/* Top Specular Sheen Highlight */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent pointer-events-none" />

          {/* AnimatePresence for the 3 clean views */}
          <AnimatePresence mode="wait">
            {/* ---------------------------------------------------------------
                1. LAYAR WELCOME (SAMBUTAN)
                --------------------------------------------------------------- */}
            {screen === 'welcome' && (
              <motion.div
                key="screen-welcome"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-3"
              >
                {/* Greeting Headline */}
                <div className="text-center pt-0.5">
                  <h2 className="text-[18px] sm:text-[19px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
                    Selamat Datang di TTS Bareng
                  </h2>
                  <p className="text-[11px] text-[var(--text-secondary)] font-medium max-w-[310px] mx-auto leading-snug mt-0.5">
                    Pilih cara masuk untuk menyimpan rekor kata dan mabar teka-teki silang nusantara.
                  </p>
                </div>

                {/* Primary Button: Ayo Mulai Petualangan */}
                <button
                  type="button"
                  onClick={() => setScreen('register')}
                  className="w-full h-11.5 rounded-2xl bg-[var(--accent-main)] text-[var(--accent-contrast)] hover:opacity-95 active:scale-[0.98] flex items-center justify-between px-4 text-[13px] font-black transition-all cursor-pointer shadow-md select-none"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4.5 h-4.5 fill-current" />
                    <span>Ayo Mulai Petualangan</span>
                  </div>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>

                {/* Secondary Button: Sudah punya akun? Masuk */}
                <button
                  type="button"
                  onClick={() => setScreen('login')}
                  className="w-full h-11 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-[0.98] border border-black/10 dark:border-white/15 text-[var(--text-primary)] flex items-center justify-between px-4 text-[12.5px] font-bold transition-all cursor-pointer select-none"
                >
                  <span>Sudah punya akun? Masuk</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2] text-[var(--text-secondary)]" />
                </button>

                {/* Plain Text Link: Coba masuk mode tamu (No card/box) */}
                <button
                  type="button"
                  onClick={handleGuestSubmit}
                  className="text-center text-[11.5px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-95 transition-all cursor-pointer py-0.5"
                >
                  Coba masuk mode tamu
                </button>

                {/* Single-line Legal Footnote at very bottom */}
                <p className="text-[9.5px] text-center text-[var(--text-secondary)] leading-tight whitespace-nowrap overflow-hidden text-ellipsis px-1 pt-0.5">
                  Dengan melanjutkan, Anda menyetujui{' '}
                  <button
                    type="button"
                    onClick={() => openLegalModal('terms')}
                    className="underline font-bold text-[var(--text-primary)] cursor-pointer"
                  >
                    Ketentuan
                  </button>{' '}
                  &{' '}
                  <button
                    type="button"
                    onClick={() => openLegalModal('privacy')}
                    className="underline font-bold text-[var(--text-primary)] cursor-pointer"
                  >
                    Kebijakan Privasi
                  </button>
                </p>
              </motion.div>
            )}

            {/* ---------------------------------------------------------------
                2. LAYAR DAFTAR AKUN BARU ("AYO MULAI")
                --------------------------------------------------------------- */}
            {screen === 'register' && (
              <motion.div
                key="screen-register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-2.5"
              >
                {/* Header: Back Button + Title */}
                <div className="flex items-center gap-2.5 pb-0.5">
                  <button
                    type="button"
                    onClick={() => setScreen('welcome')}
                    aria-label="Kembali"
                    className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 flex items-center justify-center text-[var(--text-primary)] cursor-pointer tactile-active transition-all shrink-0 border border-black/5 dark:border-white/10"
                  >
                    <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
                  </button>
                  <div className="min-w-0">
                    <h2 className="text-[16px] sm:text-[17px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
                      Daftar Akun Baru
                    </h2>
                    <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight truncate">
                      Mulai petualangan kata dan simpan rekor bermainmu
                    </p>
                  </div>
                </div>

                {/* Social Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={isAppleLoading || isGoogleLoading}
                    onClick={handleAppleSignIn}
                    className="w-full h-10.5 rounded-2xl bg-black text-white hover:bg-zinc-900 active:scale-[0.98] flex items-center justify-between px-3.5 text-[12px] font-semibold transition-all cursor-pointer shadow-xs border border-black/10 dark:border-white/20 select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <AppleLogoIcon className="w-4 h-4" />
                      <span>Daftar dengan Apple</span>
                    </div>
                    {isAppleLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.2] text-white/60" />
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isGoogleLoading || isAppleLoading}
                    onClick={handleGoogleSignIn}
                    className="w-full h-10.5 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.98] flex items-center justify-between px-3.5 text-[12px] font-semibold transition-all cursor-pointer shadow-xs border border-black/10 dark:border-white/15 select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <GoogleLogoIcon className="w-4 h-4" />
                      <span>Daftar dengan Google</span>
                    </div>
                    {isGoogleLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-[var(--text-secondary)]/30 border-t-[var(--accent-main)] rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.2] text-[var(--text-secondary)]" />
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-2.5 my-0.5">
                  <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
                  <span className="text-[8.5px] font-black tracking-wider uppercase text-[var(--text-secondary)]">
                    atau daftar dengan surel
                  </span>
                  <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
                </div>

                {/* Registration Form */}
                <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-0.5">
                      Alamat Surel
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full h-10 rounded-xl pl-9 pr-3 text-[12px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-main)] transition-all font-medium placeholder:text-[var(--text-secondary)]/50"
                        autoCapitalize="none"
                        autoCorrect="off"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-0.5">
                      Kata Sandi (Min. 6 Karakter)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full h-10 rounded-xl pl-9 pr-9 text-[12px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-main)] transition-all font-medium placeholder:text-[var(--text-secondary)]/50"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full h-11 rounded-2xl bg-[var(--accent-main)] text-[var(--accent-contrast)] hover:opacity-95 active:scale-[0.98] font-black text-[12.5px] flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all mt-1"
                  >
                    <span>Daftar Akun Baru</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* ---------------------------------------------------------------
                3. LAYAR MASUK ("SELAMAT DATANG KEMBALI")
                --------------------------------------------------------------- */}
            {screen === 'login' && (
              <motion.div
                key="screen-login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="flex flex-col gap-2.5"
              >
                {/* Header: Back Button + Title */}
                <div className="flex items-center gap-2.5 pb-0.5">
                  <button
                    type="button"
                    onClick={() => setScreen('welcome')}
                    aria-label="Kembali"
                    className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 flex items-center justify-center text-[var(--text-primary)] cursor-pointer tactile-active transition-all shrink-0 border border-black/5 dark:border-white/10"
                  >
                    <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
                  </button>
                  <div className="min-w-0">
                    <h2 className="text-[16px] sm:text-[17px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
                      Selamat Datang Kembali
                    </h2>
                    <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-tight truncate">
                      Masuk untuk melanjutkan petualangan katamu
                    </p>
                  </div>
                </div>

                {/* Social Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={isAppleLoading || isGoogleLoading}
                    onClick={handleAppleSignIn}
                    className="w-full h-10.5 rounded-2xl bg-black text-white hover:bg-zinc-900 active:scale-[0.98] flex items-center justify-between px-3.5 text-[12px] font-semibold transition-all cursor-pointer shadow-xs border border-black/10 dark:border-white/20 select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <AppleLogoIcon className="w-4 h-4" />
                      <span>Masuk dengan Apple</span>
                    </div>
                    {isAppleLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.2] text-white/60" />
                    )}
                  </button>

                  <button
                    type="button"
                    disabled={isGoogleLoading || isAppleLoading}
                    onClick={handleGoogleSignIn}
                    className="w-full h-10.5 rounded-2xl bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.98] flex items-center justify-between px-3.5 text-[12px] font-semibold transition-all cursor-pointer shadow-xs border border-black/10 dark:border-white/15 select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      <GoogleLogoIcon className="w-4 h-4" />
                      <span>Masuk dengan Google</span>
                    </div>
                    {isGoogleLoading ? (
                      <div className="w-3.5 h-3.5 border-2 border-[var(--text-secondary)]/30 border-t-[var(--accent-main)] rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 stroke-[2.2] text-[var(--text-secondary)]" />
                    )}
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-2.5 my-0.5">
                  <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
                  <span className="text-[8.5px] font-black tracking-wider uppercase text-[var(--text-secondary)]">
                    atau masuk dengan surel
                  </span>
                  <div className="flex-1 h-px bg-black/10 dark:bg-white/10" />
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)] px-0.5">
                      Alamat Surel
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full h-10 rounded-xl pl-9 pr-3 text-[12px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-main)] transition-all font-medium placeholder:text-[var(--text-secondary)]/50"
                        autoCapitalize="none"
                        autoCorrect="off"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between px-0.5">
                      <label className="text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
                        Kata Sandi
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(email);
                          setIsResetPromptOpen(true);
                        }}
                        className="text-[9.5px] font-bold text-[var(--accent-main)] hover:underline cursor-pointer"
                      >
                        Lupa password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                        className="w-full h-10 rounded-xl pl-9 pr-9 text-[12px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-main)] transition-all font-medium placeholder:text-[var(--text-secondary)]/50"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer p-1"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full h-11 rounded-2xl bg-[var(--accent-main)] text-[var(--accent-contrast)] hover:opacity-95 active:scale-[0.98] font-black text-[12.5px] flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all mt-1"
                  >
                    <span>Masuk Sekarang</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Forgot Password Reset Dialog Modal */}
      <AnimatePresence>
        {isResetPromptOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-3xl bg-[var(--bg-card)] border border-black/10 dark:border-white/10 p-5 shadow-2xl flex flex-col gap-3"
            >
              <h3 className="text-[16px] font-black text-[var(--text-primary)]">
                Pemulihan Kata Sandi
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Masukkan alamat surel Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi.
              </p>
              <form onSubmit={handleSendResetPassword} className="flex flex-col gap-3 mt-1">
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full h-10 rounded-xl px-3 text-[12px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-main)] font-medium"
                  required
                />
                <div className="flex items-center gap-2 justify-end mt-1">
                  <button
                    type="button"
                    onClick={() => setIsResetPromptOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-[11px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="px-4 py-2 rounded-xl text-[11px] font-black bg-[var(--accent-main)] text-[var(--accent-contrast)] hover:opacity-95 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isSendingReset ? 'Mengirim...' : 'Kirim Tautan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
