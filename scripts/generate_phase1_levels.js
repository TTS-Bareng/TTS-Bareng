import { generateLevelFromWords, validateLevelData } from './crossword-builder.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const phase1Levels = [
  // --- TEMA 37: NOSTALGIA GENERASI 90 & 2000an (Bab 361–366) ---
  {
    id: 'level_361_kartun_minggu_pagi',
    title: 'Kartun Minggu Pagi & Anime TV',
    category: 'Nostalgia',
    words: [
      { answer: 'DORAEMON', clue: 'Robot kucing masa depan dari abad ke-22 berkantong ajaib' },
      { answer: 'KARTUN', clue: 'Tontonan animasi favorit anak-anak di layar televisi' },
      { answer: 'PAGI', clue: 'Waktu penayangan serial animasi di hari minggu ceria' },
      { answer: 'ANIME', clue: 'Animasi khas negeri sakura Jepang yang digemari remaja' },
      { answer: 'BALING', clue: 'Alat terbang baling-baling bambu andalan Nobita' },
      { answer: 'KANTONG', clue: 'Tempat ajaib Doraemon menyimpan berbagai peralatan canggih' },
      { answer: 'LIBUR', clue: 'Hari minggu menyenangkan untuk bersantai menonton televisi' },
    ],
  },
  {
    id: 'level_362_era_warnet_game_online',
    title: 'Kejayaan Era Warnet & Game Online',
    category: 'Nostalgia',
    words: [
      { answer: 'WARNET', clue: 'Tempat sewa komputer dan internet bertarif per jam' },
      { answer: 'BILLING', clue: 'Program komputer pencatat durasi waktu pemakaian internet' },
      { answer: 'ONLINE', clue: 'Mode permainan multipemain terhubung jaringan maya' },
      { answer: 'CHAT', clue: 'Obrolan pesan instan era sembilan puluhan lewat mIRC' },
      { answer: 'DISKET', clue: 'Media penyimpan data magnetik jadul berkapasitas kecil' },
      { answer: 'KOMPUTER', clue: 'Perangkat meja tabung tebal di dalam bilik warnet' },
      { answer: 'MALAM', clue: 'Paket begadang murah di warnet dari malam hingga subuh' },
    ],
  },
  {
    id: 'level_363_rental_ps_game_konsol',
    title: 'Rental PS & Game Konsol Legendaris',
    category: 'Nostalgia',
    words: [
      { answer: 'RENTAL', clue: 'Tempat sewa bermain konsol video game favorit anak-anak' },
      { answer: 'STIK', clue: 'Alat pengendali permainan yang digenggam dua tangan' },
      { answer: 'MEMORI', clue: 'Kartu penyimpan berkas progres permainan agar tidak hilang' },
      { answer: 'KASET', clue: 'Cakram piringan game yang dimasukkan ke dalam mesin' },
      { answer: 'MAIN', clue: 'Aktivitas seru menantang teman bertanding sepak bola' },
      { answer: 'MENANG', clue: 'Hasil gembira berhasil mengalahkan skor lawan main' },
      { answer: 'PATUNGAN', clue: 'Mengumpulkan uang jajan bersama kawan demi sewa satu jam' },
    ],
  },
  {
    id: 'level_364_iklan_tv_jadul_jingle',
    title: 'Iklan TV Jadul & Jingle Terngiang',
    category: 'Nostalgia',
    words: [
      { answer: 'IKLAN', clue: 'Tayangan pariwara produk yang disiarkan di jeda acara televisi' },
      { answer: 'JINGLE', clue: 'Lagu pendek khas promosi yang selalu terngiang di ingatan' },
      { answer: 'SLOGAN', clue: 'Kalimat semboyan menarik pemikat perhatian pemirsa' },
      { answer: 'LAYAR', clue: 'Permukaan kaca tabung televisi tempat gambar bergerak tampil' },
      { answer: 'SIARAN', clue: 'Pancaran gelombang program acara ke seluruh pelosok tanah air' },
      { answer: 'PRODUK', clue: 'Barang dagangan sabun atau minuman yang dipromosikan' },
      { answer: 'HAFAL', clue: 'Kondisi ingat di luar kepala lirik lagu iklan yang sering tayang' },
    ],
  },
  {
    id: 'level_365_mainan_jadul_jajanan_sd',
    title: 'Mainan Jadul & Jajanan SD',
    category: 'Nostalgia',
    words: [
      { answer: 'TAMIYA', clue: 'Mobil balap mini empat roda berdinamo yang melaju di lintasan' },
      { answer: 'KELERENG', clue: 'Butiran kaca bulat bening aneka warna untuk adu bidik' },
      { answer: 'CHIKI', clue: 'Makanan ringan renyah berhadiah stiker atau tazos mainan' },
      { answer: 'PERMEN', clue: 'Gula-gula manis favorit pelekat lidah sepulang jam sekolah' },
      { answer: 'TAZOS', clue: 'Kepingan plastik bundar bergambar karakter untuk disusun' },
      { answer: 'JAJAN', clue: 'Membeli kudapan di gerobak abang penjual depan pagar sekolah' },
      { answer: 'LONCENG', clue: 'Bunyi tanda istirahat berdentang disambut sorak siswa' },
    ],
  },
  {
    id: 'level_366_lagu_hits_band_dua_ribu',
    title: 'Lagu Hits Band Indonesia 2000-an',
    category: 'Nostalgia',
    words: [
      { answer: 'BAND', clue: 'Grup musik beranggotakan vokalis, gitaris, dan penabuh drum' },
      { answer: 'LAGU', clue: 'Gubahan musik indah bersyair yang dinyanyikan penuh perasaan' },
      { answer: 'KASET', clue: 'Pita magnetik musik yang diputar dalam radio tape recorder' },
      { answer: 'VOKAL', clue: 'Suara merdu sang penyanyi utama pemikat hati pendengar' },
      { answer: 'GITAR', clue: 'Alat musik berdawai andalan pengiring petikan melodi pop' },
      { answer: 'ALBUM', clue: 'Kumpulan lagu rekaman yang dirilis resmi oleh grup musik' },
      { answer: 'HITS', clue: 'Lagu paling populer dan sering diputar di tangga radio' },
    ],
  },

  // --- TEMA 38: POP CULTURE & HIBURAN DUNIA (Bab 367–371) ---
  {
    id: 'level_367_film_box_office_ikonik',
    title: 'Film Box Office & Karakter Ikonik',
    category: 'Pop Culture',
    words: [
      { answer: 'BIOSKOP', clue: 'Gedung berlayar raksasa tempat pemutaran film-film perdana' },
      { answer: 'SEKUEL', clue: 'Film lanjutan penyambung kisah sukses karya sebelumnya' },
      { answer: 'HERO', clue: 'Sosok pahlawan pembela kebenaran pelindung warga kota' },
      { answer: 'AKTOR', clue: 'Pemeran watak yang menghidupkan tokoh dalam cerita sinema' },
      { answer: 'TIKET', clue: 'Tanda karcis masuk ruang teater tempat duduk bernomor' },
      { answer: 'KARPET', clue: 'Hamparan kain merah tempat para bintang berjalan di festival' },
      { answer: 'NONTON', clue: 'Duduk menyaksikan tayangan seru bersama sahabat terdekat' },
    ],
  },
  {
    id: 'level_368_seri_animasi_dan_komik',
    title: 'Seri Animasi & Komik Populer',
    category: 'Pop Culture',
    words: [
      { answer: 'KOMIK', clue: 'Cerita bergambar dalam buku yang disukai aneka kalangan' },
      { answer: 'PANEL', clue: 'Kotak bingkai pemisah adegan gambar pada halaman komik' },
      { answer: 'BALON', clue: 'Ruang lingkaran tempat teks percakapan tokoh dituliskan' },
      { answer: 'CERITA', clue: 'Alur kisah petualangan seru sang tokoh utama dari awal' },
      { answer: 'MANGA', clue: 'Sebutan komik gaya khas Jepang yang dibaca dari kanan' },
      { answer: 'TOKOH', clue: 'Figur rekaan utama penggerak seluruh rangkaian alur cerita' },
      { answer: 'GAMBAR', clue: 'Karya visual ilustrasi yang memperjelas suasana babak' },
    ],
  },
  {
    id: 'level_369_konser_musik_festival',
    title: 'Konser Musik & Panggung Festival',
    category: 'Pop Culture',
    words: [
      { answer: 'KONSER', clue: 'Pertunjukan musik langsung yang dihadiri ribuan penggemar' },
      { answer: 'PANGGUNG', clue: 'Area pentas tempat musisi beraksi di bawah sorot lampu' },
      { answer: 'SOROT', clue: 'Lampu panggung aneka warna pemeriah suasana pertunjukan' },
      { answer: 'PENONTON', clue: 'Kerumunan penggemar yang bernyanyi bersama sang idola' },
      { answer: 'TIKET', clue: 'Tiket gelang masuk gelanggang festival musik akbar' },
      { answer: 'MERDU', clue: 'Suara vokal indah yang menggetarkan sanubari hadirin' },
      { answer: 'SORAK', clue: 'Gemuruh teriakan kagum para penonton saat lagu pembuka' },
    ],
  },
  {
    id: 'level_370_tren_mode_gaya_pakaian',
    title: 'Tren Mode & Gaya Pakaian Populer',
    category: 'Pop Culture',
    words: [
      { answer: 'SNEAKERS', clue: 'Sepatu kasual beralas karet yang nyaman dipakai sehari-hari' },
      { answer: 'JAKET', clue: 'Pakaian luaran hangat penambah gaya saat bepergian santai' },
      { answer: 'TOPI', clue: 'Penutup kepala pelindung terik matahari sekaligus gaya' },
      { answer: 'WARNA', clue: 'Pilihan corak cerah atau netral pada paduan busana' },
      { answer: 'GAYA', clue: 'Penampilan khas seseorang yang mencerminkan rasa percaya diri' },
      { answer: 'KEMEJA', clue: 'Pakaian berkerah berkancing rapi untuk suasana semi formal' },
      { answer: 'CELANA', clue: 'Pakaian bawahan penutup kaki yang pas dan nyaman dikenakan' },
    ],
  },
  {
    id: 'level_371_komunitas_hobi_kreatif',
    title: 'Komunitas & Hobi Kreatif',
    category: 'Pop Culture',
    words: [
      { answer: 'KOMUNITAS', clue: 'Perkumpulan orang dengan minat dan kegemaran yang sama' },
      { answer: 'KOLEKSI', clue: 'Kumpulan benda hobi yang dikumpulkan dengan penuh dedikasi' },
      { answer: 'FANDOM', clue: 'Kelompok penggemar setia suatu karya atau figur idola' },
      { answer: 'KREATIF', clue: 'Daya cipta melahirkan karya unik di luar kebiasaan umum' },
      { answer: 'TEMAN', clue: 'Sahabat sehobi tempat bertukar cerita dan koleksi barang' },
      { answer: 'ACARA', clue: 'Kegiatan pameran atau pertemuan rutin antar penggemar' },
      { answer: 'KARYA', clue: 'Hasil ciptaan orisinal buatan tangan anggota komunitas' },
    ],
  },
];

console.log('Compiling Fase 1: 11 Bab (Bab 361 to 371)...');

const levelsFilePath = path.join(__dirname, '../src/data/levels.json');
const existingLevels = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));

console.log(`Loaded ${existingLevels.length} existing levels.`);

const compiledPhase1 = [];

for (let i = 0; i < phase1Levels.length; i++) {
  const def = phase1Levels[i];
  const globalLevelIndex = 360 + i + 1; // Bab 361 to 371
  def.level = globalLevelIndex;
  try {
    const level = generateLevelFromWords(def);
    validateLevelData(level);
    const wordCount = level.clues.across.length + level.clues.down.length;
    console.log(
      `✓ [${globalLevelIndex}/371] ${level.id} (${level.title}) - ${wordCount} kata, grid: ${level.size.rows}x${level.size.cols}`
    );
    compiledPhase1.push(level);
  } catch (err) {
    console.error(`✗ Error on level ${def.id}:`, err.message);
    process.exit(1);
  }
}

const all371Levels = [...existingLevels.slice(0, 360), ...compiledPhase1];

fs.writeFileSync(levelsFilePath, JSON.stringify(all371Levels, null, 2), 'utf8');

console.log(`\n✓ Successfully compiled 371 levels into ${levelsFilePath}!`);
