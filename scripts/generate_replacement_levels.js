import { generateLevelFromWords, validateLevelData } from './crossword-builder.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const replacementLevels = [
  // --- TEMA 60: ILMU FARMASI & FARMAKOLOGI (Bab 494–497) ---
  {
    id: 'level_494_resep_dokter_apoteker_racikan',
    title: 'Resep Dokter, Apoteker & Racikan Obat',
    category: 'Farmasi & Farmakologi',
    words: [
      { answer: 'APOTEK', clue: 'Tempat berizin pelayanan dan peracikan obat oleh tenaga apoteker' },
      { answer: 'RESEP', clue: 'Surat tertulis dari dokter kepada apoteker untuk penyiapan obat' },
      { answer: 'RACIK', clue: 'Aktivitas mencampur bahan obat dengan teliti sesuai takaran medis' },
      { answer: 'PUYER', clue: 'Bentuk sediaan obat serbuk terbagi yang digerus halus untuk pasien' },
      { answer: 'KAPSUL', clue: 'Cangkang larut air pembungkus serbuk atau minyak obat berdosis tepat' },
      { answer: 'DOSIS', clue: 'Takaran tertentu suatu obat yang memberikan efek terapi paling aman' },
      { answer: 'KHASIAT', clue: 'Kegunaan atau efektivitas daya sembuh suatu sediaan senyawa obat' },
    ],
  },
  {
    id: 'level_495_golongan_obat_antibiotik_analgesik',
    title: 'Golongan Obat: Antibiotik & Analgesik',
    category: 'Farmasi & Farmakologi',
    words: [
      { answer: 'ANTIBIOTIK', clue: 'Senyawa pembunuh atau penghambat pertumbuhan kuman bakteri patogen' },
      { answer: 'ANALGESIK', clue: 'Golongan obat pereda dan penghilang sensasi rasa sakit pada tubuh' },
      { answer: 'TABLET', clue: 'Sediaan obat padat pipih kompak hasil kempa serbuk zat aktif' },
      { answer: 'SIRUP', clue: 'Larutan obat cair kental dengan pemanis rasa buah untuk anak-anak' },
      { answer: 'DEMAM', clue: 'Kondisi kenaikan suhu tubuh yang diredakan dengan obat antipiretik' },
      { answer: 'NYERI', clue: 'Sensasi rasa sakit pada jaringan tubuh akibat inflamasi atau cedera' },
      { answer: 'INFEKSI', clue: 'Invasi dan perkembangbiakan mikroorganisme patogen dalam organ tubuh' },
    ],
  },
  {
    id: 'level_496_herbal_farmakope_jamu_saintifikasi',
    title: 'Herbal Farmakope & Jamu Saintifikasi',
    category: 'Farmasi & Farmakologi',
    words: [
      { answer: 'EKSTRAK', clue: 'Sari pati pekat hasil penyarian tanaman obat menggunakan pelarut' },
      { answer: 'SIMPLISIA', clue: 'Bahan alamiah nabati kering yang belum mengalami proses kimiawi' },
      { answer: 'RIMPANG', clue: 'Batang menjalar di bawah tanah kaya minyak asiri obat tradisional' },
      { answer: 'ALAMI', clue: 'Berasal langsung dari keanekaragaman hayati tanpa bahan sintetik' },
      { answer: 'MINYAK', clue: 'Cairan pekat asiri beraroma khas dari penyulingan dedaunan herba' },
      { answer: 'HERBAL', clue: 'Tanaman atau tumbuhan berkhasiat untuk terapi pengobatan alami' },
      { answer: 'SEDIAAN', clue: 'Bentuk racikan akhir produk obat yang siap dikonsumsi oleh pasien' },
    ],
  },
  {
    id: 'level_497_vaksin_antibodi_imunisasi_tubuh',
    title: 'Vaksin, Antibodi & Imunisasi Tubuh',
    category: 'Farmasi & Farmakologi',
    words: [
      { answer: 'VAKSIN', clue: 'Produk biologi pembentuk kekebalan spesifik terhadap paparan wabah' },
      { answer: 'ANTIGEN', clue: 'Zat asing pemicu respon pembentukan sistem kekebalan tubuh' },
      { answer: 'IMUN', clue: 'Daya tahan alami sistem pertahanan tubuh dalam melawan patogen' },
      { answer: 'SUNTIK', clue: 'Metode memasukkan cairan obat atau vaksin lewat jarum ke tubuh' },
      { answer: 'ANTIBODI', clue: 'Protein pertahanan tubuh yang melumpuhkan kuman patogen penyerang' },
      { answer: 'BOOSTER', clue: 'Dosis penguat berkala untuk memperpanjang durasi kekebalan vaksin' },
      { answer: 'LINDUNG', clue: 'Menjaga dan membentengi tubuh dari ancaman penularan infeksi fatal' },
    ],
  },

  // --- TEMA 61: ILMU KOMPUTER & INFORMATIKA (Bab 498–500) ---
  {
    id: 'level_498_logika_pemrograman_algoritma',
    title: 'Logika Pemrograman & Algoritma',
    category: 'Ilmu Komputer',
    words: [
      { answer: 'LOGIKA', clue: 'Dasar penalaran aljabar boolean dalam pembuatan alur program komputer' },
      { answer: 'ALGORITMA', clue: 'Urutan langkah sistematis terstruktur penyelesaian masalah komputasi' },
      { answer: 'KODE', clue: 'Baris instruksi teks yang ditulis programmer dalam bahasa pemrograman' },
      { answer: 'SINTAKS', clue: 'Aturan tata bahasa resmi penulisan perintah kode dalam pemrograman' },
      { answer: 'INPUT', clue: 'Data atau sinyal masukan yang dimasukkan pengguna ke sistem komputer' },
      { answer: 'OUTPUT', clue: 'Hasil pemrosesan data komputasi yang disajikan ke layar pengguna' },
      { answer: 'VARIABEL', clue: 'Wadah penyimpanan nilai data dinamis di dalam alokasi memori komputer' },
    ],
  },
  {
    id: 'level_499_jaringan_komputer_server_protokol',
    title: 'Jaringan Komputer, Server & Protokol',
    category: 'Ilmu Komputer',
    words: [
      { answer: 'SERVER', clue: 'Komputer berdaya tinggi penyedia layanan dan sumber daya jaringan' },
      { answer: 'ROUTER', clue: 'Perangkat pengarah lalu lintas paket data antar jaringan komputer' },
      { answer: 'JARINGAN', clue: 'Sistem komputer yang saling terkoneksi untuk bertukar data digital' },
      { answer: 'DOMAIN', clue: 'Alamat nama unik pengganti deretan angka rumit IP address di internet' },
      { answer: 'PAKET', clue: 'Pecahan unit data digital yang dikirimkan melintasi jalur transmisi' },
      { answer: 'KLIEN', clue: 'Perangkat pengguna yang mengajukan permintaan layanan ke server web' },
      { answer: 'PORT', clue: 'Titik akhir saluran komunikasi jaringan untuk layanan aplikasi tertentu' },
    ],
  },
  {
    id: 'level_500_puncak_kecerdasan_buatan_komputasi',
    title: 'Puncak Kecerdasan Buatan & Komputasi Modern',
    category: 'Ilmu Komputer',
    words: [
      { answer: 'NEURON', clue: 'Unit pemroses dasar dalam arsitektur jaringan saraf tiruan cerdas' },
      { answer: 'MODEL', clue: 'Berkas algoritma terlatih yang memuat bobot pengetahuan komputasi cerdas' },
      { answer: 'BOBOT', clue: 'Parameter matematis penentu kekuatan sinyal hubungan antar lapisan neuron' },
      { answer: 'PREDIKSI', clue: 'Keluaran hasil inferensi model komputer cerdas atas data masukan baru' },
      { answer: 'DATA', clue: 'Kumpulan informasi digital sebagai bahan baku pelatihan kecerdasan buatan' },
      { answer: 'AKURASI', clue: 'Tingkat persentase ketepatan performa prediksi model pembelajaran mesin' },
      { answer: 'PINTAR', clue: 'Gelar pencapaian sistem komputer cerdas dan penuntas lima ratus bab game' },
    ],
  },
];

