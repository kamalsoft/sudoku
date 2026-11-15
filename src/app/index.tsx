import { useMemo } from 'react';
import { ActivityIndicator, Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { AnimalFriends } from '../components/AnimalFriends';
import { CompletionToast } from '../components/CompletionToast';
import { MotivationToast } from '../components/MotivationToast';
import { MenuPanel } from '../components/MenuPanel';
import { NumberPad, PAD_KEY_HEIGHT } from '../components/NumberPad';
import { TopBar } from '../components/TopBar';
import { Tour } from '../components/Tour';
import { SudokuGrid } from '../components/SudokuGrid';
import { useGameLifecycle } from '../hooks/useGameLifecycle';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useEntrance } from '../motion';
import { usePrefs } from '../prefs';
import { useGameStore } from '../sudoku/store';
import { useColors } from '../theme';
import type { Palette } from '../theme';

const WIDE_BREAKPOINT = 768;
const SIDE_WIDTH = 300;

// Loads preferences and the saved game before the board mounts, so the grid never flashes a blank puzzle.
export default function GameRoute() {
  const c = useColors();
  const ready = useGameStore((s) => s.ready);
  const prefsReady = usePrefs((s) => s.ready);



  if (!ready || !prefsReady) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <ActivityIndicator style={{ flex: 1 }} color={c.accent} />
      </SafeAreaView>
    );
  }
  return <GameScreen />;
}

// Space the board can use: the screen, less the top bar, the number pad and the safe areas.
const TOP_BAR = 56;
const PAD_HEIGHT = 3 * PAD_KEY_HEIGHT + 2 * 8 + 8 + 44;
const CHROME = 110;

function GameScreen() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  useGameLifecycle();
  useKeyboardControls();
  const { width, height } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;
  const gridSize = wide
    ? Math.max(200, Math.min(height - TOP_BAR - CHROME, 560))
    : Math.max(200, Math.min(width - 24, height - TOP_BAR - PAD_HEIGHT - CHROME));
  const padWidth = wide ? SIDE_WIDTH : gridSize;
  const topIn = useEntrance(0);
  const gridIn = useEntrance(150, 10);
  const padIn = useEntrance(300);

  return (
    <SafeAreaView style={styles.safe}>
      <AnimalFriends />
      <Animated.View style={topIn}>
        <TopBar />
      </Animated.View>
      {wide ? (
        <View style={styles.wideRow}>
          <Animated.View style={gridIn}>
            <SudokuGrid size={gridSize} />
          </Animated.View>
          <Animated.View style={[styles.side, { width: padWidth }, padIn]}>
            <NumberPad width={padWidth} />
          </Animated.View>
        </View>
      ) : (
        <View style={styles.portrait}>
          <Animated.View style={gridIn}>
            <SudokuGrid size={gridSize} />
          </Animated.View>
          <Animated.View style={padIn}>
            <NumberPad width={padWidth} />
          </Animated.View>
        </View>
      )}
      <CompletionToast />
      <MotivationToast />
      <CelebrationOverlay />
      <MenuPanel />
      <Tour />
    </SafeAreaView>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.background,
    },
    portrait: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
      paddingHorizontal: 12,
      paddingBottom: 12,
    },
    wideRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 56,
    },
    side: {
      gap: 24,
    },
  });
}
