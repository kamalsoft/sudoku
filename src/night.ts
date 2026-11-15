import { create } from 'zustand';

// Night is 8 pm to 7 am on the device clock.
export const isNightHour = (hour: number) => hour >= 20 || hour < 7;

interface NightState {
  isNight: boolean;
  check: () => void;
}

// Shared clock, so every screen switches to the night skin at the same time.
export const useNight = create<NightState>()((set) => ({
  isNight: isNightHour(new Date().getHours()),
  check: () => set({ isNight: isNightHour(new Date().getHours()) }),
}));
