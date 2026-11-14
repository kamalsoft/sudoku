import { getDb } from './database';
import type { SessionRecord } from '../sudoku/session';
import type { GameRecord } from '../sudoku/stats';

export async function loadSessionRaw(): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ data: string }>('SELECT data FROM active_session WHERE id = 1');
  return row?.data ?? null;
}

export async function saveSession(session: SessionRecord): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO active_session (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data',
    JSON.stringify(session),
  );
}

export async function clearSession(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM active_session WHERE id = 1');
}

export async function recordGame(game: GameRecord): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO game_history (difficulty, won, elapsed_ms, day, completed_at, daily, puzzle, mistakes, hints, stars) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    game.difficulty,
    game.won ? 1 : 0,
    Math.round(game.elapsedMs),
    game.day,
    new Date().toISOString(),
    game.daily ? 1 : 0,
    game.puzzle ?? null,
    game.mistakes ?? 0,
    game.hints ?? 0,
    game.stars ?? 0,
  );
}

export async function loadGames(): Promise<GameRecord[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{
    difficulty: GameRecord['difficulty'];
    won: number;
    elapsed_ms: number;
    day: string;
    daily: number;
    puzzle: string | null;
    mistakes: number;
    hints: number;
    stars: number;
    completed_at: string;
  }>('SELECT difficulty, won, elapsed_ms, day, daily, puzzle, mistakes, hints, stars, completed_at FROM game_history ORDER BY id');
  return rows.map((r) => ({
    difficulty: r.difficulty,
    won: r.won === 1,
    elapsedMs: r.elapsed_ms,
    day: r.day,
    daily: r.daily === 1,
    puzzle: r.puzzle ?? undefined,
    mistakes: r.mistakes,
    hints: r.hints,
    stars: r.stars,
    at: r.completed_at,
  }));
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM user_settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO user_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}
