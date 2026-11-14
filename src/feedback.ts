import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { usePrefs } from './prefs';

// Haptics only exist on native; the preference is respected there and ignored on web.
export function haptic(kind: 'tick' | 'error' | 'success') {
  if (Platform.OS === 'web' || !usePrefs.getState().haptics) return;
  if (kind === 'tick') void Haptics.selectionAsync();
  if (kind === 'error') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  if (kind === 'success') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
