import { create } from 'zustand';

// The latest encouragement to show over the game. The nonce changes each time, so the same line can show twice.
export const useMotivation = create<{ message: string | null; nonce: number; say: (message: string) => void }>()((set) => ({
  message: null,
  nonce: 0,
  say: (message) => set((s) => ({ message, nonce: s.nonce + 1 })),
}));
