import { WINS_TO_UNLOCK, unlockedLevels } from './progress.ts';
import { LEVELS } from './levels.ts';
import type { Difficulty } from './levels.ts';
import type { GameRecord } from './stats';

// Which encouragement to show. The wording lives in i18n: kid_<kind> for Kid-safe mode, adult_<kind> otherwise.
export type MotivationKind = 'start' | 'wrong' | 'win' | 'win_assisted' | 'daily_win' | 'progress' | 'streak';

export const motivationKey = (kind: MotivationKind, kidSafe: boolean) => `${kidSafe ? 'kid' : 'adult'}_${kind}` as const;

// The next level still locked, and how many more qualified wins the player needs to unlock it.
export function nextLevelProgress(games: GameRecord[], levelUp: boolean): { level: Difficulty; wins: number } | null {
  if (!levelUp) return null;
  const open = unlockedLevels(games, true);
  const next = LEVELS.find((l) => !open.includes(l));
  if (!next) return null;
  const previous = LEVELS[LEVELS.indexOf(next) - 1];
  const wins = games.filter((g) => g.won && g.qualified !== false && !g.daily && g.difficulty === previous).length;
  return { level: next, wins: Math.max(1, WINS_TO_UNLOCK - wins) };
}
