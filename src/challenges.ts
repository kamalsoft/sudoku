import type { Difficulty } from './sudoku/levels.ts';
import { hashText } from './sudoku/rules.ts';

// A named challenge: a fixed level, clock, mistake limit and hint limit. Challenges always have a mistake limit,
// so they are never casual (Kid-safe mode aside, which turns limits off).
export interface Challenge {
  id: string;
  level: Difficulty;
  // Minutes on the clock, or null for no clock.
  minutes: number | null;
  mistakes: number;
  // Hints allowed in the game, or null for no limit.
  hintLimit: number | null;
}

export const CHALLENGES: Challenge[] = [
  { id: 'sunrise', level: 'beginner', minutes: null, mistakes: 3, hintLimit: null },
  { id: 'morning_run', level: 'easy', minutes: 15, mistakes: 3, hintLimit: 3 },
  { id: 'steady_hand', level: 'medium', minutes: 12, mistakes: 3, hintLimit: 2 },
  { id: 'iron_mind', level: 'hard', minutes: 15, mistakes: 2, hintLimit: 1 },
  { id: 'night_owl', level: 'expert', minutes: 20, mistakes: 2, hintLimit: 1 },
  { id: 'dragons_den', level: 'master', minutes: 25, mistakes: 1, hintLimit: 0 },
  { id: 'genius_trial', level: 'genius', minutes: 30, mistakes: 1, hintLimit: 0 },
  { id: 'lunar_walk', level: 'beginner', minutes: null, mistakes: 3, hintLimit: 3 },
  { id: 'comet_dash', level: 'easy', minutes: 10, mistakes: 3, hintLimit: 2 },
  { id: 'orions_belt', level: 'medium', minutes: 15, mistakes: 3, hintLimit: 1 },
  { id: 'nebula', level: 'hard', minutes: 20, mistakes: 2, hintLimit: 1 },
  { id: 'pulsar', level: 'expert', minutes: 15, mistakes: 2, hintLimit: 0 },
  { id: 'quasar', level: 'master', minutes: 30, mistakes: 1, hintLimit: 0 },
  { id: 'supernova', level: 'evil', minutes: 20, mistakes: 1, hintLimit: 0 },
  { id: 'event_horizon', level: 'genius', minutes: 25, mistakes: 1, hintLimit: 0 },
];

export const findChallenge = (id: string | null | undefined) => CHALLENGES.find((c) => c.id === id);

// The mistake and hint limits a game plays under: its challenge's, or the player's own settings.
export function gameLimits(challenge: Challenge | undefined, settings: { mistakeLimit: number | null; hintLimit: number | null }) {
  return challenge
    ? { mistakeLimit: challenge.mistakes, hintLimit: challenge.hintLimit }
    : { mistakeLimit: settings.mistakeLimit, hintLimit: settings.hintLimit };
}

// The Monday that starts the week containing `day` (YYYY-MM-DD).
export function weekStart(day: string): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

// One challenge for the whole week, the same for everyone, picked from the table by the week's start date.
export function weeklyChallenge(day: string): Challenge {
  return CHALLENGES[hashText(`week-${weekStart(day)}`) % CHALLENGES.length];
}
