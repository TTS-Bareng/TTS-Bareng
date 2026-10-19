/**
 * Crossword Builder & Validator Utility for TTS Bareng
 * Generates LevelData JSON with exact tiles, clue numbers, coordinates, and cell mappings.
 * Supports both auto-layout (backtracking solver) and explicit coordinate placement.
 */

function solveCrossword(words) {
  const sorted = [...words].sort((a, b) => b.answer.length - a.answer.length);

  function canPlace(placed, word, r, c, d) {
    const isAcross = d === 'across';
    const len = word.answer.length;
    let intersects = 0;

    // Check cell before word
    const beforeR = isAcross ? r : r - 1;
    const beforeC = isAcross ? c - 1 : c;
    if (placed.some(w => w.cells.some(([cr, cc]) => cr === beforeR && cc === beforeC))) return false;

    // Check cell after word
    const afterR = isAcross ? r : r + len;
    const afterC = isAcross ? c + len : c;
    if (placed.some(w => w.cells.some(([cr, cc]) => cr === afterR && cc === afterC))) return false;

    // STRICT RULE: No parallel adjacent words!
    // Across words cannot share adjacent rows (r and r+1) if their column spans overlap
    // Down words cannot share adjacent cols (c and c+1) if their row spans overlap
    for (const p of placed) {
      if (p.d === d) {
        if (isAcross && Math.abs(p.r - r) <= 1) {
          const colStart = Math.max(c, p.c);
          const colEnd = Math.min(c + len - 1, p.c + p.answer.length - 1);
          if (colStart <= colEnd) return false;
        }
        if (!isAcross && Math.abs(p.c - c) <= 1) {
          const rowStart = Math.max(r, p.r);
          const rowEnd = Math.min(r + len - 1, p.r + p.answer.length - 1);
          if (rowStart <= rowEnd) return false;
        }
      }
    }

    const newCells = [];
    for (let i = 0; i < len; i++) {
      const cr = isAcross ? r : r + i;
      const cc = isAcross ? c + i : c;
      const ch = word.answer[i];
      newCells.push([cr, cc]);

      // Check if this cell is occupied by any placed word
      for (const p of placed) {
        for (let j = 0; j < p.cells.length; j++) {
          const [pr, pc] = p.cells[j];
          if (pr === cr && pc === cc) {
            if (p.answer[j] !== ch) return false; // letter mismatch
            if (p.d === d) return false; // parallel overlap
            intersects++;
          }
        }
      }

      // Check orthogonal side touching (must not touch parallel word sides)
      const isCellIntersection = placed.some(p => p.cells.some(([pr, pc]) => pr === cr && pc === cc));
      if (!isCellIntersection) {
        const side1R = isAcross ? cr - 1 : cr;
        const side1C = isAcross ? cc : cc - 1;
        const side2R = isAcross ? cr + 1 : cr;
        const side2C = isAcross ? cc : cc + 1;
        if (
          placed.some(p =>
            p.cells.some(([pr, pc]) => (pr === side1R && pc === side1C) || (pr === side2R && pc === side2C))
          )
        ) {
          return false;
        }
      }
    }

    if (placed.length > 0 && intersects === 0) return false;
    return newCells;
  }

  function evaluateLayout(placed) {
    let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
    let totalIntersections = 0;
    const wordCrossCount = placed.map(() => 0);

    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        if (placed[i].d !== placed[j].d) {
          const hasCross = placed[i].cells.some(([r1, c1]) =>
            placed[j].cells.some(([r2, c2]) => r1 === r2 && c1 === c2)
          );
          if (hasCross) {
            totalIntersections++;
            wordCrossCount[i]++;
            wordCrossCount[j]++;
          }
        }
      }
    }

    placed.forEach(p => {
      p.cells.forEach(([r, c]) => {
        minR = Math.min(minR, r); maxR = Math.max(maxR, r);
        minC = Math.min(minC, c); maxC = Math.max(maxC, c);
      });
    });

    const rows = maxR - minR + 1;
    const cols = maxC - minC + 1;
    const area = rows * cols;
    const singleCross = wordCrossCount.filter(cnt => cnt <= 1).length;
    const acrossCount = placed.filter(p => p.d === 'across').length;
    const downCount = placed.filter(p => p.d === 'down').length;
    const dirBalance = Math.abs(acrossCount - downCount);
    const aspect = rows / cols;
    const aspectPenalty = (aspect < 0.55 || aspect > 1.8) ? 40 : 0;

    const score = (totalIntersections * 35) - (singleCross * 30) - (area * 0.7) - (dirBalance * 15) - aspectPenalty;
    return { score, totalIntersections, singleCross, rows, cols, area };
  }

  let bestLayout = null;
  let bestScore = -Infinity;

  const numStarts = Math.min(5, sorted.length);

  for (let startIdx = 0; startIdx < numStarts; startIdx++) {
    const startWord = sorted[startIdx];
    const remaining = sorted.filter((_, idx) => idx !== startIdx);
    const firstCells = [];
    for (let i = 0; i < startWord.answer.length; i++) firstCells.push([0, i]);

    let steps = 0;
    const maxSteps = 40000;

    function search(placed, rem) {
      if (++steps > maxSteps) return;

      if (rem.length === 0) {
        const ev = evaluateLayout(placed);
        if (ev.score > bestScore) {
          bestScore = ev.score;
          bestLayout = placed;
        }
        return;
      }

      for (let k = 0; k < rem.length; k++) {
        const nextWord = rem[k];
        const nextRem = rem.filter((_, idx) => idx !== k);

        for (const p of placed) {
          const nextD = p.d === 'across' ? 'down' : 'across';
          for (let j = 0; j < p.answer.length; j++) {
            for (let i = 0; i < nextWord.answer.length; i++) {
              if (p.answer[j] === nextWord.answer[i]) {
                const r = nextD === 'down' ? p.r - i : p.r + j;
                const c = nextD === 'down' ? p.c + j : p.c - i;
                const cells = canPlace(placed, nextWord, r, c, nextD);
                if (cells) {
                  search([...placed, { ...nextWord, r, c, d: nextD, cells }], nextRem);
                  // If we found an exceptionally good layout (singleCross <= 2 and high score), stop early
                  if (bestScore > 120 && rem.length <= 1) return;
                }
              }
            }
          }
        }
        if (k >= 2 && placed.length >= 4) break;
      }
    }

    search([{ ...startWord, r: 0, c: 0, d: 'across', cells: firstCells }], remaining);
  }

  // Fallback: If strict parallel adjacent prevented layout, try with slightly relaxed parallel check
  if (!bestLayout) {
    for (let startIdx = 0; startIdx < Math.min(3, sorted.length); startIdx++) {
      const startWord = sorted[startIdx];
      const remaining = sorted.filter((_, idx) => idx !== startIdx);
      const firstCells = [];
      for (let i = 0; i < startWord.answer.length; i++) firstCells.push([0, i]);

      let steps = 0;
      function fallbackSearch(placed, rem) {
        if (++steps > 20000) return;
        if (rem.length === 0) {
          const ev = evaluateLayout(placed);
          if (ev.score > bestScore) {
            bestScore = ev.score;
            bestLayout = placed;
          }
          return;
        }
        for (let k = 0; k < Math.min(rem.length, 3); k++) {
          const nextWord = rem[k];
          const nextRem = rem.filter((_, idx) => idx !== k);
          for (const p of placed) {
            const nextD = p.d === 'across' ? 'down' : 'across';
            for (let j = 0; j < p.answer.length; j++) {
              for (let i = 0; i < nextWord.answer.length; i++) {
                if (p.answer[j] === nextWord.answer[i]) {
                  const r = nextD === 'down' ? p.r - i : p.r + j;
                  const c = nextD === 'down' ? p.c + j : p.c - i;
                  const cells = canPlace(placed, nextWord, r, c, nextD);
                  if (cells) {
                    fallbackSearch([...placed, { ...nextWord, r, c, d: nextD, cells }], nextRem);
                    if (bestLayout) return;
                  }
                }
              }
            }
          }
        }
      }
      fallbackSearch([{ ...startWord, r: 0, c: 0, d: 'across', cells: firstCells }], remaining);
      if (bestLayout) break;
    }
  }

  return bestLayout;
}

