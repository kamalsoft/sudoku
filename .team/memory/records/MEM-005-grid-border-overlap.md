# MEM-005: Grid's last column and bottom row covered the outer border

- **Kind:** fix
- **Status:** verified
- **Date:** 2026-11-14
- **Links:** `src/components/SudokuGrid.tsx`

## Symptom
On the Android emulator the right and bottom outer borders of the grid were missing. Cell bounds from the UI hierarchy showed the last column ending at x 1038, past the grid's content box.

## Root cause
The grid's 2px border is included in its width and height, but cells were sized as `size / 9`, so nine cells filled the full `size` and overlapped the border on the right and bottom.

## Location
`src/components/SudokuGrid.tsx`: cells are now sized as `(size - GRID_BORDER * 2) / 9`.

## Fix / Decision
Size cells from the inner area.

## Verification
Android emulator (Medium_Phone_API_37.0): last column bounds now end at x 1033 with the 2px border visible in a cropped screenshot. `npx tsc --noEmit` and `npx expo lint` pass.

## Not checked
The bottom border and the web layout were not inspected after the change.
