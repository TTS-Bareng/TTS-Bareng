import { deriveTiles, type ClueItem, type LevelData } from './crossword';

export interface UserWordInput {
  word: string;
  clue: string;
}

interface PlacedWord {
  word: string;
  clue: string;
  direction: 'across' | 'down';
  row: number;
  col: number;
  cells: [number, number][];
}

/**
 * Generates a valid, solvable crossword layout from 3-8 user provided words and clues.
 */
export function generateCustomCrossword(
  title: string,
  category: string,
  inputs: UserWordInput[]
): LevelData {
  // 1. Sanitize and filter inputs
  const validInputs = inputs
    .map((item) => ({
      word: item.word.trim().toUpperCase().replace(/[^A-Z]/g, ''),
      clue: item.clue.trim(),
    }))
    .filter((item) => item.word.length >= 2 && item.clue.length > 0);

  if (validInputs.length === 0) {
    throw new Error('Masukkan minimal 3 kata dan petunjuk yang valid.');
  }

  // Sort longest first for better interlocking
  const sorted = [...validInputs].sort((a, b) => b.word.length - a.word.length);

  const gridLetters = new Map<string, string>(); // 'r,c' => 'A'
  const placed: PlacedWord[] = [];

  // Place first word horizontally at center
  const first = sorted[0];
  const firstCells: [number, number][] = [];
  for (let c = 0; c < first.word.length; c++) {
    const key = `10,${10 + c}`;
    gridLetters.set(key, first.word[c]);
    firstCells.push([10, 10 + c]);
  }
  placed.push({
    word: first.word,
    clue: first.clue,
    direction: 'across',
    row: 10,
    col: 10,
    cells: firstCells,
  });

  // Helper: check if a word can be placed at (r, c) in given direction
  const canPlace = (
    word: string,
    r: number,
    c: number,
    direction: 'across' | 'down'
  ): boolean => {
    let hasIntersection = false;

    // Check pre-word and post-word boundary cells
    const preKey = direction === 'across' ? `${r},${c - 1}` : `${r - 1},${c}`;
    const postKey =
      direction === 'across'
        ? `${r},${c + word.length}`
        : `${r + word.length},${c}`;
    if (gridLetters.has(preKey) || gridLetters.has(postKey)) return false;

    for (let i = 0; i < word.length; i++) {
      const curR = direction === 'across' ? r : r + i;
      const curC = direction === 'across' ? c + i : c;
      const key = `${curR},${curC}`;

      if (gridLetters.has(key)) {
        if (gridLetters.get(key) !== word[i]) {
          return false; // Conflicting letter
        }
        hasIntersection = true;
      } else {
        // Parallel neighbor cell collision check
        if (direction === 'across') {
          if (gridLetters.has(`${curR - 1},${curC}`) || gridLetters.has(`${curR + 1},${curC}`)) {
            return false;
          }
        } else {
          if (gridLetters.has(`${curR},${curC - 1}`) || gridLetters.has(`${curR},${curC + 1}`)) {
            return false;
          }
        }
      }
    }

    return hasIntersection;
  };

  // Place remaining words
  for (let wIdx = 1; wIdx < sorted.length; wIdx++) {
    const item = sorted[wIdx];
    let placedSuccess = false;

    // Try finding intersections with already placed words
    for (const prev of placed) {
      const targetDir: 'across' | 'down' = prev.direction === 'across' ? 'down' : 'across';

      for (let i = 0; i < item.word.length; i++) {
        const char = item.word[i];

        for (let j = 0; j < prev.word.length; j++) {
          if (prev.word[j] === char) {
            const startR =
              targetDir === 'down'
                ? prev.row - i
                : prev.row + j;
            const startC =
              targetDir === 'down'
                ? prev.col + j
                : prev.col - i;

            if (canPlace(item.word, startR, startC, targetDir)) {
              const cells: [number, number][] = [];
              for (let k = 0; k < item.word.length; k++) {
                const cellR = targetDir === 'down' ? startR + k : startR;
                const cellC = targetDir === 'down' ? startC : startC + k;
                gridLetters.set(`${cellR},${cellC}`, item.word[k]);
                cells.push([cellR, cellC]);
              }
              placed.push({
                word: item.word,
                clue: item.clue,
                direction: targetDir,
                row: startR,
                col: startC,
                cells,
              });
              placedSuccess = true;
              break;
            }
          }
        }
        if (placedSuccess) break;
      }
      if (placedSuccess) break;
    }

    // Fallback: If no clean intersection, place in a fresh parallel row with padding
    if (!placedSuccess) {
      let maxRow = 10;
      placed.forEach((p) => {
        p.cells.forEach(([r]) => {
          if (r > maxRow) maxRow = r;
        });
      });
      const fallbackR = maxRow + 2;
      const fallbackC = 10;
      const cells: [number, number][] = [];
      for (let k = 0; k < item.word.length; k++) {
        gridLetters.set(`${fallbackR},${fallbackC + k}`, item.word[k]);
        cells.push([fallbackR, fallbackC + k]);
      }
      placed.push({
        word: item.word,
        clue: item.clue,
        direction: 'across',
        row: fallbackR,
        col: fallbackC,
        cells,
      });
    }
  }

  // 2. Normalize Coordinates (Shift so minR = 0, minC = 0)
  let minR = Infinity;
  let maxR = -Infinity;
  let minC = Infinity;
  let maxC = -Infinity;

  for (const p of placed) {
    for (const [r, c] of p.cells) {
      if (r < minR) minR = r;
      if (r > maxR) maxR = r;
      if (c < minC) minC = c;
      if (c > maxC) maxC = c;
    }
  }

  // Shift all cells
  const normalizedPlaced = placed.map((p) => ({
    ...p,
    row: p.row - minR,
    col: p.col - minC,
    cells: p.cells.map(([r, c]) => [r - minR, c - minC] as [number, number]),
  }));

  // 3. Numbering system according to standard crossword conventions
  // Sort start cells by row asc, then col asc
  const startPoints = new Map<string, number>();
  let currentNum = 1;

  // Gather unique starting coords
  const uniqueStarts: { r: number; c: number }[] = [];
  normalizedPlaced.forEach((p) => {
    const key = `${p.row},${p.col}`;
    if (!startPoints.has(key)) {
      startPoints.set(key, 0);
      uniqueStarts.push({ r: p.row, c: p.col });
    }
  });

  uniqueStarts.sort((a, b) => a.r - b.r || a.c - b.c);
  uniqueStarts.forEach((pt) => {
    startPoints.set(`${pt.r},${pt.c}`, currentNum++);
  });

  const acrossClues: ClueItem[] = [];
  const downClues: ClueItem[] = [];

  normalizedPlaced.forEach((p, idx) => {
    const num = startPoints.get(`${p.row},${p.col}`) || idx + 1;
    const clueItem: ClueItem = {
      id: `${num}${p.direction === 'across' ? 'a' : 'd'}`,
      number: num,
      direction: p.direction,
      text: p.clue,
      answer: p.word,
      cells: p.cells,
      length: p.word.length,
    };

    if (p.direction === 'across') {
      acrossClues.push(clueItem);
    } else {
      downClues.push(clueItem);
    }
  });

  acrossClues.sort((a, b) => a.number - b.number);
  downClues.sort((a, b) => a.number - b.number);

  const clues = { across: acrossClues, down: downClues };
  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;

  return {
    id: `custom_${Date.now()}`,
    title: title.trim() || 'TTS Buatan Komunitas',
    category: category.trim() || 'Kreasi Pemain',
    size: { rows, cols },
    tiles: deriveTiles(clues),
    clues,
  };
}