export function generateLevelFromWords(levelDef) {
  const { id, title, category, words } = levelDef;

  // Determine if auto-layout is needed
  let placedList = words;
  const needsAutoLayout = words.some(w => w.r === undefined || w.c === undefined || w.d === undefined);

  if (needsAutoLayout) {
    const solved = solveCrossword(words);
    if (!solved) {
      throw new Error(`Failed to automatically solve crossword layout for level "${id}" (${title}). Check word letter intersections.`);
    }
    placedList = solved;
  }

  // 1. Place words into grid map
  const grid = new Map(); // "r,c" -> char
  const placedClues = [];

  for (const w of placedList) {
    const answer = w.answer.toUpperCase().trim();
    const isAcross = w.d === 'across';
    const cells = [];

    for (let i = 0; i < answer.length; i++) {
      const r = isAcross ? w.r : w.r + i;
      const c = isAcross ? w.c + i : w.c;
      const key = `${r},${c}`;
      const char = answer[i];

      if (grid.has(key) && grid.get(key) !== char) {
        throw new Error(
          `Conflict in level "${id}" at (${r},${c}): expected "${grid.get(key)}" but word "${answer}" has "${char}"`
        );
      }
      grid.set(key, char);
      cells.push([r, c]);
    }

    placedClues.push({
      direction: w.d,
      answer,
      text: w.clue,
      cells,
      startR: w.r,
      startC: w.c,
      length: answer.length,
    });
  }

  // 2. Normalize coordinates so minR = 0, minC = 0
  let minR = Infinity, minC = Infinity, maxR = -Infinity, maxC = -Infinity;
  for (const [key] of grid.entries()) {
    const [r, c] = key.split(',').map(Number);
    if (r < minR) minR = r;
    if (c < minC) minC = c;
    if (r > maxR) maxR = r;
    if (c > maxC) maxC = c;
  }

  const offsetR = minR < 0 ? -minR : (minR > 0 ? -minR : 0);
  const offsetC = minC < 0 ? -minC : (minC > 0 ? -minC : 0);

  const normalizedGrid = new Map();
  for (const [key, char] of grid.entries()) {
    const [r, c] = key.split(',').map(Number);
    normalizedGrid.set(`${r + offsetR},${c + offsetC}`, char);
  }

  for (const clue of placedClues) {
    clue.startR += offsetR;
    clue.startC += offsetC;
    clue.cells = clue.cells.map(([r, c]) => [r + offsetR, c + offsetC]);
  }

  maxR += offsetR;
  maxC += offsetC;
  const rows = maxR + 1;
  const cols = maxC + 1;

  // 3. Numbering according to standard crossword rules
  const cellNumbers = new Map();
  let currentNum = 1;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const startsAcross = placedClues.some(cl => cl.direction === 'across' && cl.startR === r && cl.startC === c);
      const startsDown = placedClues.some(cl => cl.direction === 'down' && cl.startR === r && cl.startC === c);

      if (startsAcross || startsDown) {
        cellNumbers.set(`${r},${c}`, currentNum);
        currentNum++;
      }
    }
  }

  // 4. Build ClueItems
  const acrossClues = [];
  const downClues = [];

  for (const clue of placedClues) {
    const startKey = `${clue.startR},${clue.startC}`;
    const num = cellNumbers.get(startKey);
    const id = `${clue.direction}_${num}`;

    const clueItem = {
      id,
      number: num,
      direction: clue.direction,
      text: clue.text,
      answer: clue.answer,
      cells: clue.cells,
      length: clue.length,
    };

    if (clue.direction === 'across') {
      acrossClues.push(clueItem);
    } else {
      downClues.push(clueItem);
    }
  }

  acrossClues.sort((a, b) => a.number - b.number);
  downClues.sort((a, b) => a.number - b.number);

  // 5. Build Tiles
  const tiles = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const key = `${r},${c}`;
      if (!normalizedGrid.has(key)) continue;

      const char = normalizedGrid.get(key);
      const num = cellNumbers.get(key) || null;

      const acrossClue = acrossClues.find(cl => cl.cells.some(([cr, cc]) => cr === r && cc === c));
      const downClue = downClues.find(cl => cl.cells.some(([cr, cc]) => cr === r && cc === c));

      tiles.push({
        r,
        c,
        answer: char,
        number: num,
        across: acrossClue ? acrossClue.id : null,
        down: downClue ? downClue.id : null,
      });
    }
  }

  const levelData = {
    id,
    title,
    category,
    size: { rows, cols },
    tiles,
    clues: {
      across: acrossClues,
      down: downClues,
    },
  };

  // 6. Validate
  validateLevelData(levelData);

  return levelData;
}

