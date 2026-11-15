import type { Difficulty } from './engine';

export interface GameRecord {
  difficulty: Difficulty;
  won: boolean;
  elapsedMs: number;
  day: string; // local calendar day, YYYY-MM-DD
  daily?: boolean;
  puzzle?: string; // 81 characters, 0 for empty; lets the game be replayed
  mistakes?: number;
  hints?: number;
  stars?: number;
  qualified?: boolean; // false when hints filled every empty square
  at?: string; // ISO time the game ended
}

export interface DifficultyStats {
  played: number;
  won: number;
  bestMs: number | null;
}

export interface Stats {
  played: number;
  won: number;
  winRate: number | null;
  streak: number;
  byDifficulty: Record<Difficulty, DifficultyStats>;
  dailyWins: number;
  dailyStreak: number;
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'evil'];

export function dayKey(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function previousDay(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

// Consecutive days with at least one win, counting back from today (or from yesterday if today has none yet).
export function streakAt(winDays: Set<string>, today: string): number {
  let cursor = winDays.has(today) ? today : previousDay(today);
  let streak = 0;
  while (winDays.has(cursor)) {
    streak++;
    cursor = previousDay(cursor);
  }
  return streak;
}

export function summarize(games: GameRecord[], today: string): Stats {
  const byDifficulty = Object.fromEntries(
    DIFFICULTIES.map((d) => [d, { played: 0, won: 0, bestMs: null } as DifficultyStats]),
  ) as Record<Difficulty, DifficultyStats>;

  for (const game of games) {
    const row = byDifficulty[game.difficulty];
    row.played++;
    if (game.won) {
      row.won++;
      // Only qualified wins set a best time.
      if (game.qualified !== false) {
        row.bestMs = row.bestMs === null ? game.elapsedMs : Math.min(row.bestMs, game.elapsedMs);
      }
    }
  }

  const played = games.length;
  const won = games.filter((g) => g.won).length;
  return {
    played,
    won,
    winRate: played === 0 ? null : won / played,
    streak: streakAt(new Set(games.filter((g) => g.won).map((g) => g.day)), today),
    byDifficulty,
    dailyWins: games.filter((g) => g.won && g.daily && g.qualified !== false).length,
    dailyStreak: streakAt(new Set(games.filter((g) => g.won && g.daily && g.qualified !== false).map((g) => g.day)), today),
  };
}

export function formatDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
