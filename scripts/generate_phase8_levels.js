import { generateLevelFromWords, validateLevelData } from './crossword-builder.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const phase8Levels = [
  // --- TEMA 52: KOSAKATA BAHASA INGGRIS MENENGAH (Bab 445–450) ---
  {
    id: 'level_445_tindakan_perubahan_intermediate',
    title: 'Tindakan & Perubahan Bahasa Inggris',
    category: 'Bahasa Inggris Menengah',
    words: [
      { answer: 'IMPROVE', clue: 'Kosakata bahasa Inggris untuk meningkatkan atau memperbaiki kualitas sesuatu' },
      { answer: 'DECIDE', clue: 'Kosakata bahasa Inggris untuk menetapkan sebuah pilihan atau memutuskan' },
      { answer: 'PROVIDE', clue: 'Kosakata bahasa Inggris untuk menyediakan, memasok, atau memberikan sesuatu' },
      { answer: 'MANAGE', clue: 'Kosakata bahasa Inggris untuk mengelola, mengatur, atau memimpin urusan' },
      { answer: 'EXPLAIN', clue: 'Kosakata bahasa Inggris untuk menerangkan atau menjelaskan suatu gagasan' },
      { answer: 'SUGGEST', clue: 'Kosakata bahasa Inggris untuk mengusulkan, menyarankan, atau menganjurkan ide' },
      { answer: 'CREATE', clue: 'Kosakata bahasa Inggris untuk membuat, melahirkan, atau menciptakan karya' },
    ],
  },
  {
    id: 'level_446_karakter_sifat_positif_english',
    title: 'Karakter & Sifat Positif Bahasa Inggris',
    category: 'Bahasa Inggris Menengah',
    words: [
      { answer: 'PATIENT', clue: 'Kosakata bahasa Inggris untuk sifat sabar dalam menghadapi cobaan dan waktu' },
      { answer: 'CONFIDENT', clue: 'Kosakata bahasa Inggris untuk sikap percaya diri dan mantap melangkah' },
      { answer: 'CURIOUS', clue: 'Kosakata bahasa Inggris untuk rasa ingin tahu yang besar terhadap wawasan' },
      { answer: 'SINCERE', clue: 'Kosakata bahasa Inggris untuk ketulusan hati yang ikhlas dan jujur' },
      { answer: 'CREATIVE', clue: 'Kosakata bahasa Inggris untuk daya cipta inovatif penuh ide segar' },
      { answer: 'GENEROUS', clue: 'Kosakata bahasa Inggris untuk sifat dermawan suka berbagi kepada sesama' },
      { answer: 'HONEST', clue: 'Kosakata bahasa Inggris untuk sifat lurus hati dan dapat dipercaya (jujur)' },
    ],
  },
  {
    id: 'level_447_dunia_pemikiran_diskusi_english',
    title: 'Dunia Pemikiran & Diskusi Bahasa Inggris',
    category: 'Bahasa Inggris Menengah',
    words: [
      { answer: 'OPINION', clue: 'Kosakata bahasa Inggris untuk pandangan pribadi atau opini seseorang' },
      { answer: 'EVIDENCE', clue: 'Kosakata bahasa Inggris untuk barang bukti penguat sebuah pernyataan' },
      { answer: 'REASON', clue: 'Kosakata bahasa Inggris untuk alasan atau latar belakang suatu tindakan' },
      { answer: 'SUMMARY', clue: 'Kosakata bahasa Inggris untuk ikhtisar ringkasan inti dari sebuah wacana' },
      { answer: 'ARGUMENT', clue: 'Kosakata bahasa Inggris untuk alasan sanggahan dalam sebuah perdebatan' },
      { answer: 'SOLUTION', clue: 'Kosakata bahasa Inggris untuk pemecahan masalah atau jalan keluar terbaik' },
      { answer: 'PURPOSE', clue: 'Kosakata bahasa Inggris untuk maksud tujuan atau sasaran yang ingin dicapai' },
    ],
  },
  {
    id: 'level_448_kebiasaan_hubungan_sosial_english',
    title: 'Kebiasaan & Hubungan Sosial Bahasa Inggris',
    category: 'Bahasa Inggris Menengah',
    words: [
      { answer: 'FRIEND', clue: 'Kosakata bahasa Inggris untuk kawan karib tempat berbagi suka dan duka' },
      { answer: 'HABIT', clue: 'Kosakata bahasa Inggris untuk kebiasaan perilaku yang dilakukan berulang kali' },
      { answer: 'ROUTINE', clue: 'Kosakata bahasa Inggris untuk rutinitas kegiatan harian yang teratur' },
      { answer: 'JOURNEY', clue: 'Kosakata bahasa Inggris untuk perjalanan petualangan mengarungi hidup' },
      { answer: 'RESPECT', clue: 'Kosakata bahasa Inggris untuk rasa hormat menghargai hak orang lain' },
      { answer: 'SUPPORT', clue: 'Kosakata bahasa Inggris untuk dukungan moril atau bantuan tenaga rekan' },
      { answer: 'SCHEDULE', clue: 'Kosakata bahasa Inggris untuk jadwal atau susunan alokasi waktu rencana' },
    ],
  },
  {
    id: 'level_449_kualitas_hasil_kerja_english',
    title: 'Kualitas & Hasil Kerja Bahasa Inggris',
    category: 'Bahasa Inggris Menengah',
    words: [
      { answer: 'QUALITY', clue: 'Kosakata bahasa Inggris untuk mutu keunggulan standar sebuah produk' },
      { answer: 'RESULT', clue: 'Kosakata bahasa Inggris untuk buah hasil akhir dari sebuah perjuangan kerja' },
      { answer: 'EFFORT', clue: 'Kosakata bahasa Inggris untuk ikhtiar pengerahan daya upaya sungguh-sungguh' },
      { answer: 'ABILITY', clue: 'Kosakata bahasa Inggris untuk kapasitas kecakapan atau kemampuan seseorang' },
      { answer: 'SUCCESS', clue: 'Kosakata bahasa Inggris untuk pencapaian impian dan keberhasilan karya' },
      { answer: 'CHALLENGE', clue: 'Kosakata bahasa Inggris untuk tantangan rintangan yang harus ditaklukkan' },
      { answer: 'OUTPUT', clue: 'Kosakata bahasa Inggris untuk jumlah keluaran hasil produksi barang kerja' },
    ],
  },
  {
    id: 'level_450_masa_depan_lingkungan_english',
    title: 'Masa Depan & Lingkungan Bahasa Inggris',
    category: 'Bahasa Inggris Menengah',
    words: [
      { answer: 'NATURE', clue: 'Kosakata bahasa Inggris untuk keasrian alam raya ciptaan semesta' },
      { answer: 'MODERN', clue: 'Kosakata bahasa Inggris untuk kemutakhiran zaman masa kini serba canggih' },
      { answer: 'FUTURE', clue: 'Kosakata bahasa Inggris untuk masa depan hari esok yang penuh harapan' },
      { answer: 'BALANCE', clue: 'Kosakata bahasa Inggris untuk keharmonisan dan keseimbangan hidup' },
      { answer: 'CLIMATE', clue: 'Kosakata bahasa Inggris untuk kondisi iklim cuaca bumi jangka panjang' },
      { answer: 'GLOBAL', clue: 'Kosakata bahasa Inggris untuk lingkup mendunia yang melintasi benua' },
      { answer: 'CULTURE', clue: 'Kosakata bahasa Inggris untuk kebudayaan dan adat istiadat suatu bangsa' },
    ],
  },

  // --- TEMA 53: MITOLOGI, KISAH KLASIK & LEGENDA DUNIA (Bab 451–457) ---
  {
    id: 'level_451_dewa_dewi_olympus_yunani',
    title: 'Dewa-Dewi Olympus Yunani Kuno',
    category: 'Mitologi Dunia',
    words: [
      { answer: 'ZEUS', clue: 'Raja para dewa penguasa langit petir dari puncak Gunung Olympus' },
      { answer: 'POSEIDON', clue: 'Dewa penguasa samudra bersejatakan trisula pengguncang bumi' },
      { answer: 'ATHENA', clue: 'Dewi kebijaksanaan, perang taktik, dan pelindung kota Athena' },
      { answer: 'PETIR', clue: 'Senjata kilatan guntur halilintar lambang keperkasaan Dewa Zeus' },
      { answer: 'TOMBAK', clue: 'Senjata trisula bermata tiga pusaka Dewa Penguasa Lautan Poseidon' },
      { answer: 'KUIL', clue: 'Bangunan megah pualam berpilar tempat pemujaan para dewa Olympus' },
      { answer: 'OLYMPUS', clue: 'Gunung suci tertinggi tempat bersemayamnya majelis para dewa Yunani' },
    ],
  },
  {
    id: 'level_452_mitologi_nordik_prajurit_valhalla',
    title: 'Mitologi Nordik & Prajurit Valhalla',
    category: 'Mitologi Dunia',
    words: [
      { answer: 'THOR', clue: 'Dewa petir gagah berani bersenjatakan palu perkasa penghalau raksasa' },
      { answer: 'ODIN', clue: 'Dewa tertinggi kebijaksanaan penguasa Asgard berteman sepasang gagak' },
      { answer: 'PALU', clue: 'Senjata pusaka Mjolnir milik Thor yang selalu kembali saat dilempar' },
      { answer: 'ASGARD', clue: 'Alam kahyangan megah tempat tinggal para dewa bangsa Asir Nordik' },
      { answer: 'VIKING', clue: 'Bangsa pelaut tangguh Skandinavia pengagum mitos para dewa Nordik' },
      { answer: 'VALHALLA', clue: 'Aula megah para ksatria pemberani yang gugur membela kehormatan' },
      { answer: 'KILAT', clue: 'Kilatan petir membelah angkasa pertanda amarah palu perkasa Thor' },
    ],
  },
  {
    id: 'level_453_legenda_para_dewa_mesir_kuno',
    title: 'Legenda Para Dewa Mesir Kuno',
    category: 'Mitologi Dunia',
    words: [
      { answer: 'ANUBIS', clue: 'Dewa berkepala serigala jakal penjaga timbangan hati alam baka' },
      { answer: 'OSIRIS', clue: 'Dewa penguasa alam baka lambang kebangkitan dan kesuburan tanah Nil' },
      { answer: 'PIRAMID', clue: 'Monumen batu makam megah firaun penjaga keabadian di tepi Sungai Nil' },
      { answer: 'SPHINX', clue: 'Patung raksasa berbadan singa berkepala manusia penjaga piramida' },
      { answer: 'FIRAUN', clue: 'Gelar raja penguasa Mesir kuno titisan Dewa Matahari penguasa Nil' },
      { answer: 'MAKAM', clue: 'Ruang bawah tanah berhias hieroglif tempat persemayaman sarkofagus' },
      { answer: 'SURYA', clue: 'Dewa matahari lambang sumber cahaya dan denyut kehidupan Mesir' },
    ],
  },
  {
    id: 'level_454_satwa_mitologi_sayap_kencana',
    title: 'Satwa Mitologi & Sayap Kencana',
    category: 'Mitologi Dunia',
    words: [
      { answer: 'GARUDA', clue: 'Burung mitologi perkasa tunggangan Dewa Wisnu lambang kehormatan' },
      { answer: 'NAGA', clue: 'Makhluk mitos reptil raksasa bertanduk penjaga mata air dan pusaka' },
      { answer: 'PEGASUS', clue: 'Kuda putih bersayap kencana yang mampu terbang melintasi awan' },
      { answer: 'PHOENIX', clue: 'Burung api legendaris yang bangkit terlahir kembali dari abu pembakaran' },
      { answer: 'SAYAP', clue: 'Kepakan helai bulu pembawa satwa mitologi membubung tinggi ke angkasa' },
      { answer: 'PUSAKA', clue: 'Benda keramat bertuah yang dijaga oleh kawanan makhluk mitologi' },
      { answer: 'SAKTI', clue: 'Kekuatan gaib luar biasa yang dimiliki oleh para satwa legenda' },
    ],
  },
  {
    id: 'level_455_ksatria_meja_bundar_pedang_legenda',
    title: 'Ksatria Meja Bundar & Pedang Legenda',
    category: 'Mitologi Dunia',
    words: [
      { answer: 'ARTHUR', clue: 'Raja ksatria legenda Britania pemilik pedang sakti Excalibur' },
      { answer: 'PEDANG', clue: 'Senjata tajam Excalibur yang terhunus dari batu oleh pewaris tahta' },
      { answer: 'KASTIL', clue: 'Benteng batu pertahanan megah Camelot tempat tinggal sang raja' },
      { answer: 'KSATRIA', clue: 'Prajurit berkuda pelindung rakyat yang bersumpah setia pada keadilan' },
      { answer: 'DANAU', clue: 'Air telaga tenang tempat bidadari mistis penguasa pedang Excalibur' },
      { answer: 'TAMENG', clue: 'Perisai besi baja pelindung dada ksatria dari tebasan senjata musuh' },
      { answer: 'RATU', clue: 'Pendamping setia raja penguasa istana ksatria Camelot' },
    ],
  },
  {
    id: 'level_456_cerita_rakyat_pahlawan_panah',
    title: 'Cerita Rakyat Pahlawan Panah',
    category: 'Mitologi Dunia',
    words: [
      { answer: 'ROBIN', clue: 'Pahlawan rakyat penunggang hutan Sherwood pembela kaum jelata' },
      { answer: 'PANAH', clue: 'Anak panah berbulu yang melesat tepat di titik tengah papan sasaran' },
      { answer: 'HUTAN', clue: 'Rimba rimbun tempat persembunyian komplotan ksatria busur panah' },
      { answer: 'BUSUR', clue: 'Alat pelontar kayu lentur bertali senar pelesat anak panah tajam' },
      { answer: 'ADIL', clue: 'Prinsip memperjuangkan kesetaraan rezeki bagi warga yang tertindas' },
      { answer: 'RAKYAT', clue: 'Masyarakat jelata desa yang dibantu oleh pahlawan hutan Sherwood' },
      { answer: 'TARGET', clue: 'Sasaran lingkaran bidikan tembakan panah yang tertembus tepat' },
    ],
  },
  {
    id: 'level_457_makhluk_mitos_pelindung_alam',
    title: 'Makhluk Mitos Pelindung Alam',
    category: 'Mitologi Dunia',
    words: [
      { answer: 'CENTAUR', clue: 'Makhluk mitos separuh manusia bertubuh kuda pengawal hutan rimba' },
      { answer: 'SIREN', clue: 'Bidadari laut bersuara merdu pemikat para pelaut pengarung karang' },
      { answer: 'PERI', clue: 'Makhluk halus bercahaya berparas rupawan penebar berkah kebaikan' },
      { answer: 'RAKSASA', clue: 'Makhluk berbadan tinggi besar penjaga gerbang gua pegunungan purba' },
      { answer: 'RIMBA', clue: 'Hutan belantara lebat tempat hidup damai kawanan makhluk mitologi' },
      { answer: 'KELANA', clue: 'Pengelana alam yang menjumpai keajaiban makhluk penjaga semesta' },
      { answer: 'POHON', clue: 'Pohon raksasa purba penyimpan rahasia kehidupan makhluk mitos' },
    ],
  },

  // --- TEMA 54: PENJELAJAHAN ANTARIKSA & MISI LUAR ANGKASA (Bab 458–464) ---
  {
    id: 'level_458_jejak_manusia_di_bulan_apollo',
    title: 'Jejak Manusia di Bulan Misi Apollo',
    category: 'Penjelajahan Antariksa',
    words: [
      { answer: 'APOLLO', clue: 'Program misi antariksa legendaris pendarat manusia pertama di Bulan' },
      { answer: 'BULAN', clue: 'Satelit alami bumi dengan permukaan berdebu putih kelabu kawah' },
      { answer: 'KAWAH', clue: 'Cekungan bundar di permukaan Bulan hasil hantaman meteorit purba' },
      { answer: 'JEJAK', clue: 'Bekas tapak sepatu astronaut di debu Bulan yang abadi tak terhapus' },
      { answer: 'MODUL', clue: 'Kapsul wahana antariksa pendarat astronot di dataran elok Bulan' },
      { answer: 'LANGKAH', clue: 'Lompatan kecil satu orang demi lompatan raksasa kemanusiaan' },
      { answer: 'ASTRONAUT', clue: 'Penerbang antariksa penjelajah ruang hampa udara di luar bumi' },
    ],
  },
  {
    id: 'level_459_laboratorium_mengorbit_stasiun_iss',
    title: 'Laboratorium Mengorbit Stasiun ISS',
    category: 'Penjelajahan Antariksa',
    words: [
      { answer: 'STASIUN', clue: 'Stasiun Luar Angkasa Internasional laboratorium bersama di orbit' },
      { answer: 'ORBIT', clue: 'Jalur lintasan mengitari bumi di ruang angkasa tanpa terjatuh' },
      { answer: 'GRAVITASI', clue: 'Gaya tarik bumi yang terasa nyaris lenyap di ruang orbit stasiun' },
      { answer: 'HAMPA', clue: 'Kondisi ruang angkasa yang sunyi senyap tanpa udara dan atmosfer' },
      { answer: 'PANEL', clue: 'Sayap panel surya penangkap sinar matahari pemasok listrik stasiun' },
      { answer: 'RISET', clue: 'Eksperimen ilmiah fisika dan biologi dalam kondisi tanpa bobot' },
      { answer: 'KABIN', clue: 'Ruang kerja dan tempat tidur mengambang bagi para kru stasiun angkasa' },
    ],
  },
  {
    id: 'level_460_robot_penjelajah_planet_mars',
    title: 'Robot Penjelajah Planet Merah Mars',
    category: 'Penjelajahan Antariksa',
    words: [
      { answer: 'MARS', clue: 'Planet terdekat keempat dari matahari dengan tanah gurun berwarna merah' },
      { answer: 'ROVER', clue: 'Mobil robotik penjelajah permukaan Mars beroda enam pembawa laboratorium' },
      { answer: 'KAMERA', clue: 'Lensa pengambil foto panoramik bentang alam kawah dan bukit pasir Mars' },
      { answer: 'TANAH', clue: 'Lapisan batuan regolit merah pengandung oksida besi di planet Mars' },
      { answer: 'ROBOT', clue: 'Mesin mandiri berpenggerak otomatis penerima sinyal perintah dari bumi' },
      { answer: 'SINYAL', clue: 'Gelombang radio pembawa data kiriman rover dari Mars menuju bumi' },
      { answer: 'SAMPEL', clue: 'Contoh butiran batuan dan tanah Mars yang dibor untuk diteliti' },
    ],
  },
  {
    id: 'level_461_baju_astronaut_berjalan_ruang_hampa',
    title: 'Baju Astronaut & Berjalan di Ruang Hampa',
    category: 'Penjelajahan Antariksa',
    words: [
      { answer: 'HELM', clue: 'Pelindung kepala astronaut berlapis emas penangkal silau radiasi matahari' },
      { answer: 'SELANG', clue: 'Pipa penyalur oksigen dan sirkulasi air pendingin di dalam baju angkasa' },
      { answer: 'TABUNG', clue: 'Silinder penyimpan cadangan gas oksigen pernapasan di punggung baju' },
      { answer: 'TALI', clue: 'Tambang penambat astronaut agar tidak hanyut melayang di luar stasiun' },
      { answer: 'LAPIS', clue: 'Bahan berlapis ganda penahan hantaman mikrometeorit ruang angkasa' },
      { answer: 'SARUNG', clue: 'Pelindung jari tangan tebal fleksibel untuk memegang perkakas stasiun' },
      { answer: 'TERAPUNG', clue: 'Sensasi melayang di ruang hampa akibat ketiadaan tarikan beban tubuh' },
    ],
  },
  {
    id: 'level_462_satelit_palapa_peluncuran_roket',
    title: 'Satelit Palapa & Peluncuran Roket',
    category: 'Penjelajahan Antariksa',
    words: [
      { answer: 'PALAPA', clue: 'Satelit komunikasi bersejarah pertama milik Indonesia di orbit geostasioner' },
      { answer: 'ROKET', clue: 'Wahana peluncur bertenaga dorong dahsyat penembus lapisan atmosfer' },
      { answer: 'SATELIT', clue: 'Benda buatan manusia pengorbit bumi penyiar sinyal komunikasi data' },
      { answer: 'LUNCUR', clue: 'Detik-detik pelepasan roket dari menara landasan menuju luar angkasa' },
      { answer: 'BUMI', clue: 'Planet biru rumah tinggal peradaban manusia yang dipantau dari orbit' },
      { answer: 'MISI', clue: 'Tugas ilmiah penjelajahan ruang angkasa yang dirancang bertahun-tahun' },
      { answer: 'MENARA', clue: 'Struktur penyangga tempat berdirinya roket sebelum bahan bakar dinyalakan' },
    ],
  },
  {
    id: 'level_463_mata_tajam_teleskop_antariksa',
    title: 'Mata Tajam Teleskop Antariksa',
    category: 'Penjelajahan Antariksa',
    words: [
      { answer: 'HUBBLE', clue: 'Teleskop legendaris di orbit bumi pemotret lahirnya galaksi purba' },
      { answer: 'CERMIN', clue: 'Reflektor pemantul cahaya cembung berlapisan emas pengumpul foton' },
      { answer: 'GALAKSI', clue: 'Gugusan raksasa ratusan miliar bintang terikat oleh tarikan gravitasi' },
      { answer: 'BINTANG', clue: 'Benda langit pemancar cahaya panas hasil fusi nuklir hidrogen' },
      { answer: 'POTRET', clue: 'Gambar citra berwarna nebula dan gugusan bintang karya teleskop' },
      { answer: 'LENSA', clue: 'Piranti optik pembesar benda-benda renik ruang angkasa yang jauh' },
      { answer: 'NEBULA', clue: 'Awan gas debu kosmik antariksa tempat terlahirnya bintang-bintang baru' },
    ],
  },
  {
    id: 'level_464_hujan_meteor_komet_pengelana',
    title: 'Hujan Meteor & Komet Pengelana',
    category: 'Penjelajahan Antariksa',
    words: [
      { answer: 'KOMET', clue: 'Bintang berekor bongkahan es dan debu pengelana tepian tata surya' },
      { answer: 'METEOR', clue: 'Batu angkasa yang menyala terang terbakar saat menembus atmosfer bumi' },
      { answer: 'EKOR', clue: 'Pancaran debu bercahaya komet yang selalu membelakangi arah matahari' },
      { answer: 'DEBU', clue: 'Partikel halus antariksa sisa pecahan komet pemicu hujan meteor fajar' },
      { answer: 'LINTAS', clue: 'Jalur elips lonjong peredaran komet mengelilingi pusat tata surya' },
      { answer: 'TERANG', clue: 'Kilatan garis cahaya fajar melintasi langit gelap malam hari' },
      { answer: 'HALLEY', clue: 'Komet termasyhur yang melintasi bumi secara berkala setiap 76 tahun' },
    ],
  },
];

