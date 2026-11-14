import type { BoardState, Difficulty } from './engine';

export interface SessionRecord {
  difficulty: Difficulty;
  solution: number[];
  board: BoardState;
  accumulatedMs: number;
  timeLimitMs?: number | null;
  mistakes?: number;
  mistakeLimit?: number | null;
  daily?: string | null;
  // Undo and redo steps, kept across reloads. Only the most recent steps are saved.
  history?: { past: BoardState[]; future: BoardState[] };
}

// Undo steps kept in a saved session. Each step is a full board, so the list stays short.
export const SAVED_HISTORY_STEPS = 50;

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'evil'];

function isGrid(value: unknown, check: (n: unknown) => boolean): value is unknown[] {
  return Array.isArray(value) && value.length === 81 && value.every(check);
}

function isBoard(value: any): value is BoardState {
  return (
    isGrid(value?.values, (n) => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 9) &&
    isGrid(value?.givens, (b) => typeof b === 'boolean') &&
    isGrid(value?.notes, (n) => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 0x1ff)
  );
}

// Returns null for anything that is not a well-formed saved session, so a corrupt row starts a new game.
export function parseSession(raw: string): SessionRecord | null {
  let data: any;
  try {
    data = JSON.parse(raw);
  } catch {
    return null;
  }
  const { difficulty, solution, board, accumulatedMs } = data ?? {};
  const valid =
    DIFFICULTIES.includes(difficulty) &&
    isGrid(solution, (n) => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 9) &&
    isGrid(board?.values, (n) => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 9) &&
    isGrid(board?.givens, (b) => typeof b === 'boolean') &&
    isGrid(board?.notes, (n) => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 0x1ff) &&
    Number.isFinite(accumulatedMs) &&
    accumulatedMs >= 0 &&
    (data.timeLimitMs == null || (Number.isFinite(data.timeLimitMs) && data.timeLimitMs > 0)) &&
    (data.mistakes === undefined || (Number.isInteger(data.mistakes) && data.mistakes >= 0)) &&
    (data.mistakeLimit == null || (Number.isInteger(data.mistakeLimit) && data.mistakeLimit > 0)) &&
    (data.daily == null || typeof data.daily === 'string') &&
    (data.history === undefined ||
      (Array.isArray(data.history.past) &&
        Array.isArray(data.history.future) &&
        [...data.history.past, ...data.history.future].every(isBoard)));
  return valid ? (data as SessionRecord) : null;
}

// Time left in a timed game, never below zero.
export function remainingMs(limit: number, elapsed: number): number {
  return Math.max(0, limit - elapsed);
}

// Total play time: time banked while paused, plus time since the timer last started running.
export function elapsedMs(accumulated: number, runningSince: number | null, now: number): number {
  return accumulated + (runningSince === null ? 0 : Math.max(0, now - runningSince));
}
