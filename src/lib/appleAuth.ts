import { Capacitor } from '@capacitor/core';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Perform Sign in with Apple via Supabase OAuth (with custom deep link callback `ttsbareng://auth-callback`
 * on native platforms, and origin on web)
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
