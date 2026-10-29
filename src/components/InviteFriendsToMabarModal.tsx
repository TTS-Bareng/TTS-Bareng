import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Send, Check } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { sendDirectMabarInvite } from '../lib/socialSync';
import { formatPlayerCompactId } from '../lib/friends';

interface InviteFriendsToMabarModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomCode: string;
}

export const InviteFriendsToMabarModal: React.FC<InviteFriendsToMabarModalProps> = ({
  isOpen,
  onClose,
  roomCode,
}) => {
  const { friends, user, showGlobalToast } = useGameStore();
  const [invitedIds, setInvitedIds] = React.useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleInvite = async (friendId: string, friendName: string) => {
    setInvitedIds((prev) => ({ ...prev, [friendId]: true }));
    const success = await sendDirectMabarInvite(friendId, roomCode, {
      name: user.name,
      avatar: user.avatar,
    });
    if (success) {
      showGlobalToast(`Undangan mabar dikirim ke ${friendName}!`, 3000);
    } else {
      showGlobalToast(`Gagal mengirim undangan ke ${friendName}.`, 3000);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm rounded-[28px] p-5 relative overflow-hidden liquid-glass-card border border-black/10 dark:border-white/15 shadow-2xl flex flex-col gap-3.5 max-h-[85vh]"
          style={{ background: 'var(--bg-card)' }}
        >
          {/* Top Specular Sheen */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center border border-[var(--accent-main)]/25 text-[var(--accent-main)]"
                style={{ background: 'var(--accent-light)' }}
              >
                <Users className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[14px] font-black text-[var(--text-primary)] leading-tight">
                  Ajak Kawan Mabar
                </h3>
                <span className="text-[10px] text-[var(--text-secondary)]">
                  Kamar {roomCode}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup"
              className="w-8 h-8 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer tactile-active"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Friends List */}
          <div className="w-full flex flex-col gap-2 overflow-y-auto pr-0.5">
            {friends.length === 0 ? (
              <div className="py-8 flex flex-col items-center text-center gap-2">
                <Users className="w-8 h-8 text-[var(--text-secondary)]/50" />
                <p className="text-[12px] font-bold text-[var(--text-secondary)]">
                  Belum ada teman di daftar.
                </p>
                <p className="text-[10px] text-[var(--text-secondary)]/80 max-w-[220px]">
                  Buka tab Profil untuk mencari dan menambahkan teman baru.
                </p>
              </div>
            ) : (
              friends.map((friend) => {
                const isSent = Boolean(invitedIds[friend.id]);
                return (
                  <div
                    key={friend.id}
                    className="p-2.5 rounded-2xl flex items-center justify-between gap-2.5 border border-black/5 dark:border-white/10"
                    style={{ background: 'var(--accent-light)' }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-black/10 dark:bg-white/10 shrink-0 flex items-center justify-center text-[11px] font-black">
                        {friend.avatar ? (
                          <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                        ) : (
                          friend.name.charAt(0)
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[12px] font-black text-[var(--text-primary)] truncate">
                          {friend.name}
                        </span>
                        <span className="text-[9px] font-mono text-[var(--text-secondary)]">
                          {formatPlayerCompactId(friend.id)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSent}
                      onClick={() => handleInvite(friend.id, friend.name)}
                      className={`px-3 py-1.5 rounded-xl text-[10.5px] font-black flex items-center gap-1.5 cursor-pointer tactile-active transition-all shrink-0 ${
                        isSent
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'shadow-xs border border-white/20'
                      }`}
                      style={!isSent ? { background: 'var(--accent-grad)', color: 'var(--accent-contrast)' } : {}}
                    >
                      {isSent ? (
                        <>
                          <Check className="w-3 h-3 stroke-[2.4]" />
                          <span>Terkirim</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 stroke-[2.2]" />
                          <span>Ajak Mabar</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
