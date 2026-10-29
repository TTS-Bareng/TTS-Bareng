import { supabase, isSupabaseConfigured } from './supabase';
import type { FriendRecord } from './friends';

export interface FriendRequest {
  id: string;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  eloRating: number;
  stars: number;
  sentAt: string;
}

export interface MabarInvite {
  fromName: string;
  fromAvatar: string;
  roomCode: string;
  sentAt: number;
}

interface UserInboxData {
  requests?: FriendRequest[];
  accepted?: Array<{ friend: FriendRecord; acceptedAt: string }>;
  mabarInvites?: MabarInvite[];
}

/**
 * Send a friend request to target player in Supabase
 */
export async function sendFriendRequestCloud(
  targetUserId: string,
  sender: { id: string; name: string; avatar: string; eloRating: number; stars: number }
): Promise<{ success: boolean; message: string }> {
  if (!isSupabaseConfigured || !targetUserId || !sender.id) {
    return { success: false, message: 'Layanan cloud belum terhubung.' };
  }

  try {
    const inboxIdentifier = `inbox_${targetUserId}`;

    // 1. Fetch target's current inbox
    const { data: existingRows } = await supabase
      .from('user_progress_backup')
      .select('records')
      .eq('user_identifier', inboxIdentifier)
      .maybeSingle();

    const currentRecords: UserInboxData = (existingRows?.records as UserInboxData) || {};
    const existingRequests = currentRecords.requests || [];

    // Check if already requested
    if (existingRequests.some((r) => r.fromId === sender.id)) {
      return { success: true, message: 'Permintaan berteman sudah dikirim sebelumnya.' };
    }

    const newRequest: FriendRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      fromId: sender.id,
      fromName: sender.name,
      fromAvatar: sender.avatar || '',
      eloRating: sender.eloRating || 1200,
      stars: sender.stars || 0,
      sentAt: new Date().toISOString(),
    };

    const updatedRecords: UserInboxData = {
      ...currentRecords,
      requests: [newRequest, ...existingRequests],
    };

    // 2. Upsert updated inbox
    const { error: upsertErr } = await supabase.from('user_progress_backup').upsert(
      {
        user_identifier: inboxIdentifier,
        records: updatedRecords,
        backup_version: 'social_v1',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_identifier' }
    );

    if (upsertErr) {
      return { success: false, message: 'Gagal mengirim permintaan pertemanan ke cloud.' };
    }

    // 3. Broadcast real-time signal to recipient channel
    const channel = supabase.channel(`social_inbox:${targetUserId}`);
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'friend_request',
          payload: {
            request: newRequest,
          },
        });
        supabase.removeChannel(channel);
      }
    });

    return { success: true, message: `Permintaan berteman berhasil dikirim ke ${sender.name}!` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Terjadi kendala jaringan';
    return { success: false, message: msg };
  }
}

/**
 * Fetch pending incoming friend requests for current user
 */
export async function fetchPendingFriendRequests(currentUserId: string): Promise<FriendRequest[]> {
  if (!isSupabaseConfigured || !currentUserId) return [];
  try {
    const inboxIdentifier = `inbox_${currentUserId}`;
    const { data, error } = await supabase
      .from('user_progress_backup')
      .select('records')
      .eq('user_identifier', inboxIdentifier)
      .maybeSingle();

    if (error || !data) return [];
    const records = (data.records as UserInboxData) || {};
    return Array.isArray(records.requests) ? records.requests : [];
  } catch {
    return [];
  }
}

/**
 * Accept an incoming friend request (Mutual two-way connection)
 */
export async function acceptFriendRequestCloud(
  currentUserId: string,
  request: FriendRequest,
  currentUser: { id: string; name: string; avatar: string; eloRating: number; stars: number }
): Promise<{ success: boolean; newFriend?: FriendRecord }> {
  if (!isSupabaseConfigured || !currentUserId || !request) {
    return { success: false };
  }

  try {
    const myInboxId = `inbox_${currentUserId}`;
    const senderInboxId = `inbox_${request.fromId}`;

    // 1. Remove request from my inbox
    const { data: myData } = await supabase
      .from('user_progress_backup')
      .select('records')
      .eq('user_identifier', myInboxId)
      .maybeSingle();

    const myRecords: UserInboxData = (myData?.records as UserInboxData) || {};
    const filteredRequests = (myRecords.requests || []).filter((r) => r.id !== request.id);

    await supabase.from('user_progress_backup').upsert(
      {
        user_identifier: myInboxId,
        records: { ...myRecords, requests: filteredRequests },
        backup_version: 'social_v1',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_identifier' }
    );

    // 2. Build mutual friend records
    const newFriendForMe: FriendRecord = {
      id: request.fromId,
      name: request.fromName,
      avatar: request.fromAvatar,
      eloRating: request.eloRating,
      stars: request.stars,
      isVip: false,
      addedAt: new Date().toISOString(),
    };

    const newFriendForSender: FriendRecord = {
      id: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
      eloRating: currentUser.eloRating,
      stars: currentUser.stars,
      isVip: false,
      addedAt: new Date().toISOString(),
    };

    // 3. Post accepted notification into sender's inbox so they get the mutual connection
    const { data: senderData } = await supabase
      .from('user_progress_backup')
      .select('records')
      .eq('user_identifier', senderInboxId)
      .maybeSingle();

    const senderRecords: UserInboxData = (senderData?.records as UserInboxData) || {};
    const existingAccepted = senderRecords.accepted || [];

    await supabase.from('user_progress_backup').upsert(
      {
        user_identifier: senderInboxId,
        records: {
          ...senderRecords,
          accepted: [{ friend: newFriendForSender, acceptedAt: new Date().toISOString() }, ...existingAccepted],
        },
        backup_version: 'social_v1',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_identifier' }
    );

    // 4. Real-time broadcast to sender
    const channel = supabase.channel(`social_inbox:${request.fromId}`);
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'friend_accepted',
          payload: {
            friend: newFriendForSender,
          },
        });
        supabase.removeChannel(channel);
      }
    });

    return { success: true, newFriend: newFriendForMe };
  } catch (err) {
    console.warn('[SocialSync] Error accepting friend request:', err);
    return { success: false };
  }
}

