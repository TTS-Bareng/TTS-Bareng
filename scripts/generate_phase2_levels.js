import { generateLevelFromWords, validateLevelData } from './crossword-builder.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const phase2Levels = [
  // --- TEMA 39: FAKTA UNIK & ENSIKLOPEDIA DUNIA (Bab 372–377) ---
  {
    id: 'level_372_ibukota_negara_dunia',
    title: 'Ibukota Populer Negara Dunia',
    category: 'Ensiklopedia Dunia',
    words: [
      { answer: 'TOKYO', clue: 'Ibukota negara Jepang yang terkenal dengan kereta cepat Shinkansen' },
      { answer: 'PARIS', clue: 'Ibukota Prancis berjuluk kota mode tempat berdirinya Menara Eiffel' },
      { answer: 'LONDON', clue: 'Ibukota Inggris yang dilewati sungai Thames dan menara jam Big Ben' },
      { answer: 'KAIRO', clue: 'Ibukota Mesir kuno di tepi sungai Nil dekat piramida Giza' },
      { answer: 'ROMA', clue: 'Ibukota Italia pusat sejarah kekaisaran dan arena Colosseum' },
      { answer: 'SEOUL', clue: 'Ibukota Korea Selatan pusat budaya pop musik dan drama modern' },
      { answer: 'KOTA', clue: 'Pusat pemerintahan metropolitan tempat kedudukan para pemimpin' },
    ],
  },
  {
    id: 'level_373_rekor_alam_terbesar',
    title: 'Rekor Alam Terbesar & Terdalam',
    category: 'Ensiklopedia Dunia',
    words: [
      { answer: 'AMAZON', clue: 'Sungai beraliran air terbesar di dunia melintasi hutan lebat Brasil' },
      { answer: 'EVEREST', clue: 'Puncak gunung tertinggi di bumi menjulang di pegunungan Himalaya' },
      { answer: 'SAHARA', clue: 'Padang pasir gurun terluas di dunia beriklim panas di benua Afrika' },
      { answer: 'MARIANA', clue: 'Palung samudra terdalam di bumi terletak di Samudra Pasifik' },
      { answer: 'DANAU', clue: 'Genangan perairan air tawar luas dikelilingi oleh daratan' },
      { answer: 'LEMBAH', clue: 'Dataran rendah yang terbentang di antara kaki pegunungan tinggi' },
      { answer: 'ALAM', clue: 'Mahakarya bentang bumi yang menyimpan rekor keajaiban luar biasa' },
    ],
  },
  {
    id: 'level_374_penemuan_tak_sengaja',
    title: 'Penemuan Tak Sengaja Bersejarah',
    category: 'Ensiklopedia Dunia',
    words: [
      { answer: 'PENISILIN', clue: 'Obat antibiotik pembasmi bakteri temuan Alexander Fleming dari jamur' },
      { answer: 'GRAVITASI', clue: 'Gaya tarik bumi yang disadari Newton saat kejatuhan buah apel' },
      { answer: 'KOMPAS', clue: 'Penemuan jarum magnet penunjuk arah mata angin pelaut' },
      { answer: 'MIKRO', clue: 'Gelombang mikro pemanas makanan temuan tak sengaja dari radar' },
      { answer: 'RODA', clue: 'Penemuan bundar bergulir pengubah efisiensi angkutan zaman purba' },
      { answer: 'KACA', clue: 'Bahan bening yang ditemukan para pembuat tembikar dari lelehan pasir' },
      { answer: 'PENEMU', clue: 'Orang berjasa penemu gagasan baru yang bermanfaat bagi peradaban' },
    ],
  },
  {
    id: 'level_375_tradisi_unik_aneka_bangsa',
    title: 'Tradisi Unik Aneka Bangsa',
    category: 'Ensiklopedia Dunia',
    words: [
      { answer: 'FESTIVAL', clue: 'Pesta perayaan rakyat meriah memperingati tradisi budaya' },
      { answer: 'KARNAVAL', clue: 'Pawai kostum warna-warni turun ke jalan raya berhias musik' },
      { answer: 'TOPENG', clue: 'Penutup wajah artistik penyamar identitas dalam tarian ritual' },
      { answer: 'SALAM', clue: 'Ungkapan sapaan bersahabat saat menyapa orang dari budaya lain' },
      { answer: 'BUSANA', clue: 'Pakaian adat khas kebanggaan daerah yang dikenakan di upacara' },
      { answer: 'PENTAS', clue: 'Panggung pagelaran tempat seni tari tradisi ditampilkan' },
      { answer: 'RAMAH', clue: 'Sikap terbuka dan hangat menerima tamu dari negeri seberang' },
    ],
  },
  {
    id: 'level_376_landmark_tujuh_keajaiban',
    title: 'Landmark & 7 Keajaiban Dunia',
    category: 'Ensiklopedia Dunia',
    words: [
      { answer: 'PIRAMIDA', clue: 'Bangunan makam firaun dari susunan balok batu raksasa di Mesir' },
      { answer: 'TAJMAHAL', clue: 'Monumen makam marmer putih megah lambang cinta di tanah India' },
      { answer: 'KOLOSEUM', clue: 'Arena gelanggang amfiteater batu tempat pertarungan di Roma' },
      { answer: 'TEMBOK', clue: 'Benteng raksasa terpanjang di dunia pembatas perbatasan Tiongkok' },
      { answer: 'MENARA', clue: 'Bangunan menjulang tinggi pemandangan kota seperti di Pisa dan Paris' },
      { answer: 'CANDI', clue: 'Bangunan pemujaan batu purbakala bersejarah peninggalan leluhur' },
      { answer: 'MEGAH', clue: 'Sifat arsitektur bangunan yang agung dan memesona para pelancong' },
    ],
  },
  {
    id: 'level_377_misteri_fenomena_semesta',
    title: 'Misteri & Fenomena Semesta',
    category: 'Ensiklopedia Dunia',
    words: [
      { answer: 'AURORA', clue: 'Pendar cahaya hijau ungu memesona di langit kutub malam hari' },
      { answer: 'SEGITIGA', clue: 'Kawasan perairan Bermuda yang terkenal dengan kisah misterinya' },
      { answer: 'GERHANA', clue: 'Peristiwa terhalangnya cahaya matahari oleh bayangan bulan' },
      { answer: 'METEOR', clue: 'Benda langit berbatu yang melesat dan terbakar di atmosfer bumi' },
      { answer: 'FOSIL', clue: 'Jejak sisa tulang makhluk purba yang membatu jutaan tahun' },
      { answer: 'KOSMIK', clue: 'Segala sesuatu yang berkaitan dengan keluasan jagat raya raya' },
      { answer: 'BINTANG', clue: 'Benda angkasa berpijar terang penerang malam di angkasa luas' },
    ],
  },

  // --- TEMA 40: FAKTA UNIK NUSANTARA & WARISAN TOKOH (Bab 378–382) ---
  {
    id: 'level_378_rekor_geografis_nusantara',
    title: 'Rekor Geografis Zamrud Khatulistiwa',
    category: 'Fakta Nusantara',
    words: [
      { answer: 'KEPULAUAN', clue: 'Negara maritim dengan belasan ribu pulau tersebar dari Sabang' },
      { answer: 'TROPIS', clue: 'Zona iklim hangat khatulistiwa dengan curah hujan melimpah' },
      { answer: 'SELAT', clue: 'Perairan sempit penghubung antar pulau seperti Selat Sunda' },
      { answer: 'HUTAN', clue: 'Hamparan rimba hujan paru-paru bumi terluas ketiga di dunia' },
      { answer: 'GARIS', clue: 'Sabuk khatulistiwa penanda pembagi bumi belahan utara dan selatan' },
      { answer: 'PANTAI', clue: 'Pesisir terpanjang kedua di dunia dengan pasir putih memesona' },
      { answer: 'ZAMRUD', clue: 'Kiasan keindahan kepulauan hijau Indonesia di sabuk khatulistiwa' },
    ],
  },
  {
    id: 'level_379_tokoh_proklamator_bangsa',
    title: 'Tokoh Proklamator & Bapak Bangsa',
    category: 'Fakta Nusantara',
    words: [
      { answer: 'SOEKARNO', clue: 'Presiden pertama Republik Indonesia sang penyambung lidah rakyat' },
      { answer: 'HATTA', clue: 'Wakil presiden pertama proklamator pendamping Bung Karno' },
      { answer: 'KIHAJAR', clue: 'Tokoh bapak pendidikan nasional pendiri perguruan Tamansiswa' },
      { answer: 'KARTINI', clue: 'Tokoh emansipasi perempuan pejuang hak belajar putri bangsa' },
      { answer: 'SUDIRMAN', clue: 'Panglima besar jenderal pejuang perang gerilya kemerdekaan' },
      { answer: 'MERDEKA', clue: 'Pekik kebebasan kedaulatan bangsa terbebas dari penjajahan' },
      { answer: 'BANGSA', clue: 'Persatuan seluruh rakyat Indonesia dari berbagai suku daerah' },
    ],
  },
  {
    id: 'level_380_satwa_endemik_indonesia',
    title: 'Satwa Endemik Eksotis Indonesia',
    category: 'Fakta Nusantara',
    words: [
      { answer: 'KOMODO', clue: 'Kadal raksasa purba pemangsa yang hanya hidup di Nusa Tenggara' },
      { answer: 'BADAK', clue: 'Satwa cula satu langka yang dilindungi di taman Ujung Kulon' },
      { answer: 'ANOA', clue: 'Satwa kerdil bertanduk runcing endemik asli pulau Sulawesi' },
      { answer: 'ORANGUTAN', clue: 'Kera berbulu kemerahan yang cerdas penghuni hutan Kalimantan' },
      { answer: 'BURUNG', clue: 'Satwa cenderawasih burung surga berbulu indah dari tanah Papua' },
      { answer: 'LANGKA', clue: 'Kondisi satwa yang populasinya sedikit dan wajib dilindungi' },
      { answer: 'SUAKA', clue: 'Kawasan konservasi pelestarian alam tempat satwa hidup bebas' },
    ],
  },
  {
    id: 'level_381_candi_megah_situs_purbakala',
    title: 'Candi Megah & Situs Purbakala',
    category: 'Fakta Nusantara',
    words: [
      { answer: 'BOROBUDUR', clue: 'Candi Buddha terbesar di dunia berhias ribuan relief dan stupa' },
      { answer: 'PRAMBANAN', clue: 'Kompleks candi Hindu terindah di pulau Jawa lambang Roro Jonggrang' },
      { answer: 'SANGIRAN', clue: 'Situs kubah purbakala lembah fosil manusia purba di Jawa Tengah' },
      { answer: 'RELIEF', clue: 'Seni pahatan ukir dinding batu berkisah tentang sejarah peradaban' },
      { answer: 'STUPA', clue: 'Bangunan lonceng batu berongga pelindung arca di Borobudur' },
      { answer: 'BATU', clue: 'Balok andesit hitam kokoh perekat bangunan candi tanpa semen' },
      { answer: 'MEGAH', clue: 'Keagungan arsitektur warisan mahakarya leluhur bangsa Indonesia' },
    ],
  },
  {
    id: 'level_382_puspa_langka_rempah_alam',
    title: 'Puspa Langka & Khazanah Rempah',
    category: 'Fakta Nusantara',
    words: [
      { answer: 'RAFFLESIA', clue: 'Bunga raksasa padma raksasa langka tanpa akar dan batang' },
      { answer: 'CENGKIH', clue: 'Kuncup bunga rempah Maluku yang dicari pelaut dunia masa lampau' },
      { answer: 'PALA', clue: 'Biji rempah bernilai tinggi berpelindung fuli merah harum' },
      { answer: 'CENDANA', clue: 'Kayu wangi eksotis bahan minyak atsiri dari Nusa Tenggara' },
      { answer: 'MELATI', clue: 'Puspa bangsa beraroma semerbak suci penghias upacara adat' },
      { answer: 'WANGI', clue: 'Aroma harum semerbak khas yang dipancarkan bunga dan rempah' },
      { answer: 'REMPAH', clue: 'Kekayaan alam komoditas perdagangan utama Nusantara di jalur sutra' },
    ],
  },
];

console.log('Compiling Fase 2: 11 Bab (Bab 372 to 382)...');

const levelsFilePath = path.join(__dirname, '../src/data/levels.json');
const existingLevels = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));

console.log(`Loaded ${existingLevels.length} existing levels.`);

const compiledPhase2 = [];

for (let i = 0; i < phase2Levels.length; i++) {
  const def = phase2Levels[i];
  const globalLevelIndex = 371 + i + 1; // Bab 372 to 382
  def.level = globalLevelIndex;
  try {
    const level = generateLevelFromWords(def);
    validateLevelData(level);
    const wordCount = level.clues.across.length + level.clues.down.length;
    console.log(
      `✓ [${globalLevelIndex}/382] ${level.id} (${level.title}) - ${wordCount} kata, grid: ${level.size.rows}x${level.size.cols}`
    );
    compiledPhase2.push(level);
  } catch (err) {
    console.error(`✗ Error on level ${def.id}:`, err.message);
    process.exit(1);
  }
}

const all382Levels = [...existingLevels.slice(0, 371), ...compiledPhase2];

fs.writeFileSync(levelsFilePath, JSON.stringify(all382Levels, null, 2), 'utf8');

console.log(`\n✓ Successfully compiled 382 levels into ${levelsFilePath}!`);
