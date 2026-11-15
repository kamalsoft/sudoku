import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CelebrationOverlay } from '../components/CelebrationOverlay';
import { AnimalFriends } from '../components/AnimalFriends';
import { CompletionToast } from '../components/CompletionToast';
import { GameHeader } from '../components/GameHeader';
import { NumberPad } from '../components/NumberPad';
import { SudokuGrid } from '../components/SudokuGrid';
import { useGameLifecycle } from '../hooks/useGameLifecycle';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useEntrance } from '../motion';
import { usePrefs } from '../prefs';
import { bootApp } from '../profiles';
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

  useEffect(() => {
    void bootApp();
  }, []);

  if (!ready || !prefsReady) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <ActivityIndicator style={{ flex: 1 }} color={c.accent} />
      </SafeAreaView>
    );
  }
  return <GameScreen />;
}

function GameScreen() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  useGameLifecycle();
  useKeyboardControls();
  const { width, height } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;
  const gridSize = wide ? Math.min(height - 64, 560) : Math.min(width - 32, height * 0.55);
  const contentWidth = wide ? SIDE_WIDTH : gridSize;
  const headerIn = useEntrance(0);
  const gridIn = useEntrance(150, 10);
  const padIn = useEntrance(300);

  return (
    <SafeAreaView style={styles.safe}>
      <AnimalFriends />
      {wide ? (
        <View style={styles.wideRow}>
          <Animated.View style={gridIn}>
            <SudokuGrid size={gridSize} />
          </Animated.View>
          <View style={[styles.side, { width: contentWidth }]}>
            <Animated.View style={headerIn}>
              <GameHeader width={contentWidth} />
            </Animated.View>
            <Animated.View style={padIn}>
              <NumberPad width={contentWidth} />
            </Animated.View>
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.column}>
          <Animated.View style={headerIn}>
            <GameHeader width={contentWidth} />
          </Animated.View>
          <Animated.View style={gridIn}>
            <SudokuGrid size={gridSize} />
          </Animated.View>
          <Animated.View style={padIn}>
            <NumberPad width={contentWidth} />
          </Animated.View>
        </ScrollView>
      )}
      <CompletionToast />
      <CelebrationOverlay />
    </SafeAreaView>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: c.background,
    },
    column: {
      alignItems: 'center',
      gap: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
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
