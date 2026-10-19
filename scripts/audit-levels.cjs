const fs = require('fs');
const path = require('path');

const levels = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/levels.json'), 'utf8'));
console.log('Auditing total levels:', levels.length);

let totalWords = 0;
let parallelOverlaps = 0;
const realmCounts = {};

const categoryToRealm = {
  'Rumah': 'Keseharian & Rumah',
  'Kuliner': 'Kuliner & Cita Rasa',
  'Kota': 'Kota & Jelajah Daerah',
  'Bangunan': 'Bangunan & Ruang Publik',
  'Sifat': 'Sifat, Watak & Karakter',
  'Satwa': 'Satwa & Fauna Indonesia',
  'Profesi': 'Profesi & Karya Manusia',
  'Dolanan': 'Dolanan & Olahraga',
  'Transportasi': 'Transportasi & Mobilitas',
  'Alam': 'Bentang Alam & Semesta',
  'Teknologi': 'Teknologi & Gadget',
  'Hobi': 'Hobi & Kreativitas',
  'Musik': 'Musik, Nada & Irama',
  'Belanja': 'Belanja & Pasar Modern',
  'Kesehatan': 'Kesehatan & Kebugaran',
  'IPA': 'Ilmu Pengetahuan Alam',
  'IPS': 'Ilmu Pengetahuan Sosial',
  'PKN': 'Pendidikan Kewarganegaraan',
  'KataKerja': 'Kosakata: Kata Kerja',
  'KataSifat': 'Kosakata: Kata Sifat',
  'Ekonomi': 'Ekonomi Dasar & Finansial',
  'Hukum': 'Hukum, Aturan & Keadilan',
  'Politik': 'Politik & Tata Negara',
  'Antropologi': 'Antropologi & Peradaban',
  'Psikologi': 'Psikologi & Perilaku',
  'Astronomi': 'Astronomi & Tata Surya',
  'Geografi': 'Geografi & Bumi Pertiwi',
  'Sejarah': 'Sejarah & Jejak Peradaban',
  'Ekologi': 'Ekologi & Kelestarian Bumi',
  'Media': 'Komunikasi & Media Informasi',
  'Filosofi': 'Filsafat & Logika',
  'Fisika': 'Fisika Semesta & Energi',
  'Kimia': 'Kimia & Materi Alam',
  'Sejarah Dunia': 'Sejarah Peradaban Dunia',
  'Biologi Molekuler': 'Biologi Molekuler & Sel',
  'Matematika': 'Matematika & Geometri',
  'Nostalgia': 'Nostalgia Generasi 90 & 2000an',
  'Pop Culture': 'Pop Culture & Hiburan Dunia',
  'Ensiklopedia Dunia': 'Fakta Unik & Ensiklopedia Dunia',
  'Fakta Nusantara': 'Fakta Unik Nusantara & Tokoh',
  'Sastra & Bahasa': 'Sastra, Bahasa & Khazanah Kata',
  'Karir & Finansial': 'Karir, Dunia Kerja & Finansial Modern',
  'Agraria & Pangan': 'Agraria, Hayati & Pangan Nusantara',
  'Kriminologi': 'Kriminologi & Penegakan Keadilan',
};

levels.forEach((lvl, idx) => {
  const across = lvl.clues?.across || [];
  const down = lvl.clues?.down || [];
  totalWords += across.length + down.length;

  const realm = categoryToRealm[lvl.category] || 'Lainnya';
  realmCounts[realm] = (realmCounts[realm] || 0) + 1;

  // Format across clues with start row, col, length
  const formattedAcross = across.map(c => {
    const row = c.cells ? c.cells[0][0] : c.row;
    const col = c.cells ? c.cells[0][1] : c.col;
    return { answer: c.answer, row, col, len: c.answer.length };
  });

  const formattedDown = down.map(c => {
    const row = c.cells ? c.cells[0][0] : c.row;
    const col = c.cells ? c.cells[0][1] : c.col;
    return { answer: c.answer, row, col, len: c.answer.length };
  });

  // Check parallel adjacent across
  for (let i = 0; i < formattedAcross.length; i++) {
    for (let j = i + 1; j < formattedAcross.length; j++) {
      const a = formattedAcross[i];
      const b = formattedAcross[j];
      if (Math.abs(a.row - b.row) === 1) {
        const aStart = a.col, aEnd = a.col + a.len - 1;
        const bStart = b.col, bEnd = b.col + b.len - 1;
        if (Math.max(aStart, bStart) <= Math.min(aEnd, bEnd)) {
          parallelOverlaps++;
          console.log(`Violation in Bab ${lvl.level || idx + 1}: across ${a.answer} (r:${a.row}) vs ${b.answer} (r:${b.row})`);
        }
      }
    }
  }

  // Check parallel adjacent down
  for (let i = 0; i < formattedDown.length; i++) {
    for (let j = i + 1; j < formattedDown.length; j++) {
      const a = formattedDown[i];
      const b = formattedDown[j];
      if (Math.abs(a.col - b.col) === 1) {
        const aStart = a.row, aEnd = a.row + a.len - 1;
        const bStart = b.row, bEnd = b.row + b.len - 1;
        if (Math.max(aStart, bStart) <= Math.min(aEnd, bEnd)) {
          parallelOverlaps++;
          console.log(`Violation in Bab ${lvl.level || idx + 1}: down ${a.answer} (c:${a.col}) vs ${b.answer} (c:${b.col})`);
        }
      }
    }
  }
});

console.log('--- AUDIT RESULT ---');
console.log('Total Chapters:', levels.length);
console.log('Total Words (Clues):', totalWords);
console.log('Parallel Adjacent Overlaps (Target: 0):', parallelOverlaps);
console.log('Realm Breakdown:');
Object.entries(realmCounts).forEach(([r, count]) => {
  console.log(`  - ${r}: ${count} bab`);
});
