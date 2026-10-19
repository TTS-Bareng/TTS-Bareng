import { generateLevelFromWords, validateLevelData } from './crossword-builder.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const phase10Levels = [
  // --- TEMA 58: TRANSPORTASI KERETA & JALUR REL RELASI (Bab 483–488) ---
  {
    id: 'level_483_kereta_cepat_whoosh_shinkansen',
    title: 'Kereta Cepat Whoosh & Shinkansen',
    category: 'Transportasi Kereta',
    words: [
      { answer: 'CEPAT', clue: 'Laju kecepatan kilat menembus lebih dari tiga ratus kilometer per jam' },
      { answer: 'LISTRIK', clue: 'Daya penggerak ramah lingkungan pemasok energi motor traksi kereta' },
      { answer: 'KILAT', clue: 'Kecepatan tempuh Jakarta Bandung yang kini terpangkas sangat singkat' },
      { answer: 'WHOOSH', clue: 'Nama kereta cepat pertama di Indonesia dan Asia Tenggara' },
      { answer: 'GERBONG', clue: 'Rangkaian ruang kabin berpendingin tempat duduk nyaman penumpang' },
      { answer: 'MASINIS', clue: 'Pengemudi berlisensi pengendali laju lokomotif kereta api di rel' },
      { answer: 'STASIUN', clue: 'Gedung megah titik keberangkatan dan kedatangan penumpang kereta' },
    ],
  },
  {
    id: 'level_484_urat_nadi_mrt_lrt_perkotaan',
    title: 'Urat Nadi MRT & LRT Perkotaan',
    category: 'Transportasi Kereta',
    words: [
      { answer: 'METRO', clue: 'Sistem angkutan cepat perkotaan pengurai kemacetan ibu kota' },
      { answer: 'STASIUN', clue: 'Pemberhentian transit bertingkat yang terintegrasi antarmoda' },
      { answer: 'JALUR', clue: 'Lintasan rel layang dan bawah tanah penembus pusat metropolitan' },
      { answer: 'KARTU', clue: 'Uang elektronik kartu pintar tiket tap masuk dan keluar peron' },
      { answer: 'OTOMATIS', clue: 'Sistem persinyalan kendali pintu peron kaca yang membuka sendiri' },
      { answer: 'NYAMAN', clue: 'Fasilitas kabin sejuk ber-AC tempat warga komuter beristirahat' },
      { answer: 'KOMUTER', clue: 'Para pekerja harian pelaju yang mengandalkan kereta rel listrik' },
    ],
  },
  {
    id: 'level_485_pesona_lokomotif_uap_antik',
    title: 'Pesona Lokomotif Uap Antik',
    category: 'Transportasi Kereta',
    words: [
      { answer: 'UAP', clue: 'Tekanan gas panas penggerak piston roda raksasa lokomotif tua' },
      { answer: 'KETEL', clue: 'Bejana baja pembakar air mendidih penghasil tenaga uap bertekanan' },
      { answer: 'BATUBARA', clue: 'Bahan bakar padat hitam pemasok panas api pembakaran ketel uap' },
      { answer: 'CEROBONG', clue: 'Pipa tegak pembuang kepulan asap putih di atas moncong lokomotif' },
      { answer: 'BUNYI', clue: 'Suara lengkingan klakson uap nyaring khas penembus kesunyian desa' },
      { answer: 'ANTIK', clue: 'Koleksi mesin lokomotif kuno peninggalan sejarah perkeretaapian' },
      { answer: 'SEJARAH', clue: 'Rekaman jejak peran kereta api dalam perjuangan logistik bangsa' },
    ],
  },
  {
    id: 'level_486_menembus_jalur_terowongan_rel',
    title: 'Menembus Jalur Terowongan Rel',
    category: 'Transportasi Kereta',
    words: [
      { answer: 'TEROWONGAN', clue: 'Lorong tembusan bawah tanah atau bukit penembus jalur rel' },
      { answer: 'REL', clue: 'Sepasang batang baja sejajar tempat roda besi kereta bergulir' },
      { answer: 'GUNUNG', clue: 'Bukit dataran tinggi cadas yang ditembus oleh jalur rel kereta' },
      { answer: 'GELAP', clue: 'Suasana di dalam terowongan panjang sebelum menembus fajar terang' },
      { answer: 'LENGKUNG', clue: 'Kontur rel membelok anggun menyusuri lereng ngarai perbukitan' },
      { answer: 'JEMBATAN', clue: 'Struktur rangka baja penyeberang jurang lembah sungai yang dalam' },
      { answer: 'LEMBAH', clue: 'Bentang alam hijau permai yang membentang di bawah jembatan rel' },
    ],
  },
  {
    id: 'level_487_stasiun_ikonik_penjuru_kota',
    title: 'Stasiun Ikonik Penjuru Kota',
    category: 'Transportasi Kereta',
    words: [
      { answer: 'PERON', clue: 'Pelataran panggung tempat penumpang menanti kedatangan kereta' },
      { answer: 'JADWAL', clue: 'Daftar penunjuk waktu menit keberangkatan dan kedatangan kereta' },
      { answer: 'TIKET', clue: 'Bukti resmi pemesanan kursi kereta yang tertera kode batang QR' },
      { answer: 'PELUIT', clue: 'Tiupan peluit kondektur pertanda pintu ditutup dan siap berangkat' },
      { answer: 'KOPER', clue: 'Tas bagasi barang bawaan penumpang pengelana lintas relasi kota' },
      { answer: 'TUNGGU', clue: 'Ruang tunggu nyaman bagi calon penumpang sebelum dipanggil masuk' },
      { answer: 'PAPAN', clue: 'Layar digital penunjuk status nomor jalur rel posisi kereta api' },
    ],
  },
  {
    id: 'level_488_keselamatan_perlintasan_palang_pintu',
    title: 'Keselamatan Perlintasan Palang Pintu',
    category: 'Transportasi Kereta',
    words: [
      { answer: 'PALANG', clue: 'Pintu gerbang penghalang jalan saat armada kereta api melintas' },
      { answer: 'SINYAL', clue: 'Lampu rambu merah menyala peringatan bagi pengendara di jalan' },
      { answer: 'SIRINE', clue: 'Suara bunyi peringatan melengking saat palang pintu mulai menutup' },
      { answer: 'WASPADA', clue: 'Sikap hati-hati berhenti tengok kanan kiri sebelum melintasi rel' },
      { answer: 'BERHENTI', clue: 'Kewajiban pengendara saat mendengar sirine perlintasan berbunyi' },
      { answer: 'AMAN', clue: 'Kondisi perjalanan tertib selamat tanpa ada insiden di perlintasan' },
      { answer: 'PETUGAS', clue: 'Aparatur penjaga pos perlintasan rel yang sigap menjaga ketertiban' },
    ],
  },

  // --- TEMA 59: MISTERI POPULER & ENIGMA LEGENDA DUNIA (Bab 489–493) ---
  {
    id: 'level_489_misteri_segitiga_bermuda',
    title: 'Misteri Segitiga Bermuda',
    category: 'Misteri Populer',
    words: [
      { answer: 'BERMUDA', clue: 'Kawasan perairan samudra Atlantik yang tersohor dengan legenda hilangnya kapal' },
      { answer: 'KOMPAS', clue: 'Alat penunjuk arah mata angin yang dikabarkan berputar ganjil di sana' },
      { answer: 'KAPAL', clue: 'Bahtera pelayaran laut yang dikisahkan lenyap tanpa jejak radio' },
      { answer: 'PESAWAT', clue: 'Armada penerbangan navigasi yang melintasi zona segitiga samudra' },
      { answer: 'LAUT', clue: 'Kedalaman perairan samudra biru penyimpan misteri arus bawah air' },
      { answer: 'MISTERI', clue: 'Teka-teki fenomena aneh yang mengundang rasa ingin tahu dunia' },
      { answer: 'HILANG', clue: 'Lenyapnya jejak benda di samudra luas yang memicu lahirnya legenda' },
    ],
  },
  {
    id: 'level_490_rahasia_gurun_area_51_ufo',
    title: 'Rahasia Gurun Area 51 & Piring Terbang',
    category: 'Misteri Populer',
    words: [
      { answer: 'AREA', clue: 'Pangkalan fasilitas uji coba militer rahasia di gurun pasir Nevada' },
      { answer: 'ROSWELL', clue: 'Kota di New Mexico yang terkenal dengan rumor jatuhnya benda asing 1947' },
      { answer: 'PIRING', clue: 'Bentuk piring terbang dalam kisah fiksi ilmiah benda terbang aneh' },
      { answer: 'GURUN', clue: 'Bentang alam pasir tandus terpencil lokasi fasilitas pangkalan uji' },
      { answer: 'RADAR', clue: 'Perangkat penangkap pantulan gelombang pelacak benda di langit malam' },
      { answer: 'RAHASIA', clue: 'Status keamanan tingkat tinggi dokumen yang tidak dibuka ke publik' },
      { answer: 'MILITER', clue: 'Angkatan bersenjata pengawal keamanan zona pangkalan uji pesawat' },
    ],
  },
  {
    id: 'level_491_mitos_benua_atlantis_tenggelam',
    title: 'Mitos Benua Atlantis yang Hilang',
    category: 'Misteri Populer',
    words: [
      { answer: 'ATLANTIS', clue: 'Pulau peradaban maju legendaris yang dikisahkan tenggelam ke laut' },
      { answer: 'SAMUDRA', clue: 'Lautan luas tempat bersemayamnya reruntuhan benua dalam kisah' },
      { answer: 'TENGGELAM', clue: 'Peristiwa amblasnya daratan ke dasar laut akibat bencana dahsyat' },
      { answer: 'KOTA', clue: 'Tata ruang megah peradaban kuno yang dikelilingi kanal air melingkar' },
      { answer: 'FILSUF', clue: 'Pemikir Yunani kuno Plato yang pertama kali menuliskan kisah Atlantis' },
      { answer: 'LEGENDA', clue: 'Cerita tutur masa lalu sarat pesan moral yang diwariskan turun-temurun' },
      { answer: 'EMAS', clue: 'Logam mulia orichalcum penghias dinding kuil dalam legenda Atlantis' },
    ],
  },
  {
    id: 'level_492_monster_danau_nessie_kriptid',
    title: 'Monster Danau Nessie & Jejak Kriptid',
    category: 'Misteri Populer',
    words: [
      { answer: 'NESSIE', clue: 'Julukan monster air berleher panjang penghuni danau air tawar Skotlandia' },
      { answer: 'DANAU', clue: 'Perairan danau Loch Ness yang dalam, gelap, dan berlumut gambut' },
      { answer: 'SKOTLANDIA', clue: 'Negeri perbukitan danau elok tempat bersemayamnya legenda Nessie' },
      { answer: 'JEJAK', clue: 'Tanda bukti tapak misterius hewan kriptid seperti Bigfoot di salju' },
      { answer: 'FOTO', clue: 'Potret hitam putih tahun 1934 yang menghebohkan koran seluruh dunia' },
      { answer: 'MITOS', clue: 'Kisah rakyat tentang makhluk gaib penghuni rimba dan perairan dalam' },
      { answer: 'LIAR', clue: 'Kawasan alam rimba belantara tempat satwa misteri dikabarkan hidup' },
    ],
  },
  {
    id: 'level_493_garis_gurun_nazca_stonehenge',
    title: 'Garis Gurun Nazca & Stonehenge Kuno',
    category: 'Misteri Populer',
    words: [
      { answer: 'NAZCA', clue: 'Dataran tinggi gurun Peru yang dihiasi lukisan raksasa dari atas langit' },
      { answer: 'STONEHENGE', clue: 'Monumen susunan batu megalitikum raksasa berdiri di Salisbury Inggris' },
      { answer: 'GARIS', clue: 'Goresan parit tanah purba pembentuk figur burung kolibri dan laba-laba' },
      { answer: 'BATU', clue: 'Bongkahan pualam megalit berbobot puluhan ton susunan astronomi purba' },
      { answer: 'KUNO', clue: 'Mahakarya peninggalan bangsa manusia ribuan tahun sebelum masehi' },
      { answer: 'LANGIT', clue: 'Kubah angkasa tempat pengamatan peredaran matahari titik balik musim' },
      { answer: 'SUSUNAN', clue: 'Tata letak presisi susunan batu megalit pembentuk kalender semesta' },
    ],
  },

  // --- TEMA 60: TEKA-TEKI LOGIKA, SANDI & ASAH OTAK (Bab 494–500) ---
  {
    id: 'level_494_ketukan_rahasia_sandi_morse',
    title: 'Ketukan Rahasia Sandi Morse',
    category: 'Logika & Asah Otak',
    words: [
      { answer: 'MORSE', clue: 'Sistem representasi huruf menggunakan ketukan titik dan garis' },
      { answer: 'TITIK', clue: 'Sinyal ketukan pendek dit dalam transmisi kode sandi morse' },
      { answer: 'GARIS', clue: 'Sinyal ketukan panjang dah dalam pengiriman sandi telegram' },
      { answer: 'KETUK', clue: 'Menekan tuas tombol telegraf untuk memancarkan denyut sinyal' },
      { answer: 'KODE', clue: 'Rangkaian sandi rahasia penyampai pesan penting tanpa suara kata' },
      { answer: 'SINYAL', clue: 'Gelombang impuls listrik atau cahaya senter pengirim pesan malam' },
      { answer: 'TELEGRAF', clue: 'Alat komunikasi jarak jauh bersejarah pengirim rangkaian sandi morse' },
    ],
  },
  {
    id: 'level_495_kibaran_bendera_semaphore_pramuka',
    title: 'Kibaran Bendera Semaphore Pramuka',
    category: 'Logika & Asah Otak',
    words: [
      { answer: 'BENDERA', clue: 'Sepasang kain merah kuning pemancar isyarat visual huruf semaphore' },
      { answer: 'SUDUT', clue: 'Posisi rentangan tangan membentuk sudut jam penentu pembacaan huruf' },
      { answer: 'ISYARAT', clue: 'Tanda gerak tangan tanpa kata penyampai pesan rahasia kepanduan' },
      { answer: 'GERAK', clue: 'Kecepatan dan ketepatan ayunan tangan peraga sandi bendera pramuka' },
      { answer: 'PRAMUKA', clue: 'Gerakan kepanduan praja muda karana pengasah ketangkasan sandi' },
      { answer: 'HURUF', clue: 'Aksara abjad dari A sampai Z yang diterjemahkan lewat kibaran bendera' },
      { answer: 'PESAN', clue: 'Informasi sandi yang berhasil dibaca dan dirangkai oleh tim regu' },
    ],
  },
  {
    id: 'level_496_seni_taktik_catur_skakmat_raja',
    title: 'Seni Taktik Catur & Skakmat Raja',
    category: 'Logika & Asah Otak',
    words: [
      { answer: 'PION', clue: 'Bidak prajurit baris depan yang melangkah maju satu demi satu petak' },
      { answer: 'KUDA', clue: 'Bidak kavaleri catur berkarakter melompat unik membentuk pola huruf L' },
      { answer: 'BENTENG', clue: 'Bidak menara kokoh pengawal lajur lurus vertikal dan horizontal' },
      { answer: 'MENTERI', clue: 'Bidak ratu paling berdaya jelajah bebas dan mematikan di atas papan' },
      { answer: 'RAJA', clue: 'Pemimpin tertinggi bidak catur yang wajib dilindungi dari kepungan' },
      { answer: 'SKAKMAT', clue: 'Posisi akhir ketika raja terkepung tanpa langkah lolos dari ancaman' },
      { answer: 'TAKTIK', clue: 'Siasat perangkap langkah jitu untuk membalikkan posisi tanding catur' },
    ],
  },
  {
    id: 'level_497_menembus_labirin_pola_berliku',
    title: 'Menembus Labirin Pola Berliku',
    category: 'Logika & Asah Otak',
    words: [
      { answer: 'LABIRIN', clue: 'Jejaring lorong berliku bercabang rumit pencari jalan pintu keluar' },
      { answer: 'DINDING', clue: 'Sekat pembatas lorong labirin yang menjebak pengelana jika buntu' },
      { answer: 'BELOK', clue: 'Menentukan arah belokan kiri atau kanan di setiap persimpangan jalan' },
      { answer: 'JEJAK', clue: 'Tanda pengingat jalur jalan yang sudah dilewati agar tidak tersesat' },
      { answer: 'JALAN', clue: 'Lintasan lorong panjang penuntun langkah menuju ruang terbuka' },
      { answer: 'KELUAR', clue: 'Pintu gerbang akhir kemenangan usai menaklukkan lika-liku labirin' },
      { answer: 'LORONG', clue: 'Ruang sempit di antara dinding pembatas tempat menyusuri rute' },
    ],
  },
  {
    id: 'level_498_kotak_angka_sudoku_pola_logika',
    title: 'Kotak Angka Sudoku & Pola Logika',
    category: 'Logika & Asah Otak',
    words: [
      { answer: 'SUDOKU', clue: 'Permainan teka-teki penempatan angka sembilan kali sembilan asal Jepang' },
      { answer: 'ANGKA', clue: 'Simbol bilangan satu sampai sembilan pengisi kotak petak sudoku' },
      { answer: 'KOTAK', clue: 'Blok petak sembilan sel yang wajib memuat angka unik tanpa kembar' },
      { answer: 'BARIS', clue: 'Larik mendatar sembilan angka berurutan yang saling mengunci logika' },
      { answer: 'KOLOM', clue: 'Larik tegak vertikal tempat menganalisis penempatan angka yang tepat' },
      { answer: 'TELITI', clue: 'Sikap cermat membaca pola eliminasi kemungkinan angka di tiap sel' },
      { answer: 'LOGIKA', clue: 'Penalaran rasional tanpa tebak-tebakan saat mengisi teka-teki angka' },
    ],
  },
  {
    id: 'level_499_tekateki_batang_korek_api',
    title: 'Teka-Teki Batang Korek Api',
    category: 'Logika & Asah Otak',
    words: [
      { answer: 'KOREK', clue: 'Batang kayu kecil berujung belerang media asah otak bangun ruang' },
      { answer: 'BENTUK', clue: 'Formasi geometri persegi atau segitiga yang dibentuk susunan batang' },
      { answer: 'SEGITIGA', clue: 'Bangun datar berbidang tiga sisi hasil susunan batang korek api' },
      { answer: 'GESER', clue: 'Tindakan memindahkan posisi satu batang korek demi merubah persamaan' },
      { answer: 'PINDAH', clue: 'Langkah strategis memindahkan sedikit batang untuk memecahkan puzzle' },
      { answer: 'SOLUSI', clue: 'Jawaban cerdas di luar dugaan atas teka-teki batang korek yang rumit' },
      { answer: 'POLA', clue: 'Keteraturan bentuk bangun datar yang tersembunyi di balik susunan' },
    ],
  },
  {
    id: 'level_500_puncak_mahakarya_asah_otak',
    title: 'Puncak Mahakarya Asah Otak',
    category: 'Logika & Asah Otak',
    words: [
      { answer: 'TEKA', clue: 'Kata pertama pembuka judul permainan asah kata legendaris bangsa' },
      { answer: 'TEKI', clue: 'Pasangan kata teka pengasah ketajaman pikiran dan ingatan kosakata' },
      { answer: 'SILANG', clue: 'Format kisi-kisi kotak mendatar dan menurun yang saling menyilang' },
      { answer: 'PINTAR', clue: 'Capaian kecerdasan wawasan luas berkat rajin memecahkan teka-teki' },
      { answer: 'KATA', clue: 'Untaian huruf penyingkap misteri petunjuk dalam setiap kotak permainan' },
      { answer: 'ASAH', clue: 'Mengasah ketajaman daya nalar dan memori otak dengan bermain gembira' },
      { answer: 'JUARA', clue: 'Pencapaian paripurna pemain setia yang berhasil menuntaskan lima ratus bab' },
    ],
  },
];

