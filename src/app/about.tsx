import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT } from '../i18n';
import { useColors } from '../theme';
import type { Palette } from '../theme';

// About the app, the developer, privacy, how Parent lock works, and the disclaimer.
export default function AboutScreen() {
  const c = useColors();
  const t = useT();
  const styles = useMemo(() => makeStyles(c), [c]);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>{t('back')}</Text>
          </Pressable>
          <Text style={styles.title}>{t('about_title')}</Text>
        </View>

        <View style={styles.hero}>
          <Image source={require('../../assets/logo.png')} style={styles.logo} accessibilityLabel="Sudoku logo" />
          <Text style={styles.appName}>Sudoku</Text>
          <Text style={styles.version}>{t('about_version', { v: version })}</Text>
        </View>

        <Section title={t('about_app_head')}>
          <Text style={styles.body}>{t('about_app_body')}</Text>
        </Section>

        <Section title={t('about_dev_head')}>
          <Text style={styles.body}>{t('about_dev_body')}</Text>
        </Section>

        <Section title={t('about_privacy_head')}>
          <Text style={styles.body}>{t('about_privacy_body')}</Text>
        </Section>

        <Section title={t('about_parent_head')}>
          <Text style={styles.body}>{t('about_parent_body')}</Text>
        </Section>

        <Pressable accessibilityRole="link" onPress={() => router.push('/privacy')} style={styles.linkButton}>
          <Text style={styles.linkText}>{t('privacy')}</Text>
        </Pressable>
        <Pressable accessibilityRole="link" onPress={() => router.push('/terms')} style={styles.linkButton}>
          <Text style={styles.linkText}>{t('terms')}</Text>
        </Pressable>

        <View style={styles.disclaimer} accessibilityRole="summary">
          <Text style={styles.disclaimerTitle}>{t('about_disclaimer_title')}</Text>
          <Text style={styles.body}>{t('about_disclaimer_body')}</Text>
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
    linkText: { fontSize: 15, fontWeight: '700', color: c.accent },
    linkButton: { alignItems: 'center', paddingVertical: 12, borderRadius: c.radius, borderWidth: 2, borderColor: c.accent },
    disclaimer: { gap: 8, padding: 16, borderRadius: c.radius + 4, borderWidth: 1, borderColor: c.muted, backgroundColor: c.background },
    disclaimerTitle: { fontSize: 15, fontWeight: '800', color: c.text },
  });
}
