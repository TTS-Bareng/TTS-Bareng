import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

/**
 * Universal Haptic Engine for iOS Taptic Engine & Web Vibration API.
 * Solves the issue where navigator.vibrate is completely disabled on iOS Safari/WKWebView.
 */
class HapticEngine {
  private isNative: boolean;

  constructor() {
    this.isNative = typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform();
  }

  /**
   * Light impact: Keystrokes, navigation, subtle button clicks
   */
  async light(fallbackMs = 10): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
        return;
      } catch {
        // Fall through
      }
    }
    this.vibrateWeb(fallbackMs);
  }

  /**
   * Medium impact: Drawer toggle, letter unselect, moderate feedback
   */
  async medium(fallbackMs = 25): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Medium });
        return;
      } catch {
        // Fall through
      }
    }
    this.vibrateWeb(fallbackMs);
  }

  /**
   * Heavy impact: Match round end, heavy collisions, level reveal
   */
  async heavy(fallbackMs = 45): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Heavy });
        return;
      } catch {
        // Fall through
      }
    }
    this.vibrateWeb(fallbackMs);
  }

  /**
   * Subtle selection change: scrolling through letter wheels or list pickers
   */
  async selection(): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.selectionChanged();
        return;
      } catch {
        // Fall through
      }
    }
    this.vibrateWeb(8);
  }

  /**
   * Success notification: Correct answer, stage won, victory fanfare
   */
  async success(fallbackPattern: number[] = [20, 50, 30]): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.notification({ type: NotificationType.Success });
        return;
      } catch {
        // Fall through
      }
    }
    this.vibrateWeb(fallbackPattern);
  }

  /**
   * Warning notification: Low timer, near loss
   */
  async warning(fallbackPattern: number[] = [30, 40, 30]): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.notification({ type: NotificationType.Warning });
        return;
      } catch {
        // Fall through
      }
    }
    this.vibrateWeb(fallbackPattern);
  }

  /**
   * Error notification: Incorrect word, blocked move, invalid submission
   */
  async error(fallbackPattern: number[] = [35, 45]): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.notification({ type: NotificationType.Error });
        return;
      } catch {
        // Fall through
      }
    }
    this.vibrateWeb(fallbackPattern);
  }

  /**
   * Generic pattern dispatcher with native mapping and web vibration fallback
   */
  async pattern(type: 'light' | 'medium' | 'heavy' | 'success' | 'error', fallbackPattern?: number | number[]): Promise<void> {
    switch (type) {
      case 'light':
        return this.light(typeof fallbackPattern === 'number' ? fallbackPattern : 10);
      case 'medium':
        return this.medium(typeof fallbackPattern === 'number' ? fallbackPattern : 25);
      case 'heavy':
        return this.heavy(typeof fallbackPattern === 'number' ? fallbackPattern : 45);
      case 'success':
        return this.success(Array.isArray(fallbackPattern) ? fallbackPattern : [20, 50, 30]);
      case 'error':
        return this.error(Array.isArray(fallbackPattern) ? fallbackPattern : [35, 45]);
    }
  }

  private vibrateWeb(pattern: number | number[]) {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignore
      }
    }
  }

  // ======================================================================
  // TUNED HIG SEMANTIC FEEDBACK (APPLE TAPTIC ENGINE)
  // ======================================================================

  /**
   * Keyboard letter tap: Crisp Apple Light impact
   */
  async keyTap(): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
        return;
      } catch {}
    }
    this.vibrateWeb(6);
  }

  /**
   * Backspace / Delete: Distinct subtle selection tick
   */
  async keyDelete(): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.selectionChanged();
        return;
      } catch {}
    }
    this.vibrateWeb(8);
  }

  /**
   * Word solved correctly: Apple Pay / Touch ID style success double-pulse
   */
  async wordSolved(): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.notification({ type: NotificationType.Success });
        return;
      } catch {}
    }
    this.vibrateWeb([20, 50, 20]);
  }

  /**
   * Word wrong / Invalid input: Distinct error notification
   */
  async wordWrong(): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.notification({ type: NotificationType.Error });
        return;
      } catch {}
    }
    this.vibrateWeb([35, 45]);
  }

  /**
   * Level completed fanfare: Ascending celebration cascade
   */
  async levelComplete(): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.notification({ type: NotificationType.Success });
        setTimeout(() => {
          Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
        }, 180);
        return;
      } catch {}
    }
    this.vibrateWeb([30, 40, 50]);
  }

  /**
   * Navigation / Tab switch / Map node tap: Smooth selection wheel tick
   */
  async navSelection(): Promise<void> {
    if (this.isNative) {
      try {
        await Haptics.selectionChanged();
        return;
      } catch {}
    }
    this.vibrateWeb(6);
  }
}

export const haptic = new HapticEngine();
