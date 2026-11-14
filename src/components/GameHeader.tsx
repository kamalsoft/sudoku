import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Difficulty } from '../sudoku/engine';
import { elapsedMs } from '../sudoku/session';
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

export function GameHeader() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const difficulty = useGameStore((s) => s.difficulty);
  const solved = useGameStore((s) => s.solved);
  const running = useGameStore((s) => s.runningSince !== null);
  const accumulated = useGameStore((s) => s.accumulatedMs);
  const runningSince = useGameStore((s) => s.runningSince);
  const newGame = useGameStore((s) => s.newGame);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const status = solved ? 'Solved!' : running ? formatDuration(elapsedMs(accumulated, runningSince, now)) : 'Paused';

  return (
    <View style={styles.header}>
      <Text style={styles.title}>Sudoku</Text>
      <Text style={styles.status} accessibilityLiveRegion="polite">
        {status}
      </Text>

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

      <View style={styles.actions}>
        <Pressable accessibilityRole="button" onPress={() => newGame(difficulty)} style={styles.action}>
          <Text style={styles.actionText}>New game</Text>
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
