import { supabase, isSupabaseConfigured } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { TOURNAMENT_BOT_CANDIDATES } from './tournament';
import type { BattleConfig } from '../store/useGameStore';

export interface MatchmakingTicket {
  ticketId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  mode: 'speed_race' | 'tug_of_war';
  queuedAt: number;
}

export interface MatchFoundResult {
  roomCode: string;
  opponent: {
    id: string;
    name: string;
    avatar: string;
    rating?: number;
    isBot: boolean;
  };
  levelIndex: number;
  config: BattleConfig;
}

let queueChannel: RealtimeChannel | null = null;
let currentTicket: MatchmakingTicket | null = null;
let botFallbackTimer: ReturnType<typeof setTimeout> | null = null;
let isMatched = false;

export const quickMatchmaking = {
  /**
   * Start searching for a 1v1 opponent (Speed Race or Tug-of-War)
   */
  startSearch({
    user,
    mode,
    totalLevels = 60,
    onStatusChange,
    onMatchFound,
  }: {
    user: { id?: string; name: string; avatar: string; stars?: number; rating?: number };
    mode: 'speed_race' | 'tug_of_war';
    totalLevels?: number;
    onStatusChange?: (status: 'searching' | 'matched') => void;
    onMatchFound: (result: MatchFoundResult) => void;
  }) {
    // Clear any existing active search session
    this.cancelSearch();
    isMatched = false;

    const ticketId = `TKT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const userRating = user.rating || user.stars || 1100;
    const ticket: MatchmakingTicket = {
      ticketId,
      userId: user.id || ticketId,
      userName: user.name || 'Pemain',
      userAvatar: user.avatar,
      rating: userRating,
      mode,
      queuedAt: Date.now(),
    };
    currentTicket = ticket;
    onStatusChange?.('searching');

    // Helper: Trigger Match Completion
    const triggerMatch = (result: MatchFoundResult) => {
      if (isMatched) return;
      isMatched = true;
      this.cancelSearch(false);
      onStatusChange?.('matched');
      onMatchFound(result);
    };

    // Helper: Trigger Bot Fallback
    const triggerBotFallback = () => {
      if (isMatched) return;
      const randomBot =
        TOURNAMENT_BOT_CANDIDATES[
          Math.floor(Math.random() * TOURNAMENT_BOT_CANDIDATES.length)
        ];
      const roomCode = `BTL-${Math.floor(1000 + Math.random() * 9000)}`;
      // Pick a random level suitable for 1v1 fast action (e.g. index 0 to 45)
      const levelIndex = Math.floor(Math.random() * Math.min(45, totalLevels));

      const config: BattleConfig =
        mode === 'speed_race'
          ? {
              mode: 'speed_race',
              rounds: 1,
              durationSeconds: 60,
              wordCount: 'short',
            }
          : {
              mode: 'tug_of_war',
              rounds: 3,
              durationSeconds: 90,
              wordCount: 'short',
            };

      const botElo = Math.max(700, Math.round(userRating + (Math.random() - 0.48) * 160));

      triggerMatch({
        roomCode,
        opponent: {
          id: randomBot.id,
          name: randomBot.name,
          avatar: randomBot.avatar || '',
          rating: botElo,
          isBot: true,
        },
        levelIndex,
        config,
      });
    };

    // If Supabase is unconfigured, trigger bot fallback after 2.5s simulated searching
    if (!isSupabaseConfigured) {
      botFallbackTimer = setTimeout(triggerBotFallback, 2500);
      return;
    }

    // Set 8-second smart bot fallback timer if no human opponent connects
    botFallbackTimer = setTimeout(triggerBotFallback, 8000);

    const channelName = `matchmaking:quick_1v1_${mode}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: ticket.ticketId },
        broadcast: { self: false },
      },
    });

    // Check presence state to match against real human peers
    const evaluateQueue = (presenceState: Record<string, unknown[]>) => {
      if (isMatched || !currentTicket) return;

      const candidates: MatchmakingTicket[] = [];
      Object.values(presenceState).forEach((list) => {
        (list as unknown as MatchmakingTicket[]).forEach((p) => {
          if (
            p &&
            p.ticketId !== currentTicket?.ticketId &&
            p.mode === currentTicket?.mode &&
            Date.now() - p.queuedAt < 20000 // Only tickets active within last 20 seconds
          ) {
            candidates.push(p);
          }
        });
      });

      if (candidates.length === 0) return;

      // Sort candidates by queuedAt ascending (earliest waiting player first)
      candidates.sort((a, b) => a.queuedAt - b.queuedAt);
      const peer = candidates[0];

      // Deterministic Host Arbitration:
      // The player who queued earlier (or if equal, with lexicographically smaller ticketId) acts as host
      const isHost =
        currentTicket.queuedAt < peer.queuedAt ||
        (currentTicket.queuedAt === peer.queuedAt &&
          currentTicket.ticketId < peer.ticketId);

      if (isHost) {
        const roomCode = `BTL-${Math.floor(1000 + Math.random() * 9000)}`;
        const levelIndex = Math.floor(Math.random() * Math.min(45, totalLevels));
        const config: BattleConfig =
          currentTicket.mode === 'speed_race'
            ? {
                mode: 'speed_race',
                rounds: 1,
                durationSeconds: 60,
                wordCount: 'short',
              }
            : {
                mode: 'tug_of_war',
                rounds: 3,
                durationSeconds: 90,
                wordCount: 'short',
              };

        // Broadcast match agreement to peer
        channel.send({
          type: 'broadcast',
          event: 'match_found',
          payload: {
            hostTicketId: currentTicket.ticketId,
            peerTicketId: peer.ticketId,
            roomCode,
            levelIndex,
            config,
            hostInfo: {
              id: currentTicket.userId,
              name: currentTicket.userName,
              avatar: currentTicket.userAvatar,
              rating: currentTicket.rating,
            },
            peerInfo: {
              id: peer.userId,
              name: peer.userName,
              avatar: peer.userAvatar,
              rating: peer.rating,
            },
          },
        });

        // Trigger local match as Host
        triggerMatch({
          roomCode,
          opponent: {
            id: peer.userId,
            name: peer.userName,
            avatar: peer.userAvatar,
            rating: peer.rating,
            isBot: false,
          },
          levelIndex,
          config,
        });
      }
    };

    channel
      .on('presence', { event: 'sync' }, () => {
        evaluateQueue(channel.presenceState());
      })
      .on('presence', { event: 'join' }, () => {
        evaluateQueue(channel.presenceState());
      })
      .on('broadcast', { event: 'match_found' }, ({ payload }) => {
        if (!currentTicket || isMatched) return;

        // If I am the targeted peer in this match
        if (payload?.peerTicketId === currentTicket.ticketId) {
          triggerMatch({
            roomCode: payload.roomCode,
            opponent: {
              id: payload.hostInfo?.id || 'host',
              name: payload.hostInfo?.name || 'Lawan',
              avatar: payload.hostInfo?.avatar || '',
              rating: payload.hostInfo?.rating || 100,
              isBot: false,
            },
            levelIndex: payload.levelIndex,
            config: payload.config,
          });
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && currentTicket) {
          await channel.track(currentTicket);
        }
      });

    queueChannel = channel;
  },

  /**
   * Cancel ongoing matchmaking queue and clean up subscriptions
   */
  cancelSearch(cleanChannel = true) {
    if (botFallbackTimer) {
      clearTimeout(botFallbackTimer);
      botFallbackTimer = null;
    }

    if (queueChannel && cleanChannel) {
      try {
        queueChannel.untrack();
        supabase.removeChannel(queueChannel);
      } catch {
        // ignore
      }
    }

    queueChannel = null;
    currentTicket = null;
  },
};
