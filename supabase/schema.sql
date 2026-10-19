-- ==============================================================================
-- TTS BARENG — SUPABASE PRODUCTION SCHEMA & REALTIME SETUP
-- Aplikasi: TTS Bareng - Mabar Teka Teki Silang
-- Jalankan skrip ini langsung di Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. PROFILES TABLE (Sinkronisasi Akun Pemain & Tamu)
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid references auth.users(id) on delete cascade,
  name text not null default 'Pemain TTS',
  avatar text not null default '/maskot/Fierce Plush Crossword Champion.webp',
  is_guest boolean not null default true,
  stars integer not null default 120 check (stars >= 0),
  streak integer not null default 1 check (streak >= 0),
  total_words_solved integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index profil
create index if not exists idx_profiles_auth on public.profiles(auth_user_id);

-- 3. DAILY RUSH LEADERBOARD (Papan Rekor Nasional 90s)
create table if not exists public.daily_rush_leaderboard (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete set null,
  user_name text not null,
  user_avatar text not null,
  rush_date date not null default current_date,
  score integer not null check (score >= 0),
  time_spent integer not null check (time_spent >= 0),
  accuracy integer not null check (accuracy between 0 and 100),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Index leaderboard per tanggal & skor tertinggi
create index if not exists idx_daily_rush_rank 
  on public.daily_rush_leaderboard (rush_date, score desc, time_spent asc);

-- 4. MABAR ROOMS (Kamar Mabar Co-op & 1v1 Arena)
create table if not exists public.mabar_rooms (
  id uuid primary key default uuid_generate_v4(),
  room_code text unique not null,
  host_id text,
  host_name text not null default 'Host',
  level_index integer not null default 0,
  mode text not null check (mode in ('coop', 'battle')),
  status text not null default 'waiting' check (status in ('waiting', 'in_progress', 'finished')),
  board_inputs jsonb not null default '{}'::jsonb,
  solved_clues jsonb not null default '[]'::jsonb,
  participant_count integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index room code
create index if not exists idx_mabar_room_code on public.mabar_rooms(room_code);

-- 5. LEVEL PROGRESS BACKUP (Cadangan Cloud Offline-First)
create table if not exists public.user_progress_backup (
  id uuid primary key default uuid_generate_v4(),
  user_identifier text not null, -- guest ID atau auth email
  records jsonb not null default '{}'::jsonb,
  stars integer not null default 0,
  streak integer not null default 1,
  theme text not null default 'obsidian',
  backup_version text not null default 'v2',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_progress_backup_user on public.user_progress_backup(user_identifier);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Mendukung pemain anonim/tamu (Guest) dan pemain terdaftar
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.daily_rush_leaderboard enable row level security;
alter table public.mabar_rooms enable row level security;
alter table public.user_progress_backup enable row level security;

-- Profiles: Siapa saja bisa membaca dan mengupdate profilnya sendiri
create policy "Public read profiles" 
  on public.profiles for select 
  using (true);

create policy "Public insert profiles" 
  on public.profiles for insert 
  with check (true);

create policy "Public update profiles" 
  on public.profiles for update 
  using (true);

-- Daily Rush: Siapa saja bisa melihat leaderboard nasional hari ini
create policy "Public read leaderboard" 
  on public.daily_rush_leaderboard for select 
  using (true);

create policy "Public insert leaderboard score" 
  on public.daily_rush_leaderboard for insert 
  with check (true);

-- Mabar Rooms: Pemain bisa membuat, bergabung, dan menyinkronkan papan
create policy "Public read mabar rooms" 
  on public.mabar_rooms for select 
  using (true);

create policy "Public insert mabar rooms" 
  on public.mabar_rooms for insert 
  with check (true);

create policy "Public update mabar rooms" 
  on public.mabar_rooms for update 
  using (true);

-- Progress Backup: Baca dan simpan cadangan
create policy "Public progress backup read" 
  on public.user_progress_backup for select 
  using (true);

create policy "Public progress backup insert" 
  on public.user_progress_backup for insert 
  with check (true);

create policy "Public progress backup update" 
  on public.user_progress_backup for update 
  using (true);

-- ==============================================================================
-- ENABLE SUPABASE REALTIME (WebSockets live board & lobby sync)
-- ==============================================================================

begin;
  -- Tambahkan tabel mabar_rooms ke publikasi realtime Supabase
  drop publication if exists supabase_realtime;
  create publication supabase_realtime for table public.mabar_rooms, public.daily_rush_leaderboard;
commit;
