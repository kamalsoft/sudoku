import { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useReduceMotion } from '../motion';
import { usePrefs } from '../prefs';

export const ANIMALS = [
  { id: 'cat', emoji: '🐱', name: 'Cat' },
  { id: 'dog', emoji: '🐶', name: 'Dog' },
  { id: 'bunny', emoji: '🐰', name: 'Bunny' },
  { id: 'bird', emoji: '🐦', name: 'Bird' },
  { id: 'fish', emoji: '🐟', name: 'Fish' },
  { id: 'turtle', emoji: '🐢', name: 'Turtle' },
  { id: 'bear', emoji: '🐻', name: 'Bear' },
  { id: 'bee', emoji: '🐝', name: 'Bee' },
];

// The animals the player picked in Settings walk across the game screen behind the board, one after another.
// Under reduced motion they stay still in their lanes.
export function AnimalFriends() {
  const chosen = usePrefs((s) => s.animals);
  const reduce = useReduceMotion();
  const { width } = useWindowDimensions();
  const picked = ANIMALS.filter((a) => chosen.includes(a.id));

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {picked.map((animal, index) => (
        <Walker key={animal.id} emoji={animal.emoji} index={index} width={width} reduce={reduce} />
      ))}
    </View>
  );
}

function Walker({ emoji, index, width, reduce }: { emoji: string; index: number; width: number; reduce: boolean }) {
  const [travel] = useState(() => new Animated.Value(0));
  const [hop] = useState(() => new Animated.Value(0));
  const lane = 8 + ((index * 23) % 70);

  useEffect(() => {
    if (reduce) return;
    const walk = Animated.loop(
      Animated.sequence([
        Animated.timing(travel, { toValue: 0, duration: 0, useNativeDriver: false }),
        Animated.timing(travel, { toValue: 1, duration: 16000 + index * 2000, easing: Easing.linear, useNativeDriver: false }),
      ]),
    );
    const bounce = Animated.loop(
      Animated.sequence([
        Animated.timing(hop, { toValue: 1, duration: 380, useNativeDriver: false }),
        Animated.timing(hop, { toValue: 0, duration: 380, useNativeDriver: false }),
      ]),
    );
    const start = Animated.sequence([Animated.delay(index * 3000), walk]);
    start.start();
    bounce.start();
    return () => {
      start.stop();
      bounce.stop();
    };
  }, [travel, hop, index, reduce]);

  const style = useMemo(() => ({ top: `${lane}%` as const }), [lane]);

  if (reduce) {
    return <Text style={[styles.animal, style, { left: `${(index * 29) % 80}%` }]}>{emoji}</Text>;
  }
  return (
    <Animated.Text
      style={[
        styles.animal,
        style,
        {
          transform: [
            { translateX: travel.interpolate({ inputRange: [0, 1], outputRange: [-60, width + 60] }) },
            { translateY: hop.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) },
          ],
        },
      ]}
    >
      {emoji}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  animal: {
    position: 'absolute',
    fontSize: 30,
    opacity: 0.6,
  },
});
