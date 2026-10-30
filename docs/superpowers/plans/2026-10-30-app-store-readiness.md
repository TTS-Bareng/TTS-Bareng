# TTS Bareng App Store Readiness Plan

**Tujuan:** Menyiapkan satu draft submission yang lengkap dan telah diverifikasi, sehingga pemilik aplikasi dapat menekan Submit for Review sendiri.

**Pendekatan:** Audit build yang akan dirilis dan status App Store Connect terlebih dahulu; selesaikan kekurangan aplikasi dan metadata; buat build baru jika diperlukan; lalu uji build yang sama di perangkat dan siapkan submission. Keputusan teknis moderasi ditentukan setelah penelusuran alur dan kondisi backend, bukan berdasarkan asumsi bahwa penghapusan lokal merupakan laporan.

**Teknologi:** React, TypeScript, Capacitor iOS, Supabase, RevenueCat, App Store Connect, GitHub Actions.

**Rujukan:** `CODEX.md`, `GEMINI.md`, `../WHITEPAPER.md`, dan App Review Guidelines Apple yang berlaku saat eksekusi.

## Catatan pelaksanaan 30 Oktober 2026

- Build #49 berasal dari tag `v1.0.60`, commit `dfcab96`, dengan GitHub Actions berhasil. Build #14 masih terpasang di versi App Store; perubahan lokal setelah #49 belum ada dalam build tersebut.
- Catatan App Review telah dibersihkan dari klaim akses tamu penuh dan moderasi yang tidak terbukti. Filter kata sederhana tersedia saat publikasi, tetapi jalur impor dan pelaporan/pemblokiran belum memenuhi verifikasi.
- Endpoint `delete_user_account` terdaftar dalam API Supabase; implementasi server dan pencabutan token Apple belum terverifikasi. Perubahan lokal menghentikan pembersihan data lokal bila sesi tidak cocok atau panggilan penghapusan gagal; tiga tes unit dan build aplikasi lulus.
- Halaman privasi publik dapat diakses. Perubahan penjelasan Supabase dan RevenueCat disiapkan di TTS-Web dan build web lulus; belum dipublikasikan atau diverifikasi visual pada preview lokal. Detail praktik data dan retensi perlu dikonfirmasi.
- Plugin Supabase tidak memiliki akses ke proyek TTS. Kunci server memungkinkan pembacaan daftar endpoint, tetapi tidak menyediakan inspeksi implementasi SQL melalui konektor yang tersedia.
- ID `custom_ticket_1` dan `custom_ticket_5` ada di kode tetapi tidak ditemukan pemanggilan alur pembelian aktif untuk keduanya; jangan membuat produk baru hanya berdasarkan konstanta tersebut. Empat produk aktif tetap perlu diuji lewat TestFlight.
- GitHub CLI belum terautentikasi untuk push; metadata run dapat dibaca melalui konektor GitHub. Tidak ada build baru, tag, atau submission yang dibuat.
- Pengguna memiliki iPhone dan iPad, tanpa Mac; pengujian TestFlight tetap memerlukan koordinasi dengan pengguna setelah kandidat siap.
- Formulir pre-registrasi TTS-Web saat ini menampilkan pesan berhasil tanpa terlihat mengirim atau menyimpan email; klaim publik perlu dibenahi secara terpisah.

## Batasan

- Jangan menekan Submit for Review atau mempublikasikan aplikasi; pemilik melakukan submit.
- Pertahankan aturan token tema, safe area, dan pemisahan TTS-App/TTS-Web.
- Jangan mengisi deklarasi privasi, hak konten, rating, atau catatan review dengan klaim yang belum terbukti.
- Jangan mengganti build rilis dengan build yang belum diuji; catat nomor build, versi, commit, dan hasil uji.
- Jangan menampilkan atau menyimpan nilai kunci privat dan kredensial dalam laporan.
- Jalankan `npm run build` setelah perubahan; uji iOS dan pembelian pada build yang sama dengan yang disiapkan untuk submission.

## 1. Kunci ruang lingkup rilis dan audit ulang

- [ ] Periksa status Git dan perubahan lokal, commit/tag, riwayat Actions, App Store Connect, status build, ketersediaan platform, dan hubungan build dengan commit. Catat build #14 yang terpasang dan identitas build terbaru, tanpa menganggap yang terbaru otomatis siap.
- [ ] Bandingkan metadata, screenshot, fitur dan catatan review dengan build calon rilis; buat daftar bukti dan masalah yang memerlukan perbaikan.
- [ ] Verifikasi status privacy nutrition label, rating, content rights, harga/availability, kontrak, pajak/perbankan, IAP dan langganan. Tandai keterbatasan peran atau API secara eksplisit.

**Selesai jika:** Ada daftar blocker yang menunjuk ke fitur, build, atau kolom App Store Connect yang tepat; tidak ada asumsi bahwa build `VALID` telah teruji.

## 2. Perbaiki fitur dan integritas konten

