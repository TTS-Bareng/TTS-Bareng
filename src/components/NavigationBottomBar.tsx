import React from 'react';
import { Home, Sparkles, Gamepad2, User } from 'lucide-react';
import { useGameStore, type TabType } from '../store/useGameStore';

export const NavigationBottomBar: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    isScannerOpen,
    isBattleLobbyOpen,
  } = useGameStore();

  // Hide bottom navigation bar ONLY when actively playing a crossword game or in full-screen camera/matchmaking takeovers
  if (
    currentTab === 'game' ||
    isScannerOpen ||
    isBattleLobbyOpen
  ) {
    return null;
  }

  const items: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'arena', label: 'Arena', icon: Gamepad2 },
    { id: 'quests', label: 'Misi', icon: Sparkles },
    { id: 'profile', label: 'Profil', icon: User },
  ];

  return (
    <>
      {/* 1. Apple Ambient Bottom Shield & Vignette Dissolve (z-40, pointer-events-none) */}
      <div className="apple-bottom-ambient-shield" aria-hidden="true" />

      {/* 2. Floating Liquid Glass Navbar Capsule (z-50) */}
      <nav
        className="absolute bottom-[max(12px,calc(6px+env(safe-area-inset-bottom)))] left-3 right-3 z-50 select-none"
        aria-label="Navigasi Utama"
      >
        <div className="w-full h-[62px] rounded-full liquid-glass-nav flex items-center justify-around px-1.5 shadow-2xl relative overflow-hidden">
          {/* Specular gloss sheen reflection on top edge */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

          {items.map((item) => {
            const isActive =
              currentTab === item.id ||
              (item.id === 'arena' && currentTab === 'social') ||
              (item.id === 'profile' && (currentTab === 'stats' || currentTab === 'settings'));
            const IconComponent = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentTab(item.id)}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 rounded-full transition-all duration-200 cursor-pointer tactile-active ${
                  isActive
                    ? 'text-[var(--accent-main)] font-black'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-semibold'
                }`}
              >
                <div
                  className={`w-10 h-7 rounded-full flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-[var(--accent-light)] border border-[var(--accent-main)]/30 shadow-xs'
                      : 'bg-transparent border border-transparent'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${isActive ? 'stroke-[2.5] text-[var(--accent-main)]' : 'stroke-[1.8] text-[var(--text-secondary)]'}`} />
                </div>
                <span className={`text-[9.5px] tracking-tight leading-none mt-0.5 ${
                  isActive ? 'text-[var(--accent-main)] font-black' : 'text-[var(--text-secondary)] font-medium'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

export default NavigationBottomBar;
