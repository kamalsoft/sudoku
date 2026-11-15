import { useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useT } from '../i18n';
import { useGameStore } from '../sudoku/store';
import { useColors } from '../theme';
import type { Palette } from '../theme';

// Names the rows, columns or blocks that were just completed, then fades away.
export function CompletionToast() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const flash = useGameStore((s) => s.unitFlash);
  const t = useT();
  const names = (flash?.units ?? []).map((u) =>
    u < 9 ? t('unit_row', { n: u + 1 }) : u < 18 ? t('unit_column', { n: u - 8 }) : t('unit_block', { n: u - 17 }),
  );
  const text = flash ? t('unit_complete', { units: names.join(t('units_joined')) }) : '';
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!flash) return;
    opacity.setValue(0);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: false }),
      Animated.delay(1100),
      Animated.timing(opacity, { toValue: 0, duration: 420, useNativeDriver: false }),
    ]).start();
  }, [flash, opacity]);

  return (
    <Animated.View pointerEvents="none" style={[styles.toast, { opacity }]}>
      <Text style={styles.text} accessibilityLiveRegion="polite">
        {text}
      </Text>
    </Animated.View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    toast: {
      position: 'absolute',
      top: 64,
      alignSelf: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: c.radius,
      backgroundColor: c.accent,
    },
    text: {
      color: c.onAccent,
      fontWeight: '700',
      fontSize: 15,
    },
  });
}
