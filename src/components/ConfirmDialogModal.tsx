import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, X } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export const ConfirmDialogModal: React.FC = () => {
  const { confirmDialog, closeConfirmDialog } = useGameStore();

  if (!confirmDialog?.isOpen) return null;

  const {
    title,
    message,
    confirmLabel = 'Ya, Lanjutkan',
    cancelLabel = 'Batal',
    isDestructive = false,
    onConfirm,
  } = confirmDialog;

  const handleConfirm = () => {
    closeConfirmDialog();
    onConfirm();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop Blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeConfirmDialog}
          className="absolute inset-0 bg-black/30 dark:bg-black/65 backdrop-blur-md"
        />

        {/* Modal Card Content (Apple Liquid Glass) */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-[340px] rounded-[26px] p-5 flex flex-col gap-3.5 shadow-2xl z-10 border border-black/10 dark:border-white/15 liquid-glass-card overflow-hidden text-[var(--text-primary)]"
          style={{
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
          }}
        >
          {/* Top Specular Sheen Highlight */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Icon + Title + Close Button */}
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  isDestructive
                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-500'
                    : 'bg-[var(--accent-light)] border-[var(--accent-main)]/30 text-[var(--accent-main)]'
                }`}
              >
                {isDestructive ? (
                  <AlertTriangle className="w-4.5 h-4.5 stroke-[2.2]" />
                ) : (
                  <AlertCircle className="w-4.5 h-4.5 stroke-[2.2]" />
                )}
              </div>
              <h3 className="text-[15px] font-black tracking-tight leading-snug">
                {title}
              </h3>
            </div>

            <button
              type="button"
              onClick={closeConfirmDialog}
              aria-label="Tutup"
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 active:scale-95 transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>

          {/* Message Body */}
          <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed relative z-10">
            {message}
          </p>

          {/* Action Button Row */}
          <div className="flex items-center gap-2 pt-1 relative z-10">
            <button
              type="button"
              onClick={closeConfirmDialog}
              className="flex-1 py-2.5 px-3 rounded-full text-[11.5px] font-bold border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer tactile-active"
            >
              {cancelLabel}
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              className={`flex-1 py-2.5 px-3 rounded-full text-[11.5px] font-black shadow-md transition-all cursor-pointer tactile-active ${
                isDestructive
                  ? 'bg-rose-500 hover:bg-rose-600 text-white'
                  : 'bg-[var(--accent-main)] text-[var(--accent-contrast)] hover:opacity-95'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmDialogModal;
