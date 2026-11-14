import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../sudoku/store';
import type { Mode } from '../sudoku/moves';
import { useColors } from '../theme';
import type { Palette } from '../theme';

interface Props {
  width: number;
}

const MODES: { mode: Mode; label: string }[] = [
  { mode: 'pencil', label: 'Pencil' },
  { mode: 'erase', label: 'Erase' },
];

export function NumberPad({ width }: Props) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const mode = useGameStore((s) => s.mode);
  const setMode = useGameStore((s) => s.setMode);
  const inputDigit = useGameStore((s) => s.inputDigit);
  const fillNotes = useGameStore((s) => s.fillNotes);
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const gap = 8;
  const keySize = (width - gap * 2) / 3;

  return (
    <View style={{ width, gap }}>
      <View style={[styles.digits, { gap }]}>
        {Array.from({ length: 9 }, (_, n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`Digit ${n + 1}`}
            onPress={() => inputDigit(n + 1)}
            style={({ pressed }) => [styles.key, { width: keySize, height: keySize * 0.5, transform: [{ scale: pressed ? 0.94 : 1 }] }]}
          >
            <Text style={styles.keyText}>{n + 1}</Text>
          </Pressable>
        ))}
      </View>
      <View style={[styles.row, { gap }]}>
        {MODES.map(({ mode: m, label }) => {
          const active = mode === m;
          return (
            <Pressable
              key={m}
              accessibilityRole="button"
              accessibilityLabel={`${label} mode`}
              aria-pressed={active}
              onPress={() => setMode(active ? 'enter' : m)}
              style={[styles.modeKey, active && styles.modeKeyActive]}
            >
              <Text style={[styles.modeText, active && styles.modeTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
        <Pressable accessibilityRole="button" accessibilityLabel="Fill notes" onPress={fillNotes} style={styles.modeKey}>
          <Text style={styles.modeText}>Notes</Text>
        </Pressable>
      </View>
      <View style={[styles.row, { gap }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Undo" onPress={undo} style={styles.modeKey}>
          <Text style={styles.modeText}>Undo</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Redo" onPress={redo} style={styles.modeKey}>
          <Text style={styles.modeText}>Redo</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    digits: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    key: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.line,
    },
    keyText: {
      fontSize: 22,
      fontWeight: '600',
      color: c.text,
    },
    row: {
      flexDirection: 'row',
    },
    modeKey: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: 44,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    modeKeyActive: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },
    modeText: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
    },
    modeTextActive: {
      color: c.onAccent,
    },
  });
}
