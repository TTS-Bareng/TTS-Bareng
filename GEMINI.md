# GEMINI.md — TTS Bareng Core Rules & Design System Blueprint

Dokumen ini adalah **sumber kebenaran tunggal (single source of truth)** untuk seluruh proses perancangan ulang (*restyle*), pembaruan struktural (*reform*), dan implementasi kode pada proyek **TTS Bareng**.

Halaman **Beranda (HomeView)** yang telah disempurnakan dijadikan sebagai **Design System Blueprint (Based Model)** acuan untuk seluruh halaman lain (`GameView`, `StatsView`, `SettingsView`, dan modal-modal aplikasi).

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
- Setiap perubahan harus diverifikasi menggunakan linting (`npx oxlint src`) dan build check (`npm run build`).
- Target: **0 warnings, 0 errors**.
- Jalankan verifikasi otomatis sebelum menyatakan pekerjaan selesai.

---

## 2. Blueprint Desain Beranda (Home as Based Model)

Seluruh halaman lain wajib mengadopsi anatomi visual, material, dan ritme yang telah mapan di `HomeView.tsx`:

### A. Material & Surface (Apple Liquid Glass)
1. **Kartu Kaca (`liquid-glass-card`)**:
   - Sudut membulat modern: `rounded-[20px]` hingga `rounded-[24px]`.
   - Latar belakang semi-transparan dengan blur tinggi (`backdrop-filter: blur(28px) saturate(180%)`).
   - Border halus ultra-tipis: `border border-black/5 dark:border-white/10`.
   - Pantulan specular atas (*specular sheen*): `inset 0 1px 0 rgba(255, 255, 255, 0.18)` pada tema gelap, atau `inset 0 1px 0 #ffffff` pada tema terang.
2. **Tombol & Tile Kaca (`liquid-glass-tile` / `liquid-glass-center-btn`)**:
   - Efek tactile saat disentuh (`tactile-active`: `active:scale-[0.97] transition-all`).
   - Indikator status aktif menggunakan `liquid-glass-tile-active` dengan aksen tema.
3. **Pill Kapsul (`rounded-full`)**:
   - Seluruh bar ticker/status menggunakan kapsul penuh melengkung (Dynamic Island style).

### B. Strict Max 3-Color Palette & Zero Hardcoded Colors Rule
Tidak boleh ada lebih dari 3 warna dominan di halaman mana pun:
1. **Warna 1: Base Canvas / Background**:
   - Tema gelap (`obsidian`, `espresso`, `oxford`): OLED dark (`#111113`, `#191716`, `#101520`).
   - Tema terang standar (`nube`, `bordo`, `racing`, `electric`, `blossom`): Studio Light murni (`#FCFCFA` hingga `#F0F0F2`).
   - Tema spesial tekstur:
     - `milky`: Milky Glass (`#F8FAFC`).
     - `sage`: Authentic Kyoto Matcha Washi (`#DBE6DB`).
2. **Warna 2: Monochrome / Context Ink & Surfaces**:
   - Teks primer (`#18181B` di terang, `#F5F5F4` di gelap, `#0F172A` di milky, `#122416` di sage).
   - Teks sekunder zinc neutral atau turunan tint selaras (`var(--text-secondary)`).
   - Surface glass semi-transparan dengan specular top sheen 1.5px.
3. **Warna 3: Theme Accent (Warna Tunggal)**:
   - Hanya menggunakan token aksen tema aktif (`var(--accent-main)`, `var(--accent-light)`, `var(--accent-grad)`, `var(--accent-contrast)`).
   - **Dilarang keras membocorkan warna lain** (Dilarang ada badge kuning/oranye/hijau/indigo hardcoded seperti `text-amber-*`, `bg-indigo-*`, `text-emerald-*`; bintang, api, dan badge wajib menggunakan `var(--accent-main)` atau monochrome).
   - **Paritas Light & Dark Mode**: Dilarang memaksakan kartu hitam pekat (`#141418`) di atas tema terang. Semua modal wajib memakai `liquid-glass-card` adaptif.
   - **Keseragaman Bento Pods**: Semua tile metric (`ProfileView`, `HomeView`) wajib memakai background `linear-gradient(135deg, var(--bg-card) 0%, var(--accent-light) 100%)`, border `border-[var(--accent-main)]/20`, dan wadah ikon `w-7 h-7 rounded-xl bg-[var(--accent-light)] border border-[var(--accent-main)]/25 text-[var(--accent-main)]`.
   - **Full-Page Studio Canvas**: Fitur authoring kompleks seperti Studio Kreator TTS Custom dilarang dibuat sebagai modal mengambang sempit; wajib berupa kanvas layar penuh (*Full-Page Canvas*) minimalis.

### C. Aturan Bayangan: No Over Shadow & No Glowing Shadow
- **Dilarang efek neon glow**: Jangan menggunakan `box-shadow` tebal berwarna atau ambient orbs fuzzy (`blur-3xl`).
- **Gunakan bayangan taktil natural**: Ambient occlusion halus (`0 2px 8px rgba(0,0,0,0.04)` terang, `0 8px 24px rgba(0,0,0,0.45)` gelap) dipadukan dengan 1px specular highlight.

### D. Spacing & Vertical Rhythm (Anti-Mepet Navbar)
- Container halaman utama:
  ```tsx
  className="w-full flex-1 flex flex-col gap-3 px-3.5 pt-[20px] pb-[90px] select-none overflow-y-auto relative"
  ```
