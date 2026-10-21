import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { copyToClipboard } from './clipboard';

export interface ShareOptions {
  title: string;
  text: string;
  url?: string;
  dialogTitle?: string;
}

/**
 * Universal Native Share Sheet triggering:
 * - iOS: UIActivityViewController (WhatsApp, Messages, AirDrop, Telegram, Instagram, etc.)
 * - Android: Intent.ACTION_SEND chooser
 * - Web: Navigator.share or Clipboard Copy fallback
 */
export async function shareNative(options: ShareOptions): Promise<'shared' | 'copied' | 'cancelled'> {
  // 1. Capacitor Native Share Plugin (iOS & Android)
  if (Capacitor.isNativePlatform()) {
    try {
      const canShare = await Share.canShare().catch(() => ({ value: true }));
      if (canShare.value) {
        await Share.share({
          title: options.title,
          text: options.text,
          url: options.url,
          dialogTitle: options.dialogTitle || options.title,
        });
        return 'shared';
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const msg = err.message.toLowerCase();
        if (err.name === 'AbortError' || msg.includes('canceled') || msg.includes('cancelled')) {
          return 'cancelled';
        }
      }
      console.warn('[NativeShare] Capacitor Share failed, trying Web fallback', err);
    }
  }

  // 2. Web Share API fallback (Safari, Chrome Mobile, modern browsers)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: options.title,
        text: options.text,
        url: options.url,
      });
      return 'shared';
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return 'cancelled';
      }
      console.warn('[NativeShare] navigator.share failed, falling back to clipboard copy', err);
    }
  }

  // 3. Fallback to copying formatted text & url to clipboard
  const payload = [options.text, options.url].filter(Boolean).join('\n').trim();
  const copied = await copyToClipboard(payload);
  return copied ? 'copied' : 'cancelled';
}

/**
 * WhatsApp Specific Share Helper:
 * - On iOS/Android: uses direct `whatsapp://send?text=` URL scheme so WKWebView launches WhatsApp app directly
 * - Fallback to `@capacitor/share` native sheet if scheme launch encounters issues
 * - On Web Browser: opens `https://api.whatsapp.com/send?text=` in a new tab
 */
export async function shareToWhatsApp(options: { text: string; url?: string }): Promise<'shared' | 'opened' | 'copied'> {
  const fullText = [options.text, options.url].filter(Boolean).join('\n').trim();
  const encoded = encodeURIComponent(fullText);

  if (Capacitor.isNativePlatform()) {
    try {
      // In iOS WKWebView / Android WebView, window.location.href navigates to custom schemes cleanly
      window.location.href = `whatsapp://send?text=${encoded}`;
      return 'opened';
    } catch (schemeErr) {
      console.warn('[WhatsApp] Scheme direct navigation failed, opening native share sheet', schemeErr);
      const res = await shareNative({
        title: 'Bagikan via WhatsApp',
        text: options.text,
        url: options.url,
      });
      return res === 'copied' ? 'copied' : 'shared';
    }
  }

  // Desktop or mobile Web browser
  if (typeof window !== 'undefined') {
    try {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
      return 'opened';
    } catch {
      const copied = await copyToClipboard(fullText);
      return copied ? 'copied' : 'opened';
    }
  }

  return 'copied';
}
