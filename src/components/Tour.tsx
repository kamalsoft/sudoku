import { useEffect, useMemo, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useReduceMotion } from '../motion';
import { TOUR_STEPS, useTour } from '../tour';
import { useColors } from '../theme';
import type { Palette } from '../theme';

// The app tour: a card over the game with one idea per step and a short demo on the first.
export function Tour() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const open = useTour((s) => s.open);
  const step = useTour((s) => s.step);
  const go = useTour((s) => s.go);
  const close = useTour((s) => s.close);
  const current = TOUR_STEPS[step];
  const last = step === TOUR_STEPS.length - 1;

  return (
    <Modal transparent visible={open} animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop} accessibilityViewIsModal>
        <View style={styles.card}>
          <View style={styles.topRow}>
            <Text style={styles.count}>{step + 1} / {TOUR_STEPS.length}</Text>
            <Pressable accessibilityRole="button" onPress={close} style={styles.skip}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>
          {current.demo ? <Demo /> : null}
          <Text style={styles.title}>{current.title}</Text>
          <Text style={styles.body}>{current.body}</Text>
          <View style={styles.dots}>
            {TOUR_STEPS.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotOn]} />
            ))}
          </View>
          <View style={styles.buttons}>
            <Pressable
              accessibilityRole="button"
              disabled={step === 0}
              onPress={() => go(step - 1)}
              style={[styles.button, step === 0 && styles.disabled]}
            >
              <Text style={styles.buttonText}>Back</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => (last ? close() : go(step + 1))} style={[styles.button, styles.primary]}>
              <Text style={styles.primaryText}>{last ? 'Done' : 'Next'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Nine digits fill in one by one, then the row lights up: what completing a row looks like.
function Demo() {
  const c = useColors();
  const reduce = useReduceMotion();
  const [values] = useState(() => Array.from({ length: 9 }, () => new Animated.Value(0)));
  const [glow] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (reduce) {
      values.forEach((v) => v.setValue(1));
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([...values.map((v) => Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: false })), Animated.timing(glow, { toValue: 0, duration: 0, useNativeDriver: false })]),
        Animated.stagger(110, values.map((v) => Animated.timing(v, { toValue: 1, duration: 180, useNativeDriver: false }))),
        Animated.timing(glow, { toValue: 1, duration: 300, useNativeDriver: false }),
        Animated.delay(1200),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [values, glow, reduce]);

  return (
    <Animated.View style={[demoStyles.row, { backgroundColor: glow.interpolate({ inputRange: [0, 1], outputRange: [c.surface, c.success] }) }]} accessibilityElementsHidden>
      {values.map((v, i) => (
        <Animated.View key={i} style={[demoStyles.cell, { borderColor: c.line, opacity: v }]}>
          <Text style={[demoStyles.digit, { color: c.entry }]}>{i + 1}</Text>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

const demoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignSelf: 'center', borderRadius: 8, padding: 4, gap: 2 },
  cell: { width: 26, height: 30, borderWidth: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 4 },
  digit: { fontSize: 15, fontWeight: '800' },
});

function makeStyles(c: Palette) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.5)', alignItems: 'center', justifyContent: 'center', padding: 20 },
    card: { width: '100%', maxWidth: 380, padding: 20, borderRadius: c.radius + 6, backgroundColor: c.surface, gap: 12 },
    topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    count: { fontSize: 13, fontWeight: '700', color: c.muted },
    skip: { paddingVertical: 4, paddingHorizontal: 8 },
    skipText: { fontSize: 14, fontWeight: '700', color: c.muted },
    title: { fontSize: 22, fontWeight: '800', color: c.text, textAlign: 'center' },
    body: { fontSize: 16, lineHeight: 23, color: c.text, textAlign: 'center' },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.line },
    dotOn: { backgroundColor: c.accent, width: 18 },
    buttons: { flexDirection: 'row', gap: 10 },
    button: { flex: 1, height: 46, borderRadius: c.radius, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.accent },
    primary: { backgroundColor: c.accent },
    disabled: { opacity: 0.35 },
    buttonText: { fontSize: 16, fontWeight: '700', color: c.accent },
    primaryText: { fontSize: 16, fontWeight: '700', color: c.onAccent },
  });
}
