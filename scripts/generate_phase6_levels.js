import { generateLevelFromWords, validateLevelData } from './crossword-builder.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const phase6Levels = [
  // --- TEMA 47: OLAHRAGA DUNIA & PESTA PRESTASI (Bab 410–417) ---
  {
    id: 'level_410_kejayaan_bulutangkis_allengland',
    title: 'Kejayaan Bulutangkis All England',
    category: 'Olahraga Dunia',
    words: [
      { answer: 'SMASH', clue: 'Pukulan tajam menukik keras mematikan ke bidang lawan' },
      { answer: 'RAKET', clue: 'Alat pemukul berdaun senar untuk olahraga bulutangkis' },
      { answer: 'JARING', clue: 'Pembatas tengah lapangan tempat bola atau kok melintas' },
      { answer: 'JUARA', clue: 'Pemenang peringkat pertama yang berhak meraih piala kehormatan' },
      { answer: 'KOK', clue: 'Bola bulu angsa bertangkai gabus dalam permainan bulutangkis' },
      { answer: 'GANDA', clue: 'Nomor tanding bulutangkis yang dimainkan berpasangan dua orang' },
      { answer: 'KAMPION', clue: 'Gelar juara nomor satu dalam ajang turnamen kejuaraan bergengsi' },
    ],
  },
  {
    id: 'level_411_panggung_megah_piala_dunia',
    title: 'Panggung Megah Piala Dunia Sepak Bola',
    category: 'Olahraga Dunia',
    words: [
      { answer: 'KIPER', clue: 'Pemain bertahan penjaga gawang yang boleh memakai sarung tangan' },
      { answer: 'WASIT', clue: 'Pengadil utama di lapangan peniup peluit pemutus pelanggaran' },
      { answer: 'PENALTI', clue: 'Tendangan bebas berjarak sebelas meter di depan gawang lawan' },
      { answer: 'STADION', clue: 'Arena lapangan megah bertribun tempat digelarnya laga sepak bola' },
      { answer: 'TROFI', clue: 'Piala emas lambang supremasi kehormatan juara piala dunia' },
      { answer: 'TANDUK', clue: 'Menyundul bola sepak menggunakan dahi kepala ke arah gawang' },
      { answer: 'OPERAN', clue: 'Umpan bola akurat kepada rekan satu tim untuk membangun serangan' },
    ],
  },
  {
    id: 'level_412_pesta_akbar_olimpiade_musim_panas',
    title: 'Pesta Akbar Olimpiade Musim Panas',
    category: 'Olahraga Dunia',
    words: [
      { answer: 'OBOR', clue: 'Api abadi yang diarak keliling dunia menuju kancah olimpiade' },
      { answer: 'MEDALI', clue: 'Tanda penghargaan logam emas, perak, dan perunggu bagi juara' },
      { answer: 'ATLET', clue: 'Olahragawan tangguh terlatih yang bertanding membela negara' },
      { answer: 'PODIUM', clue: 'Panggung bertingkat tempat berdiri para juara saat penyerahan medali' },
      { answer: 'REKOR', clue: 'Capaian prestasi angka atau waktu terbaik yang tercatat dalam sejarah' },
      { answer: 'SENAM', clue: 'Cabang olahraga kelenturan gerak tubuh dan artistik di olimpiade' },
      { answer: 'BANGSA', clue: 'Rombongan kontingen perwakilan negara saat defile pembukaan' },
    ],
  },
  {
    id: 'level_413_basket_nba_olahraga_bola_tangan',
    title: 'Basket NBA & Olahraga Bola Tangan',
    category: 'Olahraga Dunia',
    words: [
      { answer: 'DRIBEL', clue: 'Teknik memantul-mantulkan bola basket ke lantai sambil berlari' },
      { answer: 'RING', clue: 'Keranjang jaring sasaran tembakan bola basket untuk mencetak angka' },
      { answer: 'REBOUND', clue: 'Menangkap pantulan bola basket yang gagal masuk ke keranjang ring' },
      { answer: 'OPER', clue: 'Mengalirkan bola kepada kawan satu regu untuk menerobos lawan' },
      { answer: 'DUNK', clue: 'Aksi melompat tinggi menceploskan bola basket keras ke ring' },
      { answer: 'LEMPAR', clue: 'Aksi melontarkan bola dengan kedua tangan menuju keranjang sasaran' },
      { answer: 'TEMBAK', clue: 'Upaya melemparkan bola basket menuju ring demi meraih poin' },
    ],
  },
  {
    id: 'level_414_kecepatan_lintasan_atletik_lari',
    title: 'Kecepatan Lintasan Atletik & Lari',
    category: 'Olahraga Dunia',
    words: [
      { answer: 'SPRINT', clue: 'Lari cepat jarak pendek dengan kecepatan penuh sejak awal garis start' },
      { answer: 'ESTAFET', clue: 'Lari sambung beregu dengan memindahkan tongkat secara bergantian' },
      { answer: 'LINTASAN', clue: 'Jalur lari berlapis karet sintetis berwarna merah di stadion' },
      { answer: 'START', clue: 'Garis permulaan aba-aba tempat para pelari bersiap melesat' },
      { answer: 'FINISH', clue: 'Pita garis akhir penentu kemenangan pelari tercepat di lintasan' },
      { answer: 'CATAT', clue: 'Pencatatan waktu digital detik demi detik saat menembus garis akhir' },
      { answer: 'LARI', clue: 'Aktivitas gerak melangkah cepat melayang melintasi lintasan' },
    ],
  },
  {
    id: 'level_415_kebugaran_renang_olahraga_air',
    title: 'Kebugaran Renang & Olahraga Air',
    category: 'Olahraga Dunia',
    words: [
      { answer: 'GAYA', clue: 'Teknik renang seperti gaya dada, bebas, punggung, dan kupu-kupu' },
      { answer: 'DAYUNG', clue: 'Alat bilah kayu pengayuh perahu kano meluncur di air danau' },
      { answer: 'SELAM', clue: 'Menyelam ke dalam air mengenakan kacamata renang dan snorkel' },
      { answer: 'KOLAM', clue: 'Bak penampungan air buatan bergaris lintasan tempat adu renang' },
      { answer: 'DADA', clue: 'Gaya renang menyerupai katak berenang dengan kayuhan santai' },
      { answer: 'BEBAS', clue: 'Gaya renang kayuhan tangan memutar paling cepat di nomor lintasan' },
      { answer: 'NAPAS', clue: 'Teknik mengambil udara di permukaan air saat kepala menoleh' },
    ],
  },
  {
    id: 'level_416_stadion_arena_megah_bersejarah',
    title: 'Stadion & Arena Megah Bersejarah',
    category: 'Olahraga Dunia',
    words: [
      { answer: 'TRIBUN', clue: 'Deretan bangku bertingkat penonton mengitari arena stadion' },
      { answer: 'RUMPUT', clue: 'Hamparan hijau alami berstandar internasional tempat laga bola' },
      { answer: 'SORAK', clue: 'Gemuruh yel-yel dukungan riuh penonton yang membakar semangat' },
      { answer: 'MEGAH', clue: 'Ukuran kapasitas arsitektur stadion yang menampung puluhan ribu orang' },
      { answer: 'LAMPU', clue: 'Lampu sorot tiang raksasa penerang laga tanding malam hari di stadion' },
      { answer: 'KORIDOR', clue: 'Lorong jalan keluar masuk pemain dari ruang ganti menuju lapangan' },
      { answer: 'LAPANGAN', clue: 'Bidang tanah bergaris batas tempat berlangsungnya laga olahraga' },
    ],
  },
  {
    id: 'level_417_jiwa_sportivitas_fair_play',
    title: 'Jiwa Sportivitas & Fair Play',
    category: 'Olahraga Dunia',
    words: [
      { answer: 'SPORTIF', clue: 'Sikap kesatria mengakui keunggulan lawan dan taat aturan main' },
      { answer: 'HORMAT', clue: 'Sikap saling menghargai antarpemain dan wasit setelah laga tanding' },
      { answer: 'ATURAN', clue: 'Kaidah tata tertib pertandingan yang wajib ditaati segenap pemain' },
      { answer: 'ADIL', clue: 'Keputusan wasit juri yang objektif tanpa memihak salah satu kubu' },
      { answer: 'KAWAN', clue: 'Rekan satu tim yang bahu-membahu berjuang demi meraih kemenangan' },
      { answer: 'DISIPLIN', clue: 'Ketertiban berlatih keras dan konsisten demi mengasah keahlian' },
      { answer: 'SALAM', clue: 'Jabat tangan hangat antarpemain sebelum dan sesudah peluit akhir' },
    ],
  },

  // --- TEMA 48: WISATA, PELANCONGAN & PESONA NUSANTARA (Bab 418–424) ---
  {
    id: 'level_418_permata_timur_rajaampat_labuanbajo',
    title: 'Permata Timur Raja Ampat & Labuan Bajo',
    category: 'Wisata Nusantara',
    words: [
      { answer: 'PHINISI', clue: 'Perahu layar tradisional kayu khas Bugis lambang pelayaran bahari' },
      { answer: 'PULAU', clue: 'Gugusan daratan karang berhutan hijau dikelilingi laut toska' },
      { answer: 'KOMODO', clue: 'Kadal purba raksasa endemik penghuni cagar alam Nusa Tenggara Timur' },
      { answer: 'SNORKEL', clue: 'Pipa napas kacamata selam untuk mengamati keindahan terumbu karang' },
      { answer: 'KARANG', clue: 'Taman karang bawah laut tempat bermain kawanan ikan badut tropis' },
      { answer: 'DERMAGA', clue: 'Tempat merapatnya kapal wisata sebelum pelancong turun ke darat' },
      { answer: 'INDAH', clue: 'Pemandangan lanskap alam tropis yang memesona mata para pelancong' },
    ],
  },
  {
    id: 'level_419_keajaiban_danau_toba_samosir',
    title: 'Keajaiban Danau Toba & Pulau Samosir',
    category: 'Wisata Nusantara',
    words: [
      { answer: 'DANAU', clue: 'Hamparan perairan tawar vulkanik raksasa di dataran tinggi Sumatra' },
      { answer: 'SAMOSIR', clue: 'Pulau vulkanik yang bertengger di tengah perairan luas Danau Toba' },
      { answer: 'KALDERA', clue: 'Kawah runtuhan vulkanik raksasa hasil letusan dahsyat masa purba' },
      { answer: 'BATAK', clue: 'Suku asli berbudaya luhur penjaga kearifan tradisi di sekitar Toba' },
      { answer: 'ULOS', clue: 'Kain tenun tradisional Batak lambang kehangatan dan doa restu' },
      { answer: 'TEBING', clue: 'Dinding batu terjal menjulang tinggi membingkai perairan danau' },
      { answer: 'KAPAL', clue: 'Kapal feri penyeberangan warga dan wisatawan menuju pulau tengah' },
    ],
  },
  {
    id: 'level_420_lautan_pasir_bromo_kawah_ijen',
    title: 'Lautan Pasir Bromo & Api Abadi Ijen',
    category: 'Wisata Nusantara',
    words: [
      { answer: 'KAWAH', clue: 'Mulut gunung berapi yang mengepulkan asap belerang keputihan' },
      { answer: 'JEEP', clue: 'Mobil penggerak empat roda penjelajah hamparan lautan pasir Bromo' },
      { answer: 'SUNRISE', clue: 'Momen menanti terbitnya matahari fajar di ufuk bukit penanjakan' },
      { answer: 'BELERANG', clue: 'Mineral tambang kuning alami yang menyala biru di dasar Kawah Ijen' },
      { answer: 'PASIR', clue: 'Hamparan kaldera bisik berpasir hitam luas mengitari Bromo' },
      { answer: 'GUNUNG', clue: 'Bentang alam dataran tinggi bertengger megah berhawa sejuk dingin' },
      { answer: 'KUDA', clue: 'Tunggangan hewan peliharaan warga suku Tengger pemandu wisatawan' },
    ],
  },
  {
    id: 'level_421_harmoni_desa_adat_penglipuran_baduy',
    title: 'Harmoni Desa Adat Penglipuran & Baduy',
    category: 'Wisata Nusantara',
    words: [
      { answer: 'DESA', clue: 'Permukiman asri warga yang menjaga tata ruang dan kelestarian adat' },
      { answer: 'BAMBU', clue: 'Tanaman beruas yang menjadi dinding dan atap ramah lingkungan desa' },
      { answer: 'ASRI', clue: 'Suasana lingkungan bersih, hijau, tertata rapi, dan bebas polusi' },
      { answer: 'TRADISI', clue: 'Kebiasaan adat leluhur turun-temurun yang dipelihara dengan setia' },
      { answer: 'TENANG', clue: 'Kedamaian batin saat menyusuri gang desa tanpa hiruk-pikuk kendaraan' },
      { answer: 'LESTARI', clue: 'Kondisi alam dan kebudayaan yang terjaga utuh dari kepunahan' },
      { answer: 'WARGA', clue: 'Masyarakat desa yang ramah menyapa hangat para tamu pendatang' },
    ],
  },
  {
    id: 'level_422_warisan_geopark_unesco_indonesia',
    title: 'Warisan Geopark UNESCO Indonesia',
    category: 'Wisata Nusantara',
    words: [
      { answer: 'GEOPARK', clue: 'Taman bumi warisan geologi bernilai internasional yang dilindungi' },
      { answer: 'GRANIT', clue: 'Batuan beku keras raksasa yang bertaburan di pesisir pulau Belitung' },
      { answer: 'KARST', clue: 'Kawasan perbukitan batu kapur berongga gua alami di Maros Pangkep' },
      { answer: 'FOSIL', clue: 'Sisa jejak makhluk hidup purba yang membatu terawetkan di lapisan tanah' },
      { answer: 'GUA', clue: 'Lorong batuan alami di perut bumi yang dihiasi stalaktit menetes' },
      { answer: 'TEBING', clue: 'Dinding batuan vertikal menantang tempat pengamatan lapisan batuan' },
      { answer: 'ALAM', clue: 'Kekayaan bentang lingkungan ciptaan semesta yang tak ternilai' },
    ],
  },
  {
    id: 'level_423_menjelajah_pantai_pasir_putih_tropis',
    title: 'Menjelajah Pantai Pasir Putih Tropis',
    category: 'Wisata Nusantara',
    words: [
      { answer: 'OMBAK', clue: 'Gelombang air laut yang bergulung memecah buih di tepian pantai' },
      { answer: 'PASIR', clue: 'Hamparan butiran putih lembut tempat berjalan santai bertelanjang kaki' },
      { answer: 'KELAPA', clue: 'Pohon palem berdaun melambai peneduh semilir angin tepi pantai' },
      { answer: 'SENJA', clue: 'Pemandangan langit jingga keemasan saat mentari tenggelam di laut' },
      { answer: 'DERU', clue: 'Suara gemuruh hembusan angin laut berpadu dengan deburan ombak' },
      { answer: 'PANTAI', clue: 'Pesisir batas pertemuan daratan pasir dengan laut biru membentang' },
      { answer: 'KERANG', clue: 'Cangkang kalsium aneka bentuk yang terdampar di atas pasir putih' },
    ],
  },
  {
    id: 'level_424_berburu_kuliner_oleholeh_khas',
    title: 'Berburu Kuliner & Oleh-Oleh Khas',
    category: 'Wisata Nusantara',
    words: [
      { answer: 'BAKPIA', clue: 'Kue bulat panggang berisi kacang hijau manis khas Yogyakarta' },
      { answer: 'DODOL', clue: 'Penganan manis legit kenyal khas Garut berbahan tepung ketan dan gula' },
      { answer: 'KERIPIK', clue: 'Camilan renyah garing irisan singkong, pisang, atau apel' },
      { answer: 'KEMASAN', clue: 'Kotak bungkus rapi pelindung makanan cenderamata buah tangan' },
      { answer: 'PASAR', clue: 'Tempat bertemunya penjual dan pembeli aneka kerajinan serta camilan' },
      { answer: 'OLEH', clue: 'Buah tangan yang dibawa pulang untuk dibagikan kepada sanak saudara' },
      { answer: 'ASLI', clue: 'Citarasa otentik resep turun-temurun tanpa campuran bahan tiruan' },
    ],
  },
];