console.log('Compiling Fase 5 of 500-level expansion: 18 Bab (Bab 483 to 500)...');

const levelsFilePath = path.join(__dirname, '../src/data/levels.json');
const existingLevels = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));

console.log(`Loaded ${existingLevels.length} existing levels.`);

const compiledPhase10 = [];

for (let i = 0; i < phase10Levels.length; i++) {
  const def = phase10Levels[i];
  const globalLevelIndex = 482 + i + 1; // Bab 483 to 500
  def.level = globalLevelIndex;
  try {
    const level = generateLevelFromWords(def);
    validateLevelData(level);
    const wordCount = level.clues.across.length + level.clues.down.length;
    console.log(
      `✓ [${globalLevelIndex}/500] ${level.id} (${level.title}) - ${wordCount} kata, grid: ${level.size.rows}x${level.size.cols}`
    );
    compiledPhase10.push(level);
  } catch (err) {
    console.error(`✗ Error on level ${def.id}:`, err.message);
    process.exit(1);
  }
}

const all500Levels = [...existingLevels.slice(0, 482), ...compiledPhase10];

fs.writeFileSync(levelsFilePath, JSON.stringify(all500Levels, null, 2), 'utf8');

console.log(`\n✓ Successfully compiled EXACTLY 500 levels into ${levelsFilePath}!`);
