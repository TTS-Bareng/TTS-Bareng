import { supabase, isSupabaseConfigured } from './supabase';
import { useGameStore } from '../store/useGameStore';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type {
  CommunityTournament,
  CommunityTournamentPlayer,
} from './tournament';

let activeTournamentChannel: RealtimeChannel | null = null;
let currentTournamentCode: string | null = null;
let publicChannel: RealtimeChannel | null = null;
let matchProgressDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export interface TournamentPeer {
  id: string;
  name: string;
  avatar?: string;
  isHost?: boolean;
  joinedAt?: number;
}

export interface MatchProgressPayload {
  matchId: string;
  playerId: string;
  playerName: string;
  score: number;
  solvedCount: number;
  totalClues: number;
}

export interface MatchCompletedPayload {
  matchId: string;
  winnerId: string;
  player1Score: number;
  player2Score: number;
  completedBy: string;
}

export const tournamentRealtime = {
  /**
   * Connect to a specific tournament channel via Supabase Realtime
   */
  joinTournament(
    code: string,
    user: { id: string; name: string; avatar?: string; isHost?: boolean }
  ) {
    if (!isSupabaseConfigured || !code) return;

    const cleanCode = code.trim().toUpperCase();

    // Avoid duplicate subscriptions to the same channel
    if (activeTournamentChannel && currentTournamentCode === cleanCode) {
      return;
    }

    if (activeTournamentChannel) {
      this.leaveTournament();
    }

    currentTournamentCode = cleanCode;
    const channelName = `tournament:${cleanCode}`;

    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: user.id || user.name || 'Pemain' },
        broadcast: { self: false },
      },
    });

    channel
      // 1. Presence: Track who is currently in the tournament lobby / match
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const peers: TournamentPeer[] = [];
        Object.values(presenceState).forEach((presenceList) => {
          (presenceList as unknown as TournamentPeer[]).forEach((p) => {
            if (p?.name && !peers.some((existing) => existing.id === p.id || existing.name === p.name)) {
              peers.push({
                id: p.id || p.name,
                name: p.name,
                avatar: p.avatar,
                isHost: p.isHost,
                joinedAt: p.joinedAt,
              });
            }
          });
        });
        useGameStore.getState().setTournamentPeers(peers);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const joined = (newPresences as unknown as TournamentPeer[])?.[0];
        if (joined?.name && joined.name !== user.name) {
          useGameStore.getState().showGlobalToast(
            `${joined.name} bergabung ke turnamen!`,
            2500
          );

          // If current user is host, broadcast the latest tournament state to sync newcomers
          const activeTourney = useGameStore.getState().activeTournament;
          if (activeTourney && activeTourney.hostId === user.id) {
            // Also ensure the player is in tournament.players list
            const alreadyInList = activeTourney.players.some(
              (p) => p.id === joined.id || p.name === joined.name
            );
            if (!alreadyInList && activeTourney.players.length < activeTourney.maxPlayers) {
              const updatedPlayers: CommunityTournamentPlayer[] = [
                ...activeTourney.players,
                {
                  id: joined.id,
                  name: joined.name,
                  avatar: joined.avatar,
                  isHost: false,
                  isReady: true,
                },
              ];
              const syncedTourney = { ...activeTourney, players: updatedPlayers };
              useGameStore.getState().updateActiveTournamentLocally(syncedTourney);
              tournamentRealtime.broadcastTournamentSync(syncedTourney);
            } else {
              tournamentRealtime.broadcastTournamentSync(activeTourney);
            }
          }
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const left = (leftPresences as unknown as TournamentPeer[])?.[0];
        if (left?.name && left.name !== user.name) {
          useGameStore.getState().showGlobalToast(
            `${left.name} keluar dari turnamen.`,
            2200
          );
        }
      })

      // 2. Broadcast: Full Tournament State Sync (Lobby, Settings, Players)
      .on('broadcast', { event: 'tournament_sync' }, ({ payload }) => {
        if (payload?.tournament) {
          const store = useGameStore.getState();
          // Non-hosts receive sync from host
          if (store.activeTournament?.hostId !== user.id) {
            store.receiveTournamentSync(payload.tournament);
          }
        }
      })

      // 3. Broadcast: Tournament Started (Bracket Generation)
      .on('broadcast', { event: 'tournament_start' }, ({ payload }) => {
        if (payload?.tournament) {
          useGameStore.getState().receiveTournamentStart(payload.tournament);
        }
      })

      // 4. Broadcast: Match Start / Level Sync
      .on('broadcast', { event: 'match_init' }, ({ payload }) => {
        if (payload?.matchId && typeof payload?.levelIndex === 'number') {
          useGameStore.getState().receiveMatchInit(payload.matchId, payload.levelIndex);
        }
      })

      // 5. Broadcast: Realtime Match Clue / Score Progress
      .on('broadcast', { event: 'match_progress' }, ({ payload }) => {
        const store = useGameStore.getState();
        if (
          payload?.matchId &&
          store.activeCommunityMatchId === payload.matchId &&
          payload.playerId !== user.id
        ) {
          store.receiveTournamentMatchProgress(payload);
        }
      })

      // 6. Broadcast: Match Completed & Winner Advanced
      .on('broadcast', { event: 'match_completed' }, ({ payload }) => {
        if (payload?.matchId) {
          useGameStore.getState().receiveTournamentMatchCompleted(payload);
        }
      })

      // Subscribe and immediately track user presence
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: user.id || user.name,
            name: user.name,
            avatar: user.avatar,
            isHost: Boolean(user.isHost),
            joinedAt: Date.now(),
          });

          // Request sync from host if this client is joining
          if (!user.isHost) {
            channel.send({
              type: 'broadcast',
              event: 'request_sync',
              payload: { requesterId: user.id, requesterName: user.name },
            });
          }
        }
      });

    // Handle incoming sync request on host side
    channel.on('broadcast', { event: 'request_sync' }, () => {
      const store = useGameStore.getState();
      if (store.activeTournament && store.activeTournament.hostId === user.id) {
        tournamentRealtime.broadcastTournamentSync(store.activeTournament);
      }
    });

    activeTournamentChannel = channel;
  },

  /**
   * Leave active tournament channel
   */
  leaveTournament() {
    if (activeTournamentChannel) {
      activeTournamentChannel.unsubscribe();
      activeTournamentChannel = null;
      currentTournamentCode = null;
    }
    useGameStore.getState().setTournamentPeers([]);
  },

  /**
   * Broadcast full tournament state update (e.g. host changed settings, filled bots, or player joined)
   */
  broadcastTournamentSync(tournament: CommunityTournament) {
    if (!activeTournamentChannel) return;
    activeTournamentChannel.send({
      type: 'broadcast',
      event: 'tournament_sync',
      payload: { tournament },
    });
  },

  /**
   * Broadcast tournament start (bracket matches generated)
   */
  broadcastTournamentStart(tournament: CommunityTournament) {
    if (!activeTournamentChannel) return;
    activeTournamentChannel.send({
      type: 'broadcast',
      event: 'tournament_start',
      payload: { tournament },
    });
  },

  /**
   * Broadcast match initialization (synchronize puzzle level for both opponents)
   */
  broadcastMatchInit(matchId: string, levelIndex: number) {
    if (!activeTournamentChannel) return;
    activeTournamentChannel.send({
      type: 'broadcast',
      event: 'match_init',
      payload: { matchId, levelIndex },
    });
  },

  /**
   * Broadcast live match score & clue progress (debounced for optimal network performance)
   */
  broadcastMatchProgress(progress: MatchProgressPayload) {
    if (!activeTournamentChannel) return;

    if (matchProgressDebounceTimer) {
      clearTimeout(matchProgressDebounceTimer);
    }

    matchProgressDebounceTimer = setTimeout(() => {
      activeTournamentChannel?.send({
        type: 'broadcast',
        event: 'match_progress',
        payload: progress,
      });
      matchProgressDebounceTimer = null;
    }, 80);
  },

  /**
   * Broadcast match completion result
   */
  broadcastMatchCompleted(payload: MatchCompletedPayload) {
    if (!activeTournamentChannel) return;
    activeTournamentChannel.send({
      type: 'broadcast',
      event: 'match_completed',
      payload,
    });
  },

  /**
   * Listen to global public tournaments channel
   */
  subscribePublicTournaments() {
    if (!isSupabaseConfigured || publicChannel) return;

    publicChannel = supabase.channel('tournaments:public', {
      config: { broadcast: { self: false } },
    });

    publicChannel
      .on('broadcast', { event: 'tournament_published' }, ({ payload }) => {
        if (payload?.tournament) {
          useGameStore.getState().receivePublicTournament(payload.tournament);
        }
      })
      .on('broadcast', { event: 'tournament_closed' }, ({ payload }) => {
        if (payload?.tournamentId) {
          useGameStore.getState().removePublicTournament(payload.tournamentId);
        }
      })
      .subscribe();
  },

  /**
   * Unsubscribe from public tournaments channel
   */
  unsubscribePublicTournaments() {
    if (publicChannel) {
      publicChannel.unsubscribe();
      publicChannel = null;
    }
  },

  /**
   * Publish a newly created tournament to the public channel
   */
  broadcastPublishTournament(tournament: CommunityTournament) {
    if (!publicChannel && isSupabaseConfigured) {
      this.subscribePublicTournaments();
    }
    publicChannel?.send({
      type: 'broadcast',
      event: 'tournament_published',
      payload: { tournament },
    });
  },
};