console.log('Compiling Fase 3 of 500-level expansion: 20 Bab (Bab 445 to 464)...');

const levelsFilePath = path.join(__dirname, '../src/data/levels.json');
const existingLevels = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));

console.log(`Loaded ${existingLevels.length} existing levels.`);

const compiledPhase8 = [];

for (let i = 0; i < phase8Levels.length; i++) {
  const def = phase8Levels[i];
  const globalLevelIndex = 444 + i + 1; // Bab 445 to 464
  def.level = globalLevelIndex;
  try {
    const level = generateLevelFromWords(def);
    validateLevelData(level);
    const wordCount = level.clues.across.length + level.clues.down.length;
    console.log(
      `✓ [${globalLevelIndex}/464] ${level.id} (${level.title}) - ${wordCount} kata, grid: ${level.size.rows}x${level.size.cols}`
    );
    compiledPhase8.push(level);
  } catch (err) {
    console.error(`✗ Error on level ${def.id}:`, err.message);
    process.exit(1);
  }
}

const all464Levels = [...existingLevels.slice(0, 444), ...compiledPhase8];

fs.writeFileSync(levelsFilePath, JSON.stringify(all464Levels, null, 2), 'utf8');

console.log(`\n✓ Successfully compiled 464 levels into ${levelsFilePath}!`);
