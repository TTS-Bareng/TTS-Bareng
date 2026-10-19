import { supabase, isSupabaseConfigured } from './supabase';
import { useGameStore } from '../store/useGameStore';
import type { RealtimeChannel } from '@supabase/supabase-js';

let activeChannel: RealtimeChannel | null = null;
let currentRoomCode: string | null = null;
let cursorDebounceTimer: ReturnType<typeof setTimeout> | null = null;

export interface MabarPeer {
  id: string;
  name: string;
  avatar: string;
  joinedAt?: number;
}

export const mabarRealtime = {
  /**
   * Connect to a mabar room channel via Supabase Realtime
   */
  joinRoom(roomCode: string, user: { name: string; avatar: string }) {
    if (!isSupabaseConfigured || !roomCode) return;

    // If already in this room, do not recreate
    if (activeChannel && currentRoomCode === roomCode) return;

    if (activeChannel) {
      this.leaveRoom();
    }

    currentRoomCode = roomCode;
    const channelName = `mabar:${roomCode.trim().toUpperCase()}`;

    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: user.name || 'Pemain' },
        broadcast: { self: false },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const peers: MabarPeer[] = [];
        Object.values(presenceState).forEach((presenceList) => {
          (presenceList as unknown as MabarPeer[]).forEach((p) => {
            if (p?.name && !peers.some((existing) => existing.name === p.name)) {
              peers.push({
                id: p.id || p.name,
                name: p.name,
                avatar: p.avatar,
              });
            }
          });
        });
        useGameStore.getState().setMabarPeers(peers);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const joined = (newPresences as unknown as MabarPeer[])?.[0];
        if (joined?.name && joined.name !== user.name) {
          useGameStore.getState().showGlobalToast(`${joined.name} bergabung ke kamar!`);
          // Automatically sync current level state to newcomer
          const currentLvl = useGameStore.getState().currentLevelIndex;
          mabarRealtime.broadcastRoomState(currentLvl);
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const left = (leftPresences as unknown as MabarPeer[])?.[0];
        if (left?.name && left.name !== user.name) {
          useGameStore.getState().showGlobalToast(`${left.name} keluar kamar.`);
        }
      })
      .on('broadcast', { event: 'cell_input' }, ({ payload }) => {
        if (payload?.key && payload?.letter) {
          useGameStore.getState().applyRemoteInput(payload.key, payload.letter, payload.senderName || 'Teman');
        }
      })
      .on('broadcast', { event: 'cell_delete' }, ({ payload }) => {
        if (payload?.key) {
          useGameStore.getState().applyRemoteDelete(payload.key);
        }
      })
      .on('broadcast', { event: 'cursor_focus' }, ({ payload }) => {
        if (payload?.key) {
          useGameStore.getState().setPartnerCursor({
            key: payload.key,
            name: payload.senderName || 'Teman',
          });
        }
      })
      .on('broadcast', { event: 'clue_solved' }, ({ payload }) => {
        if (payload?.clueId) {
          useGameStore.getState().applyRemoteClueSolved(payload.clueId, payload.newlySolved || [], payload.senderName || 'Teman');
        }
      })
      .on('broadcast', { event: 'game_start' }, ({ payload }) => {
        if (typeof payload?.levelIndex === 'number') {
          const store = useGameStore.getState();
          if (currentRoomCode) {
            store.setActiveRoomCode(currentRoomCode);
          }
          store.selectLevel(payload.levelIndex);
          store.setCurrentTab('game');
          store.showGlobalToast(`${payload.senderName || 'Host'} memulai mabar Bab ${payload.levelIndex + 1}!`, 3500);
        }
      })
      .on('broadcast', { event: 'level_change' }, ({ payload }) => {
        if (typeof payload?.levelIndex === 'number') {
          const store = useGameStore.getState();
          store.selectLevel(payload.levelIndex);
          store.showGlobalToast(`Pindah ke Bab ${payload.levelIndex + 1}`);
        }
      })
      .on('broadcast', { event: 'room_state' }, ({ payload }) => {
        if (typeof payload?.levelIndex === 'number') {
          const store = useGameStore.getState();
          store.selectLevel(payload.levelIndex);
        }
      })
      .on('broadcast', { event: 'leave_session' }, ({ payload }) => {
        const store = useGameStore.getState();
        store.showGlobalToast(`${payload.senderName || 'Teman'} keluar dari sesi mabar.`);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: user.name,
            name: user.name,
            avatar: user.avatar,
            joinedAt: Date.now(),
          });
        }
      });

    activeChannel = channel;
  },

  /**
   * Leave the active channel
   */
  leaveRoom() {
    if (activeChannel) {
      try {
        this.broadcastLeaveSession();
        supabase.removeChannel(activeChannel);
      } catch {
        // ignore
      }
      activeChannel = null;
      currentRoomCode = null;
    }
    useGameStore.getState().setActiveRoomCode(null);
    useGameStore.getState().setMabarPeers([]);
    useGameStore.getState().setPartnerCursor(null);
  },

  /**
   * Broadcast an input letter event
   */
  broadcastInput(key: string, letter: string) {
    if (!activeChannel) return;
    const { user } = useGameStore.getState();
    activeChannel.send({
      type: 'broadcast',
      event: 'cell_input',
      payload: {
        key,
        letter,
        senderName: user.name,
      },
    });
  },

  /**
   * Broadcast a letter delete event
   */
  broadcastDelete(key: string) {
    if (!activeChannel) return;
    const { user } = useGameStore.getState();
    activeChannel.send({
      type: 'broadcast',
      event: 'cell_delete',
      payload: {
        key,
        senderName: user.name,
      },
    });
  },

  /**
   * Broadcast partner cursor movement with debouncing
   */
  broadcastCursor(key: string) {
    if (!activeChannel) return;
    if (cursorDebounceTimer) clearTimeout(cursorDebounceTimer);
    cursorDebounceTimer = setTimeout(() => {
      const { user } = useGameStore.getState();
      activeChannel?.send({
        type: 'broadcast',
        event: 'cursor_focus',
        payload: {
          key,
          senderName: user.name,
        },
      });
    }, 50);
  },

  /**
   * Broadcast word solved event
   */
  broadcastClueSolved(clueId: string, newlySolved: string[]) {
    if (!activeChannel) return;
    const { user } = useGameStore.getState();
    activeChannel.send({
      type: 'broadcast',
      event: 'clue_solved',
      payload: {
        clueId,
        newlySolved,
        senderName: user.name,
      },
    });
  },

  /**
   * Broadcast game start event (brings guest into game on the specified level)
   */
  broadcastGameStart(levelIndex: number) {
    if (!activeChannel) return;
    const { user } = useGameStore.getState();
    activeChannel.send({
      type: 'broadcast',
      event: 'game_start',
      payload: {
        levelIndex,
        senderName: user.name,
      },
    });
  },

  /**
   * Broadcast manual level change
   */
  broadcastLevelChange(levelIndex: number, title?: string) {
    if (!activeChannel) return;
    const { user } = useGameStore.getState();
    activeChannel.send({
      type: 'broadcast',
      event: 'level_change',
      payload: {
        levelIndex,
        title,
        senderName: user.name,
      },
    });
  },

  /**
   * Broadcast current room state / level
   */
  broadcastRoomState(levelIndex: number) {
    if (!activeChannel) return;
    activeChannel.send({
      type: 'broadcast',
      event: 'room_state',
      payload: {
        levelIndex,
      },
    });
  },

  /**
   * Broadcast leave session event
   */
  broadcastLeaveSession() {
    if (!activeChannel) return;
    const { user } = useGameStore.getState();
    activeChannel.send({
      type: 'broadcast',
      event: 'leave_session',
      payload: {
        senderName: user.name,
      },
    });
  },
};
