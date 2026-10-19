import { createClient } from '@supabase/supabase-js';

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
