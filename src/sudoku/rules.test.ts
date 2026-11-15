import { test } from 'node:test';
import assert from 'node:assert/strict';
import { casualWinsOn, completedUnits, dailySeed, guardedMistakeLimit, guardedTimeLimit, isCasual, isMistake, levelAllowed, markErrors, outOfMistakes, unitLabel } from './rules.ts';
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

test('markErrors flags wrong digits and duplicates, not empty or correct cells', () => {
  const solution = [5, 3, 4, ...new Array<number>(78).fill(1)];
  const values = [5, 9, 0, ...new Array<number>(78).fill(0)];
  const conflicts = new Array<boolean>(81).fill(false);
  conflicts[20] = true;
  const errors = markErrors(conflicts, values, solution);
  assert.equal(errors[0], false, 'correct digit');
  assert.equal(errors[1], true, 'wrong digit');
  assert.equal(errors[2], false, 'empty cell');
  assert.equal(errors[20], true, 'duplicate');
});

test('completedUnits reports only units whose nine cells are all correct', () => {
  // Two tiny "units" keep the test small: a row of cells 0..2 and a row of cells 3..4.
  const units = [[0, 1, 2], [3, 4]];
  const solution = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const values = [1, 2, 3, 4, 0, 6, 7, 8, 9];
  assert.deepEqual(completedUnits(units, values, solution), [0]);
  assert.deepEqual(completedUnits(units, [1, 2, 9, 4, 5, 6, 7, 8, 9], solution), [1]);
});

test('unitLabel names rows, columns and blocks from 1', () => {
  assert.equal(unitLabel(0), 'Row 1');
  assert.equal(unitLabel(8), 'Row 9');
  assert.equal(unitLabel(9), 'Column 1');
  assert.equal(unitLabel(26), 'Block 9');
});

test('kid-safe mode turns off mistake and time limits without changing the stored choice', () => {
  assert.equal(guardedMistakeLimit(true, 3), null);
  assert.equal(guardedMistakeLimit(false, 3), 3);
  assert.equal(guardedTimeLimit(true, 300_000), null);
  assert.equal(guardedTimeLimit(false, 300_000), 300_000);
});

test('a win is not qualified when hints filled every empty square', async () => {
  const { hintsQualify } = await import('./rules.ts');
  const puzzle = '1' + '0'.repeat(80);
  assert.equal(hintsQualify(puzzle, 0), true);
  assert.equal(hintsQualify(puzzle, 3), true, '79 empty squares, 3 hints');
  assert.equal(hintsQualify('1'.repeat(81), 0), false, 'no empty squares left to hint: nothing to qualify');
  assert.equal(hintsQualify('0'.repeat(3) + '1'.repeat(78), 3), false, 'three empty squares, three hints');
  assert.equal(hintsQualify('', 99), true, 'saved without its puzzle text');
});

test('casual play stops at Medium and at five casual wins a day; other play is open', () => {
  assert.equal(levelAllowed('medium', true, 4), true);
  assert.equal(levelAllowed('hard', true, 0), false, 'casual play cannot reach Hard');
  assert.equal(levelAllowed('beginner', true, 5), false, 'five casual wins used up for the day');
  assert.equal(levelAllowed('genius', false, 99), true, 'a mistake limit opens every level');
});

test('casual means no mistake limit, Kid-safe included; only casual wins count towards the cap', () => {
  assert.equal(isCasual(false, null), true);
  assert.equal(isCasual(false, 3), false);
  assert.equal(isCasual(true, 3), true, 'Kid-safe turns the mistake limit off');
  const day = '2026-11-14';
  const games = [
    { difficulty: 'easy' as const, won: true, elapsedMs: 1, day, casual: true },
    { difficulty: 'easy' as const, won: false, elapsedMs: 1, day, casual: true },
    { difficulty: 'hard' as const, won: true, elapsedMs: 1, day, casual: false },
    { difficulty: 'easy' as const, won: true, elapsedMs: 1, day: '2026-11-13', casual: true },
  ];
  assert.equal(casualWinsOn(games, day), 1);
});
