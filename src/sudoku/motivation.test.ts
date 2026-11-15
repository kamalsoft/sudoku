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
  assert.deepEqual(nextLevelProgress([], true), { level: 'easy', wins: 3 });
  assert.deepEqual(nextLevelProgress([win('beginner'), win('beginner')], true), { level: 'easy', wins: 1 });
  assert.deepEqual(nextLevelProgress([win('beginner', { qualified: false }), win('beginner')], true), { level: 'easy', wins: 2 });
  const mediumOpen = [win('beginner'), win('beginner'), win('beginner'), win('easy'), win('easy'), win('easy')];
  assert.equal(nextLevelProgress(mediumOpen, true)?.level, 'hard', 'Medium is open, so Hard is next');
});
