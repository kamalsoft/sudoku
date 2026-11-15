import { create } from 'zustand';
import { getSetting, setSetting } from './db/persistence';
import type { ThemeName } from './theme';

// Sound style: Classic, Calm (softer and slower), Playful (brighter and quicker), or Silent.
export type SoundPack = 'classic' | 'calm' | 'playful' | 'silent';

interface Prefs {
  theme: ThemeName;
  // Dark skin from 8 pm to 7 am, whatever skin is chosen.
  autoNight: boolean;
  haptics: boolean;
  sound: boolean;
  // Pencil marks on or off. Off hides the notes controls and makes digit entry always write values.
  notes: boolean;
  autoNotes: boolean;
  // Mistakes that end a game. null is casual mode: mistakes are counted but never end the game.
  mistakeLimit: number | null;
  // Gentle play: mistakes never end a game and timed games are off.
  kidSafe: boolean;
  // Hints: on/off, and how many per game (null is unlimited).
  hints: boolean;
  hintLimit: number | null;
  // Stars and badges on the Stats screen.
  badges: boolean;
  // Level up: harder levels unlock after wins on the level before.
  levelUp: boolean;
  // Practice by digit: remaining counts per digit, and a highlight of where a digit can go.
  practice: boolean;
  soundPack: SoundPack;
  // Celebrations with the animal friends after a daily win or a new badge.
  rewards: boolean;
  // Comfort: bigger digits, and wrong or matching cells marked with more than colour.
  largeDigits: boolean;
  colorBlind: boolean;
  // Settings ask a grown-up sum before opening.
  parentLock: boolean;
  // Interface language.
  language: 'en' | 'es' | 'fr';
  // Animal friends that walk across the game screen, by id from AnimalFriends.
  animals: string[];
}

interface PrefsState extends Prefs {
  ready: boolean;
  load: () => Promise<void>;
  update: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
}

const DEFAULTS: Prefs = {
  theme: 'light',
  autoNight: false,
  haptics: true,
  sound: true,
  notes: true,
  autoNotes: false,
  mistakeLimit: null,
  kidSafe: false,
  hints: true,
  hintLimit: 3,
  badges: true,
  levelUp: false,
  practice: false,
  soundPack: 'classic',
  rewards: true,
  largeDigits: false,
  colorBlind: false,
  parentLock: false,
  language: 'en',
  animals: [],
};

export const usePrefs = create<PrefsState>()((set) => ({
  ...DEFAULTS,
  ready: false,

  load: async () => {
    const entries = await Promise.all(
      (Object.keys(DEFAULTS) as (keyof Prefs)[]).map(async (key) => {
        const raw = await getSetting(`pref.${key}`);
        return [key, raw === null ? DEFAULTS[key] : (JSON.parse(raw) as Prefs[typeof key])] as const;
      }),
    );
    set({ ...Object.fromEntries(entries), ready: true } as Partial<PrefsState>);
  },

  update: (key, value) => {
    set({ [key]: value } as Partial<PrefsState>);
    void setSetting(`pref.${key}`, JSON.stringify(value)).catch((error) => console.warn('Preference save failed', error));
  },
}));
