import { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { Bullet, Heading, Page, Para } from '../components/Page';
import { useT } from '../i18n';
import { useTour } from '../tour';
import { useColors } from '../theme';
import type { Palette } from '../theme';

export default function HowToScreen() {
  const c = useColors();
  const t = useT();
  const styles = useMemo(() => makeStyles(c), [c]);
  const replay = () => {
    useTour.getState().show(0);
    router.replace('/');
  };
  return (
    <Page title={t('howto_title')}>
      <Heading>{t('howto_h1')}</Heading>
      <Para>{t('howto_p1')}</Para>
      <Heading>{t('howto_h2')}</Heading>
      <Bullet>{t('howto_b1')}</Bullet>
      <Bullet>{t('howto_b2')}</Bullet>
      <Bullet>{t('howto_b3')}</Bullet>
      <Bullet>{t('howto_b4')}</Bullet>
      <Heading>{t('howto_h3')}</Heading>
      <Bullet>{t('howto_b5')}</Bullet>
      <Bullet>{t('howto_b6')}</Bullet>
      <Heading>{t('howto_h4')}</Heading>
      <Para>{t('howto_p2')}</Para>
      <Pressable accessibilityRole="button" onPress={replay} style={styles.button}>
        <Text style={styles.buttonText}>{t('tour_again')}</Text>
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
