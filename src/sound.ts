import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { usePrefs } from './prefs';

const SOURCES = {
  tick: require('../assets/sounds/tick.wav'),
  error: require('../assets/sounds/error.wav'),
  win: require('../assets/sounds/win.wav'),
};

export type Cue = keyof typeof SOURCES;

// The packs reuse the same clips: calm is softer and slower, playful is brighter and quicker.
const PACKS = {
  classic: { rate: 1, volume: 1 },
  calm: { rate: 0.85, volume: 0.5 },
  playful: { rate: 1.25, volume: 1 },
} as const;

// One player per cue, created on first use, so rapid taps don't reload the clip.
const players: Partial<Record<Cue, AudioPlayer>> = {};
let modeSet = false;

export function playCue(cue: Cue) {
  const { sound, soundPack } = usePrefs.getState();
  if (!sound || soundPack === 'silent') return;
  const pack = PACKS[soundPack];
  try {
    if (!modeSet) {
      modeSet = true;
      void setAudioModeAsync({ playsInSilentMode: true }).catch((error) => console.warn('Audio mode failed', error));
    }
    let player = players[cue];
    if (!player) {
      player = createAudioPlayer(SOURCES[cue]);
      players[cue] = player;
    }
    player.volume = pack.volume;
    player.setPlaybackRate(pack.rate);
    void player.seekTo(0);
    player.play();
  } catch (error) {
    console.warn('Sound failed', error);
  }
}
