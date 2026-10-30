import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRight,
  Clipboard,
  ScanLine,
  Sparkles,
  PenTool,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { QrScannerModal } from './QrScannerModal';

export const ImportCustomCrosswordModal: React.FC = () => {
  const {
    isImportCustomCrosswordOpen,
    closeImportCustomCrosswordModal,
    importCustomCrosswordFromPayload,
    showGlobalToast,
    isScannerOpen,
    openScanner,
    closeScanner,
  } = useGameStore();

  const [inputVal, setInputVal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isImportCustomCrosswordOpen) return null;

  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setInputVal(text.trim());
          showGlobalToast('Teks berhasil ditempel dari clipboard');
        } else {
          showGlobalToast('Clipboard kosong');
        }
      } else {
        showGlobalToast('Fitur clipboard tidak diizinkan di browser ini');
      }
    } catch {
      showGlobalToast('Gagal membaca clipboard. Silakan tempel manual.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) {
      showGlobalToast('Tempel tautan atau kode TTS kawanmu terlebih dahulu');
      return;
    }

    setIsSubmitting(true);
    const success = await importCustomCrosswordFromPayload(inputVal.trim());
    setIsSubmitting(false);

    if (success) {
      setInputVal('');
      closeImportCustomCrosswordModal();
    } else {
      showGlobalToast('Tautan atau kode TTS tidak valid. Periksa kembali formatnya.');
    }
  };

  const handleScanSuccess = async (scannedText: string) => {
    closeScanner();
    const success = await importCustomCrosswordFromPayload(scannedText);
    if (success) {
      closeImportCustomCrosswordModal();
    } else {
      showGlobalToast('Format QR tidak valid sebagai TTS Kustom');
    }
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 select-none overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            onClick={closeImportCustomCrosswordModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Card (Liquid Glass Bento) */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 320 }}
            className="relative w-full max-w-[380px] max-h-[92vh] overflow-y-auto no-scrollbar rounded-[28px] p-4 sm:p-5 flex flex-col gap-3.5 shadow-2xl z-10 border border-black/10 dark:border-white/15 liquid-glass-card my-auto text-[var(--text-primary)]"
          >
            {/* Top Specular Sheen Highlight */}
            <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center text-[var(--accent-main)] shadow-2xs">
                  <PenTool className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[8.5px] font-black uppercase tracking-wider text-[var(--accent-main)]">
                    KREASI KOMUNITAS
                  </span>
                  <h3 className="text-[16px] font-black text-[var(--text-primary)] leading-tight">
                    Buka TTS Teman
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={closeImportCustomCrosswordModal}
                aria-label="Tutup"
                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer"
              >
                <X className="w-3.5 h-3.5 stroke-[2.2]" />
              </button>
            </div>

            {/* Subtitle */}
            <p className="text-[11.5px] text-[var(--text-secondary)] font-medium leading-relaxed relative z-10">
              Pindai tiket QR kawanmu atau tempel tautan yang dibagikan lewat chat untuk memecahkan teka-teki silang buatannya.
            </p>

            {/* Action 1: Scan QR Code */}
            <button
              type="button"
              onClick={() => openScanner()}
              className="w-full rounded-[22px] p-3.5 border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden flex items-center justify-between gap-3 text-left hover:border-[var(--accent-main)]/50 active:scale-[0.99] transition-all cursor-pointer tactile-active group"
              style={{
                background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <ScanLine className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-[13px] font-black text-[var(--text-primary)] leading-tight">
                    Pindai QR Undangan
                  </h4>
                  <p className="text-[9.5px] text-[var(--text-secondary)] mt-0.5 leading-snug">
                    Arahkan kamera ke tiket QR di HP kawanmu
                  </p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)] flex items-center justify-center shrink-0">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>

            {/* Separator Divider */}
            <div className="flex items-center gap-2 my-0.5">
              <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
              <span className="text-[9px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
                ATAU TEMPEL TAUTAN
              </span>
              <div className="h-px bg-black/10 dark:bg-white/10 flex-1" />
            </div>

            {/* Action 2: Paste Link/Code Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 relative z-10">
              <div className="relative">
                <textarea
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Tempel tautan (https://.../?custom=...) atau kode rahasia TTS di sini..."
                  rows={3}
                  className="w-full text-[12px] font-mono rounded-2xl px-3.5 py-2.5 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/50 focus:outline-none focus:border-[var(--accent-main)] transition-colors resize-none leading-relaxed"
                />
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-lg bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] font-black text-[9px] flex items-center gap-1 cursor-pointer hover:opacity-80 active:scale-95 transition-all shadow-2xs"
                  title="Tempel dari Clipboard"
                >
                  <Clipboard className="w-3 h-3" />
                  <span>Tempel</span>
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !inputVal.trim()}
                className="w-full py-3 px-4 rounded-xl font-black text-[13px] flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer tactile-active disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: 'var(--accent-grad)',
                  color: 'var(--accent-contrast, #ffffff)',
                }}
              >
                <Sparkles className="w-4 h-4 fill-current stroke-none" />
                <span>Buka & Mainkan TTS</span>
              </button>

              <p className="text-[8.5px] text-[var(--text-secondary)] text-center mt-1.5 leading-tight">
                Sesuai Apple Guideline 1.2, jika TTS kawan memuat kata tidak pantas, Anda dapat menekan ikon bendera Lapor saat bermain untuk menghapus dan memblokirnya.
              </p>
            </form>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* Camera QR Scanner Overlay */}
      {isScannerOpen && (
        <QrScannerModal
          isOpen={isScannerOpen}
          onClose={closeScanner}
          onScanSuccess={handleScanSuccess}
        />
      )}
    </>
  );
};
