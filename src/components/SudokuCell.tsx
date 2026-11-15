import { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';
import { UNITS } from '../sudoku/engine';
import { canPlaceDigit, cellTone } from '../sudoku/highlight';
import { useGameStore } from '../sudoku/store';
import { useReduceMotion } from '../motion';
import { usePrefs } from '../prefs';
import { useColors } from '../theme';
import type { Palette } from '../theme';

interface Props {
  index: number;
  size: number;
}

export function SudokuCell({ index, size }: Props) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const reduce = useReduceMotion();
  const largeDigits = usePrefs((s) => s.largeDigits);
  const colorBlind = usePrefs((s) => s.colorBlind);
  const select = useGameStore((s) => s.selectCell);
  const shakeNonce = useGameStore((s) => (s.shake?.index === index ? s.shake.nonce : 0));
  const gameId = useGameStore((s) => s.gameId);
  // Completion glow: the nonce changes when a unit containing this cell completes; delay follows the cell's place in that unit.
  const glow = useGameStore(
    useShallow((s) => {
      const flash = s.unitFlash;
      const u = flash ? flash.units.find((unit) => UNITS[unit].includes(index)) : undefined;
      return u === undefined ? { nonce: 0, delay: 0 } : { nonce: flash!.nonce, delay: UNITS[u].indexOf(index) * 70 };
    }),
  );
  const { value, given, notes, tone, wrong, possible } = useGameStore(
    useShallow((s) => ({
      value: s.board.values[index],
      given: s.board.givens[index],
      notes: s.board.notes[index],
      tone: cellTone(s.board.values, s.errors, s.selected, index),
      wrong: s.errors[index] && !s.board.givens[index],
      // Practice by digit: empty cells where the focused digit can still go.
      possible: s.focusDigit !== null && canPlaceDigit(s.board.values, index, s.focusDigit),
    })),
  );

  const [anim] = useState(() => ({
    offset: new Animated.Value(0),
    fade: new Animated.Value(0),
    flash: new Animated.Value(0),
    glow: new Animated.Value(0),
  }));

  // Cells fade in row by row whenever a new game starts.
  useEffect(() => {
    Animated.timing(anim.fade, {
      toValue: 1,
      duration: reduce ? 0 : 300,
      delay: reduce ? 0 : Math.floor(index / 9) * 45,
      useNativeDriver: false,
    }).start();
  }, [gameId, anim.fade, index, reduce]);

  // A wrong entry: a red flash and a short shake.
  useEffect(() => {
    if (!shakeNonce) return;
    anim.flash.setValue(1);
    Animated.timing(anim.flash, { toValue: 0, duration: 450, useNativeDriver: false }).start();
    if (reduce) return;
    Animated.sequence([
      Animated.timing(anim.offset, { toValue: -7, duration: 40, useNativeDriver: false }),
      Animated.timing(anim.offset, { toValue: 7, duration: 40, useNativeDriver: false }),
      Animated.timing(anim.offset, { toValue: -5, duration: 40, useNativeDriver: false }),
      Animated.timing(anim.offset, { toValue: 5, duration: 40, useNativeDriver: false }),
      Animated.timing(anim.offset, { toValue: 0, duration: 40, useNativeDriver: false }),
    ]).start();
  }, [shakeNonce, anim, reduce]);

  // A completed row, column or block: a green glow that ripples across it.
  useEffect(() => {
    if (!glow.nonce) return;
    anim.glow.setValue(0);
    Animated.sequence([
      Animated.delay(reduce ? 0 : glow.delay),
      Animated.timing(anim.glow, { toValue: 1, duration: reduce ? 0 : 160, useNativeDriver: false }),
      Animated.timing(anim.glow, { toValue: 0, duration: reduce ? 0 : 520, useNativeDriver: false }),
    ]).start();
  }, [glow.nonce, glow.delay, anim.glow, reduce]);

  const row = Math.floor(index / 9);
  const col = index % 9;
  const bgColor = tone !== 'none' ? c.tone[tone] : possible ? c.tone.same : c.surface;
  const label = `Row ${row + 1}, column ${col + 1}, ${value ? `${given ? 'given' : 'your'} ${value}` : 'empty'}${wrong ? ', wrong' : ''}`;

  return (
    <Animated.View style={{ opacity: anim.fade, transform: [{ translateX: anim.offset }] }}>
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
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: c.flash, opacity: anim.flash }]} />
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: c.success, opacity: anim.glow }]} />
        {colorBlind && wrong ? <Text style={[styles.mark, styles.markWrong, { fontSize: size * 0.22 }]}>!</Text> : null}
        {colorBlind && tone === 'same' ? <Text style={[styles.mark, styles.markSame, { fontSize: size * 0.2 }]}>◆</Text> : null}
        {value ? (
          <Text style={[styles.value, { fontSize: size * 0.55 * (largeDigits ? 1.3 : 1), color: given ? c.given : wrong ? c.error : c.entry }]}>{value}</Text>
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
    mark: {
      position: 'absolute',
      fontWeight: '800',
      color: c.text,
    },
    markWrong: {
      top: 1,
      right: 3,
      color: c.error,
    },
    markSame: {
      top: 1,
      left: 3,
      color: c.accent,
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
