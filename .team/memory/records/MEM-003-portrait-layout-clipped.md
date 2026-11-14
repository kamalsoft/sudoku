# MEM-003: Portrait layout clipped the title at the top

- **Kind:** fix
- **Status:** verified
- **Date:** 2026-11-13
- **Links:** `src/app/index.tsx`, `src/components/NumberPad.tsx`

## Symptom
On a portrait viewport the title was cut off at the top. The portrait stack (header, grid, number pad) is taller than the viewport, and the column used `justifyContent: 'center'`, which pushes overflow above the top edge. Web sets `body { overflow: hidden }`, so nothing scrolls.

## Root cause
The column was a non-scrolling `View` with centered content taller than the screen.

## Location
`src/app/index.tsx`: portrait branch now a `ScrollView` with `contentContainerStyle={styles.column}`. `src/components/NumberPad.tsx`: key height is `keySize * 0.5`.

## Fix / Decision
Portrait content scrolls, with flex-start alignment. Number keys are shorter.

## Verification
Headless Chrome at 500×844: title, 9×9 grid and number pad all visible (screenshot in session scratchpad). `npx tsc --noEmit`, `npx expo lint` and `npm test` (14/14) pass.

## Not checked
The 390px capture still looks cropped. Headless Chrome may enforce a minimum window width of about 500px (suspected, not confirmed). Taps, mode toggles and highlighting were not driven in a browser; only the unit tests cover them.
