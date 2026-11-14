import { create } from 'zustand';
import { getSetting, setSetting } from './db/persistence';
import type { ThemeName } from './theme';

interface Prefs {
  theme: ThemeName;
  haptics: boolean;
  sound: boolean;
  autoNotes: boolean;
  // Mistakes that end a game. null is casual mode: mistakes are counted but never end the game.
  mistakeLimit: number | null;
}

interface PrefsState extends Prefs {
  ready: boolean;
  load: () => Promise<void>;
  update: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
}

const DEFAULTS: Prefs = { theme: 'light', haptics: true, sound: true, autoNotes: false, mistakeLimit: null };

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
