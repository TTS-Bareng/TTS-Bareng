# TTS Bareng (Teka Teki Silang) — Project Architecture & Strict Rules

> **Engram Project Name**: `tts-bareng`  
> **Versi Rilis Stabil**: `v1.0.54`  
> Saat memanggil tool MCP Engram (`mem_context`, `mem_search`, `mem_save`, `mem_session_summary`), **wajib** sertakan `project: "tts-bareng"`.

---

## 1. Peta Workspace & Repositori

Workspace ini (`d:\Project\Teka Teki SIlang`) menaungi dua repositori Git terpisah:

| Sub-proyek | Path | Stack | Perintah Utama |
| :--- | :--- | :--- | :--- |
| **`TTS-App`** | `d:\Project\Teka Teki SIlang\TTS-App` | React + TypeScript + Vite + Tailwind CSS + Capacitor (iOS/Android), Supabase, RevenueCat | `npm run dev`, `npm run build`, `npm run lint`, `npm run cap:sync` |
| **`TTS-Web`** | `d:\Project\Teka Teki SIlang\TTS-Web` | React + Vite + Tailwind CSS (Landing page, pre-registrasi, legal App Store) | `npm run dev`, `npm run build` |

- **Isolasi Repo**: Jangan menyalin atau mengubah kode lintas `TTS-App` dan `TTS-Web` tanpa instruksi eksplisit pengguna.
- **Git Release Tagging**: Tag rilis `v1.0.x` dikelola di repositori `TTS-App` untuk otomatisasi CI/CD deploy TestFlight / App Store.

---

## 2. Theme & UI Integrity Rules (STRICT)

Aturan ketat ini mengikat seluruh modifikasi UI, penambahan komponen, modal, dan tata letak dalam proyek **TTS Bareng**.

### 2.1 Zero Hardcoded Colors (Strict Token Rule)
- **DILARANG KERAS** menggunakan warna hardcoded Tailwind seperti `bg-amber-*`, `text-amber-*`, `bg-indigo-*`, `text-indigo-*`, `text-emerald-*`, `bg-blue-*`, dsb. untuk komponen kartu, badge, tombol, ikon, atau teks umum.
- **Wajib 100% Theme-Adaptive**: Seluruh visual harus bersumber dari CSS variable tokens:
  - `var(--bg-main)`: Latar belakang halaman/kanvas.
  - `var(--bg-card)`: Latar kartu bento dan panel kaca.
  - `var(--accent-main)`: Warna aksen utama tema aktif (border fokus, ikon, highlight teks).
  - `var(--accent-light)`: Tint lembut untuk wadah ikon, pill badge, dan gradasi kartu.
  - `var(--accent-grad)`: Gradasi tema resmi untuk CTA utama, tombol aksi, dan badge mahkota.
  - `var(--accent-contrast)`: Warna teks/ikon di atas `var(--accent-grad)` (misal teks putih pada tema wine-red).
  - `var(--text-primary)` & `var(--text-secondary)`: Tipografi netral adaptif kontras tinggi.

### 2.2 Keseragaman Anatomi Kartu Bento (Uniform Bento Rhythm)
Seluruh kartu metrik, status bento, dan tile interaktif di `ProfileView`, `HomeView`, maupun view lainnya **wajib seragam**:
- **Border & Background**:
  ```tsx
  className="rounded-[22px] p-3.5 border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden"
  style={{ background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)' }}
  ```
- **Wadah Ikon**:
  ```tsx
  className="w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)] flex items-center justify-center"
  ```
- **Label Kategori/Arah**:
  ```tsx
  className="text-[8px] font-black text-[var(--accent-main)] uppercase tracking-wider"
  ```
- **Badge Status**:
  ```tsx
  className="text-[7.5px] font-black px-1.5 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/25"
  ```

### 2.3 Paritas Light & Dark Mode (No Hardcoded Dark Surfaces)
- **DILARANG** memaksakan background gelap pekat (seperti `#141418` atau `bg-slate-900`) atau teks `text-white` pada modal saat pengguna berada dalam tema terang (*Light Mode*).
- Seluruh modal wajib menggunakan material kaca cair adaptif:
  ```tsx
  className="liquid-glass-card border border-black/10 dark:border-white/15 text-[var(--text-primary)]"
  ```
  dengan specular sheen atas:
  ```tsx
  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
  ```

