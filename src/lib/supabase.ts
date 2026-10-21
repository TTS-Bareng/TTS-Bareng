import { createClient } from '@supabase/supabase-js';
import type { CommunityTournament } from './tournament';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
 * Upsert user profile to Supabase
 */
export async function syncUserProfile(profile: {
  id?: string;
  name: string;
  avatar: string;
  isGuest: boolean;
  stars: number;
  streak: number;
  totalWordsSolved: number;
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
