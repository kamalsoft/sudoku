import { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { formatDuration } from '../sudoku/stats';
import { useGameStore } from '../sudoku/store';
import { useReduceMotion } from '../motion';
import { useColors } from '../theme';
import type { Palette } from '../theme';

// Shown when the puzzle is solved. It cross-fades in, and cross-fades out when dismissed.
export function CelebrationOverlay() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const reduce = useReduceMotion();
  const solved = useGameStore((s) => s.solved);
  const gameId = useGameStore((s) => s.gameId);
  const accumulatedMs = useGameStore((s) => s.accumulatedMs);
  const mistakes = useGameStore((s) => s.mistakes);
  const difficulty = useGameStore((s) => s.difficulty);
  const newGame = useGameStore((s) => s.newGame);
  const [dismissedFor, setDismissedFor] = useState<number | null>(null);
  const [fade] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.9));

  const show = solved && dismissedFor !== gameId;

  useEffect(() => {
    if (!show) return;
    fade.setValue(0);
    scale.setValue(0.9);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: reduce ? 0 : 500, useNativeDriver: false }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: false }),
    ]).start();
  }, [show, fade, scale, reduce]);

  const dismiss = () => {
    Animated.timing(fade, { toValue: 0, duration: reduce ? 0 : 350, useNativeDriver: false }).start(() => setDismissedFor(gameId));
  };

  if (!show) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: fade }]} accessibilityViewIsModal>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <Text style={styles.stars} accessibilityElementsHidden>★ ★ ★</Text>
        <Text style={styles.title}>Puzzle complete!</Text>
        <Text style={styles.body}>
          {formatDuration(accumulatedMs)} · {mistakes} {mistakes === 1 ? 'mistake' : 'mistakes'}
        </Text>
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={() => newGame(difficulty)} style={styles.primary}>
            <Text style={styles.primaryText}>Play again</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={dismiss} style={styles.secondary}>
            <Text style={styles.secondaryText}>Look at it</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    backdrop: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 360,
      padding: 28,
      borderRadius: c.radius + 6,
      backgroundColor: c.surface,
      alignItems: 'center',
      gap: 12,
    },
    stars: {
      fontSize: 28,
      color: c.entry,
      letterSpacing: 6,
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: c.text,
      textAlign: 'center',
    },
    body: {
      fontSize: 16,
      color: c.muted,
    },
    actions: {
      alignSelf: 'stretch',
      gap: 10,
      marginTop: 8,
    },
    primary: {
      height: 48,
      borderRadius: c.radius,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.accent,
    },
    primaryText: {
      color: c.onAccent,
      fontWeight: '700',
      fontSize: 16,
    },
    secondary: {
      height: 48,
      borderRadius: c.radius,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.accent,
    },
    secondaryText: {
      color: c.accent,
      fontWeight: '700',
      fontSize: 16,
    },
  });
}
