import { generateLevelFromWords, validateLevelData } from './crossword-builder.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const phase9Levels = [
  // --- TEMA 55: KELAUTAN, OSEANOGRAFI & MISTERI SAMUDRA (Bab 465–470) ---
  {
    id: 'level_465_palung_terdalam_mariana',
    title: 'Palung Terdalam Jurang Mariana',
    category: 'Kelautan & Samudra',
    words: [
      { answer: 'PALUNG', clue: 'Jurang sempit memanjang yang amat sangat dalam di dasar samudra' },
      { answer: 'MARIANA', clue: 'Nama palung samudra terdalam di bumi terletak di Samudra Pasifik barat' },
      { answer: 'DALAM', clue: 'Jarak vertikal ribuan meter menembus kegelapan abadi samudra raya' },
      { answer: 'GELAP', clue: 'Kondisi tanpa berkas sinar matahari sama sekali di zona abisal laut' },
      { answer: 'TEKANAN', clue: 'Beban hidrostatik air yang amat dahsyat di dasar laut terdalam' },
      { answer: 'DASAR', clue: 'Lantai samudra tempat bertumpunya kerak bumi di bawah lautan' },
      { answer: 'ZONA', clue: 'Pembagian mintakat lapisan kedalaman laut dari fotik hingga hadal' },
    ],
  },
  {
    id: 'level_466_irama_pasang_surut_arus_laut',
    title: 'Irama Pasang Surut & Arus Laut',
    category: 'Kelautan & Samudra',
    words: [
      { answer: 'PASANG', clue: 'Naiknya permukaan air laut secara berkala akibat gravitasi bulan' },
      { answer: 'SURUT', clue: 'Turunnya permukaan perairan pantai setelah mencapai titik pasang' },
      { answer: 'ARUS', clue: 'Gerakan massa air laut yang mengalir teratur melintasi samudra' },
      { answer: 'GRAVITASI', clue: 'Gaya tarik massa Bulan dan Matahari pemicu pasang surut air laut' },
      { answer: 'BULAN', clue: 'Benda langit satelit bumi penentu pasang perbani dan pasang purnama' },
      { answer: 'PESISIR', clue: 'Wilayah daratan peralihan yang tergenang saat air laut pasang' },
      { answer: 'OMBAK', clue: 'Gelombang air permukaan yang pecah saat mendekati pantai dangkal' },
    ],
  },
  {
    id: 'level_467_raksasa_lautan_paus_gurita',
    title: 'Raksasa Lautan: Paus & Gurita Raksasa',
    category: 'Kelautan & Samudra',
    words: [
      { answer: 'PAUS', clue: 'Mamalia laut berdarah panas bernapas paru-paru terbesar di bumi' },
      { answer: 'GURITA', clue: 'Hewan moluska bertentakel delapan yang cerdas dan mampu berkamuflase' },
      { answer: 'SIRIP', clue: 'Organ gerak pipih penyeimbang dan pengayuh tubuh hewan samudra' },
      { answer: 'INSANG', clue: 'Alat pernapasan penyaring oksigen terlarut dalam air pada ikan' },
      { answer: 'CUMI', clue: 'Hewan sefalopoda bertinta gelap yang melesat dengan propulsi air' },
      { answer: 'RAKSASA', clue: 'Ukuran paus biru yang mencapai panjang puluhan meter di laut lepas' },
      { answer: 'SAMUDRA', clue: 'Lautan luas tak bertepi yang memisahkan daratan benua-benua dunia' },
    ],
  },
  {
    id: 'level_468_segitiga_terumbu_karang_dunia',
    title: 'Segitiga Terumbu Karang Dunia',
    category: 'Kelautan & Samudra',
    words: [
      { answer: 'KARANG', clue: 'Ekosistem koloni polip kapur tempat berlindung aneka biota laut' },
      { answer: 'SPONS', clue: 'Hewan berpori sederhana pembersih dan penyaring alami air karang' },
      { answer: 'ANEMON', clue: 'Hewan laut berumbai tentakel penyengat rumah bagi ikan badut' },
      { answer: 'BIOTA', clue: 'Seluruh makhluk hayati tumbuhan dan satwa penghuni terumbu karang' },
      { answer: 'RAGAM', clue: 'Keanekaragaman spesies hayati laut terkaya yang ada di nusantara' },
      { answer: 'TROPIS', clue: 'Perairan hangat bersuhu nyaman tempat suburnya taman terumbu karang' },
      { answer: 'WARNA', clue: 'Warna-warni cerah terumbu karang yang memesona para penyelam' },
    ],
  },
  {
    id: 'level_469_hutan_bakau_pesisir_penahan_erosi',
    title: 'Hutan Bakau Pesisir Penahan Erosi',
    category: 'Kelautan & Samudra',
    words: [
      { answer: 'BAKAU', clue: 'Pohon berakar tunjang penyangga tanah lumpur di tepian pesisir' },
      { answer: 'MANGROVE', clue: 'Formasi vegetasi khas pantai berlumpur toleran kadar garam tinggi' },
      { answer: 'AKAR', clue: 'Jaringan tunjang kuat penahan gelombang pemecah hempasan ombak' },
      { answer: 'PANTAI', clue: 'Tepian daratan yang terlindung dari abrasi berkat sabuk hijau bakau' },
      { answer: 'KEPITING', clue: 'Krustasea bercapit keras penghuni liang tanah di sela akar bakau' },
      { answer: 'LUMPUR', clue: 'Endapan tanah liat basah subur kaya bahan organik sisa dedaunan' },
      { answer: 'TEDUH', clue: 'Suasana kanopi rindang pepohonan bakau penyejuk pesisir muara' },
    ],
  },
  {
    id: 'level_470_olahraga_menyelam_bawah_air',
    title: 'Olahraga Menyelam Bawah Air',
    category: 'Kelautan & Samudra',
    words: [
      { answer: 'SCUBA', clue: 'Perangkat tabung udara mandiri untuk menyelam lama di kedalaman' },
      { answer: 'MASKER', clue: 'Kacamata selam penutup hidung untuk pandangan jernih bawah laut' },
      { answer: 'SNORKEL', clue: 'Pipa napas udara permukaan bagi perenang di atas terumbu karang' },
      { answer: 'TABUNG', clue: 'Silinder logam bertekanan penyimpan udara hirup penyelam scuba' },
      { answer: 'SIRIP', clue: 'Sepatu katak lentur pengayuh laju kaki penyelam di dalam air' },
      { answer: 'SELAM', clue: 'Aktivitas menjelajahi keindahan panorama dunia bawah air laut' },
      { answer: 'DALAM', clue: 'Sensasi melayang anggun di kedalaman laut biru yang tenang sunyi' },
    ],
  },

  // --- TEMA 56: CUACA, IKLIM & DINAMIKA SEMESTA (Bab 471–476) ---
  {
    id: 'level_471_pusaran_badai_tropis_tornado',
    title: 'Pusaran Badai Tropis & Tornado',
    category: 'Cuaca & Iklim',
    words: [
      { answer: 'BADAI', clue: 'Pusaran angin kencang bertekanan rendah pembawa hujan lebat' },
      { answer: 'TOPAN', clue: 'Siklon tropis dahsyat yang melanda wilayah samudra perairan hangat' },
      { answer: 'TORNADO', clue: 'Pusaran corong angin puting beliung vertikal berkecepatan dahsyat' },
      { answer: 'ANGIN', clue: 'Aliran udara yang bergerak dari daerah bertekanan tinggi ke rendah' },
      { answer: 'PUSARAN', clue: 'Pusat mata badai berputar yang menyerap kelembaban uap air laut' },
      { answer: 'HUJAN', clue: 'Curahan butiran air atmosfer yang jatuh membasahi permukaan bumi' },
      { answer: 'GELAP', clue: 'Pekatnya awan mendung kumulonimbus sebelum badai menggelegar' },
    ],
  },
  {
    id: 'level_472_dapur_magma_erupsi_gunung_berapi',
    title: 'Dapur Magma & Erupsi Gunung Berapi',
    category: 'Cuaca & Iklim',
    words: [
      { answer: 'LAHAR', clue: 'Banjir lumpur material vulkanik bercampur air hujan di lereng gunung' },
      { answer: 'MAGMA', clue: 'Batuan cair pijar berpijar sangat panas di dalam perut bumi' },
      { answer: 'ERUPSI', clue: 'Peristiwa pelepasan material gas, abu, dan lava dari lubang kepundan' },
      { answer: 'KAWAH', clue: 'Cekungan mulut gunung api tempat keluarnya kepulan gas belerang' },
      { answer: 'ABU', clue: 'Debu partikel halus vulkanik penutup langit penyubur tanah pertanian' },
      { answer: 'VULKANIK', clue: 'Aktivitas yang berkaitan dengan fenomena pembentukan gunung api' },
      { answer: 'LETUSAN', clue: 'Dentuman pelepasan energi tekanan gas bumi ke angkasa luar' },
    ],
  },
  {
    id: 'level_473_gempa_tektonik_skala_richter',
    title: 'Gempa Tektonik & Skala Richter',
    category: 'Cuaca & Iklim',
    words: [
      { answer: 'GEMPA', clue: 'Guncangan getaran kerak bumi akibat pelepasan energi lempeng sesar' },
      { answer: 'LEMPENG', clue: 'Kepingan kerak bumi raksasa yang saling bergeser dan bertabrakan' },
      { answer: 'PATAHAN', clue: 'Sesar rekahan batuan kulit bumi tempat pusat sumber gempa bumi' },
      { answer: 'GETARAN', clue: 'Gelombang seismik perambat guncangan gempa bumi melintasi tanah' },
      { answer: 'RICHTER', clue: 'Satuan skala besaran magnitudo kekuatan pelepasan gempa bumi' },
      { answer: 'SESAR', clue: 'Jalur rekahan retakan batuan bumi yang aktif memicu getaran lindu' },
      { answer: 'LINDU', clue: 'Istilah tradisional nusantara untuk peristiwa guncangan tanah gempa' },
    ],
  },
  {
    id: 'level_474_dinamika_cuaca_elnino_lanina',
    title: 'Dinamika Cuaca El Nino & La Nina',
    category: 'Cuaca & Iklim',
    words: [
      { answer: 'KEMARAU', clue: 'Musim kering berkepanjangan akibat pemanasan suhu permukaan laut' },
      { answer: 'HUJAN', clue: 'Curah hujan berlimpah di kepulauan nusantara saat fase La Nina aktif' },
      { answer: 'IKLIM', clue: 'Pola cuaca rata-rata jangka panjang di suatu kawasan geografis' },
      { answer: 'SUHU', clue: 'Derajat panas atau dinginnya permukaan atmosfer udara harian' },
      { answer: 'BASAH', clue: 'Kondisi tanah dan lingkungan saat curah hujan turun tanpa henti' },
      { answer: 'KERING', clue: 'Kondisi kekurangan air saat musim kemarau terik melanda bumi' },
      { answer: 'ANOMALI', clue: 'Penyimpangan suhu laut dari rata-rata normal pemicu cuaca ekstrem' },
    ],
  },
  {
    id: 'level_475_kilauan_pelangi_hujan_es',
    title: 'Kilauan Pelangi & Fenomena Hujan Es',
    category: 'Cuaca & Iklim',
    words: [
      { answer: 'PELANGI', clue: 'Lengkungan spektrum warna-warni indah di langit usai hujan reda' },
      { answer: 'BIAS', clue: 'Pembelokan berkas sinar matahari saat melewati butiran air hujan' },
      { answer: 'CAHAYA', clue: 'Sinar mentari putih yang terurai menjadi tujuh warna spektrum' },
      { answer: 'BUTIR', clue: 'Bongkahan es padat yang terbentuk di awan dingin dan jatuh ke bumi' },
      { answer: 'AWAN', clue: 'Kumpulan tetes air atau kristal es yang melayang-layang di langit' },
      { answer: 'TETES', clue: 'Curahan butir embun air pembawa kesejukan suasana fajar pagi' },
      { answer: 'INDAH', clue: 'Pemandangan elok busur pelangi melintasi kaki cakrawala biru' },
    ],
  },
  {
    id: 'level_476_lindungi_atmosfer_iklim_bumi',
    title: 'Lindungi Atmosfer & Iklim Bumi',
    category: 'Cuaca & Iklim',
    words: [
      { answer: 'OZON', clue: 'Lapisan gas pelindung bumi dari paparan radiasi sinar ultraviolet' },
      { answer: 'EMISI', clue: 'Pelepasan gas buang karbon ke udara yang memicu pemanasan global' },
      { answer: 'IKLIM', clue: 'Kestabilan sistem cuaca global yang harus dijaga dari kerusakan' },
      { answer: 'HUTAN', clue: 'Paru-paru hijau bumi penyerap karbon dan penyeimbang suhu alam' },
      { answer: 'BUMI', clue: 'Satu-satunya planet hunian peradaban yang wajib kita jaga bersama' },
      { answer: 'SEJUK', clue: 'Hawa segar nyaman berkat lestarinya ruang terbuka hijau di bumi' },
      { answer: 'LESTARI', clue: 'Upaya menjaga kelangsungan ekosistem alam demi generasi masa depan' },
    ],
  },

  // --- TEMA 57: KERAJAAN KUNO & HIKAYAT NUSANTARA (Bab 477–482) ---
  {
    id: 'level_477_kejayaan_majapahit_sumpah_palapa',
    title: 'Kejayaan Majapahit & Sumpah Palapa',
    category: 'Kerajaan Nusantara',
    words: [
      { answer: 'GAJAHMADA', clue: 'Mahapatih perkasa pengucap Sumpah Palapa pemersatu kepulauan' },
      { answer: 'HAYAM', clue: 'Raja agung Hayam Wuruk pemimpin puncak zaman keemasan Majapahit' },
      { answer: 'MAJAPAHIT', clue: 'Kemaharajaan maritim agung berpusat di wilayah Trowulan Jawa Timur' },
      { answer: 'PALAPA', clue: 'Sumpah pantang istirahat bersenang-senang sebelum nusantara bersatu' },
      { answer: 'PATIH', clue: 'Pejabat tinggi perdana menteri penggerak roda pemerintahan kerajaan' },
      { answer: 'NUSANTARA', clue: 'Gugusan pulau-pulau tanah air yang dipersatukan panji Majapahit' },
      { answer: 'TAHTA', clue: 'Singgasana lambang kekuasaan kedaulatan maharaja yang dihormati' },
    ],
  },
  {
    id: 'level_478_kerajaan_bahari_sriwijaya',
    title: 'Kerajaan Bahari Sriwijaya',
    category: 'Kerajaan Nusantara',
    words: [
      { answer: 'SRIWIJAYA', clue: 'Kemaharajaan bahari berpengaruh kuat penguasa jalur niaga Selat Malaka' },
      { answer: 'MARITIM', clue: 'Kekuatan armada laut armada niaga penjelajah jalur perdagangan samudra' },
      { answer: 'SELAT', clue: 'Jalur perairan sempit strategis penghubung niaga India dan Tiongkok' },
      { answer: 'PRASASTI', clue: 'Piagam piagam batu bertulis huruf Pallawa peninggalan raja datu' },
      { answer: 'CANDI', clue: 'Bangunan suci peninggalan peradaban masa lampau seperti Candi Muaro Jambi' },
      { answer: 'KAPAL', clue: 'Bahtera layar bertiang tinggi pembawa komoditas rempah dan barang niaga' },
      { answer: 'DATU', clue: 'Gelar pemimpin penguasa wilayah dalam tatanan kemaharajaan Sriwijaya' },
    ],
  },
  {
    id: 'level_479_kisah_singasari_keris_empu_gandring',
    title: 'Kisah Singasari & Keris Empu Gandring',
    category: 'Kerajaan Nusantara',
    words: [
      { answer: 'SINGASARI', clue: 'Kerajaan beribukota di Tumapel Malang yang didirikan Ken Arok' },
      { answer: 'KENAROK', clue: 'Pendiri wangsa Rajasa Singasari bergelar Sri Ranggah Rajasa' },
      { answer: 'KENDEDES', clue: 'Putri jelita bertuah ibu pertiwi pelahir raja-raja tanah Jawa' },
      { answer: 'KERIS', clue: 'Senjata tikam pusaka berlekuk luk mahakarya tempa empu termasyhur' },
      { answer: 'GANDRING', clue: 'Nama empu pembuat keris sakti berilmu tinggi dalam hikayat Jawa' },
      { answer: 'ARCA', clue: 'Patung pualam batu perwujudan dewa raja peninggalan masa Singasari' },
      { answer: 'RAJA', clue: 'Pemimpin tahta penguasa tunggal yang ditaati segenap bala tentara' },
    ],
  },
  {
    id: 'level_480_wangsa_sanjaya_syailendra_mataram',
    title: 'Wangsa Sanjaya & Syailendra Mataram',
    category: 'Kerajaan Nusantara',
    words: [
      { answer: 'MATARAM', clue: 'Kerajaan kuno di lembah Sungai Progo dan Opak tanah Jawa Tengah' },
      { answer: 'WANGSA', clue: 'Garis keturunan dinasti penguasa tahta leluhur kerajaan zaman kuno' },
      { answer: 'MEDANG', clue: 'Nama lain pusat keraton kerajaan Mataram kuno sebelum pindah timur' },
      { answer: 'PRASASTI', clue: 'Batu piagam berangka tahun rekaman titah anugerah tanah sima' },
      { answer: 'CANDI', clue: 'Kemegahan Borobudur dan Prambanan mahakarya peradaban Mataram Kuno' },
      { answer: 'KERATON', clue: 'Kompleks istana kediaman raja pusat peribadatan dan pemerintahan' },
      { answer: 'LELUHUR', clue: 'Para pendahulu pembangun peradaban nusantara yang dihormati' },
    ],
  },
  {
    id: 'level_481_gerbang_niaga_samudera_pasai_malaka',
    title: 'Gerbang Niaga Samudera Pasai & Malaka',
    category: 'Kerajaan Nusantara',
    words: [
      { answer: 'PASAI', clue: 'Kesultanan bahari pesisir utara Sumatra pelopor perniagaan nusantara' },
      { answer: 'MALAKA', clue: 'Pelabuhan niaga tersibuk di dunia tempat bertemunya para saudagar' },
      { answer: 'SAUDAGAR', clue: 'Pedagang lintas samudra pembawa kain sutra, porselen, dan emas' },
      { answer: 'KOIN', clue: 'Mata uang dirham emas alat tukar sah transaksi perdagangan bandar' },
      { answer: 'PELABUHAN', clue: 'Tempat bersandar ribuan bahtera niaga dari berbagai penjuru bumi' },
      { answer: 'BANDAR', clue: 'Kota pelabuhan niaga yang ramai dengan pasar dan gudang simpan' },
      { answer: 'NIAGA', clue: 'Kegiatan jual beli komoditas barter antar-bangsa pelaut dunia' },
    ],
  },
  {
    id: 'level_482_naskah_lontar_prasasti_batu_tulis',
    title: 'Naskah Lontar & Prasasti Batu Tulis',
    category: 'Kerajaan Nusantara',
    words: [
      { answer: 'LONTAR', clue: 'Daun pohon siwalan yang dikeringkan dan diiris jadi lembaran kitab' },
      { answer: 'PRASASTI', clue: 'Pahatan piagam batu bertulis aksara Kawi rekaman sabda raja' },
      { answer: 'AKSARA', clue: 'Sistem simbol huruf purba perangkai bait hikayat seperti Pallawa' },
      { answer: 'PAHAT', clue: 'Alat penatah batu keras pengukir bait prasasti agar abadi terbaca' },
      { answer: 'KUNO', clue: 'Peninggalan bernilai sejarah tinggi dari masa berabad-abad lampau' },
      { answer: 'NASKAH', clue: 'Naskah manuskrip tulisan tangan penyimpan petuah bijak masa lalu' },
      { answer: 'PUJANGGA', clue: 'Penyair sastrawan keraton penggubah kakawin dan kitab babad' },
    ],
  },
];

