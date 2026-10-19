import { generateLevelFromWords, validateLevelData } from './crossword-builder.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const phase4Levels = [
  // --- TEMA 43: AGRARIA, HAYATI & PANGAN NUSANTARA (Bab 393–397) ---
  {
    id: 'level_393_sawah_lumbung_padi',
    title: 'Sawah Menguning & Lumbung Padi',
    category: 'Agraria & Pangan',
    words: [
      { answer: 'PETANI', clue: 'Pahlawan pangan yang membajak sawah dan merawat tanaman padi' },
      { answer: 'CAPING', clue: 'Topi anyaman bambu berbentuk kerucut pelindung terik mentari' },
      { answer: 'PADI', clue: 'Tanaman pokok penghasil butir gabah sumber beras makanan utama' },
      { answer: 'TRAKTOR', clue: 'Mesin pembajak modern pengganti tenaga lembu di persawahan' },
      { answer: 'PANEN', clue: 'Musim memetik hasil jerih payah jerami dan gabah yang menguning' },
      { answer: 'SAWAH', clue: 'Hamparan petak tanah basah bertingkat tempat bertanam padi' },
      { answer: 'BERAS', clue: 'Bulir padi yang telah dikupas kulitnya dan siap ditanak jadi nasi' },
    ],
  },
  {
    id: 'level_394_peternakan_rakyat_hewan',
    title: 'Peternakan Rakyat & Hewan Piara',
    category: 'Agraria & Pangan',
    words: [
      { answer: 'SAPI', clue: 'Ternak ruminansia bertubuh besar penghasil daging dan susu murni' },
      { answer: 'KAMBING', clue: 'Hewan berkaki empat pemakan rumput dengan suara mengembik khas' },
      { answer: 'AYAM', clue: 'Unggas piaraan bertelur yang berkokok nyaring di pagi hari' },
      { answer: 'TELUR', clue: 'Sumber protein hewani berkulit cangkang hasil ternak unggas' },
      { answer: 'PERAH', clue: 'Proses memerah susu segar dari ambing ternak sapi perah sehat' },
      { answer: 'PAKAN', clue: 'Campuran rumput hijau konsentrat bergizi untuk asupan ternak' },
      { answer: 'KANDANG', clue: 'Bangunan tempat tinggal dan berlindung hewan ternak piaraan' },
    ],
  },
  {
    id: 'level_395_kekayaan_rimba_hutan_hujan',
    title: 'Kekayaan Rimba & Hutan Hujan Tropis',
    category: 'Agraria & Pangan',
    words: [
      { answer: 'JATI', clue: 'Pohon kayu keras bermutu tinggi yang tahan rayap dan bernilai mahal' },
      { answer: 'ROTAN', clue: 'Batang tanaman berduri lentur yang dianyam jadi kursi dan perabot' },
      { answer: 'KANOPI', clue: 'Lapisan tajuk dedaunan rindang paling atas di hutan lebat' },
      { answer: 'OKSIGEN', clue: 'Gas segar penopang napas kehidupan hasil fotosintesis pepohonan' },
      { answer: 'RIMBA', clue: 'Hutan belantara lebat tempat hidup aneka ragam satwa langka' },
      { answer: 'POHON', clue: 'Tumbuhan berkayu besar berdaun lebat penyejuk bumi dan penyerap air' },
      { answer: 'FLORA', clue: 'Kekayaan alam dunia tumbuh-tumbuhan khas suatu wilayah tertentu' },
    ],
  },
  {
    id: 'level_396_maritim_bahari_nelayan',
    title: 'Maritim Bahari & Nelayan Tradisional',
    category: 'Agraria & Pangan',
    words: [
      { answer: 'DERMAGA', clue: 'Tempat merapat dan bersandarnya perahu kapal penangkap ikan' },
      { answer: 'PERAHU', clue: 'Kendaraan air kayu nelayan pengarung ombak lautan nusantara' },
      { answer: 'JALA', clue: 'Jaring anyaman tali penangkap kawanan ikan di perairan laut' },
      { answer: 'KARANG', clue: 'Terumbu ekosistem bawah laut tempat bertelur aneka biota laut' },
      { answer: 'IKAN', clue: 'Hewan berinsang sumber protein omega tiga hasil tangkapan bahari' },
      { answer: 'OMBAK', clue: 'Gelombang air laut yang bergulung memecah di bibir pantai pasir' },
      { answer: 'PANTAI', clue: 'Batas pesisir pertemuan antara daratan dengan deburan ombak laut' },
    ],
  },
  {
    id: 'level_397_kebun_kopi_buah_tropis',
    title: 'Kebun Kopi & Buah Tropis Nusantara',
    category: 'Agraria & Pangan',
    words: [
      { answer: 'ROBUSTA', clue: 'Jenis biji kopi berkafein tinggi dengan citarasa pekat mantap' },
      { answer: 'DURIAN', clue: 'Raja buah tropis berduri tajam beraroma tajam dan berdaging legit' },
      { answer: 'MANGGA', clue: 'Buah manis harum berdaging kuning oranye segar saat musim panen' },
      { answer: 'SALAK', clue: 'Buah tropis berkulit sisik cokelat dengan daging renyah manis sepat' },
      { answer: 'ROASTING', clue: 'Proses memanggang biji kopi hijau hingga beraroma wangi semerbak' },
      { answer: 'AROMA', clue: 'Wangi harum semerbak seduhan kopi tubruk panas di pagi hari' },
      { answer: 'KEBUN', clue: 'Lahan budidaya tanaman buah hortikultura dan komoditas perkebunan' },
    ],
  },

  // --- TEMA 44: KRIMINOLOGI & PENEGAKAN KEADILAN (Bab 398–401) ---
  {
    id: 'level_398_kaca_pembesar_jejak_detektif',
    title: 'Kaca Pembesar & Jejak Detektif',
    category: 'Kriminologi',
    words: [
      { answer: 'SAKSI', clue: 'Orang yang melihat langsung kejadian perkara dan memberikan keterangan' },
      { answer: 'PETUNJUK', clue: 'Isyarat atau tanda penting yang mengarah pada penyingkapan rahasia' },
      { answer: 'MISTERI', clue: 'Teka-teki kejadian ganjil yang belum terpecahkan oleh akal' },
      { answer: 'KACA', clue: 'Lensa pembesar yang dipakai detektif meneliti benda renik di lokasi' },
      { answer: 'ALIBI', clue: 'Bukti keberadaan seseorang di tempat lain saat kejadian berlangsung' },
      { answer: 'KASUS', clue: 'Perkara atau peristiwa kejahatan yang sedang dalam proses penyelidikan' },
      { answer: 'JEJAK', clue: 'Tanda tapak kaki atau bekas yang ditinggalkan pelaku di tempat perkara' },
    ],
  },
  {
    id: 'level_399_penyelidikan_ilmiah_sidik_jari',
    title: 'Penyelidikan Ilmiah & Sidik Jari',
    category: 'Kriminologi',
    words: [
      { answer: 'FORENSIK', clue: 'Penerapan ilmu sains kedokteran untuk pembuktian perkara hukum' },
      { answer: 'BUKTI', clue: 'Barang atau fakta sah yang membuktikan kebenaran suatu dakwaan' },
      { answer: 'VISUM', clue: 'Laporan pemeriksaan medis forensik tertulis atas korban kejahatan' },
      { answer: 'ARSIP', clue: 'Kumpulan berkas dokumen catatan data perkara yang disimpan rapi' },
      { answer: 'SIDIK', clue: 'Guratan garis unik pada ujung jari tangan manusia penanda identitas' },
      { answer: 'TELITI', clue: 'Sikap cermat dan saksama dalam mengamati setiap rincian barang bukti' },
      { answer: 'FAKTA', clue: 'Kenyataan sebenarnya yang tidak terbantahkan oleh kebohongan' },
    ],
  },
  {
    id: 'level_400_ruang_pengadilan_palu_hakim',
    title: 'Ruang Pengadilan & Palu Hakim',
    category: 'Kriminologi',
    words: [
      { answer: 'HAKIM', clue: 'Pejabat peradilan yang memimpin sidang dan memutus perkara perkara' },
      { answer: 'JAKSA', clue: 'Aparatur penegak hukum yang bertindak sebagai penuntut umum perkara' },
      { answer: 'SIDANG', clue: 'Pertemuan majelis resmi di pengadilan mendengarkan keterangan saksi' },
      { answer: 'KEADILAN', clue: 'Sikap menempatkan sesuatu secara patut dan tidak berat sebelah' },
      { answer: 'VONIS', clue: 'Putusan akhir majelis hakim pengadilan berkekuatan hukum tetap' },
      { answer: 'PALU', clue: 'Ketukan martil pengadilan pertanda dibukanya atau ditutupnya sidang' },
      { answer: 'HUKUM', clue: 'Peraturan perundang-undangan resmi yang mengikat segenap warga' },
    ],
  },
  {
    id: 'level_401_etika_ketertiban_hukum_warga',
    title: 'Etika Ketertiban & Hukum Masyarakat',
    category: 'Kriminologi',
    words: [
      { answer: 'ATURAN', clue: 'Ketentuan tertulis petunjuk tata tertib yang wajib ditaati bersama' },
      { answer: 'DISIPLIN', clue: 'Kepatuhan yang sungguh-sungguh terhadap tata tertib yang berlaku' },
      { answer: 'DAMAI', clue: 'Suasana aman rukun sentosa tanpa perselisihan di lingkungan warga' },
      { answer: 'TERTIB', clue: 'Kondisi teratur rapi sesuai norma sopan santun kehidupan bermasyarakat' },
      { answer: 'NORMA', clue: 'Kaidah pegangan hidup yang dijunjung tinggi oleh masyarakat beradab' },
      { answer: 'WARGA', clue: 'Penduduk anggota masyarakat yang memiliki hak dan kewajiban bersama' },
      { answer: 'TAAT', clue: 'Sikap patuh dan setia menjalankan hukum tanpa harus diawasi paksa' },
    ],
  },
];

