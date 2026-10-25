import React, { useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';
import { useGameStore } from './store/useGameStore';
import { applyTheme } from './lib/themes';
import { parseDeepLink, clearUrlParams } from './lib/deeplink';
import { HomeView } from './views/HomeView';
import { NavigationBottomBar } from './components/NavigationBottomBar';
import { NetworkStatusBar } from './components/NetworkStatusBar';
import { notificationService } from './lib/notificationService';
import { soundManager } from './lib/audio';
import { revenueCatService } from './lib/revenueCatService';
import { gameCenterService } from './lib/gameCenterService';
import { supabase, isSupabaseConfigured } from './lib/supabase';

// Lazy-loaded views & modals for instant initial launch (< 200ms)
const ArenaView = lazy(() => import('./views/ArenaView').then((m) => ({ default: m.ArenaView })));
const GameView = lazy(() => import('./views/GameView').then((m) => ({ default: m.GameView })));
const QuestsView = lazy(() => import('./views/QuestsView').then((m) => ({ default: m.QuestsView })));
const ProfileView = lazy(() => import('./views/ProfileView').then((m) => ({ default: m.ProfileView })));
const SettingsView = lazy(() => import('./views/SettingsView').then((m) => ({ default: m.SettingsView })));
const AuthModal = lazy(() => import('./components/AuthModal').then((m) => ({ default: m.AuthModal })));
const LevelSelectModal = lazy(() => import('./components/LevelSelectModal').then((m) => ({ default: m.LevelSelectModal })));
const LeaderboardModal = lazy(() => import('./components/LeaderboardModal').then((m) => ({ default: m.LeaderboardModal })));
const ShareModal = lazy(() => import('./components/ShareModal').then((m) => ({ default: m.ShareModal })));
const StreakSavedModal = lazy(() => import('./components/StreakSavedModal').then((m) => ({ default: m.StreakSavedModal })));
const LeagueModal = lazy(() => import('./components/LeagueModal').then((m) => ({ default: m.LeagueModal })));
const AchievementDetailModal = lazy(() => import('./components/AchievementDetailModal').then((m) => ({ default: m.AchievementDetailModal })));
const LexiconModal = lazy(() => import('./components/LexiconModal').then((m) => ({ default: m.LexiconModal })));
const AvatarPickerModal = lazy(() => import('./components/AvatarPickerModal').then((m) => ({ default: m.AvatarPickerModal })));
const LegalModal = lazy(() => import('./components/LegalModal').then((m) => ({ default: m.LegalModal })));
const PlayerIdModal = lazy(() => import('./components/PlayerIdModal').then((m) => ({ default: m.PlayerIdModal })));
const CreateTournamentModal = lazy(() => import('./components/CreateTournamentModal').then((m) => ({ default: m.CreateTournamentModal })));
const JoinTournamentModal = lazy(() => import('./components/JoinTournamentModal').then((m) => ({ default: m.JoinTournamentModal })));
const TournamentResultModal = lazy(() => import('./components/TournamentResultModal').then((m) => ({ default: m.TournamentResultModal })));
const NotificationPromptModal = lazy(() => import('./components/NotificationPromptModal').then((m) => ({ default: m.NotificationPromptModal })));
const QuickMatchModal = lazy(() => import('./components/QuickMatchModal').then((m) => ({ default: m.QuickMatchModal })));
const SachetOfferModal = lazy(() => import('./components/SachetOfferModal').then((m) => ({ default: m.SachetOfferModal })));
const VipSubscriptionModal = lazy(() => import('./components/VipSubscriptionModal').then((m) => ({ default: m.VipSubscriptionModal })));
const StoreKitSandboxModal = lazy(() => import('./components/StoreKitSandboxModal').then((m) => ({ default: m.StoreKitSandboxModal })));
const CustomCrosswordModal = lazy(() => import('./components/CustomCrosswordModal').then((m) => ({ default: m.CustomCrosswordModal })));
const InitialAuthView = lazy(() => import('./views/InitialAuthView').then((m) => ({ default: m.InitialAuthView })));
const OnboardingView = lazy(() => import('./views/OnboardingView').then((m) => ({ default: m.OnboardingView })));

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
    initialAuthStage,
    joinTournament,
    openDailyRushBriefing,
    openVipModal,
    stars,
    streak,
  } = useGameStore();

  // Listen for local notification tap actions (Daily Rush, Game, Arena)
  useEffect(() => {
    notificationService.initActionListener((route) => {
      if (route === 'daily_rush') {
        setCurrentTab('home');
        openDailyRushBriefing();
      } else if (route === 'game') {
        setCurrentTab('game');
      } else if (route === 'arena') {
        setCurrentTab('arena');
      }
    });
  }, [openDailyRushBriefing, setCurrentTab]);

  // Sync Lo-Fi Focus Ambient Sound on mount if previously enabled by user
  useEffect(() => {
    const { ambientEnabled, soundEnabled, ambientVolume } = useGameStore.getState();
    if (ambientEnabled && soundEnabled) {
      soundManager.startFocusAmbient(ambientVolume);
    }
  }, []);

  // Initialize RevenueCat SDK & Verify Apple VIP Entitlements
  useEffect(() => {
    const user = useGameStore.getState().user;
    revenueCatService.initialize(user?.id).then(async () => {
      const isVipActive = await revenueCatService.checkVipStatus();
      if (isVipActive && !useGameStore.getState().isVip) {
        useGameStore.getState().setIsVip(true);
      }
    });
  }, []);

  // Initialize Apple Game Center in background on iOS
  useEffect(() => {
    gameCenterService.initialize();
  }, []);

  // Sync Game Center leaderboards & achievements on score/streak updates
  useEffect(() => {
    const { levelRecords } = useGameStore.getState();
    const hasCompletedChapter1 = Boolean(
      levelRecords['level_1_santai']?.completed || levelRecords['0']?.completed
    );
    let totalSolved = 0;
    Object.values(levelRecords).forEach((rec) => {
      totalSolved += rec.solved?.length || 0;
    });

    gameCenterService.syncAll({
      stars,
      streak,
      totalSolvedWords: totalSolved,
      hasCompletedChapter1,
    });
  }, [stars, streak]);

  // Listen for Supabase OAuth Callback (e.g. Sign in with Apple)
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const currentUser = useGameStore.getState().user;
        const userEmail = session.user.email || 'pemain@ttsbareng.id';
        const provider = session.user.app_metadata?.provider || 'oauth';
        const isGoogle = provider === 'google';
        const isApple = provider === 'apple';
        const fallbackName = isGoogle ? 'Pemain Google' : isApple ? 'Pemain Apple' : 'Pemain TTS';

        const userName =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          (currentUser.name !== 'Pemain TTS' && currentUser.name !== 'Tamu' ? currentUser.name : fallbackName);

        if (currentUser.email !== userEmail) {
          useGameStore.getState().proceedToOnboarding({
            email: userEmail,
            name: userName,
            isGuest: false,
          });
          const toastMsg = isGoogle
            ? '✨ Berhasil masuk dengan Akun Google!'
            : isApple
            ? '✨ Berhasil masuk dengan Apple ID!'
            : '✨ Berhasil masuk ke akun Anda!';
          useGameStore.getState().showGlobalToast(toastMsg);
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Apply theme tokens on initial mount and when theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Check daily streak and streak shield protection on initial mount
  useEffect(() => {
    checkDailyStreakOnMount();
  }, [checkDailyStreakOnMount]);

  // Deep Link & URL Query Sync Engine (?room=TTS-XXXX, ?tourney=CUP-XXXX, ?level=N, or ?vip=1)
  useEffect(() => {
    const { roomCode, tournamentCode, levelIndex, vip } = parseDeepLink(levels.length);
    if (vip) {
      openVipModal();
      clearUrlParams();
    } else if (tournamentCode) {
      joinTournament(tournamentCode);
      setCurrentTab('arena');
      showGlobalToast(`Membuka Turnamen: ${tournamentCode}`, 3200);
      clearUrlParams();
    } else if (roomCode) {
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
  }, [joinTournament, levels.length, openVipModal, selectLevel, setActiveRoomCode, setCurrentTab, showGlobalToast]);

  // Native iOS & Android deep link listener (e.g. ttsbareng://room=ABCD or universal links)
  useEffect(() => {
    let removeListener: (() => void) | undefined;
    try {
      CapacitorApp.addListener('appUrlOpen', (event) => {
        if (!event?.url) return;
        try {
          const urlObj = new URL(event.url);
          const roomParam = urlObj.searchParams.get('room') || urlObj.searchParams.get('join') || urlObj.searchParams.get('kamar');
          const tourneyParam = urlObj.searchParams.get('tourney') || urlObj.searchParams.get('cup');
          const levelParam = urlObj.searchParams.get('level') || urlObj.searchParams.get('bab') || urlObj.searchParams.get('lvl');
          const vipParam = urlObj.searchParams.get('vip') || urlObj.searchParams.get('paywall');

          if (vipParam === 'true' || vipParam === '1') {
            openVipModal();
          } else if (tourneyParam) {
            joinTournament(tourneyParam.trim().toUpperCase());
            setCurrentTab('arena');
            showGlobalToast(`Membuka Turnamen: ${tourneyParam.toUpperCase()}`, 3000);
          } else if (roomParam) {
            setActiveRoomCode(roomParam.trim().toUpperCase());
            setCurrentTab('arena');
            showGlobalToast(`Menghubungkan ke Kamar: ${roomParam.toUpperCase()}`, 3000);
          } else if (levelParam) {
            const lvl = parseInt(levelParam, 10);
            if (!isNaN(lvl) && lvl > 0 && lvl <= levels.length) {
              selectLevel(lvl - 1);
              setCurrentTab('game');
              showGlobalToast(`Membuka Bab ${lvl}`, 3000);
            }
          }
        } catch (e) {
          console.warn('[DeepLink] Gagal memproses native deep link:', e);
        }
      }).then((handle) => {
        removeListener = () => handle.remove();
      });
    } catch {}

    return () => {
      removeListener?.();
    };
  }, [joinTournament, levels.length, openVipModal, selectLevel, setActiveRoomCode, setCurrentTab, showGlobalToast]);

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
      className={`w-full h-[100dvh] mx-auto flex flex-col justify-between relative overflow-hidden select-none transition-all duration-300 ${
        currentTab === 'game'
          ? 'max-w-[430px] md:max-w-4xl lg:max-w-5xl'
          : 'max-w-[430px] md:max-w-xl lg:max-w-2xl'
      }`}
      style={{
        background: 'var(--bg-gradient)',
      }}
    >
      {/* 0. Network Offline/Online Status Bar */}
      <NetworkStatusBar />

      {/* 0. Floating Global Toast Alert Notification */}
      <AnimatePresence>
        {globalToast && (
          <motion.div
            key="global-toast-pill"
            initial={{ opacity: 0, y: -24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.92 }}
            transition={{ type: 'spring', damping: 22, stiffness: 340 }}
            className="fixed top-[max(12px,env(safe-area-inset-top))] inset-x-4 max-w-[380px] mx-auto z-50 px-4 py-2 rounded-full liquid-glass-card border border-[var(--accent-main)]/35 shadow-2xl flex items-center justify-center gap-2 text-[12px] font-bold text-[var(--text-primary)] backdrop-blur-xl pointer-events-none"
          >
            <Sparkles className="w-4 h-4 text-[var(--accent-main)] stroke-[2.2] shrink-0" />
            <span className="truncate">{globalToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Conditional Flow: 1. Initial Login -> 2. Onboarding -> 3. Main Game Views */}
      {initialAuthStage === 'auth' ? (
        <Suspense fallback={<ViewLoadingFallback />}>
          <InitialAuthView />
        </Suspense>
      ) : initialAuthStage === 'onboarding' ? (
        <Suspense fallback={<ViewLoadingFallback />}>
          <OnboardingView />
        </Suspense>
      ) : (
        <>
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
        </>
      )}

      {/* 3. Global Modals (Auth, Leaderboard, Share, Retention, League, Lexicon, AvatarPicker, Legal) with Suspense */}
      <Suspense fallback={null}>
        <AuthModal />
        <LevelSelectModal />
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
        <LegalModal />
        <PlayerIdModal />
        <CreateTournamentModal />
        <JoinTournamentModal />
        <TournamentResultModal />
        <NotificationPromptModal />
        <QuickMatchModal />
        <SachetOfferModal />
        <VipSubscriptionModal />
        <StoreKitSandboxModal />
        <CustomCrosswordModal />
      </Suspense>
    </div>
  );
};

export default App;
