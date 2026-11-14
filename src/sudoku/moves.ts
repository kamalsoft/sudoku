import type { BoardState } from './engine';

export type Mode = 'enter' | 'pencil' | 'erase';

const row = (i: number) => Math.floor(i / 9);
const col = (i: number) => i % 9;
const box = (i: number) => Math.floor(row(i) / 3) * 3 + Math.floor(col(i) / 3);

// True when two cells share a row, column or box (a cell counts as its own peer).
function sharesUnit(a: number, b: number): boolean {
  return row(a) === row(b) || col(a) === col(b) || box(a) === box(b);
}

// Returns a new board with the digit applied to the cell, or the same board if the move does not apply.
export function applyDigit(board: BoardState, index: number, mode: Mode, digit: number): BoardState {
  if (board.givens[index]) return board;
  const values = board.values.slice();
  const notes = board.notes.slice();

  if (mode === 'enter') {
    values[index] = digit;
    notes[index] = 0;
  } else if (mode === 'pencil') {
    if (values[index]) return board;
    notes[index] ^= 1 << (digit - 1);
  } else {
    return board;
  }
  return { ...board, values, notes };
}

export function applyErase(board: BoardState, index: number): BoardState {
  if (board.givens[index]) return board;
  const values = board.values.slice();
  const notes = board.notes.slice();
  values[index] = 0;
  notes[index] = 0;
  return { ...board, values, notes };
}

// Candidates for an empty cell: digits not already used in its row, column or box.
export function candidatesFor(values: number[], index: number): number {
  let used = 0;
  for (let i = 0; i < 81; i++) {
    if (values[i] && sharesUnit(i, index)) used |= 1 << (values[i] - 1);
  }
  return ~used & 0x1ff;
}

// Fills pencil marks in every empty cell with its candidates.
export function fillCandidates(board: BoardState): BoardState {
  const notes = board.notes.map((_, i) => (board.values[i] ? 0 : candidatesFor(board.values, i)));
  return { ...board, notes };
}

// Auto-notes: after a digit is placed, drop it from the pencil marks of cells that share a unit with it.
export function removeFromPeers(board: BoardState, index: number, digit: number): BoardState {
  const bit = 1 << (digit - 1);
  const notes = board.notes.map((note, i) => (sharesUnit(i, index) ? note & ~bit : note));
  return { ...board, notes };
}
