import { test } from 'node:test';
import assert from 'node:assert/strict';
import { motivationKey, nextLevelProgress } from './motivation.ts';
import type { GameRecord } from './stats.ts';

const win = (difficulty: GameRecord['difficulty'], extra: Partial<GameRecord> = {}): GameRecord => ({
  difficulty,
  won: true,
  elapsedMs: 1000,
  day: '2026-11-01',
  ...extra,
});

test('the message key follows Kid-safe mode', () => {
  assert.equal(motivationKey('win', true), 'kid_win');
  assert.equal(motivationKey('wrong', false), 'adult_wrong');
});

test('next level progress counts qualified wins on the level before', () => {
  assert.equal(nextLevelProgress([], false), null, 'no progress shown with Level up off');
  assert.deepEqual(nextLevelProgress([], true), { level: 'medium', wins: 3 });
  assert.deepEqual(nextLevelProgress([win('easy'), win('easy')], true), { level: 'medium', wins: 1 });
  assert.deepEqual(nextLevelProgress([win('easy', { qualified: false }), win('easy')], true), { level: 'medium', wins: 2 });
  assert.equal(nextLevelProgress([win('easy'), win('easy'), win('easy')], true)?.level, 'hard', 'Medium is open, so Hard is next');
});
