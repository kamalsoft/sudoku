import { useEffect } from 'react';
import { Platform } from 'react-native';
import { keyCommand } from '../sudoku/keys';
import { useGameStore } from '../sudoku/store';

// Web only: digits, Backspace, N, arrows, and undo/redo shortcuts.
export function useKeyboardControls() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const onKeyDown = (event: KeyboardEvent) => {
      const command = keyCommand(event.key, { ctrl: event.ctrlKey || event.metaKey, shift: event.shiftKey });
      if (!command) return;
      event.preventDefault();

      const game = useGameStore.getState();
      switch (command.type) {
        case 'digit':
          game.inputDigit(command.digit);
          break;
        case 'erase':
          game.clearSelected();
          break;
        case 'pencil':
          game.setMode(game.mode === 'pencil' ? 'enter' : 'pencil');
          break;
        case 'move':
          game.moveSelection(command.dRow, command.dCol);
          break;
        case 'undo':
          game.undo();
          break;
        case 'redo':
          game.redo();
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
