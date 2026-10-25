import { createClient } from '@supabase/supabase-js';
import { Capacitor } from '@capacitor/core';
import type { CommunityTournament } from './tournament';
import { performAppleSignIn } from './appleAuth';

const DEFAULT_SUPABASE_URL = 'https://qrkfjacugcalegzhcatp.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFya2ZqYWN1Z2NhbGVnemhjYXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIzNTYzNTUsImV4cCI6MjEwNzkzMjM1NX0.jkk4H82Zc9exOf5nHtapsysKigPuPpZcdwqTgRqWySM';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
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
      .select('elo_rating, custom_tickets, is_vip, stars, streak')
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
 * Sign in with Apple (100% In-App on native iOS via Face ID / Touch ID sheet, or OAuth fallback on web)
 */
export async function signInWithApple(): Promise<{ user?: any; session?: any; error?: string; canceled?: boolean }> {
  return performAppleSignIn();
}

/**
 * Sign in with Google via Supabase OAuth with mobile custom scheme redirect
 */
export async function signInWithGoogle(): Promise<{ user?: any; error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Layanan Supabase belum terkonfigurasi' };
  }
  try {
    const isNative = Capacitor.isNativePlatform();
    const redirectTo = isNative ? 'ttsbareng://auth-callback' : window.location.origin;

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

    // On native mobile, open via system browser if skipBrowserRedirect was true
    if (isNative && data?.url) {
      window.open(data.url, '_system');
    }

    return { user: data };
  } catch (err: any) {
    return { error: err?.message || 'Gagal memulai Sign in with Google' };
  }
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
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: {
        shouldCreateUser: true,
      },
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal mengirim kode verifikasi' };
  }
}

/**
 * Verify 6-digit In-App OTP entered by the user
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
    let res = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanToken,
      type: 'email',
    });

    // If that fails, try type: 'signup' (from signUp with password)
    if (res.error) {
      const signupRes = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'signup',
      });
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
 * Direct sign in with email and password
 */
export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<{ user?: any; session?: any; error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Layanan Supabase belum terkonfigurasi' };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { error: error.message };
    return { user: data.user, session: data.session };
  } catch (err: any) {
    return { error: err?.message || 'Gagal masuk dengan email & kata sandi' };
  }
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmailPassword(
  email: string,
  password: string
): Promise<{ user?: any; session?: any; error?: string }> {
  if (!isSupabaseConfigured) {
    return { error: 'Layanan Supabase belum terkonfigurasi' };
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) return { error: error.message };
    return { user: data.user, session: data.session };
  } catch (err: any) {
    return { error: err?.message || 'Gagal mendaftar akun baru' };
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
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
