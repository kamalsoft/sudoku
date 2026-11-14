import { create } from 'zustand';
import { getSetting, setSetting } from './db/persistence';
import type { ThemeName } from './theme';

interface Prefs {
  theme: ThemeName;
  haptics: boolean;
  autoNotes: boolean;
}

interface PrefsState extends Prefs {
  ready: boolean;
  load: () => Promise<void>;
  update: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
}

const DEFAULTS: Prefs = { theme: 'light', haptics: true, autoNotes: false };

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