### 2.4 Safe-Area Inset & Notch iPhone 13 (STRICT)
- Seluruh header layar penuh, modal kanvas, dan lobi permainan **WAJIB** memperhitungkan safe-area iPhone berponi / Dynamic Island:
  ```tsx
  className="... pt-[max(16px,calc(10px+env(safe-area-inset-top)))] pb-2.5 ..."
  ```
- Footer aksi mengambang atau bar bawah **WAJIB** memiliki bantalan safe-area bawah:
  ```tsx
  className="... pb-[max(18px,calc(10px+env(safe-area-inset-bottom)))] ..."
  ```
- Dilarang keras menggunakan padding tetap kecil seperti `pt-3` (12px) pada elemen `fixed inset-0` karena akan bertabrakan dengan jam status bar (`10:06`), baterai, dan poni kamera depan.

### 2.5 Format Ringkas ID Pemain (Compact Hex ID Rule)
- ID Pemain mentah berupa UUID 36 karakter (`bb865b17-3900-42ed...`) **DILARANG** ditampilkan langsung di UI kartu paspor profil maupun baris Pengaturan karena akan membungkus baris dan merusak kerapihan tata letak.
- **WAJIB diformat ringkas**:
  - Paspor Profil: `#BB865B17` (atau `TAMU #ABC123`).
  - Baris Pengaturan: `#FC39F465` via fungsi helper `formatSettingsPlayerId(id)`.
  - Fitur salin ke clipboard saat kartu ditekan tetap menyalin seluruh 36 karakter UUID asli 100%.

### 2.6 Full-Page Canvas untuk Alat Kreatif & Pengalaman Kompleks
- Fitur pembuatan konten yang kompleks (seperti **Studio Kreator Bikin TTS Sendiri**) **DILARANG** dimasukkan ke dalam pop-up dialog / modal terapung kecil (`max-w-[370px]` atau `max-h-[92vh]`).
- Fitur ini **WAJIB berupa Halaman Penuh (*Full-Page Canvas*)**:
  - `fixed inset-0 z-50 bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col`
  - Sticky Top Bar dengan tombol kembali `<ArrowLeft />` yang jelas dan judul bersih.
  - Bidang masukan teks lapang, minimalis, dan elegan.
  - Sticky Bottom Floating Action Bar untuk tombol aksi utama (*Pratinjau* & *Publikasikan*).
  - Tampilan locked/paywall juga disajikan secara full-page yang modern dan minimalis.

### 2.7 Zero Native Browser Dialogs (Strict Custom Modal Rule)
- **DILARANG KERAS** menggunakan dialog browser bawaan seperti `window.confirm()`, `window.alert()`, atau `window.prompt()` di seluruh codebase. Dialog native merusak estetika antarmuka Liquid Glass dan memutus imersi pengguna di iOS/Android.
- **Wajib menggunakan `ConfirmDialogModal`**:
  - Panggil melalui hook Zustand: `openConfirmDialog({ title, message, confirmText, cancelText, isDestructive, onConfirm })`.
  - Menggunakan material adaptif kaca cair: `liquid-glass-card border border-black/10 dark:border-white/15` lengkap dengan specular sheen.

### 2.8 Zero Raw Emojis pada Toast & Label UI
- **DILARANG** menyematkan emoji mentah (`🏆`, `🔥`, `⚡`, `⚠️`, `✨`) di dalam string toast sistem (`showGlobalToast`) maupun badge UI formal.
- Gunakan ikon SVG formal dari `lucide-react` atau tipografi teks Bahasa Indonesia yang bersih, ringkas, dan profesional.

---

## 3. Gameplay Mechanics & State Invariants (STRICT)

### 3.1 Pemisahan Mutlak Hasil Duel (1v1) vs Co-op (Mabar)
- Saat sesi **1v1 Battle (Tug-of-War / Speed Race)** selesai (baik karena semua kata terisi maupun timer habis):
  - **DILARANG KERAS** memunculkan dialog Co-op `LevelCompleteModal` (*"Duo Pemecah Kata!"*).
  - Sistem **WAJIB memanggil `finishBattleRound()`** yang membuka `BattleResultModal` (rekap ronde, pemenang/kalah, dan pembaruan ELO rating).
  - Di `LevelCompleteModal.tsx`: Guard `if (!isLevelCompleteOpen || gameMode === '1v1_battle') return null;` wajib dipertahankan.

