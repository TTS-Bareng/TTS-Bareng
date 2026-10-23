# Theme & UI Integrity Rules — TTS Bareng

Aturan ketat ini mengikat seluruh modifikasi UI, penambahan komponen, modal, dan tata letak dalam proyek **TTS Bareng**. Tujuannya adalah mencegah terjadinya ketidakselarasan warna, hardcoded styling asing, dan layout sempit yang merusak estetika desain.

---

## 1. Zero Hardcoded Colors (Strict Token Rule)
- **DILARANG KERAS** menggunakan warna hardcoded Tailwind seperti `bg-amber-*`, `text-amber-*`, `bg-indigo-*`, `text-indigo-*`, `text-emerald-*`, `bg-blue-*`, dsb. untuk komponen kartu, badge, tombol, ikon, atau teks umum.
- **Wajib 100% Theme-Adaptive**: Seluruh visual harus bersumber dari CSS variable tokens:
  - `var(--bg-main)`: Latar belakang halaman/kanvas.
  - `var(--bg-card)`: Latar kartu bento dan panel kaca.
  - `var(--accent-main)`: Warna aksen utama tema aktif (border fokus, ikon, highlight teks).
  - `var(--accent-light)`: Tint lembut untuk wadah ikon, pill badge, dan gradasi kartu.
  - `var(--accent-grad)`: Gradasi tema resmi untuk CTA utama, tombol aksi, dan badge mahkota.
  - `var(--accent-contrast)`: Warna teks/ikon di atas `var(--accent-grad)` (misal teks putih pada tema wine-red).
  - `var(--text-primary)` & `var(--text-secondary)`: Tipografi netral adaptif kontras tinggi.

---

## 2. Keseragaman Anatomi Kartu Bento (Uniform Bento Rhythm)
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

---

## 3. Paritas Light & Dark Mode (No Hardcoded Dark Surfaces)
- **DILARANG** memaksakan background gelap pekat (seperti `#141418` atau `bg-slate-900`) atau teks `text-white` pada modal saat pengguna berada dalam tema terang (*Light Mode*).
- Seluruh modal wajib menggunakan material kaca cair adaptif:
  ```tsx
  className="liquid-glass-card border border-black/10 dark:border-white/15 text-[var(--text-primary)]"
  ```
  dengan specular sheen atas:
  ```tsx
  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />
  ```

---

## 4. Full-Page Canvas untuk Alat Kreatif & Pengalaman Kompleks
- Fitur pembuatan konten yang kompleks (seperti **Studio Kreator Bikin TTS Sendiri**) **DILARANG** dimasukkan ke dalam pop-up dialog / modal terapung kecil (`max-w-[370px]` atau `max-h-[92vh]`).
- Fitur ini **WAJIB berupa Halaman Penuh (*Full-Page Canvas*)**:
  - `fixed inset-0 z-50 bg-[var(--bg-main)] text-[var(--text-primary)] flex flex-col`
  - Sticky Top Bar dengan tombol kembali `<ArrowLeft />` yang jelas dan judul bersih.
  - Bidang masukan teks lapang, minimalis, dan elegan.
  - Sticky Bottom Floating Action Bar untuk tombol aksi utama (*Pratinjau* & *Publikasikan*).
  - Tampilan locked/paywall juga disajikan secara full-page yang modern dan minimalis.
