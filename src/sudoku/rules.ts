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

// Casual mode is a null limit: mistakes are counted but never end the game.
export function outOfMistakes(mistakes: number, limit: number | null): boolean {
  return limit !== null && mistakes >= limit;
}
