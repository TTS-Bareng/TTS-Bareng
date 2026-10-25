import { Capacitor, registerPlugin } from '@capacitor/core';

interface WidgetBridgePlugin {
  updateSnapshot(options: { snapshot: Record<string, any> }): Promise<{ success: boolean }>;
  reloadWidgets(): Promise<{ success: boolean }>;
}

const WidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

export interface TTSWidgetSnapshotInput {
  streak: number;
  streakShields: number;
  stars: number;
  currentLevel: number;
  currentLevelTitle: string;
  currentRealmName: string;
  eloRating: number;
  eloTier: string;
  isVip: boolean;
  dailyRushCompleted: boolean;
  dailyRushScore: number;
  wordOfTheDay?: {
    word: string;
    clue: string;
    category?: string;
  };
}

/**
 * Sync game progress to iOS App Group UserDefaults (group.com.syntheticae.ttsbareng)
 * for Home Screen, Lock Screen, and Control Center widgets.
 */
export async function syncWidgetSnapshot(input: TTSWidgetSnapshotInput): Promise<boolean> {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return false;
  }

  try {
    const snapshot = {
      ...input,
      lastUpdated: new Date().toISOString(),
    };
    const res = await WidgetBridge.updateSnapshot({ snapshot });
    return Boolean(res?.success);
  } catch (err) {
    // Silent fail in dev or if widget plugin not yet registered on current build
    console.debug('[WidgetSync] Native bridge update failed:', err);
    return false;
  }
}
