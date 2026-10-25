import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export const NetworkStatusBar: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true;
  });

  const [showRestoredNotice, setShowRestoredNotice] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredNotice(true);
      // Trigger silent background cloud sync
      useGameStore.getState().syncWithCloud();

      const timer = setTimeout(() => {
        setShowRestoredNotice(false);
      }, 2500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          key="offline-banner"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          className="fixed top-[max(10px,env(safe-area-inset-top))] inset-x-4 max-w-[340px] mx-auto z-40 px-3.5 py-1.5 rounded-full liquid-glass-card border border-[var(--accent-main)]/35 bg-[var(--accent-light)] text-[var(--accent-main)] text-[10.5px] font-bold shadow-lg flex items-center justify-center gap-2 backdrop-blur-xl pointer-events-none select-none"
        >
          <WifiOff className="w-3.5 h-3.5 stroke-[2.2] shrink-0 text-[var(--accent-main)]" />
          <span>Mode Offline • Permainan tersimpan di perangkat</span>
        </motion.div>
      )}

      {isOnline && showRestoredNotice && (
        <motion.div
          key="online-restored-banner"
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 24, stiffness: 320 }}
          className="fixed top-[max(10px,env(safe-area-inset-top))] inset-x-4 max-w-[340px] mx-auto z-40 px-3.5 py-1.5 rounded-full liquid-glass-card border border-[var(--accent-main)]/35 bg-[var(--accent-light)] text-[var(--text-primary)] text-[10.5px] font-bold shadow-lg flex items-center justify-center gap-2 backdrop-blur-xl pointer-events-none select-none"
        >
          <Wifi className="w-3.5 h-3.5 stroke-[2.2] shrink-0 text-[var(--accent-main)]" />
          <span>Koneksi Pulih • Tersambung Kembali</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NetworkStatusBar;
