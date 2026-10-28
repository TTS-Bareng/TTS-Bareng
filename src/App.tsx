import React, { useEffect, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { App as CapacitorApp } from '@capacitor/app';
import { useGameStore, getOnboardedKey } from './store/useGameStore';
import { applyTheme } from './lib/themes';
import { parseDeepLink, clearUrlParams, decodeCustomCrosswordParam } from './lib/deeplink';
import { generateCustomCrossword } from './lib/customCrosswordGenerator';
import { HomeView } from './views/HomeView';
import { NavigationBottomBar } from './components/NavigationBottomBar';
import { ActiveGameResumeBanner } from './components/ActiveGameResumeBanner';
import { NetworkStatusBar } from './components/NetworkStatusBar';
import { notificationService } from './lib/notificationService';
import { soundManager } from './lib/audio';
import { revenueCatService } from './lib/revenueCatService';
import { supabase, isSupabaseConfigured, fetchUserProfile } from './lib/supabase';
import { syncWidgetSnapshot, getPendingWidgetAction, clearPendingWidgetAction } from './lib/widgetSync';
import { getEloTier } from './lib/eloSystem';

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
const CustomCrosswordQrModal = lazy(() => import('./components/CustomCrosswordQrModal').then((m) => ({ default: m.CustomCrosswordQrModal })));
const ImportCustomCrosswordModal = lazy(() => import('./components/ImportCustomCrosswordModal').then((m) => ({ default: m.ImportCustomCrosswordModal })));
const CancelSubscriptionModal = lazy(() => import('./components/CancelSubscriptionModal').then((m) => ({ default: m.CancelSubscriptionModal })));
const VipSuccessModal = lazy(() => import('./components/VipSuccessModal').then((m) => ({ default: m.VipSuccessModal })));
const BattleResultModal = lazy(() => import('./components/BattleResultModal').then((m) => ({ default: m.BattleResultModal })));
const BattleLobbyModal = lazy(() => import('./components/BattleLobbyModal').then((m) => ({ default: m.BattleLobbyModal })));
const ConfirmDialogModal = lazy(() => import('./components/ConfirmDialogModal').then((m) => ({ default: m.ConfirmDialogModal })));
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
    openScanner,
    openJoinTournament,
    streak,
    streakShields,
    stars,
    currentLevelIndex,
    eloRating,
    isVip,
    dailyRushRecord,
    playCustomCrossword,
    saveUserCustomCrossword,
  } = useGameStore();

  // Listen for local notification tap actions (Daily Rush, Game, Arena)
  useEffect(() => {
    notificationService.initActionListener((route) => {
      if (route === 'game') {
        setCurrentTab('game');
      } else if (route === 'arena' || route === 'daily_rush') {
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
    revenueCatService.initialize(user?.id).then(async (configured) => {
      if (configured && !revenueCatService.getIsMockMode()) {
        const isVipActive = await revenueCatService.checkVipStatus();
        if (useGameStore.getState().isVip !== isVipActive) {
          useGameStore.getState().setIsVip(isVipActive);
        }
      }
    });
  }, []);

  // Listen for Supabase OAuth Callback (e.g. Sign in with Apple)
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // 1. Bind RevenueCat identity to Supabase user ID and check VIP entitlement
        let verifiedVip = false;
        try {
          await revenueCatService.logIn(session.user.id);
          if (!revenueCatService.getIsMockMode()) {
            verifiedVip = await revenueCatService.checkVipStatus();
          }
        } catch {}

        // 2. Fetch cloud profile to check existing history and VIP status
        const cloud = await fetchUserProfile(session.user.id).catch(() => null);
        if (!verifiedVip && cloud?.is_vip === true) {
          verifiedVip = true;
        }

        // Strictly synchronize VIP: never leak stale local state onto unverified users
        if (useGameStore.getState().isVip !== verifiedVip) {
          useGameStore.getState().setIsVip(verifiedVip);
        }

        const currentUser = useGameStore.getState().user;
        const userEmail = session.user.email || 'pemain@ttsbareng.id';
        const provider = session.user.app_metadata?.provider || 'oauth';
        const isGoogle = provider === 'google';
        const isApple = provider === 'apple';
        const fallbackName = isGoogle ? 'Pemain Google' : isApple ? 'Pemain Apple' : 'Pemain TTS';

        const userName =
          cloud?.name ||
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          (currentUser.name !== 'Pemain TTS' && currentUser.name !== 'Tamu' ? currentUser.name : fallbackName);

        const userAvatar =
          cloud?.avatar ||
          session.user.user_metadata?.avatar_url ||
          currentUser.avatar ||
          '/maskot/Fierce Plush Crossword Champion.webp';

        // Check Onboarding Routing Invariant:
        // A. Per-user local storage key
        // B. Supabase user_metadata?.onboarded === true
        // C. Existing cloud game history (words solved > 0 or custom name)
        const localOnboarded = localStorage.getItem(getOnboardedKey(session.user.id)) === 'true';
        const metaOnboarded = session.user.user_metadata?.onboarded === true;
        const cloudHasHistory = Boolean(
          cloud &&
          ((cloud.total_words_solved && cloud.total_words_solved > 0) ||
           (cloud.name && cloud.name !== 'Pemain TTS' && cloud.name !== 'Tamu'))
        );

        const isAlreadyOnboarded = localOnboarded || metaOnboarded || cloudHasHistory;

        const toastMsg = isGoogle
          ? '✨ Berhasil masuk dengan Akun Google!'
          : isApple
          ? '✨ Berhasil masuk dengan Apple ID!'
          : '✨ Berhasil masuk ke akun Anda!';
        useGameStore.getState().showGlobalToast(toastMsg);

        if (isAlreadyOnboarded) {
          // Returning player: skip onboarding, mark per-user key, go straight to main game
          localStorage.setItem(getOnboardedKey(session.user.id), 'true');
          const updatedUser = {
            ...currentUser,
            id: session.user.id,
            email: userEmail,
            name: userName,
            isGuest: false,
            avatar: userAvatar,
            joinedAt: currentUser.joinedAt !== 'Mode Tamu' && currentUser.joinedAt !== 'Hari ini' ? currentUser.joinedAt : 'Oktober 2026',
          };
          localStorage.setItem('tts_quest_user', JSON.stringify(updatedUser));
          useGameStore.setState({
            user: updatedUser,
            initialAuthStage: 'completed',
          });
        } else {
          // Brand new user: MUST route to OnboardingView to select name and avatar
          useGameStore.getState().proceedToOnboarding({
            id: session.user.id,
            email: userEmail,
            name: userName,
            isGuest: false,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        revenueCatService.logOut().catch(() => {});
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

  // Deep Link & URL Query Sync Engine (?room=TTS-XXXX, ?tourney=CUP-XXXX, ?level=N, ?custom=..., or ?vip=1)
  useEffect(() => {
    const { roomCode, tournamentCode, levelIndex, vip, customCrossword } = parseDeepLink(levels.length);
    if (vip) {
      openVipModal();
      clearUrlParams();
    } else if (customCrossword) {
      try {
        const generatedLevel = generateCustomCrossword(
          customCrossword.title,
          customCrossword.category,
          customCrossword.wordsList.map((w) => ({ word: w.answer, clue: w.clue }))
        );
        const customItem = {
          id: `custom_${Date.now()}`,
          title: customCrossword.title,
          category: customCrossword.category || 'Kreasi Teman',
          wordsList: customCrossword.wordsList.map((w) => ({ word: w.answer, clue: w.clue })),
          level: generatedLevel,
          createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        };
        saveUserCustomCrossword(customItem);
        playCustomCrossword(customItem);
        showGlobalToast(`Membuka TTS Kustom: "${customCrossword.title}"`, 3500);
      } catch {
        showGlobalToast('Gagal memuat TTS Kustom dari tautan.', 3000);
      }
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
  }, [joinTournament, levels.length, openVipModal, playCustomCrossword, selectLevel, setActiveRoomCode, setCurrentTab, showGlobalToast]);

  // Centralized action handler for widget taps and deep links
  const handleWidgetAction = (action: string) => {
    if (action === 'rush' || action === 'play') {
      setCurrentTab('game');
      showGlobalToast('Membuka Permainan TTS...', 2500);
    } else if (action === 'scan') {
      openJoinTournament();
      openScanner();
      showGlobalToast('Mengaktifkan Kamera Pemindai QR...', 2500);
    } else if (action === 'home') {
      setCurrentTab('home');
    } else if (action === 'arena') {
      setCurrentTab('arena');
    }
  };

  // Helper to sync native iOS Widget Snapshot with current store data
  const syncWidgetStateToNative = () => {
    const currentLvl = levels[currentLevelIndex] || levels[0];
    const today = new Date().toISOString().split('T')[0];
    const isRushDone = Boolean(dailyRushRecord && dailyRushRecord.date === today && dailyRushRecord.completed);

    syncWidgetSnapshot({
      streak: streak ?? 0,
      streakShields: streakShields ?? 0,
      stars: stars ?? 0,
      currentLevel: (currentLevelIndex ?? 0) + 1,
      currentLevelTitle: currentLvl?.title || `Bab ${(currentLevelIndex ?? 0) + 1}`,
      currentRealmName: currentLvl?.category || 'Jelajah Nusantara',
      eloRating: eloRating ?? 1000,
      eloTier: getEloTier(eloRating ?? 1000).name,
      isVip: Boolean(isVip),
      dailyRushCompleted: isRushDone,
      dailyRushScore: dailyRushRecord?.score || 0,
      wordOfTheDay: {
        word: 'SEKATA',
        clue: 'Satu pendapat atau seia sekata',
        category: 'KBBI Daring',
      },
    });
  };

  // Synchronize Native iOS Widget Snapshot (Home Screen, Lock Screen, Control Center)
  useEffect(() => {
    syncWidgetStateToNative();
  }, [streak, streakShields, stars, currentLevelIndex, eloRating, isVip, dailyRushRecord, levels]);

  // Process pending iOS 18 Control Center / Lock Screen actions and re-sync on foreground resume
  useEffect(() => {
    const checkPendingAction = async () => {
      const pendingAction = await getPendingWidgetAction();
      if (pendingAction) {
        handleWidgetAction(pendingAction);
        await clearPendingWidgetAction();
      }
    };

    // Run check on initial app mount
    checkPendingAction();
    syncWidgetStateToNative();

    let resumeListener: (() => void) | undefined;
    try {
      CapacitorApp.addListener('appStateChange', (state) => {
        if (state.isActive) {
          checkPendingAction();
          syncWidgetStateToNative();
        }
      }).then((handle) => {
        resumeListener = () => handle.remove();
      });
    } catch {}

    return () => {
      resumeListener?.();
    };
  }, []);

  // Native iOS & Android deep link listener (e.g. ttsbareng://room=ABCD or universal links)
  useEffect(() => {
    let removeListener: (() => void) | undefined;
    try {
      CapacitorApp.addListener('appUrlOpen', (event) => {
        if (!event?.url) return;
        try {
          // 0. Handle Supabase OAuth Deep Link Callback (e.g. ttsbareng://auth-callback#access_token=... or ?code=...)
          if (event.url.includes('auth-callback') || event.url.startsWith('ttsbareng://auth') || event.url.includes('access_token')) {
            const rawUrl = event.url;
            const hashIndex = rawUrl.indexOf('#');
            const searchIndex = rawUrl.indexOf('?');
            
            let paramsString = '';
            if (hashIndex !== -1) {
              paramsString = rawUrl.substring(hashIndex + 1);
            } else if (searchIndex !== -1) {
              paramsString = rawUrl.substring(searchIndex + 1);
            }

            const params = new URLSearchParams(paramsString);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            const code = params.get('code');

            if (accessToken && refreshToken) {
              supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              }).then(({ data, error }) => {
                if (data?.session) {
                  showGlobalToast('Berhasil masuk! Menyiapkan profil...');
                } else if (error) {
                  showGlobalToast(`Gagal masuk: ${error.message}`);
                }
              });
              return;
            } else if (code) {
              supabase.auth.exchangeCodeForSession(code).then(({ data, error }) => {
                if (data?.session) {
                  showGlobalToast('Berhasil masuk! Menyiapkan profil...');
                } else if (error) {
                  showGlobalToast(`Gagal masuk: ${error.message}`);
                }
              });
              return;
            }
          }

          const urlObj = new URL(event.url);
          const roomParam = urlObj.searchParams.get('room') || urlObj.searchParams.get('join') || urlObj.searchParams.get('kamar');
          const tourneyParam = urlObj.searchParams.get('tourney') || urlObj.searchParams.get('cup');
          const levelParam = urlObj.searchParams.get('level') || urlObj.searchParams.get('bab') || urlObj.searchParams.get('lvl');
          const vipParam = urlObj.searchParams.get('vip') || urlObj.searchParams.get('paywall');
          const customParam = urlObj.searchParams.get('custom') || urlObj.searchParams.get('tts');

          if (customParam) {
            const decoded = decodeCustomCrosswordParam(customParam);
            if (decoded) {
              try {
                const generatedLevel = generateCustomCrossword(
                  decoded.title,
                  decoded.category,
                  decoded.wordsList.map((w) => ({ word: w.answer, clue: w.clue }))
                );
                const customItem = {
                  id: `custom_${Date.now()}`,
                  title: decoded.title,
                  category: decoded.category || 'Kreasi Teman',
                  wordsList: decoded.wordsList.map((w) => ({ word: w.answer, clue: w.clue })),
                  level: generatedLevel,
                  createdAt: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
                };
                saveUserCustomCrossword(customItem);
                playCustomCrossword(customItem);
                showGlobalToast(`Membuka TTS Kustom: "${decoded.title}"`, 3500);
                return;
              } catch {}
            }
          }

          if (event.url.includes('//rush') || event.url.includes('tab=rush')) {
            handleWidgetAction('rush');
          } else if (event.url.includes('//scan') || event.url.includes('action=scan')) {
            handleWidgetAction('scan');
          } else if (event.url.includes('//play') || event.url.includes('action=play')) {
            handleWidgetAction('play');
          } else if (event.url.includes('//home')) {
            handleWidgetAction('home');
          } else if (event.url.includes('//arena')) {
            handleWidgetAction('arena');
          } else if (vipParam === 'true' || vipParam === '1') {
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
  }, [joinTournament, levels.length, openVipModal, playCustomCrossword, selectLevel, setActiveRoomCode, setCurrentTab, showGlobalToast]);

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
      className={`w-full h-[100dvh] mx-auto flex flex-col justify-between relative overflow-hidden select-none transition-[max-width] duration-300 ${
        currentTab === 'game'
          ? 'max-w-[430px] md:max-w-4xl lg:max-w-5xl'
          : 'max-w-[430px] md:max-w-xl lg:max-w-2xl'
      }`}
      style={{
        background: 'var(--bg-gradient)',
      }}
    >
      {/* 0. Isolated Floating Overlays (Zero Layout Shift on Popups/Toasts) */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <NetworkStatusBar />

        {/* Floating Global Toast Alert Notification */}
        <AnimatePresence>
          {globalToast && (
            <motion.div
              key="global-toast-pill"
              initial={{ opacity: 0, y: -24, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.92 }}
              transition={{ type: 'spring', damping: 22, stiffness: 340 }}
              className="fixed top-[max(12px,env(safe-area-inset-top))] inset-x-4 max-w-[380px] mx-auto px-4 py-2 rounded-full liquid-glass-card border border-[var(--accent-main)]/35 shadow-2xl flex items-center justify-center gap-2 text-[12px] font-bold text-[var(--text-primary)] backdrop-blur-xl pointer-events-none"
            >
              <Sparkles className="w-4 h-4 text-[var(--accent-main)] stroke-[2.2] shrink-0" />
              <span className="truncate">{globalToast}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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

          {/* Floating Active Game Session Resume Banner */}
          <ActiveGameResumeBanner />

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
        <CustomCrosswordQrModal />
        <ImportCustomCrosswordModal />
        <VipSuccessModal />
        <CancelSubscriptionModal />
        <BattleResultModal />
        <BattleLobbyModal />
        <ConfirmDialogModal />
      </Suspense>
    </div>
  );
};

export default App;
