import { Capacitor } from '@capacitor/core';
import { SignInWithApple, type SignInWithAppleResponse } from '@capacitor-community/apple-sign-in';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Perform Sign in with Apple:
 * - On native iOS: 100% Native iOS Face ID / Touch ID / Passcode sheet via @capacitor-community/apple-sign-in,
 *   exchanging identityToken directly with Supabase Auth (zero browser popup, zero redirect).
 * - On web / non-iOS: Graceful OAuth fallback via Supabase OAuth.
 */
export async function performAppleSignIn(): Promise<{
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

  // 1. Native Sign in with Apple (iOS only): In-App Native Face ID / Touch ID sheet
  if (isNative && isIos) {
    try {
      const result: SignInWithAppleResponse = await SignInWithApple.authorize({
        clientId: 'com.syntheticae.ttsbareng',
        redirectURI: 'https://qrkfjacugcalegzhcatp.supabase.co/auth/v1/callback',
        scopes: 'email name',
      });

      const identityToken = result.response?.identityToken;
      if (!identityToken) {
        return { error: 'Tidak menerima token autentikasi dari Apple.' };
      }

      // 20-second timeout safeguard to protect network resilience
      const authPromise = supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: identityToken,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Koneksi verifikasi Apple ID batas waktu habis (20 detik).')), 20000)
      );

      const { data: authData, error: authError } = await Promise.race([authPromise, timeoutPromise]);

      if (authError) {
        return { error: authError.message };
      }

      return {
        user: authData?.user,
        session: authData?.session,
      };
    } catch (appleErr: any) {
      // Detect user cancellation (ASAuthorizationError code 1001 or "canceled")
      const isCancel =
        appleErr?.message?.toLowerCase().includes('cancel') ||
        appleErr?.message?.includes('1001') ||
        appleErr?.code === 1001 ||
        appleErr?.code === '1001';

      if (isCancel) {
        // User intentionally dismissed the Apple bottom sheet - no error banner
        return { canceled: true };
      }

      return { error: appleErr?.message || 'Gagal masuk dengan Apple ID' };
    }
  }

  // 2. Fallback on Web / Android: Supabase OAuth
  const redirectTo = isNative ? 'ttsbareng://auth-callback' : window.location.origin;

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
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
    return { error: err?.message || 'Gagal memulai Sign in with Apple' };
  }
}
