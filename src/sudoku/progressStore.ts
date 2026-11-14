import { create } from 'zustand';
import { getSetting, loadGames, setSetting } from '../db/persistence';
import { badges as computeBadges } from './progress';
import { dayKey, summarize } from './stats';
import type { GameRecord } from './stats';

interface ProgressState {
  games: GameRecord[];
  unlockedBadges: string[];
  // Badges earned since the player last saw them. Shown once in the celebration.
  unseenBadges: string[];
  load: () => Promise<void>;
  markBadgesSeen: () => Promise<void>;
}

function parseIds(raw: string | null): string[] | null {
  try {
    const value = raw === null ? null : JSON.parse(raw);
    return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : null;
  } catch {
    return null;
  }
}

// Games and badges come from the saved history. The first load marks existing badges as seen, so nobody is
// celebrated for badges they already had.
export const useProgress = create<ProgressState>()((set, get) => ({
  games: [],
  unlockedBadges: [],
  unseenBadges: [],

  load: async () => {
    const games = await loadGames();
    const stats = summarize(games, dayKey(new Date()));
    const unlockedBadges = computeBadges(games, stats.dailyStreak)
      .filter((b) => b.unlocked)
      .map((b) => b.id);
    const seen = parseIds(await getSetting('seenBadges'));
    const unseenBadges = seen === null ? [] : unlockedBadges.filter((id) => !seen.includes(id));
    if (seen === null) await setSetting('seenBadges', JSON.stringify(unlockedBadges));
    set({ games, unlockedBadges, unseenBadges });
  },

  markBadgesSeen: async () => {
    const { unlockedBadges } = get();
    set({ unseenBadges: [] });
    await setSetting('seenBadges', JSON.stringify(unlockedBadges));
  },
}));
