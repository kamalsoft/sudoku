import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canPlaceDigit } from './highlight.ts';

test('a digit can go in an empty cell only if its row, column and block do not hold it', () => {
  const values = new Array<number>(81).fill(0);
  values[0] = 5; // row 0, column 0, block 0
  assert.equal(canPlaceDigit(values, 1, 5), false, 'same row');
  assert.equal(canPlaceDigit(values, 9, 5), false, 'same column');
  assert.equal(canPlaceDigit(values, 10, 5), false, 'same block');
  assert.equal(canPlaceDigit(values, 40, 5), true, 'no shared unit');
  assert.equal(canPlaceDigit(values, 0, 5), false, 'filled cells never take a digit');
});
