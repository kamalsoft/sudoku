import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { usePrefs } from '../prefs';
import type { Difficulty } from '../sudoku/engine';
import { elapsedMs, remainingMs } from '../sudoku/session';
import { guardedMistakeLimit, guardedTimeLimit } from '../sudoku/rules';
import { formatDuration } from '../sudoku/stats';
import { useGameStore } from '../sudoku/store';
import { useColors } from '../theme';
import type { Palette } from '../theme';

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
  { value: 'expert', label: 'Expert' },
  { value: 'evil', label: 'Evil' },
];

const TIME_LIMITS: { value: number | null; label: string }[] = [
  { value: null, label: 'No limit' },
  { value: 5 * 60_000, label: '5 min' },
  { value: 10 * 60_000, label: '10 min' },
  { value: 15 * 60_000, label: '15 min' },
];

interface Props {
  width: number;
}

export function GameHeader({ width }: Props) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const difficulty = useGameStore((s) => s.difficulty);
  const solved = useGameStore((s) => s.solved);
  const running = useGameStore((s) => s.runningSince !== null);
  const accumulated = useGameStore((s) => s.accumulatedMs);
  const runningSince = useGameStore((s) => s.runningSince);
  const newGame = useGameStore((s) => s.newGame);
  const kidSafe = usePrefs((s) => s.kidSafe);
  const timeLimitMs = guardedTimeLimit(kidSafe, useGameStore((s) => s.timeLimitMs));
  const failed = useGameStore((s) => s.failed);
  const mistakes = useGameStore((s) => s.mistakes);
  const daily = useGameStore((s) => s.daily);
  const startDaily = useGameStore((s) => s.startDaily);
  const setTimeLimit = useGameStore((s) => s.setTimeLimit);
  const mistakeLimit = guardedMistakeLimit(kidSafe, usePrefs((s) => s.mistakeLimit));

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
      useGameStore.getState().tick();
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = elapsedMs(accumulated, runningSince, now);
  const status = solved
    ? 'Solved!'
    : failed === 'time'
      ? "Time's up"
      : failed === 'mistakes'
        ? 'Out of mistakes'
        : timeLimitMs !== null
          ? `${formatDuration(remainingMs(timeLimitMs, elapsed))} left`
          : running
            ? formatDuration(elapsed)
            : 'Paused';

  return (
    <View style={[styles.header, { width }]}>
      <Image source={require('../../assets/logo.png')} style={styles.logo} accessibilityLabel="Sudoku logo" />
      <Text style={styles.title}>Sudoku</Text>
      <Text style={styles.status} accessibilityLiveRegion="polite">
        {status}
      </Text>
      {mistakeLimit !== null || mistakes > 0 ? (
        <Text style={styles.status}>
          {mistakeLimit !== null ? `Mistakes ${mistakes} of ${mistakeLimit}` : `Mistakes ${mistakes}`}
        </Text>
      ) : null}
      {daily !== null ? <Text style={styles.status}>Daily challenge · {daily}</Text> : null}

      <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel="Difficulty">
        {DIFFICULTIES.map((d) => {
          const active = d.value === difficulty;
          return (
            <Pressable
              key={d.value}
              accessibilityRole="radio"
              aria-checked={active}
              onPress={() => newGame(d.value)}
              style={({ pressed }) => [styles.chip, active && styles.chipActive, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{d.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.row, kidSafe && styles.dimmed]} accessibilityRole="radiogroup" accessibilityLabel="Time limit">
        {TIME_LIMITS.map((t) => {
          const active = t.value === timeLimitMs;
          return (
            <Pressable
              key={t.label}
              accessibilityRole="radio"
              aria-checked={active}
              disabled={kidSafe}
              onPress={() => setTimeLimit(t.value)}
              style={({ pressed }) => [styles.chip, active && styles.chipActive, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.row}>
        <Pressable accessibilityRole="button" onPress={() => newGame(difficulty)} style={styles.action}>
          <Text style={styles.actionText}>New game</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={startDaily} style={styles.actionOutline}>
          <Text style={styles.actionOutlineText}>Daily</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/stats')} style={styles.actionOutline}>
          <Text style={styles.actionOutlineText}>Stats</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => router.push('/settings')} style={styles.actionOutline}>
          <Text style={styles.actionOutlineText}>Settings</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    header: {
      alignItems: 'center',
      gap: 8,
    },
    logo: {
      width: 56,
      height: 56,
    },
    title: {
      fontSize: 30,
      fontWeight: '800',
      color: c.text,
    },
    status: {
      fontSize: 15,
      color: c.muted,
      fontVariant: ['tabular-nums'],
      textAlign: 'center',
    },
    dimmed: {
      opacity: 0.45,
    },
    row: {
      alignSelf: 'stretch',
      flexDirection: 'row',
      gap: 6,
    },
    chip: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 7,
      borderRadius: c.radius,
      borderWidth: 2,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    chipActive: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },
    chipText: {
      fontSize: 14,
      fontWeight: '700',
      color: c.text,
    },
    chipTextActive: {
      color: c.onAccent,
    },
    action: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 9,
      borderRadius: c.radius,
      backgroundColor: c.accent,
    },
    actionText: {
      color: c.onAccent,
      fontWeight: '700',
      fontSize: 14,
    },
    actionOutline: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 9,
      borderRadius: c.radius,
      borderWidth: 2,
      borderColor: c.accent,
    },
    actionOutlineText: {
      color: c.accent,
      fontWeight: '700',
      fontSize: 14,
    },
  });
}
