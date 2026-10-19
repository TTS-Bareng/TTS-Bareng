import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/useGameStore';
import { Tile } from './Tile';

export const FloatingGrid: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { level, closeKeyboard } = useGameStore();
  const { rows, cols } = level.size;

  const [containerSize, setContainerSize] = useState({ width: 360, height: 320 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        if (clientWidth > 0 && clientHeight > 0) {
          setContainerSize({ width: clientWidth, height: clientHeight });
        }
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Responsive tile size based on BOTH available width and height
  const gapSize = 4;
  const paddingH = 20; // 10px safe horizontal padding
  const paddingV = 28; // 14px safe vertical padding to protect top and bottom from clipping
  const maxTileByWidth = Math.floor((containerSize.width - paddingH - (cols - 1) * gapSize) / cols);
  const maxTileByHeight = Math.floor((containerSize.height - paddingV - (rows - 1) * gapSize) / rows);

  // Constrain tile size gracefully between 20px and 44px
  const tileSize = Math.max(22, Math.min(44, Math.min(maxTileByWidth, maxTileByHeight)));

  return (
    <div
      ref={containerRef}
      onClick={(e) => {
        // Tapping the empty grid background closes the active keyboard
        if (e.target === e.currentTarget) {
          closeKeyboard();
        }
      }}
      className="w-full flex-1 flex overflow-auto py-3 px-3.5 select-none relative z-10 touch-manipulation min-h-0 overscroll-contain scroll-smooth"
    >
      <motion.div
        key={level.id}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="m-auto grid p-1.5 transition-all duration-300 relative shrink-0"
        style={{
          gap: `${gapSize}px`,
          gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
          gridTemplateRows: `repeat(${rows}, ${tileSize}px)`,
        }}
      >
        {/* Render ONLY active tiles. Empty cells are not rendered at all (zero black boxes) */}
        {level.tiles.map((tile) => (
          <Tile
            key={`${tile.r}-${tile.c}`}
            r={tile.r}
            c={tile.c}
            style={{
              gridRow: tile.r + 1,
              gridColumn: tile.c + 1,
              width: `${tileSize}px`,
              height: `${tileSize}px`,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};
