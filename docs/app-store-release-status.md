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

## Handoff (checkpoint 30 Oktober 2026; lihat status penolakan terbaru di bawah)

- Kandidat terbaru: tag `v1.0.63`, commit `dc8167b`, build `1.0 (52)`. CI #52 berhasil; Apple processing VALID; build 52 dipilih pada versi App Store. Akun demo dan catatan reviewer dipertahankan/diperbarui. Backend `delete-account` aktif, pemeriksaan sesi dan penghapusan akun uji sementara lulus, 15 tes otomatis lulus.
- **Siap untuk pemilik menekan Submit for Review.** Pengguna mengonfirmasi empat langkah uji Apple pada build 52 semuanya lulus: pembatalan mempertahankan akun, penghapusan kembali ke layar masuk, akses TTS hilang dari daftar Sign in with Apple, dan masuk ulang meminta otorisasi baru. Ini hasil pengujian perangkat yang dilaporkan pengguna.
- Add for Review build 52 berhasil. Pemeriksaan UI dan API terakhir menunjukkan versi dan draft `READY_FOR_REVIEW`, enam item semuanya siap, tidak ada item screenshot tersendiri yang mengunci submission, dan tombol Submit for Review aktif. Akun demo tersedia, distribusi hanya `IDN`, build VALID dan encryption exempt. `submittedDate = null`; agent belum mengirim submission.
- Bukti UI tersimpan lokal di `app_store_screenshots/ready-for-review-build52.png`. `npm run build` dijalankan kembali dan lulus setelah konfirmasi perangkat; peringatan ukuran bundle tetap nonfatal.
- Moderator tetap perlu memeriksa kreasi pending dan laporan setiap hari menurut `docs/app-store-moderation.md`.
- Alur iOS pencabutan akses Apple otomatis pada build 52 memakai otorisasi ulang dan Edge Function. Lihat `docs/apple-account-deletion.md`. Tidak ada gerbang implementasi/pengujian yang masih terbuka dalam rencana ini. Keputusan persetujuan aplikasi tetap berada pada Apple App Review.

## Penolakan 3 November 2026 dan perbaikan 4 November 2026

- Submission `5eb4497b-be6a-4f3e-b360-04d778a5728d`, build 52, ditolak dengan 3.1.2(c), 2.3.10 dan 2.3.4. Status siap pada checkpoint sebelumnya tidak lagi berlaku.
- Apple meminta tautan Terms of Use pada metadata, penghapusan referensi Google Play/status bar non-iOS dari media, dan app preview yang hanya menampilkan screen capture tanpa bingkai perangkat.
- Satu-satunya localization listing aktif adalah Indonesian. Deskripsi diperbarui dengan URL standard Apple EULA; klaim pertama di Indonesia, standar resmi KBBI dan jaminan 100% disederhanakan. Promotional Text dirapikan. Perubahan disimpan di App Store Connect.
- Preview `tts_preview_886x1920.mp4` dilepas dari versi; aset asal tetap di Asset Library. Delapan screenshot `TTS - ...` diganti tiga screenshot UI dari `preview_screenshots`: gameplay, beranda, dan mabar. Unggah ketiganya selesai, dan seluruh ukuran iPhone terverifikasi memakai aset baru (langsung atau fallback), tanpa video.
- Build 52 merupakan kandidat iPhone-only menurut konfigurasi/catatan rilis. Jangan memakai materi layout native iPad untuk merepresentasikan binary tersebut.
- Satu screenshot iPad sempat ditambahkan lalu dilepas kembali setelah mencocokkan konfigurasi `TARGETED_DEVICE_FAMILY = 1`; UI memverifikasi penempatan itu tidak tersisa. Aset asal tetap di Asset Library. Review Notes dikoreksi untuk menyebut kandidat iPhone, dan kode ruangan pada deskripsi tidak lagi disebut empat huruf.
- Readback akhir: deskripsi memuat URL EULA dan Save disabled; Media Manager menyimpan 3/10 screenshot pada iPhone besar dengan fallback pada ukuran lain, 0/3 app previews. Bukti lokal: `app_store_screenshots/rejection-fix-terms-20261104.png` dan `rejection-fix-media-20261104.png`.
- Apple secara eksplisit meminta screen recording alur langganan. Permintaan rekaman perangkat build 52 (pilihan/harga, tautan ketentuan dan privasi, tanpa transaksi/data pribadi) sudah diajukan ke pemilik; belum diterima. Jangan mengklaim semua permintaan reviewer sudah selesai sebelum rekaman dan validasi akhir.
- `npm run build` lulus pada 4 November 2026; peringatan ukuran bundle tetap nonfatal. Tidak ada perubahan kode aplikasi atau upload binary baru untuk koreksi metadata ini. Belum membalas reviewer atau mengirim ulang submission.

### Bukti rekaman diterima

