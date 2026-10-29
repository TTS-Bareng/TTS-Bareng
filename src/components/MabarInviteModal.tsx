import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, X, ArrowRight } from 'lucide-react';
import type { MabarInvite } from '../lib/socialSync';

interface MabarInviteModalProps {
  invite: MabarInvite | null;
  onAccept: (roomCode: string) => void;
  onDecline: () => void;
}

export const MabarInviteModal: React.FC<MabarInviteModalProps> = ({
  invite,
  onAccept,
  onDecline,
}) => {
  if (!invite) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm rounded-[28px] p-5 relative overflow-hidden liquid-glass-card border border-black/10 dark:border-white/15 shadow-2xl flex flex-col items-center text-center gap-3.5"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Top Specular Sheen */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Close button */}
          <button
            type="button"
            onClick={onDecline}
            aria-label="Tutup"
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer tactile-active"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon Badge */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center border border-[var(--accent-main)]/30 shadow-md"
            style={{ background: 'var(--accent-light)' }}
          >
            {invite.fromAvatar ? (
              <img
                src={invite.fromAvatar}
                alt={invite.fromName}
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <Gamepad2 className="w-7 h-7 text-[var(--accent-main)]" />
            )}
          </div>

          <div className="flex flex-col gap-1 px-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[var(--accent-main)]">
              Undangan Mabar 1 Papan
            </span>
            <h3 className="text-[17px] font-black tracking-tight text-[var(--text-primary)] leading-snug">
              {invite.fromName} Mengajak Mabar!
            </h3>
            <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">
              Bergabung ke Kamar <span className="font-black text-[var(--text-primary)]">{invite.roomCode}</span> untuk memecahkan teka-teki silang bersama secara real-time.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="w-full flex flex-col gap-2 pt-1">
            <button
              type="button"
              onClick={() => onAccept(invite.roomCode)}
              className="w-full py-3 px-4 rounded-2xl font-black text-[13px] cursor-pointer tactile-active shadow-md flex items-center justify-center gap-2 border border-white/20 transition-all"
              style={{ background: 'var(--accent-grad)', color: 'var(--accent-contrast)' }}
            >
              <span>Gabung Sekarang</span>
              <ArrowRight className="w-4 h-4 stroke-[2.4]" />
            </button>

            <button
              type="button"
              onClick={onDecline}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-[11.5px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer tactile-active transition-colors"
            >
              Nanti Saja
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
