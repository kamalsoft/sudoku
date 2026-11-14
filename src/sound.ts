import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { usePrefs } from './prefs';

const SOURCES = {
  tick: require('../assets/sounds/tick.wav'),
  error: require('../assets/sounds/error.wav'),
  win: require('../assets/sounds/win.wav'),
};

export type Cue = keyof typeof SOURCES;

// One player per cue, created on first use, so rapid taps don't reload the clip.
const players: Partial<Record<Cue, AudioPlayer>> = {};
let modeSet = false;

export function playCue(cue: Cue) {
  if (!usePrefs.getState().sound) return;
  try {
    if (!modeSet) {
      modeSet = true;
      void setAudioModeAsync({ playsInSilentMode: false }).catch((error) => console.warn('Audio mode failed', error));
    }
    let player = players[cue];
    if (!player) {
      player = createAudioPlayer(SOURCES[cue]);
      players[cue] = player;
    }
    void player.seekTo(0);
    player.play();
  } catch (error) {
    console.warn('Sound failed', error);
  }
}
