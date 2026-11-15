import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { askGrownUp } from '../gate';
import { useT } from '../i18n';
import type { StringKey } from '../i18n';
import { usePrefs } from '../prefs';
import { useMenu } from '../menu';
import { useInstall } from '../install';
import { useTour } from '../tour';
import { useProfiles } from '../profiles';
import { unlockedLevels } from '../sudoku/progress';
import { useProgress } from '../sudoku/progressStore';
import type { Difficulty } from '../sudoku/levels.ts';
import { LEVELS } from '../sudoku/levels.ts';
import { CASUAL_DAILY_WINS, CASUAL_MAX_LEVEL, casualWinsOn, isCasual, levelAllowed } from '../sudoku/rules';
import { dayKey } from '../sudoku/stats';
import { useGameStore } from '../sudoku/store';
import { CHALLENGES, weeklyChallenge } from '../challenges';
import type { Challenge } from '../challenges';
import { useColors } from '../theme';
import type { Palette } from '../theme';

type Tab = 'play' | 'challenges' | 'more';
type Icon = keyof typeof MaterialCommunityIcons.glyphMap;

const TABS: { id: Tab; label: StringKey; icon: Icon }[] = [
  { id: 'play', label: 'tab_play', icon: 'gamepad-variant-outline' },
  { id: 'challenges', label: 'challenges', icon: 'trophy-outline' },
  { id: 'more', label: 'pages', icon: 'dots-horizontal-circle-outline' },
];

// Challenges are grouped by how hard they feel, so the list reads from gentle to fierce.
const TIERS: { key: StringKey; levels: Difficulty[] }[] = [
  { key: 'tier_starter', levels: ['beginner', 'easy'] },
  { key: 'tier_standard', levels: ['medium', 'hard'] },
  { key: 'tier_advanced', levels: ['expert', 'master'] },
  { key: 'tier_elite', levels: ['evil', 'genius'] },
];

const TIME_LIMITS: { value: number | null; label: string; key?: 'no_limit' }[] = [
  { value: null, label: 'No limit', key: 'no_limit' },
  { value: 5 * 60_000, label: '5 min' },
  { value: 10 * 60_000, label: '10 min' },
  { value: 15 * 60_000, label: '15 min' },
];