console.log('Compiling Fase 1 of 500-level expansion: 15 Bab (Bab 410 to 424)...');

const levelsFilePath = path.join(__dirname, '../src/data/levels.json');
const existingLevels = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));

console.log(`Loaded ${existingLevels.length} existing levels.`);

const compiledPhase6 = [];

for (let i = 0; i < phase6Levels.length; i++) {
  const def = phase6Levels[i];
  const globalLevelIndex = 409 + i + 1; // Bab 410 to 424
  def.level = globalLevelIndex;
  try {
    const level = generateLevelFromWords(def);
    validateLevelData(level);
    const wordCount = level.clues.across.length + level.clues.down.length;
    console.log(
      `✓ [${globalLevelIndex}/424] ${level.id} (${level.title}) - ${wordCount} kata, grid: ${level.size.rows}x${level.size.cols}`
    );
    compiledPhase6.push(level);
  } catch (err) {
    console.error(`✗ Error on level ${def.id}:`, err.message);
    process.exit(1);
  }
}

const all424Levels = [...existingLevels.slice(0, 409), ...compiledPhase6];

fs.writeFileSync(levelsFilePath, JSON.stringify(all424Levels, null, 2), 'utf8');

console.log(`\n✓ Successfully compiled 424 levels into ${levelsFilePath}!`);
