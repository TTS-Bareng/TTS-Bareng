/**
 * Merge Levels Script
 * Combines existing levels.json with levels_batch1.json, levels_batch2.json, levels_batch3.json
 */

import fs from 'fs';
import path from 'path';
import { validateLevelData } from './crossword-builder.js';

const levelsPath = path.resolve('src/data/levels.json');
const originalLevels = JSON.parse(fs.readFileSync(levelsPath, 'utf-8'));

console.log(`Original levels: ${originalLevels.length}`);

// Find all levels_batch*.json files dynamically
const dataFiles = fs.readdirSync(path.resolve('src/data'));
const batchFiles = dataFiles
  .filter(f => f.startsWith('levels_batch') && f.endsWith('.json'))
  .sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });

const allLevels = [];
const seenIds = new Set();

for (const bf of batchFiles) {
  const batchPath = path.resolve('src/data', bf);
  const batchLevels = JSON.parse(fs.readFileSync(batchPath, 'utf-8'));
  console.log(`Adding ${batchLevels.length} levels from ${bf}...`);
  for (const lvl of batchLevels) {
    if (seenIds.has(lvl.id)) {
      console.warn(`Duplicate ID ${lvl.id} skipped.`);
      continue;
    }
    validateLevelData(lvl);
    seenIds.add(lvl.id);
    allLevels.push(lvl);
  }
}

console.log(`Total merged levels: ${allLevels.length}`);

// Final validation of all levels
for (let i = 0; i < allLevels.length; i++) {
  const lvl = allLevels[i];
  validateLevelData(lvl);
  const wordCount = lvl.clues.across.length + lvl.clues.down.length;
  console.log(`${i + 1}. ${lvl.id} | ${lvl.title} | ${lvl.category} | ${wordCount} kata`);
}

fs.writeFileSync(levelsPath, JSON.stringify(allLevels, null, 2), 'utf-8');
console.log(`✓ Successfully updated ${levelsPath} with ${allLevels.length} chapters!`);
