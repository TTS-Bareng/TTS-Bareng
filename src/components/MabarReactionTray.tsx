import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Zap, Target, Sparkles, Trophy, X, ArrowUpRight } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { MASCOTS } from '../assets/maskots';

export const MabarReactionTray: React.FC = () => {
  const {
    activeRoomCode,
    activeClueId,
    activeReaction,
    sendReaction,
    clearReaction,
    selectClue,
    user,
  } = useGameStore();

  if (!activeRoomCode) return null;

  const quickReactions = [
    { id: 'help', text: 'Bantu kata ini!', icon: HelpCircle, withClue: true },
    { id: 'praise', text: 'Mantap!', icon: Zap, withClue: false },
    { id: 'close', text: 'Tinggal dikit!', icon: Target, withClue: false },
    { id: 'idea', text: 'Ada ide?', icon: Sparkles, withClue: true },
    { id: 'gg', text: 'GG!', icon: Trophy, withClue: false },
  ];

  const handleSend = (text: string, withClue: boolean) => {
    sendReaction(text, withClue ? activeClueId || undefined : undefined);
  };

  const isPartnerMessage = activeReaction && activeReaction.senderName !== user.name;

  return (
    <div className="w-full flex flex-col items-center relative z-25 pointer-events-none select-none">
      {/* 1. Floating Animated Reaction Balloon */}
      <AnimatePresence>
        {activeReaction && (
          <motion.div
            key={activeReaction.id}
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -14, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 350 }}
            className={`pointer-events-auto max-w-[92%] px-3 py-1.5 rounded-2xl shadow-xl flex items-center gap-2 mb-1.5 border backdrop-blur-xl ${
              isPartnerMessage
                ? 'bg-black/85 dark:bg-black/90 border-[var(--accent-main)]/40 text-white'
                : 'bg-white/90 dark:bg-white/15 border-black/10 dark:border-white/15 text-[var(--text-primary)]'
            }`}
          >
            {/* Sender Avatar */}
            <div className="w-5.5 h-5.5 rounded-full overflow-hidden bg-white/20 border border-white/30 shrink-0 flex items-center justify-center">
              <img
                src={activeReaction.avatar || MASCOTS.crosswordChampion}
                alt={activeReaction.senderName}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Reaction Content */}
            <div className="flex items-center gap-1.5 text-left truncate">
              <span className="text-[10px] font-black opacity-80 shrink-0">
                {activeReaction.senderName}:
              </span>
              <span className="text-[11px] font-black truncate">
                {activeReaction.text}
              </span>

              {/* Clue Target Shortcut Pill */}
              {activeReaction.clueId && activeReaction.clueNumber && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeReaction.clueId) {
                      selectClue(activeReaction.clueId);
                    }
                  }}
                  className="px-2 py-0.5 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[8.5px] font-black tracking-wider uppercase inline-flex items-center gap-0.5 shrink-0 cursor-pointer tactile-active shadow-2xs hover:opacity-90"
                  title="Fokus ke kata ini"
                >
                  <span>
                    #{activeReaction.clueNumber} {activeReaction.clueDirection === 'across' ? 'Mendatar' : 'Menurun'}
                  </span>
                  <ArrowUpRight className="w-2.5 h-2.5 stroke-[2.5]" />
                </button>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={clearReaction}
              className="p-1 rounded-full hover:bg-white/20 opacity-70 hover:opacity-100 cursor-pointer tactile-active shrink-0 ml-1"
              title="Tutup"
            >
              <X className="w-3 h-3 stroke-[2.5]" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Compact Horizontal Quick Reaction Pill Bar */}
      <div className="w-full px-3.5 pb-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar pointer-events-auto">
        <span className="text-[8px] font-black uppercase tracking-wider text-[var(--text-secondary)] shrink-0 pl-0.5">
          PING:
        </span>
        {quickReactions.map((q) => {
          const Icon = q.icon;
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => handleSend(q.text, q.withClue)}
              className="py-1 px-2.5 rounded-full liquid-glass-card border border-black/5 dark:border-white/10 text-[9.5px] font-black flex items-center gap-1 shrink-0 cursor-pointer tactile-active hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-primary)] transition-all shadow-2xs active:scale-95"
            >
              <Icon className="w-3 h-3 text-[var(--accent-main)] stroke-[2.2]" />
              <span>{q.text}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MabarReactionTray;
