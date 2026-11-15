import { create } from 'zustand';

// The game menu sheet. Options live here so the game screen keeps only the board and the number pad.
export const useMenu = create<{ open: boolean; show: () => void; hide: () => void }>()((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}));
