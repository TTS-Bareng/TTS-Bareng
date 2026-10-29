import { Capacitor } from '@capacitor/core';
import { MASCOTS } from '../assets/maskots';

let deferredPrompt: BeforeInstallPromptEvent | null = null;
const installListeners = new Set<(canInstall: boolean) => void>();

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * Register Service Worker for offline PWA operation
 */
export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || Capacitor.isNativePlatform() || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('[PWA] Service Worker registration failed:', error);
      });
  });

  // Listen for native install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    installListeners.forEach((cb) => cb(true));
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    installListeners.forEach((cb) => cb(false));
    console.log('[PWA] TTS Bareng has been installed successfully');
  });
}

/**
 * Check if the app is currently installable
 */
export function canInstallPWA(): boolean {
  return deferredPrompt !== null;
}

/**
 * Trigger native PWA install prompt
 */
export async function promptPWAInstall(): Promise<boolean> {
  if (!deferredPrompt) return false;

  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    installListeners.forEach((cb) => cb(false));
    return choice.outcome === 'accepted';
  } catch {
    return false;
  }
}

/**
 * Subscribe to installability changes
 */
export function onInstallabilityChange(callback: (canInstall: boolean) => void): () => void {
  installListeners.add(callback);
  callback(deferredPrompt !== null);
  return () => installListeners.delete(callback);
}

/**
 * Background Preload of all 3D Plush Mascot WebP images
 * Executes during browser idle time so UI renders with 0ms latency
 */
export function preloadMascots(): void {
  if (typeof window === 'undefined') return;

  const preloadImages = () => {
    const mascotUrls = Object.values(MASCOTS);
    mascotUrls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  };

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(preloadImages, { timeout: 3000 });
  } else {
    setTimeout(preloadImages, 1200);
  }
}
