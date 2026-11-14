import * as SQLite from 'expo-sqlite';

let opening: Promise<SQLite.SQLiteDatabase> | null = null;

// One shared connection. Callers await each query, so writes never interleave (required on web).
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  opening ??= open();
  return opening;
}

async function open(): Promise<SQLite.SQLiteDatabase> {
  const db = await SQLite.openDatabaseAsync('sudoku.db');
  await db.execAsync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const version = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = version?.user_version ?? 0;
  if (current < 1) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        CREATE TABLE active_session (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL);
        CREATE TABLE game_history (
          id INTEGER PRIMARY KEY NOT NULL,
          difficulty TEXT NOT NULL,
          won INTEGER NOT NULL,
          elapsed_ms INTEGER NOT NULL,
          day TEXT NOT NULL,
          completed_at TEXT NOT NULL
        );
        CREATE TABLE user_settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
        PRAGMA user_version = 1;
      `);
    });
  }
  if (current < 2) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        ALTER TABLE game_history ADD COLUMN daily INTEGER NOT NULL DEFAULT 0;
        PRAGMA user_version = 2;
      `);
    });
  }
  return db;
}
