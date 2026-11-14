import { create } from 'zustand';
import { CLUE_TARGETS, UNITS, createBoard, createRng, findConflicts, generatePuzzle, isSolved } from './engine';
import type { BoardState, Difficulty } from './engine';
import { emptyHistory, recordChange, redo as redoStep, undo as undoStep } from './history';
import type { History } from './history';
import { applyDigit, applyErase, effectiveMode, fillCandidates, removeFromPeers } from './moves';
import type { Mode } from './moves';
import { SAVED_HISTORY_STEPS, elapsedMs, parseSession, remainingMs } from './session';
import type { SessionRecord } from './session';
import { completedUnits, dailySeed, guardedMistakeLimit, guardedTimeLimit, isMistake, markErrors, outOfMistakes } from './rules';
import { dayKey } from './stats';
import { clearSession, getSetting, loadSessionRaw, recordGame, saveSession, setSetting } from '../db/persistence';
import { feedback } from '../feedback';
import { usePrefs } from '../prefs';

export interface Shake {
  index: number;
  nonce: number;
}

export type FailReason = 'time' | 'mistakes';

// Rows, columns or blocks completed by the last move. The nonce changes each time, so cells can replay the flash.
export interface UnitFlash {
  units: number[];
  nonce: number;
}

interface GameState {
  ready: boolean;
  difficulty: Difficulty;
  board: BoardState;
  solution: number[];
  // Cells in error: duplicates and wrong digits.
  errors: boolean[];
  selected: number | null;
  mode: Mode;
  solved: boolean;
  accumulatedMs: number;
  runningSince: number | null;
  history: History;
  shake: Shake | null;
  unitFlash: UnitFlash | null;
  gameId: number;
  timeLimitMs: number | null;
  mistakes: number;
  // Why the game ended without a win, if it did.
  failed: FailReason | null;
  // Local day of the daily challenge being played, or null for a normal game.
  daily: string | null;
  init: () => Promise<void>;
  selectCell: (index: number) => void;
  moveSelection: (dRow: number, dCol: number) => void;
  setMode: (mode: Mode) => void;
  inputDigit: (digit: number) => void;
  clearSelected: () => void;
  fillNotes: () => void;
  undo: () => void;
  redo: () => void;
  newGame: (difficulty: Difficulty, timeLimitMs?: number | null, daily?: string | null) => void;
  startDaily: () => void;
  setTimeLimit: (timeLimitMs: number | null) => void;
  tick: () => void;
  pause: () => void;
  resume: () => void;
}

// Writes run one at a time, in the order they were requested, on the single database connection.
let writes: Promise<unknown> = Promise.resolve();
function enqueue(task: () => Promise<unknown>) {
  writes = writes.then(task).catch((error) => console.warn('Storage write failed', error));
}

let initializing: Promise<void> | null = null;

function gameFrom(difficulty: Difficulty, daily: string | null) {
  const rng = daily === null ? Math.random : createRng(dailySeed(daily));
  const { puzzle, solution } = generatePuzzle(difficulty, rng);
  return { board: createBoard(puzzle), solution, errors: markErrors(findConflicts(puzzle), puzzle, solution), solved: false };
}

function hasProgress(board: BoardState): boolean {
  return board.values.some((v, i) => v !== 0 && !board.givens[i]) || board.notes.some((n) => n !== 0);
}

// A finished game (solved, out of time, or out of mistakes) accepts no more moves.
const isOver = (s: Pick<GameState, 'solved' | 'failed'>) => s.solved || s.failed !== null;

