import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Difficulty } from '../sudoku/engine';
import { elapsedMs, remainingMs } from '../sudoku/session';
import { formatDuration } from '../sudoku/stats';
import { useGameStore } from '../sudoku/store';
import { usePrefs } from '../prefs';
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

export function GameHeader() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const difficulty = useGameStore((s) => s.difficulty);
  const solved = useGameStore((s) => s.solved);
  const running = useGameStore((s) => s.runningSince !== null);
  const accumulated = useGameStore((s) => s.accumulatedMs);
  const runningSince = useGameStore((s) => s.runningSince);
  const newGame = useGameStore((s) => s.newGame);
  const timeLimitMs = useGameStore((s) => s.timeLimitMs);
  const failed = useGameStore((s) => s.failed);
  const mistakes = useGameStore((s) => s.mistakes);
  const mistakeLimit = usePrefs((s) => s.mistakeLimit);
  const daily = useGameStore((s) => s.daily);
  const startDaily = useGameStore((s) => s.startDaily);
  const setTimeLimit = useGameStore((s) => s.setTimeLimit);

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
    <View style={styles.header}>
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

      <View style={styles.chips} accessibilityRole="radiogroup">
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

      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="Time limit">
        {TIME_LIMITS.map((t) => {
          const active = t.value === timeLimitMs;
          return (
            <Pressable
              key={t.label}
              accessibilityRole="radio"
              aria-checked={active}
              onPress={() => setTimeLimit(t.value)}
              style={({ pressed }) => [styles.chip, active && styles.chipActive, { transform: [{ scale: pressed ? 0.95 : 1 }] }]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.actions}>
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
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: c.text,
    },
    status: {
      fontSize: 15,
      color: c.muted,
      fontVariant: ['tabular-nums'],
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 6,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    chipActive: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },
    chipText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
    },
    chipTextActive: {
      color: c.onAccent,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 8,
      marginTop: 2,
    },
    action: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: c.accent,
    },
    actionText: {
      color: c.onAccent,
      fontWeight: '600',
    },
    actionOutline: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.accent,
    },
    actionOutlineText: {
      color: c.accent,
      fontWeight: '600',
    },
  });
}
