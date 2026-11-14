import type { BoardState } from './engine';

export interface History {
  past: BoardState[];
  future: BoardState[];
}

const LIMIT = 200;

export const emptyHistory: History = { past: [], future: [] };

// Call before replacing the board: remembers the old state and drops any redo steps.
export function recordChange(history: History, before: BoardState): History {
  return { past: [...history.past.slice(-(LIMIT - 1)), before], future: [] };
}

export function undo(history: History, current: BoardState): { history: History; board: BoardState } | null {
  if (history.past.length === 0) return null;
  const board = history.past[history.past.length - 1];
  return { history: { past: history.past.slice(0, -1), future: [...history.future, current] }, board };
}

export function redo(history: History, current: BoardState): { history: History; board: BoardState } | null {
  if (history.future.length === 0) return null;
  const board = history.future[history.future.length - 1];
  return { history: { past: [...history.past, current], future: history.future.slice(0, -1) }, board };
}
