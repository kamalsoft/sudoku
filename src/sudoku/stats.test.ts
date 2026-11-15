import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarize } from './stats.ts';
import type { GameRecord } from './stats.ts';
import { CHALLENGES } from '../challenges.ts';

const day = '2026-11-14';

test('summary counts each named challenge, with best time from qualified wins only', () => {
  const games: GameRecord[] = [
    { difficulty: 'easy', won: true, elapsedMs: 90_000, day, challenge: 'comet_dash', qualified: true },
    { difficulty: 'easy', won: true, elapsedMs: 60_000, day, challenge: 'comet_dash', qualified: false },
    { difficulty: 'easy', won: false, elapsedMs: 30_000, day, challenge: 'comet_dash' },
    { difficulty: 'medium', won: true, elapsedMs: 1000, day },
  ];
  const stats = summarize(games, day);
  assert.deepEqual(Object.keys(stats.byChallenge).sort(), CHALLENGES.map((c) => c.id).sort());
  assert.deepEqual(stats.byChallenge.comet_dash, { played: 3, won: 2, bestMs: 90_000 });
  assert.deepEqual(stats.byChallenge.sunrise, { played: 0, won: 0, bestMs: null });
});

test('summary counts casual wins for today only', () => {
  const games: GameRecord[] = [
    { difficulty: 'easy', won: true, elapsedMs: 1, day, casual: true },
    { difficulty: 'easy', won: true, elapsedMs: 1, day: '2026-11-13', casual: true },
    { difficulty: 'hard', won: true, elapsedMs: 1, day, casual: false },
  ];
  assert.equal(summarize(games, day).casualToday, 1);
});
