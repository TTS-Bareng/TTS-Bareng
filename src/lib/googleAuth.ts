import { Capacitor } from '@capacitor/core';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { supabase, isSupabaseConfigured } from './supabase';

export const GOOGLE_WEB_CLIENT_ID = '260911640333-mues538f6c5csidqdfcigda2pstavhd9.apps.googleusercontent.com';

/**
 * Perform Sign in with Google:
 * - On native iOS: 100% In-App Google Sheet modal via @capawesome/capacitor-google-sign-in,
 *   exchanging idToken directly with Supabase Auth via signInWithIdToken (ZERO Safari redirect, ZERO xxxx.supabase.co domain!).
 * - On web / non-iOS: Graceful OAuth fallback via Supabase OAuth.
 */
export async function performGoogleSignIn(): Promise<{
  user?: any;
  session?: any;
  error?: string;
  canceled?: boolean;
}> {
  if (!isSupabaseConfigured) {
    return { error: 'Layanan Supabase belum terkonfigurasi' };
  }

  const isNative = Capacitor.isNativePlatform();
  const isIos = Capacitor.getPlatform() === 'ios';

  // 1. Native Sign in with Google (iOS): In-App Native Google bottom sheet modal
  if (isNative && isIos) {
    try {
      await GoogleSignIn.initialize({
        clientId: GOOGLE_WEB_CLIENT_ID,
      });

      // Generate cryptographically secure nonce
      const rawNonce =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2) + Date.now().toString(36);

      const result = await GoogleSignIn.signIn({
        nonce: rawNonce,
      });

      const idToken = result?.idToken;
      if (!idToken) {
        return { error: 'Tidak menerima token autentikasi dari Google.' };
      }

      // 20-second timeout safeguard to protect network resilience
      const authPromise = supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
        nonce: rawNonce,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Koneksi verifikasi Akun Google batas waktu habis (20 detik).')), 20000)
      );

      const { data: authData, error: authError } = await Promise.race([authPromise, timeoutPromise]);

      if (authError) {
        return { error: authError.message };
      }

      return {
        user: authData?.user,
        session: authData?.session,
      };
    } catch (googleErr: any) {
      // Detect user cancellation (User dismissed Google Sign-In sheet)
      const isCancel =
        googleErr?.message?.toLowerCase().includes('cancel') ||
        googleErr?.message?.toLowerCase().includes('batal') ||
        googleErr?.message?.includes('12501') ||
        googleErr?.message?.includes('SIGN_IN_CANCELED') ||
        googleErr?.code === 12501 ||
        googleErr?.code === '12501' ||
        googleErr?.code === 'SIGN_IN_CANCELED';

      if (isCancel) {
        // User intentionally dismissed the Google sheet - exit cleanly without error banner
        return { canceled: true };
      }

      return { error: googleErr?.message || 'Gagal masuk dengan Akun Google' };
    }
  }

  // 2. Fallback on Web / Android: Supabase OAuth
  const redirectTo = isNative ? 'ttsbareng://auth-callback' : window.location.origin;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: isNative,
      },
    });

    if (error) {
      return { error: error.message };
    }

    if (isNative && data?.url) {
      window.open(data.url, '_system');
    }

    return { user: data };
  } catch (err: any) {
    return { error: err?.message || 'Gagal memulai Sign in with Google' };
  }
}

/**
 * Clean sign out helper for Google Sign-In on native platform
 */
export async function performGoogleSignOut(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await GoogleSignIn.signOut();
    } catch {
      // Ignore if not signed in via Google
    }
  }
}
