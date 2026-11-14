---
name: sudoku-memory
description: Use before diagnosing a Sudoku app bug, failing test, or unclear requirement, and after fixing one, to search or record it in .team/memory.
---
# Project memory: issues, requirements, fixes (Sudoku)

Store: `.team/memory/` (index `INDEX.md`, records in `records/`, template `TEMPLATE.md`)

Scope: durable, searchable knowledge about this Sudoku app: puzzle engine, board state, UI, persistence, and build/tooling. Not personal notes, not session chatter, not decisions that need the user's approval. A record may link a decision; it never replaces one.

Verification commands for this repo (run them before marking anything `verified`):
- `npm test` (engine tests, `src/sudoku/engine.test.ts`)
- `npx tsc --noEmit`
- `npx expo lint`

## 1. Search before you diagnose
1. Pull the exact error text, failing test name, or file path.
2. `rg -i "<symptom or file>" .team/memory/INDEX.md .team/memory/records/`
3. On a match:
   - `fixed` or `verified`: re-run its **Verification** commands first. If they pass, the symptom differs; record a new issue linking the old ID.
   - `open`: read **Root cause** and **Next step** first.
   - `workaround`: use it; keep the record open.
4. No match: diagnose, then record.

## 2. Kinds
- `issue`: a defect or failure, with symptom and root cause.
- `requirement`: a constraint not obvious from the code (for example, a clue target the generator can't hit). Link the spec section.
- `fix`: a change that resolves an issue. Link the issue ID.
- `rule`: a working rule for the team.

## 3. Record it
- **ID:** next free `MEM-###` in `INDEX.md`. Never reuse an ID.
- **File:** `.team/memory/records/MEM-###-<kebab-slug>.md`, built from `.team/memory/TEMPLATE.md`.
- **Status:** `open` | `workaround` | `fixed` | `verified` | `superseded`. Set `verified` only after running the commands.
- Replace a record by setting the old one `superseded` and linking the new ID. Never delete.
- Update `INDEX.md` in the same change as the record.

## 4. Quality bar
- Record micro detail (file, line, symbol, command, exact error text) and macro detail (module, contract, spec link).
- "It failed" is not a record. Quote the error.
- State what was **not** checked.
- Keep each record to one screen (about 350 words). Link code instead of pasting it.

## 5. Never record
- Secrets: tokens, API keys, `.env` contents, signing credentials. Write `<redacted>`.
- Personal data about the player (names, device IDs, play history from a real account).
- Unverified claims written as facts. Use "suspected" or omit.

## 6. Keep it honest
- When you change a file a record points to, update its micro detail in the same change.
- If a `fixed` record's verification fails, set it back to `open` and say so.
- Check a record's status and date before quoting it.

## Don't
- Don't add a second index or database. `INDEX.md` is the index.
- Don't store records outside `.team/memory/`.
