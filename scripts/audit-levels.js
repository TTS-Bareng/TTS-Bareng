const fs = require('fs');
const path = require('path');

const levels = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/levels.json'), 'utf8'));
console.log('Auditing total levels:', levels.length);

let totalWords = 0;
let parallelOverlaps = 0;
const realmCounts = {};

const categoryToRealm = {
  // 1. Hayati
  'Hayati': 'Hayati',
  'Flora': 'Hayati',
  'Fauna': 'Hayati',
  'Alam': 'Hayati',
  'Satwa': 'Hayati',
  'Konservasi': 'Hayati',
  // 2. Bahari
  'Bahari': 'Bahari',
  'Maritim': 'Bahari',
  'Oseanografi': 'Bahari',
  'Pelayaran': 'Bahari',
  // 3. Sastra
  'Sastra': 'Sastra',
  'Linguistik': 'Sastra',
  'Puisi': 'Sastra',
  'Filologi': 'Sastra',
  'Bahasa': 'Sastra',
  // 4. Geologi
  'Geologi': 'Geologi',
  'Geografi': 'Geologi',
  'Vulkanologi': 'Geologi',
  'Bumi': 'Geologi',
  'Topografi': 'Geologi',
  // 5. Budaya
  'Budaya': 'Budaya',
  'Seni': 'Budaya',
  'Kriya': 'Budaya',
  'Tradisi': 'Budaya',
  'Arkeologi': 'Budaya',
  'Sejarah': 'Budaya',
  'Filosofi': 'Budaya',
  'Nalar': 'Budaya',
  'Arsitektur': 'Budaya',
  // 6. Sains
  'Sains': 'Sains',
  'Teknologi': 'Sains',
  'Astronomi': 'Sains',
  'Dirgantara': 'Sains',
  // 7. Rempah
  'Rempah': 'Rempah',
  'Agraria': 'Rempah',
  'Kuliner': 'Rempah',
  // 8. Mahakarya
  'Mahakarya': 'Mahakarya',
  'Epic': 'Mahakarya',
  'Mastery': 'Mahakarya',
};

levels.forEach((lvl) => {
  totalWords += lvl.clues.length;
  const realm = categoryToRealm[lvl.category] || 'Lainnya';
  realmCounts[realm] = (realmCounts[realm] || 0) + 1;

  // Check parallel adjacent overlaps
  const across = lvl.clues.filter(c => c.direction === 'across');
  const down = lvl.clues.filter(c => c.direction === 'down');

  for (let i = 0; i < across.length; i++) {
    for (let j = i + 1; j < across.length; j++) {
      const a = across[i];
      const b = across[j];
      if (Math.abs(a.row - b.row) === 1) {
        const aStart = a.col, aEnd = a.col + a.answer.length - 1;
        const bStart = b.col, bEnd = b.col + b.answer.length - 1;
        if (Math.max(aStart, bStart) <= Math.min(aEnd, bEnd)) {
          parallelOverlaps++;
          console.log(`Violation in Bab ${lvl.level}: across ${a.answer} (r:${a.row}) vs ${b.answer} (r:${b.row})`);
        }
      }
    }
  }

  for (let i = 0; i < down.length; i++) {
    for (let j = i + 1; j < down.length; j++) {
      const a = down[i];
      const b = down[j];
      if (Math.abs(a.col - b.col) === 1) {
        const aStart = a.row, aEnd = a.row + a.answer.length - 1;
        const bStart = b.row, bEnd = b.row + b.answer.length - 1;
        if (Math.max(aStart, bStart) <= Math.min(aEnd, bEnd)) {
          parallelOverlaps++;
          console.log(`Violation in Bab ${lvl.level}: down ${a.answer} (c:${a.col}) vs ${b.answer} (c:${b.col})`);
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
