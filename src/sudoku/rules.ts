import { LEVELS } from './levels.ts';
import type { Difficulty } from './levels.ts';
import type { GameRecord } from './stats.ts';

// FNV-1a hash of a string, as an unsigned 32-bit number.
export function hashText(text: string): number {
  let hash = 0x811c9dc5;
  for (const ch of text) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

// Same seed for every device on the same local day, so the daily puzzle is shared without a server.
export function dailySeed(day: string): number {
  return hashText(`daily-${day}`);
}

// A mistake is a digit that differs from the solution. Clearing a cell does not undo one.
export function isMistake(solution: number[], index: number, digit: number): boolean {
  return digit !== solution[index];
}

// Cells to show in red: duplicates, plus any digit that differs from the solution.
export function markErrors(conflicts: boolean[], values: number[], solution: number[]): boolean[] {
  return conflicts.map((conflict, i) => conflict || (values[i] !== 0 && values[i] !== solution[i]));
}

// Casual mode is a null limit: mistakes are counted but never end the game.
export function outOfMistakes(mistakes: number, limit: number | null): boolean {
  return limit !== null && mistakes >= limit;
}

// Units (rows, columns, blocks) whose nine cells all hold the right digit. Pass the engine's UNITS list.
export function completedUnits(units: number[][], values: number[], solution: number[]): number[] {
  return units.flatMap((unit, u) => (unit.every((i) => values[i] !== 0 && values[i] === solution[i]) ? [u] : []));
}

// Names a unit for the player: units 0–8 are rows, 9–17 columns, 18–26 blocks.
export function unitLabel(u: number): string {
  if (u < 9) return `Row ${u + 1}`;
  if (u < 18) return `Column ${u - 8}`;
  return `Block ${u - 17}`;
}

// Kid-safe mode: mistakes never end a game and timed games are off. Settings keeps the stored choices.
export function guardedMistakeLimit(kidSafe: boolean, limit: number | null): number | null {
  return kidSafe ? null : limit;
}

export function guardedTimeLimit(kidSafe: boolean, limit: number | null): number | null {
  return kidSafe ? null : limit;
}

// Casual play (no mistake limit, Kid-safe included) stops at CASUAL_MAX_LEVEL and after CASUAL_DAILY_WINS wins a day.
// Everything else is open. Daily challenges are exempt from the daily cap.
export const CASUAL_MAX_LEVEL: Difficulty = 'medium';
export const CASUAL_DAILY_WINS = 5;

export function isCasual(kidSafe: boolean, mistakeLimit: number | null): boolean {
  return guardedMistakeLimit(kidSafe, mistakeLimit) === null;
}

export function casualWinsOn(games: GameRecord[], day: string): number {
  return games.filter((g) => g.won && g.casual && g.day === day).length;
}

export function levelAllowed(level: Difficulty, casual: boolean, casualWins: number): boolean {
  if (!casual) return true;
  return LEVELS.indexOf(level) <= LEVELS.indexOf(CASUAL_MAX_LEVEL) && casualWins < CASUAL_DAILY_WINS;
}

// A win is qualified (earns stars, badges, level and best-time credit) unless hints filled every empty square.
// A puzzle saved without its puzzle text counts as qualified.
export function hintsQualify(puzzle: string, hints: number): boolean {
  if (!puzzle) return true;
  const empties = puzzle.split('').filter((ch) => ch === '0').length;
  return hints < empties;
}
