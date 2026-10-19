import { generateLevelFromWords, validateLevelData } from './crossword-builder.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const phase7Levels = [
  // --- TEMA 49: ANATOMI MANUSIA & RAHASIA TUBUH (Bab 425–431) ---
  {
    id: 'level_425_jantung_detak_aliran_darah',
    title: 'Jantung & Detak Aliran Darah',
    category: 'Anatomi Manusia',
    words: [
      { answer: 'AORTA', clue: 'Pembuluh nadi utama terbesar yang mengalirkan darah bersih dari jantung' },
      { answer: 'JANTUNG', clue: 'Organ pemompa darah berotot yang berdenyut tanpa henti sepanjang hayat' },
      { answer: 'ARTERI', clue: 'Pembuluh darah bertekanan tinggi pengangkut oksigen ke seluruh tubuh' },
      { answer: 'DARAH', clue: 'Cairan merah kehidupan pengangkut nutrisi, oksigen, dan hormon' },
      { answer: 'VENA', clue: 'Pembuluh darah balik yang mengalirkan kembali darah menuju jantung' },
      { answer: 'DENYUT', clue: 'Gerak kembang kempis teratur pembuluh darah seirama detak jantung' },
      { answer: 'KATUP', clue: 'Pintu sekat tipis di bilik jantung pencegah aliran balik darah' },
    ],
  },
  {
    id: 'level_426_paruparu_hembusan_napas',
    title: 'Paru-paru & Hembusan Napas',
    category: 'Anatomi Manusia',
    words: [
      { answer: 'PARU', clue: 'Sepasang organ berongga di rongga dada tempat pertukaran udara bersih' },
      { answer: 'OKSIGEN', clue: 'Gas vital penopang kehidupan yang dihirup masuk ke dalam paru-paru' },
      { answer: 'NAPAS', clue: 'Proses menghirup dan menghembuskan udara penyuplai oksigen sel' },
      { answer: 'BRONKUS', clue: 'Cabang batang tenggorokan penyalur udara menuju kedua belah paru' },
      { answer: 'ALVEOLUS', clue: 'Gelembung udara mikroskopis tempat pertukaran gas oksigen di paru' },
      { answer: 'UDARA', clue: 'Hawa segar beroksigen yang dihirup melalui rongga hidung manusia' },
      { answer: 'DADA', clue: 'Bagian tubuh depan pelindung rongga paru-paru dan detak jantung' },
    ],
  },
  {
    id: 'level_427_pancaindra_melihat_dunia',
    title: 'Panca Indra: Jendela Melihat Dunia',
    category: 'Anatomi Manusia',
    words: [
      { answer: 'RETINA', clue: 'Lapisan peka cahaya di dasar bola mata pembentuk bayangan visual' },
      { answer: 'PUPIL', clue: 'Bintik hitam di tengah bola mata pengatur jumlah cahaya yang masuk' },
      { answer: 'KORNEA', clue: 'Lapisan bening transparan pelindung bagian terluar bola mata' },
      { answer: 'LENSA', clue: 'Bagian mata yang membiaskan fokus berkas cahaya tepat pada retina' },
      { answer: 'SARAF', clue: 'Serabut penghantar sinyal visual dari bola mata menuju pusat otak' },
      { answer: 'CAHAYA', clue: 'Gelombang terang yang memungkinkan mata mengenali bentuk dan warna' },
      { answer: 'MATA', clue: 'Organ panca indra penglihatan pembuka jendela keindahan dunia' },
    ],
  },
  {
    id: 'level_428_pancaindra_pendengaran_rasa_sentuhan',
    title: 'Panca Indra: Pendengaran, Rasa & Sentuhan',
    category: 'Anatomi Manusia',
    words: [
      { answer: 'GENDANG', clue: 'Selaput tipis di dalam liang telinga perespons getaran gelombang suara' },
      { answer: 'TELINGA', clue: 'Organ indra pendengaran sekaligus penjaga keseimbangan tubuh manusia' },
      { answer: 'LIDAH', clue: 'Organ berpapila perasa aneka rasa manis, asin, asam, pahit, dan gurih' },
      { answer: 'KULIT', clue: 'Lapisan pelindung terluar tubuh yang peka terhadap rabaan dan suhu' },
      { answer: 'RABA', clue: 'Kemampuan indra peraba merasakan tekstur halus, kasar, dan tekanan' },
      { answer: 'GETAR', clue: 'Goyangan gelombang udara perambat gelombang bunyi ke telinga' },
      { answer: 'SUARA', clue: 'Gelombang bunyi di udara yang ditangkap oleh daun telinga manusia' },
    ],
  },
  {
    id: 'level_429_otak_jaringan_saraf_pusat',
    title: 'Otak & Jaringan Saraf Pusat',
    category: 'Anatomi Manusia',
    words: [
      { answer: 'OTAK', clue: 'Pusat pengendali pikiran, memori ingatan, emosi, dan gerak tubuh' },
      { answer: 'MEMORI', clue: 'Daya ingat rekaman peristiwa dan ilmu pengetahuan di dalam otak' },
      { answer: 'NEURON', clue: 'Sel saraf penyusun sistem koordinasi penghantar impuls listrik otak' },
      { answer: 'SADAR', clue: 'Kondisi terjaga dan awas terhadap apa yang dirasakan di sekitar' },
      { answer: 'PIKIR', clue: 'Aktivitas akal budi menimbang solusi saat menghadapi teka-teki' },
      { answer: 'REFLEKS', clue: 'Gerak spontan cepat tanpa perintah sadar untuk menghindari bahaya' },
      { answer: 'SINAPS', clue: 'Celah penghubung antarujung sel saraf penyampai pesan kimiawi' },
    ],
  },
  {
    id: 'level_430_rangka_tulang_kelenturan_sendi',
    title: 'Rangka Tulang & Kelenturan Sendi',
    category: 'Anatomi Manusia',
    words: [
      { answer: 'TENGKORAK', clue: 'Rangka tempurung kepala pelindung jaringan lunak organ otak' },
      { answer: 'TULANG', clue: 'Jaringan ikat keras pembentuk struktur kerangka penopang tubuh' },
      { answer: 'RANGKA', clue: 'Susunan tulang-belulang yang memberi bentuk fisik tubuh manusia' },
      { answer: 'SENDI', clue: 'Titik pertemuan antar-dua tulang yang memungkinkan gerakan tubuh' },
      { answer: 'KALSIUM', clue: 'Mineral penting penguat kepadatan tulang dan enamel gigi sehat' },
      { answer: 'ENGSEL', clue: 'Tipe persendian seperti pada siku dan lutut yang bergerak satu arah' },
      { answer: 'GERAK', clue: 'Perpindahan posisi anggota tubuh hasil kontraksi otot dan tulang' },
    ],
  },
  {
    id: 'level_431_benteng_imun_pertahanan_tubuh',
    title: 'Benteng Imun & Pertahanan Tubuh',
    category: 'Anatomi Manusia',
    words: [
      { answer: 'IMUN', clue: 'Sistem kekebalan alami tubuh penangkal serangan bakteri dan virus' },
      { answer: 'ANTIBODI', clue: 'Zat protein pelindung bentukan sel darah putih penetral racun kuman' },
      { answer: 'LEUKOSIT', clue: 'Sel darah putih prajurit pembasmi kuman penyakit di dalam tubuh' },
      { answer: 'VIRUS', clue: 'Mikroorganisme parasit mikroskopis pemicu gejala sakit flu' },
      { answer: 'LAWAN', clue: 'Reaksi aktif pertahanan imun saat mendeteksi masuknya bibit penyakit' },
      { answer: 'SEHAT', clue: 'Kondisi bugar prima bebas dari gangguan penyakit dan rasa sakit' },
      { answer: 'KUMAN', clue: 'Zat patogen mikroba berbahaya yang memicu terjadinya infeksi tubuh' },
    ],
  },

  // --- TEMA 50: KESEHATAN, GIZI & POLA HIDUP SEHAT (Bab 432–437) ---
  {
    id: 'level_432_khazanah_vitamin_khasiat_buah',
    title: 'Khazanah Vitamin & Khasiat Buah',
    category: 'Kesehatan & Gizi',
    words: [
      { answer: 'VITAMIN', clue: 'Zat gizi mikro penting penunjang metabolisme dan daya tahan tubuh' },
      { answer: 'MINERAL', clue: 'Unsur anorganik seperti zat besi dan seng penopang fungsi organ' },
      { answer: 'JERUK', clue: 'Buah sitrun segar berkulit kuning oranye kaya kandungan vitamin C' },
      { answer: 'WORTEL', clue: 'Sayuran jingga kaya beta-karoten yang baik untuk kesehatan mata' },
      { answer: 'SAYUR', clue: 'Bahan pangan nabati segar sumber serat alami dan aneka mikronutrien' },
      { answer: 'SEGAR', clue: 'Kondisi bahan pangan alami yang baru dipetik tanpa bahan pengawet' },
      { answer: 'KHASIAT', clue: 'Manfaat baik kandungan gizi makanan bagi kesehatan metabolisme tubuh' },
    ],
  },
  {
    id: 'level_433_piring_gizi_seimbang_nutrisi_makro',
    title: 'Piring Gizi Seimbang & Nutrisi Makro',
    category: 'Kesehatan & Gizi',
    words: [
      { answer: 'PROTEIN', clue: 'Zat gizi makro pembangun sel otot berbahan dasar asam amino' },
      { answer: 'KARBO', clue: 'Sumber bahan bakar energi utama tubuh seperti nasi, gandum, dan ubi' },
      { answer: 'LEMAK', clue: 'Nutrisi penyimpan cadangan energi dan pelindung organ dalam tubuh' },
      { answer: 'SERAT', clue: 'Komponen tumbuhan yang melancarkan saluran cerna dan sistem buang' },
      { answer: 'GIZI', clue: 'Kandungan nutrisi lengkap yang dibutuhkan tubuh agar tumbuh optimal' },
      { answer: 'PIRING', clue: 'Wadah saji tempat menata pembagian lauk pauk, nasi, sayur, dan buah' },
      { answer: 'SEIMBANG', clue: 'Komposisi asupan yang pas antara karbohidrat, protein, dan vitamin' },
    ],
  },
  {
    id: 'level_434_manfaat_hidrasi_air_bersih',
    title: 'Manfaat Hidrasi & Air Bersih',
    category: 'Kesehatan & Gizi',
    words: [
      { answer: 'MINERAL', clue: 'Air minum murni berstandar bersih penyuplai cairan hidrasi harian' },
      { answer: 'GINJAL', clue: 'Organ penyaring darah pembuang sisa metabolisme yang butuh air cukup' },
      { answer: 'CAIRAN', clue: 'Komponen fluida pengisi lebih dari separuh massa tubuh manusia' },
      { answer: 'HAUS', clue: 'Sinyal alami tubuh tanda tenggorokan kekurangan asupan cairan air' },
      { answer: 'MINUM', clue: 'Tindakan meneguk air putih secara teratur sepanjang hari' },
      { answer: 'BUGAR', clue: 'Kondisi badan yang segar berenergi berkat hidrasi tubuh yang cukup' },
      { answer: 'MURNI', clue: 'Air bening alami yang bebas dari kontaminasi kotoran berbahaya' },
    ],
  },
  {
    id: 'level_435_kebugaran_senam_olahraga_kardio',
    title: 'Kebugaran Senam & Olahraga Kardio',
    category: 'Kesehatan & Gizi',
    words: [
      { answer: 'SENAM', clue: 'Latihan gerak tubuh berirama musik pelentur otot dan pembakar lemak' },
      { answer: 'KERINGAT', clue: 'Cairan yang keluar lewat pori-pori kulit saat berolahraga memacu nafas' },
      { answer: 'LARI', clue: 'Olahraga kardio sederhana mengelilingi lapangan pembakar kalori' },
      { answer: 'BUGAR', clue: 'Kebugaran fisik yang terjaga prima berkat konsisten berolahraga' },
      { answer: 'GERAK', clue: 'Aktivitas fisik aktif menghindari gaya hidup malas rebahan' },
      { answer: 'REGANG', clue: 'Peregangan otot sebelum dan sesudah latihan untuk mencegah kram' },
      { answer: 'NAFAS', clue: 'Tarikan udara dalam-dalam penyuplai oksigen saat denyut jantung naik' },
    ],
  },
  {
    id: 'level_436_tidur_berkualitas_regenerasi_tubuh',
    title: 'Tidur Berkualitas & Regenerasi Tubuh',
    category: 'Kesehatan & Gizi',
    words: [
      { answer: 'TIDUR', clue: 'Kondisi istirahat alami pemulih stamina otak dan regenerasi sel fisik' },
      { answer: 'LELAP', clue: 'Kualitas tidur yang nyenyak tanpa terbangun di tengah malam gelap' },
      { answer: 'ENERGI', clue: 'Daya tenaga yang terisi kembali setelah bangun pagi dengan segar' },
      { answer: 'MALAM', clue: 'Waktu terbaik mengistirahatkan raga setelah seharian beraktivitas' },
      { answer: 'KAMAR', clue: 'Ruangan tenang bersuhu sejuk tempat tidur beristirahat dengan damai' },
      { answer: 'PULAS', clue: 'Kondisi tidur sangat tenang lelap tanpa terganggu suara bising' },
      { answer: 'MIMPI', clue: 'Bunga tidur dalam fase lelap yang menghiasi istirahat malam hari' },
    ],
  },
  {
    id: 'level_437_kebiasaan_bersih_pencegahan_sakit',
    title: 'Kebiasaan Bersih & Pencegahan Sakit',
    category: 'Kesehatan & Gizi',
    words: [
      { answer: 'SABUN', clue: 'Bahan pembersih berbusa penghalau kuman saat mencuci tangan bersih' },
      { answer: 'CUCI', clue: 'Tindakan membasuh tangan dengan air mengalir sebelum dan usai makan' },
      { answer: 'BERSIH', clue: 'Keadaan bebas dari kotoran, debu, dan sarang kuman penyakit' },
      { answer: 'HIGIENIS', clue: 'Kondisi lingkungan dan makanan yang terjaga steril dari kotoran' },
      { answer: 'MASKER', clue: 'Kain penutup hidung dan mulut pencegah penularan partikel batuk' },
      { answer: 'RAWAT', clue: 'Menjaga kesehatan diri dan kebersihan anggota tubuh secara teratur' },
      { answer: 'AMAN', clue: 'Kondisi lingkungan terlindung bebas dari ancaman wabah penyakit' },
    ],
  },

  // --- TEMA 51: DUNIA DIGITAL, INTERNET & MEDIA SOSIAL (Bab 438–444) ---
  {
    id: 'level_438_jejak_kelahiran_web_mesin_pencari',
    title: 'Jejak Kelahiran Web & Mesin Pencari',
    category: 'Dunia Digital',
    words: [
      { answer: 'WEBSITE', clue: 'Kumpulan halaman informasi digital di internet yang dapat diakses' },
      { answer: 'SEARCH', clue: 'Fitur mesin pencari tempat mengetik kata kunci informasi yang dicari' },
      { answer: 'DOMAIN', clue: 'Nama alamat unik penanda situs web seperti dot com atau dot id' },
      { answer: 'BROWSER', clue: 'Perangkat lunak penjelajah laman web di ponsel atau komputer' },
      { answer: 'TAUTAN', clue: 'Teks tautan klik biru pengarah peselancar ke laman web lain' },
      { answer: 'SERVER', clue: 'Komputer pusat penyedia data dan layanan hosting web sepanjang waktu' },
      { answer: 'KETIK', clue: 'Menekan tombol papan ketik untuk memasukkan alamat situs internet' },
    ],
  },
  {
    id: 'level_439_jagat_media_sosial_tren_viral',
    title: 'Jagat Media Sosial & Tren Viral',
    category: 'Dunia Digital',
    words: [
      { answer: 'TIKTOK', clue: 'Aplikasi video pendek populer wadah kreasi konten hiburan musik' },
      { answer: 'VIDEO', clue: 'Format rekaman gambar bergerak dengan audio yang ditonton jutaan orang' },
      { answer: 'VIRAL', clue: 'Fenomena konten yang tersebar kilat luas dibicarakan khalayak maya' },
      { answer: 'POST', clue: 'Mengunggah pesan tulisan, foto, atau video ke linimasa media sosial' },
      { answer: 'KOMENTAR', clue: 'Tanggapan teks apresiasi warganet di bawah postingan konten viral' },
      { answer: 'BAGIKAN', clue: 'Meneruskan tautan konten menarik kepada kawan melalui jejaring chat' },
      { answer: 'SUKA', clue: 'Tanda jempol atau hati apresiasi positif penonton pada karya postingan' },
    ],
  },
  {
    id: 'level_440_belanja_online_dompet_digital',
    title: 'Belanja Online & Dompet Digital',
    category: 'Dunia Digital',
    words: [
      { answer: 'OLSHOP', clue: 'Toko daring tempat membeli aneka barang dagangan tanpa tatap muka' },
      { answer: 'SALDO', clue: 'Jumlah uang digital yang tersimpan di dalam aplikasi dompet digital' },
      { answer: 'DISKON', clue: 'Potongan harga menggiurkan saat pesta belanja kilat tanggal kembar' },
      { answer: 'KURIR', clue: 'Petugas pengantar paket barang belanjaan langsung ke depan rumah' },
      { answer: 'QRIS', clue: 'Kode respon cepat standar nasional pembayaran nirsentuh ponsel pintar' },
      { answer: 'DOMPET', clue: 'Aplikasi pembayaran elektronik pengganti uang tunai di saku celana' },
      { answer: 'PAKET', clue: 'Bungkusan kardus berisi pesanan belanjaan yang dinanti pembeli' },
    ],
  },
  {
    id: 'level_441_keamanan_siber_perlindungan_sandi',
    title: 'Keamanan Siber & Perlindungan Sandi',
    category: 'Dunia Digital',
    words: [
      { answer: 'SANDI', clue: 'Kombinasi huruf, angka, dan simbol rahasia pengunci akses akun' },
      { answer: 'ENKRIPSI', clue: 'Pengacakan kode data rahasia agar aman dari intipan peretas jahat' },
      { answer: 'PRIVASI', clue: 'Hak menjaga data pribadi agar tidak bocor dan disalahgunakan orang' },
      { answer: 'AKUN', clue: 'Profil digital pengguna beridentitas nama dan foto di layanan daring' },
      { answer: 'AMANKAN', clue: 'Tindakan memperbarui sandi berkala demi perlindungan data akun' },
      { answer: 'DATA', clue: 'Informasi digital pribadi seperti nomor telepon dan riwayat transaksi' },
      { answer: 'LOGIN', clue: 'Masuk ke dalam aplikasi dengan mengetikkan nama pengguna dan sandi' },
    ],
  },
  {
    id: 'level_442_kreator_konten_dunia_streaming',
    title: 'Kreator Konten & Dunia Streaming',
    category: 'Dunia Digital',
    words: [
      { answer: 'KREATOR', clue: 'Individu kreatif pembuat video edukasi dan hiburan di ranah digital' },
      { answer: 'STUDIO', clue: 'Ruang kerja berpencahayaan rapi tempat syuting dan memproduksi karya' },
      { answer: 'KAMERA', clue: 'Perangkat penangkap gambar tajam beresolusi tinggi perekam konten' },
      { answer: 'MIKROFON', clue: 'Alat penangkap suara jernih penyiar saat merekam konten siniar' },
      { answer: 'EDIT', clue: 'Proses memotong dan merangkai klip rekaman menjadi tontonan menarik' },
      { answer: 'SIARAN', clue: 'Tayangan langsung interaktif yang menyapa penonton secara real time' },
      { answer: 'KONTEN', clue: 'Materi karya digital bernilai informasi yang disajikan ke publik' },
    ],
  },
  {
    id: 'level_443_kecerdasan_buatan_otomasi_cerdas',
    title: 'Kecerdasan Buatan & Otomasi Cerdas',
    category: 'Dunia Digital',
    words: [
      { answer: 'ROBOT', clue: 'Mesin pintar yang dirancang mampu menjalankan instruksi terprogram' },
      { answer: 'ASISTEN', clue: 'Program pembantu digital penjawab pertanyaan dan pengatur jadwal' },
      { answer: 'OTOMATIS', clue: 'Bekerja sendiri secara cerdas tanpa perlu instruksi berulang kali' },
      { answer: 'CERDAS', clue: 'Kemampuan sistem komputasi meniru cara berpikir logika analitis' },
      { answer: 'PROMPT', clue: 'Teks instruksi perintah yang dimasukkan pengguna ke program AI' },
      { answer: 'DATA', clue: 'Kumpulan jutaan informasi referensi bahan pembelajaran mesin AI' },
      { answer: 'ALGORITMA', clue: 'Rangkaian kaidah logika sistematis pemecah masalah komputasi' },
    ],
  },
  {
    id: 'level_444_komputasi_awan_penyimpanan_berkas',
    title: 'Komputasi Awan & Penyimpanan Berkas',
    category: 'Dunia Digital',
    words: [
      { answer: 'CLOUD', clue: 'Pusat penyimpanan berkas maya yang bisa dibuka dari mana saja' },
      { answer: 'SIMPAN', clue: 'Menaruh dokumen penting ke ruang penyimpanan digital dengan aman' },
      { answer: 'UNDUH', clue: 'Menyimpan berkas dari internet ke ruang memori gawai lokal' },
      { answer: 'UNGGAH', clue: 'Mengirimkan foto atau berkas dari gawai menuju server internet' },
      { answer: 'BERKAS', clue: 'Dokumen file digital berupa teks, lembar kerja, atau presentasi' },
      { answer: 'SINKRON', clue: 'Penyelarasan data berkas otomatis antar ponsel dan laptop kerja' },
      { answer: 'SERVER', clue: 'Komputer pusat berkapasitas besar penampung data awan dunia' },
    ],
  },
];