### 3.2 Invarian 'Periksa Kata' (`checkAnswers`)
- Tombol *Periksa Kata* (`checkAnswers` di `useGameStore.ts`):
  - Wajib menormalisasi perbandingan huruf dengan `trim().toUpperCase()`.
  - Jika `gameMode === '1v1_battle'`: Setiap kata yang terverifikasi wajib mengeksekusi `claimBattleClue(cid, newlySolved, 'local')` untuk mengunci petak dengan warna palet pemain dan menambah skor duel.
  - Jika `activeRoomCode && gameMode !== '1v1_battle'`: Wajib menyiarkan `mabarRealtime.broadcastClueSolved`.
  - Jika papan tuntas (`isLevelComplete`): Wajib memanggil `finishBattleRound()` pada mode duel, bukan membuka modal level biasa.

### 3.3 Active Game Session Persistence & Resume Banner
- Jika pemain sedang memiliki sesi aktif (`1v1_battle`, Turnamen, Mabar Co-op, atau Solo dengan progres berjalan) lalu berpindah tab ke Beranda/Arena/Misi/Profil:
  - Komponen `ActiveGameResumeBanner` di `App.tsx` wajib tampil mengambang di atas navigation bar.
  - **Timer duel di latar belakang wajib terus berdetak**: Ticking interval diletakkan pada banner global agar tidak berhenti saat `GameView` unmount.
  - **Auto-Kalah saat Timeout**: Jika pemain meninggalkan duel hingga `battleTimeLeft <= 0`, pemain otomatis dinyatakan kalah (*auto-forfeit*), timer dihentikan, dan hasil duel dicatat.

### 3.4 Ergonomi Tuts Keyboard & Clue Ribbon
- Tuts keyboard QWERTY pada `CustomKeyboard.tsx` memiliki tinggi minimal `h-12` (48px) dengan font `text-[16.5px] font-black` agar nyaman ditekan tanpa salah sentuh di layar iPhone 13/14/15/16.
- Pada `DynamicClueRibbon.tsx`: Badge status kata wajib berupa pill ringkas `✓ Selesai` agar tidak pernah menimpa tombol panah navigasi `<` dan `>`.

---

## 4. Studio Kreator TTS Kustom

### 4.1 Eliminasi Origin Localhost Capacitor
- Dalam pembuatan deep link dan teks berbagi (`CustomCrosswordModal.tsx` & `deeplink.ts`):
  - **DILARANG** menggunakan `window.location.origin` mentah di Capacitor karena menghasilkan `capacitor://localhost` atau `http://localhost`.
  - `getBaseOrigin()` secara otomatis memetakan lingkungan native Capacitor ke domain publik resmi:
    `https://tts-bareng-web.akashaaa-id.workers.dev`

### 4.2 Koleksi Profil 'TTS Kreasiku' & Proteksi State
- Setiap TTS kustom yang diterbitkan wajib disimpan ke state `userCustomCrosswords` (`localStorage`: `tts_user_custom_crosswords_v1`).
- **DILARANG MERESET** `userCustomCrosswords` saat keluar dari sesi mabar (`leaveMabarSession()`) atau duel. State kreasi pemain ini persisten offline-first.
- Pada `ProfileView.tsx`, seluruh karya tampil pada bento section **"TTS Kreasiku"** lengkap dengan 4 aksi:
  1. 🎮 **Mainkan**: Memuat data level TTS kustom langsung ke `GameView`.
  2. 🔗 **Bagikan**: Menyalin tautan web publik resmi (`createCustomCrosswordDeepLink`) dan membuka share sheet.
  3. ✏️ **Edit**: Membuka kembali `CustomCrosswordModal` dengan kata dan petunjuk terisi.
  4. 🗑️ **Hapus**: Konfirmasi via `openConfirmDialog` dan hapus karya dari penyimpanan perangkat.

### 4.3 Deep Link Base64 & Visual Mode Permainan Kustom
- Deep link TTS kustom dienkode secara ringkas dengan URL-safe Base64 (`encodeCustomCrosswordPayload` / `decodeCustomCrosswordParam` di `deeplink.ts`).
- Saat pengguna membuka tautan atau memindai QR code TTS kustom:
  - `Header.tsx` **WAJIB** menampilkan teks `KREASI KUSTOM • STUDIO TTS` (dilarang menampilkan `BAB 0`).
  - `LevelCompleteModal.tsx` **WAJIB** menampilkan badge `KREASI KUSTOM • TUNTAS` dengan `hasNextLevel: false` (tidak menampilkan tombol Bab Selanjutnya). Tombol bagikan langsung memanggil `createCustomCrosswordDeepLink`.

