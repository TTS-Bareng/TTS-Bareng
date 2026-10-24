import { supabase, isSupabaseConfigured } from './supabase';
import { useGameStore, type BattleConfig } from '../store/useGameStore';
import type { RealtimeChannel } from '@supabase/supabase-js';

let activeChannel: RealtimeChannel | null = null;
let currentRoomCode: string | null = null;
let cursorDebounceTimer: ReturnType<typeof setTimeout> | null = null;
let disconnectGraceTimer: ReturnType<typeof setTimeout> | null = null;

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
          if (disconnectGraceTimer) {
            clearTimeout(disconnectGraceTimer);
            disconnectGraceTimer = null;
          }
          const wasReconnecting = useGameStore.getState().partnerReconnecting === joined.name;
          useGameStore.getState().setPartnerReconnecting(null);
          useGameStore.getState().showGlobalToast(
            wasReconnecting ? `${joined.name} tersambung kembali!` : `${joined.name} bergabung ke kamar!`,
            2600
          );
          // Catch up newcomer/reconnector with full board state
          mabarRealtime.broadcastBoardSnapshot();
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const left = (leftPresences as unknown as MabarPeer[])?.[0];
        if (left?.name && left.name !== user.name) {
          useGameStore.getState().setPartnerReconnecting(left.name);
          if (disconnectGraceTimer) clearTimeout(disconnectGraceTimer);
          disconnectGraceTimer = setTimeout(() => {
            const current = useGameStore.getState().partnerReconnecting;
            if (current === left.name) {
              const state = useGameStore.getState();
              useGameStore.getState().setPartnerReconnecting(null);

              // If currently in an active 1v1 battle, smoothly activate AI Bot Takeover
              if (state.gameMode === '1v1_battle') {
                useGameStore.setState({
                  isQuickMatchBot: true,
                  quickMatchBotOpponent: { name: `${left.name} (AI Bot)`, avatar: left.avatar || '' },
                  quickMatchAiCooldown: 5,
                });
                useGameStore.getState().showGlobalToast(`${left.name} terputus • Bot AI mengambil alih tanding!`, 3200);
              } else {
                useGameStore.getState().showGlobalToast(`${left.name} telah meninggalkan sesi.`);
              }
            }
          }, 10000);
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
      .on('broadcast', { event: 'reaction' }, ({ payload }) => {
        if (payload?.text) {
          useGameStore.getState().receiveReaction({
            text: payload.text,
            senderName: payload.senderName || 'Teman',
            avatar: payload.avatar,
            clueId: payload.clueId,
          });
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
      .on('broadcast', { event: 'next_level_propose' }, ({ payload }) => {
        if (typeof payload?.targetLevelIndex === 'number') {
          useGameStore.getState().receiveNextLevelProposal({
            targetLevelIndex: payload.targetLevelIndex,
            senderName: payload.senderName || 'Teman',
          });
        }
      })
      .on('broadcast', { event: 'next_level_accept' }, ({ payload }) => {
        if (typeof payload?.targetLevelIndex === 'number') {
          useGameStore.getState().confirmNextLevelTogether(payload.targetLevelIndex);
        }
      })
      .on('broadcast', { event: 'next_level_cancel' }, () => {
        useGameStore.getState().cancelNextLevelProposal(false);
      })
      .on('broadcast', { event: 'board_sync_request' }, () => {
        mabarRealtime.broadcastBoardSnapshot();
      })
      .on('broadcast', { event: 'board_snapshot' }, ({ payload }) => {
        if (payload && typeof payload.levelIndex === 'number') {
          useGameStore.getState().applyBoardSnapshot(payload);
        }
      })
      .on('broadcast', { event: 'leave_session' }, ({ payload }) => {
        const store = useGameStore.getState();
        store.showGlobalToast(`${payload.senderName || 'Teman'} keluar dari sesi mabar.`);
      })
      .on('broadcast', { event: 'battle_config' }, ({ payload }) => {
        if (payload?.config) {
          useGameStore.getState().setBattleConfig(payload.config, false);
        }
      })
      .on('broadcast', { event: 'battle_start' }, ({ payload }) => {
        if (typeof payload?.levelIndex === 'number' && payload?.config) {
          useGameStore.getState().receiveBattleStart({
            levelIndex: payload.levelIndex,
            config: payload.config,
          });
        }
      })
      .on('broadcast', { event: 'battle_clue_claim' }, ({ payload }) => {
        if (payload?.clueId) {
          useGameStore.getState().claimBattleClue(
            payload.clueId,
            payload.newlySolved || [],
            'partner',
            payload.senderName || 'Lawan'
          );
        }
      })
      .on('broadcast', { event: 'battle_rematch' }, () => {
        useGameStore.getState().rematchBattle();
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            id: user.name,
            name: user.name,
            avatar: user.avatar,
            joinedAt: Date.now(),
          });
          // Immediately request latest board sync if connecting to an ongoing session
          mabarRealtime.requestBoardSync();
        }
      });

    activeChannel = channel;
  },

  /**
   * Leave the active channel
   */
  leaveRoom() {
    if (disconnectGraceTimer) {
      clearTimeout(disconnectGraceTimer);
      disconnectGraceTimer = null;
    }
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

  /**
   * Broadcast quick reaction or clue help ping
   */
  broadcastReaction(reaction: { text: string; clueId?: string }) {
    if (!activeChannel) return;
    const { user } = useGameStore.getState();
    activeChannel.send({
      type: 'broadcast',
      event: 'reaction',
      payload: {
        ...reaction,
        senderName: user.name,
        avatar: user.avatar,
      },
    });
  },

  /**
   * Propose advancing to next level together
   */
  broadcastNextLevelProposal(targetLevelIndex: number) {
    if (!activeChannel) return;
    const { user } = useGameStore.getState();
    activeChannel.send({
      type: 'broadcast',
      event: 'next_level_propose',
      payload: {
        targetLevelIndex,
        senderName: user.name,
      },
    });
  },

  /**
   * Accept partner's proposal to advance to next level together
   */
  broadcastNextLevelAccept(targetLevelIndex: number) {
    if (!activeChannel) return;
    const { user } = useGameStore.getState();
    activeChannel.send({
      type: 'broadcast',
      event: 'next_level_accept',
      payload: {
        targetLevelIndex,
        senderName: user.name,
      },
    });
  },

  /**
   * Cancel proposal to advance
   */
  broadcastNextLevelCancel() {
    if (!activeChannel) return;
    activeChannel.send({
      type: 'broadcast',
      event: 'next_level_cancel',
      payload: {},
    });
  },

  /**
   * Request live board sync from partner
   */
  requestBoardSync() {
    if (!activeChannel) return;
    activeChannel.send({
      type: 'broadcast',
      event: 'board_sync_request',
      payload: {},
    });
  },

  /**
   * Broadcast full board snapshot to partner
   */
  broadcastBoardSnapshot() {
    if (!activeChannel) return;
    const { user, currentLevelIndex, userInputs, lockedCells, solvedClues, clueAuthors, cellAuthors } = useGameStore.getState();
    activeChannel.send({
      type: 'broadcast',
      event: 'board_snapshot',
      payload: {
        levelIndex: currentLevelIndex,
        userInputs,
        lockedCells,
        solvedClues,
        clueAuthors,
        cellAuthors,
        senderName: user.name,
      },
    });
  },

  /**
   * Broadcast 1v1 battle config changes (rounds, duration, wordCount)
   */
  broadcastBattleConfig(config: BattleConfig) {
    if (!activeChannel) return;
    activeChannel.send({
      type: 'broadcast',
      event: 'battle_config',
      payload: { config },
    });
  },

  /**
   * Broadcast 1v1 battle start to opponent
   */
  broadcastBattleStart(levelIndex: number, config: BattleConfig) {
    if (!activeChannel) return;
    const { user } = useGameStore.getState();
    activeChannel.send({
      type: 'broadcast',
      event: 'battle_start',
      payload: {
        levelIndex,
        config,
        senderName: user.name,
      },
    });
  },

  /**
   * Broadcast 1v1 clue claim
   */
  broadcastBattleClue(clueId: string, newlySolved: string[]) {
    if (!activeChannel) return;
    const { user } = useGameStore.getState();
    activeChannel.send({
      type: 'broadcast',
      event: 'battle_clue_claim',
      payload: {
        clueId,
        newlySolved,
        senderName: user.name,
      },
    });
  },

  /**
   * Broadcast 1v1 rematch request
   */
  broadcastBattleRematch() {
    if (!activeChannel) return;
    activeChannel.send({
      type: 'broadcast',
      event: 'battle_rematch',
      payload: {},
    });
  },
};

// Global network connectivity listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (currentRoomCode && activeChannel) {
      useGameStore.getState().showGlobalToast('Koneksi internet pulih, menyinkronkan...', 2500);
      mabarRealtime.requestBoardSync();
    }
  });

  window.addEventListener('offline', () => {
    if (currentRoomCode) {
      useGameStore.getState().showGlobalToast('Koneksi internet terputus', 3000);
    }
  });
}