console.log('Compiling Fase 2 of 500-level expansion: 20 Bab (Bab 425 to 444)...');

const levelsFilePath = path.join(__dirname, '../src/data/levels.json');
const existingLevels = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));

console.log(`Loaded ${existingLevels.length} existing levels.`);

const compiledPhase7 = [];

for (let i = 0; i < phase7Levels.length; i++) {
  const def = phase7Levels[i];
  const globalLevelIndex = 424 + i + 1; // Bab 425 to 444
  def.level = globalLevelIndex;
  try {
    const level = generateLevelFromWords(def);
    validateLevelData(level);
    const wordCount = level.clues.across.length + level.clues.down.length;
    console.log(
      `✓ [${globalLevelIndex}/444] ${level.id} (${level.title}) - ${wordCount} kata, grid: ${level.size.rows}x${level.size.cols}`
    );
    compiledPhase7.push(level);
  } catch (err) {
    console.error(`✗ Error on level ${def.id}:`, err.message);
    process.exit(1);
  }
}

const all444Levels = [...existingLevels.slice(0, 424), ...compiledPhase7];

fs.writeFileSync(levelsFilePath, JSON.stringify(all444Levels, null, 2), 'utf8');

console.log(`\n✓ Successfully compiled 444 levels into ${levelsFilePath}!`);
