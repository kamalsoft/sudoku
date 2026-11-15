import { CLUE_TARGETS } from './levels.ts';
import type { Difficulty } from './levels.ts';

// Board indices run 0..80, row-major. Values are 1..9, 0 means empty.

export { CLUE_TARGETS, LEVELS } from './levels.ts';
export type { Difficulty } from './levels.ts';

export type Rng = () => number;

export interface Puzzle {
  puzzle: number[];
  solution: number[];
}

// Pencil marks are 9-bit masks: bit (n - 1) set means candidate n.
export interface BoardState {
  values: number[];
  givens: boolean[];
  notes: number[];
}

export const ROW = Array.from({ length: 81 }, (_, i) => Math.floor(i / 9));
export const COL = Array.from({ length: 81 }, (_, i) => i % 9);
export const BOX = Array.from({ length: 81 }, (_, i) => Math.floor(ROW[i] / 3) * 3 + Math.floor(COL[i] / 3));

// All 27 groups (9 rows, 9 columns, 9 boxes) as lists of board indices.
const INDICES = Array.from({ length: 81 }, (_, i) => i);
export const UNITS: number[][] = [
  ...Array.from({ length: 9 }, (_, r) => INDICES.filter((i) => ROW[i] === r)),
  ...Array.from({ length: 9 }, (_, c) => INDICES.filter((i) => COL[i] === c)),
  ...Array.from({ length: 9 }, (_, b) => INDICES.filter((i) => BOX[i] === b)),
];

// Mulberry32: small seeded PRNG, so the same seed always gives the same puzzle (daily challenge).
export function createRng(seed: number): Rng {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], rng: Rng): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function popcount(mask: number): number {
  let n = 0;
  for (let m = mask; m; m &= m - 1) n++;
  return n;
}

// Returns a 9-bit mask per row, column and box with the digits already placed.
function usedMasks(values: number[]) {
  const rows = new Array<number>(9).fill(0);
  const cols = new Array<number>(9).fill(0);
  const boxes = new Array<number>(9).fill(0);
  for (let i = 0; i < 81; i++) {
    if (!values[i]) continue;
    const bit = 1 << (values[i] - 1);
    rows[ROW[i]] |= bit;
    cols[COL[i]] |= bit;
    boxes[BOX[i]] |= bit;
  }
  return { rows, cols, boxes };
}

// Counts solutions, stopping once `limit` is reached. Uses the fewest-candidates cell first.
export function countSolutions(values: number[], limit = 2): number {
  const grid = values.slice();
  const { rows, cols, boxes } = usedMasks(grid);
  let count = 0;

  const search = (): boolean => {
    let best = -1;
    let bestMask = 0;
    let bestCount = 10;
    for (let i = 0; i < 81; i++) {
      if (grid[i]) continue;
      const mask = ~(rows[ROW[i]] | cols[COL[i]] | boxes[BOX[i]]) & 0x1ff;
      const n = popcount(mask);
      if (n < bestCount) {
        best = i;
        bestMask = mask;
        bestCount = n;
        if (n === 0) return false;
      }
    }
    if (best === -1) return ++count >= limit;

    for (let d = 1; d <= 9; d++) {
      const bit = 1 << (d - 1);
      if (!(bestMask & bit)) continue;
      grid[best] = d;
      rows[ROW[best]] |= bit;
      cols[COL[best]] |= bit;
      boxes[BOX[best]] |= bit;
      const done = search();
      rows[ROW[best]] &= ~bit;
      cols[COL[best]] &= ~bit;
      boxes[BOX[best]] &= ~bit;
      grid[best] = 0;
      if (done) return true;
    }
    return false;
  };

  search();
  return count;
}

// Indices of filled cells that share a value with another cell in the same row, column or box.
export function findConflicts(values: number[]): boolean[] {
  const bad = new Array<boolean>(81).fill(false);
  for (const unit of UNITS) {
    for (let a = 0; a < unit.length; a++) {
      for (let b = a + 1; b < unit.length; b++) {
        const i = unit[a];
        const j = unit[b];
        if (values[i] && values[i] === values[j]) {
          bad[i] = true;
          bad[j] = true;
        }
      }
    }
  }
  return bad;
}

