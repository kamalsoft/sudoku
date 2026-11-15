import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isNightHour } from './night.ts';

test('night runs from 8 pm to 7 am', () => {
  assert.equal(isNightHour(19), false);
  assert.equal(isNightHour(20), true);
  assert.equal(isNightHour(0), true);
  assert.equal(isNightHour(6), true);
  assert.equal(isNightHour(7), false);
});
