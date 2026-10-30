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
- Halaman privasi web disiapkan secara lokal, belum terverifikasi terpublikasi pada domain Cloudflare.

## Gerbang yang masih terbuka

- Kandidat iOS baru harus selesai di CI dan diproses Apple, lalu dipasang pada versi App Store yang kini masih memakai build #14.
- Uji TestFlight pada iPhone/iPad: login/tamu, hapus akun (termasuk Apple), moderated UGC melalui tautan/QR/impor, blokir lintas logout, mabar dua perangkat, pembelian setiap produk aktif dan restore.
- Screenshot iPad 13 inci dari aplikasi kandidat perlu disiapkan dan diunggah. Verifikasi screenshot iPhone sesuai perilaku kandidat.
- Browser App Store Connect memerlukan login pemilik untuk meninjau Privacy Nutrition Label, hak konten, ketersediaan wilayah, agreement/tax/banking, dan validasi draft. Jangan mengisi pernyataan hak konten atau data yang belum terbukti.
- Tinjau kuesioner usia untuk distribusi UGC yang sekarang didukung server. Catatan review final baru dipasang setelah nomor build kandidat diketahui dan akses reviewer diuji.
- Tentukan dan uji operasi harian moderator. Konten pending tidak terbuka bagi reviewer lain sampai disetujui.
- Periksa sesi Sign in with Apple dan mekanisme pencabutan akses; instruksi pencabutan manual disediakan ketika token revokasi tidak disimpan, tanpa menghalangi penghapusan akun.
- Tidak ada Submit for Review yang dilakukan.
