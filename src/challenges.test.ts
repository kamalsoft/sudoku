import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CHALLENGES, findChallenge, gameLimits } from './challenges.ts';
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
