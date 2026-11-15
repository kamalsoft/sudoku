import { LEVELS } from './levels.ts';
import type { Difficulty } from './levels.ts';
import type { GameRecord } from './stats';
import { CHALLENGES } from '../challenges.ts';
export const WINS_TO_UNLOCK = 3;

// Level up: each level unlocks after WINS_TO_UNLOCK wins on the level before it. Daily games do not count.
// With Level up off, every level is open.
export function unlockedLevels(games: GameRecord[], levelUp: boolean): Difficulty[] {
  if (!levelUp) return [...LEVELS];
  const unlocked: Difficulty[] = [LEVELS[0]];
  for (let i = 0; i < LEVELS.length - 1; i++) {
    const wins = games.filter((g) => g.won && g.qualified !== false && !g.daily && g.difficulty === LEVELS[i]).length;
    if (wins < WINS_TO_UNLOCK) break;
    unlocked.push(LEVELS[i + 1]);
  }
  return unlocked;
}

// Stars for a win: start at three and lose one for each mistake or hint, never below one.
export function starsFor(mistakes: number, hints: number): number {
  return Math.max(1, 3 - mistakes - hints);
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

// Badges come from the saved history, so they are never lost and need no extra storage.
export function badges(games: GameRecord[], dailyStreak: number): Badge[] {
  const qualified = games.filter((g) => g.won && g.qualified !== false);
  const wins = qualified.length;
  const dailyWins = qualified.filter((g) => g.daily).length;
  const hardWin = qualified.some((g) => ['hard', 'expert', 'master', 'evil', 'genius'].includes(g.difficulty));
  const flawless = qualified.some((g) => g.mistakes === 0);
  const challengeIds = new Set(qualified.map((g) => g.challenge).filter(Boolean));
  const mediumOrHarder = (g: GameRecord) => LEVELS.indexOf(g.difficulty) >= LEVELS.indexOf('medium');
  const fastWin = (minutes: number) => qualified.some((g) => mediumOrHarder(g) && g.elapsedMs < minutes * 60_000);
  return [
    { id: 'first-win', title: 'First win', description: 'Finish your first puzzle.', unlocked: wins >= 1 },
    { id: 'five-wins', title: 'Five wins', description: 'Finish five puzzles.', unlocked: wins >= 5 },
    { id: 'ten-wins', title: 'Ten wins', description: 'Finish ten puzzles.', unlocked: wins >= 10 },
    { id: 'daily-star', title: 'Daily star', description: 'Finish a daily challenge.', unlocked: dailyWins >= 1 },
    { id: 'daily-streak', title: 'Three-day streak', description: 'Finish a daily challenge three days in a row.', unlocked: dailyStreak >= 3 },
    { id: 'flawless', title: 'Flawless', description: 'Finish a puzzle with no mistakes.', unlocked: flawless },
    { id: 'brave', title: 'Brave solver', description: 'Finish a Hard or harder puzzle.', unlocked: hardWin },
    { id: 'challenger', title: 'Challenger', description: 'Win a named challenge.', unlocked: challengeIds.size >= 1 },
    { id: 'quick-thinker', title: 'Quick thinker', description: 'Finish a Medium or harder puzzle in under 10 minutes.', unlocked: fastWin(10) },
    { id: 'speed-run', title: 'Speed run', description: 'Finish a Medium or harder puzzle in under 5 minutes.', unlocked: fastWin(5) },
    { id: 'lightning', title: 'Lightning', description: 'Finish a Medium or harder puzzle in under 3 minutes.', unlocked: fastWin(3) },
    { id: 'mission-control', title: 'Mission Control', description: 'Win every named challenge.', unlocked: CHALLENGES.every((c) => challengeIds.has(c.id)) },
  ];
}

export interface DaySummary {
  day: string;
  played: number;
  won: number;
  ms: number;
}

// The last seven local days, oldest first, for the parent summary. `today` is YYYY-MM-DD.
export function weekSummary(games: GameRecord[], today: string): DaySummary[] {
  const days: string[] = [];
  const base = new Date(`${today}T00:00:00Z`);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base);
    d.setUTCDate(base.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days.map((day) => {
    const mine = games.filter((g) => g.day === day);
    return {
      day,
      played: mine.length,
      won: mine.filter((g) => g.won).length,
      ms: mine.reduce((total, g) => total + g.elapsedMs, 0),
    };
  });
}