console.log('Compiling Fase 4 of 500-level expansion: 18 Bab (Bab 465 to 482)...');

const levelsFilePath = path.join(__dirname, '../src/data/levels.json');
const existingLevels = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));

console.log(`Loaded ${existingLevels.length} existing levels.`);

const compiledPhase9 = [];

for (let i = 0; i < phase9Levels.length; i++) {
  const def = phase9Levels[i];
  const globalLevelIndex = 464 + i + 1; // Bab 465 to 482
  def.level = globalLevelIndex;
  try {
    const level = generateLevelFromWords(def);
    validateLevelData(level);
    const wordCount = level.clues.across.length + level.clues.down.length;
    console.log(
      `✓ [${globalLevelIndex}/482] ${level.id} (${level.title}) - ${wordCount} kata, grid: ${level.size.rows}x${level.size.cols}`
    );
    compiledPhase9.push(level);
  } catch (err) {
    console.error(`✗ Error on level ${def.id}:`, err.message);
    process.exit(1);
  }
}

const all482Levels = [...existingLevels.slice(0, 464), ...compiledPhase9];

fs.writeFileSync(levelsFilePath, JSON.stringify(all482Levels, null, 2), 'utf8');

console.log(`\n✓ Successfully compiled 482 levels into ${levelsFilePath}!`);