function parseTimeLimit(raw: string | null): number | null {
  try {
    const value = raw === null ? null : JSON.parse(raw);
    return typeof value === 'number' && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === 'string' && value in CLUE_TARGETS;
}

export const useGameStore = create<GameState>()((set, get) => {
  const elapsedNow = () => {
    const s = get();
    return elapsedMs(s.accumulatedMs, s.runningSince, Date.now());
  };

  const save = () => {
    const s = get();
    const session: SessionRecord = {
      difficulty: s.difficulty,
      solution: s.solution,
      board: s.board,
      accumulatedMs: elapsedNow(),
      timeLimitMs: s.timeLimitMs,
      mistakes: s.mistakes,
      daily: s.daily,
      history: {
        past: s.history.past.slice(-SAVED_HISTORY_STEPS),
        future: s.history.future.slice(-SAVED_HISTORY_STEPS),
      },
    };
    enqueue(() => saveSession(session));
  };

  // Ends the game without a win and records it. The session is cleared, so a reload starts fresh.
  const fail = (reason: FailReason, elapsed: number) => {
    const s = get();
    set({ failed: reason, accumulatedMs: elapsed, runningSince: null });
    const game = {
      difficulty: s.difficulty,
      won: false,
      elapsedMs: elapsed,
      day: dayKey(new Date()),
      daily: s.daily !== null,
    };
    enqueue(() => recordGame(game));
    enqueue(clearSession);
    feedback('error');
  };

  // Writes the board, keeps undo history, and recomputes the derived state.
  // A solved game is recorded and its session cleared.
  const commit = (board: BoardState) => {
    const s = get();
    if (board === s.board) return;
    const solved = isSolved(board.values, s.solution);
    const errors = markErrors(findConflicts(board.values), board.values, s.solution);
    const history = recordChange(s.history, s.board);
    const before = completedUnits(UNITS, s.board.values, s.solution);
    const fresh = completedUnits(UNITS, board.values, s.solution).filter((u) => !before.includes(u));
    const unitFlash = fresh.length > 0 ? { units: fresh, nonce: (s.unitFlash?.nonce ?? 0) + 1 } : s.unitFlash;
    if (fresh.length > 0) feedback('tick');

    if (solved) {
      const elapsed = elapsedNow();
      set({ board, errors, solved, history, unitFlash, accumulatedMs: elapsed, runningSince: null });
      const game = {
        difficulty: s.difficulty,
        won: true,
        elapsedMs: elapsed,
        day: dayKey(new Date()),
        daily: s.daily !== null,
      };
      enqueue(() => recordGame(game));
      enqueue(clearSession);
      feedback('success');
      return;
    }

    set({ board, errors, solved, history, unitFlash });
    save();
  };

  const shake = (index: number) => {
    set({ shake: { index, nonce: (get().shake?.nonce ?? 0) + 1 } });
  };

  return {
    ready: false,
    difficulty: 'medium',
    board: createBoard(new Array<number>(81).fill(0)),
    solution: new Array<number>(81).fill(0),
    errors: new Array<boolean>(81).fill(false),
    selected: null,
    mode: 'enter',
    solved: false,
    accumulatedMs: 0,
    runningSince: null,
    history: emptyHistory,
    shake: null,
    unitFlash: null,
    gameId: 0,
    timeLimitMs: null,
    mistakes: 0,
    failed: null,
    daily: null,

    init: () => {
      initializing ??= (async () => {
        const [savedDifficulty, savedLimit, raw] = await Promise.all([
          getSetting('difficulty'),
          getSetting('timeLimit'),
          loadSessionRaw(),
        ]);
        const session = raw ? parseSession(raw) : null;
        if (session) {
          set({
            ready: true,
            difficulty: session.difficulty,
            board: session.board,
            solution: session.solution,
            errors: markErrors(findConflicts(session.board.values), session.board.values, session.solution),
            solved: false,
            accumulatedMs: session.accumulatedMs,
            runningSince: null,
            selected: null,
            mode: 'enter',
            history: session.history ?? emptyHistory,
            gameId: get().gameId + 1,
            timeLimitMs: session.timeLimitMs ?? null,
            mistakes: session.mistakes ?? 0,
            failed: null,
            daily: session.daily ?? null,
          });
        } else {
          get().newGame(isDifficulty(savedDifficulty) ? savedDifficulty : 'medium', parseTimeLimit(savedLimit));
        }
      })();
      return initializing;
    },

    selectCell: (index) => {
      if (get().selected !== index) feedback('tick');
      set({ selected: index });
    },

    moveSelection: (dRow, dCol) => {
      const current = get().selected ?? 40;
      const row = Math.min(8, Math.max(0, Math.floor(current / 9) + dRow));
      const col = Math.min(8, Math.max(0, (current % 9) + dCol));
      get().selectCell(row * 9 + col);
    },

    setMode: (mode) => set({ mode: effectiveMode(mode, usePrefs.getState().notes) }),

    inputDigit: (digit) => {
      const { selected, board } = get();
      const mode = effectiveMode(get().mode, usePrefs.getState().notes);
      if (selected === null || isOver(get())) return;
      let next = applyDigit(board, selected, mode, digit);
      if (next === board) return;
      const prefs = usePrefs.getState();
      if (mode === 'enter' && prefs.notes && prefs.autoNotes) next = removeFromPeers(next, selected, digit);

      // Count the mistake before committing, so the saved session includes it.
      const wrong = mode === 'enter' && isMistake(get().solution, selected, digit);
      if (wrong) set({ mistakes: get().mistakes + 1 });
      commit(next);

      if (mode !== 'enter' || get().solved) return;
      if (wrong) {
        shake(selected);
        if (outOfMistakes(get().mistakes, guardedMistakeLimit(prefs.kidSafe, prefs.mistakeLimit))) fail('mistakes', elapsedNow());
        else feedback('error');
      } else if (get().errors[selected]) {
        shake(selected);
        feedback('error');
      } else {
        feedback('tick');
      }
    },

    clearSelected: () => {
      const { selected, board } = get();
      if (selected === null || isOver(get())) return;
      commit(applyErase(board, selected));
    },

    fillNotes: () => {
      if (isOver(get()) || !usePrefs.getState().notes) return;
      commit(fillCandidates(get().board));
    },

    undo: () => {
      const s = get();
      if (isOver(s)) return;
      const step = undoStep(s.history, s.board);
      if (!step) return;
      set({ board: step.board, history: step.history, errors: markErrors(findConflicts(step.board.values), step.board.values, s.solution) });
      save();
    },

    redo: () => {
      const s = get();
      if (isOver(s)) return;
      const step = redoStep(s.history, s.board);
      if (!step) return;
      set({ board: step.board, history: step.history, errors: markErrors(findConflicts(step.board.values), step.board.values, s.solution) });
      save();
    },

    newGame: (difficulty, timeLimitMs = get().timeLimitMs, daily = null) => {
      const s = get();
      if (s.ready && !isOver(s) && hasProgress(s.board)) {
        const game = {
          difficulty: s.difficulty,
          won: false,
          elapsedMs: elapsedNow(),
          day: dayKey(new Date()),
          daily: s.daily !== null,
        };
        enqueue(() => recordGame(game));
      }
      set({
        ...gameFrom(difficulty, daily),
        ready: true,
        difficulty,
        timeLimitMs: guardedTimeLimit(usePrefs.getState().kidSafe, timeLimitMs),
        mistakes: 0,
        failed: null,
        daily,
        selected: null,
        mode: 'enter',
        accumulatedMs: 0,
        runningSince: Date.now(),
        history: emptyHistory,
        shake: null,
        gameId: s.gameId + 1,
      });
      enqueue(() => setSetting('difficulty', difficulty));
      enqueue(() => setSetting('timeLimit', JSON.stringify(timeLimitMs)));
      save();
    },

    startDaily: () => get().newGame('medium', get().timeLimitMs, dayKey(new Date())),

    setTimeLimit: (timeLimitMs) => get().newGame(get().difficulty, timeLimitMs, get().daily),

    // Called every second by the header. Ends the game once the time or the mistake limit is reached.
    // The mistake limit is read live, so lowering it in Settings applies to the game in progress.
    tick: () => {
      const s = get();
      if (!s.ready || isOver(s)) return;
      const prefs = usePrefs.getState();
      if (outOfMistakes(s.mistakes, guardedMistakeLimit(prefs.kidSafe, prefs.mistakeLimit))) {
        fail('mistakes', elapsedNow());
        return;
      }
      const limit = guardedTimeLimit(prefs.kidSafe, s.timeLimitMs);
      if (limit === null || remainingMs(limit, elapsedNow()) > 0) return;
      fail('time', limit);
    },

    pause: () => {
      if (get().runningSince === null) return;
      set({ accumulatedMs: elapsedNow(), runningSince: null });
      save();
    },

    resume: () => {
      const s = get();
      if (!s.ready || isOver(s) || s.runningSince !== null) return;
      set({ runningSince: Date.now() });
    },
  };
});
