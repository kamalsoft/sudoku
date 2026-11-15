import { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../sudoku/store';
import { starsFor } from '../sudoku/progress';
import { hintsQualify } from '../sudoku/rules';
import { nextLevelProgress } from '../sudoku/motivation';
import { dayKey, formatDuration, formatDuration as fmt, summarize } from '../sudoku/stats';
import { Confetti } from './Confetti';
import { useProgress } from '../sudoku/progressStore';
import { usePrefs } from '../prefs';
import { ANIMALS } from './AnimalFriends';
import { useReduceMotion } from '../motion';
import { badgeKey, useT } from '../i18n';
import type { StringKey } from '../i18n';
import { useColors } from '../theme';
import type { Palette } from '../theme';

// Shown when the puzzle is solved. It cross-fades in, and cross-fades out when dismissed.
export function CelebrationOverlay() {
  const c = useColors();
  const t = useT();
  const styles = useMemo(() => makeStyles(c), [c]);
  const reduce = useReduceMotion();
  const solved = useGameStore((s) => s.solved);
  const gameId = useGameStore((s) => s.gameId);
  const accumulatedMs = useGameStore((s) => s.accumulatedMs);
  const mistakes = useGameStore((s) => s.mistakes);
  const hints = useGameStore((s) => s.hints);
  const daily = useGameStore((s) => s.daily);
  const difficulty = useGameStore((s) => s.difficulty);
  const personalBest = useGameStore((s) => s.personalBest);
  const badgesOn = usePrefs((s) => s.badges);
  const rewardsOn = usePrefs((s) => s.rewards);
  const animals = usePrefs((s) => s.animals);
  const unseen = useProgress((s) => s.unseenBadges);
  const earned = unseen.map((id) => t(`badge_${badgeKey(id)}` as StringKey));
  const parade = rewardsOn ? ANIMALS.filter((a) => animals.includes(a.id)) : [];
  const puzzle = useGameStore((s) => s.puzzle);
  const qualified = hintsQualify(puzzle, hints);
  const stars = qualified ? starsFor(mistakes, hints) : 0;
  const games = useProgress((s) => s.games);
  const levelUp = usePrefs((s) => s.levelUp);
  const kidSafe = usePrefs((s) => s.kidSafe);
  const dailyStreak = summarize(games, dayKey(new Date())).dailyStreak;
  const next = nextLevelProgress(games, levelUp);
  const winKind = daily !== null ? 'daily_win' : qualified ? 'win' : 'win_assisted';
  const winLine = t(`${kidSafe ? 'kid' : 'adult'}_${winKind}` as StringKey, {
    n: dailyStreak,
    time: fmt(accumulatedMs),
    mistakes,
  });
  const progressLine = next ? t(`${kidSafe ? 'kid' : 'adult'}_progress` as StringKey, { n: next.wins, level: t(next.level) }) : null;
  const newGame = useGameStore((s) => s.newGame);
  const [dismissedFor, setDismissedFor] = useState<number | null>(null);
  const [fade] = useState(() => new Animated.Value(0));
  const [scale] = useState(() => new Animated.Value(0.9));

  const show = solved && dismissedFor !== gameId;

  useEffect(() => {
    if (!show) return;
    fade.setValue(0);
    scale.setValue(0.9);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: reduce ? 0 : 500, useNativeDriver: false }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: false }),
    ]).start();
  }, [show, fade, scale, reduce]);

  const dismiss = () => {
    void useProgress.getState().markBadgesSeen();
    Animated.timing(fade, { toValue: 0, duration: reduce ? 0 : 350, useNativeDriver: false }).start(() => setDismissedFor(gameId));
  };

  if (!show) return null;

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: fade }]} accessibilityViewIsModal>
      <Confetti />
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        {badgesOn && qualified ? (
          <Text style={styles.stars} accessibilityLabel={t('stars_of', { n: stars })}>
            {'★'.repeat(stars)}{'☆'.repeat(3 - stars)}
          </Text>
        ) : null}
        {!qualified ? <Text style={styles.assisted}>{t('assisted_note')}</Text> : null}
        <Text style={styles.title}>{t('complete')}</Text>
        {daily !== null ? <Text style={styles.daily}>{t('daily_star')}</Text> : null}
        <Text style={styles.body}>
          {formatDuration(accumulatedMs)} · {mistakes === 1 ? t('mistake_one') : t('mistake_many', { n: mistakes })}
          {hints > 0 ? ` · ${hints === 1 ? t('hint_one') : t('hint_many', { n: hints })}` : ''}
        </Text>
        <Text style={styles.motivate}>{winLine}</Text>
        {badgesOn && qualified && personalBest ? <Text style={styles.badge}>{t('personal_best', { level: t(difficulty) })}</Text> : null}
        {progressLine ? <Text style={styles.progress}>{progressLine}</Text> : null}
        {badgesOn && earned.length > 0 ? (
          <Text style={styles.badge} accessibilityLiveRegion="polite">{t('new_badge')}: {earned.join(', ')}</Text>
        ) : null}
        {parade.length > 0 && (daily !== null || earned.length > 0) ? <AnimalParade animals={parade.map((a) => a.emoji)} reduce={reduce} /> : null}
        <View style={styles.actions}>
          <Pressable accessibilityRole="button" onPress={() => newGame(difficulty)} style={styles.primary}>
            <Text style={styles.primaryText}>{t('play_again')}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={dismiss} style={styles.secondary}>
            <Text style={styles.secondaryText}>{t('look_at_it')}</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const paradeStyles = StyleSheet.create({
  parade: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-end',
    minHeight: 40,
  },
  emoji: {
    fontSize: 28,
  },
});

