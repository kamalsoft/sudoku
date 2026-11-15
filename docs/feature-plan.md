# Feature plan

Every feature below is switched on or off in Settings, unless it is a fixed part of the game.

## Phase 1: play and progress
| Feature | Settings | Behaviour |
|---|---|---|
| Hints | Hints: on/off; hints per game (3, 5, unlimited) | "Hint" button fills the selected empty cell with its correct digit. Hints are not mistakes. Each game records hints used. |
| Puzzle replay | none (Stats screen) | Recent games on the Stats screen have a Replay button that starts the same puzzle again. Each game stores its puzzle. |
| Stars and achievements | Stars and badges: on/off | Each win earns 1 to 3 stars (no mistakes and no hints = 3). Badges unlock from history: first win, 5 and 10 wins, first daily, 3-day daily streak, no-mistake win, a hard-or-higher win. |
| Practice mode (levels) | Level up: on/off | When on, Hard unlocks after 3 wins on Medium, Expert after 3 on Hard, and Evil after 3 on Expert. Locked levels show a lock. |
| Reward animation | Rewards: on/off | After a daily win or a new badge, a celebration plays with the chosen animal friends bouncing in a row. |

## Phase 2: comfort and grown-ups
| Feature | Settings | Behaviour |
|---|---|---|
| Large digits | Large digits: on/off | Board and keypad digits are 30% bigger. |
| Colour-blind friendly | Colour-blind friendly: on/off | Wrong cells get a "!" marker, not only red. Matching-number cells get a dashed outline. |
| Parent lock | Parent lock: on/off | Opening Settings asks a simple sum that a grown-up answers. |
| Parent summary | none (Stats screen) | This week's games, time played, wins, and a bar per day. |
| Profiles | Profile switcher on the Settings screen | Each child has their own progress, stats, and settings on the same device. |

## Phase 3: languages
| Feature | Settings | Behaviour |
|---|---|---|
| Language | Language: English, Español | Interface text switches. Strings not yet translated fall back to English. |

## Status
- Done and checked in Chrome: hints, level up, parent gate, language (Spanish and English), profiles (add and switch), replay data.
- Done and unit-tested: stars, badges, weekly summary, level unlocks, solver for replay, schema v3 and v4 migrations.
- Built but not browser-checked yet: replay button, badges and recent games on Stats, parent summary, reward parade, large digits, colour-blind markers.
- Translated: game header, number pad, celebration, grown-up gate, Settings. Stats and the parent summary are still English.

## Not in this work
- Sound tuning: the clips are synthesized and I can't listen to them. Needs ears and a decision on the sound.
- Native release builds, store listings, and the iOS build: need your Apple and Google accounts.
- Offline check on phones: needs a device.

## Data
- Schema v3 adds per-game `puzzle`, `mistakes`, `hints`, `stars`, and `profile`.
- Settings keys are prefixed with the profile id.
