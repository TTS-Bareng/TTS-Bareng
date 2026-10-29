import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  X,
  Search,
  ScanLine,
  Check,
  Crown,
  Sparkles,
  Loader2,
  Users,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import {
  searchPlayerInSupabase,
  formatPlayerCompactId,
  type FriendRecord,
} from '../lib/friends';
import { getEloTier } from '../lib/eloSystem';
import { sendFriendRequestCloud } from '../lib/socialSync';
import { QrScannerModal } from './QrScannerModal';

export const AddFriendModal: React.FC = () => {
  const {
    isAddFriendModalOpen,
    closeAddFriendModal,
    user,
    friends,
    addFriend,
    eloRating,
    stars,
    showGlobalToast,
  } = useGameStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<FriendRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);
  const [sentRequestIds, setSentRequestIds] = useState<string[]>([]);
  const [isSendingId, setIsSendingId] = useState<string | null>(null);

  // Debounced search effect
  useEffect(() => {
    if (!isAddFriendModalOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchPlayerInSupabase(trimmed, user?.id);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
        setHasSearched(true);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery, isAddFriendModalOpen, user?.id]);

  if (!isAddFriendModalOpen) return null;

  const handleOpenScanner = () => {
    setIsScannerActive(true);
  };

  const handleScanSuccess = (scannedText: string) => {
    setIsScannerActive(false);
    let extracted = scannedText.trim();
    if (extracted.includes('id=')) {
      try {
        const u = new URL(extracted);
        extracted = u.searchParams.get('id') || extracted;
      } catch {}
    } else if (extracted.includes('user=')) {
      try {
        const u = new URL(extracted);
        extracted = u.searchParams.get('user') || extracted;
      } catch {}
    }
    extracted = extracted.replace(/^TTS-PASSPORT:/i, '').trim();
    setSearchQuery(extracted);
    showGlobalToast(`Memindai ID: ${extracted}`, 2400);
  };

  const handleAdd = async (player: FriendRecord) => {
    if (!user?.id) {
      addFriend(player);
      showGlobalToast(`Menambahkan ${player.name} ke daftar kawan.`, 2500);
      return;
    }

    setIsSendingId(player.id);
    try {
      const res = await sendFriendRequestCloud(player.id, {
        id: user.id,
        name: user.name || 'Pemain TTS',
        avatar: user.avatar || '',
        eloRating: eloRating || 1200,
        stars: stars || 0,
      });

      if (res.success) {
        setSentRequestIds((prev) => [...prev, player.id]);
        showGlobalToast(`Permintaan berteman dikirim ke ${player.name}!`, 3000);
      } else {
        showGlobalToast(res.message || 'Gagal mengirim permintaan berteman', 3000);
      }
    } catch {
      showGlobalToast('Terjadi kendala saat mengirim permintaan.', 3000);
    } finally {
      setIsSendingId(null);
    }
  };

  const isAlreadyFriend = (id: string) => {
    return friends.some((f) => f.id === id);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Adaptive Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAddFriendModal}
          className="absolute inset-0 bg-black/30 dark:bg-black/65 backdrop-blur-md"
        />

        {/* Modal Card Content */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-[370px] max-h-[85vh] rounded-[28px] p-5 flex flex-col gap-3.5 shadow-2xl z-10 border border-black/10 dark:border-white/15 liquid-glass-card overflow-hidden text-[var(--text-primary)]"
          style={{
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)',
          }}
        >
          {/* Top Specular Sheen */}
          <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

          {/* Header Row */}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] flex items-center justify-center shadow-2xs">
                <UserPlus className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-[15px] font-black tracking-tight leading-tight">
                  Tambah Teman
                </h3>
                <span className="text-[9.5px] text-[var(--text-secondary)] font-semibold">
                  Komunitas TTS Bareng
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeAddFriendModal}
              aria-label="Tutup"
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/10 hover:bg-black/10 active:scale-95 transition-all text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-black/5 dark:border-white/10 cursor-pointer"
            >
              <X className="w-3.5 h-3.5 stroke-[2.2]" />
            </button>
          </div>

          {/* Quick Action: Pindai QR Paspor */}
          <button
            type="button"
            onClick={handleOpenScanner}
            className="w-full py-2.5 px-3 rounded-2xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 border border-black/10 dark:border-white/15 flex items-center justify-between gap-2 cursor-pointer tactile-active transition-all group"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-[var(--accent-main)] text-[var(--accent-contrast)] flex items-center justify-center shadow-2xs">
                <ScanLine className="w-3.5 h-3.5 stroke-[2.4]" />
              </div>
              <div className="text-left">
                <span className="text-[11.5px] font-black text-[var(--text-primary)] block leading-tight">
                  Pindai QR Paspor Kawan
                </span>
                <span className="text-[9px] text-[var(--text-secondary)]">
                  Arahkan kamera ke tiket atau kartu profil
                </span>
              </div>
            </div>
            <span className="text-[9px] font-black text-[var(--accent-main)] uppercase tracking-wider group-hover:translate-x-0.5 transition-transform">
              Buka →
            </span>
          </button>

          {/* Search Input Field */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[var(--text-secondary)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau ID (#FC39F465)..."
              className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/15 text-[12px] font-bold text-[var(--text-primary)] placeholder:text-[var(--text-secondary)]/70 focus:outline-hidden focus:border-[var(--accent-main)] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <X className="w-3 h-3 stroke-[2.4]" />
              </button>
            )}
          </div>

          {/* Results List Section */}
          <div className="flex-1 min-h-[160px] max-h-[260px] overflow-y-auto no-scrollbar flex flex-col gap-2">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center h-36 gap-2 text-[var(--text-secondary)]">
                <Loader2 className="w-5 h-5 animate-spin text-[var(--accent-main)]" />
                <span className="text-[11px] font-bold">Mencari di Supabase...</span>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((player) => {
                const alreadyAdded = isAlreadyFriend(player.id);
                const eloInfo = getEloTier(player.eloRating);

                return (
                  <div
                    key={player.id}
                    className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-between gap-2.5 transition-colors"
                  >
                    {/* Left: Avatar + Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-full p-0.5 bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                        {player.avatar ? (
                          <img
                            src={player.avatar}
                            alt={player.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-[12px] font-black text-[var(--accent-main)] uppercase">
                            {player.name.charAt(0)}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="text-[11.5px] font-black text-[var(--text-primary)] truncate">
                            {player.name}
                          </span>
                          {player.isVip && (
                            <Crown className="w-3 h-3 text-[var(--accent-main)] fill-current shrink-0" />
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[8px] font-mono font-bold text-[var(--accent-main)]">
                            {formatPlayerCompactId(player.id)}
                          </span>
                          <span className="text-[7.5px] font-bold px-1.5 py-0.2 rounded-full bg-black/5 dark:bg-white/10 text-[var(--text-secondary)]">
                            {player.eloRating} ELO • {eloInfo.title}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Add or Done Button */}
                    <div className="shrink-0">
                      {alreadyAdded ? (
                        <div className="px-2.5 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/30 text-[var(--accent-main)] text-[9.5px] font-black flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>Teman</span>
                        </div>
                      ) : sentRequestIds.includes(player.id) ? (
                        <div className="px-2.5 py-1 rounded-full bg-[var(--accent-light)] border border-[var(--accent-main)]/20 text-[var(--text-secondary)] text-[9.5px] font-black flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[2.5]" />
                          <span>Terkirim</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          disabled={isSendingId === player.id}
                          onClick={() => handleAdd(player)}
                          className="px-3 py-1.5 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[10.5px] font-black flex items-center gap-1 cursor-pointer tactile-active shadow-xs hover:opacity-95 transition-opacity disabled:opacity-50"
                        >
                          {isSendingId === player.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserPlus className="w-3 h-3 stroke-[2.4]" />
                          )}
                          <span>{isSendingId === player.id ? 'Mengirim...' : '+ Tambah'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : hasSearched ? (
              <div className="flex flex-col items-center justify-center h-36 text-center gap-1.5 px-4 text-[var(--text-secondary)]">
                <Users className="w-7 h-7 stroke-[1.8] opacity-60" />
                <span className="text-[11.5px] font-bold text-[var(--text-primary)]">
                  Pemain Tidak Ditemukan
                </span>
                <span className="text-[9.5px] leading-tight">
                  Periksa ejaan nama atau pastikan ID pemain terdaftar di server.
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-36 text-center gap-1.5 px-4 text-[var(--text-secondary)]">
                <Sparkles className="w-7 h-7 text-[var(--accent-main)] stroke-[1.8]" />
                <span className="text-[11.5px] font-bold text-[var(--text-primary)]">
                  Temukan Teman Mabar
                </span>
                <span className="text-[9.5px] leading-tight max-w-[240px]">
                  Ketik nama atau ID pemain di atas, atau minta kawanmu memperlihatkan QR Paspor Profil.
                </span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Integrated QR Camera Scanner for Friend Passports */}
        <QrScannerModal
          isOpen={isScannerActive}
          onClose={() => setIsScannerActive(false)}
          onScanSuccess={handleScanSuccess}
        />
      </div>
    </AnimatePresence>
  );
};

export default AddFriendModal;
