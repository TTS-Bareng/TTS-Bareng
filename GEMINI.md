# GEMINI.md — TTS Bareng Core Rules & Design System Blueprint

Dokumen ini adalah **sumber kebenaran tunggal (single source of truth)** untuk seluruh proses perancangan ulang (*restyle*), pembaruan struktural (*reform*), dan implementasi kode pada proyek **TTS Bareng (TTS-App)**.

---

## 1. Prinsip Karpathy (Pedoman Perilaku Pengkodean)

Pedoman ini bertujuan untuk meminimalkan kesalahan umum LLM, bias terhadap kehati-hatian (*caution over speed*), dan mencegah kode berlebih.

### A. Think Before Coding
**Jangan berasumsi. Jangan sembunyikan keraguan. Buka semua pertimbangan (*tradeoffs*).**
- Nyatakan asumsi secara eksplisit sebelum mengimplementasikan. Jika ragu, tanyakan.
- Jika ada beberapa interpretasi, sajikan opsinya kepada user — jangan memilih diam-diam.
- Jika ada solusi yang jauh lebih simpel, katakan dan dorong solusi tersebut.
- Jika ada hal yang membingungkan atau kontradiktif, **berhenti sejenak, sebutkan masalahnya, dan tanyakan**.

### B. Simplicity First
**Kode seminimal mungkin yang menyelesaikan masalah. Jangan spekulatif.**
- Dilarang membuat fitur di luar yang diminta.
- Dilarang membuat abstraksi untuk kode sekali pakai.
- Dilarang menambahkan "fleksibilitas" atau "konfigurabilitas" yang tidak diminta.
- Dilarang menulis error handling untuk skenario yang mustahil terjadi.
- Jika bisa diselesaikan dalam 30 baris kode yang elegan, jangan tulis 150 baris.

### C. Surgical Changes
**Sentuh hanya yang perlu disentuh. Bersihkan hanya apa yang kita ubah.**
- Jangan "mempercantik" kode, komentar, atau format file di luar cakupan tugas.
- Jangan merefaktor kode yang sedang bekerja dengan baik.
- Pertahankan style dan pola kode yang sudah ada.
- Jangan menghapus *dead code* bawaan sebelumnya kecuali diminta secara eksplisit.
- **Uji Utama:** Setiap baris kode yang diubah harus dapat ditelusuri langsung ke permintaan user.

### D. Goal-Driven Execution
**Definisikan kriteria sukses. Loop hingga terverifikasi.**
- Setiap perubahan harus diverifikasi menggunakan linting (`npm run lint` / `oxlint`) dan build check (`npm run build`).
- Target: **0 warnings, 0 errors**.
- Jalankan verifikasi otomatis sebelum menyatakan pekerjaan selesai.

---

## 2. Blueprint Desain & Strict UI Tokens

### A. Material & Surface (Apple Liquid Glass)
1. **Kartu Kaca (`liquid-glass-card`)**:
   - Sudut membulat modern: `rounded-[20px]` hingga `rounded-[24px]`.
   - Latar belakang semi-transparan dengan blur tinggi (`backdrop-filter: blur(28px) saturate(180%)`).
   - Border halus ultra-tipis: `border border-black/5 dark:border-white/10`.
   - Pantulan specular atas (*specular sheen*): `<div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />`.
2. **Keseragaman Bento Pods**:
   - Background: `linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)`.
   - Border: `border border-[var(--accent-main)]/20 shadow-xs relative overflow-hidden`.
   - Wadah ikon: `w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)] flex items-center justify-center`.
   - Label kategori: `text-[8px] font-black text-[var(--accent-main)] uppercase tracking-wider`.
   - Badge status: `text-[7.5px] font-black px-1.5 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-main)] border border-[var(--accent-main)]/25`.

### B. Strict Max 3-Color Palette & Zero Hardcoded Colors Rule
- **Dilarang keras menggunakan warna hardcoded Tailwind** (`bg-amber-*`, `text-indigo-*`, `bg-emerald-*`, dsb.).
- Seluruh visual harus 100% theme-adaptive via CSS variables:
  `var(--bg-main)`, `var(--bg-card)`, `var(--accent-main)`, `var(--accent-light)`, `var(--accent-grad)`, `var(--accent-contrast)`, `var(--text-primary)`, `var(--text-secondary)`.

### C. Safe Area & Notch Insets (iPhone 13 & All iOS Devices)
- Header layar penuh & lobi: `pt-[max(16px,calc(10px+env(safe-area-inset-top)))]`.
- Footer aksi & bar bawah: `pb-[max(18px,calc(10px+env(safe-area-inset-bottom)))]`.
- Dilarang padding statis kecil (`pt-3`) pada elemen `fixed inset-0` karena menabrak status bar.

