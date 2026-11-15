import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHALLENGES, findChallenge, gameLimits, weekStart, weeklyChallenge } from './challenges.ts';
import { LEVELS } from './sudoku/levels.ts';

test('every challenge has a unique id, a real level and a mistake limit, so it is never casual', () => {
  const ids = CHALLENGES.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const c of CHALLENGES) {
    assert.ok(LEVELS.includes(c.level), `${c.id} uses a known level`);
    assert.ok(c.mistakes >= 1, `${c.id} has a mistake limit`);
  }
});

test('a challenge sets its own limits; a normal game uses the player settings', () => {
  const morning = findChallenge('morning_run');
  assert.deepEqual(gameLimits(morning, { mistakeLimit: null, hintLimit: 9 }), { mistakeLimit: 3, hintLimit: 3 });
  assert.deepEqual(gameLimits(undefined, { mistakeLimit: null, hintLimit: 9 }), { mistakeLimit: null, hintLimit: 9 });
  assert.equal(findChallenge(null), undefined);
});

test('a week starts on Monday, and every day of it gives the same weekly challenge', () => {
  assert.equal(weekStart('2026-11-14'), '2026-11-09', 'a Saturday goes back to its Monday');
  assert.equal(weekStart('2026-11-09'), '2026-11-09', 'a Monday is its own week start');
  assert.equal(weekStart('2026-11-15'), '2026-11-09', 'a Sunday is still the same week');
  assert.equal(weeklyChallenge('2026-11-09').id, weeklyChallenge('2026-11-15').id);
  assert.ok(CHALLENGES.includes(weeklyChallenge('2026-11-14')));
});
