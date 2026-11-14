import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePrefs } from '../prefs';
import { useGameStore } from '../sudoku/store';
import type { Mode } from '../sudoku/moves';
import { useColors } from '../theme';
import type { Palette } from '../theme';

interface Props {
  width: number;
}

// Digits are always shown. Erase clears the selected cell in one tap.
// Pencil and Fill notes appear only while Notes is on in Settings.
export function NumberPad({ width }: Props) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const mode = useGameStore((s) => s.mode);
  const setMode = useGameStore((s) => s.setMode);
  const inputDigit = useGameStore((s) => s.inputDigit);
  const clearSelected = useGameStore((s) => s.clearSelected);
  const useHint = useGameStore((s) => s.useHint);
  const hintsUsed = useGameStore((s) => s.hints);
  const hintsOn = usePrefs((s) => s.hints);
  const hintLimit = usePrefs((s) => s.hintLimit);
  const hintsLeft = hintLimit === null ? null : Math.max(0, hintLimit - hintsUsed);
  const fillNotes = useGameStore((s) => s.fillNotes);
  const notes = usePrefs((s) => s.notes);
  const largeDigits = usePrefs((s) => s.largeDigits);
  const gap = 8;
  const keySize = (width - gap * 2) / 3;

  const pencilTool = (m: Mode, label: string) => {
    const active = mode === m;
    return (
      <Pressable
        key={m}
        accessibilityRole="button"
        accessibilityLabel={`${label} mode`}
        aria-pressed={active}
        onPress={() => setMode(active ? 'enter' : m)}
        style={[styles.tool, active && styles.toolActive]}
      >
        <Text style={[styles.toolText, active && styles.toolTextActive]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <View style={{ width, gap }}>
      <View style={[styles.digits, { gap }]}>
        {Array.from({ length: 9 }, (_, n) => (
          <Pressable
            key={n}
            accessibilityRole="button"
            accessibilityLabel={`Digit ${n + 1}`}
            onPress={() => inputDigit(n + 1)}
            style={({ pressed }) => [styles.key, { width: keySize, height: keySize * 0.6, transform: [{ scale: pressed ? 0.94 : 1 }] }]}
          >
            <Text style={[styles.keyText, largeDigits && { fontSize: 31 }]}>{n + 1}</Text>
          </Pressable>
        ))}
      </View>
      {hintsOn ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Hint"
          accessibilityHint="Fills the selected empty cell with the right digit. It does not count as a mistake."
          disabled={hintsLeft === 0}
          onPress={useHint}
          style={[styles.hint, hintsLeft === 0 && styles.disabled]}
        >
          <Text style={styles.toolText}>Hint{hintsLeft === null ? '' : ` · ${hintsLeft} left`}</Text>
        </Pressable>
      ) : null}
      <View style={[styles.row, { gap }]}>
        {notes ? pencilTool('pencil', 'Pencil') : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Erase selected cell"
          accessibilityHint="Removes the digit you entered in the selected cell"
          onPress={clearSelected}
          style={({ pressed }) => [styles.tool, styles.erase, pressed && styles.erasePressed]}
        >
          <MaterialCommunityIcons name="eraser" size={20} color={c.text} />
          <Text style={styles.toolText}>Erase</Text>
        </Pressable>
        {notes ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Fill notes" onPress={fillNotes} style={styles.tool}>
            <Text style={styles.toolText}>Fill notes</Text>
          </Pressable>
        ) : null}
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
      borderRadius: c.radius,
      backgroundColor: c.surface,
      borderWidth: 2,
      borderColor: c.line,
    },
    keyText: {
      fontSize: 24,
      fontWeight: '800',
      color: c.text,
    },
    row: {
      flexDirection: 'row',
    },
    tool: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 48,
      borderRadius: c.radius,
      borderWidth: 2,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    erase: {
      borderColor: c.accent,
    },
    erasePressed: {
      backgroundColor: c.line,
    },
    hint: {
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: c.radius,
      borderWidth: 2,
      borderColor: c.accent,
      backgroundColor: c.surface,
    },
    disabled: {
      opacity: 0.4,
    },
    toolActive: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },
    toolText: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
    },
    toolTextActive: {
      color: c.onAccent,
    },
  });
}
