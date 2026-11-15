import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT } from '../i18n';
import { SKIN_CATEGORIES, SKIN_KEYS } from '../skins';
import { usePrefs } from '../prefs';
import { THEMES, useColors } from '../theme';
import type { Palette, ThemeName } from '../theme';

// The Skins screen: skins grouped into categories. Tapping a card changes the look straight away.
export default function SkinsScreen() {
  const c = useColors();
  const t = useT();
  const styles = useMemo(() => makeStyles(c), [c]);
  const current = usePrefs((s) => s.theme);
  const update = usePrefs((s) => s.update);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>{t('back')}</Text>
          </Pressable>
          <Text style={styles.title}>{t('skins_title')}</Text>
        </View>
        <Text style={styles.intro}>{t('skins_intro')}</Text>

        {SKIN_CATEGORIES.map((cat) => (
          <View key={cat.id} style={styles.category}>
            <Text style={styles.categoryTitle}>{t(cat.title)}</Text>
            <View style={styles.grid} accessibilityRole="radiogroup">
              {cat.skins.map((name: ThemeName) => {
                const on = name === current;
                const palette = THEMES[name];
                return (
                  <Pressable
                    key={name}
                    accessibilityRole="radio"
                    accessibilityLabel={t(SKIN_KEYS[name])}
                    aria-checked={on}
                    onPress={() => update('theme', name)}
                    style={[styles.card, on && { borderColor: c.accent, borderWidth: 3 }]}
                  >
                    <View style={[styles.preview, { backgroundColor: palette.background, borderColor: palette.lineStrong }]}>
                      <View style={[styles.previewRow, { backgroundColor: palette.surface }]}>
                        <View style={[styles.dot, { backgroundColor: palette.entry }]} />
                        <View style={[styles.dot, { backgroundColor: palette.accent }]} />
                        <View style={[styles.dot, { backgroundColor: palette.error }]} />
                      </View>
                      <View style={[styles.previewLine, { backgroundColor: palette.line }]} />
                      <View style={[styles.previewLine, { backgroundColor: palette.lineStrong, width: '60%' }]} />
                    </View>
                    <View style={styles.cardFooter}>
                      <Text style={styles.name}>{t(SKIN_KEYS[name])}</Text>
                      {on ? <Text style={styles.check}>✓</Text> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    content: { padding: 16, gap: 18, maxWidth: 560, width: '100%', alignSelf: 'center', paddingBottom: 32 },
    topBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    back: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: c.radius, borderWidth: 1, borderColor: c.accent },
    backText: { color: c.accent, fontWeight: '600' },
    title: { fontSize: 24, fontWeight: '800', color: c.text },
    intro: { fontSize: 14, lineHeight: 20, color: c.muted },
    category: { gap: 8 },
    categoryTitle: { fontSize: 13, fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    card: { width: '48%', flexGrow: 1, borderRadius: c.radius + 4, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, padding: 8, gap: 8 },
    preview: { height: 84, borderRadius: c.radius, borderWidth: 1, padding: 8, gap: 6 },
    previewRow: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: 6 },
    dot: { width: 12, height: 12, borderRadius: 6 },
    previewLine: { height: 6, borderRadius: 3 },
    cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4 },
    name: { fontSize: 15, fontWeight: '700', color: c.text },
    check: { fontSize: 18, fontWeight: '800', color: c.accent },
  });
}
