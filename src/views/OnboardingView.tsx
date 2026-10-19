import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  Users,
  WifiOff,
  Dices,
  Sparkles,
  Check,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';

const INDONESIAN_NAMES = [
  'Arka',
  'Laras',
  'Satria',
  'Kirana',
  'Bayu',
  'Putri',
  'Danu',
  'Sekar',
  'Galang',
  'Citra',
  'Rangga',
  'Nadia',
  'Bima',
  'Tari',
  'Arya',
  'Melati',
  'Fajar',
  'Gita',
  'Reza',
  'Intan',
];

const ONBOARDING_AVATARS = [
  { id: 'pals', src: MASCOTS.indonesianPuzzlePals, name: 'Sahabat' },
  { id: 'champion', src: MASCOTS.crosswordChampion, name: 'Juara' },
  { id: 'batik', src: MASCOTS.batikWordsmith, name: 'Pujangga' },
  { id: 'kid', src: MASCOTS.indonesianPuzzleKid, name: 'Petualang' },
  { id: 'girl', src: MASCOTS.crosswordGirl, name: 'Cendekia' },
  { id: 'scholar', src: MASCOTS.puzzleScholar, name: 'Begawan' },
];

export const OnboardingView: React.FC = () => {
  const { user, completeOnboarding, showGlobalToast } = useGameStore();

  const [name, setName] = useState(
    user.name && user.name !== 'Pemain TTS' && user.name !== 'Tamu' ? user.name : 'Arka'
  );
  const [selectedAvatar, setSelectedAvatar] = useState(
    user.avatar || MASCOTS.indonesianPuzzlePals
  );

  const handleRandomizeName = () => {
    const random = INDONESIAN_NAMES[Math.floor(Math.random() * INDONESIAN_NAMES.length)];
    setName(random);
    showGlobalToast(`Nama diacak: ${random}`);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || 'Pemain TTS';
    completeOnboarding(finalName, selectedAvatar);
    showGlobalToast(`Selamat datang, ${finalName}!`);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-between px-5 pt-8 pb-6 select-none relative overflow-y-auto no-scrollbar">
      {/* Background Ambient Glow & Specular Canvas */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-[var(--accent-light)] blur-3xl opacity-60" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-[var(--accent-main)]/10 blur-3xl opacity-40" />
      </div>

      {/* Top Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[360px] flex flex-col items-center text-center relative z-10 pt-2"
      >
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full liquid-glass-tile border border-black/5 dark:border-white/10 shadow-xs mb-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-main)]" />
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-main)]">
            PERSIAPAN PETUALANGAN
          </span>
        </div>
        <h1 className="text-[23px] sm:text-[25px] font-black text-[var(--text-primary)] tracking-tight leading-tight">
          Kenali Gaya Bermain Anda
        </h1>
        <p className="text-[11.5px] text-[var(--text-secondary)] font-medium mt-1 leading-snug max-w-[310px]">
          Pilih avatar maskot 3D resmi dan tentukan nama identitas pemain Anda.
        </p>
      </motion.header>

      {/* Center Setup: Seamless Canvas (No Boxed Card!) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="w-full max-w-[360px] flex flex-col gap-3.5 my-auto py-2 relative z-10"
      >
        {/* 3 Highlight Bento Chips */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-[18px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex flex-col items-center text-center gap-1 shadow-2xs">
            <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-[10.5px] font-black text-[var(--text-primary)] leading-tight">
              220 Bab
            </span>
            <span className="text-[8.5px] text-[var(--text-secondary)] leading-tight">
              12 Alam
            </span>
          </div>

          <div className="p-2.5 rounded-[18px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex flex-col items-center text-center gap-1 shadow-2xs">
            <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center">
              <Users className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-[10.5px] font-black text-[var(--text-primary)] leading-tight">
              Mabar Live
            </span>
            <span className="text-[8.5px] text-[var(--text-secondary)] leading-tight">
              1 Papan WA
            </span>
          </div>

          <div className="p-2.5 rounded-[18px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 flex flex-col items-center text-center gap-1 shadow-2xs">
            <div className="w-7 h-7 rounded-xl bg-[var(--accent-light)] text-[var(--accent-main)] flex items-center justify-center">
              <WifiOff className="w-3.5 h-3.5 stroke-[2.2]" />
            </div>
            <span className="text-[10.5px] font-black text-[var(--text-primary)] leading-tight">
              Offline
            </span>
            <span className="text-[8.5px] text-[var(--text-secondary)] leading-tight">
              Hemat Kuota
            </span>
          </div>
        </div>

        {/* Section 1: Choose Avatar Strip */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-main)]">
              1. PILIH AVATAR MASKOT 3D
            </span>
            <span className="text-[9px] font-bold text-[var(--text-secondary)]">
              Karakter Resmi
            </span>
          </div>

          <div className="grid grid-cols-6 gap-1.5 pt-0.5">
            {ONBOARDING_AVATARS.map((av) => {
              const isSelected = selectedAvatar === av.src;
              return (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setSelectedAvatar(av.src)}
                  className={`relative p-1 rounded-2xl flex flex-col items-center transition-all cursor-pointer tactile-active ${
                    isSelected
                      ? 'bg-[var(--accent-light)] border-2 border-[var(--accent-main)] shadow-xs scale-105'
                      : 'border border-black/10 dark:border-white/10 hover:border-black/20 bg-black/[0.02] dark:bg-white/[0.03]'
                  }`}
                >
                  <div className="w-10.5 h-10.5 rounded-xl overflow-hidden flex items-center justify-center">
                    <img
                      src={av.src}
                      alt={av.name}
                      className="w-full h-full object-contain filter drop-shadow-xs"
                    />
                  </div>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] flex items-center justify-center shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  )}
                  <span className="text-[8px] font-bold text-[var(--text-secondary)] truncate max-w-full mt-0.5">
                    {av.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 2: Choose Nickname */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-main)]">
              2. NAMA PANGGILAN
            </span>
            <span className="text-[9px] font-bold text-[var(--text-secondary)]">
              Maks. 20 Karakter
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={name}
                maxLength={20}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama Anda"
                className="w-full h-11 px-4 rounded-2xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 text-[13.5px] font-bold text-[var(--text-primary)] placeholder-[var(--text-secondary)]/60 focus:outline-hidden focus:ring-2 focus:ring-[var(--accent-main)]/30 focus:border-[var(--accent-main)]/60 transition-all"
              />
            </div>

            {/* Dices Randomizer Button */}
            <button
              type="button"
              onClick={handleRandomizeName}
              title="Acak Nama Keren"
              className="h-11 px-3.5 rounded-2xl border border-[var(--accent-main)]/30 bg-[var(--accent-light)] text-[var(--accent-main)] hover:bg-[var(--accent-main)] hover:text-[var(--accent-contrast)] transition-colors flex items-center gap-1.5 font-bold text-[11px] cursor-pointer tactile-active shrink-0 shadow-2xs"
            >
              <Dices className="w-4 h-4" />
              <span>Acak</span>
            </button>
          </div>
        </div>

        {/* Submit to Home Button */}
        <button
          type="button"
          onClick={handleFinish}
          className="w-full h-11.5 rounded-full font-black text-[13px] text-[var(--accent-contrast)] flex items-center justify-center gap-2 cursor-pointer tactile-active shadow-md mt-2 transition-transform border border-white/20"
          style={{ background: 'var(--accent-grad)' }}
        >
          <span>Mulai Petualangan</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </motion.div>

      {/* Footer System Info */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="w-full max-w-[360px] flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-secondary)] text-center relative z-10 pt-2"
      >
        <Shield className="w-3.5 h-3.5 text-[var(--accent-main)]" />
        <span>Nama dan avatar dapat Anda ganti kapan saja di menu Profil</span>
      </motion.footer>
    </div>
  );
};

export default OnboardingView;
