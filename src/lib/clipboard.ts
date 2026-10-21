import { Clipboard } from '@capacitor/clipboard';
import { Capacitor } from '@capacitor/core';

/**
 * Robust cross-platform copy to clipboard utility.
 * Works seamlessly across iOS (UIPasteboard), Android, and desktop/mobile Web.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Native platform (iOS WKWebView & Android)
  if (Capacitor.isNativePlatform()) {
    try {
      await Clipboard.write({ string: text });
      return true;
    } catch (nativeErr) {
      console.warn('[Clipboard] Native Clipboard.write failed, falling back to Web API', nativeErr);
    }
  }

  // 2. Standard Web Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (webErr) {
      console.warn('[Clipboard] navigator.clipboard.writeText failed, falling back to execCommand', webErr);
    }
  }

  // 3. Document execCommand fallback for restricted browser contexts
  if (typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      textArea.style.top = '0';
      textArea.style.opacity = '0';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) return true;
    } catch {
      // Ignore
    }
  }

  return false;
}