export function validateLevelData(level) {
  const cellLetters = new Map();
  for (const clue of level.clues.across) {
    for (let i = 0; i < clue.cells.length; i++) {
      const [r, c] = clue.cells[i];
      const key = `${r},${c}`;
      cellLetters.set(key, clue.answer[i]);
    }
  }

  for (const clue of level.clues.down) {
    for (let i = 0; i < clue.cells.length; i++) {
      const [r, c] = clue.cells[i];
      const key = `${r},${c}`;
      if (cellLetters.has(key) && cellLetters.get(key) !== clue.answer[i]) {
        throw new Error(`Crossing mismatch in level "${level.id}" at (${r},${c})`);
      }
      cellLetters.set(key, clue.answer[i]);
    }
  }

  for (const tile of level.tiles) {
    const key = `${tile.r},${tile.c}`;
    if (cellLetters.get(key) !== tile.answer) {
      throw new Error(`Tile answer mismatch in level "${level.id}" at (${tile.r},${tile.c})`);
    }
  }

  const allClues = [...level.clues.across, ...level.clues.down];
  if (allClues.length === 0) return;

  const cellToClues = new Map();
  for (const clue of allClues) {
    for (const [r, c] of clue.cells) {
      const key = `${r},${c}`;
      const existing = cellToClues.get(key) || [];
      existing.push(clue.id);
      cellToClues.set(key, existing);
    }
  }

  const clueAdjacency = new Map();
  for (const clue of allClues) {
    clueAdjacency.set(clue.id, new Set());
  }

  for (const clueIds of cellToClues.values()) {
    for (let i = 0; i < clueIds.length; i++) {
      for (let j = i + 1; j < clueIds.length; j++) {
        clueAdjacency.get(clueIds[i]).add(clueIds[j]);
        clueAdjacency.get(clueIds[j]).add(clueIds[i]);
      }
    }
  }

  const visited = new Set();
  const queue = [allClues[0].id];
  visited.add(allClues[0].id);

  while (queue.length > 0) {
    const curr = queue.shift();
    const neighbors = clueAdjacency.get(curr);
    if (neighbors) {
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push(n);
        }
      }
    }
  }

  if (visited.size !== allClues.length) {
    throw new Error(
      `Grid not fully connected in level "${level.id}": reached ${visited.size} of ${allClues.length} clues.`
    );
  }
}

export default {
  generateLevelFromWords,
  validateLevelData,
};
