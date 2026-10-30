import { Capacitor, registerPlugin, type PluginListenerHandle } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { SignInWithApple, type SignInWithAppleResponse } from '@capacitor-community/apple-sign-in';
import { supabase, isSupabaseConfigured, formatFriendlyNetworkError } from './supabase';
import { isDeletingRemoteAccount } from './deleteAuthenticatedAccount';

const AppleCredentialState = registerPlugin<{
  getCredentialState(options: { user: string }): Promise<{ state: string }>;
  addListener(event: 'credentialsRevoked', listener: () => void): Promise<PluginListenerHandle>;
}>('AppleSignInPlugin');

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

      return { error: formatFriendlyNetworkError(appleErr?.message) || 'Gagal masuk dengan Apple ID' };
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

// Obtain a fresh, single-use code without creating or replacing a Supabase session.
export async function authorizeAppleAccountDeletion(subject: string): Promise<string> {
  try {
    const result = await SignInWithApple.authorize({
      clientId: 'com.syntheticae.ttsbareng',
      redirectURI: 'https://qrkfjacugcalegzhcatp.supabase.co/auth/v1/callback',
      scopes: '',
    });
    if (result.response?.user !== subject) {
      throw new Error('Gunakan Apple ID yang terhubung ke akun TTS Bareng ini. Akun belum dihapus.');
    }
    if (!result.response.authorizationCode) throw new Error('Kode verifikasi Apple tidak tersedia. Silakan coba lagi.');
    return result.response.authorizationCode;
  } catch (error: any) {
    const message = String(error?.message ?? '');
    if (/cancel|dibatalkan|1001/i.test(message) || String(error?.code) === '1001') {
      throw new Error('Verifikasi Apple dibatalkan. Akun belum dihapus.');
    }
    throw new Error(formatFriendlyNetworkError(message) || 'Verifikasi Apple gagal. Akun belum dihapus.');
  }
}

export function watchAppleCredentialRevocation(onRevoked: (userId: string) => Promise<void>): () => void {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') return () => {};
  let disposed = false;
  let checking = false;
  const listeners: PluginListenerHandle[] = [];
  const check = async () => {
    if (disposed || checking || isDeletingRemoteAccount()) return;
    checking = true;
    try {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;
      const subject = user?.identities?.find(identity => identity.provider === 'apple')?.identity_data?.sub;
      if (!user || typeof subject !== 'string') return;
      const result = await AppleCredentialState.getCredentialState({ user: subject });
      if (!disposed && !isDeletingRemoteAccount() && (result.state === 'revoked' || result.state === 'notFound')) {
        await onRevoked(user.id);
      }
    } catch {
      // An unavailable credential check must not log a valid user out.
    } finally {
      checking = false;
    }
  };
  const retain = (handle: PluginListenerHandle) => {
    if (disposed) void handle.remove();
    else listeners.push(handle);
  };
  void AppleCredentialState.addListener('credentialsRevoked', check).then(retain).catch(() => {});
  void CapacitorApp.addListener('appStateChange', state => { if (state.isActive) void check(); }).then(retain).catch(() => {});
  void check();
  return () => {
    disposed = true;
    listeners.forEach(handle => { void handle.remove(); });
  };
}
