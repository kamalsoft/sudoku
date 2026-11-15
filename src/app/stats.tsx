import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CountUp } from '../components/CountUp';
import { askGrownUp } from '../gate';
import { badgeKey, useT } from '../i18n';
import type { StringKey } from '../i18n';
import { usePrefs } from '../prefs';
import type { Difficulty } from '../sudoku/levels.ts';
import { badges as computeBadges } from '../sudoku/progress';
import { useProgress } from '../sudoku/progressStore';
import { useGameStore } from '../sudoku/store';
import { dayKey, formatDuration, summarize } from '../sudoku/stats';
import type { GameRecord, Stats } from '../sudoku/stats';
import { useColors } from '../theme';
import type { Palette } from '../theme';

const LEVEL_KEYS: Record<Difficulty, StringKey> = {
  beginner: 'beginner',
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
  expert: 'expert',
  master: 'master',
  evil: 'evil',
  genius: 'genius',
};

export default function StatsScreen() {
  const c = useColors();
  const t = useT();
  const styles = useMemo(() => makeStyles(c), [c]);
  const games = useProgress((s) => s.games);
  const badgesOn = usePrefs((s) => s.badges);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void useProgress.getState().load().then(() => setLoaded(true));
  }, []);

  const stats: Stats | null = useMemo(() => (loaded ? summarize(games, dayKey(new Date())) : null), [games, loaded]);
  const badges = useMemo(() => (stats ? computeBadges(games, stats.dailyStreak) : []), [games, stats]);
  const recent = useMemo(() => games.slice(-10).reverse(), [games]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topBar}>
          <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
            <Text style={styles.backText}>{t('back')}</Text>
          </Pressable>
          <Text style={styles.title}>{t('statistics')}</Text>
        </View>

        {!stats ? (
          <ActivityIndicator color={c.accent} />
        ) : (
          <>
            <View style={styles.summary}>
              <Summary label={t('played')} value={stats.played} styles={styles} />
              <Summary label={t('won')} value={stats.won} styles={styles} />
              <Summary label={t('win_rate')} value={stats.winRate === null ? null : stats.winRate * 100} suffix="%" styles={styles} />
              <Summary label={t('streak_days')} value={stats.streak} styles={styles} />
              <Summary label={t('daily_wins')} value={stats.dailyWins} styles={styles} />
              <Summary label={t('daily_streak')} value={stats.dailyStreak} styles={styles} />
            </View>

            {badgesOn ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('badges')}</Text>
                <View style={styles.badges}>
                  {badges.map((b) => (
                    <View
                      key={b.id}
                      style={[styles.badge, b.unlocked && styles.badgeOn]}
                      accessibilityLabel={`${t(`badge_${badgeKey(b.id)}` as StringKey)}: ${b.unlocked ? t('badge_earned') : t('badge_locked')}`}
                    >
                      <Text style={[styles.badgeTitle, b.unlocked && styles.badgeTitleOn]}>
                        {b.unlocked ? '★ ' : '🔒 '}
                        {t(`badge_${badgeKey(b.id)}` as StringKey)}
                      </Text>
                      <Text style={[styles.badgeText, b.unlocked && styles.badgeTitleOn]}>{t(`badge_${badgeKey(b.id)}_desc` as StringKey)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('recent_games')}</Text>
              {recent.length === 0 ? (
                <Text style={styles.empty}>{t('no_games')}</Text>
              ) : (
                <View style={styles.table}>
                  {recent.map((g, i) => (
                    <GameRow key={`${g.at ?? i}-${i}`} game={g} first={i === 0} styles={styles} />
                  ))}
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('by_level')}</Text>
              <View style={styles.table}>
                <View style={[styles.row, styles.head]}>
                  <Text style={[styles.cell, styles.headText]}>{t('level')}</Text>
                  <Text style={[styles.cell, styles.headText]}>{t('played')}</Text>
                  <Text style={[styles.cell, styles.headText]}>{t('won')}</Text>
                  <Text style={[styles.cell, styles.headText]}>{t('best')}</Text>
                </View>
                {(Object.keys(LEVEL_KEYS) as Difficulty[]).map((d) => {
                  const row = stats.byDifficulty[d];
                  return (
                    <View key={d} style={styles.row}>
                      <Text style={styles.cell}>{t(LEVEL_KEYS[d])}</Text>
                      <Text style={styles.cell}>{row.played}</Text>
                      <Text style={styles.cell}>{row.won}</Text>
                      <Text style={styles.cell}>{row.bestMs === null ? '—' : formatDuration(row.bestMs)}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <Pressable accessibilityRole="button" onPress={() => askGrownUp(() => router.push('/summary'))} style={styles.link}>
              <Text style={styles.linkText}>{t('parent_summary_link')}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// One finished game. Stars show for wins. Replay starts the same puzzle again when it was saved.
function GameRow({ game, first, styles }: { game: GameRecord; first: boolean; styles: ReturnType<typeof makeStyles> }) {
  const t = useT();
  const replay = () => {
    if (!game.puzzle) return;
    useGameStore.getState().replay(game.puzzle, game.difficulty);
    router.replace('/');
  };
  const stars = game.won && game.stars ? '★'.repeat(game.stars) + '☆'.repeat(3 - game.stars) : '—';
  const level = t(LEVEL_KEYS[game.difficulty]);
  return (
    <View style={[styles.gameRow, !first && styles.divider]}>
      <View style={styles.gameText}>
        <Text style={styles.gameTitle}>
          {level}
          {game.daily ? ` · ${t('daily')}` : ''}
        </Text>
        <Text style={styles.gameMeta}>
          {game.won ? t('won') : t('not_won')} · {formatDuration(game.elapsedMs)} · {stars}
        </Text>
      </View>
      {game.puzzle ? (
        <Pressable accessibilityRole="button" accessibilityLabel={t('replay_label', { level })} onPress={replay} style={styles.replay}>
          <Text style={styles.replayText}>{t('replay')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Summary({ label, value, suffix = '', styles }: { label: string; value: number | null; suffix?: string; styles: ReturnType<typeof makeStyles> }) {
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
    safe: { flex: 1, backgroundColor: c.background },
    content: { padding: 16, gap: 20, maxWidth: 560, width: '100%', alignSelf: 'center' },
    topBar: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    back: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: c.radius, borderWidth: 1, borderColor: c.accent },
    backText: { color: c.accent, fontWeight: '600' },
    title: { fontSize: 24, fontWeight: '800', color: c.text },
    summary: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    summaryItem: { flexGrow: 1, minWidth: 120, padding: 14, borderRadius: c.radius, backgroundColor: c.surface, borderWidth: 1, borderColor: c.line },
    summaryValue: { fontSize: 22, fontWeight: '700', color: c.text },
    summaryLabel: { fontSize: 13, color: c.muted },
    section: { gap: 8 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
    empty: { fontSize: 15, color: c.muted },
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    badge: { width: '48%', flexGrow: 1, padding: 12, borderRadius: c.radius, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, gap: 4, opacity: 0.6 },
    badgeOn: { opacity: 1, borderColor: c.accent },
    badgeTitle: { fontSize: 14, fontWeight: '700', color: c.text },
    badgeTitleOn: { color: c.text },
    badgeText: { fontSize: 12, color: c.muted },
    table: { borderRadius: c.radius, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface, overflow: 'hidden' },
    row: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: c.line },
    head: { borderTopWidth: 0, backgroundColor: c.background },
    cell: { flex: 1, color: c.text },
    headText: { fontWeight: '600', color: c.muted },
    gameRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12 },
    divider: { borderTopWidth: 1, borderTopColor: c.line },
    gameText: { flex: 1, gap: 2 },
    gameTitle: { fontSize: 15, fontWeight: '700', color: c.text },
    gameMeta: { fontSize: 13, color: c.muted },
    replay: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: c.radius, backgroundColor: c.accent },
    replayText: { color: c.onAccent, fontWeight: '700' },
    link: { alignItems: 'center', paddingVertical: 12, borderRadius: c.radius, borderWidth: 2, borderColor: c.accent },
    linkText: { color: c.accent, fontWeight: '700' },
  });
}
