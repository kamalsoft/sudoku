import { create } from 'zustand';
import { getGlobalSetting, setGlobalSetting } from './db/persistence';

// The first-run tour and How to play. It is shown once per device and can be opened again from the menu.
export const TOUR_STEPS = [
  {
    title: 'Welcome to Sudoku',
    body: 'Fill every row, column and 3×3 block with the digits 1 to 9. Each digit appears once in each of them.',
    demo: true,
  },
  { title: 'Pick a square', body: 'Tap an empty square. It turns blue, and the row, column and block around it are lit up.' },
  { title: 'Enter a number', body: 'Tap a number below the board. A wrong number flashes red and shakes, so you can try again.' },
  {
    title: 'Notes',
    body: 'Turn on Notes in Settings. Then use Pencil to write small candidate numbers in a square.',
  },
  {
    title: 'Erase and hints',
    body: 'Erase removes the number you entered. Hint fills the selected square with the right number. Hints are limited in each game.',
  },
  {
    title: 'The menu',
    body: 'Tap the ☰ button for levels, time limits, a new or daily puzzle, your stats, Settings, this tour, and Install.',
  },
  {
    title: 'For grown-ups',
    body: 'Parent lock (Settings, then Kids) asks a simple sum before Settings opens. Kid-safe mode keeps games gentle.',
  },
  {
    title: 'Keep it at hand',
    body: 'On a phone or in a browser you can install Sudoku to your home screen from the menu. Enjoy the puzzles!',
  },
];

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
