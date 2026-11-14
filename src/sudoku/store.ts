import { create } from 'zustand';
import { CLUE_TARGETS, createBoard, findConflicts, generatePuzzle, isSolved } from './engine';
import type { BoardState, Difficulty } from './engine';
import { emptyHistory, recordChange, redo as redoStep, undo as undoStep } from './history';
import type { History } from './history';
import { applyDigit, applyErase, fillCandidates, removeFromPeers } from './moves';
import type { Mode } from './moves';
import { elapsedMs, parseSession } from './session';
import type { SessionRecord } from './session';
import { dayKey } from './stats';
import { clearSession, getSetting, loadSessionRaw, recordGame, saveSession, setSetting } from '../db/persistence';
import { haptic } from '../feedback';
import { usePrefs } from '../prefs';

export interface Shake {
  index: number;
  nonce: number;
}

interface GameState {
  ready: boolean;
  difficulty: Difficulty;
  board: BoardState;
  solution: number[];
  conflicts: boolean[];
  selected: number | null;
  mode: Mode;
  solved: boolean;
  accumulatedMs: number;
  runningSince: number | null;
  history: History;
  shake: Shake | null;
  gameId: number;
  init: () => Promise<void>;
  selectCell: (index: number) => void;
  moveSelection: (dRow: number, dCol: number) => void;
  setMode: (mode: Mode) => void;
  inputDigit: (digit: number) => void;
  clearSelected: () => void;
  fillNotes: () => void;
  undo: () => void;
  redo: () => void;
  newGame: (difficulty: Difficulty) => void;
  pause: () => void;
  resume: () => void;
}

// Writes run one at a time, in the order they were requested, on the single database connection.
let writes: Promise<unknown> = Promise.resolve();
function enqueue(task: () => Promise<unknown>) {
  writes = writes.then(task).catch((error) => console.warn('Storage write failed', error));
}

let initializing: Promise<void> | null = null;

function gameFrom(difficulty: Difficulty) {
  const { puzzle, solution } = generatePuzzle(difficulty);
  return { board: createBoard(puzzle), solution, conflicts: findConflicts(puzzle), solved: false };
}

function hasProgress(board: BoardState): boolean {
  return board.values.some((v, i) => v !== 0 && !board.givens[i]) || board.notes.some((n) => n !== 0);
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
    };
    enqueue(() => saveSession(session));
  };

  // Writes the board, keeps undo history, and recomputes the derived state.
  // A solved game is recorded and its session cleared.
  const commit = (board: BoardState) => {
    const s = get();
    if (board === s.board) return;
    const solved = isSolved(board.values, s.solution);
    const conflicts = findConflicts(board.values);
    const history = recordChange(s.history, s.board);

    if (solved) {
      const elapsed = elapsedNow();
      set({ board, conflicts, solved, history, accumulatedMs: elapsed, runningSince: null });
      const game = { difficulty: s.difficulty, won: true, elapsedMs: elapsed, day: dayKey(new Date()) };
      enqueue(() => recordGame(game));
      enqueue(clearSession);
      haptic('success');
      return;
    }

    set({ board, conflicts, solved, history });
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
    conflicts: new Array<boolean>(81).fill(false),
    selected: null,
    mode: 'enter',
    solved: false,
    accumulatedMs: 0,
    runningSince: null,
    history: emptyHistory,
    shake: null,
    gameId: 0,

    init: () => {
      initializing ??= (async () => {
        const [savedDifficulty, raw] = await Promise.all([getSetting('difficulty'), loadSessionRaw()]);
        const session = raw ? parseSession(raw) : null;
        if (session) {
          set({
            ready: true,
            difficulty: session.difficulty,
            board: session.board,
            solution: session.solution,
            conflicts: findConflicts(session.board.values),
            solved: false,
            accumulatedMs: session.accumulatedMs,
            runningSince: null,
            selected: null,
            mode: 'enter',
            history: emptyHistory,
            gameId: get().gameId + 1,
          });
        } else {
          get().newGame(isDifficulty(savedDifficulty) ? savedDifficulty : 'medium');
        }
      })();
      return initializing;
    },

    selectCell: (index) => {
      if (get().selected !== index) haptic('tick');
      set({ selected: index });
      if (get().mode === 'erase' && !get().solved) commit(applyErase(get().board, index));
    },

    moveSelection: (dRow, dCol) => {
      const current = get().selected ?? 40;
      const row = Math.min(8, Math.max(0, Math.floor(current / 9) + dRow));
      const col = Math.min(8, Math.max(0, (current % 9) + dCol));
      get().selectCell(row * 9 + col);
    },

    setMode: (mode) => set({ mode }),

    inputDigit: (digit) => {
      const { selected, mode, board, solved } = get();
      if (selected === null || solved) return;
      let next = applyDigit(board, selected, mode, digit);
      if (next === board) return;
      if (mode === 'enter' && usePrefs.getState().autoNotes) next = removeFromPeers(next, selected, digit);
      commit(next);

      if (mode !== 'enter' || get().solved) return;
      if (get().conflicts[selected]) {
        shake(selected);
        haptic('error');
      } else {
        haptic('tick');
      }
    },

    clearSelected: () => {
      const { selected, board, solved } = get();
      if (selected === null || solved) return;
      commit(applyErase(board, selected));
    },

    fillNotes: () => {
      if (get().solved) return;
      commit(fillCandidates(get().board));
    },

    undo: () => {
      const s = get();
      if (s.solved) return;
      const step = undoStep(s.history, s.board);
      if (!step) return;
      set({ board: step.board, history: step.history, conflicts: findConflicts(step.board.values) });
      save();
    },

    redo: () => {
      const s = get();
      if (s.solved) return;
      const step = redoStep(s.history, s.board);
      if (!step) return;
      set({ board: step.board, history: step.history, conflicts: findConflicts(step.board.values) });
      save();
    },

    newGame: (difficulty) => {
      const s = get();
      if (s.ready && !s.solved && hasProgress(s.board)) {
        const game = { difficulty: s.difficulty, won: false, elapsedMs: elapsedNow(), day: dayKey(new Date()) };
        enqueue(() => recordGame(game));
      }
      set({
        ...gameFrom(difficulty),
        ready: true,
        difficulty,
        selected: null,
        mode: 'enter',
        accumulatedMs: 0,
        runningSince: Date.now(),
        history: emptyHistory,
        shake: null,
        gameId: s.gameId + 1,
      });
      enqueue(() => setSetting('difficulty', difficulty));
      save();
    },

    pause: () => {
      if (get().runningSince === null) return;
      set({ accumulatedMs: elapsedNow(), runningSince: null });
      save();
    },

    resume: () => {
      const s = get();
      if (!s.ready || s.solved || s.runningSince !== null) return;
      set({ runningSince: Date.now() });
    },
  };
});
