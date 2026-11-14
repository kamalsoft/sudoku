// Same seed for every device on the same local day, so the daily puzzle is shared without a server.
export function dailySeed(day: string): number {
  // FNV-1a over the day string.
  let hash = 0x811c9dc5;
  for (const ch of `daily-${day}`) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
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
