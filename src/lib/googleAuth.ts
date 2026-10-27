import { Capacitor } from '@capacitor/core';
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';
import { supabase, isSupabaseConfigured, withTimeout, formatFriendlyNetworkError } from './supabase';

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
      // Clear any hanging or stale Google session prior to sign-in to avoid NSURLErrorDomain -1005
      try {
        await GoogleSignIn.signOut();
      } catch {
        // Safe to ignore if not currently logged in
      }

      await GoogleSignIn.initialize({
        clientId: GOOGLE_WEB_CLIENT_ID,
      });

      // Execute Google native sign-in with single automatic retry if network connection drops (-1005)
      let result;
      try {
        result = await GoogleSignIn.signIn();
      } catch (err: any) {
        const isNetworkLost =
          err?.message?.includes('The network connection was lost') ||
          err?.message?.includes('-1005') ||
          err?.message?.toLowerCase().includes('network');

        if (isNetworkLost) {
          console.warn('[GoogleAuth] Network connection dropped, attempting clean retry...');
          await new Promise((resolve) => setTimeout(resolve, 800));
          result = await GoogleSignIn.signIn();
        } else {
          throw err;
        }
      }

      const idToken = result?.idToken;
      if (!idToken) {
        return { error: 'Tidak menerima token autentikasi dari Google.' };
      }

      // Supabase verification via signInWithIdToken
      // IMPORTANT: Do NOT pass `nonce` for Google Sign-In on iOS!
      // GIDSignIn on iOS does NOT embed a nonce claim in the minted ID token.
      // Passing a nonce here causes Supabase GoTrue to fail with "nonces mismatch".
      const exchangeToken = async () => {
        return await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: idToken,
        });
      };

      let authResponse;
      try {
        authResponse = await withTimeout(
          exchangeToken(),
          25000,
          'Koneksi verifikasi Akun Google batas waktu habis (25 detik).'
        );
      } catch (tokenErr: any) {
        const isNetworkLost =
          tokenErr?.message?.includes('The network connection was lost') ||
          tokenErr?.message?.includes('-1005');

        if (isNetworkLost) {
          console.warn('[GoogleAuth] Network dropped during token exchange, retrying once...');
          await new Promise((resolve) => setTimeout(resolve, 800));
          authResponse = await withTimeout(
            exchangeToken(),
            25000,
            'Koneksi verifikasi Akun Google batas waktu habis (25 detik).'
          );
        } else {
          throw tokenErr;
        }
      }

      const { data: authData, error: authError } = authResponse;

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

      // User-friendly Indonesian error mapping for network connection loss
      if (
        googleErr?.message?.includes('The network connection was lost') ||
        googleErr?.message?.includes('-1005')
      ) {
        return {
          error: 'Koneksi internet terputus saat menghubungkan ke Akun Google. Silakan periksa jaringan dan coba lagi.',
        };
      }

      return { error: formatFriendlyNetworkError(googleErr?.message) || 'Gagal masuk dengan Akun Google' };
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
