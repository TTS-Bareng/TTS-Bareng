import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  PenTool,
  Sparkles,
  Plus,
  Trash2,
  Eye,
  Share2,
  Crown,
  Lock,
  CheckCircle2,
  Ticket,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { generateCustomCrossword, type UserWordInput } from '../lib/customCrosswordGenerator';
import type { LevelData } from '../lib/crossword';
import { soundManager } from '../lib/audio';
import { haptic } from '../lib/haptics';
import confetti from 'canvas-confetti';
import { MASCOTS } from '../assets/maskots';
import { revenueCatService, IAP_PRODUCT_IDS } from '../lib/revenueCatService';
import { createCustomCrosswordDeepLink } from '../lib/deeplink';

const TOPIC_PRESETS = [
  'Kolega & Teman',
  'Pop Culture',
  'Keluarga',
  'Nostalgia',
  'Musik & Seni',
  'Kisah Cinta',
];

export const CustomCrosswordModal: React.FC = () => {
  const {
    isCustomCrosswordModalOpen,
    closeCustomCrosswordModal,
    customTtsTickets,
    isVip,
    setIsVip,
    consumeCustomTtsTicket,
    openSachetModal,
    openVipModal,
    openLegalModal,
    showGlobalToast,
    soundEnabled,
    hapticEnabled,
    openCustomCrosswordQrModal,
    editingCustomCrossword,
    saveUserCustomCrossword,
  } = useGameStore();

  const [isRestoring, setIsRestoring] = useState(false);
  const [sachetPriceLabel, setSachetPriceLabel] = useState('Rp 5.000');
  const [vipPriceLabel, setVipPriceLabel] = useState('Mulai Rp 16.500');

  useEffect(() => {
    if (!isCustomCrosswordModalOpen) return;
    revenueCatService.getDynamicPriceMap().then((prices) => {
      if (prices[IAP_PRODUCT_IDS.sachetStarter]) {
        setSachetPriceLabel(prices[IAP_PRODUCT_IDS.sachetStarter]);
      }
      if (prices[IAP_PRODUCT_IDS.vipMonthly]) {
        setVipPriceLabel(prices[IAP_PRODUCT_IDS.vipMonthly]);
      }
    }).catch(() => {});
  }, [isCustomCrosswordModalOpen]);

  const handleRestorePurchases = async () => {
    try {
      setIsRestoring(true);
      const res = await revenueCatService.restorePurchases();
      if (res.isVip) {
        setIsVip(true);
        showGlobalToast('Status VIP Anda berhasil dipulihkan dari Apple ID!', 4000);
      } else if (res.success) {
        setIsVip(false);
        showGlobalToast('Tidak ada langganan VIP aktif pada akun Apple ini.', 3500);
      } else {
        showGlobalToast(res.error || 'Gagal memulihkan pembelian.', 3500);
      }
    } catch {
      showGlobalToast('Gagal memulihkan pembelian.');
    } finally {
      setIsRestoring(false);
    }
  };

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

  useEffect(() => {
    if (editingCustomCrossword) {
      setTitle(editingCustomCrossword.title);
      setCategory(editingCustomCrossword.category);
      setWordsList(editingCustomCrossword.wordsList);
      setPreviewLevel(editingCustomCrossword.level);
    } else {
      setTitle('');
      setCategory('Kolega & Teman');
      setWordsList([
        { word: 'SENJA', clue: 'Waktu matahari terbenam yang syahdu' },
        { word: 'KOPI', clue: 'Minuman andalan saat begadang lembur' },
        { word: 'PUISI', clue: 'Rangkaian sajak kata yang bermakna mendalam' },
        { word: 'GITAR', clue: 'Alat musik petik favorit tongkrongan' },
      ]);
      setPreviewLevel(null);
    }
  }, [editingCustomCrossword, isCustomCrosswordModalOpen]);

  if (!isCustomCrosswordModalOpen) return null;

  const hasAccess = isVip || customTtsTickets > 0;

  const handleAddWord = () => {
    if (wordsList.length >= 8) {
      showGlobalToast('Maksimal 8 kata untuk teka-teki silang kreasi.', 2500);
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
      showGlobalToast('Papan TTS berhasil disusun!', 2500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal menyusun TTS. Periksa kata dan petunjuk.';
      setErrorMsg(msg);
      if (soundEnabled) soundManager.playWordWrong();
    }
  };

  const handlePublishAndShare = () => {
    try {
      // Apple Guideline 1.2: Check for forbidden/objectionable words in title, category, words, and clues
      const FORBIDDEN_WORDS = ['anjing', 'bangsat', 'kontol', 'memek', 'ngentot', 'babi', 'jembut', 'itil', 'pepek', 'pantek', 'bajingan', 'kampret'];
      const combinedText = [title, category, ...wordsList.map((w) => `${w.word} ${w.clue}`)].join(' ').toLowerCase();
      const hasObjectionable = FORBIDDEN_WORDS.some((bad) => combinedText.includes(bad));
      if (hasObjectionable) {
        setErrorMsg('Terdapat kata yang dilarang sesuai Ketentuan Komunitas (Apple Guideline 1.2). Mohon perbaiki kata atau petunjuk.');
        showGlobalToast('Kata terlarang terdeteksi. Harap gunakan kata yang sopan.', 3500);
        return;
      }

      const generated = previewLevel || generateCustomCrossword(title || 'TTS Karyaku', category, wordsList);

      // Only consume creation ticket for brand new crosswords (editing own existing crossword is free)
      if (!editingCustomCrossword) {
        const consumed = consumeCustomTtsTicket();
        if (!consumed) {
          showGlobalToast('Tiket kreasi tidak mencukupi.', 3000);
          return;
        }
      }

      // Save to user custom crosswords collection
      const customItem = {
        id: editingCustomCrossword?.id || `custom_${Date.now()}`,
        title: generated.title,
        category: generated.category || 'Kreasi',
        wordsList,
        level: generated,
        createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      };
      saveUserCustomCrossword(customItem);

      if (soundEnabled) soundManager.playVictory();
      if (hapticEnabled) haptic.success([40, 80, 50]);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });

      const shareUrl = createCustomCrosswordDeepLink({
        title: generated.title,
        category: generated.category || 'Kreasi',
        wordsList,
      });
      const shareText = `Ayo mainkan TTS Karyaku: "${generated.title}" (${
        generated.clues.across.length + generated.clues.down.length
      } Kata)! Buka dan pecahkan langsung di: ${shareUrl}`;

      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText);
      }

      closeCustomCrosswordModal();
      showGlobalToast('TTS Karyamu Berhasil Diterbitkan & Disimpan ke Profil!', 4000);

      // Buka Tiket Undangan Resmi & QR Code untuk TTS Kustom
      openCustomCrosswordQrModal(customItem);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal mempublikasikan TTS.';
      setErrorMsg(msg);
      if (soundEnabled) soundManager.playWordWrong();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed inset-0 z-50 text-[var(--text-primary)] flex flex-col select-none overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-app)',
          background: 'var(--bg-gradient)',
        }}
      >
        {/* Minimalist Top App Bar (Opaque & Clean) */}
        <header
          className="sticky top-0 z-30 w-full px-4 sm:px-6 pt-[max(14px,calc(8px+env(safe-area-inset-top)))] pb-3.5 border-b border-black/5 dark:border-white/10 flex items-center justify-between shadow-xs backdrop-blur-md"
          style={{ backgroundColor: 'var(--bg-card)' }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={closeCustomCrosswordModal}
              aria-label="Kembali"
              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all cursor-pointer text-[var(--text-primary)] border border-black/5 dark:border-white/10"
            >
              <ArrowLeft className="w-4.5 h-4.5 stroke-[2.2]" />
            </button>
            <div>
              <h1 className="text-[16px] font-black tracking-tight text-[var(--text-primary)] leading-tight flex items-center gap-1.5">
                <PenTool className="w-3.5 h-3.5 text-[var(--accent-main)]" />
                <span>Studio Kreator</span>
              </h1>
              <span className="text-[10px] text-[var(--text-secondary)] font-medium leading-none block mt-0.5">
                Rancang teka-teki silang karyamu sendiri
              </span>
            </div>
          </div>

          {/* Right Status Badge */}
          <div className="flex items-center gap-2">
            {isVip ? (
              <span className="text-[9.5px] font-black px-2.5 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/25 flex items-center gap-1">
                <Crown className="w-3 h-3 fill-current" />
                <span>VIP UNLIMITED</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => {
                  closeCustomCrosswordModal();
                  openSachetModal();
                }}
                className="text-[9.5px] font-bold px-2.5 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/25 hover:opacity-85 transition-opacity flex items-center gap-1 cursor-pointer"
              >
                <Ticket className="w-3 h-3 stroke-[2.2]" />
                <span>{customTtsTickets} Tiket</span>
                <span className="font-black underline ml-0.5">+ Beli</span>
              </button>
            )}
          </div>
        </header>

        {/* ============================================================
            CASE 1: USER DOES NOT HAVE ACCESS (FULL-PAGE MINIMALIST PAYWALL)
            ============================================================ */}
        {!hasAccess ? (
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pt-8 pb-[max(32px,calc(16px+env(safe-area-inset-bottom)))] flex flex-col items-center justify-center">
            <div className="w-full max-w-md mx-auto flex flex-col items-center text-center gap-4">
              {/* Mascot Hero with Subtle Theme Glow */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[var(--accent-light)] blur-2xl opacity-70 pointer-events-none" />
                <motion.img
                  initial={{ y: 6, scale: 0.95 }}
                  animate={{ y: [0, -6, 0], scale: 1 }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  src={MASCOTS.crosswordThinker}
                  alt="Studio Kreator"
                  className="w-full h-full object-contain filter drop-shadow-md relative z-10"
                />
                <div
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center shadow-md border border-white/20 z-20"
                  style={{ background: 'var(--accent-grad)', color: 'var(--accent-contrast)' }}
                >
                  <Lock className="w-4 h-4 stroke-[2.4]" />
                </div>
              </div>

              {/* Title & Description */}
              <div className="flex flex-col items-center">
                <span className="text-[9.5px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/25">
                  AKSES EKSKLUSIF KREATOR
                </span>
                <h2 className="text-[22px] font-black text-[var(--text-primary)] tracking-tight mt-2 leading-tight">
                  Bebas Tantang Teman dengan TTS Buatanmu
                </h2>
                <p className="text-[12.5px] text-[var(--text-secondary)] mt-1.5 leading-relaxed max-w-sm">
                  Pemain bebas memainkan karya siapa pun. Untuk membuat dan membagikan teka-teki silangmu sendiri, gunakan <strong>1 Tiket Kreasi</strong> atau aktifkan <strong>TTS Pass VIP</strong>.
                </p>
              </div>

              {/* Bento Purchase Options */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                {/* Option 1: Sachet Pack */}
                <div
                  onClick={() => {
                    closeCustomCrosswordModal();
                    openSachetModal();
                  }}
                  className="p-4 rounded-2xl border border-[var(--accent-main)]/20 hover:border-[var(--accent-main)]/40 transition-all cursor-pointer tactile-active flex flex-col justify-between text-left shadow-xs"
                  style={{ backgroundColor: 'var(--bg-card)' }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)] flex items-center justify-center">
                        <Sparkles className="w-4 h-4 fill-current stroke-current" />
                      </div>
                      <span className="text-[8.5px] font-black px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/20">
                        1X KREASI
                      </span>
                    </div>
                    <h3 className="text-[13px] font-black text-[var(--text-primary)] leading-tight">
                      Paket Sachet Pemula
                    </h3>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                      +1 Tiket Kreasi, +150 Bintang & 3x Pelindung Streak
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                    <span className="font-mono font-black text-[13px] text-[var(--text-primary)]">
                      {sachetPriceLabel}
                    </span>
                    <span className="text-[10px] font-bold text-[var(--accent-main)]">
                      Pilih Paket ↗
                    </span>
                  </div>
                </div>

                {/* Option 2: VIP Pass */}
                <div
                  onClick={() => {
                    closeCustomCrosswordModal();
                    openVipModal();
                  }}
                  className="p-4 rounded-2xl border border-[var(--accent-main)]/30 hover:border-[var(--accent-main)]/60 transition-all cursor-pointer tactile-active flex flex-col justify-between text-left shadow-sm relative overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-card)' }}
                >
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[var(--accent-main)] to-transparent" />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shadow-xs border border-white/20"
                        style={{ background: 'var(--accent-grad)', color: 'var(--accent-contrast)' }}
                      >
                        <Crown className="w-4 h-4 fill-current stroke-current" />
                      </div>
                      <span className="text-[8.5px] font-black px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/20">
                        UNLIMITED
                      </span>
                    </div>
                    <h3 className="text-[13px] font-black text-[var(--text-primary)] leading-tight">
                      TTS Pass VIP
                    </h3>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-1">
                      Bikin TTS sepuasnya tanpa batas tiket & mahkota juara
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/10 flex items-center justify-between">
                    <span className="font-mono font-black text-[13px] text-[var(--text-primary)]">
                      {vipPriceLabel}<span className="text-[9px] font-normal text-[var(--text-secondary)]">/bln</span>
                    </span>
                    <span className="text-[10px] font-bold text-[var(--accent-main)]">
                      Pilih Paket ↗
                    </span>
                  </div>
                </div>
              </div>

              {/* Apple StoreKit Legal Footer */}
              <div className="flex items-center justify-center gap-3 pt-4 border-t border-black/5 dark:border-white/10 text-[10px] text-[var(--text-secondary)]">
                <button
                  type="button"
                  onClick={handleRestorePurchases}
                  disabled={isRestoring}
                  className="hover:underline hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Pulihkan Pembelian
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => openLegalModal('terms')}
                  className="hover:underline hover:text-[var(--text-primary)] cursor-pointer"
                >
                  EULA / Ketentuan
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => openLegalModal('privacy')}
                  className="hover:underline hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Privasi
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================
             CASE 2: CREATOR STUDIO (FULL-PAGE MINIMALIST CANVAS)
             ============================================================ */
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 pb-28">
            <div className="w-full max-w-md sm:max-w-xl mx-auto flex flex-col gap-5">
              {/* Card 1: Identitas & Topik */}
              <div
                className="rounded-[24px] p-4.5 border border-black/5 dark:border-white/10 shadow-xs flex flex-col gap-4 relative overflow-hidden"
                style={{ backgroundColor: 'var(--bg-card)' }}
              >
                <div>
                  <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider block mb-1.5">
                    Judul Teka-Teki Silang
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Kuis Sahabat Sejati"
                    maxLength={35}
                    className="w-full text-[14px] font-bold text-[var(--text-primary)] bg-black/4 dark:bg-white/5 rounded-xl px-3.5 py-2.5 border border-black/5 dark:border-white/10 focus:border-[var(--accent-main)] outline-none transition-colors placeholder:text-[var(--text-secondary)]/50"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-wider block">
                      Topik / Kategori
                    </label>
                    <span className="text-[10.5px] font-mono text-[var(--accent-main)] font-black truncate max-w-[150px]">
                      {category || 'Umum'}
                    </span>
                  </div>

                  {/* Topic Preset Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {TOPIC_PRESETS.map((t) => {
                      const isSelected = category === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setCategory(t)}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? 'border-transparent shadow-xs'
                              : 'bg-black/4 dark:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-black/5 dark:border-white/10'
                          }`}
                          style={
                            isSelected
                              ? { background: 'var(--accent-grad)', color: 'var(--accent-contrast)' }
                              : {}
                          }
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom Category Input */}
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Atau ketik kategori kustom sendiri... (cth: Sains, Anime, Kantor)"
                    maxLength={25}
                    className="w-full text-[12px] font-medium text-[var(--text-primary)] bg-black/4 dark:bg-white/5 rounded-xl px-3 py-2 border border-black/5 dark:border-white/10 focus:border-[var(--accent-main)] outline-none transition-colors placeholder:text-[var(--text-secondary)]/50"
                  />
                </div>
              </div>

              {/* Card 2: Editor Kata & Petunjuk */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h2 className="text-[13.5px] font-black text-[var(--text-primary)] tracking-tight">
                      Daftar Kata & Petunjuk
                    </h2>
                    <span className="text-[10.5px] text-[var(--text-secondary)]">
                      {wordsList.length} dari maksimal 8 kata (minimal 3 kata)
                    </span>
                  </div>

                  {wordsList.length < 8 && (
                    <button
                      type="button"
                      onClick={handleAddWord}
                      className="px-3 py-1.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/25 font-black text-[10.5px] flex items-center gap-1 hover:opacity-85 transition-opacity cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Tambah Kata</span>
                    </button>
                  )}
                </div>

                {/* Word Entries List */}
                <div className="flex flex-col gap-2.5">
                  {wordsList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl border border-black/5 dark:border-white/10 shadow-xs flex flex-col gap-2.5 transition-colors focus-within:border-[var(--accent-main)]/40"
                      style={{ backgroundColor: 'var(--bg-card)' }}
                    >
                      {/* Top Row: Number, Word Input, Delete */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-[var(--accent-light)] text-[var(--accent-main)] font-black text-[10.5px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </div>
                        <input
                          type="text"
                          value={item.word}
                          onChange={(e) => handleUpdateWord(idx, 'word', e.target.value.toUpperCase())}
                          placeholder="KATA KUNCI (HURUF SAJA)"
                          maxLength={10}
                          className="flex-1 font-mono tracking-widest uppercase font-black text-[13px] text-[var(--text-primary)] bg-black/4 dark:bg-white/5 px-3 py-1.5 rounded-xl border border-black/5 dark:border-white/10 outline-none focus:border-[var(--accent-main)] transition-colors placeholder:text-[var(--text-secondary)]/50 placeholder:font-sans placeholder:tracking-normal placeholder:font-normal placeholder:text-[11px]"
                        />
                        {wordsList.length > 3 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveWord(idx)}
                            aria-label="Hapus kata"
                            className="w-7 h-7 rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent-main)] hover:bg-[var(--accent-light)] flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                          </button>
                        )}
                      </div>

                      {/* Bottom Row: Clue Input */}
                      <input
                        type="text"
                        value={item.clue}
                        onChange={(e) => handleUpdateWord(idx, 'clue', e.target.value)}
                        placeholder="Tulis pertanyaan / petunjuk untuk kata ini..."
                        maxLength={90}
                        className="w-full text-[12px] text-[var(--text-primary)] bg-black/3 dark:bg-white/4 px-3 py-2 rounded-xl border border-black/5 dark:border-white/10 outline-none focus:border-[var(--accent-main)] placeholder:text-[var(--text-secondary)]/50 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] text-[11.5px] font-bold">
                  {errorMsg}
                </div>
              )}

              {/* Card 3: Pratinjau Papan Interaktif */}
              {previewLevel && (
                <div
                  className="rounded-[24px] p-4.5 border border-black/5 dark:border-white/10 shadow-xs flex flex-col items-center gap-4 relative overflow-hidden"
                  style={{ backgroundColor: 'var(--bg-card)' }}
                >
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <h3 className="text-[13px] font-black text-[var(--text-primary)] tracking-tight">
                        Pratinjau Papan Teka-Teki
                      </h3>
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        Ukuran matriks {previewLevel.size.rows} x {previewLevel.size.cols} kotak
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/25 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.2]" />
                      <span>Siap Dimainkan</span>
                    </span>
                  </div>

                  {/* Grid Canvas */}
                  <div
                    className="grid gap-1.5 p-3 rounded-2xl bg-black/4 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-inner"
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
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-[11px] font-black font-mono relative transition-transform ${
                              tile
                                ? 'shadow-xs border border-white/20'
                                : 'bg-transparent border border-transparent'
                            }`}
                            style={
                              tile
                                ? { background: 'var(--accent-grad)', color: 'var(--accent-contrast)' }
                                : {}
                            }
                          >
                            {tile?.number && (
                              <span className="absolute top-0.5 left-0.5 text-[7px] leading-none opacity-85">
                                {tile.number}
                              </span>
                            )}
                            {tile?.answer}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Clues Summary */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-2 border-t border-black/5 dark:border-white/10">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[var(--accent-main)] tracking-wider block mb-1">
                        Mendatar ({previewLevel.clues.across.length})
                      </span>
                      <ul className="text-[11px] text-[var(--text-secondary)] space-y-1">
                        {previewLevel.clues.across.map((c) => (
                          <li key={c.number} className="leading-snug">
                            <strong className="text-[var(--text-primary)]">{c.number}.</strong> {c.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-[var(--accent-main)] tracking-wider block mb-1">
                        Menurun ({previewLevel.clues.down.length})
                      </span>
                      <ul className="text-[11px] text-[var(--text-secondary)] space-y-1">
                        {previewLevel.clues.down.map((c) => (
                          <li key={c.number} className="leading-snug">
                            <strong className="text-[var(--text-primary)]">{c.number}.</strong> {c.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sticky Minimalist Bottom Action Bar (Opaque & Elevated) */}
        {hasAccess && (
          <div
            className="sticky bottom-0 inset-x-0 px-3.5 sm:px-4 pt-2.5 pb-[max(16px,calc(10px+env(safe-area-inset-bottom)))] border-t border-black/5 dark:border-white/10 z-30 shadow-lg flex flex-col gap-2"
            style={{ backgroundColor: 'var(--bg-card)' }}
          >
            {/* Apple Guideline 1.2 UGC Disclosure */}
            <p className="text-[9px] text-[var(--text-secondary)] text-center leading-tight">
              Dengan mempublikasikan, Anda menyetujui{' '}
              <button
                type="button"
                onClick={() => openLegalModal('terms')}
                className="text-[var(--accent-main)] underline font-bold cursor-pointer"
              >
                Ketentuan Layanan
              </button>
              : dilarang memuat kata kasar, SARA, atau konten terlarang.
            </p>

            <div className="w-full max-w-md sm:max-w-xl mx-auto flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleGeneratePreview}
                className="py-3 px-3.5 sm:px-4 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-primary)] font-bold text-[12px] cursor-pointer tactile-active flex items-center justify-center gap-1.5 border border-black/5 dark:border-white/10 transition-all shrink-0 whitespace-nowrap"
              >
                <Eye className="w-4 h-4 stroke-[2.2]" />
                <span className="whitespace-nowrap">Pratinjau Papan</span>
              </button>

              <button
                type="button"
                onClick={handlePublishAndShare}
                className="flex-1 py-3 px-4 rounded-2xl font-black text-[12.5px] cursor-pointer tactile-active shadow-md flex items-center justify-center gap-2 border border-white/20 transition-all whitespace-nowrap overflow-hidden"
                style={{ background: 'var(--accent-grad)', color: 'var(--accent-contrast)' }}
              >
                <Share2 className="w-4 h-4 stroke-[2.2]" />
                <span className="whitespace-nowrap">Publikasikan TTS</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomCrosswordModal;
