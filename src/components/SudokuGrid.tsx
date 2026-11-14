import { useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useReduceMotion } from '../motion';
import { useGameStore } from '../sudoku/store';
import { useColors } from '../theme';
import type { Palette } from '../theme';
import { SudokuCell } from './SudokuCell';

const GRID_BORDER = 2;

interface Props {
  size: number;
}

export function SudokuGrid({ size }: Props) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const solved = useGameStore((s) => s.solved);
  const reduce = useReduceMotion();
  // The outer border is part of `size`, so cells are sized from the inner area to stay inside it.
  const cellSize = (size - GRID_BORDER * 2) / 9;

  // A short pulse on completion.
  const pulse = useState(() => new Animated.Value(1))[0];
  useEffect(() => {
    if (!solved || reduce) return;
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.04, duration: 150, useNativeDriver: false }),
      Animated.spring(pulse, { toValue: 1, useNativeDriver: false }),
    ]).start();
  }, [solved, pulse, reduce]);

  return (
    <Animated.View
      style={[styles.grid, { width: size, height: size, transform: [{ scale: pulse }] }]}
      accessibilityRole="grid"
    >
      {Array.from({ length: 9 }, (_, row) => (
        <View key={row} style={styles.row}>
          {Array.from({ length: 9 }, (_, col) => (
            <SudokuCell key={col} index={row * 9 + col} size={cellSize} />
          ))}
        </View>
      ))}
    </Animated.View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    grid: {
      borderWidth: GRID_BORDER,
      borderColor: c.lineStrong,
      backgroundColor: c.surface,
    },
    row: {
      flexDirection: 'row',
    },
  });
}
