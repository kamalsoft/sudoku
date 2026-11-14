import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyHistory, recordChange, redo, undo } from './history.ts';
import { keyCommand } from './keys.ts';
import { candidatesFor, fillCandidates, removeFromPeers } from './moves.ts';
import type { BoardState } from './engine.ts';

function blank(): BoardState {
  return { values: new Array<number>(81).fill(0), givens: new Array<boolean>(81).fill(false), notes: new Array<number>(81).fill(0) };
}

test('undo and redo walk back and forth through changes', () => {
  const a = blank();
  const b = { ...blank(), values: [1, ...new Array<number>(80).fill(0)] };
  const c = { ...b, values: [2, ...new Array<number>(80).fill(0)] };

  let h = recordChange(emptyHistory, a); // a -> b
  let step = undo(h, b);
  assert.equal(step?.board, a);
  h = step!.history;
  h = recordChange(h, a); // a -> c replaces the redo branch
  assert.equal(redo(h, c), null);
  assert.equal(undo(h, c)?.board, a);
  assert.equal(undo(emptyHistory, a), null);
});

test('redo returns the change that was undone', () => {
  const a = blank();
  const b = { ...blank(), values: [7, ...new Array<number>(80).fill(0)] };
  const h = recordChange(emptyHistory, a);
  const undone = undo(h, b)!;
  const redone = redo(undone.history, undone.board);
  assert.equal(redone?.board, b);
});

test('keyCommand maps digits, erase, pencil, arrows and undo/redo', () => {
  const none = { ctrl: false, shift: false };
  assert.deepEqual(keyCommand('5', none), { type: 'digit', digit: 5 });
  assert.deepEqual(keyCommand('Backspace', none), { type: 'erase' });
  assert.deepEqual(keyCommand('n', none), { type: 'pencil' });
  assert.deepEqual(keyCommand('N', none), { type: 'pencil' });
  assert.deepEqual(keyCommand('ArrowUp', none), { type: 'move', dRow: -1, dCol: 0 });
  assert.deepEqual(keyCommand('z', { ctrl: true, shift: false }), { type: 'undo' });
  assert.deepEqual(keyCommand('z', { ctrl: true, shift: true }), { type: 'redo' });
  assert.deepEqual(keyCommand('y', { ctrl: true, shift: false }), { type: 'redo' });
  assert.equal(keyCommand('q', none), null);
  assert.equal(keyCommand('5', { ctrl: true, shift: false }), null); // browser shortcuts stay with the browser
});

test('candidatesFor excludes digits used in the same row, column or box', () => {
  const values = new Array<number>(81).fill(0);
  values[1] = 3; // row 0
  values[9] = 4; // column 0
  values[20] = 5; // box 0 (row 2, column 2)
  values[40] = 9; // unrelated
  const mask = candidatesFor(values, 0);
  for (const d of [3, 4, 5]) assert.equal((mask & (1 << (d - 1))) !== 0, false, `digit ${d} excluded`);
  assert.equal((mask & (1 << 8)) !== 0, true, 'digit 9 is still a candidate');
});

test('fillCandidates fills notes for empty cells only', () => {
  const board = blank();
  board.values[0] = 1;
  const filled = fillCandidates(board);
  assert.equal(filled.notes[0], 0);
  assert.equal(filled.notes[1] & 1, 0, 'digit 1 is not a candidate in row 0');
  assert.equal(filled.notes[80] & (1 << 4), 1 << 4, 'digit 5 is a candidate far away');
});

test('removeFromPeers drops a placed digit from peers only', () => {
  const board = { ...blank(), notes: new Array<number>(81).fill(0x1ff) };
  const next = removeFromPeers(board, 0, 7);
  const bit = 1 << 6;
  assert.equal(next.notes[1] & bit, 0, 'same row loses the digit');
  assert.equal(next.notes[9] & bit, 0, 'same column loses the digit');
  assert.equal(next.notes[10] & bit, 0, 'same box loses the digit');
  assert.equal(next.notes[80] & bit, bit, 'unrelated cell keeps it');
});
