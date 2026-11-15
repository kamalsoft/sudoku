import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT } from '../i18n';
import { useColors } from '../theme';
import type { Palette } from '../theme';

// A simple reading page: a back button, a title and a scrolling body. Used by Privacy, Terms and How to play.
export function Page({ title, children }: { title: string; children: React.ReactNode }) {
  const c = useColors();
  const t = useT();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>{t('back')}</Text>
          </Pressable>
          <Text style={styles.title}>{title}</Text>
        </View>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Heading({ children }: { children: string }) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return <Text style={styles.heading}>{children}</Text>;
}

export function Para({ children }: { children: string }) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return <Text style={styles.para}>{children}</Text>;
}

export function Bullet({ children }: { children: string }) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bulletDot}>•</Text>
      <Text style={styles.para}>{children}</Text>
    </View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    content: { padding: 16, gap: 14, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 40 },
    topBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    back: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: c.radius, borderWidth: 1, borderColor: c.accent },
    backText: { color: c.accent, fontWeight: '600' },
    title: { fontSize: 24, fontWeight: '800', color: c.text, flexShrink: 1 },
    heading: { fontSize: 17, fontWeight: '800', color: c.text, marginTop: 6 },
    para: { fontSize: 15, lineHeight: 22, color: c.text, flexShrink: 1 },
    bulletRow: { flexDirection: 'row', gap: 8, paddingLeft: 4 },
    bulletDot: { fontSize: 15, color: c.accent, lineHeight: 22 },
  });
}
