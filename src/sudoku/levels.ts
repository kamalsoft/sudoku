// Every level, from the gentlest to the hardest. The clue counts are targets: the generator can land a little
// above them, and the sparsest levels (master, evil, genius) currently play close to each other.
export const LEVELS = ['beginner', 'easy', 'medium', 'hard', 'expert', 'master', 'evil', 'genius'] as const;
export type Difficulty = (typeof LEVELS)[number];

export const CLUE_TARGETS: Record<Difficulty, number> = {
  beginner: 46,
  easy: 42,
  medium: 34,
  hard: 28,
  expert: 24,
  master: 22,
  evil: 20,
  genius: 18,
};
