import type { BoardState, Difficulty } from './engine';

export interface SessionRecord {
  difficulty: Difficulty;
  solution: number[];
  board: BoardState;
  accumulatedMs: number;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'evil'];

function isGrid(value: unknown, check: (n: unknown) => boolean): value is unknown[] {
  return Array.isArray(value) && value.length === 81 && value.every(check);
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
    accumulatedMs >= 0;
  return valid ? (data as SessionRecord) : null;
}

// Total play time: time banked while paused, plus time since the timer last started running.
export function elapsedMs(accumulated: number, runningSince: number | null, now: number): number {
  return accumulated + (runningSince === null ? 0 : Math.max(0, now - runningSince));
}
