import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyDigit, applyErase, effectiveMode } from './moves.ts';
import { cellTone } from './highlight.ts';

function board(overrides: { values?: number[]; givens?: number[] } = {}) {
  const values = overrides.values ?? new Array<number>(81).fill(0);
  const givens = values.map((_, i) => (overrides.givens ?? []).includes(i));
  return { values, givens, notes: new Array<number>(81).fill(0) };
}

test('enter writes a value and clears that cell’s notes', () => {
  const start = { ...board(), notes: new Array<number>(81).fill(0).map((_, i) => (i === 4 ? 0b101 : 0)) };
  const next = applyDigit(start, 4, 'enter', 7);
  assert.equal(next.values[4], 7);
  assert.equal(next.notes[4], 0);
});

test('pencil toggles candidates on an empty cell only', () => {
  const once = applyDigit(board(), 0, 'pencil', 3);
  assert.equal(once.notes[0], 0b100);
  const twice = applyDigit(once, 0, 'pencil', 3);
  assert.equal(twice.notes[0], 0);

  const filled = board({ values: [5, ...new Array<number>(80).fill(0)] });
  assert.equal(applyDigit(filled, 0, 'pencil', 3), filled);
});

test('given cells are never changed', () => {
  const b = board({ values: [9, ...new Array<number>(80).fill(0)], givens: [0] });
  assert.equal(applyDigit(b, 0, 'enter', 1), b);
  assert.equal(applyErase(b, 0), b);
});

test('erase removes the digit first, then clears pencil marks', () => {
  const withDigit = { ...board({ values: [6, ...new Array<number>(80).fill(0)] }), notes: [0b1, ...new Array<number>(80).fill(0)] };
  const once = applyErase(withDigit, 0);
  assert.equal(once.values[0], 0);
  assert.equal(once.notes[0], 0b1, 'marks stay until the cell is empty');
  const marksOnly = { ...board(), notes: [0b101, ...new Array<number>(80).fill(0)] };
  assert.equal(applyErase(marksOnly, 0).notes[0], 0);
});

test('cellTone applies selected > error > same > peer priority', () => {
  const values = new Array<number>(81).fill(0);
  values[0] = 4; // selected
  values[1] = 4; // same row, same number
  values[9] = 2; // same column
  values[40] = 2; // unrelated
  values[80] = 4; // same number, unrelated
  const conflicts = new Array<boolean>(81).fill(false);
  conflicts[1] = true;

  assert.equal(cellTone(values, conflicts, 0, 0), 'selected');
  assert.equal(cellTone(values, conflicts, 0, 1), 'error');
  assert.equal(cellTone(values, conflicts, 0, 9), 'peer');
  assert.equal(cellTone(values, conflicts, 0, 40), 'none');
  assert.equal(cellTone(values, conflicts, 0, 80), 'same');
  assert.equal(cellTone(values, conflicts, null, 9), 'none');
});

test('effectiveMode drops pencil when notes are off', () => {
  assert.equal(effectiveMode('pencil', false), 'enter');
  assert.equal(effectiveMode('pencil', true), 'pencil');
});
