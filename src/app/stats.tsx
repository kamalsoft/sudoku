import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loadGames } from '../db/persistence';
import { CountUp } from '../components/CountUp';
import type { Difficulty } from '../sudoku/engine';
import { dayKey, formatDuration, summarize } from '../sudoku/stats';
import type { Stats } from '../sudoku/stats';
import { useColors } from '../theme';
import type { Palette } from '../theme';

const LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
  evil: 'Evil',
};

export default function StatsScreen() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    loadGames().then((games) => setStats(summarize(games, dayKey(new Date()))));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Text style={styles.title}>Statistics</Text>
        </View>

        {!stats ? (
          <ActivityIndicator color={c.accent} />
        ) : (
          <>
            <View style={styles.summary}>
              <Summary label="Played" value={stats.played} />
              <Summary label="Won" value={stats.won} />
              <Summary label="Win rate" value={stats.winRate === null ? null : stats.winRate * 100} suffix="%" />
              <Summary label="Streak (days)" value={stats.streak} />
              <Summary label="Daily challenges won" value={stats.dailyWins} />
              <Summary label="Daily streak" value={stats.dailyStreak} />
            </View>

            <View style={styles.table}>
              <View style={[styles.row, styles.head]}>
                <Text style={[styles.cell, styles.headText]}>Difficulty</Text>
                <Text style={[styles.cell, styles.headText]}>Played</Text>
                <Text style={[styles.cell, styles.headText]}>Won</Text>
                <Text style={[styles.cell, styles.headText]}>Best</Text>
              </View>
              {(Object.keys(LABELS) as Difficulty[]).map((d) => {
                const row = stats.byDifficulty[d];
                return (
                  <View key={d} style={styles.row}>
                    <Text style={styles.cell}>{LABELS[d]}</Text>
                    <Text style={styles.cell}>{row.played}</Text>
                    <Text style={styles.cell}>{row.won}</Text>
                    <Text style={styles.cell}>{row.bestMs === null ? '—' : formatDuration(row.bestMs)}</Text>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Summary({ label, value, suffix = '' }: { label: string; value: number | null; suffix?: string }) {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  return (
    <View style={styles.summaryItem}>
      {value === null ? (
        <Text style={styles.summaryValue}>—</Text>
      ) : (
        <CountUp value={value} format={(n) => `${Math.round(n)}${suffix}`} style={styles.summaryValue} />
      )}
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: c.background,
  },
  content: {
    padding: 16,
    gap: 20,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: c.accent,
  },
  backText: {
    color: c.accent,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: c.text,
  },
  summary: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryItem: {
    flexGrow: 1,
    minWidth: 120,
    padding: 14,
    borderRadius: 10,
    backgroundColor: c.surface,
    borderWidth: 1,
    borderColor: c.line,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: c.text,
  },
  summaryLabel: {
    fontSize: 13,
    color: c.muted,
  },
  table: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.line,
    backgroundColor: c.surface,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: c.line,
  },
  head: {
    borderTopWidth: 0,
    backgroundColor: c.background,
  },
  cell: {
    flex: 1,
    color: c.text,
  },
  headText: {
    fontWeight: '600',
    color: c.muted,
  },
});
}
