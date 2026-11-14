import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrefs } from '../prefs';
import { THEME_NAMES, useColors } from '../theme';
import type { Palette, ThemeName } from '../theme';

const MISTAKE_LIMITS: { value: number | null; label: string }[] = [
  { value: null, label: 'Casual' },
  { value: 3, label: '3 mistakes' },
  { value: 5, label: '5 mistakes' },
];

const THEME_LABELS: Record<ThemeName, string> = {
  light: 'Light',
  dark: 'Dark',
  oled: 'True black',
  sepia: 'Sepia',
};

export default function SettingsScreen() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const theme = usePrefs((s) => s.theme);
  const haptics = usePrefs((s) => s.haptics);
  const notes = usePrefs((s) => s.notes);
  const autoNotes = usePrefs((s) => s.autoNotes);
  const sound = usePrefs((s) => s.sound);
  const mistakeLimit = usePrefs((s) => s.mistakeLimit);
  const update = usePrefs((s) => s.update);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Settings</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme</Text>
          <View style={styles.chips} accessibilityRole="radiogroup">
            {THEME_NAMES.map((name) => {
              const active = name === theme;
              return (
                <Pressable
                  key={name}
                  accessibilityRole="radio"
                  aria-checked={active}
                  onPress={() => update('theme', name)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{THEME_LABELS[name]}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mistakes</Text>
          <Text style={styles.hint}>Wrong digits are counted. In capped modes, reaching the limit ends the game.</Text>
          <View style={styles.chips} accessibilityRole="radiogroup">
            {MISTAKE_LIMITS.map((m) => {
              const active = m.value === mistakeLimit;
              return (
                <Pressable
                  key={m.label}
                  accessibilityRole="radio"
                  aria-checked={active}
                  onPress={() => update('mistakeLimit', m.value)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{m.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <ToggleRow
            label="Notes"
            hint="Pencil marks on the game screen. Turning them off hides the notes controls."
            value={notes}
            onChange={(v) => update('notes', v)}
            styles={styles}
            c={c}
          />
          <ToggleRow
            label="Auto-notes"
            hint={notes ? 'Placing a digit removes it from the notes of cells in the same row, column and box.' : 'Needs Notes to be on.'}
            value={autoNotes}
            onChange={(v) => update('autoNotes', v)}
            disabled={!notes}
            styles={styles}
            c={c}
          />
          <ToggleRow
            label="Sound"
            hint="Short cues for taps, errors and wins."
            value={sound}
            onChange={(v) => update('sound', v)}
            styles={styles}
            c={c}
          />
          <ToggleRow
            label="Haptic feedback"
            hint={Platform.OS === 'web' ? 'Only on phones and tablets.' : 'Ticks on selection, feedback on errors and wins.'}
            value={haptics}
            onChange={(v) => update('haptics', v)}
            styles={styles}
            c={c}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleRow({
  label,
  hint,
  value,
  onChange,
  disabled = false,
  styles,
  c,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      aria-checked={value}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={[styles.toggleRow, disabled && styles.disabled]}
    >
      <View style={styles.toggleText}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
      <View style={[styles.track, { backgroundColor: value ? c.accent : c.line }]}>
        <View style={[styles.thumb, value && styles.thumbOn]} />
      </View>
    </Pressable>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.background,
    },
    content: {
      padding: 16,
      gap: 24,
      maxWidth: 560,
      width: '100%',
      alignSelf: 'center',
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    back: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: c.accent,
    },
    backText: {
      color: c.accent,
      fontWeight: '600',
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: c.text,
    },
    section: {
      gap: 12,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: c.muted,
      textTransform: 'uppercase',
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
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
      fontWeight: '600',
      color: c.text,
    },
    chipTextActive: {
      color: c.onAccent,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      padding: 14,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: c.line,
      backgroundColor: c.surface,
    },
    toggleText: {
      flex: 1,
      gap: 2,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: c.text,
    },
    hint: {
      fontSize: 13,
      color: c.muted,
    },
    track: {
      width: 46,
      height: 26,
      borderRadius: 13,
      padding: 3,
      justifyContent: 'center',
    },
    thumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#FFFFFF',
    },
    thumbOn: {
      alignSelf: 'flex-end',
    },
    disabled: {
      opacity: 0.5,
    },
  });
}
