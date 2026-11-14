import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Animated, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GameHeader } from '../components/GameHeader';
import { NumberPad } from '../components/NumberPad';
import { SudokuGrid } from '../components/SudokuGrid';
import { useGameLifecycle } from '../hooks/useGameLifecycle';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { useEntrance } from '../motion';
import { usePrefs } from '../prefs';
import { useGameStore } from '../sudoku/store';
import { useColors } from '../theme';
import type { Palette } from '../theme';

const WIDE_BREAKPOINT = 768;

// Loads preferences and the saved game before the board mounts, so the grid never flashes a blank puzzle.
export default function GameRoute() {
  const c = useColors();
  const ready = useGameStore((s) => s.ready);
  const init = useGameStore((s) => s.init);
  const prefsReady = usePrefs((s) => s.ready);

  useEffect(() => {
    void init();
    void usePrefs.getState().load();
  }, [init]);

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
  const padWidth = wide ? 260 : gridSize;
  const headerIn = useEntrance(0);
  const gridIn = useEntrance(150, 10);
  const padIn = useEntrance(300);

  if (wide) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.wideRow}>
          <Animated.View style={gridIn}>
            <SudokuGrid size={gridSize} />
          </Animated.View>
          <View style={[styles.side, { width: padWidth }]}>
            <Animated.View style={headerIn}>
              <GameHeader />
            </Animated.View>
            <Animated.View style={padIn}>
              <NumberPad width={padWidth} />
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.column}>
        <Animated.View style={headerIn}>
          <GameHeader />
        </Animated.View>
        <Animated.View style={gridIn}>
          <SudokuGrid size={gridSize} />
        </Animated.View>
        <Animated.View style={padIn}>
          <NumberPad width={padWidth} />
        </Animated.View>
      </ScrollView>
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
      gap: 48,
    },
    side: {
      gap: 24,
    },
  });
}
