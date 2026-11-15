import { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { askGrownUp } from '../gate';
import { useT } from '../i18n';
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
import { CHALLENGES } from '../challenges';
import type { StringKey } from '../i18n';
import { useColors } from '../theme';
import type { Palette } from '../theme';

const DIFFICULTIES: { value: Difficulty; label: Difficulty }[] = LEVELS.map((level) => ({ value: level, label: level }));

// Menu tabs: what to play, the challenges, the other screens, and help.
type Tab = 'play' | 'challenges' | 'more' | 'help';

const TABS: { id: Tab; labelKey: StringKey; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { id: 'play', labelKey: 'tab_play', icon: 'gamepad-variant-outline' },
  { id: 'challenges', labelKey: 'challenges', icon: 'trophy-outline' },
  { id: 'more', labelKey: 'pages', icon: 'chart-bar' },
  { id: 'help', labelKey: 'help', icon: 'help-circle-outline' },
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

// The game menu, split into tabs so each one has a single job. It opens over the game.
export function MenuPanel() {
  const c = useColors();
  const t = useT();
  const styles = useMemo(() => makeStyles(c), [c]);
  const open = useMenu((s) => s.open);
  const hide = useMenu((s) => s.hide);
  const [tab, setTab] = useState<Tab>('play');
  const difficulty = useGameStore((s) => s.difficulty);
  const timeLimitMs = useGameStore((s) => s.timeLimitMs);
  const newGame = useGameStore((s) => s.newGame);
  const setTimeLimit = useGameStore((s) => s.setTimeLimit);
  const startDaily = useGameStore((s) => s.startDaily);
  const startChallenge = useGameStore((s) => s.startChallenge);
  const challenge = useGameStore((s) => s.challenge);
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
  const activeName = useProfiles((s) => s.profiles.find((p) => p.id === s.activeId)?.name ?? '');
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

  const renderChallenge = (ch: (typeof CHALLENGES)[number]) => {
    const active = ch.id === challenge;
    const locked = !levelAllowed(ch.level, isCasual(kidSafe, ch.mistakes), casualWins);
    const done = won.has(ch.id);
    const time = ch.minutes === null ? t('no_limit') : `${ch.minutes} min`;
    const hints = ch.hintLimit === null ? t('no_limit') : ch.hintLimit === 0 ? t('no_hints') : t(ch.hintLimit === 1 ? 'hint_one' : 'hint_many', { n: ch.hintLimit });
    return (
      <Pressable
        key={ch.id}
        accessibilityRole="radio"
        accessibilityLabel={`${t(`challenge_${ch.id}` as StringKey)}${done ? `, ${t('challenge_won')}` : ''}`}
        aria-checked={active}
        aria-disabled={locked}
        disabled={locked}
        onPress={() => act(() => startChallenge(ch.id))}
        style={[styles.challenge, active && styles.chipOn, locked && styles.locked]}
      >
        <View style={styles.challengeTop}>
          <Text style={[styles.chipText, active && styles.chipTextOn]}>{t(`challenge_${ch.id}` as StringKey)}</Text>
          {done ? <MaterialCommunityIcons name="check-circle" size={18} color={active ? c.onAccent : c.accent} /> : null}
        </View>
        <Text style={[styles.challengeDetail, active && styles.chipTextOn]}>
          {[t(ch.level), time, `${t('mistakes')} ${ch.mistakes}`, hints].join(' · ')}
        </Text>
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
              <Pressable
                key={item.id}
                accessibilityRole="tab"
                aria-selected={on}
                onPress={() => setTab(item.id)}
                style={[styles.tab, on && styles.tabOn]}
              >
                <MaterialCommunityIcons name={item.icon} size={20} color={on ? c.accent : c.muted} />
                <Text style={[styles.tabText, on && styles.tabTextOn]} numberOfLines={1}>
                  {t(item.labelKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {tab === 'play' ? (
            <>
              <Text style={styles.playing}>{t('playing_as', { name: activeName })}</Text>

              <Section title={t('choose_player')} styles={styles}>
                <View style={styles.row} accessibilityRole="radiogroup">
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
                        style={[styles.chip, on && styles.chipOn]}
                      >
                        <Text style={[styles.chipText, on && styles.chipTextOn]}>{on ? `✓ ${p.name}` : p.name}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Section>

              <Section title={t('level')} styles={styles}>
                <View style={styles.row} accessibilityRole="radiogroup">
                  {DIFFICULTIES.map((d) => {
                    const active = d.value === difficulty;
                    const locked = !open_.includes(d.value) || !allowed(d.value);
                    return (
                      <Pressable
                        key={d.value}
                        accessibilityRole="radio"
                        accessibilityLabel={locked ? `${t(d.label)}, locked` : t(d.label)}
                        aria-checked={active}
                        aria-disabled={locked}
                        disabled={locked}
                        onPress={() => act(() => newGame(d.value))}
                        style={[styles.chip, active && styles.chipOn, locked && styles.locked]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextOn]}>{locked ? `🔒 ${t(d.label)}` : t(d.label)}</Text>
                      </Pressable>
                    );
                  })}
                </View>
                {casual ? (
                  <Text style={styles.note}>{t('casual_note', { level: t(CASUAL_MAX_LEVEL), n: casualWins, max: CASUAL_DAILY_WINS })}</Text>
                ) : null}
              </Section>

              <Section title={t('time_limit')} styles={styles}>
                <View style={[styles.row, kidSafe && styles.dimmed]} accessibilityRole="radiogroup">
                  {TIME_LIMITS.map((limit) => {
                    const active = limit.value === timeLimitMs;
                    return (
                      <Pressable
                        key={limit.label}
                        accessibilityRole="radio"
                        aria-checked={active}
                        disabled={kidSafe || !allowed(difficulty)}
                        onPress={() => act(() => setTimeLimit(limit.value))}
                        style={[styles.chip, active && styles.chipOn]}
                      >
                        <Text style={[styles.chipText, active && styles.chipTextOn]}>{limit.key ? t(limit.key) : limit.label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </Section>

              <Section title={t('game')} styles={styles}>
                <View style={styles.row}>
                  <Pressable
                    accessibilityRole="button"
                    disabled={!allowed(difficulty)}
                    onPress={() => act(() => newGame(difficulty))}
                    style={[styles.action, styles.primary, !allowed(difficulty) && styles.locked]}
                  >
                    <Text style={styles.primaryText}>{t('new_game')}</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={() => act(() => startDaily())} style={styles.action}>
                    <Text style={styles.actionText}>{t('daily')}</Text>
                  </Pressable>
                  {notes ? (
                    <Pressable accessibilityRole="button" onPress={() => act(() => fillNotes())} style={styles.action}>
                      <Text style={styles.actionText}>{t('fill_notes')}</Text>
                    </Pressable>
                  ) : null}
                </View>
              </Section>
            </>
          ) : null}

          {tab === 'challenges' ? (
            <>
              <Text style={styles.note}>{t('challenges_intro')}</Text>
              {TIERS.map((tier) => (
                <Section key={tier.key} title={t(tier.key)} styles={styles}>
                  <View style={styles.list} accessibilityRole="radiogroup">
                    {CHALLENGES.filter((ch) => tier.levels.includes(ch.level)).map(renderChallenge)}
                  </View>
                </Section>
              ))}
            </>
          ) : null}

          {tab === 'more' ? (
            <>
              <Row icon="chart-bar" label={t('stats')} onPress={() => go('/stats')} styles={styles} />
              <Row icon="cog-outline" label={t('settings')} hint={t('settings_row_hint')} onPress={() => go('/settings', true)} styles={styles} />
              <Row icon="information-outline" label={t('about')} onPress={() => go('/about')} styles={styles} />
            </>
          ) : null}

          {tab === 'help' ? (
            <>
              <Row icon="play-circle-outline" label={t('app_tour')} onPress={() => act(() => useTour.getState().show(0))} styles={styles} />
              <Row icon="book-open-variant" label={t('how_to_play')} onPress={() => go('/howto')} styles={styles} />
              <Row icon="shield-lock-outline" label={t('privacy')} onPress={() => go('/privacy')} styles={styles} />
              <Row icon="file-document-outline" label={t('terms')} onPress={() => go('/terms')} styles={styles} />
              {Platform.OS === 'web' ? (
                install.installed ? (
                  <Text style={styles.note}>{t('install_installed')}</Text>
                ) : install.canInstall ? (
                  <Pressable accessibilityRole="button" onPress={() => act(() => void install.promptInstall())} style={styles.installButton}>
                    <Text style={styles.primaryText}>{t('install_sudoku')}</Text>
                  </Pressable>
                ) : install.ios ? (
                  <Text style={styles.note}>{t('install_ios')}</Text>
                ) : (
                  <Text style={styles.note}>{t('install_other')}</Text>
                )
              ) : null}
            </>
          ) : null}

          <Pressable accessibilityRole="button" onPress={hide} style={styles.close}>
            <Text style={styles.closeText}>{t('close')}</Text>
          </Pressable>
        </ScrollView>
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

// A full-width row with an icon, for the More and Help tabs.
function Row({
  icon,
  label,
  hint,
  onPress,
  styles,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  hint?: string;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.rowItem}>
      <MaterialCommunityIcons name={icon} size={24} color={styles.rowIcon.color} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={22} color={styles.rowIcon.color} />
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
    scroll: { flex: 1 },
    content: { padding: 20, gap: 18, paddingBottom: 32 },
    playing: { fontSize: 16, fontWeight: '800', color: c.accent },
    section: { gap: 8 },
    sectionTitle: { fontSize: 13, fontWeight: '700', color: c.muted, textTransform: 'uppercase', letterSpacing: 0.5 },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    dimmed: { opacity: 0.45 },
    chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: c.radius, borderWidth: 2, borderColor: c.line, backgroundColor: c.background },
    chipOn: { backgroundColor: c.accent, borderColor: c.accent },
    chipText: { fontSize: 15, fontWeight: '700', color: c.text },
    chipTextOn: { color: c.onAccent },
    locked: { opacity: 0.5 },
    action: { flexGrow: 1, minWidth: 96, alignItems: 'center', paddingVertical: 12, borderRadius: c.radius, borderWidth: 2, borderColor: c.accent },
    primary: { backgroundColor: c.accent },
    actionText: { fontSize: 15, fontWeight: '700', color: c.accent },
    primaryText: { fontSize: 15, fontWeight: '700', color: c.onAccent },
    note: { fontSize: 14, lineHeight: 20, color: c.muted },
    list: { gap: 8 },
    challenge: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: c.radius, borderWidth: 2, borderColor: c.line, backgroundColor: c.background, gap: 2 },
    challengeDetail: { fontSize: 13, color: c.muted },
    installButton: { alignItems: 'center', paddingVertical: 12, borderRadius: c.radius, backgroundColor: c.accent },
    close: { alignItems: 'center', paddingVertical: 12 },
    closeText: { fontSize: 16, fontWeight: '700', color: c.muted },
    tabs: { flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 },
    tab: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 8, borderRadius: c.radius, borderWidth: 1, borderColor: c.line },
    tabOn: { borderColor: c.accent, backgroundColor: c.background },
    tabText: { fontSize: 12, fontWeight: '700', color: c.muted },
    tabTextOn: { color: c.accent },
    challengeTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    rowItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14, borderRadius: c.radius, borderWidth: 1, borderColor: c.line, backgroundColor: c.background },
    rowIcon: { color: c.accent },
    rowText: { flex: 1, gap: 2 },
    rowLabel: { fontSize: 16, fontWeight: '700', color: c.text },
    rowHint: { fontSize: 13, color: c.muted },
  });
}
