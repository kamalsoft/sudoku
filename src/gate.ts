import { create } from 'zustand';
import { usePrefs } from './prefs';

interface GateState {
  open: boolean;
  a: number;
  b: number;
  options: number[];
  answer: number;
  onPass: (() => void) | null;
  close: () => void;
}

export const useGate = create<GateState>()((set) => ({
  open: false,
  a: 0,
  b: 0,
  options: [],
  answer: 0,
  onPass: null,
  close: () => set({ open: false, onPass: null }),
}));

// Runs `go` straight away, or after a grown-up answers a sum when Parent lock is on.
export function askGrownUp(go: () => void) {
  if (!usePrefs.getState().parentLock) return go();
  const a = 4 + Math.floor(Math.random() * 6);
  const b = 3 + Math.floor(Math.random() * 6);
  const answer = a + b;
  const wrong = new Set<number>();
  while (wrong.size < 3) {
    const n = answer + (Math.random() < 0.5 ? -1 : 1) * (1 + Math.floor(Math.random() * 4));
    if (n !== answer && n > 0) wrong.add(n);
  }
  const options = [answer, ...wrong].sort(() => Math.random() - 0.5);
  useGate.setState({ open: true, a, b, answer, options, onPass: go });
}
