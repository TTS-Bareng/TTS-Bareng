import { supabase, isSupabaseConfigured } from './supabase';

export interface FriendRecord {
  id: string; // Real Supabase user UUID
  name: string;
  avatar: string;
  eloRating: number;
  stars: number;
  isVip: boolean;
  addedAt: string;
}

const STORAGE_KEY_FRIENDS = 'tts_user_friends_v1';

/** Format UUID into neat display ID, e.g. #FC39F465 */
export function formatPlayerCompactId(id: string): string {
  if (!id) return '#TAMU';
  if (id.startsWith('guest_')) {
    return `TAMU #${id.replace('guest_', '').slice(0, 6).toUpperCase()}`;
  }
  const clean = id.replace(/[^a-zA-Z0-9]/g, '');
  return `#${clean.slice(0, 8).toUpperCase()}`;
}

/** Load saved friends from local storage */
export function loadFriendsFromStorage(): FriendRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FRIENDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((f) => f && typeof f.id === 'string' && f.name);
    }
  } catch {
    // ignore
  }
  return [];
}

/** Save friends to local storage */
export function saveFriendsToStorage(friends: FriendRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_FRIENDS, JSON.stringify(friends));
  } catch {
    // ignore
  }
}

/**
 * Search real players in Supabase profiles by player ID, UUID, or username
 * Zero dummy data: only real registered users are returned
 */
export async function searchPlayerInSupabase(
  rawQuery: string,
  currentUserId?: string
): Promise<FriendRecord[]> {
  if (!isSupabaseConfigured) return [];
  const query = rawQuery.trim();
  if (!query || query.length < 2) return [];

  try {
    // Clean query: remove leading # or spaces
    const cleanQuery = query.replace(/^#/, '').trim();

    // Query Supabase profiles table
    let builder = supabase
      .from('profiles')
      .select('id, name, avatar, elo_rating, is_vip, stars')
      .limit(12);

    if (currentUserId) {
      builder = builder.neq('id', currentUserId);
    }

    // If query looks like a UUID or hex prefix
    if (/^[0-9a-fA-F-]+$/.test(cleanQuery)) {
      builder = builder.or(`id.ilike.${cleanQuery}%,name.ilike.%${cleanQuery}%`);
    } else {
      builder = builder.ilike('name', `%${cleanQuery}%`);
    }

    const { data, error } = await builder;

    if (error || !data) {
      console.warn('[Friends] Gagal mencari profil di Supabase:', error?.message);
      return [];
    }

    return (data as any[]).map((row) => ({
      id: row.id,
      name: row.name || 'Pemain TTS',
      avatar: row.avatar || '',
      eloRating: Number(row.elo_rating) || 1200,
      stars: Number(row.stars) || 0,
      isVip: Boolean(row.is_vip),
      addedAt: new Date().toISOString(),
    }));
  } catch (err) {
    console.warn('[Friends] Error searching players:', err);
    return [];
  }
}

/**
 * Fetch live updated profile stats for a friend
 */
export async function fetchFriendProfileLive(
  friendId: string
): Promise<Partial<FriendRecord> | null> {
  if (!isSupabaseConfigured || !friendId) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('name, avatar, elo_rating, is_vip, stars')
      .eq('id', friendId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      name: data.name,
      avatar: data.avatar,
      eloRating: Number(data.elo_rating) || 1200,
      stars: Number(data.stars) || 0,
      isVip: Boolean(data.is_vip),
    };
  } catch {
    return null;
  }
}
