import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dailySeed, isMistake, outOfMistakes } from './rules.ts';
import { createRng, generatePuzzle } from './engine.ts';

test('the daily seed is stable for a day and differs between days', () => {
  assert.equal(dailySeed('2026-11-14'), dailySeed('2026-11-14'));
  assert.notEqual(dailySeed('2026-11-14'), dailySeed('2026-11-15'));
});

test('the same day always gives the same puzzle', () => {
  const a = generatePuzzle('medium', createRng(dailySeed('2026-11-14')));
  const b = generatePuzzle('medium', createRng(dailySeed('2026-11-14')));
  assert.deepEqual(a.puzzle, b.puzzle);
});

test('isMistake compares against the solution', () => {
  const solution = [5, 3, 4, ...new Array<number>(78).fill(1)];
  assert.equal(isMistake(solution, 0, 5), false);
  assert.equal(isMistake(solution, 0, 9), true);
});

test('casual mode never runs out of mistakes, capped modes do', () => {
  assert.equal(outOfMistakes(50, null), false);
  assert.equal(outOfMistakes(2, 3), false);
  assert.equal(outOfMistakes(3, 3), true);
});
