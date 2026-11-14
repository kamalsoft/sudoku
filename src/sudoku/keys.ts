export type Command =
  | { type: 'digit'; digit: number }
  | { type: 'erase' }
  | { type: 'pencil' }
  | { type: 'move'; dRow: number; dCol: number }
  | { type: 'undo' }
  | { type: 'redo' };

const ARROWS: Record<string, { dRow: number; dCol: number }> = {
  ArrowUp: { dRow: -1, dCol: 0 },
  ArrowDown: { dRow: 1, dCol: 0 },
  ArrowLeft: { dRow: 0, dCol: -1 },
  ArrowRight: { dRow: 0, dCol: 1 },
};

// Maps a web keyboard event to a game command. Returns null for keys the game does not use.
export function keyCommand(key: string, mods: { ctrl: boolean; shift: boolean }): Command | null {
  if (mods.ctrl && key.toLowerCase() === 'z') return mods.shift ? { type: 'redo' } : { type: 'undo' };
  if (mods.ctrl && key.toLowerCase() === 'y') return { type: 'redo' };
  if (mods.ctrl) return null;
  if (/^[1-9]$/.test(key)) return { type: 'digit', digit: Number(key) };
  if (key === 'Backspace' || key === 'Delete' || key === '0') return { type: 'erase' };
  if (key.toLowerCase() === 'n') return { type: 'pencil' };
  if (ARROWS[key]) return { type: 'move', ...ARROWS[key] };
  return null;
}
