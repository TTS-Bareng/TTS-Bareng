import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shuffle,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useGameStore } from "../store/useGameStore";
import { MASCOTS } from "../assets/maskots";

const INDONESIAN_NAMES = [
  "Arka",
  "Laras",
  "Satria",
  "Kirana",
  "Bayu",
  "Putri",
  "Danu",
  "Sekar",
  "Galang",
  "Citra",
  "Rangga",
  "Nadia",
  "Bima",
  "Tari",
  "Arya",
  "Melati",
  "Fajar",
  "Gita",
  "Reza",
  "Intan",
];

const ONBOARDING_AVATARS = [
  {
    id: "pals",
    src: MASCOTS.indonesianPuzzlePals,
    name: "Sahabat",
    role: "Kolaboratif",
  },
  {
    id: "champion",
    src: MASCOTS.crosswordChampion,
    name: "Juara",
    role: "Kompetitif",
  },
  {
    id: "batik",
    src: MASCOTS.batikWordsmith,
    name: "Pujangga",
    role: "Ahli Kata",
  },
  {
    id: "kid",
    src: MASCOTS.indonesianPuzzleKid,
    name: "Petualang",
    role: "Eksploratif",
  },
  { id: "girl", src: MASCOTS.crosswordGirl, name: "Cendekia", role: "Taktis" },
  {
    id: "scholar",
    src: MASCOTS.puzzleScholar,
    name: "Begawan",
    role: "Master Teka-Teki",
  },
];

export const OnboardingView: React.FC = () => {
  const { user, completeOnboarding, showGlobalToast } = useGameStore();

  const [activeIndex, setActiveIndex] = useState(() => {
    const idx = ONBOARDING_AVATARS.findIndex(
      (av) => av.src === (user.avatar || MASCOTS.crosswordChampion),
    );
    return idx !== -1 ? idx : 1;
  });

  const [name, setName] = useState(
    user.name && user.name !== "Pemain TTS" && user.name !== "Tamu"
      ? user.name
      : "Arka",
  );

  const currentAvatar = ONBOARDING_AVATARS[activeIndex];

  const handlePrevAvatar = () => {
    setActiveIndex((prev) =>
      prev === 0 ? ONBOARDING_AVATARS.length - 1 : prev - 1,
    );
  };

  const handleNextAvatar = () => {
    setActiveIndex((prev) =>
      prev === ONBOARDING_AVATARS.length - 1 ? 0 : prev + 1,
    );
  };

  const handleRandomizeName = () => {
    const random =
      INDONESIAN_NAMES[Math.floor(Math.random() * INDONESIAN_NAMES.length)];
    setName(random);
    showGlobalToast(`Nama diacak: ${random}`);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || "Pemain TTS";
    completeOnboarding(finalName, currentAvatar.src);
    showGlobalToast(`Selamat datang, ${finalName}!`);
  };

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col justify-between px-6 pt-[max(20px,env(safe-area-inset-top))] pb-[max(24px,env(safe-area-inset-bottom))] relative overflow-hidden select-none">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-white/[0.07] blur-[100px]" />
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full bg-white/[0.04] blur-[80px]" />
      </div>

      {/* Top Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[360px] mx-auto flex flex-col items-center text-center relative z-10 pt-2"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 backdrop-blur-md mb-3">
          <Sparkles className="w-3.5 h-3.5 text-white/80" />
          <span className="text-[11px] font-medium tracking-wide text-white/80">
            Identitas Pemain
          </span>
        </div>
        <h1 className="text-[26px] font-bold tracking-tight text-white">
          Pilih Karaktermu
        </h1>
        <p className="text-[13px] text-white/50 font-normal mt-1 leading-snug">
          Tentukan maskot dan nama panggilan untuk memulai
        </p>
      </motion.header>

      {/* Hero Showcase Center Stage */}
      <div className="w-full max-w-[360px] mx-auto flex flex-col items-center my-auto py-2 relative z-10">
        <div className="relative w-full flex items-center justify-center">
          {/* Nav Chevrons */}
          <button
            type="button"
            onClick={handlePrevAvatar}
            aria-label="Karakter sebelumnya"
            className="absolute left-1 z-20 w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNextAvatar}
            aria-label="Karakter berikutnya"
            className="absolute right-1 z-20 w-9 h-9 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-90"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Hero 3D Avatar Display */}
          <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
            {/* Radial Backlight */}
            <div className="absolute inset-0 rounded-full bg-white/[0.06] blur-2xl transform scale-90" />

            <AnimatePresence mode="wait">
              <motion.div
                key={currentAvatar.id}
                initial={{ opacity: 0, scale: 0.85, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -10 }}
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
                className="w-full h-full flex flex-col items-center justify-center relative z-10"
              >
                <img
                  src={currentAvatar.src}
                  alt={currentAvatar.name}
                  className="w-full h-full object-contain filter drop-shadow-[0_16px_24px_rgba(0,0,0,0.6)]"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Character Title & Badge */}
        <div className="text-center mt-3 mb-5">
          <h2 className="text-[17px] font-bold text-white tracking-tight">
            {currentAvatar.name}
          </h2>
          <span className="text-[12px] font-medium text-white/40">
            {currentAvatar.role}
          </span>
        </div>

        {/* Miniature Avatar Selectors (Apple-style Segmented Thumbnails) */}
        <div className="flex items-center gap-2 p-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl">
          {ONBOARDING_AVATARS.map((av, index) => {
            const isSelected = activeIndex === index;
            return (
              <button
                key={av.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative w-9 h-9 rounded-full overflow-hidden transition-all duration-200 cursor-pointer flex items-center justify-center ${
                  isSelected
                    ? "ring-2 ring-white scale-110 bg-white/10"
                    : "opacity-40 hover:opacity-75 scale-95"
                }`}
              >
                <img
                  src={av.src}
                  alt={av.name}
                  className="w-7 h-7 object-contain"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Floating Controls: Input, CTA & Notes */}
      <div className="w-full max-w-[360px] mx-auto flex flex-col gap-3 relative z-10">
        {/* Apple-style Integrated Input Bar */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ketik nama pemain..."
            className="w-full h-13 pl-4 pr-24 rounded-2xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-[14px] font-medium backdrop-blur-xl focus:outline-none focus:ring-1 focus:ring-white/40 focus:border-white/30 transition-all"
          />

          {/* Inline Shuffle Button */}
          <button
            type="button"
            onClick={handleRandomizeName}
            className="absolute right-1.5 h-10 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-[12px] font-semibold flex items-center gap-1.5 backdrop-blur-sm active:scale-95 transition-all cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Acak</span>
          </button>
        </div>

        {/* High-Contrast Primary CTA Button */}
        <button
          type="button"
          onClick={handleFinish}
          className="w-full h-13 rounded-2xl bg-white text-neutral-950 font-bold text-[14px] flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(255,255,255,0.12)] hover:bg-neutral-100 active:scale-[0.98] transition-all cursor-pointer"
        >
          <span>Mulai Petualangan</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Discreet Reassurance Footer */}
        <footer className="flex items-center justify-center gap-1.5 text-[11px] text-white/40 text-center font-medium pt-1 pb-0.5">
          <ShieldCheck className="w-3.5 h-3.5 text-white/40 shrink-0" />
          <span>Nama dan avatar dapat diubah kapan saja di profil</span>
        </footer>
      </div>
    </div>
  );
};

export default OnboardingView;