export function isSolved(values: number[], solution: number[]): boolean {
  return values.every((v, i) => v === solution[i]);
}

// Fills an empty grid with a random complete solution.
function randomSolution(rng: Rng): number[] {
  const grid = new Array<number>(81).fill(0);
  const { rows, cols, boxes } = usedMasks(grid);

  const fill = (i: number): boolean => {
    if (i === 81) return true;
    for (const d of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng)) {
      const bit = 1 << (d - 1);
      if (rows[ROW[i]] & bit || cols[COL[i]] & bit || boxes[BOX[i]] & bit) continue;
      grid[i] = d;
      rows[ROW[i]] |= bit;
      cols[COL[i]] |= bit;
      boxes[BOX[i]] |= bit;
      if (fill(i + 1)) return true;
      rows[ROW[i]] &= ~bit;
      cols[COL[i]] &= ~bit;
      boxes[BOX[i]] &= ~bit;
      grid[i] = 0;
    }
    return false;
  };

  fill(0);
  return grid;
}

// Removes cells in 180-degree symmetric pairs while the puzzle keeps a unique solution.
function carve(solution: number[], target: number, rng: Rng): number[] {
  const puzzle = solution.slice();
  const pairs = shuffle(Array.from({ length: 41 }, (_, i) => i), rng);
  let clues = 81;

  for (const i of pairs) {
    if (clues <= target) break;
    const j = 80 - i;
    if (!puzzle[i]) continue;
    const vi = puzzle[i];
    const vj = puzzle[j];
    puzzle[i] = 0;
    puzzle[j] = 0;
    if (countSolutions(puzzle, 2) === 1) {
      clues -= i === j ? 1 : 2;
    } else {
      puzzle[i] = vi;
      puzzle[j] = vj;
    }
  }
  return puzzle;
}

// Retries with a fresh solution if carving stalls above the target. Returns the sparsest puzzle found.
// shortcut: greedy symmetric carving stalls near 23-26 clues, so expert/evil can miss their targets; upgrade to a
// smarter removal order (or non-symmetric removal) if those targets must be hit exactly.
export function generatePuzzle(difficulty: Difficulty, rng: Rng = Math.random): Puzzle {
  const target = CLUE_TARGETS[difficulty];
  let best: Puzzle | null = null;
  let bestClues = 82;

  for (let attempt = 0; attempt < 20; attempt++) {
    const solution = randomSolution(rng);
    const puzzle = carve(solution, target, rng);
    const clues = puzzle.filter(Boolean).length;
    if (clues < bestClues) {
      best = { puzzle, solution };
      bestClues = clues;
    }
    if (clues <= target) break;
  }

  return best!;
}

export function createBoard(puzzle: number[]): BoardState {
  return {
    values: puzzle.slice(),
    givens: puzzle.map((v) => v !== 0),
    notes: new Array<number>(81).fill(0),
  };
}

// Returns the unique solution for a puzzle, or null when it has none (used to replay a saved puzzle).
export function solvePuzzle(values: number[]): number[] | null {
  // A puzzle with a duplicate digit has no solution, and searching for one would never finish.
  if (findConflicts(values).some(Boolean)) return null;
  const grid = values.slice();
  const { rows, cols, boxes } = usedMasks(grid);
  const search = (): boolean => {
    let best = -1;
    let bestMask = 0;
    let bestCount = 10;
    for (let i = 0; i < 81; i++) {
      if (grid[i]) continue;
      const mask = ~(rows[ROW[i]] | cols[COL[i]] | boxes[BOX[i]]) & 0x1ff;
      const n = popcount(mask);
      if (n < bestCount) {
        best = i;
        bestMask = mask;
        bestCount = n;
        if (n === 0) return false;
      }
    }
    if (best === -1) return true;
    for (let d = 1; d <= 9; d++) {
      const bit = 1 << (d - 1);
      if (!(bestMask & bit)) continue;
      grid[best] = d;
      rows[ROW[best]] |= bit;
      cols[COL[best]] |= bit;
      boxes[BOX[best]] |= bit;
      if (search()) return true;
      rows[ROW[best]] &= ~bit;
      cols[COL[best]] &= ~bit;
      boxes[BOX[best]] &= ~bit;
      grid[best] = 0;
    }
    return false;
  };
  return search() ? grid : null;
}
