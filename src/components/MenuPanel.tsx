import { useMemo } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { askGrownUp } from '../gate';
import { useT } from '../i18n';
import { usePrefs } from '../prefs';
import { useMenu } from '../menu';
import { useInstall } from '../install';
import { useTour } from '../tour';
import { useProfiles } from '../profiles';
import { unlockedLevels } from '../sudoku/progress';
import { useProgress } from '../sudoku/progressStore';
import type { Difficulty } from '../sudoku/engine';
import { useGameStore } from '../sudoku/store';
import { useColors } from '../theme';
import type { Palette } from '../theme';

const DIFFICULTIES: { value: Difficulty; label: 'easy' | 'medium' | 'hard' | 'expert' | 'evil' }[] = [
  { value: 'easy', label: 'easy' },
  { value: 'medium', label: 'medium' },
  { value: 'hard', label: 'hard' },
  { value: 'expert', label: 'expert' },
  { value: 'evil', label: 'evil' },
];

const TIME_LIMITS: { value: number | null; label: string; key?: 'no_limit' }[] = [
  { value: null, label: 'No limit', key: 'no_limit' },
  { value: 5 * 60_000, label: '5 min' },
  { value: 10 * 60_000, label: '10 min' },
  { value: 15 * 60_000, label: '15 min' },
];

// The game menu: level, time limit, game actions, and the other screens. It opens over the game.
export function MenuPanel() {
  const c = useColors();
  const t = useT();
  const styles = useMemo(() => makeStyles(c), [c]);
  const open = useMenu((s) => s.open);
  const hide = useMenu((s) => s.hide);
  const difficulty = useGameStore((s) => s.difficulty);
  const timeLimitMs = useGameStore((s) => s.timeLimitMs);
  const newGame = useGameStore((s) => s.newGame);
  const setTimeLimit = useGameStore((s) => s.setTimeLimit);
  const startDaily = useGameStore((s) => s.startDaily);
  const fillNotes = useGameStore((s) => s.fillNotes);
  const kidSafe = usePrefs((s) => s.kidSafe);
  const notes = usePrefs((s) => s.notes);
  const levelUp = usePrefs((s) => s.levelUp);
  const games = useProgress((s) => s.games);
  const open_ = unlockedLevels(games, levelUp);
  const activeName = useProfiles((s) => s.profiles.find((p) => p.id === s.activeId)?.name ?? '');

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

  return (
    <Modal transparent visible={open} animationType="fade" onRequestClose={hide}>
      <Pressable style={styles.backdrop} onPress={hide} accessibilityLabel={t('close')} />
      <View style={styles.sheet} accessibilityViewIsModal>
        <View style={styles.handle} />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          <Text style={styles.playing}>{t('playing_as', { name: activeName })}</Text>

          <Section title={t('level')} styles={styles}>
            <View style={styles.row} accessibilityRole="radiogroup">
              {DIFFICULTIES.map((d) => {
                const active = d.value === difficulty;
                const locked = !open_.includes(d.value);
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
                    disabled={kidSafe}
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
              <Pressable accessibilityRole="button" onPress={() => act(() => newGame(difficulty))} style={[styles.action, styles.primary]}>
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

          <Section title={t('pages')} styles={styles}>
            <View style={styles.row}>
              <Pressable accessibilityRole="button" onPress={() => go('/stats')} style={styles.action}>
                <Text style={styles.actionText}>{t('stats')}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => go('/settings', true)} style={styles.action}>
                <Text style={styles.actionText}>{t('settings')}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => go('/about')} style={styles.action}>
                <Text style={styles.actionText}>{t('about')}</Text>
              </Pressable>
            </View>
          </Section>

          <Section title="Help" styles={styles}>
            <View style={styles.row}>
              <Pressable accessibilityRole="button" onPress={() => act(() => useTour.getState().show(0))} style={styles.action}>
                <Text style={styles.actionText}>App tour</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => go('/howto')} style={styles.action}>
                <Text style={styles.actionText}>How to play</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => go('/privacy')} style={styles.action}>
                <Text style={styles.actionText}>Privacy</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={() => go('/terms')} style={styles.action}>
                <Text style={styles.actionText}>Terms</Text>
              </Pressable>
            </View>
            {Platform.OS === 'web' ? (
              install.installed ? (
                <Text style={styles.note}>✓ Sudoku is installed on this device.</Text>
              ) : install.canInstall ? (
                <Pressable accessibilityRole="button" onPress={() => act(() => void install.promptInstall())} style={styles.installButton}>
                  <Text style={styles.primaryText}>Install Sudoku</Text>
                </Pressable>
              ) : install.ios ? (
                <Text style={styles.note}>On iPhone or iPad: tap Share, then Add to Home Screen.</Text>
              ) : (
                <Text style={styles.note}>To install, use your browser&apos;s menu and choose Install or Add to Home Screen.</Text>
              )
            ) : null}
          </Section>

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
    installButton: { alignItems: 'center', paddingVertical: 12, borderRadius: c.radius, backgroundColor: c.accent },
    close: { alignItems: 'center', paddingVertical: 12 },
    closeText: { fontSize: 16, fontWeight: '700', color: c.muted },
  });
}
