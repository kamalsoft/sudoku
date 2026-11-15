import { test } from 'node:test';
import assert from 'node:assert/strict';
import { badges, starsFor, unlockedLevels } from './progress.ts';
import { CHALLENGES } from '../challenges.ts';
import type { GameRecord } from './stats.ts';

function win(difficulty: GameRecord['difficulty'], extra: Partial<GameRecord> = {}): GameRecord {
  return { difficulty, won: true, elapsedMs: 1000, day: '2026-11-01', ...extra };
}

test('Level up unlocks the next level after three wins on the one before', () => {
  assert.deepEqual(unlockedLevels([], true), ['beginner']);
  const two = [win('beginner'), win('beginner')];
  assert.deepEqual(unlockedLevels(two, true), ['beginner']);
  const three = [...two, win('beginner')];
  assert.deepEqual(unlockedLevels(three, true), ['beginner', 'easy']);
  const mediumOpen = [...three, win('easy'), win('easy'), win('easy')];
  assert.deepEqual(unlockedLevels(mediumOpen, true), ['beginner', 'easy', 'medium']);
});

test('daily wins do not count towards unlocking, and Level up off opens everything', () => {
  const dailies = [win('beginner', { daily: true }), win('beginner', { daily: true }), win('beginner', { daily: true })];
  assert.deepEqual(unlockedLevels(dailies, true), ['beginner']);
  assert.equal(unlockedLevels([], false).length, 8);
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

test('unqualified wins earn no level progress or badges', () => {
  const assisted = { difficulty: 'beginner' as const, won: true, elapsedMs: 1000, day: '2026-11-01', qualified: false };
  assert.deepEqual(unlockedLevels([assisted, assisted, assisted], true), ['beginner']);
  const got = Object.fromEntries(badges([assisted], 0).map((b) => [b.id, b.unlocked]));
  assert.equal(got['first-win'], false);
});

test('Challenger is earned by one named challenge win; Mission Control needs every challenge', () => {
  const one = [win('easy', { challenge: CHALLENGES[0].id })];
  const got = (games: GameRecord[]) => Object.fromEntries(badges(games, 0).map((b) => [b.id, b.unlocked]));
  assert.equal(got(one).challenger, true);
  assert.equal(got(one)['mission-control'], false);
  const all = CHALLENGES.map((c) => win(c.level, { challenge: c.id }));
  assert.equal(got(all)['mission-control'], true);
  assert.equal(got([win('easy', { challenge: CHALLENGES[0].id, qualified: false })]).challenger, false, 'unqualified wins do not count');
});

test('speed badges need a Medium or harder win under the time', () => {
  const got = (games: GameRecord[]) => Object.fromEntries(badges(games, 0).map((b) => [b.id, b.unlocked]));
  const quick = got([win('medium', { elapsedMs: 240_000 })]);
  assert.equal(quick['quick-thinker'], true);
  assert.equal(quick['speed-run'], true);
  assert.equal(quick.lightning, false);
  assert.equal(got([win('easy', { elapsedMs: 60_000 })])['quick-thinker'], false, 'Easy wins do not count');
  assert.equal(got([win('hard', { elapsedMs: 60_000, qualified: false })]).lightning, false, 'unqualified wins do not count');
});
