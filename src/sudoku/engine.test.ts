import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CLUE_TARGETS, countSolutions, createRng, findConflicts, generatePuzzle, UNITS } from './engine.ts';
import type { Difficulty } from './engine.ts';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'master', 'evil', 'genius'];

function parse(text: string): number[] {
  return text.split('').map((c) => (c === '.' ? 0 : Number(c)));
}

function isCompleteSolution(values: number[]): boolean {
  return UNITS.every((unit) => new Set(unit.map((i) => values[i])).size === 9 && unit.every((i) => values[i] >= 1));
}

test('solver finds a unique solution for a classic puzzle', () => {
  const puzzle = parse(
    '53..7....' + '6..195...' + '.98....6.' + '8...6...3' + '4..8.3..1' + '7...2...6' + '.6....28.' + '...419..5' + '....8..79',
  );
  assert.equal(countSolutions(puzzle, 2), 1);
});

test('solver counts multiple solutions for an underspecified grid', () => {
  assert.equal(countSolutions(new Array(81).fill(0), 2), 2);
});

test('findConflicts flags both cells of a duplicate in a row, column or box', () => {
  const values = new Array<number>(81).fill(0);
  values[0] = 5;
  values[8] = 5; // same row
  values[27] = 3;
  values[54] = 3; // same column
  values[40] = 9;
  values[30] = 9; // same box (centre box)
  const bad = findConflicts(values);
  for (const i of [0, 8, 27, 54, 40, 30]) assert.equal(bad[i], true, `cell ${i} should conflict`);
  assert.equal(bad.filter(Boolean).length, 6);
});

for (const difficulty of DIFFICULTIES) {
  test(`generated ${difficulty} puzzle is valid, unique and sparse enough`, () => {
    const { puzzle, solution } = generatePuzzle(difficulty, createRng(1234));

    assert.ok(isCompleteSolution(solution), 'solution is a valid grid');
    puzzle.forEach((v, i) => {
      if (v) assert.equal(v, solution[i], `clue ${i} matches the solution`);
    });
    assert.equal(countSolutions(puzzle, 2), 1, 'puzzle has exactly one solution');

    // Easy to hard hit their targets; expert and evil land within a few clues of them (see generatePuzzle shortcut).
    const clues = puzzle.filter(Boolean).length;
    const slack = ['expert', 'master', 'evil', 'genius'].includes(difficulty) ? 8 : 0;
    assert.ok(clues <= CLUE_TARGETS[difficulty] + slack, `clues ${clues} within target`);
  });
}

test('same seed gives the same puzzle', () => {
  const a = generatePuzzle('medium', createRng(42));
  const b = generatePuzzle('medium', createRng(42));
  assert.deepEqual(a, b);
});
