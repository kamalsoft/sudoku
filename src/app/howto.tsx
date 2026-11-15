import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Bullet, Heading, Page, Para } from '../components/Page';
import { useTour } from '../tour';
import { useColors } from '../theme';
import type { Palette } from '../theme';

export default function HowToScreen() {
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);
  const replay = () => {
    useTour.getState().show(0);
    router.replace('/');
  };
  return (
    <Page title="How to play">
      <Heading>The goal</Heading>
      <Para>Fill every row, column and 3×3 block with the digits 1 to 9. Each digit appears only once in each.</Para>

      <Heading>Playing</Heading>
      <Bullet>Tap an empty square, then a number. Wrong numbers flash red and shake.</Bullet>
      <Bullet>Turn on Notes in Settings to write small candidate numbers with Pencil.</Bullet>
      <Bullet>Erase removes your number. A cell with no number loses its notes instead.</Bullet>
      <Bullet>Hint fills the selected square with the right number. It is not a mistake, but it lowers the stars.</Bullet>

      <Heading>Stars and levels</Heading>
      <Bullet>Each win earns one to three stars. Mistakes and hints take stars away.</Bullet>
      <Bullet>With Level up on, harder levels unlock after three wins on the level before.</Bullet>

      <Heading>The menu</Heading>
      <Para>Tap ☰ for levels, time limits, a new or daily puzzle, stats, settings, help and install.</Para>

      <Pressable accessibilityRole="button" onPress={replay} style={styles.button}>
        <Text style={styles.buttonText}>Show the tour again</Text>
      </Pressable>
    </Page>
  );
}

function makeStyles(c: Palette) {
  return StyleSheet.create({
    button: { alignItems: 'center', paddingVertical: 14, borderRadius: c.radius, backgroundColor: c.accent, marginTop: 8 },
    buttonText: { color: c.onAccent, fontWeight: '700', fontSize: 16 },
  });
}
