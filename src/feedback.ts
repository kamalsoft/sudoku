import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { playCue } from './sound';
import type { Cue } from './sound';
import { usePrefs } from './prefs';

export type Feedback = 'tick' | 'error' | 'success';

const CUE: Record<Feedback, Cue> = { tick: 'tick', error: 'error', success: 'win' };

// Sound and haptics for game events. Each respects its own preference. Haptics exist only on native.
export function feedback(kind: Feedback) {
  playCue(CUE[kind]);
  if (Platform.OS === 'web' || !usePrefs.getState().haptics) return;
  if (kind === 'tick') void Haptics.selectionAsync();
  if (kind === 'error') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  if (kind === 'success') void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
