import { useMemo } from 'react';
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../theme';
import type { Palette } from '../theme';

const REPO = 'https://github.com/kamalsoft/sudoku';

// About the app, the developer, how Parent lock works, and the disclaimer.
export default function AboutScreen() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>About</Text>
        </View>

        <View style={styles.hero}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} accessibilityLabel="Sudoku logo" />
          <Text style={styles.appName}>Sudoku</Text>
          <Text style={styles.version}>Version {version}</Text>
        </View>

        <Section title="About the app">
          <Text style={styles.body}>
            A calm, colourful Sudoku for kids and families. Five levels, a daily puzzle, hints, stars and badges,
            and friendly animals that walk across the board. It works in a browser, can be added to your home
            screen, and runs on phones and tablets.
          </Text>
        </Section>

        <Section title="Developer">
          <Text style={styles.body}>Made by kamalsoft.</Text>
          <Pressable accessibilityRole="link" onPress={() => void Linking.openURL(REPO)} style={styles.linkRow}>
            <Text style={styles.linkText}>Source code on GitHub</Text>
          </Pressable>
        </Section>

        <Section title="Privacy">
          <Text style={styles.body}>
            Everything stays on this device: games, stats, profiles and settings. There are no accounts, no ads and
            no tracking.
          </Text>
        </Section>

        <Section title="How Parent lock works">
          <Text style={styles.body}>
            Turn on Parent lock in Settings, under Kids. After that, opening Settings or the parent summary asks a
            simple sum. Pick the right answer to continue. Choose &quot;Not now&quot; to close the question.
          </Text>
        </Section>

        <View style={styles.disclaimer} accessibilityRole="summary">
          <Text style={styles.disclaimerTitle}>Disclaimer</Text>
          <Text style={styles.body}>
            This app is for fun and personal use. It is not a commercial product. It does not replicate any
            commercial product, and no code has been copied from any commercial game.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    content: { padding: 16, gap: 16, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 32 },
    topBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    back: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: c.radius, borderWidth: 1, borderColor: c.accent },
    backText: { color: c.accent, fontWeight: '600' },
    title: { fontSize: 24, fontWeight: '800', color: c.text },
    hero: { alignItems: 'center', gap: 6, paddingVertical: 8 },
    logo: { width: 96, height: 96 },
    appName: { fontSize: 26, fontWeight: '800', color: c.text },
    version: { fontSize: 14, color: c.muted },
    section: { gap: 8, padding: 16, borderRadius: c.radius + 4, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
    body: { fontSize: 15, lineHeight: 22, color: c.text },
    linkRow: { paddingVertical: 6 },
    linkText: { fontSize: 15, fontWeight: '700', color: c.accent },
    disclaimer: { gap: 8, padding: 16, borderRadius: c.radius + 4, borderWidth: 1, borderColor: c.muted, backgroundColor: c.background },
    disclaimerTitle: { fontSize: 15, fontWeight: '800', color: c.text },
  });
}
