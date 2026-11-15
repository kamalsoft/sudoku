import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useT } from '../i18n';
import { useProgress } from '../sudoku/progressStore';
import { weekSummary } from '../sudoku/progress';
import { dayKey, formatDuration } from '../sudoku/stats';
import { useColors } from '../theme';
import type { Palette } from '../theme';

// For grown-ups: the last seven days at a glance.
export default function SummaryScreen() {
  const c = useColors();
  const t = useT();
  const styles = useMemo(() => makeStyles(c), [c]);
  const games = useProgress((s) => s.games);
  useEffect(() => {
    void useProgress.getState().load();
  }, []);

  const week = useMemo(() => weekSummary(games, dayKey(new Date())), [games]);
  const totals = week.reduce(
    (acc, d) => ({ played: acc.played + d.played, won: acc.won + d.won, ms: acc.ms + d.ms }),
    { played: 0, won: 0, ms: 0 },
  );
  const busiest = Math.max(1, ...week.map((d) => d.played));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>{t('back')}</Text>
          </Pressable>
          <Text style={styles.title}>{t('last_7_days')}</Text>
        </View>

        <View style={styles.totals}>
          <Text style={styles.total}>{t('total_played', { n: totals.played })}</Text>
          <Text style={styles.total}>{t('total_won', { n: totals.won })}</Text>
          <Text style={styles.total}>{t('total_time', { time: formatDuration(totals.ms) })}</Text>
        </View>

        <View style={styles.chart} accessibilityLabel={t('bars_label')}>
          {week.map((d) => (
            <View key={d.day} style={styles.column}>
              <Text style={styles.count}>{d.played}</Text>
              <View style={[styles.bar, { height: `${(d.played / busiest) * 100}%` }]} />
              <Text style={styles.day}>{d.day.slice(8)}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.note}>{t('bars_note')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.background },
    content: { padding: 16, gap: 20, maxWidth: 560, width: '100%', alignSelf: 'center' },
    topBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    back: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: c.radius, borderWidth: 1, borderColor: c.accent },
    backText: { color: c.accent, fontWeight: '600' },
    title: { fontSize: 24, fontWeight: '800', color: c.text },
    totals: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
    total: { fontSize: 16, fontWeight: '700', color: c.text },
    chart: { height: 220, flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 12, borderRadius: c.radius + 4, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line },
    column: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
    count: { fontSize: 12, color: c.muted },
    bar: { width: '70%', minHeight: 4, borderRadius: 6, backgroundColor: c.accent },
    day: { fontSize: 12, color: c.muted },
    note: { fontSize: 13, color: c.muted },
  });
}
