export interface TileData {
  r: number;
  c: number;
  answer: string;
  number: number | null;
  across: string | null;
  down: string | null;
}

export interface ClueItem {
  id: string;
  number: number;
  direction: 'across' | 'down';
  text: string;
  answer: string;
  cells: [number, number][];
  length: number;
}

export interface RawLevelData {
  id: string;
  title: string;
  category?: string;
  size: {
    rows: number;
    cols: number;
  };
  tiles?: TileData[];
  clues: {
    across: ClueItem[];
    down: ClueItem[];
  };
}

export interface LevelData {
  id: string;
  title: string;
  category?: string;
  size: {
    rows: number;
    cols: number;
  };
  tiles: TileData[];
  clues: {
    across: ClueItem[];
    down: ClueItem[];
  };
}

/**
 * Derives normalized tile grid items dynamically from clue coordinates.
 * Eliminates >60% data redundancy from stored level JSON.
 */
export function deriveTiles(clues: { across: ClueItem[]; down: ClueItem[] }): TileData[] {
  const map = new Map<string, TileData>();

  for (const clue of clues.across) {
    for (let idx = 0; idx < clue.cells.length; idx++) {
      const [r, col] = clue.cells[idx];
      const key = `${r},${col}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          r,
          c: col,
          answer: clue.answer[idx] || '',
          number: idx === 0 ? clue.number : null,
          across: clue.id,
          down: null,
        });
      } else {
        existing.across = clue.id;
        if (idx === 0) existing.number = clue.number;
      }
    }
  }

  for (const clue of clues.down) {
    for (let idx = 0; idx < clue.cells.length; idx++) {
      const [r, col] = clue.cells[idx];
      const key = `${r},${col}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          r,
          c: col,
          answer: clue.answer[idx] || '',
          number: idx === 0 ? clue.number : null,
          across: null,
          down: clue.id,
        });
      } else {
        existing.down = clue.id;
        if (idx === 0) existing.number = clue.number;
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => a.r - b.r || a.c - b.c);
}

/**
 * Inflates a raw level object by deriving its complete tiles grid if missing.
 */
export function inflateLevel(raw: RawLevelData): LevelData {
  if (raw.tiles && raw.tiles.length > 0) {
    return raw as LevelData;
  }
  let cachedTiles: TileData[] | null = null;
  const obj = { ...raw } as LevelData;
  Object.defineProperty(obj, 'tiles', {
    enumerable: true,
    configurable: true,
    get() {
      if (!cachedTiles) {
        cachedTiles = deriveTiles(raw.clues);
      }
      return cachedTiles;
    },
  });
  return obj;
}

/**
 * Validates that every cell shared between intersecting across and down clues
 * contains the exact same letter.
 */
export function isCrossingValid(level: LevelData): boolean {
  const cellLetters = new Map<string, string>();

  // Collect all cell letters from across clues
  for (const clue of level.clues.across) {
    for (let i = 0; i < clue.cells.length; i++) {
      const [r, c] = clue.cells[i];
      const key = `${r},${c}`;
      const char = clue.answer[i];
      if (cellLetters.has(key) && cellLetters.get(key) !== char) {
        return false;
      }
      cellLetters.set(key, char);
    }
  }

  // Check and collect from down clues
  for (const clue of level.clues.down) {
    for (let i = 0; i < clue.cells.length; i++) {
      const [r, c] = clue.cells[i];
      const key = `${r},${c}`;
      const char = clue.answer[i];
      if (cellLetters.has(key) && cellLetters.get(key) !== char) {
        return false;
      }
      cellLetters.set(key, char);
    }
  }

  // Also verify against level.tiles
  for (const tile of level.tiles) {
    const key = `${tile.r},${tile.c}`;
    if (cellLetters.has(key) && cellLetters.get(key) !== tile.answer) {
      return false;
    }
  }

  return true;
}

/**
 * Validates that all clues in the level form a single connected graph
 * (i.e., every word intersects with at least one other word, and there are no orphan islands).
 */
export function isGridConnected(level: LevelData): boolean {
  const allClues = [...level.clues.across, ...level.clues.down];
  if (allClues.length === 0) return true;

  // Build adjacency graph of clues based on shared cells
  const cellToClues = new Map<string, string[]>();
  for (const clue of allClues) {
    for (const [r, c] of clue.cells) {
      const key = `${r},${c}`;
      const existing = cellToClues.get(key) || [];
      existing.push(clue.id);
      cellToClues.set(key, existing);
    }
  }

  const clueAdjacency = new Map<string, Set<string>>();
  for (const clue of allClues) {
    clueAdjacency.set(clue.id, new Set<string>());
  }

  for (const clueIds of cellToClues.values()) {
    for (let i = 0; i < clueIds.length; i++) {
      for (let j = i + 1; j < clueIds.length; j++) {
        clueAdjacency.get(clueIds[i])?.add(clueIds[j]);
        clueAdjacency.get(clueIds[j])?.add(clueIds[i]);
      }
    }
  }

  // BFS from first clue
  const visited = new Set<string>();
  const queue = [allClues[0].id];
  visited.add(allClues[0].id);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = clueAdjacency.get(curr);
    if (neighbors) {
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
  }

  return visited.size === allClues.length;
}

/**
 * Returns the array of [row, col] coordinates belonging to a specific clue.
 */
export function getWordCells(level: LevelData, clueId: string): [number, number][] {
  const clue =
    level.clues.across.find((c) => c.id === clueId) ||
    level.clues.down.find((c) => c.id === clueId);
  return clue ? clue.cells : [];
}

/**
 * Helper to find a clue by ID
 */
export function findClueById(level: LevelData, clueId: string | null): ClueItem | undefined {
  if (!clueId) return undefined;
  return (
    level.clues.across.find((c) => c.id === clueId) ||
    level.clues.down.find((c) => c.id === clueId)
  );
}
