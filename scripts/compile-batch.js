/**
 * Compile Batch Script
 * Usage: node scripts/compile-batch.js <batchName>
 * e.g.: node scripts/compile-batch.js batch1
 */

import fs from 'fs';
import path from 'path';
import { generateLevelFromWords, validateLevelData } from './crossword-builder.js';

const batchName = process.argv[2];
if (!batchName) {
  console.error('Usage: node scripts/compile-batch.js <batchName>');
  process.exit(1);
}

const defsFilePath = path.resolve('scripts', `${batchName}_defs.json`);
if (!fs.existsSync(defsFilePath)) {
  console.error(`File not found: ${defsFilePath}`);
  process.exit(1);
}

const defs = JSON.parse(fs.readFileSync(defsFilePath, 'utf-8'));
console.log(`Compiling ${defs.length} levels for ${batchName}...`);

const compiledLevels = [];

for (const def of defs) {
  try {
    const level = generateLevelFromWords(def);
    validateLevelData(level);
    console.log(`✓ Compiled level: ${level.id} (${level.title}) - ${level.clues.across.length + level.clues.down.length} kata, grid: ${level.size.rows}x${level.size.cols}`);
    compiledLevels.push(level);
  } catch (err) {
    console.error(`✗ Error compiling level ${def.id}:`, err.message);
    process.exit(1);
  }
}

const outFilePath = path.resolve('src/data', `levels_${batchName}.json`);
fs.writeFileSync(outFilePath, JSON.stringify(compiledLevels, null, 2), 'utf-8');
console.log(`Successfully written ${compiledLevels.length} levels to ${outFilePath}`);