### 4.4 Tiket Undangan QR & Deep Link Terpadu TTS Kustom
- Setiap TTS kustom yang diterbitkan atau dibagikan disajikan dalam tiket Liquid Glass ber-QR code (`CustomCrosswordQrModal`).
- Di `ProfileView.tsx`, tombol *Buka TTS Teman* memicu modal impor (`ImportCustomCrosswordModal`) yang mendukung pemindaian kamera QR atau penempelan tautan.
- TTS teman yang diimpor otomatis disimpan offline di `userCustomCrosswords` dan langsung dimainkan via `playCustomCrossword`.
- Di `TTS-Web`, `CustomCrosswordWebModal` mendeteksi parameter `?custom=` dan otomatis menjembatani peluncuran aplikasi via `ttsbareng://?custom=...`.

---

## 5. Komunitas, Turnamen & Zero Dummy Data Rule

- **DILARANG KERAS** memalsukan lobi turnamen publik dengan nama fiktif statis seperti "Budi Santoso" atau "Eko Lawang".
- `DEFAULT_PUBLIC_TOURNAMENTS` wajib berupa array kosong `[]`.
- Jika belum ada lobi yang dibuat di cloud/database: `TournamentHubView.tsx` wajib menampilkan *empty state* bertema piala dengan tombol *"Buat Turnamen Sekarang"*.
- Papan peringkat (`LeaderboardModal.tsx`) secara default menampilkan **Klasemen Master ELO (Liga Catur)**.

---

## 6. Autentikasi, Keamanan, Backup & Data Invariants

### 6.1 Invarian Tipe Data `trophies` (TrophyRecord)
- State `trophies` di `useGameStore.ts` adalah objek `TrophyRecord` (`{ gold: number, silver: number, bronze: number, totalTournaments: number }`), **BUKAN ARRAY**.
- Saat `logout` atau `deleteAccountAndData`, inisialisasi reset **WAJIB** menggunakan `loadTrophies()` atau `{ gold: 0, silver: 0, bronze: 0, totalTournaments: 0 }`. Dilarang keras mereset dengan `trophies: []`.

### 6.2 Skema Backup Data Akun Versi 3
- Fitur ekspor dan impor cadangan profil di `SettingsView.tsx` menggunakan skema **Version 3** (`version: 3`).
- File cadangan mencakup: `records`, `stars`, `streak`, `shields`, `customThemeId`, `unlockedThemeIds`, `currentAvatarFrameId`, `unlockedAvatarFrameIds`, `completedQuests`, `questStats`, `userCustomCrosswords`, `trophies`, `eloRating`, `sachetPurchasedCount`, dan `customTtsTickets`.

### 6.3 Strict Account Deletion dengan Konfirmasi Ketik 'hapus'
- Sesuai Apple Guideline 5.1.1(v), tombol hapus akun di `SettingsView.tsx` dilindungi kolom input teks wajib:
  - Tombol hapus dinonaktifkan (`disabled`) hingga pengguna mengetik kata **`hapus`** secara tepat.
- Fungsi `deleteAccountAndData` di `useGameStore.ts`:
  1. Memanggil RPC Supabase `delete_user_account` (`SECURITY DEFINER`) yang secara permanen menghapus rekaman di `auth.users`, `public.profiles`, `daily_rush_leaderboard`, dan `user_progress_backup`.
  2. Melakukan sign-out native dari sesi Google, Apple, dan RevenueCat.
  3. Membersihkan seluruh kunci `localStorage` (`tts_*`, `sb-*`, `sidenotes_*`, `noticed_*`).
  4. Me-reset store aplikasi dan memuat ulang halaman (*clean reload*).

### 6.4 Pencegahan Kebocoran Status VIP
- Kunci status langganan lokal distandardisasi ke `tts_is_vip_v1`.
- Kunci usang `tts_quest_is_vip` otomatis dihapus saat boot aplikasi.
- Mode Tamu dan registrasi akun baru dijamin mewarisi `isVip: false`.
- Status VIP hanya aktif jika diverifikasi resmi melalui bukti StoreKit / RevenueCat v2 API.

### 6.5 Apple Privacy Manifest
- File `PrivacyInfo.xcprivacy` terpasang dan tertaut pada target `App` dan `TTSWidget` di Xcode project (`ios/App/App.xcodeproj/project.pbxproj`), mendeklarasikan:
  - `NSPrivacyAccessedAPITypeUserDefaults` (Alasan: `CA92.1`).
  - `NSPrivacyAccessedAPITypeFileTimestamp` (Alasan: `C617.1`).
  - Zero Tracking SDK declaration (`NSPrivacyTracking: false`).