// The chosen animal friends bounce in a row as a reward.
function AnimalParade({ animals, reduce }: { animals: string[]; reduce: boolean }) {
  return (
    <View style={paradeStyles.parade} accessibilityElementsHidden>
      {animals.map((emoji, i) => (
        <Bounce key={`${emoji}-${i}`} emoji={emoji} delay={i * 120} reduce={reduce} />
      ))}
    </View>
  );
}

function Bounce({ emoji, delay, reduce }: { emoji: string; delay: number; reduce: boolean }) {
  const [hop] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (reduce) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(hop, { toValue: 1, duration: 320, useNativeDriver: false }),
        Animated.timing(hop, { toValue: 0, duration: 320, useNativeDriver: false }),
        Animated.delay(600),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [hop, delay, reduce]);
  return <Animated.Text style={[paradeStyles.emoji, { transform: [{ translateY: hop.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) }] }]}>{emoji}</Animated.Text>;
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    backdrop: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.45)',
      padding: 24,
    },
    card: {
      width: '100%',
      maxWidth: 360,
      padding: 28,
      borderRadius: c.radius + 6,
      backgroundColor: c.surface,
      alignItems: 'center',
      gap: 12,
    },
    stars: {
      fontSize: 28,
      color: c.entry,
      letterSpacing: 6,
    },
    motivate: {
      fontSize: 15,
      fontWeight: '600',
      color: c.text,
      textAlign: 'center',
    },
    progress: {
      fontSize: 14,
      color: c.accent,
      fontWeight: '700',
      textAlign: 'center',
    },
    assisted: {
      fontSize: 14,
      lineHeight: 20,
      color: c.muted,
      textAlign: 'center',
    },
    daily: {
      fontSize: 16,
      fontWeight: '700',
      color: c.accent,
    },
    badge: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
      textAlign: 'center',
    },

    title: {
      fontSize: 26,
      fontWeight: '800',
      color: c.text,
      textAlign: 'center',
    },
    body: {
      fontSize: 16,
      color: c.muted,
    },
    actions: {
      alignSelf: 'stretch',
      gap: 10,
      marginTop: 8,
    },
    primary: {
      height: 48,
      borderRadius: c.radius,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.accent,
    },
    primaryText: {
      color: c.onAccent,
      fontWeight: '700',
      fontSize: 16,
    },
    secondary: {
      height: 48,
      borderRadius: c.radius,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.accent,
    },
    secondaryText: {
      color: c.accent,
      fontWeight: '700',
      fontSize: 16,
    },
  });
}
