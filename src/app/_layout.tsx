import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { initPwa } from '../install';
import { useColors } from '../theme';

export default function RootLayout() {
  const c = useColors();
  useEffect(() => {
    initPwa();
  }, []);
  return (
    <>
      <StatusBar style={c.statusBar} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }} />
    </>
  );
}
