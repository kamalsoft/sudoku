import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useGate } from '../gate';
import { useT } from '../i18n';
import { useColors } from '../theme';
import type { Palette } from '../theme';

// A grown-up's check before Settings or the parent summary opens. Shown above every screen.
export function ParentGate() {
  const c = useColors();
  const t = useT();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { open, a, b, options, answer, onPass, close } = useGate();
  const [wrong, setWrong] = useState(false);

  if (!open) return null;

  const pick = (n: number) => {
    if (n !== answer) {
      setWrong(true);
      return;
    }
    setWrong(false);
    const go = onPass;
    close();
    go?.();
  };

  return (
    <View style={styles.backdrop} accessibilityViewIsModal>
      <View style={styles.card}>
        <Text style={styles.heading}>{t('grown_ups')}</Text>
        <Text style={styles.question}>{t('gate_question', { a, b })}</Text>
        <View style={styles.options}>
          {options.map((n) => (
            <Pressable key={n} accessibilityRole="button" accessibilityLabel={`${n}`} onPress={() => pick(n)} style={styles.option}>
              <Text style={styles.optionText}>{n}</Text>
            </Pressable>
          ))}
        </View>
        {wrong ? <Text style={styles.hint}>{t('gate_wrong')}</Text> : null}
        <Pressable accessibilityRole="button" onPress={() => { setWrong(false); close(); }} style={styles.cancel}>
          <Text style={styles.cancelText}>{t('not_now')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    backdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      padding: 24,
      zIndex: 10,
    },
    card: {
      width: '100%',
      maxWidth: 340,
      padding: 24,
      borderRadius: c.radius + 6,
      backgroundColor: c.surface,
      gap: 14,
      alignItems: 'center',
    },
    heading: { fontSize: 14, fontWeight: '700', color: c.muted, textTransform: 'uppercase' },
    question: { fontSize: 26, fontWeight: '800', color: c.text },
    options: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    option: { width: 80, height: 56, borderRadius: c.radius, borderWidth: 2, borderColor: c.accent, alignItems: 'center', justifyContent: 'center' },
    optionText: { fontSize: 20, fontWeight: '800', color: c.accent },
    hint: { fontSize: 14, color: c.error, fontWeight: '600' },
    cancel: { paddingVertical: 8 },
    cancelText: { color: c.muted, fontWeight: '600' },
  });
}
