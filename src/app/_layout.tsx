import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { initPwa } from '../install';
import { ParentGate } from '../components/ParentGate';
import { usePrefs } from '../prefs';
import { useNight } from '../night';
import { bootApp } from '../profiles';
import { maybeShowFirstRunTour } from '../tour';
import { useColors } from '../theme';

export default function RootLayout() {
  const c = useColors();
  const prefsReady = usePrefs((s) => s.ready);

  // Load the saved profile, language and settings once, for every screen. A page opened directly
  // (a bookmark or a refresh) then shows the right language too.
  useEffect(() => {
    initPwa();
    void bootApp().then(maybeShowFirstRunTour);
  }, []);

  // Re-checks the night hours every minute, so the night skin starts and stops on time.
  useEffect(() => {
    const id = setInterval(() => useNight.getState().check(), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!prefsReady) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background }}>
        <ActivityIndicator style={{ flex: 1 }} color={c.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={c.statusBar} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.background } }} />
      <ParentGate />
    </>
  );
}
