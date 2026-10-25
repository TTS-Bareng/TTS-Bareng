import { registerPlugin, Capacitor } from '@capacitor/core';
import { supabase, isSupabaseConfigured } from './supabase';

interface NativeAppleSignInResult {
  identityToken: string;
  authorizationCode?: string;
  user?: string;
  email?: string;
  givenName?: string;
  familyName?: string;
}

interface AppleSignInPluginInterface {
  signIn(): Promise<NativeAppleSignInResult>;
}

export const NativeAppleSignIn = registerPlugin<AppleSignInPluginInterface>('AppleSignInPlugin');

/**
 * Perform 100% In-App Sign in with Apple using native iOS ASAuthorizationController
 * (Face ID / Touch ID sheet), with automatic fallback to OAuth for Web.
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

  // 1. Native iOS Platform: Trigger official iOS Apple ID Face ID sheet
  if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios') {
    try {
      const res = await NativeAppleSignIn.signIn();
      if (!res?.identityToken) {
        return { error: 'Gagal mendapatkan token autentikasi dari Apple' };
      }

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: res.identityToken,
      });

      if (error) {
        return { error: error.message };
      }

      return { user: data.user, session: data.session };
    } catch (err: any) {
      if (
        err?.code === 'CANCELED' ||
        err?.message?.includes('Dibatalkan') ||
        err?.message?.includes('canceled')
      ) {
        return { canceled: true };
      }
      return { error: err?.message || 'Gagal memulai Sign in with Apple' };
    }
  }

  // 2. Web fallback: Standard OAuth redirect
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) return { error: error.message };
    return { user: data };
  } catch (err: any) {
    return { error: err?.message || 'Gagal memulai Sign in with Apple' };
  }
}