### D. Format Ringkas ID Pemain
- Format chip ID di Paspor Profil: `#BB865B17` (atau `TAMU #ABC123`).
- Baris Pengaturan: `#FC39F465` via `formatSettingsPlayerId(id)`.
- Fitur salin tetap menyalin 36 karakter UUID asli ke clipboard.

### E. Full-Page Studio Canvas
- Studio Kreator TTS Custom **wajib berupa Full-Page Canvas** (`fixed inset-0 z-50 bg-[var(--bg-main)] flex flex-col`), dilarang berupa pop-up modal terapung sempit.

---

## 3. Gameplay Mechanics & State Invariants (STRICT)

### A. Pemisahan Duel (1v1) vs Co-op (Mabar)
- Saat sesi **1v1 Battle** selesai (seluruh kata terisi atau waktu habis):
  - **Dilarang keras memunculkan `LevelCompleteModal` (Duo Pemecah Kata)**.
  - Wajib mengeksekusi `finishBattleRound()`, membuka **`BattleResultModal`** (rekap ronde, pemenang/kalah, dan kalkulasi rating ELO).
  - `LevelCompleteModal` memiliki guard mutlak `if (!isLevelCompleteOpen || gameMode === '1v1_battle') return null;`.

### B. Invarian 'Periksa Kata' (`checkAnswers`)
- Normalisasi huruf dengan `trim().toUpperCase()`.
- Pada `gameMode === '1v1_battle'`: Setiap kata terverifikasi wajib memanggil `claimBattleClue(cid, newlySolved, 'local')`.
- Pada Mabar Co-op: Wajib menyiarkan `mabarRealtime.broadcastClueSolved`.
- Saat papan tuntas: Mode duel wajib memanggil `finishBattleRound()`.

### C. Active Game Session Persistence & Resume Banner
- Jika pemain memiliki sesi game aktif (`1v1_battle`, Turnamen, Mabar, atau Solo berjalan) lalu berpindah tab, banner kaca cair `ActiveGameResumeBanner` mengambang di atas navigasi bar.
- **Timer duel terus berdetak di latar belakang**.
- Jika waktu habis saat pemain di luar arena, pemain otomatis dinyatakan kalah (*auto-forfeit*) dan banner beralih ke notifikasi kekalahan waktu habis.

### D. Ergonomi Keyboard & Clue Ribbon
- Tuts keyboard QWERTY `CustomKeyboard.tsx`: tinggi minimal `h-12` (48px) dengan `text-[16.5px] font-black`.
- Clue ribbon `DynamicClueRibbon.tsx`: badge status berupa pill ringkas `✓ Selesai`, tombol panah diberi kontainer `shrink-0 z-10` terisolasi agar tidak pernah tertimpa.

---

## 4. TTS Kustom: Web Origin & Profil

- Dalam deep link & share text: origin lokal Capacitor otomatis dipetakan ke web publik:
  `https://tts-bareng-web.akashaaa-id.workers.dev`.
- Karya TTS disimpan ke state `userCustomCrosswords` (`localStorage`: `tts_user_custom_crosswords_v1`).
- Pada `ProfileView.tsx`, bento section **"TTS Kreasiku"** menyediakan tombol: **Mainkan**, **Bagikan**, **Edit**, dan **Hapus**.

---

## 5. Komunitas & Zero Dummy Data Rule

- `DEFAULT_PUBLIC_TOURNAMENTS` wajib berupa array kosong `[]` (dilarang ada host fiktif Budi/Eko).
- Jika kosong, `TournamentHubView.tsx` menampilkan empty state bertema piala dengan tombol *"Buat Turnamen Sekarang"*.
- Tab default `LeaderboardModal.tsx` adalah **Klasemen Master ELO**.

---

## 6. Autentikasi, Keamanan & Penghapusan Akun

- Konfirmasi hapus akun di `SettingsView.tsx` wajib mengetik kata **`hapus`** secara presisi sebelum tombol konfirmasi aktif.
- Penghapusan akun mengeksekusi RPC Supabase `delete_user_account` (`SECURITY DEFINER`), membersihkan sesi Google/Apple/RevenueCat, menghapus seluruh cache `localStorage` (`tts_*`, `sb-*`, `sidenotes_*`, `noticed_*`), dan me-reload aplikasi.
- Status VIP lokal distandardisasi ke `tts_is_vip_v1` dan divalidasi mutlak via StoreKit / RevenueCat v2 API.
- Apple Privacy Manifest `PrivacyInfo.xcprivacy` terpasang di target App & Widget.

---

## 7. Standar Validasi

Sebelum menyatakan pekerjaan selesai:
1. `npm run lint` → Wajib **0 errors**.
2. `npm run build` → Wajib lolos `tsc -b` dan Vite production build (0 TypeScript error).
3. `npx cap sync ios` → Wajib sukses menyinkronkan seluruh plugin native dan aset web.
