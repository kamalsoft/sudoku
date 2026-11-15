import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useT } from '../i18n';
import { elapsedMs, remainingMs } from '../sudoku/session';
import { useGameStore } from '../sudoku/store';
import { formatDuration } from '../sudoku/stats';
import { guardedTimeLimit } from '../sudoku/rules';
import { usePrefs } from '../prefs';
import { useMenu } from '../menu';
import { useColors } from '../theme';
import type { Palette } from '../theme';

// The one line of game information: the menu button, the title, and time and mistakes.
export function TopBar() {
  const c = useColors();
  const t = useT();
  const styles = useMemo(() => makeStyles(c), [c]);
  const show = useMenu((s) => s.show);
  const solved = useGameStore((s) => s.solved);
  const failed = useGameStore((s) => s.failed);
  const running = useGameStore((s) => s.runningSince !== null);
  const accumulated = useGameStore((s) => s.accumulatedMs);
  const runningSince = useGameStore((s) => s.runningSince);
  const timeLimitMs = useGameStore((s) => s.timeLimitMs);
  const mistakes = useGameStore((s) => s.mistakes);
  const daily = useGameStore((s) => s.daily);
  const kidSafe = usePrefs((s) => s.kidSafe);
  const mistakeLimit = usePrefs((s) => s.mistakeLimit);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => {
      setNow(Date.now());
      useGameStore.getState().tick();
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = elapsedMs(accumulated, runningSince, now);
  const limit = guardedTimeLimit(kidSafe, timeLimitMs);
  const status = solved
    ? t('solved')
    : failed === 'time'
      ? t('times_up')
      : failed === 'mistakes'
        ? t('out_of_mistakes')
        : limit !== null
          ? `${formatDuration(remainingMs(limit, elapsed))} ${t('left')}`
          : running
            ? formatDuration(elapsed)
            : t('paused');
  const guarded = kidSafe ? null : mistakeLimit;
  const mistakeText = guarded !== null ? `${t('mistakes')} ${mistakes} ${t('of')} ${guarded}` : mistakes > 0 ? `${t('mistakes')} ${mistakes}` : null;

  return (
    <View style={styles.bar}>
      <Pressable accessibilityRole="button" accessibilityLabel="Menu" onPress={show} style={styles.menuButton}>
        <MaterialCommunityIcons name="menu" size={26} color={c.text} />
      </Pressable>
      <View style={styles.middle}>
        <Text style={styles.title}>Sudoku</Text>
        <Text style={styles.line} accessibilityLiveRegion="polite" numberOfLines={1}>
          {[status, daily !== null ? t('daily_challenge') : null, mistakeText].filter(Boolean).join(' · ')}
        </Text>
      </View>
      <View style={styles.spacer} />
    </View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    bar: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    menuButton: {
      width: 44,
      height: 44,
      borderRadius: c.radius,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.line,
    },
    middle: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: c.text,
    },
    line: {
      fontSize: 13,
      color: c.muted,
      fontVariant: ['tabular-nums'],
    },
    spacer: {
      width: 44,
    },
  });
}