- Pemilik menyerahkan rekaman iPhone `20261104_015126000_iOS.MP4` (93,775 detik). Pemeriksaan frame menunjukkan pilihan periode/harga VIP, Apple EULA terbuka di Safari dan Privacy Policy di dalam aplikasi.
- Salinan lampiran dibuat sebagai H.264 720x1558, 93,777 detik, 9.103.516 byte, tanpa audio, mempertahankan seluruh urutan layar. Berkas lokal `app_store_screenshots/tts-subscription-review-20261104.mp4`; jangan gunakan sebagai app preview publik. Sumber asli tetap utuh.
- Lampiran video berhasil ditambahkan ke App Review Information; Notes diperbarui dengan panduan isi rekaman dan disimpan. Draf balasan submission juga disiapkan dengan lampiran video dan penjelasan tiga koreksi; menunggu izin eksplisit pemilik untuk mengirim komunikasi tersebut. Jangan klaim sudah membalas atau resubmit.
- Setelah pemilik memberi izin eksplisit, balasan beserta video dikirim pada 4 November 2026. UI menunjukkan `Messages (2)`, pesan Aji Aditya dengan lampiran MP4 dan tombol Reply to App Review; Continue Draft/Delete Draft sudah tidak ada. Bukti: `app_store_screenshots/review-reply-sent-20261104.png`. Pengiriman pesan ini tidak mengirim ulang aplikasi; submission masih berstatus Unresolved Issues/Rejected pada pemeriksaan tersebut.
- Pemilik kemudian secara eksplisit meminta pengiriman ulang. Update Review pada versi 1.0 berhasil mengubah item aplikasi menjadi Ready for Review; Resubmit to App Review kemudian berhasil. Pemeriksaan UI pada 4 November 2026 menunjukkan submission dan keenam item (build 52, dua IAP, dua langganan dan grup langganan) berstatus **Waiting for Review**. Bukti: `app_store_screenshots/resubmitted-waiting-review-20261104.png`. Ini pengiriman ulang yang berhasil, bukan persetujuan Apple.

## Penolakan kedua — 5 November 2026

- Build 52 kembali ditolak. Pesan Apple terbaru hanya mengutip 2.3.10: screenshot masih memiliki status bar non-iOS. Jangan menyimpulkan guideline lain sudah disetujui secara terpisah.
- Lampiran Apple `14f1a125d63438ae2140768e248cee4367d9a423.png` cocok dengan aset co-op yang diunggah 4 November. Kesalahan sebelumnya: menganggap status bar hasil komposisi pada screenshot web memadai. Klaim pesan sebelumnya bahwa screenshot tersebut bebas status bar non-iOS tidak terkonfirmasi dan bertentangan dengan temuan reviewer.
- Ketiga penempatan screenshot lama dilepas (berkas tetap di Asset Library), diganti dua frame dari rekaman iPhone asli pemilik: Home pada detik 1 dan Profile pada detik 82. Seluruh frame disesuaikan resolusi 1170x2532 menjadi 1290x2796; tidak menambah status bar/frame/teks. Indikator rekaman asli dipertahankan. Lihat `app_store_screenshots/review_fix_20261105/README.md`.
- Pemeriksaan semua ukuran iPhone: tiga nama aset lama tidak ada, kedua aset baru muncul langsung/fallback, semua preview 0. Bukti UI `app_store_screenshots/review_fix_20261105/asc-genuine-captures.png`.
- `npm run build` lulus 5 November; peringatan bundle tetap nonfatal. Koreksi ini tidak mengubah kode atau build 52. Status belum dikirim ulang setelah revisi kedua; keputusan penerimaan tetap pada Apple.
- Review Notes diperbarui dengan asal tangkapan iPhone dan koreksi klaim sebelumnya. Draf balasan baru disimpan tanpa dikirim. Dua PNG terverifikasi 1290x2796 tanpa alpha (sekitar 2 MB masing-masing). Update Review sementara ditahan Apple dengan pesan `1 or more screenshots must finish processing`; jangan menyatakan siap resubmit sebelum pesan itu hilang.
- Pemrosesan kemudian selesai. Percobaan Update Review terakhir berhasil kembali ke submission dengan tombol **Resubmit to App Review aktif**; status keseluruhan masih Unresolved Issues sampai dikirim ulang. Balasan terbaru tetap draf. Belum mengirim ulang pada siklus penolakan kedua ini.
- Setelah pemilik memerintahkan `kirim`, balasan koreksi status bar dikirim dan terverifikasi sebagai Messages (4), tanpa kontrol draft. Pengiriman ulang juga berhasil pada **5 November 2026, 22:23** menurut App Store Connect. Keenam item termasuk versi **1.0 (52)** dan submission berstatus **Waiting for Review**. Bukti `app_store_screenshots/review_fix_20261105/waiting-for-review.png`. Belum ada persetujuan Apple.

## Persetujuan Resmi Apple & Rilis v1.0.1 (Update Preview & Perbaikan OTP) — 9 November 2026

- **Persetujuan Resmi**: Versi 1.0 (52) resmi disetujui oleh Apple dan berstatus **READY_FOR_SALE** terdistribusi di Apple App Store.
- **Pembaruan Halaman Produk & Video Preview**:
  - Dibuat draft versi `1.0.1` (`7f16f089-7f65-4a57-96f8-1aeea17cd475`) di App Store Connect.
  - Preview Set `IPHONE_67` dibuat dan diunggah video preview resmi `tts_preview_886x1920.mp4` (20 detik, 30 fps, H.264 AAC) di urutan pertama (status COMPLETE).
  - Screenshot Set `APP_IPHONE_67` diperbarui dengan 8 screenshot baru beresolusi 1320x2868 yang telah diflatkan ke `RGB 24-bit` tanpa alpha (`TTS - 01.png` s.d. `TTS - 08.png`, status COMPLETE).
- **Perbaikan OTP & Link Scanner Auto-Confirm Recovery**:
  - Dibuat `src/lib/emailOtp.ts` untuk mendukung validasi kode OTP 6 maupun 8 digit secara fleksibel.
  - Diperbarui `InitialAuthView.tsx` dengan segmented display adaptif 6/8 digit dan fallback otomatis `signInWithEmailPassword` jika scanner email Apple Mail mem-prefetch tautan dan mengonsumsi token OTP sebelum diketik pengguna.
  - Ditambahkan unit test `tests/emailOtp.test.mjs` (4/4 passed; seluruh 19 tes registrasi & penghapusan akun lulus 100%).
- **Persiapan Rilis**: Tag `v1.0.64` disiapkan untuk memicu build otomatis TestFlight CI GitHub Actions.
