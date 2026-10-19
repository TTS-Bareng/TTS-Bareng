import React, { useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useGameStore } from './store/useGameStore';
import { applyTheme } from './lib/themes';
import { parseDeepLink, clearUrlParams } from './lib/deeplink';
import { HomeView } from './views/HomeView';
import { NavigationBottomBar } from './components/NavigationBottomBar';

// Lazy-loaded views & modals for instant initial launch (< 200ms)
const ArenaView = lazy(() => import('./views/ArenaView').then((m) => ({ default: m.ArenaView })));
const GameView = lazy(() => import('./views/GameView').then((m) => ({ default: m.GameView })));
const QuestsView = lazy(() => import('./views/QuestsView').then((m) => ({ default: m.QuestsView })));
const ProfileView = lazy(() => import('./views/ProfileView').then((m) => ({ default: m.ProfileView })));
const SettingsView = lazy(() => import('./views/SettingsView').then((m) => ({ default: m.SettingsView })));
const AuthModal = lazy(() => import('./components/AuthModal').then((m) => ({ default: m.AuthModal })));
const LeaderboardModal = lazy(() => import('./components/LeaderboardModal').then((m) => ({ default: m.LeaderboardModal })));
const ShareModal = lazy(() => import('./components/ShareModal').then((m) => ({ default: m.ShareModal })));
const StreakSavedModal = lazy(() => import('./components/StreakSavedModal').then((m) => ({ default: m.StreakSavedModal })));
const LeagueModal = lazy(() => import('./components/LeagueModal').then((m) => ({ default: m.LeagueModal })));
const AchievementDetailModal = lazy(() => import('./components/AchievementDetailModal').then((m) => ({ default: m.AchievementDetailModal })));
const LexiconModal = lazy(() => import('./components/LexiconModal').then((m) => ({ default: m.LexiconModal })));
const AvatarPickerModal = lazy(() => import('./components/AvatarPickerModal').then((m) => ({ default: m.AvatarPickerModal })));

const ViewLoadingFallback: React.FC = () => (
  <div className="w-full flex-1 flex flex-col items-center justify-center p-8 select-none">
    <div className="w-8 h-8 rounded-full border-2 border-[var(--accent-main)] border-t-transparent animate-spin mb-2.5" />
    <span className="text-[11px] font-bold text-[var(--text-secondary)]">
      Memuat Halaman...
    </span>
  </div>
);

export const App: React.FC = () => {
  const {
    theme,
    currentTab,
    setCurrentTab,
    levels,
    selectLevel,
    activeClueId,
    level,
    isLevelCompleteOpen,
    isAuthOpen,
    isAvatarPickerOpen,
    closeAvatarPicker,
    inputLetter,
    deleteLetter,
    closeKeyboard,
    checkAnswers,
    nextClue,
    prevClue,
    selectClue,
    setActiveRoomCode,
    globalToast,
    showGlobalToast,
    checkDailyStreakOnMount,
  } = useGameStore();

  // Apply theme tokens on initial mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Check daily streak and streak shield protection on initial mount
  useEffect(() => {
    checkDailyStreakOnMount();
  }, [checkDailyStreakOnMount]);

  // Deep Link & URL Query Sync Engine (?room=TTS-XXXX or ?level=N)
  useEffect(() => {
    const { roomCode, levelIndex } = parseDeepLink(levels.length);
    if (roomCode) {
      setActiveRoomCode(roomCode);
      setCurrentTab('social');
      showGlobalToast(`Bergabung ke Kamar Teman: ${roomCode}`, 3200);
      clearUrlParams();
    } else if (typeof levelIndex === 'number') {
      selectLevel(levelIndex);
      setCurrentTab('game');
      showGlobalToast(`Membuka Bab ${levelIndex + 1} dari Tautan Teman`, 3200);
      clearUrlParams();
    } else {
      // Check saved active room for automatic session restoration
      const savedRoom = localStorage.getItem('tts_quest_active_room');
      if (savedRoom) {
        setActiveRoomCode(savedRoom);
        showGlobalToast(`Menyambung kembali ke kamar: ${savedRoom}`, 2800);
      }
    }
  }, [levels.length, selectLevel, setActiveRoomCode, setCurrentTab, showGlobalToast]);

  // Physical keyboard support for desktop/laptop testing when in Game view
  useEffect(() => {
    if (currentTab !== 'game') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if any modal is active
      if (isLevelCompleteOpen || isAuthOpen) return;

      if (e.key === 'Escape') {
        closeKeyboard();
        return;
      }

      if (e.key === 'Enter') {
        checkAnswers();
        return;
      }

      if (e.key === 'Backspace') {
        deleteLetter();
        return;
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        prevClue();
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextClue();
        return;
      }

      // Check A-Z alphabet input
      if (/^[a-zA-Z]$/.test(e.key)) {
        if (!activeClueId) {
          const firstClue = level.clues.across[0] || level.clues.down[0];
          if (firstClue) selectClue(firstClue.id);
        }
        inputLetter(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    currentTab,
    activeClueId,
    isLevelCompleteOpen,
    isAuthOpen,
    level,
    inputLetter,
    deleteLetter,
    closeKeyboard,
    checkAnswers,
    nextClue,
    prevClue,
    selectClue,
  ]);

  return (
    <div
      className="w-full h-[100dvh] max-w-[430px] mx-auto flex flex-col justify-between relative overflow-hidden select-none transition-colors duration-300"
      style={{
        background: 'var(--bg-gradient)',
      }}
    >
      {/* 0. Floating Global Toast Alert Notification */}
      <AnimatePresence>
        {globalToast && (
          <motion.div
            key="global-toast-pill"
            initial={{ opacity: 0, y: -24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 340 }}
            className="fixed top-3 inset-x-4 max-w-[380px] mx-auto z-50 px-4 py-2 rounded-full liquid-glass-card border border-[var(--accent-main)]/35 shadow-2xl flex items-center justify-center gap-2 text-[12px] font-bold text-[var(--text-primary)] backdrop-blur-xl pointer-events-none"
          >
            <Sparkles className="w-4 h-4 text-[var(--accent-main)] stroke-[2.2] shrink-0" />
            <span className="truncate">{globalToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Main View Container with Suspense Boundary */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        {currentTab === 'home' && <HomeView />}
        <Suspense fallback={<ViewLoadingFallback />}>
          {(currentTab === 'arena' || currentTab === 'social') && <ArenaView />}
          {currentTab === 'game' && <GameView />}
          {currentTab === 'quests' && <QuestsView />}
          {(currentTab === 'profile' || currentTab === 'stats') && <ProfileView />}
          {currentTab === 'settings' && <SettingsView />}
        </Suspense>
      </div>

      {/* 2. Sleek Bottom Tab Navigation */}
      <NavigationBottomBar />

      {/* 3. Global Modals (Auth, Leaderboard, Share, Retention, League, Lexicon, AvatarPicker) with Suspense */}
      <Suspense fallback={null}>
        <AuthModal />
        <LeaderboardModal />
        <ShareModal />
        <StreakSavedModal />
        <LeagueModal />
        <AchievementDetailModal />
        <LexiconModal />
        <AvatarPickerModal
          isOpen={isAvatarPickerOpen}
          onClose={closeAvatarPicker}
        />
      </Suspense>
    </div>
  );
};

export default App;
