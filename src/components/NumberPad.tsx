import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePrefs } from '../prefs';
import { useT } from '../i18n';
import { useGameStore } from '../sudoku/store';
import type { Mode } from '../sudoku/moves';
import { useColors } from '../theme';
import type { Palette } from '../theme';

// Keys have a fixed height so the whole pad fits on screen beside the board. Nothing here scrolls.
export const PAD_KEY_HEIGHT = 44;

interface Props {
  width: number;
}

// Digits 1 to 9, then Pencil, Erase and Hint. Pencil shows only while Notes is on in Settings.
export function NumberPad({ width }: Props) {
  const c = useColors();
  const t = useT();
  const styles = useMemo(() => makeStyles(c), [c]);
  const mode = useGameStore((s) => s.mode);
  const setMode = useGameStore((s) => s.setMode);
  const inputDigit = useGameStore((s) => s.inputDigit);
  const clearSelected = useGameStore((s) => s.clearSelected);
  const useHint = useGameStore((s) => s.useHint);
  const hintsUsed = useGameStore((s) => s.hints);
  const hintsOn = usePrefs((s) => s.hints);
  const hintLimit = usePrefs((s) => s.hintLimit);
  const notes = usePrefs((s) => s.notes);
  const largeDigits = usePrefs((s) => s.largeDigits);
  const hintsLeft = hintLimit === null ? null : Math.max(0, hintLimit - hintsUsed);
  const gap = 8;
  const keySize = (width - gap * 2) / 3;

  const pencilTool = (m: Mode, label: string) => {
    const active = mode === m;
    return (
      <Pressable
        key={m}
        accessibilityRole="button"
        accessibilityLabel={label}
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
            style={({ pressed }) => [styles.key, { width: keySize, height: PAD_KEY_HEIGHT, transform: [{ scale: pressed ? 0.94 : 1 }] }]}
          >
            <Text style={[styles.keyText, largeDigits && { fontSize: 30 }]}>{n + 1}</Text>
          </Pressable>
        ))}
      </View>
      <View style={[styles.row, { gap }]}>
        {notes ? pencilTool('pencil', t('pencil')) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('erase')}
          accessibilityHint={t('erase_hint')}
          onPress={clearSelected}
          style={({ pressed }) => [styles.tool, styles.erase, pressed && styles.erasePressed]}
        >
          <MaterialCommunityIcons name="eraser" size={20} color={c.text} />
          <Text style={styles.toolText}>{t('erase')}</Text>
        </Pressable>
        {hintsOn ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('hint')}
            accessibilityHint={t('hint_hint')}
            disabled={hintsLeft === 0}
            onPress={useHint}
            style={[styles.tool, styles.hint, hintsLeft === 0 && styles.disabled]}
          >
            <Text style={styles.toolText}>{t('hint')}{hintsLeft === null ? '' : ` · ${hintsLeft}`}</Text>
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
      height: 44,
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
      borderColor: c.accent,
    },
    disabled: {
      opacity: 0.4,
    },
    toolActive: {
      backgroundColor: c.accent,
      borderColor: c.accent,
    },
    toolText: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
    toolTextActive: {
      color: c.onAccent,
    },
  });
}
