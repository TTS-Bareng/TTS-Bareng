# Operasi moderasi TTS Bareng

Pemilik akun adalah moderator. Sebelum rilis, pastikan seseorang memeriksa antrean setiap hari dan menanggapi laporan segera. Konten baru berstatus `pending` dan hanya dapat dipratinjau pembuatnya. Pemain lain hanya dapat membaca konten `approved`. Persetujuan dan penanganan laporan dilakukan melalui Dashboard Supabase proyek `qrkfjacugcalegzhcatp`, bukan dari aplikasi pemain.

1. Buka Table Editor → `published_crosswords`, filter `status = pending`. Periksa judul, kategori, semua kata dan petunjuk. Tolak konten seksual, ancaman, pelecehan, ujaran kebencian, data pribadi, pelanggaran hak cipta, dan konten yang tidak sesuai rating aplikasi. Ubah status menjadi `approved` atau `rejected` setelah pemeriksaan.
2. Buka `crossword_reports`, filter `status = open`. Gunakan `crossword_id` untuk memeriksa konten terkait. Jika melanggar, set status kreasi ke `rejected`. Setelah tindakan selesai, set laporan menjadi `resolved`.
3. Untuk pelanggaran berulang, tambahkan `author_id` ke `crossword_author_bans`. Ini menghentikan publikasi baru dan pembacaan seluruh konten pembuat tersebut. Jangan mengubah tabel blokir pemain untuk membuka blokir tanpa permintaan pemain.
4. Uji tautan yang ditolak memakai perangkat/akun lain. Konten harus tidak tersedia. Uji pula bahwa akun terblokir tidak dapat menerbitkan kreasi baru.

Antrean laporan menyimpan pengenal kreasi dan pelapor bila masuk. Laporan tamu tidak memiliki pengenal akun. Laporan tidak otomatis menghapus konten secara global agar pelaporan palsu tidak langsung menonaktifkan karya orang lain. Tombol Lapor memblokir pembuat untuk pelapor: secara lokal untuk tamu dan di server untuk akun yang masuk. Penghapusan akun juga menghapus konten yang diterbitkan dan laporan milik akun tersebut.

Tautan payload lama tidak memiliki identitas pembuat terverifikasi dan tidak diterima pada build baru. Kreasi lama dapat dibuka sebagai koleksi lokal, lalu diterbitkan ulang melalui Studio untuk mendapat ID server dan pemeriksaan moderator. Mengedit kreasi yang sudah dibagikan menghasilkan kiriman baru yang kembali menunggu moderasi.

Data inbox sosial lama yang dahulu bisa ditulis publik diarsipkan di `tts_private.legacy_social_inbox_archive`. Data ini tidak digunakan sebagai bukti pertemanan. Jangan mengembalikannya langsung ke inbox aktif tanpa pemeriksaan. Penghapusan akun juga membersihkan referensi akun dari arsip tersebut. Tetapkan masa simpan arsip dan hapus setelah kebutuhan investigasi selesai.

## Uji sebelum rilis

- Akun A menerbitkan kreasi; akun B/tamu belum dapat membuka tautannya.
- Moderator menyetujui; B dapat membuka lewat tautan, QR, dan impor.
- B melapor; laporan tersimpan, permainan aktif ditutup, dan semua kreasi A tidak dapat dibuka B lewat tautan maupun koleksi profil.
- Tamu melapor, kemudian masuk/keluar akun; blokir perangkat tetap berlaku.
- Moderator menolak konten atau memblokir pembuat; pemain lain tidak dapat membuka salinan cache melalui Profil.
- Putuskan jaringan saat publikasi/laporan/hapus akun: jangan tampilkan keberhasilan yang belum dikonfirmasi server.
- Hapus akun A: profil, inbox, data leaderboard dan kreasi hilang; data turnamen peserta lain tetap tersedia.

Keberhasilan kompilasi dan uji SQL tidak menggantikan pengujian alur ini pada build TestFlight.