- **Jarak antar kartu**: Seragam dan rapat (`gap-3` atau 12px).
- **Jarak ke Navbar**: `pb-[90px]` memastikan kartu paling bawah selalu memiliki jarak bernapas yang lega (~16px) di atas floating navigation bar (`h-[62px]` pada `bottom-3`).
- Kartu paling bawah tidak boleh menempel tipis ke navbar.

### E. Zero Dummy Data Rule (Data Nyata 100%)
- **Dilarang memasukkan angka/teks tiruan statis** (seperti `18 Kata`, `60%`, target 3/5 palsu).
- Seluruh metrik, chart batang, target harian, dan ringkasan level **wajib terikat ke state riil** (`useGameStore`, `levelRecords`, `solvedClues`, data level aktif, atau riwayat `localStorage`).
- Progres harian dihitung dari kata yang benar-benar dipecahkan pengguna.

### F. Strict Content Distinction (Konten Berbeda Antar Elemen)
- Setiap card, badge, atau ticker di satu layar **wajib memiliki fokus konten yang berbeda 100%**:
  - **Kata Hari Ini**: Kosakata puitis/langka KBBI dengan fonetik, definisi, dan contoh kalimat.
  - **Trivia Pill**: Fakta sejarah teka-teki silang, linguistik, dan neurosains (bukan pengulangan kata hari ini).

### G. No Forced Bottom Pills (Hindari Pill Bawah yang Dipaksakan)
- **Dilarang memaksakan Dynamic Island Pill di bawah setiap halaman**:
  - Pill bawah di `HomeView` hadir secara kontekstual untuk menyeimbangkan sisa ruang vertikal.
  - Halaman berbasis konten/daftar (seperti `StatsView` dan `QuestsView`) **tidak boleh** dipaksakan ada pill bar di bawah jika hanya redundan atau menambah kebisingan visual.
  - Biarkan kartu konten utama (misal daftar Lencana atau Tantangan Kata) menjadi penutup alami halaman dengan proteksi jarak `pb-[90px]`.

### H. Strict No Emoji Rule in UI / Content (Dilarang Emoji Mentah)
- **Dilarang keras menyematkan emoji mentah** (seperti ⚡, 🎯, 🤝, 💡, 🔥, 🏆, 💀, 🤔, dll.) pada judul kartu, badge, tombol, label status, maupun paragraf konten aplikasi. Emoji membuat UI terasa *slop* dan tidak konsisten antar OS.
- **Wajib menggunakan ikon vektor Lucide**: Seluruh visual penanda wajib menggunakan komponen ikon dari `lucide-react` dengan stroke tipis elegan (`stroke-[1.8]` hingga `stroke-[2.2]`) yang warnanya terikat ke monochrome atau `var(--accent-main)`.
- *Satu-satunya pengecualian*: Avatar pengguna jika pengguna secara eksplisit memilih avatar berbasis teks/emoji di profil.

---

## 3. Rencana Restyle & Reform Halaman Lain (Berdasarkan Home)

Gunakan blueprint di atas saat merombak halaman-halaman berikut:

| Halaman / Komponen | Target Reformasi Berdasarkan Home | Status |
| :--- | :--- | :--- |
| **`HomeView.tsx`** | Clean Solo Lobby: Hero Peta Petualangan, Hub Mabar & Daily Rush, Kata Hari Ini KBBI, Trivia Wawasan, eliminasi bloat. | Selesai (Blueprint) |
| **`ArenaView.tsx`** | **12 Alam Tematik Nusantara**: Bento Accordion 12 Alam, Micro Progress Bar real-time, Mode Main Acak (*Dices*), Glosarium Kata, 220 Bab (2.652 kata, 0 tabrakan paralel). | Selesai |
| **`SocialView.tsx`** | **The Origin Moat**: Mabar Co-op (1 Papan live via link WA), 1v1 Arena (Tug-of-War & Speed Race), Daily Rush nasional 90s. | Selesai |
| **`QuestsView.tsx`** | Bento misi harian, reward chest 50★, kalkulasi kata riil, anti-mepet navbar. | Selesai |
| **`ProfileView.tsx`** | **Unified Apple Bento Profile**: 4 Metrik riil (Akurasi %, Kata, Bab, Streak), Lencana prestasi, Swatch tema, 2x2 bento switches, backup/restore JSON. | Selesai |
| **`SettingsView.tsx`** | Unified Apple Bento Settings: Hero Profile Card bertema gradien penuh, Swatch Strip tema, 2x2 Bento Switch Tiles, dan Cadangan Offline. | Selesai |
| **Modals (`LevelCompleteModal`, `AuthModal`, `AdModal`, `LevelSelectModal`, `LexiconModal`, `AvatarPickerModal`)** | Apple Liquid Glass, specular top sheen 1.5px, maskot 3D Plush resmi, Vibrant Hero Gradient victory card, dan tombol pil kapsul taktil. | Selesai |

---

## 4. Standar Eksekusi & Validasi

Sebelum menyelesaikan setiap sesi pengerjaan:
1. `npx oxlint src` → Wajib **0 warnings, 0 errors**.
2. `npm run build` → Wajib lolos kompilasi TypeScript dan bundling Vite tanpa error.
3. Pastikan dev server (`npm run dev`) HMR berjalan mulus pada `http://localhost:5173/`.
