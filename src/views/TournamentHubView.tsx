import React, { useState } from 'react';
import {
  Trophy,
  Swords,
  Plus,
  QrCode,
  ArrowRight,
  Medal,
  Clock,
  Shield,
  Sparkles,
  Users,
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export interface PublicTournamentItem {
  id: string;
  code: string;
  name: string;
  hostName: string;
  format: 'knockout_4' | 'knockout_8' | 'sprint';
  formatLabel: string;
  themeCategory: string;
  currentPlayers: number;
  maxPlayers: number;
  status: 'waiting' | 'in_progress';
  createdAt: string;
}

export const TournamentHubView: React.FC<{
  onOpenCreate?: () => void;
  onOpenJoin?: () => void;
}> = ({ onOpenCreate, onOpenJoin }) => {
  const { trophies, user, showGlobalToast } = useGameStore();

  // Active public tournaments list (in-memory / mockable for community exploration)
  const [activeTournaments] = useState<PublicTournamentItem[]>([
    {
      id: 'tourney_demo_1',
      code: 'CUP-7721',
      name: 'Piala Jawara Nusantara',
      hostName: 'Budi Santoso',
      format: 'knockout_4',
      formatLabel: 'Sistem Gugur (4 Besar)',
      themeCategory: 'Olahraga & Wisata',
      currentPlayers: 2,
      maxPlayers: 4,
      status: 'waiting',
      createdAt: 'Baru saja',
    },
    {
      id: 'tourney_demo_2',
      code: 'CUP-5510',
      name: 'Duel Kosakata Cepat',
      hostName: 'Siti Rahma',
      format: 'sprint',
      formatLabel: 'Time Attack (60s)',
      themeCategory: 'Bahasa Inggris & Sains',
      currentPlayers: 1,
      maxPlayers: 4,
      status: 'waiting',
      createdAt: '5m lalu',
    },
  ]);

  const handleJoinByItem = (item: PublicTournamentItem) => {
    showGlobalToast(`Bergabung ke turnamen ${item.name} (${item.code})...`, 2500);
  };

  return (
    <div className="w-full flex flex-col gap-3.5 relative z-10 pb-6">
      {/* 1. Header Trophy Showcase (Themed Glass Card) */}
      <div
        className="w-full rounded-[26px] p-4 relative z-10 overflow-hidden border border-white/10 dark:border-white/15 shadow-sm"
        style={{
          background: 'var(--hero-grad, var(--accent-grad))',
          color: '#ffffff',
        }}
      >
        <div className="absolute top-0 inset-x-0 h-px bg-white/30 pointer-events-none" />
        <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/15 blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-2 relative z-10">
          <span className="text-[8.5px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/25 inline-flex items-center gap-1.5">
            <Trophy className="w-3 h-3 stroke-[2.2]" />
            <span>ARENA KOMPETISI RESMI</span>
          </span>
          <span className="text-[10px] font-bold text-white/90">
            {user.name}
          </span>
        </div>

        <div className="relative z-10 mb-3">
          <h3 className="text-[20px] font-black text-white tracking-tight leading-tight mb-1">
            Turnamen Komunitas
          </h3>
          <p className="text-[11px] text-white/85 leading-snug max-w-[85%]">
            Buat turnamen sistem gugur bersama kawan, atau bergabung ke turnamen terbuka untuk memperebutkan trofi kejuaraan.
          </p>
        </div>

        {/* Player Trophies Bar (Themed Glass Inset) */}
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 relative z-10">
          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Trophy className="w-3.5 h-3.5 fill-current" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[7.5px] font-bold text-white/75 uppercase tracking-wider truncate">
                Emas
              </span>
              <span className="text-[12px] font-black text-white leading-none">
                {trophies.gold} 🏆
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-1 border-x border-white/15">
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Medal className="w-3.5 h-3.5 fill-current" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[7.5px] font-bold text-white/75 uppercase tracking-wider truncate">
                Perak
              </span>
              <span className="text-[12px] font-black text-white leading-none">
                {trophies.silver} 🥈
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 px-1">
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Medal className="w-3.5 h-3.5 fill-current" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[7.5px] font-bold text-white/75 uppercase tracking-wider truncate">
                Perunggu
              </span>
              <span className="text-[12px] font-black text-white leading-none">
                {trophies.bronze} 🥉
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Quick Action Cards: Buat Turnamen & Ikut Turnamen */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Card A: Buat Turnamen */}
        <div
          onClick={onOpenCreate}
          className="p-4 rounded-[24px] liquid-glass-card border border-[var(--border-card)] flex flex-col justify-between gap-3 cursor-pointer tactile-active group hover:border-[var(--accent-main)]/40 transition-all shadow-xs"
        >
          <div className="w-9 h-9 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center text-[var(--accent-main)] shadow-2xs group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5 stroke-[2.4]" />
          </div>
          <div>
            <h4 className="text-[13.5px] font-black text-[var(--text-primary)] leading-tight mb-0.5">
              Buat Turnamen
            </h4>
            <p className="text-[9.5px] font-semibold text-[var(--text-secondary)] leading-tight">
              Host turnamen kustom, atur babak & undang teman
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black text-[var(--accent-main)]">
            <span>Mulai Host</span>
            <ArrowRight className="w-3 h-3 stroke-[2.4] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card B: Ikut Turnamen */}
        <div
          onClick={onOpenJoin}
          className="p-4 rounded-[24px] liquid-glass-card border border-[var(--border-card)] flex flex-col justify-between gap-3 cursor-pointer tactile-active group hover:border-[var(--accent-main)]/40 transition-all shadow-xs"
        >
          <div className="w-9 h-9 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 flex items-center justify-center text-[var(--accent-main)] shadow-2xs group-hover:scale-105 transition-transform">
            <QrCode className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="text-[13.5px] font-black text-[var(--text-primary)] leading-tight mb-0.5">
              Gabung Turnamen
            </h4>
            <p className="text-[9.5px] font-semibold text-[var(--text-secondary)] leading-tight">
              Masukkan kode kamar turnamen atau scan QR
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black text-[var(--accent-main)]">
            <span>Input Kode</span>
            <ArrowRight className="w-3 h-3 stroke-[2.4] group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* 3. Daftar Turnamen Terbuka (Public Waiting Rooms) */}
      <div className="flex flex-col gap-2 pt-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-primary)] flex items-center gap-1.5">
            <Swords className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2]" />
            <span>TURNAMEN TERBUKA</span>
          </span>
          <span className="text-[10px] text-[var(--text-secondary)] font-semibold">
            {activeTournaments.length} Lobi Menunggu
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {activeTournaments.map((item) => (
            <div
              key={item.id}
              className="w-full p-3.5 rounded-[22px] liquid-glass-card border border-[var(--border-card)] flex items-center justify-between gap-3 shadow-xs hover:border-[var(--accent-main)]/30 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-[var(--accent-light)] border border-[var(--accent-main)]/20 flex items-center justify-center text-[var(--accent-main)] shrink-0">
                  <Trophy className="w-4 h-4 fill-current stroke-none" />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[8.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)]">
                      {item.code}
                    </span>
                    <span className="text-[9px] font-bold text-[var(--text-secondary)] truncate">
                      Host: {item.hostName}
                    </span>
                  </div>
                  <h4 className="text-[13px] font-black text-[var(--text-primary)] leading-tight truncate">
                    {item.name}
                  </h4>
                  <div className="flex items-center gap-2 text-[9.5px] text-[var(--text-secondary)] font-semibold mt-0.5">
                    <span>{item.formatLabel}</span>
                    <span>•</span>
                    <span className="text-[var(--accent-main)] font-bold">
                      {item.currentPlayers}/{item.maxPlayers} Pemain
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleJoinByItem(item)}
                className="py-1.5 px-3.5 rounded-full bg-[var(--accent-main)] text-[var(--accent-contrast)] text-[10.5px] font-black flex items-center gap-1 shrink-0 cursor-pointer tactile-active hover:opacity-95 shadow-xs transition-opacity"
              >
                <span>Ikut</span>
                <ArrowRight className="w-3 h-3 stroke-[2.4]" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Format Regulasi & Hadiah Turnamen (Themed Bento) */}
      <div className="w-full rounded-[24px] p-3.5 sm:p-4 liquid-glass-card border border-[var(--border-card)] flex flex-col gap-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2]" />
            <span className="text-[12px] font-black text-[var(--text-primary)]">
              Format & Regulasi Turnamen
            </span>
          </div>
          <span className="text-[8.5px] text-[var(--accent-main)] font-bold">
            Pemain Asli 100%
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col items-center text-center">
            <Users className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2] mb-1" />
            <span className="text-[11px] font-black text-[var(--text-primary)]">
              4-16 Slot
            </span>
            <span className="text-[8px] text-[var(--text-secondary)] mt-0.5">
              Sistem Gugur
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col items-center text-center">
            <Clock className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2] mb-1" />
            <span className="text-[11px] font-black text-[var(--text-primary)]">
              60-90s
            </span>
            <span className="text-[8px] text-[var(--text-secondary)] mt-0.5">
              Waktu Ronde
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 flex flex-col items-center text-center">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-main)] stroke-[2.2] mb-1" />
            <span className="text-[11px] font-black text-[var(--text-primary)]">
              +200 ★
            </span>
            <span className="text-[8px] text-[var(--text-secondary)] mt-0.5">
              Hadiah Juara
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
