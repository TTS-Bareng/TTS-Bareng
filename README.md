# TTS Bareng — Mabar Teka Teki Silang

> **Aplikasi Teka Teki Silang Modern, Realtime Multiplayer & Offline-First Standar KBBI**

[![Build iOS IPA & Android APK](https://github.com/TTS-Bareng/TTS-Bareng/actions/workflows/build-ipa-apk.yml/badge.svg)](https://github.com/TTS-Bareng/TTS-Bareng/actions/workflows/build-ipa-apk.yml)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/TTS-Bareng/TTS-Bareng)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🌟 Fitur Utama

- 🧩 **220 Bab & 2.652 Kosakata KBBI**: Terbagi ke dalam 12 Alam Tematik Nusantara tanpa tabrakan paralel.
- 🤝 **Mabar Co-op (1 Papan Live)**: Pecahkan teka-teki bersama teman secara real-time cukup dengan membagikan tautan kamar (WhatsApp / QR Code).
- ⚔️ **1v1 Arena (Tug-of-War & Speed Race)**: Adu cepat dan rebut petak huruf dengan sistem Fair Play.
- ⚡ **Daily Rush 90s**: Tantangan kilat berwaktu dengan seed harian nasional seragam setiap 00:00 WIB, audio detak jantung sub-bass, dan papan peringkat nasional.
- 🎨 **Apple Liquid Glass Design**: Desain modern berbasis *Strict Max 3-Color Palette*, efek taktil natural, dan 8 pilihan tema dinamis (Obsidian, Nube, Bordo, Racing, Electric, Blossom, Milky, Sage).
- 📱 **Sideload Ready (iOS SideStore & Android APK)**: Pipeline GitHub Actions otomatis untuk mengompilasi `.ipa` (siap sign di SideStore / AltStore) dan `.apk` secara gratis di cloud.
- ☁️ **Supabase Realtime & Cloud Backup**: Sinkronisasi kamar, profil, dan rekor leaderboard instan.

---

## 🚀 Menjalankan Secara Lokal

```bash
# 1. Clone repositori
git clone https://github.com/TTS-Bareng/TTS-Bareng.git
cd TTS-Bareng

# 2. Pasang dependensi
npm install

# 3. Salin konfigurasi environment
cp .env.example .env

# 4. Jalankan development server
npm run dev
```

Buka `http://localhost:5173/` pada browser Anda.

---

## 🛠️ Integrasi Supabase

1. Buka dashboard Supabase Anda.
2. Buka **SQL Editor** dan jalankan seluruh query pada file [`supabase/schema.sql`](supabase/schema.sql).
3. Isi kredensial di file `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret
   ```

---

## 📲 Sideload iOS via SideStore & Android APK

Untuk mengompilasi file installer `.ipa` dan `.apk` langsung di GitHub secara gratis:

1. Buat dan push tag versi baru ke repositori:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
2. GitHub Actions akan otomatis:
   - Mengompilasi web bundle dan menyinkronkan Capacitor.
   - Mengarsipkan Xcode project menjadi `TTS-Bareng.ipa` (unsigned, siap untuk disign oleh SideStore di iPhone).
   - Mengompilasi Gradle project menjadi `TTS-Bareng.apk`.
   - Mengunggah file `.ipa` dan `.apk` ke tab **Releases** di GitHub.
3. Unduh `TTS-Bareng.ipa` di iPhone dan buka lewat **SideStore** / **AltStore** untuk instalasi langsung.

---

## 📂 Struktur Proyek

```
TTS-Bareng/
├── .github/workflows/    # CI/CD: Otomasi build iOS IPA & Android APK
├── android/              # Native Android Capacitor Project
├── ios/                  # Native iOS Capacitor Project (Xcode Workspace)
├── public/               # Asset statis, logo WebP, manifest, service worker
├── src/
│   ├── assets/           # 18 Maskot 3D Plush Nusantara WebP
│   ├── components/       # Komponen UI (FloatingGrid, Header, CustomKeyboard, Modals)
│   ├── lib/              # Audio engine, deep link, crossword algorithms, supabase client
│   ├── store/            # State management terpusat (useGameStore)
│   └── views/            # HomeView, ArenaView, SocialView, QuestsView, ProfileView, SettingsView
├── supabase/             # Skrip skema database & realtime RLS (schema.sql)
└── capacitor.config.ts   # Konfigurasi platform mobile Capacitor
```

---

## 📄 Lisensi

Didistribusikan di bawah lisensi MIT.