/**
 * Decline an incoming friend request
 */
export async function declineFriendRequestCloud(
  currentUserId: string,
  requestId: string
): Promise<boolean> {
  if (!isSupabaseConfigured || !currentUserId || !requestId) return false;
  try {
    const myInboxId = `inbox_${currentUserId}`;
    const { data: myData } = await supabase
      .from('user_progress_backup')
      .select('records')
      .eq('user_identifier', myInboxId)
      .maybeSingle();

    const myRecords: UserInboxData = (myData?.records as UserInboxData) || {};
    const filteredRequests = (myRecords.requests || []).filter((r) => r.id !== requestId);

    await supabase.from('user_progress_backup').upsert(
      {
        user_identifier: myInboxId,
        records: { ...myRecords, requests: filteredRequests },
        backup_version: 'social_v1',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_identifier' }
    );

    return true;
  } catch {
    return false;
  }
}

/**
 * Check and consume any mutual friendship acceptances from other users
 */
export async function consumeAcceptedFriendships(
  currentUserId: string
): Promise<FriendRecord[]> {
  if (!isSupabaseConfigured || !currentUserId) return [];
  try {
    const myInboxId = `inbox_${currentUserId}`;
    const { data: myData } = await supabase
      .from('user_progress_backup')
      .select('records')
      .eq('user_identifier', myInboxId)
      .maybeSingle();

    const myRecords: UserInboxData = (myData?.records as UserInboxData) || {};
    const acceptedList = myRecords.accepted || [];
    if (acceptedList.length === 0) return [];

    // Clear accepted from cloud inbox
    await supabase.from('user_progress_backup').upsert(
      {
        user_identifier: myInboxId,
        records: { ...myRecords, accepted: [] },
        backup_version: 'social_v1',
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_identifier' }
    );

    return acceptedList.map((a) => a.friend);
  } catch {
    return [];
  }
}

/**
 * Send in-app direct Mabar Invitation to a friend
 */
export async function sendDirectMabarInvite(
  friendId: string,
  roomCode: string,
  sender: { name: string; avatar: string }
): Promise<boolean> {
  if (!isSupabaseConfigured || !friendId || !roomCode) return false;
  try {
    // Realtime channel broadcast
    const channel = supabase.channel(`social_inbox:${friendId}`);
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: 'mabar_invite',
          payload: {
            fromName: sender.name,
            fromAvatar: sender.avatar,
            roomCode,
            sentAt: Date.now(),
          },
        });
        supabase.removeChannel(channel);
      }
    });

    return true;
  } catch {
    return false;
  }
}

/**
 * Subscribe to real-time social events (Friend requests, acceptances, mabar invites)
 */
export function subscribeToSocialInbox(
  userId: string,
  handlers: {
    onFriendRequest?: (req: FriendRequest) => void;
    onFriendAccepted?: (friend: FriendRecord) => void;
    onMabarInvite?: (invite: MabarInvite) => void;
  }
): () => void {
  if (!isSupabaseConfigured || !userId) return () => {};

  const channel = supabase.channel(`social_inbox:${userId}`);
  channel
    .on('broadcast', { event: 'friend_request' }, (payload) => {
      if (payload?.payload?.request && handlers.onFriendRequest) {
        handlers.onFriendRequest(payload.payload.request);
      }
    })
    .on('broadcast', { event: 'friend_accepted' }, (payload) => {
      if (payload?.payload?.friend && handlers.onFriendAccepted) {
        handlers.onFriendAccepted(payload.payload.friend);
      }
    })
    .on('broadcast', { event: 'mabar_invite' }, (payload) => {
      if (payload?.payload && handlers.onMabarInvite) {
        handlers.onMabarInvite(payload.payload as MabarInvite);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
