import { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { cellTone } from '../sudoku/highlight';
import { useGameStore } from '../sudoku/store';
import { useReduceMotion } from '../motion';
import { useColors } from '../theme';
import type { Palette } from '../theme';

interface Props {
  index: number;
  size: number;
}

export function SudokuCell({ index, size }: Props) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const select = useGameStore((s) => s.selectCell);
  const shakeNonce = useGameStore((s) => (s.shake?.index === index ? s.shake.nonce : 0));
  const gameId = useGameStore((s) => s.gameId);
  const reduce = useReduceMotion();
  const { value, given, notes, tone } = useGameStore(
    useShallow((s) => ({
      value: s.board.values[index],
      given: s.board.givens[index],
      notes: s.board.notes[index],
      tone: cellTone(s.board.values, s.conflicts, s.selected, index),
    })),
  );

  const offset = useState(() => new Animated.Value(0))[0];
  const fade = useState(() => new Animated.Value(0))[0];

  // Cells fade in row by row whenever a new game starts.
  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: reduce ? 0 : 300,
      delay: reduce ? 0 : Math.floor(index / 9) * 45,
      useNativeDriver: false,
    }).start();
  }, [gameId, fade, index, reduce]);

  useEffect(() => {
    if (!shakeNonce || reduce) return;
    Animated.sequence([
      Animated.timing(offset, { toValue: -6, duration: 40, useNativeDriver: false }),
      Animated.timing(offset, { toValue: 6, duration: 40, useNativeDriver: false }),
      Animated.timing(offset, { toValue: -4, duration: 40, useNativeDriver: false }),
      Animated.timing(offset, { toValue: 4, duration: 40, useNativeDriver: false }),
      Animated.timing(offset, { toValue: 0, duration: 40, useNativeDriver: false }),
    ]).start();
  }, [shakeNonce, offset, reduce]);

  const row = Math.floor(index / 9);
  const col = index % 9;
  const bgColor = tone === 'none' ? c.surface : c.tone[tone];
  const label = `Row ${row + 1}, column ${col + 1}, ${value ? `${given ? 'given' : 'your'} ${value}` : 'empty'}`;

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateX: offset }] }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: tone === 'selected' }}
        onPress={() => select(index)}
        style={[
          styles.cell,
          {
            width: size,
            height: size,
            backgroundColor: bgColor,
            borderRightWidth: col === 8 ? 0 : col % 3 === 2 ? 2 : 1,
            borderRightColor: col % 3 === 2 ? c.lineStrong : c.line,
            borderBottomWidth: row === 8 ? 0 : row % 3 === 2 ? 2 : 1,
            borderBottomColor: row % 3 === 2 ? c.lineStrong : c.line,
          },
        ]}
      >
        {value ? (
          <Text style={[styles.value, { fontSize: size * 0.55, color: given ? c.given : c.entry }]}>{value}</Text>
        ) : (
          <View style={styles.notes}>
            {Array.from({ length: 9 }, (_, n) => (
              <Text key={n} style={[styles.note, { fontSize: size * 0.2 }]}>
                {notes & (1 << n) ? n + 1 : ''}
              </Text>
            ))}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    cell: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    value: {
      fontWeight: '600',
    },
    notes: {
      width: '100%',
      height: '100%',
      flexDirection: 'row',
      flexWrap: 'wrap',
      padding: 2,
    },
    note: {
      width: '33.33%',
      textAlign: 'center',
      color: c.muted,
    },
  });
}
