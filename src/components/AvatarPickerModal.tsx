import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Upload, Check, User } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';

const MASCOT_AVATARS = [
  { id: 'champion', name: 'Sang Juara', src: MASCOTS.crosswordChampion },
  { id: 'board', name: 'Papan Teka-Teki', src: MASCOTS.crosswordBoard },
  { id: 'duel', name: 'Duel Kosakata', src: MASCOTS.crosswordDuel },
  { id: 'walker', name: 'Tech Walker', src: MASCOTS.techSavvyWalker },
  { id: 'explorer', name: 'Penjelajah Ceria', src: MASCOTS.puzzleExplorer },
  { id: 'girlSticker', name: 'Gadis Silang', src: MASCOTS.crosswordGirlSticker },
  { id: 'wordsmith', name: 'Pujangga Batik', src: MASCOTS.batikWordsmith },
  { id: 'puzzleKid', name: 'Anak Nusantara', src: MASCOTS.indonesianPuzzleKid },
  { id: 'friends', name: 'Kawan Mabar', src: MASCOTS.friendsPlaying },
  { id: 'gamer', name: 'Gamer Teka-Teki', src: MASCOTS.puzzleGamer },
  { id: 'thinker', name: 'Sang Pemikir', src: MASCOTS.crosswordThinker },
  { id: 'cheerful', name: 'Ceria Belajar', src: MASCOTS.cheerfulBookBoy },
];

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({ isOpen, onClose }) => {
  const { user, setUser } = useGameStore();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    user.avatar || MASCOTS.crosswordChampion
  );
  const [name, setName] = useState<string>(user.name || 'Pemain TTS');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle uploading custom photo and resizing it to 128x128 for lightweight localStorage persistence
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 128;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Center crop image to square
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedAvatar(dataUrl);
      };
      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setUser({
      ...user,
      name: name.trim() || user.name || 'Pemain TTS',
      avatar: selectedAvatar,
    });
    onClose();
  };

  const isImageAvatar = (avatarStr: string) =>
    Boolean(
      avatarStr &&
      (avatarStr.startsWith('data:') ||
       avatarStr.startsWith('http') ||
       avatarStr.startsWith('/') ||
       avatarStr.includes('.webp') ||
       avatarStr.includes('.png'))
    );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-[340px] rounded-[28px] border border-[var(--border-card)] p-5 select-none shadow-2xl liquid-glass-card overflow-hidden"
          >
            {/* Top Specular Sheen */}
            <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="absolute top-4 right-4 w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>

            {/* Header */}
            <div className="text-center mb-4">
              <h3 className="text-[16px] font-black tracking-tight text-[var(--text-primary)]">
                Ganti Foto Profil
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                Pilih karakter resmi atau unggah foto sendiri
              </p>
            </div>

            {/* Avatar Preview & Upload Trigger */}
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 rounded-full liquid-glass-card border-2 border-[var(--accent-main)]/50 flex items-center justify-center overflow-hidden shadow-md bg-black/5 dark:bg-white/5 p-1">
                  {isImageAvatar(selectedAvatar) ? (
                    <img
                      src={selectedAvatar}
                      alt="Avatar Terpilih"
                      className="w-full h-full object-contain filter drop-shadow-sm"
                    />
                  ) : (
                    <img
                      src={MASCOTS.crosswordChampion}
                      alt="Avatar Terpilih"
                      className="w-full h-full object-contain filter drop-shadow-sm"
                    />
                  )}
                </div>

                {/* Camera upload badge */}
                <div className="absolute bottom-0 right-0 w-6.5 h-6.5 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] flex items-center justify-center shadow-md border-2 border-[var(--bg-card)]">
                  <Camera className="w-3.5 h-3.5 stroke-[2.4]" />
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-[10.5px] font-bold text-[var(--accent-main)] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Unggah Foto Sendiri</span>
              </button>
            </div>

            {/* Name Input */}
            <div className="mb-4">
              <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block mb-1">
                Nama Tampilan
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[var(--text-secondary)]" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ketik nama Anda..."
                  maxLength={20}
                  className="w-full pl-8.5 pr-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/10 border border-[var(--border-card)] text-[12px] font-bold text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-main)]"
                />
              </div>
            </div>

            {/* Mascot Characters Grid */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[9.5px] font-bold uppercase tracking-wider text-[var(--text-secondary)] block">
                  Karakter TTS Quest
                </label>
                <span className="text-[8.5px] font-bold text-[var(--accent-main)]">
                  {MASCOT_AVATARS.length} Karakter
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 max-h-[145px] overflow-y-auto p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10">
                {MASCOT_AVATARS.map((mascot) => {
                  const isSelected = selectedAvatar === mascot.src;
                  return (
                    <button
                      key={mascot.id}
                      type="button"
                      title={mascot.name}
                      onClick={() => setSelectedAvatar(mascot.src)}
                      className={`relative aspect-square rounded-2xl p-1 flex items-center justify-center transition-all cursor-pointer tactile-active overflow-hidden ${
                        isSelected
                          ? 'bg-[var(--accent-light)] ring-2 ring-[var(--accent-main)] shadow-xs scale-105'
                          : 'bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15'
                      }`}
                    >
                      <img
                        src={mascot.src}
                        alt={mascot.name}
                        className="w-full h-full object-contain filter drop-shadow-sm"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-2.5 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[12px] font-black flex items-center justify-center gap-1.5 cursor-pointer tactile-active shadow-md hover:opacity-95 transition-opacity"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Simpan Profil</span>
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
