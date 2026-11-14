import { useEffect, useState } from 'react';
import { Animated, Easing, Text } from 'react-native';
import { useReduceMotion } from '../motion';

// Counts from zero up to `value`. Under reduced motion it shows the final number straight away.
export function CountUp({ value, format, style }: { value: number; format: (n: number) => string; style?: object }) {
  const reduce = useReduceMotion();
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const progress = new Animated.Value(0);
    const id = progress.addListener(({ value: v }) => setAnimated(v));
    Animated.timing(progress, { toValue: value, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
    return () => {
      progress.removeListener(id);
      progress.stopAnimation();
    };
  }, [value, reduce]);

  return <Text style={style}>{format(reduce ? value : animated)}</Text>;
}