console.log('Compiling replacement levels for Bab 494 to 500...');

const levelsFilePath = path.join(__dirname, '../src/data/levels.json');
const existingLevels = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));

console.log(`Loaded ${existingLevels.length} existing levels.`);

const compiledLevels = [];

for (let i = 0; i < replacementLevels.length; i++) {
  const def = replacementLevels[i];
  const globalLevelIndex = 493 + i + 1; // Bab 494 to 500
  def.level = globalLevelIndex;
  try {
    const level = generateLevelFromWords(def);
    validateLevelData(level);
    const wordCount = level.clues.across.length + level.clues.down.length;
    console.log(
      `✓ [${globalLevelIndex}/500] ${level.id} (${level.title}) - ${wordCount} kata, grid: ${level.size.rows}x${level.size.cols}`
    );
    compiledLevels.push(level);
  } catch (err) {
    console.error(`✗ Error on level ${def.id}:`, err.message);
    process.exit(1);
  }
}

// Slice existing levels up to Bab 493 (493 items) and append the 7 new levels
const final500Levels = [...existingLevels.slice(0, 493), ...compiledLevels];

fs.writeFileSync(levelsFilePath, JSON.stringify(final500Levels, null, 2), 'utf8');

console.log(`\n✓ Successfully updated levels 494-500 in ${levelsFilePath}! Total levels: ${final500Levels.length}`);
