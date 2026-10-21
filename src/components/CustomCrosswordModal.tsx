import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  PenTool,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  Share2,
  Crown,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { generateCustomCrossword, type UserWordInput } from '../lib/customCrosswordGenerator';
import type { LevelData } from '../lib/crossword';
import { soundManager } from '../lib/audio';
import { haptic } from '../lib/haptics';
import confetti from 'canvas-confetti';
import { MASCOTS } from '../assets/maskots';

export const CustomCrosswordModal: React.FC = () => {
  const {
    isCustomCrosswordModalOpen,
    closeCustomCrosswordModal,
    customTtsTickets,
    isVip,
    setIsVip,
    consumeCustomTtsTicket,
    openSachetModal,
    showGlobalToast,
    soundEnabled,
    hapticEnabled,
    openShareModal,
  } = useGameStore();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Kolega & Teman');
  const [wordsList, setWordsList] = useState<UserWordInput[]>([
    { word: 'SENJA', clue: 'Waktu matahari terbenam yang syahdu' },
    { word: 'KOPI', clue: 'Minuman andalan saat begadang lembur' },
    { word: 'PUISI', clue: 'Rangkaian sajak kata yang bermakna mendalam' },
    { word: 'GITAR', clue: 'Alat musik petik favorit tongkrongan' },
  ]);

  const [previewLevel, setPreviewLevel] = useState<LevelData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isCustomCrosswordModalOpen) return null;

  const hasAccess = isVip || customTtsTickets > 0;

  const handleAddWord = () => {
    if (wordsList.length >= 6) {
      showGlobalToast('Maksimal 6 kata untuk teka-teki silang mini.', 2500);
      return;
    }
    setWordsList((prev) => [...prev, { word: '', clue: '' }]);
    setPreviewLevel(null);
  };

  const handleRemoveWord = (index: number) => {
    if (wordsList.length <= 3) {
      showGlobalToast('Minimal butuh 3 kata untuk membentuk petak silang.', 2500);
      return;
    }
    setWordsList((prev) => prev.filter((_, idx) => idx !== index));
    setPreviewLevel(null);
  };

  const handleUpdateWord = (index: number, field: 'word' | 'clue', value: string) => {
    setWordsList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setErrorMsg(null);
  };

  const handleGeneratePreview = () => {
    try {
      setErrorMsg(null);
      const generated = generateCustomCrossword(title || 'TTS Karyaku', category, wordsList);
      setPreviewLevel(generated);
      if (soundEnabled) soundManager.playFocusTick();
      if (hapticEnabled) haptic.light(15);
      showGlobalToast('✨ Papan TTS berhasil disusun!', 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyusun TTS. Periksa kata dan petunjuk.';
      setErrorMsg(msg);
      if (soundEnabled) soundManager.playWordWrong();
    }
  };

  const handlePublishAndShare = () => {
    try {
      const generated = previewLevel || generateCustomCrossword(title || 'TTS Karyaku', category, wordsList);
      
      const consumed = consumeCustomTtsTicket();
      if (!consumed) {
        showGlobalToast('Tiket kreasi tidak mencukupi.', 3000);
        return;
      }

      if (soundEnabled) soundManager.playVictory();
      if (hapticEnabled) haptic.success([40, 80, 50]);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

      const shareText = `🧩 Ayo mainkan TTS Karyaku: "${generated.title}" (${generated.clues.across.length + generated.clues.down.length} Kata)! Bisakah kamu menyelesaikannya? Buka di: ${window.location.origin}`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText);
      }

      closeCustomCrosswordModal();
      showGlobalToast('🎉 TTS Karyamu Berhasil Diterbitkan! Tautan disalin ke clipboard.', 4200);

      openShareModal({
        badge: 'TTS KREASI SENDIRI',
        title: generated.title,
        subtitle: `Teka-teki silang bertema "${generated.category}" siap dimainkan teman-temanmu.`,
        mascot: MASCOTS.crosswordThinker,
        stats: [
          { label: 'KATA', value: `${generated.clues.across.length + generated.clues.down.length}` },
          { label: 'TEMA', value: generated.category || 'Kreasi' },
          { label: 'KREATOR', value: 'Anda' },
        ],
        shareUrl: window.location.origin,
        shareText,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mempublikasikan TTS.';
      setErrorMsg(msg);
      if (soundEnabled) soundManager.playWordWrong();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 select-none">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          exit={{ opacity: 0 }}
          onClick={closeCustomCrosswordModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Card Content (Apple Liquid Glass) */}
        <motion.div
          initial={{ scale: 0.88, opacity: 0, y: 25 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.88, opacity: 0, y: 25 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-[370px] max-h-[92vh] rounded-[32px] p-4 sm:p-5 flex flex-col gap-3.5 shadow-2xl z-10 border border-black/10 dark:border-white/15 liquid-glass-card overflow-hidden"
        >
          {/* Top Sheen */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] flex items-center justify-center shrink-0">
                <PenTool className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[8px] font-black uppercase tracking-wider text-[var(--accent-main)] block leading-none mb-0.5">
                  STUDIO KREATOR
                </span>
                <h3 className="text-[16px] font-black tracking-tight text-[var(--text-primary)] leading-tight">
                  Bikin TTS Sendiri
                </h3>
              </div>
            </div>

            <button
              type="button"
              onClick={closeCustomCrosswordModal}
              aria-label="Tutup"
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>

          {/* ============================================================
              CASE 1: USER DOES NOT HAVE ACCESS (LOCKED VIEW)
              ============================================================ */}
          {!hasAccess ? (
            <div className="flex-1 overflow-y-auto flex flex-col items-center gap-3.5 text-center py-2">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <img
                  src={MASCOTS.crosswordThinker}
                  alt="Kreator Terkunci"
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-md">
                  <Lock className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>

              <div>
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  AKSES EKSKLUSIF KREATOR
                </span>
                <h4 className="text-[17px] font-black text-[var(--text-primary)] mt-1.5 leading-snug">
                  Bebas Tantang Teman dengan TTS Buatanmu!
                </h4>
                <p className="text-[11px] text-[var(--text-secondary)] mt-1 leading-relaxed max-w-[280px]">
                  Pemain gratis bebas memainkan seluruh TTS buatan teman. Untuk menyusun dan menerbitkan TTS karyamu sendiri, gunakan <strong>1 Tiket Kreasi</strong> atau aktifkan <strong>TTS Pass VIP</strong>.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex flex-col gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => {
                    closeCustomCrosswordModal();
                    openSachetModal();
                  }}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-black font-black text-[12.5px] cursor-pointer tactile-active shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 fill-black" />
                    <span>Beli Paket Pemula (+1 Tiket TTS)</span>
                  </div>
                  <span className="font-mono text-[11px] bg-black/20 px-2 py-0.5 rounded-md">
                    Rp 5.000
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsVip(true);
                    showGlobalToast('👑 Selamat! Akses TTS Pass VIP Aktif!', 3000);
                  }}
                  className="w-full py-2.5 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-primary)] font-bold text-[11.5px] cursor-pointer tactile-active border border-black/5 dark:border-white/10 flex items-center justify-center gap-1.5"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span>Aktifkan TTS Pass VIP (Unlimited)</span>
                </button>
              </div>
            </div>
          ) : (
            /* ============================================================
               CASE 2: CREATOR STUDIO (FORM & PREVIEW)
               ============================================================ */
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-0.5">
              {/* Access Status Banner */}
              <div className="w-full p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between text-[9.5px]">
                <div className="flex items-center gap-1.5 font-bold text-[var(--text-secondary)]">
                  {isVip ? (
                    <>
                      <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-[var(--text-primary)] font-black">TTS Pass VIP: Bebas Bikin TTS</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[12px]">🎟️</span>
                      <span>Sisa Tiket: <strong className="text-[var(--text-primary)] font-black">{customTtsTickets}x</strong></span>
                    </>
                  )}
                </div>
                {!isVip && (
                  <button
                    type="button"
                    onClick={() => {
                      closeCustomCrosswordModal();
                      openSachetModal();
                    }}
                    className="text-[9px] font-black text-[var(--accent-main)] hover:underline cursor-pointer"
                  >
                    + Tambah Tiket
                  </button>
                )}
              </div>

              {/* Title & Category Inputs */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
                    Judul TTS
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Kuis Sahabat"
                    maxLength={30}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-main)]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
                    Tema / Topik
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Contoh: Pop Culture"
                    maxLength={20}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-[11px] font-bold text-[var(--text-primary)] outline-none focus:border-[var(--accent-main)]"
                  />
                </div>
              </div>

              {/* Words & Clues Editor */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black text-[var(--text-secondary)] uppercase tracking-wider">
                    Daftar Kata & Petunjuk ({wordsList.length}/6)
                  </label>
                  {wordsList.length < 6 && (
                    <button
                      type="button"
                      onClick={handleAddWord}
                      className="text-[9.5px] font-black text-[var(--accent-main)] flex items-center gap-0.5 hover:underline cursor-pointer"
                    >
                      <Plus className="w-3 h-3 stroke-[2.5]" />
                      <span>Tambah Kata</span>
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-2 max-h-[190px] overflow-y-auto pr-0.5">
                  {wordsList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center gap-2"
                    >
                      <div className="w-5 h-5 rounded-md bg-[var(--accent-light)] text-[var(--accent-main)] font-black text-[9px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </div>

                      <div className="flex-1 flex flex-col gap-1 min-w-0">
                        <input
                          type="text"
                          value={item.word}
                          onChange={(e) => handleUpdateWord(idx, 'word', e.target.value.toUpperCase())}
                          placeholder="KATA (Huruf saja)"
                          maxLength={10}
                          className="w-full px-2 py-1 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[11px] font-black tracking-wider uppercase text-[var(--text-primary)] outline-none focus:border-[var(--accent-main)] font-mono"
                        />
                        <input
                          type="text"
                          value={item.clue}
                          onChange={(e) => handleUpdateWord(idx, 'clue', e.target.value)}
                          placeholder="Pertanyaan / petunjuk kata ini..."
                          maxLength={80}
                          className="w-full px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[10px] text-[var(--text-primary)] outline-none focus:border-[var(--accent-main)]"
                        />
                      </div>

                      {wordsList.length > 3 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveWord(idx)}
                          className="w-6 h-6 rounded-lg text-rose-500 hover:bg-rose-500/10 flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Message if any */}
              {errorMsg && (
                <div className="text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/20 px-2.5 py-1.5 rounded-xl">
                  {errorMsg}
                </div>
              )}

              {/* Mini Board Preview */}
              {previewLevel && (
                <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex flex-col items-center gap-1.5">
                  <div className="flex items-center justify-between w-full text-[9px] font-black text-[var(--text-secondary)] uppercase">
                    <span>Pratinjau Papan ({previewLevel.size.rows} x {previewLevel.size.cols})</span>
                    <span className="text-emerald-500 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                      Siap Main
                    </span>
                  </div>
                  {/* Grid Tiles */}
                  <div
                    className="grid gap-1 p-2 rounded-xl bg-white/40 dark:bg-black/30 border border-black/5 dark:border-white/10"
                    style={{
                      gridTemplateColumns: `repeat(${previewLevel.size.cols}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: previewLevel.size.rows }).map((_, r) =>
                      Array.from({ length: previewLevel.size.cols }).map((_, c) => {
                        const tile = previewLevel.tiles.find((t) => t.r === r && t.c === c);
                        return (
                          <div
                            key={`${r}-${c}`}
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black font-mono relative ${
                              tile
                                ? 'bg-[var(--accent-main)] text-[var(--accent-contrast)] shadow-xs'
                                : 'bg-transparent border border-transparent'
                            }`}
                          >
                            {tile?.number && (
                              <span className="absolute top-0.5 left-0.5 text-[6.5px] leading-none opacity-80">
                                {tile.number}
                              </span>
                            )}
                            {tile?.answer}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-1 shrink-0">
                <button
                  type="button"
                  onClick={handleGeneratePreview}
                  className="py-2.5 px-3 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-primary)] font-bold text-[11px] cursor-pointer tactile-active flex items-center justify-center gap-1.5 border border-black/5 dark:border-white/10"
                >
                  <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Pratinjau Papan</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublishAndShare}
                  className="py-2.5 px-3 rounded-2xl bg-[var(--accent-main)] text-[var(--accent-contrast)] font-black text-[11px] cursor-pointer tactile-active shadow-md flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Publikasikan</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
