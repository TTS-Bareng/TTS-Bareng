import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const NOTIFICATION_IDS = {
  DAILY_RUSH: 1001,
  EVENING_RELAX: 1002,
  STREAK_SAVER: 1003,
} as const;

export const notificationService = {
  /**
   * Check if local notifications are supported on current platform
   */
  isSupported(): boolean {
    return Capacitor.isNativePlatform();
  },

  /**
   * Check current permission status
   */
  async checkPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const status = await LocalNotifications.checkPermissions();
      return status.display === 'granted';
    } catch (err) {
      console.warn('Check notification permission error:', err);
      return false;
    }
  },

  /**
   * Request permission from user
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const status = await LocalNotifications.requestPermissions();
      return status.display === 'granted';
    } catch (err) {
      console.warn('Request notification permission error:', err);
      return false;
    }
  },

  /**
   * Schedule smart retention reminders:
   * 1. 10:00 WIB - Daily Rush Drop
   * 2. 19:00 WIB - Evening Relax Time
   * 3. 21:00 WIB - Streak Saver (only if not yet played today)
   */
  async scheduleDailyRetention(streakCount: number = 1): Promise<void> {
    if (!this.isSupported()) return;

    try {
      const hasPermission = await this.checkPermission();
      if (!hasPermission) return;

      // Cancel previous scheduled notifications to avoid duplicates
      await this.cancelAll();

      const now = new Date();

      // Helper to compute target schedule time (today or tomorrow)
      const getNextOccurrence = (hour: number, minute: number = 0) => {
        const target = new Date();
        target.setHours(hour, minute, 0, 0);
        if (target <= now) {
          // If time has passed today, schedule for tomorrow
          target.setDate(target.getDate() + 1);
        }
        return target;
      };

      const notifications: LocalNotificationSchema[] = [
        // 1. Daily Rush 10:00 WIB
        {
          id: NOTIFICATION_IDS.DAILY_RUSH,
          title: 'Teka-Teki Kilat Hari Ini Telah Terbit!',
          body: 'Papan 90 detik siap diuji. Raih skor tertinggi di papan rekor nasional!',
          schedule: {
            at: getNextOccurrence(10, 0),
            every: 'day',
            allowWhileIdle: true,
          },
          sound: 'beep.wav',
          extra: {
            route: 'daily_rush',
          },
        },

        // 2. Evening Relax 19:00 WIB
        {
          id: NOTIFICATION_IDS.EVENING_RELAX,
          title: 'Waktunya Asah Otak Santai',
          body: 'Luangkan 5 menit untuk mengisi TTS malam ini dan kumpulkan bintangmu!',
          schedule: {
            at: getNextOccurrence(19, 0),
            every: 'day',
            allowWhileIdle: true,
          },
          sound: 'beep.wav',
          extra: {
            route: 'game',
          },
        },

        // 3. Streak Saver 21:00 WIB (Urgent for today if not yet played)
        {
          id: NOTIFICATION_IDS.STREAK_SAVER,
          title: 'Api Streak Kamu Hampir Padam!',
          body: `Streak ${Math.max(1, streakCount)} hari kamu akan hangus dalam 3 jam! Selesaikan 1 level sekarang.`,
          schedule: {
            at: getNextOccurrence(21, 0),
            every: 'day',
            allowWhileIdle: true,
          },
          sound: 'beep.wav',
          extra: {
            route: 'game',
          },
        },
      ];

      await LocalNotifications.schedule({ notifications });
    } catch (err) {
      console.warn('Failed to schedule daily notifications:', err);
    }
  },

  /**
   * Cancel today's 21:00 streak warning once user finishes a level today
   */
  async cancelTodayStreakWarning(): Promise<void> {
    if (!this.isSupported()) return;
    try {
      await LocalNotifications.cancel({
        notifications: [{ id: NOTIFICATION_IDS.STREAK_SAVER }],
      });
    } catch (err) {
      console.warn('Failed to cancel streak warning notification:', err);
    }
  },

  /**
   * Cancel all pending notifications
   */
  async cancelAll(): Promise<void> {
    if (!this.isSupported()) return;
    try {
      await LocalNotifications.cancel({
        notifications: [
          { id: NOTIFICATION_IDS.DAILY_RUSH },
          { id: NOTIFICATION_IDS.EVENING_RELAX },
          { id: NOTIFICATION_IDS.STREAK_SAVER },
        ],
      });
    } catch (err) {
      console.warn('Failed to cancel all notifications:', err);
    }
  },

  /**
   * Listen to notification tap actions to route to corresponding screen
   */
  initActionListener(onNavigate: (route: string) => void) {
    if (!this.isSupported()) return;

    try {
      LocalNotifications.addListener(
        'localNotificationActionPerformed',
        (notificationAction) => {
          const route = notificationAction.notification.extra?.route;
          if (route) {
            onNavigate(route);
          }
        }
      );
    } catch (err) {
      console.warn('Failed to initialize notification action listener:', err);
    }
  },
};
