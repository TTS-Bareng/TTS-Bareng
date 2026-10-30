# Status kandidat App Store — 30 Oktober 2026

## Terverifikasi

- Koneksi Supabase proyek TTS Bareng dan akses SQL tersedia.
- Empat migration diterapkan: moderasi kreasi, pembersihan data akun, privasi inbox, dan koreksi pembersihan JSON. Berkas lokal memakai versi migration yang dikembalikan server.
- Uji SQL dijalankan dalam transaksi rollback: pending tidak tersedia untuk akun lain, laporan/blokir berfungsi, akun pelapor dan pembuat dapat dihapus, clue non-string ditolak, inbox privat, pertemanan dua arah bekerja, dan inbox tidak dapat dipalsukan lewat akses tabel.
- Tiga tes helper penghapusan akun lulus. Build aplikasi dan web berhasil; diff check lulus. Peringatan bundle besar tetap ada.
- Pemeriksaan independen menemukan beberapa kasus batas; perubahan meliputi FK laporan, penutupan game setelah blokir, penjagaan request Play asinkron, validasi tipe JSON, blokir perangkat lintas logout, mutasi inbox atomik, dan pembersihan JSON root.
- Pemilik akan menjadi moderator. Instruksi berada di `docs/app-store-moderation.md`.

## Perubahan perilaku penting

- Publikasi TTS memerlukan akun dan pemeriksaan moderator sebelum dapat dibuka orang lain. Tautan payload lama ditolak; kreasi lama perlu diterbitkan ulang lewat Studio untuk dibagikan.
- Pemain tamu tetap dapat bermain; pertemanan cloud memerlukan akun terdaftar.
- Inbox sosial lama dipindahkan ke arsip privat sebelum antrean aktif dikosongkan karena dahulu dapat ditulis publik. Perlu mengirim ulang permintaan lama yang masih diinginkan.
- Build lama belum menggunakan RPC sosial baru, sehingga alur pertemanan lama tidak kompatibel dengan pembatasan akses baru. Gunakan kandidat baru untuk pengujian.
- Halaman privasi web sudah terpublikasi dan diperiksa pada `https://tts-bareng-web.akashaaa-id.workers.dev/#privacy`, termasuk Supabase, RevenueCat, moderasi, dan penghapusan akun.

## Verifikasi draft awal sebelum perbaikan revokasi

- Versi `1.0`, build `51`, berstatus `READY_FOR_REVIEW`. Build Apple berstatus `VALID`; kandidat terbaru dikonfigurasi iPhone-only oleh commit `5b25028`.
- Konflik screenshot diatasi dengan melepas dua **item antrean review** gambar `TTS - 8.png` dan `TTS - 07.png` dari draft. Berkas Asset Library tidak dihapus. Add for Review kemudian berhasil.
- Draft `5eb4497b-be6a-4f3e-b360-04d778a5728d` berisi enam item siap: versi aplikasi, dua IAP, dua langganan, dan grup langganan. Tombol Submit for Review aktif; `submittedDate` masih null.
- Distribusi hanya Indonesia (`IDN`); ekspansi otomatis ke wilayah baru dimatikan.
- Privacy Nutrition Label delapan kategori sudah published. Deklarasi UGC dikoreksi menjadi true. Contests menjadi `FREQUENT_OR_INTENSE` karena arena, kompetisi harian, dan peringkat tersedia secara rutin, sesuai definisi Apple.
- Catatan reviewer menjelaskan antrean moderasi dan fitur akun. Akun demo non-admin khusus Apple dibuat dengan persetujuan pengguna; login password ke Supabase diverifikasi. Kredensial disimpan di Sign-In Information App Store Connect dan berkas lokal yang diabaikan Git, tidak di dokumen ini.
- Apple Developer Program License Agreement terbaru tercatat accepted 30 Oktober 2026. Paid Apps Agreement, Free Apps Agreement, rekening bank, dan formulir pajak berstatus Active pada pemeriksaan browser.
- Pengguna mengonfirmasi uji TestFlight build 51 (login, mabar, pembelian VIP, restore, hapus akun) semuanya lulus. Ini laporan pengguna; bukan pengujian perangkat oleh agent.
- Pengguna mengonfirmasi seluruh aset/audio memiliki hak atau izin dan petunjuk ditulis sendiri. Deklarasi hak konten diperiksa berdasarkan konfirmasi tersebut.
- `npm run build` dan tiga tes helper penghapusan akun lulus pada checkout terakhir. Peringatan ukuran bundle tetap ada.

## Handoff

- Kandidat terbaru: tag `v1.0.63`, commit `dc8167b`, build `1.0 (52)`. CI #52 berhasil; Apple processing VALID; build 52 dipilih pada versi App Store. Akun demo dan catatan reviewer dipertahankan/diperbarui. Backend `delete-account` aktif, pemeriksaan sesi dan penghapusan akun uji sementara lulus, 15 tes otomatis lulus.
- **Belum dinyatakan siap submit ulang:** konfirmasi uji Apple asli pada build 52 masih ditunggu. Item versi aplikasi sementara dilepas dari antrean draft, sementara lima item IAP/langganan/grup tetap ada. Setelah tes lulus, Add for Review harus dijalankan lagi dan tombol akhir diperiksa. Agent belum mengirim submission.
- Moderator tetap perlu memeriksa kreasi pending dan laporan setiap hari menurut `docs/app-store-moderation.md`.
- Setelah pemeriksaan build 51, alur iOS pencabutan akses Apple otomatis diimplementasikan melalui otorisasi ulang dan Edge Function. Lihat `docs/apple-account-deletion.md`. Build kandidat baru dan tes Apple di perangkat harus lulus sebelum menggantikan build 51 di draft. Status Ready for Review adalah validasi draft Apple, bukan jaminan hasil penilaian kepatuhan saat review.
