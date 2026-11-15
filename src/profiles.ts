import { create } from 'zustand';
import { clearAllStats, clearProfileStats, deleteProfileData, getGlobalSetting, setGlobalSetting, setProfile } from './db/persistence';
import { usePrefs } from './prefs';
import { useProgress } from './sudoku/progressStore';
import { flushWrites, useGameStore } from './sudoku/store';

export interface Profile {
  id: string;
  name: string;
}

const DEFAULT_PROFILE: Profile = { id: 'default', name: 'Player 1' };

interface ProfilesState {
  profiles: Profile[];
  activeId: string;
  load: () => Promise<void>;
  switchTo: (id: string) => Promise<void>;
  add: () => Promise<void>;
  rename: (id: string, name: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clearStats: (id: string) => Promise<void>;
  clearAllStats: () => Promise<void>;
}

function parseProfiles(raw: string | null): Profile[] {
  try {
    const value = raw === null ? null : JSON.parse(raw);
    if (!Array.isArray(value)) return [DEFAULT_PROFILE];
    const valid = value.filter((p): p is Profile => typeof p?.id === 'string' && typeof p?.name === 'string');
    return valid.length > 0 ? valid : [DEFAULT_PROFILE];
  } catch {
    return [DEFAULT_PROFILE];
  }
}

// Each profile has its own saved game, history, stats and settings. Switching finishes pending saves first,
// then reloads everything for the new profile.
export const useProfiles = create<ProfilesState>()((set, get) => ({
  profiles: [DEFAULT_PROFILE],
  activeId: DEFAULT_PROFILE.id,

  load: async () => {
    const profiles = parseProfiles(await getGlobalSetting('profiles'));
    const saved = await getGlobalSetting('activeProfile');
    const activeId = profiles.some((p) => p.id === saved) ? saved! : profiles[0].id;
    setProfile(activeId);
    set({ profiles, activeId });
  },

  switchTo: async (id) => {
    if (id === get().activeId || !get().profiles.some((p) => p.id === id)) return;
    await flushWrites();
    setProfile(id);
    await setGlobalSetting('activeProfile', id);
    set({ activeId: id });
    await usePrefs.getState().load();
    await useProgress.getState().load();
    await useGameStore.getState().reload();
  },

  rename: async (id, name) => {
    const trimmed = name.trim().slice(0, 20);
    if (!trimmed) return;
    const next = get().profiles.map((p) => (p.id === id ? { ...p, name: trimmed } : p));
    await setGlobalSetting('profiles', JSON.stringify(next));
    set({ profiles: next });
  },

  // Deletes a player and everything saved for them. The last remaining player cannot be deleted.
  remove: async (id) => {
    const { profiles, activeId } = get();
    if (profiles.length <= 1 || !profiles.some((p) => p.id === id)) return;
    await flushWrites();
    const next = profiles.filter((p) => p.id !== id);
    await setGlobalSetting('profiles', JSON.stringify(next));
    await deleteProfileData(id);
    set({ profiles: next });
    if (id === activeId) {
      const fallback = next[0].id;
      setProfile(fallback);
      await setGlobalSetting('activeProfile', fallback);
      set({ activeId: fallback });
      await usePrefs.getState().load();
      await useProgress.getState().load();
      await useGameStore.getState().reload();
    }
  },

  // Clears the games and badges of one player, or of everyone. Settings and saved games are kept.
  clearStats: async (id) => {
    await flushWrites();
    await clearProfileStats(id);
    if (id === get().activeId) await useProgress.getState().load();
  },

  clearAllStats: async () => {
    await flushWrites();
    await clearAllStats();
    await useProgress.getState().load();
  },

  add: async () => {
    const { profiles } = get();
    const id = `p${Date.now().toString(36)}`;
    const next = [...profiles, { id, name: `Player ${profiles.length + 1}` }];
    await setGlobalSetting('profiles', JSON.stringify(next));
    set({ profiles: next });
    await get().switchTo(id);
  },
}));

// Starts the app for the active profile: profile list, preferences, saved game and progress.
export async function bootApp() {
  await useProfiles.getState().load();
  await usePrefs.getState().load();
  await useGameStore.getState().init();
  await useProgress.getState().load();
}
