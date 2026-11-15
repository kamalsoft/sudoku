import { getDb } from './database';
import type { SessionRecord } from '../sudoku/session';
import type { GameRecord } from '../sudoku/stats';

// Everything except the profile list and the active profile is kept per profile. The default profile uses the
// original keys, so data saved before profiles existed is still found.
let profile = 'default';
export function setProfile(id: string) {
  profile = id;
}

const scoped = (key: string, p: string) => (p === 'default' ? key : `${p}:${key}`);

export async function loadSessionRaw(): Promise<string | null> {
  const p = profile;
  const db = await getDb();
  const row = await db.getFirstAsync<{ data: string }>('SELECT data FROM profile_sessions WHERE profile = ?', p);
  return row?.data ?? null;
}

export async function saveSession(session: SessionRecord): Promise<void> {
  const p = profile;
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO profile_sessions (profile, data) VALUES (?, ?) ON CONFLICT(profile) DO UPDATE SET data = excluded.data',
    p,
    JSON.stringify(session),
  );
}

export async function clearSession(): Promise<void> {
  const p = profile;
  const db = await getDb();
  await db.runAsync('DELETE FROM profile_sessions WHERE profile = ?', p);
}

export async function recordGame(game: GameRecord): Promise<void> {
  const p = profile;
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO game_history (difficulty, won, elapsed_ms, day, completed_at, daily, puzzle, mistakes, hints, stars, profile, qualified) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
    p,
    game.qualified === false ? 0 : 1,
  );
}

export async function loadGames(): Promise<GameRecord[]> {
  const p = profile;
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
    qualified: number;
  }>(
    'SELECT difficulty, won, elapsed_ms, day, daily, puzzle, mistakes, hints, stars, completed_at, qualified FROM game_history WHERE profile = ? ORDER BY id',
    p,
  );
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
    qualified: r.qualified !== 0,
    at: r.completed_at,
  }));
}

export async function getSetting(key: string): Promise<string | null> {
  const k = scoped(key, profile);
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM user_settings WHERE key = ?', k);
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const k = scoped(key, profile);
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO user_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    k,
    value,
  );
}

// Settings that belong to the device, not to a profile (the profile list and which one is active).
export async function getGlobalSetting(key: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM user_settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setGlobalSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'INSERT INTO user_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value',
    key,
    value,
  );
}

// Removes everything saved for a profile: its games, its saved game and its settings.
// The default profile keeps the original, unprefixed setting keys, so those are removed by elimination.
export async function deleteProfileData(id: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM game_history WHERE profile = ?', id);
    await db.runAsync('DELETE FROM profile_sessions WHERE profile = ?', id);
    if (id === 'default') {
      await db.runAsync("DELETE FROM user_settings WHERE key NOT LIKE '%:%' AND key NOT IN ('profiles', 'activeProfile')");
    } else {
      await db.runAsync('DELETE FROM user_settings WHERE key LIKE ?', `${id}:%`);
    }
  });
}

// Clears one player's games and badge record. Their settings and any saved game stay.
export async function clearProfileStats(id: string): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM game_history WHERE profile = ?', id);
    await db.runAsync('DELETE FROM user_settings WHERE key = ?', id === 'default' ? 'seenBadges' : `${id}:seenBadges`);
  });
}

// Clears the games and badge records of every player. Settings and saved games stay.
export async function clearAllStats(): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM game_history');
    await db.runAsync("DELETE FROM user_settings WHERE key = 'seenBadges' OR key LIKE '%:seenBadges'");
  });
}
