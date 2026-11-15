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
  if (current < 3) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        ALTER TABLE game_history ADD COLUMN puzzle TEXT;
        ALTER TABLE game_history ADD COLUMN mistakes INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE game_history ADD COLUMN hints INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE game_history ADD COLUMN stars INTEGER NOT NULL DEFAULT 0;
        PRAGMA user_version = 3;
      `);
    });
  }
  if (current < 4) {
    await db.withTransactionAsync(async () => {
      // One saved game per profile. The old single row moves to the default profile.
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS profile_sessions (profile TEXT PRIMARY KEY NOT NULL, data TEXT NOT NULL);
        INSERT OR IGNORE INTO profile_sessions (profile, data) SELECT 'default', data FROM active_session WHERE id = 1;
        ALTER TABLE game_history ADD COLUMN profile TEXT NOT NULL DEFAULT 'default';
        PRAGMA user_version = 4;
      `);
    });
  }
  if (current < 5) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        ALTER TABLE game_history ADD COLUMN qualified INTEGER NOT NULL DEFAULT 1;
        PRAGMA user_version = 5;
      `);
    });
  }
  if (current < 6) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(`
        ALTER TABLE game_history ADD COLUMN casual INTEGER NOT NULL DEFAULT 0;
        ALTER TABLE game_history ADD COLUMN challenge TEXT;
        PRAGMA user_version = 6;
      `);
    });
  }
  return db;
}
