import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { useGameStore } from '../sudoku/store';

// Pauses the timer and saves when the app or tab goes away, and resumes when it comes back.
export function useGameLifecycle() {
  useEffect(() => {
    const { pause, resume } = useGameStore.getState();
    resume();
    const subscription = AppState.addEventListener('change', (state) => (state === 'active' ? resume() : pause()));
    if (Platform.OS !== 'web') return () => subscription.remove();

    const onVisibility = () => (document.visibilityState === 'hidden' ? pause() : resume());
    window.addEventListener('pagehide', pause);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      subscription.remove();
      window.removeEventListener('pagehide', pause);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);
}
