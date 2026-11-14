import { test } from 'node:test';
import assert from 'node:assert/strict';
import { badges, starsFor, unlockedLevels } from './progress.ts';
import type { GameRecord } from './stats.ts';

function win(difficulty: GameRecord['difficulty'], extra: Partial<GameRecord> = {}): GameRecord {
  return { difficulty, won: true, elapsedMs: 1000, day: '2026-11-01', ...extra };
}

test('Level up unlocks the next level after three wins on the one before', () => {
  assert.deepEqual(unlockedLevels([], true), ['easy']);
  const two = [win('easy'), win('easy')];
  assert.deepEqual(unlockedLevels(two, true), ['easy']);
  const three = [...two, win('easy')];
  assert.deepEqual(unlockedLevels(three, true), ['easy', 'medium']);
  const hardOpen = [...three, win('medium'), win('medium'), win('medium')];
  assert.deepEqual(unlockedLevels(hardOpen, true), ['easy', 'medium', 'hard']);
});

test('daily wins do not count towards unlocking, and Level up off opens everything', () => {
  const dailies = [win('easy', { daily: true }), win('easy', { daily: true }), win('easy', { daily: true })];
  assert.deepEqual(unlockedLevels(dailies, true), ['easy']);
  assert.equal(unlockedLevels([], false).length, 5);
});

test('stars drop with each mistake or hint and never go below one', () => {
  assert.equal(starsFor(0, 0), 3);
  assert.equal(starsFor(1, 1), 1);
  assert.equal(starsFor(5, 5), 1);
});

test('badges unlock from history', () => {
  const none = badges([], 0);
  assert.ok(none.every((b) => !b.unlocked));
  const games = [win('easy', { mistakes: 0 }), win('hard', { daily: true })];
  const got = Object.fromEntries(badges(games, 0).map((b) => [b.id, b.unlocked]));
  assert.equal(got['first-win'], true);
  assert.equal(got['five-wins'], false);
  assert.equal(got['daily-star'], true);
  assert.equal(got.flawless, true);
  assert.equal(got.brave, true);
  assert.equal(badges(games, 3).find((b) => b.id === 'daily-streak')?.unlocked, true);
});

test('weekSummary covers the last seven days, oldest first, and totals each day', async () => {
  const { weekSummary } = await import('./progress.ts');
  const games: GameRecord[] = [
    { difficulty: 'easy', won: true, elapsedMs: 60_000, day: '2026-11-14' },
    { difficulty: 'easy', won: false, elapsedMs: 30_000, day: '2026-11-14' },
    { difficulty: 'hard', won: true, elapsedMs: 90_000, day: '2026-11-08' },
    { difficulty: 'hard', won: true, elapsedMs: 90_000, day: '2026-11-01' },
  ];
  const week = weekSummary(games, '2026-11-14');
  assert.equal(week.length, 7);
  assert.equal(week[0].day, '2026-11-08');
  assert.deepEqual(week[6], { day: '2026-11-14', played: 2, won: 1, ms: 90_000 });
  assert.equal(week.find((d) => d.day === '2026-11-08')?.won, 1);
  assert.equal(week.some((d) => d.day === '2026-11-01'), false, 'older games are left out');
});