- [ ] Telusuri pembuatan, impor dan pembagian TTS kustom, identitas pembuat, penyimpanan, serta tindakan laporan dan pemblokiran. Tentukan solusi yang benar-benar dapat menerima laporan, memoderasi, dan memblokir pengguna sesuai kemampuan layanan dan kebutuhan Apple; jika tidak dapat dipenuhi, evaluasi menonaktifkan fitur berbagi untuk rilis dengan mempertimbangkan dampaknya.
- [ ] Implementasikan solusi terpilih secara menyeluruh, termasuk alur gagal dan batas akses. Hilangkan pesan dan ketentuan yang mengklaim tindakan telah terjadi bila belum terjadi. Uji penyaringan, pelaporan, respons petugas, blokir, dan tautan yang dibuka ulang; jelaskan batasannya kepada reviewer secara akurat.
- [ ] Uji pembuatan dan penghapusan akun end-to-end, termasuk penghapusan data server dan perilaku Sign in with Apple; perbaiki kegagalan yang terbukti.
- [ ] Cocokkan semua alur pembelian aktif dengan produk App Store Connect dan RevenueCat, termasuk tiket kustom; perbaiki mismatch yang benar-benar memengaruhi alur. Uji pembelian, pembatalan, kegagalan, pemulihan dan entitlement.
- [ ] Jalankan pemeriksaan relevan dan `npm run build`; periksa diff dan lakukan review atas perubahan.

**Selesai jika:** Alur yang dipertahankan dapat didemonstrasikan, dan semua klaim dalam aplikasi maupun catatan review sesuai implementasi. Perubahan kode memerlukan build iOS baru.

## 3. Lengkapi App Store Connect

- [ ] Pastikan nama, deskripsi, jumlah level, kategori, bahasa, copyright, harga, wilayah, URL dan hak konten sesuai build dan keputusan pemilik.
- [ ] Buka URL dukungan dan privasi dalam browser bersih; pastikan informasi kontak dan kebijakan tampil tanpa login dan konsisten dengan data yang dikumpulkan aplikasi dan SDK. Audit dan perbarui privacy nutrition label berdasarkan bukti.
- [ ] Jawab ulang kuesioner rating berdasarkan definisi Apple dan perilaku distribusi konten yang aktual; dokumentasikan alasan jawaban yang ambigu.
- [ ] Siapkan dan unggah screenshot iPad 13 inci yang menampilkan aplikasi sebenarnya, serta cocokkan screenshot iPhone dengan build rilis. Uji keterbacaan dan persyaratan ukuran Apple.
- [ ] Lengkapi metadata, harga, wilayah dan informasi review untuk setiap IAP/langganan yang aktif; pastikan produk serta grup yang perlu direview bersama tercakup dalam draft submission.
- [ ] Tulis catatan review yang akurat: akses tamu atau akun demo yang masih berlaku, langkah multiplayer dua perangkat, cara mengakses fitur berbayar, dan penjelasan fitur yang perlu perhatian. Jangan mengirim kredensial dalam chat.

**Selesai jika:** Setiap kolom wajib terisi dan diverifikasi, semua aset cocok dengan build, dan halaman privasi/dukungan benar-benar dapat diakses.

## 4. Bangun dan uji kandidat rilis

- [ ] Jalankan build, buat kandidat iOS melalui CI yang disetujui, dan catat tag, commit, workflow, nomor build, versi, SDK, dan status pemrosesan Apple. Hindari mendorong tag sampai isi kandidat telah ditinjau.
- [ ] Uji build kandidat pada iPhone dan iPad yang didukung: instalasi bersih, orientasi dan safe area, mode terang/gelap, login/tamu, permainan, offline/reconnect, QR/kamera, multiplayer dua perangkat, TTS kustom, dan penghapusan akun.
- [ ] Uji seluruh produk aktif dengan akun sandbox/TestFlight, termasuk restore pada instalasi ulang; pastikan entitlement dan harga tampil benar.
- [ ] Perbaiki kegagalan; jika kandidat berubah, ulangi verifikasi yang terdampak pada build pengganti.

**Selesai jika:** Build kandidat yang teridentifikasi lulus pengujian nyata; catat perangkat, versi OS, hasil, serta keterbatasan yang belum diselesaikan.

## 5. Siapkan untuk tombol Submit

- [ ] Pasang build kandidat yang telah diuji pada versi App Store, periksa ulang metadata, screenshot, rating, privacy label, review notes, IAP dan grup langganan dalam draft.
- [ ] Pastikan mode rilis sesuai keputusan pemilik: otomatis setelah approval atau manual. Opsi saat audit awal adalah otomatis setelah approval.
- [ ] Gunakan validasi App Store Connect / Add for Review bila aman untuk menyiapkan draft, selesaikan pesan kekurangan yang muncul, dan pastikan semua item yang dibutuhkan ada di submission.
- [ ] Berikan pemilik ringkasan build, item dalam submission, cara rilis, hasil uji, dan blocker tersisa. Jangan klik Submit for Review.

**Selesai jika:** App Store Connect menampilkan draft tanpa kekurangan yang diketahui, semua item yang diperlukan tercakup, dan pemilik dapat meninjau lalu menekan Submit for Review.

## Ketergantungan pemilik

- Akses iPhone dan iPad untuk pengujian TestFlight dan screenshot yang sesuai, atau akses ke Mac/simulator dan perangkat yang memadai.
- Akun sandbox atau akses untuk membuatnya, serta keputusan harga, wilayah, dan metode rilis jika belum ditentukan.
- Penyediaan bantuan atau akun demo untuk multiplayer jika akses review membutuhkannya; kredensial dimasukkan langsung ke App Store Connect.
- Penerimaan kontrak atau informasi pajak/perbankan bila Apple mensyaratkan tindakan pemilik akun.
