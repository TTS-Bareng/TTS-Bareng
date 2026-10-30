# Penghapusan akun Sign in with Apple

## Alur iOS

1. Pengguna mengetik `hapus` di Pengaturan dan mengonfirmasi penghapusan akun.
2. Untuk akun yang memiliki identitas Apple, aplikasi meminta otorisasi native Apple lagi tanpa mengganti sesi Supabase. Apple ID harus sesuai dengan identitas yang terhubung.
3. Kode otorisasi sekali pakai dikirim bersama sesi Supabase ke Edge Function `delete-account`. Tidak ada retry otomatis untuk kode tersebut.
4. Server memverifikasi sesi lewat Supabase Auth, menukar kode di Apple, memverifikasi tanda tangan serta issuer/audience/expiry/subject ID token, lalu mencabut refresh token lewat `/auth/revoke`.
5. Setelah Apple mengonfirmasi pencabutan, server memanggil RPC `delete_user_account` memakai otoritas pengguna yang sama. Baru setelah keberhasilan server dikonfirmasi, aplikasi membersihkan data lokal dan kembali ke layar masuk.

Pembatalan otorisasi, Apple ID yang berbeda, token tidak valid, dan kegagalan jaringan tidak boleh ditampilkan sebagai penghapusan berhasil. Jika Apple sudah mencabut akses tetapi penghapusan basis data gagal, pengguna dapat masuk kembali dan mengulang; kode lama tidak digunakan ulang.

Token hasil pertukaran hanya digunakan dalam memori selama permintaan. Kunci Apple tidak dikirim ke aplikasi. Ini menggunakan otorisasi ulang saat penghapusan, bukan penyimpanan refresh token jangka panjang.

Aplikasi memeriksa status kredensial Apple saat startup, kembali ke foreground, dan menerima notifikasi pencabutan native. Status revoked/notFound mengeluarkan sesi lokal yang cocok. Pemeriksaan dilewati selama proses penghapusan agar tidak memotong permintaan yang sedang berlangsung. Gangguan pemeriksaan tidak dianggap sebagai pencabutan akses.

## Konfigurasi backend

Supabase proyek `qrkfjacugcalegzhcatp`, function `delete-account`, verifikasi JWT gateway aktif dan verifikasi pengguna di handler juga wajib. Secret `APPLE_PRIVATE_KEY`, `APPLE_TEAM_ID`, dan `APPLE_KEY_ID` dipasang di Edge Function Secrets. Gunakan kunci khusus TTS yang sudah memiliki kemampuan Sign in with Apple. Jangan simpan nilainya di dokumen, repositori, bundle klien, atau log.

Akun non-Apple tidak memerlukan verifikasi Apple. Mode Tamu hanya membersihkan data lokal. Klien web/non-iOS mempertahankan alur penghapusan dengan petunjuk pencabutan Apple manual; kandidat App Store ini iPhone-only.

## Bukti pengujian dan gerbang rilis

- 15 tes Node mencakup validasi sesi, pembatalan, pergantian akun saat sheet terbuka, permintaan paralel, tanda tangan Apple, audience/expiry/subject, kegagalan pertukaran/revokasi, serta urutan revoke sebelum delete.
- Function live menolak request anonim (401), menerima sesi valid untuk pemeriksaan metode baca (405), dan berhasil menghapus satu akun email uji sementara yang baru dibuat (200); pemeriksaan Auth setelahnya mengembalikan 404. Akun demo reviewer tidak dihapus.
- Probe kunci memakai kode Apple dummy mengembalikan `invalid_grant`, bukan `invalid_client`. Ini tidak menggantikan tes otorisasi Apple asli.
- Build Vite/TypeScript, typecheck handler backend, dan kompilasi/signing/upload native melalui CI #52 lulus. Build `1.0 (52)` sudah VALID di Apple dan dipilih sebagai kandidat. Pada 30 Oktober 2026, pemilik mengonfirmasi empat langkah uji Apple asli pada build 52 semuanya lulus (termasuk pembatalan, penghapusan, hilangnya akses dari pengaturan Apple, dan otorisasi ulang). Hasil perangkat ini berasal dari laporan pemilik; agent tidak mengoperasikan iPhone secara langsung.
- Pengujian perangkat: masuk Apple → hapus akun → verifikasi Apple → kembali ke layar masuk; pastikan TTS hilang dari daftar Sign in with Apple pada pengaturan Apple ID. Masuk ulang harus menawarkan otorisasi baru. Uji batal di sheet: akun tetap tersedia. Jangan gunakan akun yang progresnya masih diperlukan.

Referensi: [Apple TN3194](https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple), [Firebase: otorisasi ulang sebelum revokasi Apple](https://firebase.google.com/docs/auth/ios/apple#token_revocation).
