import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, Flame, Loader2 } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { Header } from '../components/Header';
import { FloatingGrid } from '../components/FloatingGrid';
import { DynamicClueRibbon } from '../components/DynamicClueRibbon';
import { CustomKeyboard } from '../components/CustomKeyboard';
import { ClueListDrawer } from '../components/ClueListDrawer';
import { LevelCompleteModal } from '../components/LevelCompleteModal';
import { MabarReactionTray } from '../components/MabarReactionTray';
import { AnagramWheelDrawer } from '../components/AnagramWheelDrawer';
import { TabletClueCompanion } from '../components/TabletClueCompanion';

export const GameView: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const {
    activeClueId,
    selectClue,
    level,
    solvedClues,
    validationMessage,
    comboMessage,
    gameMode,
    tickBattleTimer,
    isBattleResultOpen,
    isTournamentResultOpen,
    battleTimeLeft,
    partnerReconnecting,
  } = useGameStore();

  // 1v1 Battle countdown interval
  useEffect(() => {
    if (
      gameMode !== '1v1_battle' ||
      isBattleResultOpen ||
      isTournamentResultOpen ||
      battleTimeLeft <= 0
    ) {
      return;
    }
    const timer = setInterval(() => {
      tickBattleTimer();
    }, 1000);
    return () => clearInterval(timer);
  }, [gameMode, isBattleResultOpen, isTournamentResultOpen, battleTimeLeft, tickBattleTimer]);

  // Auto-focus first unsolved clue when entering game if none active
  useEffect(() => {
    if (!activeClueId) {
      const allClues = [...level.clues.across, ...level.clues.down];
      const firstUnsolved = allClues.find((c) => !solvedClues.includes(c.id)) || allClues[0];
      if (firstUnsolved) {
        selectClue(firstUnsolved.id);
      }
    }
  }, [activeClueId, level, selectClue, solvedClues]);

  return (
    <div className="w-full flex-1 flex flex-col md:flex-row min-h-0 relative overflow-hidden select-none">
      {/* Primary Pane: Header, Responsive Crossword Board, Clue Ribbon, Keyboard */}
      <div className="flex-1 flex flex-col justify-between min-h-0 relative overflow-hidden">
        {/* 1. Header: Stage Bab, Live Timer, Bintang & Live Progress */}
        <Header />

        {/* 2. Papan Kisi Terapung Bebas (Unboxed Responsive Board) */}
        <main className="flex-1 flex flex-col min-h-0 relative z-10 overflow-hidden">
          <FloatingGrid />
        </main>

        {/* 3. Area Bawah Terpadu: Combo Toast + Validation Toast + Dynamic Clue Ribbon + Floating Keyboard */}
        <div className="w-full flex flex-col z-30 shrink-0">
          <AnimatePresence mode="wait">
            {comboMessage && !validationMessage && (
              <motion.div
                key="combo-badge"
                initial={{ opacity: 0, y: 12, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.92 }}
                transition={{ type: 'spring', damping: 20, stiffness: 320 }}
                className="mx-auto mb-1.5 px-3.5 py-1 rounded-full border border-[var(--accent-main)]/35 bg-[var(--accent-light)] text-[var(--accent-main)] text-[11px] font-black tracking-wide shadow-lg flex items-center gap-1.5 pointer-events-none backdrop-blur-md"
              >
                <Flame className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{comboMessage}</span>
              </motion.div>
            )}

            {validationMessage && (
              <motion.div
                key="validation-badge"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="mx-auto mb-1.5 px-3.5 py-1 rounded-full border border-[var(--accent-main)]/30 bg-[var(--accent-light)] text-[var(--accent-main)] text-[11px] font-bold shadow-lg flex items-center gap-1.5 pointer-events-none backdrop-blur-md"
              >
                <Info className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{validationMessage}</span>
              </motion.div>
            )}

            {partnerReconnecting && (
              <motion.div
                key="reconnecting-badge"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="mx-auto mb-1.5 px-3.5 py-1 rounded-full border border-[var(--accent-main)]/35 bg-[var(--accent-light)] text-[var(--accent-main)] text-[10.5px] font-bold shadow-lg flex items-center gap-1.5 pointer-events-none backdrop-blur-md"
              >
                <Loader2 className="w-3 h-3 animate-spin stroke-[2.5]" />
                <span>{partnerReconnecting} terputus... Menunggu tersambung kembali</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Mabar Quick Reaction & Ping Balloon Tray */}
          <MabarReactionTray />

          {/* Modern 2-Row Dynamic Island Clue Capsule */}
          <DynamicClueRibbon onOpenDrawer={() => setIsDrawerOpen(true)} />

          {/* Apple Tactile Liquid Floating Keyboard with Quick Utility Action Bar */}
          <CustomKeyboard />
        </div>
      </div>

      {/* iPad / Tablet Responsive Clue Companion Pane (>= 768px) */}
      <TabletClueCompanion />

      {/* 4. Bottom Sheet Drawer: Daftar Semua Petunjuk Mendatar & Menurun */}
      <ClueListDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* 5. Modals & Drawers */}
      <LevelCompleteModal />
      <AnagramWheelDrawer />
    </div>
  );
};

export default GameView;