console.log('Compiling Fase 4: 9 Bab (Bab 393 to 401)...');

const levelsFilePath = path.join(__dirname, '../src/data/levels.json');
const existingLevels = JSON.parse(fs.readFileSync(levelsFilePath, 'utf8'));

console.log(`Loaded ${existingLevels.length} existing levels.`);

const compiledPhase4 = [];

for (let i = 0; i < phase4Levels.length; i++) {
  const def = phase4Levels[i];
  const globalLevelIndex = 392 + i + 1; // Bab 393 to 401
  def.level = globalLevelIndex;
  try {
    const level = generateLevelFromWords(def);
    validateLevelData(level);
    const wordCount = level.clues.across.length + level.clues.down.length;
    console.log(
      `✓ [${globalLevelIndex}/401] ${level.id} (${level.title}) - ${wordCount} kata, grid: ${level.size.rows}x${level.size.cols}`
    );
    compiledPhase4.push(level);
  } catch (err) {
    console.error(`✗ Error on level ${def.id}:`, err.message);
    process.exit(1);
  }
}

const all401Levels = [...existingLevels.slice(0, 392), ...compiledPhase4];

fs.writeFileSync(levelsFilePath, JSON.stringify(all401Levels, null, 2), 'utf8');

console.log(`\n✓ Successfully compiled 401 levels into ${levelsFilePath}!`);
