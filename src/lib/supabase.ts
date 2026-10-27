import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import type { CommunityTournament } from './tournament';
import { performAppleSignIn } from './appleAuth';
import { performGoogleSignIn } from './googleAuth';

const DEFAULT_SUPABASE_URL = 'https://qrkfjacugcalegzhcatp.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFya2ZqYWN1Z2NhbGVnemhjYXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNTYzNTUsImV4cCI6MjEwNzkzMjM1NX0.jkk4H82Zc9exOf5nHtapsysKigPuPpZcdwqTgRqWySM';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Format raw network or WebKit NSURLError into friendly Indonesian message
 */
export function formatFriendlyNetworkError(rawError?: string | null): string {
  if (!rawError) return 'Terjadi kendala pada koneksi internet. Silakan coba lagi.';
  const msg = rawError.toLowerCase();
  if (
    msg.includes('network connection was lost') ||
    msg.includes('-1005') ||
    msg.includes('failed to fetch') ||
    msg.includes('load failed') ||
    msg.includes('the operation was aborted') ||
    msg.includes('timeout') ||
    msg.includes('koneksi jaringan')
  ) {
    return 'Koneksi internet tidak stabil atau terputus. Silakan periksa jaringan dan coba lagi.';
  }
  return rawError;
}

// Resilient fetch wrapper with 15s timeout and fast auto-retry for spotty WiFi and mobile connections (Accrual Standard)
const resilientFetch: typeof fetch = async (input, init) => {
  const maxRetries = 2;
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    let isTimedOut = false;
    const timeoutId = setTimeout(() => {
      isTimedOut = true;
      controller.abort();
    }, 15000);

    if (init?.signal) {
      if (init.signal.aborted) {
        clearTimeout(timeoutId);
        controller.abort();
      } else {
        init.signal.addEventListener('abort', () => controller.abort(), { once: true });
      }
    }

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });
      return response;
    } catch (err: any) {
      lastError = err;
      const msg = typeof err?.message === 'string' ? err.message.toLowerCase() : '';
      const isTransient =
        isTimedOut ||
        msg.includes('network connection was lost') ||
        msg.includes('failed to fetch') ||
        msg.includes('load failed') ||
        msg.includes('-1005') ||
        msg.includes('timeout') ||
        (err?.name === 'AbortError' && isTimedOut);

      if (isTransient && attempt < maxRetries && !init?.signal?.aborted) {
        const backoffMs = attempt === 0 ? 300 : 600;
        console.warn(`[Supabase:fetch] Transient network issue on attempt ${attempt + 1}/${maxRetries}. Retrying in ${backoffMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      if (isTimedOut) {
        throw new Error('Koneksi internet tidak stabil atau batas waktu habis. Silakan periksa jaringan Anda.');
      }
      throw new Error(formatFriendlyNetworkError(err?.message));
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError ? new Error(formatFriendlyNetworkError(lastError?.message)) : new Error('Koneksi internet tidak stabil atau terputus. Silakan periksa jaringan Anda.');
};

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      fetch: resilientFetch,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

export interface DbProfile {
  id: string;
  name: string;
  avatar: string;
  is_guest: boolean;
  stars: number;
  streak: number;
  total_words_solved: number;
  created_at?: string;
  updated_at?: string;
}

export interface DbDailyRushRecord {
  id?: string;
  user_id?: string;
  user_name: string;
  user_avatar: string;
  rush_date: string;
  score: number;
  time_spent: number;
  accuracy: number;
  completed: boolean;
  created_at?: string;
}

export interface DbMabarRoom {
  id: string;
  room_code: string;
  host_id?: string;
  host_name: string;
  level_index: number;
  mode: 'coop' | 'battle';
  status: 'waiting' | 'in_progress' | 'finished';
  inputs: Record<string, string>;
  solved_clues: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Upsert user profile to Supabase (including ELO rating, custom tickets, and VIP status)
 */
export async function syncUserProfile(profile: {
  id?: string;
  name: string;
  avatar: string;
  isGuest: boolean;
  stars: number;
  streak: number;
  totalWordsSolved: number;
  eloRating?: number;
  customTickets?: number;
  isVip?: boolean;
}): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('profiles').upsert(
      {
        id: profile.id || undefined,
        name: profile.name,
        avatar: profile.avatar,
        is_guest: profile.isGuest,
        stars: profile.stars,
        streak: profile.streak,
        total_words_solved: profile.totalWordsSolved,
        elo_rating: profile.eloRating ?? 1000,
        custom_tickets: profile.customTickets ?? 0,
        is_vip: profile.isVip ?? false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
    if (error) {
      console.warn('Supabase sync profile error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase sync failed:', err);
    return false;
  }
}

/**
 * Fetch user profile from Supabase
 */
export async function fetchUserProfile(userId: string): Promise<{
  name?: string;
  avatar?: string;
  total_words_solved?: number;
  elo_rating?: number;
  custom_tickets?: number;
  is_vip?: boolean;
  stars?: number;
  streak?: number;
} | null> {
  if (!isSupabaseConfigured || !userId) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('name, avatar, total_words_solved, elo_rating, custom_tickets, is_vip, stars, streak')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data;
  } catch (err) {
    console.warn('Failed to fetch user profile:', err);
    return null;
  }
}

/**
 * Submit Daily Rush record to National Leaderboard
 */
export async function submitDailyRushScore(record: {
  userName: string;
  userAvatar: string;
  date: string;
  score: number;
  timeSpent: number;
  accuracy: number;
  completed: boolean;
}): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const { error } = await supabase.from('daily_rush_leaderboard').insert({
      user_name: record.userName,
      user_avatar: record.userAvatar,
      rush_date: record.date,
      score: record.score,
      time_spent: record.timeSpent,
      accuracy: record.accuracy,
      completed: record.completed,
    });
    if (error) {
      console.warn('Supabase leaderboard error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase leaderboard submit failed:', err);
    return false;
  }
}

/**
 * Fetch Top National Daily Rush Leaderboard for a given date
 */
export async function fetchDailyRushLeaderboard(dateStr: string, limit = 20): Promise<DbDailyRushRecord[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('daily_rush_leaderboard')
      .select('*')
      .eq('rush_date', dateStr)
      .order('score', { ascending: false })
      .order('time_spent', { ascending: true })
      .limit(limit);

    if (error || !data) return [];
    return data as DbDailyRushRecord[];
  } catch {
    return [];
  }
}

// ============================================================================
// COMMUNITY TOURNAMENTS CLOUD PERSISTENCE
// ============================================================================

interface DbTournamentRow {
  id: string;
  code: string;
  name: string;
  host_id: string;
  host_name: string;
  format: any;
  round_duration_seconds: number;
  theme_category: string;
  status: any;
  max_players: number;
  players: any;
  matches: any;
  champion?: any;
  created_at: string;
}

function mapDbToTournament(row: DbTournamentRow): CommunityTournament {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    hostId: row.host_id,
    hostName: row.host_name,
    format: row.format,
    roundDurationSeconds: row.round_duration_seconds,
    themeCategory: row.theme_category,
    status: row.status,
    maxPlayers: row.max_players,
    players: Array.isArray(row.players) ? row.players : [],
    matches: Array.isArray(row.matches) ? row.matches : [],
    champion: row.champion || undefined,
    createdAt: row.created_at || 'Baru saja',
  };
}

function mapTournamentToDb(t: CommunityTournament) {
  return {
    id: t.id,
    code: t.code,
    name: t.name,
    host_id: t.hostId,
    host_name: t.hostName,
    format: t.format,
    round_duration_seconds: t.roundDurationSeconds,
    theme_category: t.themeCategory,
    status: t.status,
    max_players: t.maxPlayers,
    players: t.players,
    matches: t.matches,
    champion: t.champion || null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Save or update community tournament record in Supabase DB
 */
export async function saveTournamentToDb(t: CommunityTournament): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const payload = mapTournamentToDb(t);
    const { error } = await supabase
      .from('community_tournaments')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase save tournament error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase save tournament failed:', err);
    return false;
  }
}

/**
 * Fetch all public community tournaments from Supabase DB
 */
export async function fetchPublicTournamentsFromDb(limit = 30): Promise<CommunityTournament[]> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('community_tournaments')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return (data as unknown as DbTournamentRow[]).map(mapDbToTournament);
  } catch {
    return [];
  }
}

/**
 * Fetch a single tournament by its CUP-XXXX code from Supabase DB
 */
export async function fetchTournamentByCodeFromDb(code: string): Promise<CommunityTournament | null> {
  if (!isSupabaseConfigured || !code) return null;
  try {
    const cleanCode = code.trim().toUpperCase();
    const { data, error } = await supabase
      .from('community_tournaments')
      .select('*')
      .eq('code', cleanCode)
      .maybeSingle();

    if (error || !data) return null;
    return mapDbToTournament(data as unknown as DbTournamentRow);
  } catch {
    return null;
  }
}

/**
 * Helper to enforce a strict timeout (default 20s) on Supabase async operations
 * to prevent indefinite UI hangs and handle intermittent cellular network latency.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms = 20000,
  fallbackMessage = 'Batas waktu koneksi habis (20 detik). Periksa koneksi internet Anda.'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(fallbackMessage)), ms)
    ),
  ]);
}

/**
 * Sign in with Apple (100% In-App on native iOS via Face ID / Touch ID sheet, or OAuth fallback on web)
 */
export async function signInWithApple(): Promise<{ user?: any; session?: any; error?: string; canceled?: boolean }> {
  return performAppleSignIn();
}

/**
 * Sign in with Google (100% In-App on native iOS via Google bottom sheet, or OAuth fallback on web)
 */
export async function signInWithGoogle(): Promise<{
  user?: any;
  session?: any;
  error?: string;
  canceled?: boolean;
}> {
  return performGoogleSignIn();
}

/**
 * Send 6-digit In-App OTP to user's email (Zero browser, 100% in-app)
 */
export async function sendEmailOtp(email: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Layanan Supabase belum terkonfigurasi' };
  }
  try {
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await withTimeout(
      supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      }),
      20000,
      'Koneksi pengiriman OTP batas waktu habis (20 detik).'
    );
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal mengirim kode verifikasi' };
  }
}

/**
 * Verify 6-digit In-App OTP entered by the user (protected by 20s timeout)
 */
export async function verifyEmailOtp(
  email: string,
  token: string
): Promise<{ user?: any; session?: any; error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Layanan Supabase belum terkonfigurasi' };
  }
  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanToken = token.trim().replace(/\s+/g, '');
    
    // First try type: 'email' (from signInWithOtp)
    let res = await withTimeout(
      supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'email',
      }),
      20000,
      'Koneksi verifikasi OTP batas waktu habis (20 detik).'
    );

    // If that fails, try type: 'signup' (from signUp with password)
    if (res.error) {
      const signupRes = await withTimeout(
        supabase.auth.verifyOtp({
          email: cleanEmail,
          token: cleanToken,
          type: 'signup',
        }),
        20000,
        'Koneksi verifikasi pendaftaran batas waktu habis (20 detik).'
      );
      if (!signupRes.error) {
        res = signupRes;
      }
    }

    if (res.error) return { error: res.error.message };
    return { user: res.data.user, session: res.data.session };
  } catch (err: any) {
    return { error: err?.message || 'Gagal memverifikasi kode OTP' };
  }
}

/**
 * Direct sign in with email and password (protected by 20s timeout)
 */
export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<{ user?: any; session?: any; error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Layanan Supabase belum terkonfigurasi' };
  }
  try {
    const { data, error } = await withTimeout(
      supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      }),
      25000,
      'Koneksi verifikasi akun batas waktu habis. Periksa jaringan Anda.'
    );
    if (error) return { error: formatFriendlyNetworkError(error.message) };
    return { user: data.user, session: data.session };
  } catch (err: any) {
    return { error: formatFriendlyNetworkError(err?.message) || 'Gagal masuk dengan email & kata sandi' };
  }
}

/**
 * Sign up with email and password (protected by 25s timeout)
 */
export async function signUpWithEmailPassword(
  email: string,
  password: string
): Promise<{ user?: any; session?: any; error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Layanan Supabase belum terkonfigurasi' };
  }
  try {
    const { data, error } = await withTimeout(
      supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
      }),
      25000,
      'Koneksi pendaftaran akun batas waktu habis. Periksa jaringan Anda.'
    );
    if (error) return { error: formatFriendlyNetworkError(error.message) };
    return { user: data.user, session: data.session };
  } catch (err: any) {
    return { error: formatFriendlyNetworkError(err?.message) || 'Gagal mendaftar akun baru' };
  }
}

/**
 * Update or set account password in Supabase Auth (for Google, Apple, or Email users)
 */
export async function updateAccountPassword(password: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Layanan Supabase belum terkonfigurasi' };
  }
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal memperbarui kata sandi' };
  }
}

/**
 * Request password reset email via Supabase Auth
 */
export async function resetPasswordForEmail(email: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, error: 'Layanan Supabase belum terkonfigurasi' };
  }
  try {
    const isNative = Capacitor.isNativePlatform();
    const redirectTo = isNative ? 'ttsbareng://auth-callback' : window.location.origin;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal mengirim tautan reset kata sandi' };
  }
}

/**
 * Fetch real Top National ELO Leaderboard from profiles table
 */
export async function fetchEloLeaderboard(limit = 50): Promise<Array<{
  id: string;
  name: string;
  avatar: string;
  elo: number;
  is_vip: boolean;
  stars: number;
}>> {
  if (!isSupabaseConfigured) return [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, avatar, elo_rating, is_vip, stars')
      .order('elo_rating', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map((d: any) => ({
      id: d.id,
      name: d.name || 'Pemain TTS',
      avatar: d.avatar || '',
      elo: Number(d.elo_rating) || 1200,
      is_vip: Boolean(d.is_vip),
      stars: Number(d.stars) || 0,
    }));
  } catch {
    return [];
  }
}
