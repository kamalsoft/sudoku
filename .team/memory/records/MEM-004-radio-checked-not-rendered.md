# MEM-004: Difficulty chips did not expose their selected state

- **Kind:** fix
- **Status:** verified
- **Date:** 2026-11-13
- **Links:** `src/components/GameHeader.tsx`, `src/components/NumberPad.tsx`

## Symptom
On web, the difficulty chips (`role="radio"`) rendered without `aria-checked`, so assistive tech could not tell which difficulty was active. The `accessibilityState={{ checked }}` prop did not reach the DOM.

## Root cause
React Native Web 0.21 did not map `accessibilityState.checked` to `aria-checked` for this role (observed in the rendered DOM; the library internals were not inspected).

## Location
`GameHeader.tsx` difficulty chips and `NumberPad.tsx` Pencil/Erase toggles. Both now set `aria-checked` / `aria-pressed` directly.

## Fix / Decision
Set the ARIA attributes directly.

## Verification
Chrome DevTools test: the rendered chip reports `aria-checked="true"` for the active difficulty. `npx tsc --noEmit` and `npx expo lint` pass.

## Not checked
Other `accessibilityState` uses (for example, the selected cell) were not inspected in the DOM. Screen reader behavior was not tested.
