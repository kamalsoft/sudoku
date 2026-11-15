import { useEffect, useMemo, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useMotivation } from '../motivationStore';
import { useColors } from '../theme';
import type { Palette } from '../theme';

// A short, friendly line over the board: a welcome at the start, and a gentle note after a wrong number.
export function MotivationToast() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const message = useMotivation((s) => s.message);
  const nonce = useMotivation((s) => s.nonce);
  const [opacity] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!nonce) return;
    opacity.setValue(0);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: false }),
      Animated.delay(2000),
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: false }),
    ]).start();
  }, [nonce, opacity]);

  if (!message) return null;
  return (
    <Animated.View pointerEvents="none" style={[styles.toast, { opacity }]}>
      <Text style={styles.text} accessibilityLiveRegion="polite">
        {message}
      </Text>
    </Animated.View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    toast: {
      position: 'absolute',
      top: 104,
      alignSelf: 'center',
      maxWidth: '88%',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: c.radius,
      backgroundColor: c.surface,
      borderWidth: 2,
      borderColor: c.accent,
    },
    text: {
      color: c.text,
      fontWeight: '700',
      fontSize: 14,
      textAlign: 'center',
    },
  });
}
