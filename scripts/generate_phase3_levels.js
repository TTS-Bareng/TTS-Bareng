import { generateLevelFromWords, validateLevelData } from './crossword-builder.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const phase3Levels = [
  // --- TEMA 41: SASTRA, BAHASA & KHAZANAH KATA (Bab 383–387) ---
  {
    id: 'level_383_dongeng_rakyat_fabel',
    title: 'Dongeng Rakyat & Hikmah Fabel',
    category: 'Sastra & Bahasa',
    words: [
      { answer: 'KANCIL', clue: 'Tokoh satwa cerdik dalam fabel yang suka mencuri mentimun' },
      { answer: 'BUAYA', clue: 'Hewan pemangsa sungai yang diperdaya kancil saat menyeberang' },
      { answer: 'TIMUN', clue: 'Buah sayuran segar kesukaan kancil di ladang pak tani' },
      { answer: 'DORNA', clue: 'Tokoh wayang lambang kelicikan pembuat gaduh persaudaraan' },
      { answer: 'DONGENG', clue: 'Cerita khayalan masa kecil pengantar tidur yang sarat hikmah' },
      { answer: 'CERITA', clue: 'Alur kisah petualangan para tokoh dari permulaan hingga akhir' },
      { answer: 'PESAN', clue: 'Nasihat moral bijak yang tersirat di balik setiap fabel' },
    ],
  },
  {
    id: 'level_384_peribahasa_pepatah_sehari',
    title: 'Peribahasa & Pepatah Sehari-hari',
    category: 'Sastra & Bahasa',
    words: [
      { answer: 'BERIAK', clue: 'Air beriak tanda tak dalam kiasan orang banyak cakap tak berilmu' },
      { answer: 'RAKIT', clue: 'Berakit-rakit ke hulu berenang-renang ke tepian bersusah dahulu' },
      { answer: 'KOSONG', clue: 'Tong kosong nyaring bunyinya kiasan orang sombong tanpa bukti' },
      { answer: 'PADI', clue: 'Kiasan sifat rendah hati semakin berisi semakin merunduk' },
      { answer: 'GARAM', clue: 'Banyak makan asam garam kiasan orang berpengalaman luas' },
      { answer: 'PETUAH', clue: 'Nasihat bijak warisan leluhur penuntun langkah kehidupan' },
      { answer: 'MAKNA', clue: 'Arti tersirat yang terkandung di dalam untaian pepatah' },
    ],
  },
  {
    id: 'level_385_bahasa_inggris_populer',
    title: 'Bahasa Inggris Populer & Maknanya',
    category: 'Sastra & Bahasa',
    words: [
      { answer: 'ONLINE', clue: 'Istilah serapan terhubung ke dalam jaringan internet maya' },
      { answer: 'DOWNLOAD', clue: 'Tindakan mengunduh berkas data dari internet ke gawai' },
      { answer: 'LOGIN', clue: 'Masuk ke dalam akun pribadi dengan nama pengguna dan sandi' },
      { answer: 'SCORE', clue: 'Angka perolehan poin hasil pertandingan permainan kata' },
      { answer: 'LEVEL', clue: 'Tingkatan tahapan tantangan permainan dari mudah ke sulit' },
      { answer: 'GAME', clue: 'Permainan interaktif penghibur waktu luang di ponsel pintar' },
      { answer: 'KATA', clue: 'Padanan kosakata bahasa yang diterjemahkan antar bangsa' },
    ],
  },
  {
    id: 'level_386_sastrawan_pujangga_legenda',
    title: 'Sastrawan & Pujangga Legendaris',
    category: 'Sastra & Bahasa',
    words: [
      { answer: 'CHAIRIL', clue: 'Penyair pelopor Angkatan 45 penggubah sajak legendaris Aku' },
      { answer: 'PRAMOEDYA', clue: 'Sastrawan besar pengarang Tetralogi Buru yang mendunia' },
      { answer: 'NOVEL', clue: 'Karya sastra prosa panjang menceritakan liku kehidupan tokoh' },
      { answer: 'PUISI', clue: 'Gubahan sajak indah berima pengungkap kedalaman rasa batin' },
      { answer: 'SAJAK', clue: 'Rima persamaan bunyi kata di akhir larik baris bait puisi' },
      { answer: 'KARYA', clue: 'Ciptaan buah pemikiran seni yang abadi dikenang sepanjang masa' },
      { answer: 'PENA', clue: 'Alat tulis simbolik penggores bait kata para pujangga aksara' },
    ],
  },
  {
    id: 'level_387_antonim_sinonim_indah_kbbi',
    title: 'Antonim & Sinonim Kata Indah KBBI',
    category: 'Sastra & Bahasa',
    words: [
      { answer: 'PARIWARA', clue: 'Sinonim kata iklan atau promosi produk dalam bahasa baku' },
      { answer: 'NISKALA', clue: 'Lawan kata dari berwujud nyata yang berarti abstrak tak kasat' },
      { answer: 'LAZUARDI', clue: 'Warna biru muda cerah seindah langit benderang di siang hari' },
      { answer: 'BAHTERA', clue: 'Sinonim kapal besar lambang arung kehidupan rumah tangga' },
      { answer: 'ANTONIM', clue: 'Lawan makna kata seperti tinggi berlawanan dengan rendah' },
      { answer: 'SINONIM', clue: 'Persamaan makna kata seperti pintar berpadanan dengan pandai' },
      { answer: 'BAHASA', clue: 'Sarana komunikasi lisan dan tulisan pemersatu bangsa Indonesia' },
    ],
  },

  // --- TEMA 42: KARIR, DUNIA KERJA & FINANSIAL MODERN (Bab 388–392) ---
  {
    id: 'level_388_profesi_kreatif_dkv_visual',
    title: 'Profesi Kreatif & Desain Visual',
    category: 'Karir & Finansial',
    words: [
      { answer: 'DESAIN', clue: 'Rancang bangun visual karya grafis penarik perhatian publik' },
      { answer: 'VEKTOR', clue: 'Format gambar grafis garis matematika yang tidak pecah dibesarkan' },
      { answer: 'FONTS', clue: 'Ragam bentuk huruf tipografi penentu keindahan teks tulisan' },
      { answer: 'LOGO', clue: 'Simbol lambang identitas visual resmi perusahaan atau produk' },
      { answer: 'WARNA', clue: 'Harmoni palet rona pemikat suasana hati penikmat karya seni' },
      { answer: 'KARYA', clue: 'Hasil ciptaan visual orisinal pengisi portofolio desainer' },
      { answer: 'KREATIF', clue: 'Kemampuan melahirkan gagasan segar di luar kebiasaan umum' },
    ],
  },
  {
    id: 'level_389_budaya_kantor_tim_kerja',
    title: 'Budaya Kantor & Kolaborasi Tim',
    category: 'Karir & Finansial',
    words: [
      { answer: 'RAPAT', clue: 'Pertemuan musyawarah berkala membahas evaluasi dan strategi' },
      { answer: 'PROYEK', clue: 'Rencana pekerjaan terstruktur dengan target capaian dan batas waktu' },
      { answer: 'TARGET', clue: 'Sasaran hasil kerja yang ingin dicapai dalam periode tertentu' },
      { answer: 'TIM', clue: 'Sekelompok rekan kerja yang bersatu padu mencapai tujuan bersama' },
      { answer: 'KANTOR', clue: 'Gedung tempat pegawai bekerja menjalankan tugas perusahaan' },
      { answer: 'KERJA', clue: 'Usaha nyata pengerahan tenaga dan pikiran demi meraih rezeki' },
      { answer: 'SUKSES', clue: 'Keberhasilan menuntaskan misi pekerjaan dengan hasil prima' },
    ],
  },
  {
    id: 'level_390_pasar_modal_dunia_investor',
    title: 'Pasar Modal & Dunia Investor',
    category: 'Karir & Finansial',
    words: [
      { answer: 'SAHAM', clue: 'Bukti kepemilikan nilai modal pada suatu perseroan terbuka' },
      { answer: 'DIVIDEN', clue: 'Bagian keuntungan laba perusahaan yang dibagikan ke pemodal' },
      { answer: 'BURSA', clue: 'Pasar teratur tempat transaksi efek dan surat berharga modal' },
      { answer: 'CUAN', clue: 'Istilah populer meraup laba untung dari hasil berinvestasi' },
      { answer: 'MODAL', clue: 'Dana pokok yang ditanamkan untuk membiayai usaha perdagangan' },
      { answer: 'INVESTOR', clue: 'Pemodal penanam dana yang mengharapkan pertumbuhan masa depan' },
      { answer: 'LABA', clue: 'Keuntungan finansial bersih dari hasil kegiatan berbisnis' },
    ],
  },
  {
    id: 'level_391_wirausaha_bisnis_startup',
    title: 'Wirausaha & Bisnis Rintisan Startup',
    category: 'Karir & Finansial',
    words: [
      { answer: 'STARTUP', clue: 'Bisnis rintisan inovatif berbasis teknologi yang tumbuh pesat' },
      { answer: 'INOVASI', clue: 'Gagasan terobosan baru pembawa pembaruan solusi masalah' },
      { answer: 'PENDIRI', clue: 'Sosok pencetus utama pendiri perusahaan bersama rekan sejawat' },
      { answer: 'PRODUK', clue: 'Barang atau aplikasi layanan yang ditawarkan ke konsumen' },
      { answer: 'PASAR', clue: 'Tempat bertemunya penawaran barang dengan permintaan pembeli' },
      { answer: 'BISNIS', clue: 'Aktivitas perniagaan menjual barang demi meraih keuntungan' },
      { answer: 'MAJU', clue: 'Perkembangan usaha yang kian meluas menjangkau pelanggan baru' },
    ],
  },
  {
    id: 'level_392_etos_kerja_pengembangan_diri',
    title: 'Etos Kerja & Pengembangan Diri',
    category: 'Karir & Finansial',
    words: [
      { answer: 'DISIPLIN', clue: 'Kepatuhan taat waktu dan aturan demi integritas diri' },
      { answer: 'INTEGRITAS', clue: 'Keselarasan antara perkataan jujur dengan tindakan nyata' },
      { answer: 'BELAJAR', clue: 'Menambah keterampilan dan wawasan baru sepanjang hayat' },
      { answer: 'KARIR', clue: 'Jenjang kemajuan profesi pekerjaan yang dirintis dengan tekun' },
      { answer: 'PIMPIN', clue: 'Kemampuan membimbing dan mengarahkan anggota tim kerja' },
      { answer: 'GIGIH', clue: 'Sifat ulet pantang menyerah saat menghadapi kendala berat' },
      { answer: 'MUTU', clue: 'Kualitas standar hasil kerja yang dijaga tetap prima dan unggul' },
    ],
  },
];

console.log('Compiling Fase 3: 10 Bab (Bab 383 to 392)...');

const levelsFilePath = path.join(__dirname, '../src/data/levels.json');
const existingLevels = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));

console.log(`Loaded ${existingLevels.length} existing levels.`);

const compiledPhase3 = [];

for (let i = 0; i < phase3Levels.length; i++) {
  const def = phase3Levels[i];
  const globalLevelIndex = 382 + i + 1; // Bab 383 to 392
  def.level = globalLevelIndex;
  try {
    const level = generateLevelFromWords(def);
    validateLevelData(level);
    const wordCount = level.clues.across.length + level.clues.down.length;
    console.log(
      `✓ [${globalLevelIndex}/392] ${level.id} (${level.title}) - ${wordCount} kata, grid: ${level.size.rows}x${level.size.cols}`
    );
    compiledPhase3.push(level);
  } catch (err) {
    console.error(`✗ Error on level ${def.id}:`, err.message);
    process.exit(1);
  }
}

const all392Levels = [...existingLevels.slice(0, 382), ...compiledPhase3];

fs.writeFileSync(levelsFilePath, JSON.stringify(all392Levels, null, 2), 'utf8');

console.log(`\n✓ Successfully compiled 392 levels into ${levelsFilePath}!`);
