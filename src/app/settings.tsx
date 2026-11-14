import { useMemo } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePrefs } from '../prefs';
import { THEME_NAMES, THEMES, useColors } from '../theme';
import type { Palette, ThemeName } from '../theme';

const THEME_LABELS: Record<ThemeName, string> = {
  light: 'Light',
  dark: 'Dark',
  oled: 'True black',
  sepia: 'Sepia',
  candy: 'Candy',
  jungle: 'Jungle',
  space: 'Space',
};

const MISTAKE_LIMITS: { value: number | null; label: string }[] = [
  { value: null, label: 'Casual' },
  { value: 3, label: '3' },
  { value: 5, label: '5' },
];

// Settings is grouped the way mobile apps usually are: Appearance, Gameplay, Feedback, About.
// Each group has a title and a footnote that explains what its options do.
export default function SettingsScreen() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const theme = usePrefs((s) => s.theme);
  const notes = usePrefs((s) => s.notes);
  const autoNotes = usePrefs((s) => s.autoNotes);
  const mistakeLimit = usePrefs((s) => s.mistakeLimit);
  const sound = usePrefs((s) => s.sound);
  const haptics = usePrefs((s) => s.haptics);
  const update = usePrefs((s) => s.update);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Settings</Text>
        </View>

        <Group title="Appearance">
          {THEME_NAMES.map((name, i) => {
            const active = name === theme;
            const palette = THEMES[name];
            return (
              <Row
                key={name}
                styles={styles}
                last={i === THEME_NAMES.length - 1}
                label={THEME_LABELS[name]}
                role="radio"
                checked={active}
                onPress={() => update('theme', name)}
                leading={
                  <View style={styles.swatch}>
                    <View style={[styles.swatchPart, { backgroundColor: palette.background }]} />
                    <View style={[styles.swatchPart, { backgroundColor: palette.accent }]} />
                    <View style={[styles.swatchPart, { backgroundColor: palette.entry }]} />
                  </View>
                }
                trailing={active ? <Text style={styles.check}>✓</Text> : null}
              />
            );
          })}
        </Group>

        <Group
          title="Gameplay"
          footer="Casual never ends a game. In a capped game, a wrong digit counts as a mistake, and reaching the limit ends it."
        >
          <View style={styles.rowPlain}>
            <Text style={[styles.label, styles.labelGrow]}>Mistake limit</Text>
            <Segmented styles={styles} c={c} options={MISTAKE_LIMITS} value={mistakeLimit} onChange={(v) => update('mistakeLimit', v)} />
          </View>
          <ToggleRow styles={styles} c={c} label="Notes" value={notes} onChange={(v) => update('notes', v)} />
          <ToggleRow
            styles={styles}
            c={c}
            label="Auto-notes"
            value={autoNotes}
            disabled={!notes}
            last
            onChange={(v) => update('autoNotes', v)}
          />
        </Group>

        <Group title="Feedback" footer={Platform.OS === 'web' ? 'Haptics work on phones and tablets only.' : undefined}>
          <ToggleRow styles={styles} c={c} label="Sound" value={sound} onChange={(v) => update('sound', v)} />
          <ToggleRow styles={styles} c={c} label="Haptic feedback" value={haptics} last onChange={(v) => update('haptics', v)} />
        </Group>

        <Group title="About">
          <Row styles={styles} label="Version" last trailing={<Text style={styles.value}>{version}</Text>} />
        </Group>
      </ScrollView>
    </SafeAreaView>
  );
}

// A titled card of related rows, with an optional footnote below.
function Group({ title, footer, children }: { title: string; footer?: string; children: React.ReactNode }) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={styles.group}>
      <Text style={styles.groupTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
}

// One row: optional leading content, the label, then the trailing value or control.
// A divider sits under every row except the last one in its group.
function Row({
  styles,
  label,
  leading,
  trailing,
  onPress,
  role,
  checked,
  last = false,
}: {
  styles: ReturnType<typeof makeStyles>;
  label: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  role?: 'radio';
  checked?: boolean;
  last?: boolean;
}) {
  const content = (
    <>
      {leading}
      <Text style={[styles.label, styles.labelGrow]}>{label}</Text>
      {trailing}
    </>
  );
  const rowStyle = [styles.row, !last && styles.divider];
  if (!onPress) return <View style={rowStyle}>{content}</View>;
  return (
    <Pressable
      accessibilityRole={role ?? 'button'}
      accessibilityLabel={label}
      aria-checked={role === 'radio' ? checked : undefined}
      onPress={onPress}
      style={({ pressed }) => [rowStyle, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

function ToggleRow({
  styles,
  c,
  label,
  value,
  onChange,
  disabled = false,
  last = false,
}: {
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
  last?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      aria-checked={value}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={({ pressed }) => [styles.row, !last && styles.divider, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={[styles.label, styles.labelGrow]}>{label}</Text>
      <View style={[styles.track, { backgroundColor: value ? c.accent : c.line }]}>
        <View style={[styles.thumb, value && styles.thumbOn]} />
      </View>
    </Pressable>
  );
}

// Small segmented control for a short list of choices.
function Segmented<T extends number | null>({
  styles,
  c,
  options,
  value,
  onChange,
}: {
  styles: ReturnType<typeof makeStyles>;
  c: Palette;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.segmented} accessibilityRole="radiogroup">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="radio"
            accessibilityLabel={o.value === null ? 'Casual, no limit' : `${o.label} mistakes`}
            aria-checked={active}
            onPress={() => onChange(o.value)}
            style={[styles.segment, active && { backgroundColor: c.accent }]}
          >
            <Text style={[styles.segmentText, { color: active ? c.onAccent : c.text }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
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
      paddingBottom: 32,
      gap: 8,
      maxWidth: 560,
      width: '100%',
      alignSelf: 'center',
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
    },
    back: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: c.radius,
      borderWidth: 1,
      borderColor: c.accent,
    },
    backText: {
      color: c.accent,
      fontWeight: '600',
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: c.text,
    },
    group: {
      gap: 6,
      marginTop: 12,
    },
    groupTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: c.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      paddingHorizontal: 4,
    },
    card: {
      borderRadius: c.radius + 4,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.line,
      overflow: 'hidden',
    },
    footer: {
      fontSize: 13,
      color: c.muted,
      paddingHorizontal: 4,
      marginTop: 2,
    },
    row: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    rowPlain: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: c.line,
    },
    divider: {
      borderBottomWidth: 1,
      borderBottomColor: c.line,
    },
    pressed: {
      backgroundColor: c.line,
    },
    disabled: {
      opacity: 0.45,
    },
    label: {
      fontSize: 16,
      color: c.text,
    },
    labelGrow: {
      flex: 1,
    },
    value: {
      fontSize: 16,
      color: c.muted,
      fontVariant: ['tabular-nums'],
    },
    check: {
      fontSize: 18,
      fontWeight: '800',
      color: c.accent,
    },
    swatch: {
      flexDirection: 'row',
      width: 40,
      height: 24,
      borderRadius: 6,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: c.line,
    },
    swatchPart: {
      flex: 1,
    },
    segmented: {
      flexDirection: 'row',
      borderRadius: c.radius,
      borderWidth: 1,
      borderColor: c.accent,
      overflow: 'hidden',
    },
    segment: {
      minWidth: 52,
      paddingHorizontal: 10,
      paddingVertical: 6,
      alignItems: 'center',
    },
    segmentText: {
      fontSize: 14,
      fontWeight: '700',
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
  });
}
