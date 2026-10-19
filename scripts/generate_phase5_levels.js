import { generateLevelFromWords, validateLevelData } from './crossword-builder.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const phase5Levels = [
  // --- TEMA 45: HUBUNGAN INTERNASIONAL & DIPLOMASI BANGSA (Bab 402–405) ---
  {
    id: 'level_402_diplomasi_kemitraan_antarbangsa',
    title: 'Diplomasi & Kemitraan Antarbangsa',
    category: 'Hubungan Internasional',
    words: [
      { answer: 'DUTA', clue: 'Perwakilan resmi tingkat tinggi suatu negara di negara sahabat' },
      { answer: 'KONSULAT', clue: 'Kantor perwakilan diplomatik pengurus kepentingan warga di luar negeri' },
      { answer: 'TRAKTAT', clue: 'Perjanjian resmi antarbangsa yang mengikat secara hukum internasional' },
      { answer: 'KERJASAMA', clue: 'Usaha bersama antarbangsa untuk mencapai tujuan dan kemaslahatan bersama' },
      { answer: 'DAMAI', clue: 'Kondisi rukun tanpa peperangan dan permusuhan antarbangsa di dunia' },
      { answer: 'MITRA', clue: 'Kawan sekutu rekanan yang saling mendukung dalam ikatan kemitraan' },
      { answer: 'NEGARA', clue: 'Organisasi kekuasaan berdaulat yang memiliki rakyat dan wilayah sah' },
    ],
  },
  {
    id: 'level_403_organisasi_dunia_konferensi_global',
    title: 'Organisasi Dunia & Konferensi Global',
    category: 'Hubungan Internasional',
    words: [
      { answer: 'ASEAN', clue: 'Perhimpunan bangsa-bangsa di kawasan Asia Tenggara' },
      { answer: 'UNESCO', clue: 'Badan PBB pembina pendidikan, ilmu pengetahuan, dan kebudayaan dunia' },
      { answer: 'SIDANG', clue: 'Pertemuan rapat musyawarah para delegasi membahas agenda global' },
      { answer: 'PIAGAM', clue: 'Naskah resmi pembentukan asas dan landasan pendirian organisasi' },
      { answer: 'GLOBAL', clue: 'Bersifat menyeluruh mencakup seluruh belahan penjuru bumi' },
      { answer: 'ANGGOTA', clue: 'Negara-negara yang sah bergabung ke dalam perserikatan bangsa' },
      { answer: 'FORUM', clue: 'Wadah musyawarah terbuka pertemuan para pemimpin antarbangsa' },
    ],
  },
  {
    id: 'level_404_paspor_penjelajahan_lintas_batas',
    title: 'Paspor & Penjelajahan Lintas Batas',
    category: 'Hubungan Internasional',
    words: [
      { answer: 'PASPOR', clue: 'Buku dokumen identitas resmi warga negara untuk bepergian ke luar negeri' },
      { answer: 'VISA', clue: 'Izin resmi masuk dan tinggal sementara di wilayah negara tujuan' },
      { answer: 'IMIGRASI', clue: 'Pemeriksaan perpindahan orang melintasi batas gerbang negara' },
      { answer: 'BANDARA', clue: 'Pangkalan lapangan tempat lepas landas dan mendaratnya pesawat' },
      { answer: 'FISKAL', clue: 'Ketentuan pajak retribusi resmi keberangkatan perjalanan luar negeri' },
      { answer: 'PERJALANAN', clue: 'Aktivitas bepergian menjelajah melintasi berbagai kota dan benua' },
      { answer: 'TURIS', clue: 'Pelancong yang bepergian mengunjungi negara lain untuk berlibur' },
    ],
  },
  {
    id: 'level_405_perdamaian_dunia_misi_kemanusiaan',
    title: 'Perdamaian Dunia & Misi Kemanusiaan',
    category: 'Hubungan Internasional',
    words: [
      { answer: 'GARUDA', clue: 'Pasukan kontingen tentara Indonesia dalam misi perdamaian PBB' },
      { answer: 'RELAWAN', clue: 'Orang yang dengan tulus ikhlas menolong korban bencana tanpa pamrih' },
      { answer: 'LOGISTIK', clue: 'Bantuan pangan, tenda, dan obat-obatan darurat bagi korban krisis' },
      { answer: 'SOLIDARITAS', clue: 'Rasa kebersamaan dan senasib sepenanggungan antarsesama manusia' },
      { answer: 'MEDIS', clue: 'Bantuan dokter, paramedis, dan obat perawatan luka di zona darurat' },
      { answer: 'TANGGAP', clue: 'Sikap sigap dan cepat bereaksi dalam mengatasi kondisi darurat' },
      { answer: 'AMAN', clue: 'Kondisi bebas dari ancaman bahaya dan ketakutan bagi warga sipil' },
    ],
  },

  // --- TEMA 46: SENI RUPA, DESAIN & ARSITEKTUR NUSANTARA (Bab 406–409) ---
  {
    id: 'level_406_arsitektur_rumah_adat_nusantara',
    title: 'Arsitektur Rumah Adat Nusantara',
    category: 'Seni & Arsitektur',
    words: [
      { answer: 'JOGLO', clue: 'Rumah adat khas Jawa dengan atap tajug megah bertiang soko guru' },
      { answer: 'GADANG', clue: 'Rumah adat Minangkabau beratap melengkung runcing bagai tanduk kerbau' },
      { answer: 'TONGKONAN', clue: 'Rumah panggung adat Toraja dengan atap melengkung menyerupai perahu' },
      { answer: 'PASAK', clue: 'Kayu paku pengunci sambungan balok tiang tanpa menggunakan paku besi' },
      { answer: 'TIANG', clue: 'Tonggak kayu kokoh penyangga utama atap dan lantai rumah panggung' },
      { answer: 'ATAP', clue: 'Penutup bagian atas bangunan pelindung dari guyuran hujan dan panas' },
      { answer: 'PANGGUNG', clue: 'Struktur lantai rumah yang ditinggikan untuk mencegah kelembaban dan satwa' },
    ],
  },
  {
    id: 'level_407_seni_ukir_ornamen_kriya_tradisional',
    title: 'Seni Ukir & Ornamen Kriya Tradisional',
    category: 'Seni & Arsitektur',
    words: [
      { answer: 'JEPARA', clue: 'Kota pesisir Jawa Tengah yang kesohor dengan seni ukir kayu jati indah' },
      { answer: 'PAHAT', clue: 'Alat besi berbilah tajam penatah motif ukiran kayu dan batu alam' },
      { answer: 'MOTIF', clue: 'Pola gambar hiasan khas seperti sulur tumbuhan, bunga, dan hewan' },
      { answer: 'RELIEF', clue: 'Seni pahatan timbul pada dinding batu yang mengisahkan cerita masa lalu' },
      { answer: 'ANYAMAN', clue: 'Kriya merangkai bilah rotan, daun pandan, atau bambu menjadi wadah' },
      { answer: 'KAYU', clue: 'Bahan alami pohon yang menjadi media utama karya ukir dan patung' },
      { answer: 'KRIYA', clue: 'Kerajinan tangan bernilai seni tinggi hasil keterampilan jari perajin' },
    ],
  },
  {
    id: 'level_408_galeri_lukisan_kuas_maestro',
    title: 'Galeri Lukisan & Kuas Maestro',
    category: 'Seni & Arsitektur',
    words: [
      { answer: 'AFFANDI', clue: 'Maestro pelukis ekspresionisme Indonesia yang melukis langsung dari tube cat' },
      { answer: 'RADENSALEH', clue: 'Pelukis legendaris perintis seni rupa modern bertema Penangkapan Diponegoro' },
      { answer: 'KANVAS', clue: 'Kain tebal terbentang pada bingkai tempat menggoreskan cat lukis' },
      { answer: 'KUAS', clue: 'Alat bulu berpelat gagang untuk memulaskan warna cat pada lukisan' },
      { answer: 'SKETSA', clue: 'Goresan rancangan gambar garis awal sebelum lukisan disempurnakan' },
      { answer: 'GALERI', clue: 'Ruang pameran tempat memajang dan mengapresiasi karya seni lukis' },
      { answer: 'PALET', clue: 'Papan ceper tempat pelukis mencampur dan mengaduk komposisi cat' },
    ],
  },
  {
    id: 'level_409_desain_grafis_estetika_visual_modern',
    title: 'Desain Grafis & Estetika Visual Modern',
    category: 'Seni & Arsitektur',
    words: [
      { answer: 'TIPOGRAFI', clue: 'Seni memilih, menata, dan merancang gaya huruf agar nyaman dibaca' },
      { answer: 'VEKTOR', clue: 'Format gambar berbasis kurva garis matematis yang tidak pecah saat diperbesar' },
      { answer: 'WARNA', clue: 'Unsur visual seperti primer dan sekunder pembangun suasana emosi karya' },
      { answer: 'POSTER', clue: 'Media komunikasi visual lembaran kertas tempel untuk pesan publik' },
      { answer: 'PIKSEL', clue: 'Titik unsur terkecil penyusun citra gambar digital di layar komputer' },
      { answer: 'ILUSTRASI', clue: 'Gambar penjelas pengiring teks cerita atau sampul buku bacaan' },
      { answer: 'ESTETIKA', clue: 'Nilai keindahan artistik dan keharmonisan bentuk dalam desain' },
    ],
  },
];

console.log('Compiling Fase 5: 8 Bab (Bab 402 to 409)...');

const levelsFilePath = path.join(__dirname, '../src/data/levels.json');
const existingLevels = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));

console.log(`Loaded ${existingLevels.length} existing levels.`);

const compiledPhase5 = [];

for (let i = 0; i < phase5Levels.length; i++) {
  const def = phase5Levels[i];
  const globalLevelIndex = 401 + i + 1; // Bab 402 to 409
  def.level = globalLevelIndex;
  try {
    const level = generateLevelFromWords(def);
    validateLevelData(level);
    const wordCount = level.clues.across.length + level.clues.down.length;
    console.log(
      `✓ [${globalLevelIndex}/409] ${level.id} (${level.title}) - ${wordCount} kata, grid: ${level.size.rows}x${level.size.cols}`
    );
    compiledPhase5.push(level);
  } catch (err) {
    console.error(`✗ Error on level ${def.id}:`, err.message);
    process.exit(1);
  }
}

const all409Levels = [...existingLevels.slice(0, 401), ...compiledPhase5];

fs.writeFileSync(levelsFilePath, JSON.stringify(all409Levels, null, 2), 'utf8');

console.log(`\n✓ Successfully compiled 409 levels into ${levelsFilePath}!`);
