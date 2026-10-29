import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { findClueById } from '../lib/crossword';
import { getBattlePalette } from '../lib/battlePalette';

interface TileProps {
  r: number;
  c: number;
  style?: React.CSSProperties;
}

export const Tile: React.FC<TileProps> = React.memo(({ r, c, style }) => {
  const tileRef = useRef<HTMLButtonElement>(null);
  const key = `${r},${c}`;
  const level = useGameStore((s) => s.level);
  const activeClueId = useGameStore((s) => s.activeClueId);
  const isFocused = useGameStore((s) => s.focusedCell?.[0] === r && s.focusedCell?.[1] === c);
  const letter = useGameStore((s) => s.userInputs[key] || '');
  const isLocked = useGameStore((s) => Boolean(s.lockedCells[key]));
  const isPopping = useGameStore((s) => s.poppingCells.includes(key));
  const isShaking = useGameStore((s) => s.shakingCells.includes(key));
  const selectCell = useGameStore((s) => s.selectCell);
  const partnerCursorName = useGameStore((s) => (s.partnerCursor?.key === key ? s.partnerCursor.name : null));
  const cellAuthor = useGameStore((s) => s.cellAuthors[key]);
  const activeRoomCode = useGameStore((s) => s.activeRoomCode);
  const gameMode = useGameStore((s) => s.gameMode);
  const theme = useGameStore((s) => s.theme);

  const tileData = level.tiles.find((t) => t.r === r && t.c === c);

  // Auto-scroll active focused cell into view on mobile so it never hides behind keyboard or clue ribbon
  useEffect(() => {
    if (isFocused && tileRef.current) {
      tileRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [isFocused]);

  if (!tileData) {
    return null;
  }

  const isPartnerCell = !!activeRoomCode && !!letter && cellAuthor === 'partner';

  // 1v1 Tug-of-War Battle: dynamically stained with player's adaptive palette
  const isBattle = gameMode === '1v1_battle';
  const battlePalette = getBattlePalette(theme);
  const battleOwner = isBattle && isLocked && cellAuthor
    ? cellAuthor === 'local'
      ? battlePalette.p1
      : battlePalette.p2
    : null;

  // Check if this tile is part of the active clue
  const activeClue = findClueById(level, activeClueId);
  const isInActiveWord = activeClue?.cells.some(([cr, cc]) => cr === r && cc === c) ?? false;

  // Animation variants
  const animationProps = isPopping
    ? {
        scale: [0.9, 1.15, 1.0],
        transition: { duration: 0.35, ease: 'easeOut' as const },
      }
    : isShaking
    ? {
        x: [-4, 4, -4, 4, 0],
        transition: { duration: 0.35, ease: 'easeInOut' as const },
      }
    : isFocused
    ? {
        scale: 1.04,
        transition: { duration: 0.15 },
      }
    : {
        scale: 1,
      };

  return (
    <motion.button
      ref={tileRef}
      type="button"
      animate={animationProps}
      onClick={() => selectCell(r, c)}
      aria-label={`Tile baris ${r + 1} kolom ${c + 1}${tileData.number ? `, nomor ${tileData.number}` : ''}${letter ? `, huruf ${letter}` : ''}`}
      className={`relative w-full h-full min-w-[20px] min-h-[20px] rounded-[9px] sm:rounded-[11px] flex items-center justify-center cursor-pointer transition-all duration-150 tactile-active outline-none overflow-hidden select-none backdrop-blur-xl ${
        battleOwner
          ? 'z-10'
          : isFocused
          ? 'ring-2 ring-[var(--accent-main)] z-20 shadow-md scale-105'
          : isInActiveWord
          ? 'ring-1.5 ring-[var(--accent-main)]/60 z-10 border border-[var(--accent-main)]/30'
          : 'border border-black/8 dark:border-white/12 z-0'
      }`}
      style={{
        ...style,
        background: battleOwner
          ? battleOwner.grad
          : isInActiveWord
          ? 'linear-gradient(135deg, var(--accent-light) 0%, rgba(255,255,255,0.08) 100%)'
          : 'var(--tile-bg)',
        border: battleOwner ? `1.5px solid ${battleOwner.border}` : undefined,
        boxShadow: battleOwner
          ? `0 4px 14px ${battleOwner.glow}, inset 0 1px 0 rgba(255, 255, 255, 0.65), inset 0 -1.5px 0 rgba(0, 0, 0, 0.2)`
          : isFocused
          ? '0 6px 18px rgba(0, 0, 0, 0.28), inset 0 1.5px 0 rgba(255, 255, 255, 0.65), inset 0 -2px 0 rgba(0, 0, 0, 0.2)'
          : isInActiveWord
          ? '0 3px 10px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1.5px 0 rgba(0, 0, 0, 0.12)'
          : '0 2px 7px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.45), inset 0 -1.5px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Specular Top Sheen Highlight Gloss Line */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-white/20 via-white/80 dark:via-white/40 to-white/20 pointer-events-none" />

      {/* Number on top-left (scales with tile size) */}
      {tileData.number !== null && (
        <span
          className="absolute top-[1.5px] left-[2.5px] font-black leading-none pointer-events-none select-none opacity-90 text-[8px] sm:text-[9.5px]"
          style={{ color: battleOwner ? '#ffffff' : 'var(--accent-main)' }}
        >
          {tileData.number}
        </span>
      )}

      {/* Partner cell ownership indicator dot (Mabar co-op only) */}
      {!isBattle && isPartnerCell && (
        <span
          title="Diisi oleh rekan"
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--accent-main)] shadow-2xs pointer-events-none ring-1 ring-white/50"
        />
      )}

      {/* Letter in center (scales with tile size) */}
      <span
        className="font-black uppercase tracking-tight select-none pointer-events-none leading-none text-[13px] sm:text-[16px]"
        style={{
          color: battleOwner ? '#ffffff' : isLocked ? 'var(--accent-main)' : 'var(--tile-text)',
          filter: battleOwner ? 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))' : isLocked ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.15))' : 'none',
        }}
      >
        {letter}
      </span>

      {/* Typing direction indicator on focused cell */}
      {isFocused && activeClue && (
        <div className="absolute bottom-[2px] right-[2.5px] pointer-events-none opacity-80 text-[var(--accent-main)]">
          {activeClue.direction === 'across' ? (
            <ArrowRight className="w-2.5 h-2.5 stroke-[3]" />
          ) : (
            <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
          )}
        </div>
      )}

      {/* Pop pulse ring highlight for hint reveals and newly solved tiles */}
      {isPopping && (
        <motion.div
          initial={{ opacity: 0.85, scale: 0.95 }}
          animate={{ opacity: 0, scale: 1.25 }}
          transition={{ duration: 0.38, ease: 'easeOut' }}
          className="absolute inset-0 rounded-[9px] sm:rounded-[11px] ring-2 ring-[var(--accent-main)] pointer-events-none"
        />
      )}

      {/* Partner active cursor indicator (Mabar live sync) */}
      {partnerCursorName && (
        <div className="absolute inset-0 rounded-[9px] sm:rounded-[11px] ring-2 ring-[var(--accent-main)] pointer-events-none z-30 animate-pulse">
          <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[7px] font-black uppercase tracking-wider shadow-xs whitespace-nowrap">
            {partnerCursorName.split(' ')[0]}
          </span>
        </div>
      )}
    </motion.button>
  );
});
