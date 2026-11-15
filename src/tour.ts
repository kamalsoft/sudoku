import { create } from 'zustand';
import { getGlobalSetting, setGlobalSetting } from './db/persistence';

// The first-run tour and How to play. The wording for each step is in i18n (tour_<n>_title and tour_<n>_body).
// It is shown once per device and can be opened again from the menu.
export const TOUR_LENGTH = 11;
export const TOUR_DEMO_STEP = 0;

interface TourState {
  open: boolean;
  step: number;
  show: (step?: number) => void;
  go: (step: number) => void;
  close: () => void;
}

export const useTour = create<TourState>()((set) => ({
  open: false,
  step: 0,
  show: (step = 0) => set({ open: true, step }),
  go: (step) => set({ step }),
  close: () => {
    set({ open: false, step: 0 });
    void setGlobalSetting('tourDone', '1');
  },
}));

// Opens the tour the first time the app runs on this device.
export async function maybeShowFirstRunTour() {
  const done = await getGlobalSetting('tourDone');
  if (done === null) useTour.getState().show(0);
}