// The game menu, in three tabs: Play (what to play next), Challenges, and More (player, progress and help).
export function MenuPanel() {
  const c = useColors();
  const t = useT();
  const styles = useMemo(() => makeStyles(c), [c]);
  const open = useMenu((s) => s.open);
  const hide = useMenu((s) => s.hide);
  const [tab, setTab] = useState<Tab>('play');
  const difficulty = useGameStore((s) => s.difficulty);
  const timeLimitMs = useGameStore((s) => s.timeLimitMs);
  const challenge = useGameStore((s) => s.challenge);
  const newGame = useGameStore((s) => s.newGame);
  const setTimeLimit = useGameStore((s) => s.setTimeLimit);
  const startDaily = useGameStore((s) => s.startDaily);
  const startChallenge = useGameStore((s) => s.startChallenge);
  const fillNotes = useGameStore((s) => s.fillNotes);
  const kidSafe = usePrefs((s) => s.kidSafe);
  const notes = usePrefs((s) => s.notes);
  const levelUp = usePrefs((s) => s.levelUp);
  const mistakeLimit = usePrefs((s) => s.mistakeLimit);
  const games = useProgress((s) => s.games);
  const open_ = unlockedLevels(games, levelUp);
  // Casual play is limited to Medium and a daily win cap; see rules.ts.
  const casual = isCasual(kidSafe, mistakeLimit);
  const casualWins = casualWinsOn(games, dayKey(new Date()));
  const allowed = (level: Difficulty) => levelAllowed(level, casual, casualWins);
  const won = new Set(games.filter((g) => g.won && g.qualified !== false && g.challenge).map((g) => g.challenge));
  const profiles = useProfiles((s) => s.profiles);
  const activeId = useProfiles((s) => s.activeId);
  const switchTo = useProfiles((s) => s.switchTo);
  const install = useInstall();

  const go = (path: '/stats' | '/settings' | '/about' | '/howto' | '/privacy' | '/terms', gated = false) => {
    hide();
    const navigate = () => router.push(path);
    if (gated) askGrownUp(navigate);
    else navigate();
  };
  const act = (fn: () => void) => {
    fn();
    hide();
  };

  const renderChallenge = (ch: Challenge) => {
    const active = ch.id === challenge;
    const locked = !levelAllowed(ch.level, isCasual(kidSafe, ch.mistakes), casualWins);
    const done = won.has(ch.id);
    const name = t(`challenge_${ch.id}` as StringKey);
    const hints = ch.hintLimit === null ? t('unlimited') : ch.hintLimit === 0 ? t('no_hints') : t(ch.hintLimit === 1 ? 'hint_one' : 'hint_many', { n: ch.hintLimit });
    return (
      <Pressable
        key={ch.id}
        accessibilityRole="radio"
        accessibilityLabel={`${name}${done ? `, ${t('challenge_won')}` : ''}`}
        aria-checked={active}
        aria-disabled={locked}
        disabled={locked}
        onPress={() => act(() => startChallenge(ch.id))}
        style={[styles.card, active && styles.cardOn, locked && styles.dimmed]}
      >
        <View style={styles.cardTop}>
          <Text style={[styles.cardTitle, active && styles.onAccent]}>{name}</Text>
          {done ? <MaterialCommunityIcons name="check-circle" size={20} color={active ? c.onAccent : c.accent} /> : null}
        </View>
        <View style={styles.facts}>
          <Fact icon="signal-cellular-2" text={t(ch.level)} on={active} styles={styles} c={c} />
          <Fact icon="timer-outline" text={ch.minutes === null ? t('no_clock') : `${ch.minutes} min`} on={active} styles={styles} c={c} />
          <Fact icon="alert-circle-outline" text={`${t('mistakes')}: ${ch.mistakes}`} on={active} styles={styles} c={c} />
          <Fact icon="lightbulb-outline" text={hints} on={active} styles={styles} c={c} />
        </View>
      </Pressable>
    );
  };

  return (
    <Modal transparent visible={open} animationType="fade" onRequestClose={hide}>
      <Pressable style={styles.backdrop} onPress={hide} accessibilityLabel={t('close')} />
      <View style={styles.sheet} accessibilityViewIsModal>
        <View style={styles.handle} />
        <View style={styles.tabs} accessibilityRole="tablist">
          {TABS.map((item) => {
            const on = item.id === tab;
            return (
              <Pressable key={item.id} accessibilityRole="tab" aria-selected={on} onPress={() => setTab(item.id)} style={[styles.tab, on && styles.tabOn]}>
                <MaterialCommunityIcons name={item.icon} size={20} color={on ? c.onAccent : c.accent} />
                <Text style={[styles.tabText, on && styles.onAccent]} numberOfLines={1}>
                  {t(item.label)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {tab === 'play' ? (
            <>
              <View style={styles.startRow}>
                <Pressable
                  accessibilityRole="button"
                  disabled={!allowed(difficulty)}
                  onPress={() => act(() => newGame(difficulty))}
                  style={[styles.startButton, styles.startPrimary, !allowed(difficulty) && styles.dimmed]}
                >
                  <MaterialCommunityIcons name="play" size={22} color={c.onAccent} />
                  <Text style={styles.startPrimaryText}>{t('new_game')}</Text>
                  <Text style={[styles.startSub, styles.onAccent]}>{t(difficulty)}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => act(() => startDaily())} style={styles.startButton}>
                  <MaterialCommunityIcons name="calendar-star" size={22} color={c.accent} />
                  <Text style={styles.startText}>{t('daily')}</Text>
                  <Text style={styles.startSub}>{t('daily_challenge')}</Text>
                </Pressable>
              </View>

              <Section title={t('level')} styles={styles}>
                <View style={styles.grid} accessibilityRole="radiogroup">
                  {LEVELS.map((level) => {
                    const active = level === difficulty;
                    const locked = !open_.includes(level) || !allowed(level);
                    return (
                      <Pressable
                        key={level}
                        accessibilityRole="radio"
                        accessibilityLabel={locked ? `${t(level)}, locked` : t(level)}
                        aria-checked={active}
                        aria-disabled={locked}
                        disabled={locked}
                        onPress={() => act(() => newGame(level))}
                        style={[styles.gridCell, active && styles.cardOn, locked && styles.dimmed]}
                      >
                        {locked ? <MaterialCommunityIcons name="lock-outline" size={14} color={active ? c.onAccent : c.muted} /> : null}
                        <Text style={[styles.gridText, active && styles.onAccent]}>{t(level)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {casual ? (
                  <Text style={styles.note}>{t('casual_note', { level: t(CASUAL_MAX_LEVEL), n: casualWins, max: CASUAL_DAILY_WINS })}</Text>
                ) : null}
              </Section>

              <Section title={t('time_limit')} styles={styles}>
                {kidSafe ? <Text style={styles.note}>{t('clock_off_kid_safe')}</Text> : null}
                <View style={styles.segments} accessibilityRole="radiogroup">
                  {TIME_LIMITS.map((limit) => {
                    const active = limit.value === timeLimitMs;
                    return (
                      <Pressable
                        key={limit.label}
                        accessibilityRole="radio"
                        aria-checked={active}
                        disabled={kidSafe || !allowed(difficulty)}
                        onPress={() => act(() => setTimeLimit(limit.value))}
                        style={[styles.segment, active && styles.cardOn, (kidSafe || !allowed(difficulty)) && styles.dimmed]}
                      >
                        <Text style={[styles.gridText, active && styles.onAccent]}>{limit.key ? t(limit.key) : limit.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Section>

              {notes ? (
                <Section title={t('section_tools')} styles={styles}>
                  <Pressable accessibilityRole="button" onPress={() => act(() => fillNotes())} style={styles.row}>
                    <MaterialCommunityIcons name="pencil-outline" size={22} color={c.accent} />
                    <Text style={styles.rowLabel}>{t('fill_notes')}</Text>
                  </Pressable>
                </Section>
              ) : null}
            </>
          ) : null}

          {tab === 'challenges' ? (
            <>
              <Text style={styles.note}>{t('challenges_intro')}</Text>
              <Section title={t('weekly_title')} styles={styles}>
                {renderChallenge(weeklyChallenge(dayKey(new Date())))}
              </Section>
              {TIERS.map((tier) => (
                <Section key={tier.key} title={t(tier.key)} styles={styles}>
                  {CHALLENGES.filter((ch) => tier.levels.includes(ch.level)).map(renderChallenge)}
                </Section>
              ))}
            </>
          ) : null}

          {tab === 'more' ? (
            <>
              <Section title={t('choose_player')} styles={styles}>
                <View style={styles.segments} accessibilityRole="radiogroup">
                  {profiles.map((p) => {
                    const on = p.id === activeId;
                    return (
                      <Pressable
                        key={p.id}
                        accessibilityRole="radio"
                        accessibilityLabel={on ? `${p.name}, ${t('playing_now')}` : p.name}
                        aria-checked={on}
                        onPress={() => {
                          hide();
                          void switchTo(p.id);
                        }}
                        style={[styles.segment, on && styles.cardOn]}
                      >
                        <Text style={[styles.gridText, on && styles.onAccent]}>{p.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Section>

              <Section title={t('section_progress')} styles={styles}>
                <Row icon="chart-bar" label={t('stats')} onPress={() => go('/stats')} styles={styles} />
                <Row icon="cog-outline" label={t('settings')} hint={t('settings_row_hint')} onPress={() => go('/settings', true)} styles={styles} />
              </Section>

              <Section title={t('help')} styles={styles}>
                <Row icon="play-circle-outline" label={t('app_tour')} onPress={() => act(() => useTour.getState().show(0))} styles={styles} />
                <Row icon="book-open-variant" label={t('how_to_play')} onPress={() => go('/howto')} styles={styles} />
                <Row icon="information-outline" label={t('about')} onPress={() => go('/about')} styles={styles} />
                <Row icon="shield-lock-outline" label={t('privacy')} onPress={() => go('/privacy')} styles={styles} />
                <Row icon="file-document-outline" label={t('terms')} onPress={() => go('/terms')} styles={styles} />
                {Platform.OS === 'web' ? (
                  install.installed ? (
                    <Text style={styles.note}>{t('install_installed')}</Text>
                  ) : install.canInstall ? (
                    <Pressable accessibilityRole="button" onPress={() => act(() => void install.promptInstall())} style={styles.installButton}>
                      <MaterialCommunityIcons name="download-outline" size={20} color={c.onAccent} />
                      <Text style={styles.installText}>{t('install_sudoku')}</Text>
                    </Pressable>
                  ) : install.ios ? (
                    <Text style={styles.note}>{t('install_ios')}</Text>
                  ) : (
                    <Text style={styles.note}>{t('install_other')}</Text>
                  )
                ) : null}
              </Section>
            </>
          ) : null}
        </ScrollView>

        <Pressable accessibilityRole="button" onPress={hide} style={styles.close}>
          <Text style={styles.closeText}>{t('close')}</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function Section({ title, children, styles }: { title: string; children: React.ReactNode; styles: ReturnType<typeof makeStyles> }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

// One labelled fact on a challenge card, with an icon so the numbers are never mixed up.
function Fact({ icon, text, on, styles, c }: { icon: Icon; text: string; on: boolean; styles: ReturnType<typeof makeStyles>; c: Palette }) {
  const color = on ? c.onAccent : c.muted;
  return (
    <View style={styles.fact}>
      <MaterialCommunityIcons name={icon} size={14} color={color} />
      <Text style={[styles.factText, { color }]}>{text}</Text>
    </View>
  );
}

// A full-width row that opens a screen.
function Row({ icon, label, hint, onPress, styles }: { icon: Icon; label: string; hint?: string; onPress: () => void; styles: ReturnType<typeof makeStyles> }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <MaterialCommunityIcons name={icon} size={22} color={styles.accentIcon.color} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={styles.muted.color} />
    </Pressable>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)' },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: '82%',
      borderTopLeftRadius: c.radius + 10,
      borderTopRightRadius: c.radius + 10,
      backgroundColor: c.surface,
    },
    handle: { alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: c.line, marginTop: 8 },
    tabs: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
    tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 4, height: 44, borderRadius: c.radius, borderWidth: 2, borderColor: c.accent, backgroundColor: c.background },
    tabOn: { backgroundColor: c.accent },
    tabText: { fontSize: 14, fontWeight: '700', color: c.accent },
    scroll: { flex: 1 },
    content: { padding: 16, gap: 20, paddingBottom: 24 },
    section: { gap: 10 },
    sectionTitle: { fontSize: 12, fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: 0.6 },
    note: { fontSize: 14, lineHeight: 20, color: c.muted },
    dimmed: { opacity: 0.45 },
    onAccent: { color: c.onAccent },
    accentIcon: { color: c.accent },
    muted: { color: c.muted },

    startRow: { flexDirection: 'row', gap: 10 },
    startButton: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 14, borderRadius: c.radius + 4, borderWidth: 2, borderColor: c.accent, backgroundColor: c.background },
    startPrimary: { backgroundColor: c.accent },
    startPrimaryText: { fontSize: 16, fontWeight: '800', color: c.onAccent },
    startText: { fontSize: 16, fontWeight: '800', color: c.accent },
    startSub: { fontSize: 12, color: c.muted },

    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    gridCell: { minWidth: '30%', flexGrow: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 44, borderRadius: c.radius, borderWidth: 2, borderColor: c.line, backgroundColor: c.background },
    gridText: { fontSize: 15, fontWeight: '700', color: c.text },
    segments: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    segment: { flexGrow: 1, minWidth: 72, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: c.radius, borderWidth: 2, borderColor: c.line, backgroundColor: c.background },
    cardOn: { backgroundColor: c.accent, borderColor: c.accent },

    card: { gap: 10, padding: 14, borderRadius: c.radius + 2, borderWidth: 2, borderColor: c.line, backgroundColor: c.background },
    cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    cardTitle: { fontSize: 16, fontWeight: '800', color: c.text },
    facts: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    fact: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    factText: { fontSize: 13, fontWeight: '600' },

    row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14, borderRadius: c.radius, borderWidth: 1, borderColor: c.line, backgroundColor: c.background },
    rowText: { flex: 1, gap: 2 },
    rowLabel: { flex: 1, fontSize: 16, fontWeight: '700', color: c.text },
    rowHint: { fontSize: 13, color: c.muted },

    installButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: c.radius, backgroundColor: c.accent },
    installText: { fontSize: 16, fontWeight: '700', color: c.onAccent },
    close: { alignItems: 'center', paddingVertical: 14, borderTopWidth: 1, borderTopColor: c.line },
    closeText: { fontSize: 16, fontWeight: '700', color: c.muted },
  });
}
