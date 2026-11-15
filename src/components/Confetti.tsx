import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useReduceMotion } from '../motion';

const COLOURS = ['#F59E0B', '#EC4899', '#22C55E', '#3B82F6', '#A855F7', '#EF4444', '#14B8A6'];
const PIECES = 42;

// A fixed-looking spread of values between 0 and 1 for piece i, so the burst differs piece to piece.
const spread = (i: number, k: number) => {
  const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// A short burst of coloured pieces that fall and sway once. Off under reduced motion.
export function Confetti() {
  const reduce = useReduceMotion();
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECES }, (_, i) => ({
        id: i,
        x: spread(i, 1) * width,
        colour: COLOURS[i % COLOURS.length],
        delay: spread(i, 2) * 400,
        duration: 1800 + spread(i, 3) * 1200,
        sway: (spread(i, 4) - 0.5) * 120,
        spin: (spread(i, 5) < 0.5 ? -1 : 1) * (2 + spread(i, 6) * 3),
        round: i % 3 === 0,
      })),
    [width],
  );

  if (reduce) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p) => (
        <Piece key={p.id} piece={p} height={height} />
      ))}
    </View>
  );
}

function Piece({ piece, height }: { piece: { x: number; colour: string; delay: number; duration: number; sway: number; spin: number; round: boolean }; height: number }) {
  const [fall] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const run = Animated.timing(fall, { toValue: 1, duration: piece.duration, delay: piece.delay, easing: Easing.in(Easing.quad), useNativeDriver: false });
    run.start();
    return () => run.stop();
  }, [fall, piece.delay, piece.duration]);

  return (
    <Animated.View
      style={[
        styles.piece,
        {
          left: piece.x,
          backgroundColor: piece.colour,
          borderRadius: piece.round ? 6 : 2,
          opacity: fall.interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
          transform: [
            { translateY: fall.interpolate({ inputRange: [0, 1], outputRange: [-20, height + 20] }) },
            { translateX: fall.interpolate({ inputRange: [0, 1], outputRange: [0, piece.sway] }) },
            { rotate: fall.interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${piece.spin * 360}deg`] }) },
          ],
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  piece: {
    position: 'absolute',
    top: 0,
    width: 9,
    height: 13,
  },
});
