/**
 * Recompile All Batches Script
 * Recompiles all 23 batches (batch0 to batch22) with the new crossword optimizer.
 */

import fs from 'fs';
import path from 'path';
import { generateLevelFromWords, validateLevelData } from './crossword-builder.js';

const batches = [];
for (let i = 0; i <= 22; i++) {
  batches.push(`batch${i}`);
}

console.log(`Starting full recompilation of ${batches.length} batches...`);

let totalSuccess = 0;
let totalFailed = 0;

for (const batchName of batches) {
  const defsFilePath = path.resolve('scripts', `${batchName}_defs.json`);
  if (!fs.existsSync(defsFilePath)) {
    console.warn(`[WARN] Defs file missing: ${defsFilePath}`);
    continue;
  }

  const defs = JSON.parse(fs.readFileSync(defsFilePath, 'utf-8'));
  console.log(`\n--- Compiling ${batchName} (${defs.length} levels) ---`);

  const compiledLevels = [];

  for (const def of defs) {
    try {
      const level = generateLevelFromWords(def);
      validateLevelData(level);
      console.log(`  ✓ ${level.id} (${level.title}): ${level.clues.across.length + level.clues.down.length} kata, grid ${level.size.rows}x${level.size.cols}`);
      compiledLevels.push(level);
      totalSuccess++;
    } catch (err) {
      console.error(`  ✗ Error in ${def.id}:`, err.message);
      totalFailed++;
    }
  }

  const outFilePath = path.resolve('src/data', `levels_${batchName}.json`);
  fs.writeFileSync(outFilePath, JSON.stringify(compiledLevels, null, 2), 'utf-8');
}

console.log(`\nRecompilation complete! Success: ${totalSuccess}, Failed: ${totalFailed}`);
