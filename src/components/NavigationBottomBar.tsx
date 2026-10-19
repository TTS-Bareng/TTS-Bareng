import React from 'react';
import { Home, Sparkles, Gamepad2, User, Settings } from 'lucide-react';
import { useGameStore, type TabType } from '../store/useGameStore';

export const NavigationBottomBar: React.FC = () => {
  const { currentTab, setCurrentTab } = useGameStore();

  // In Game tab (core crossword arena), hide bottom navigation bar so clue ribbon and keyboard have full breathing space
  if (currentTab === 'game') {
    return null;
  }

  const items: { id: TabType; label: string; icon: React.FC<{ className?: string }>; isCenter?: boolean }[] = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'quests', label: 'Misi', icon: Sparkles },
    { id: 'arena', label: 'Arena', icon: Gamepad2, isCenter: true },
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <nav
      className="absolute bottom-3 left-3 right-3 z-30 select-none"
      aria-label="Navigasi Utama"
    >
      <div className="w-full h-[62px] rounded-full liquid-glass-nav flex items-center justify-around px-1 shadow-2xl relative overflow-hidden">
        {/* Specular gloss sheen reflection on top edge */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

        {items.map((item) => {
          const isActive =
            currentTab === item.id ||
            (item.id === 'arena' && currentTab === 'social') ||
            (item.id === 'profile' && currentTab === 'stats');
          const IconComponent = item.icon;

          if (item.isCenter) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentTab(item.id)}
                className="relative flex flex-col items-center justify-center flex-1 py-1 rounded-full transition-all duration-200 cursor-pointer tactile-active group"
              >
                <div
                  className={`w-11 h-8 rounded-full flex items-center justify-center transition-all liquid-glass-center-btn ${
                    isActive ? 'scale-105 shadow-sm' : 'hover:opacity-90'
                  }`}
                >
                  <Gamepad2 className="w-4 h-4 text-[var(--accent-contrast)] stroke-[2.2]" />
                </div>
                <span className={`text-[9px] tracking-tight leading-none mt-0.5 font-bold ${
                  isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          }

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
                className={`w-9 h-7 rounded-full flex items-center justify-center transition-all ${
                  isActive
                    ? 'bg-[var(--accent-light)] border border-[var(--accent-main)]/30 shadow-xs'
                    : 'bg-transparent border border-transparent'
                }`}
              >
                <IconComponent className={`w-4 h-4 ${isActive ? 'stroke-[2.5] text-[var(--accent-main)]' : 'stroke-[1.8] text-[var(--text-secondary)]'}`} />
              </div>
              <span className={`text-[9px] tracking-tight leading-none mt-0.5 ${
                isActive ? 'text-[var(--accent-main)] font-black' : 'text-[var(--text-secondary)] font-medium'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default NavigationBottomBar;
