import { test } from 'node:test';
import assert from 'node:assert/strict';
import { elapsedMs, parseSession } from './session.ts';
import { dayKey, formatDuration, streakAt, summarize } from './stats.ts';
import type { GameRecord } from './stats.ts';

function validSession() {
  return {
    difficulty: 'medium',
    solution: new Array<number>(81).fill(1),
    board: {
      values: new Array<number>(81).fill(0),
      givens: new Array<boolean>(81).fill(false),
      notes: new Array<number>(81).fill(0),
    },
    accumulatedMs: 1500,
  };
}

test('parseSession accepts a well-formed session', () => {
  const parsed = parseSession(JSON.stringify(validSession()));
  assert.equal(parsed?.difficulty, 'medium');
  assert.equal(parsed?.accumulatedMs, 1500);
});

test('parseSession rejects corrupt or malformed data', () => {
  assert.equal(parseSession('not json'), null);
  assert.equal(parseSession('null'), null);
  assert.equal(parseSession(JSON.stringify({ ...validSession(), difficulty: 'insane' })), null);
  assert.equal(parseSession(JSON.stringify({ ...validSession(), solution: [1, 2, 3] })), null);
  assert.equal(parseSession(JSON.stringify({ ...validSession(), accumulatedMs: -1 })), null);
  const badNotes = validSession();
  badNotes.board.notes[0] = 1024;
  assert.equal(parseSession(JSON.stringify(badNotes)), null);
});

test('elapsedMs adds the running stretch only while running', () => {
  assert.equal(elapsedMs(1000, null, 99999), 1000);
  assert.equal(elapsedMs(1000, 5000, 7000), 3000);
  assert.equal(elapsedMs(1000, 5000, 4000), 1000); // clock moved backwards: never negative
});

test('dayKey uses the local calendar day', () => {
  assert.equal(dayKey(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
});

test('streakAt counts back from today, or from yesterday when today has no win', () => {
  const days = new Set(['2026-03-01', '2026-03-02', '2026-03-03']);
  assert.equal(streakAt(days, '2026-03-03'), 3);
  assert.equal(streakAt(days, '2026-03-04'), 3); // no win yet today, streak still alive
  assert.equal(streakAt(days, '2026-03-05'), 0); // a day was missed
  assert.equal(streakAt(new Set(['2026-02-28', '2026-03-01']), '2026-03-01'), 2); // crosses a month boundary
});

test('summarize computes totals, win rate and best time per difficulty', () => {
  const games: GameRecord[] = [
    { difficulty: 'easy', won: true, elapsedMs: 90_000, day: '2026-03-03' },
    { difficulty: 'easy', won: true, elapsedMs: 60_000, day: '2026-03-03' },
    { difficulty: 'easy', won: false, elapsedMs: 30_000, day: '2026-03-02' },
    { difficulty: 'evil', won: false, elapsedMs: 5_000, day: '2026-03-01' },
  ];
  const stats = summarize(games, '2026-03-03');
  assert.equal(stats.played, 4);
  assert.equal(stats.won, 2);
  assert.equal(stats.winRate, 0.5);
  assert.equal(stats.streak, 1);
  assert.deepEqual(stats.byDifficulty.easy, { played: 3, won: 2, bestMs: 60_000 });
  assert.deepEqual(stats.byDifficulty.evil, { played: 1, won: 0, bestMs: null });
});

test('summarize with no games has no win rate', () => {
  const stats = summarize([], '2026-03-03');
  assert.equal(stats.winRate, null);
  assert.equal(stats.streak, 0);
});

test('formatDuration prints m:ss and h:mm:ss', () => {
  assert.equal(formatDuration(65_000), '1:05');
  assert.equal(formatDuration(3_725_000), '1:02:05');
});
