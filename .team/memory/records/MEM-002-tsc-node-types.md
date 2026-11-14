# MEM-002: `tsc` could not find `node:test` types

- **Kind:** fix
- **Status:** verified
- **Date:** 2026-11-13
- **Links:** `src/sudoku/engine.test.ts`

## Symptom
`npx tsc --noEmit` failed: `TS2591: Cannot find name 'node:test'` and `'node:assert/strict'`, even after `npx expo install --dev @types/node`.

## Root cause
`@types/node` was installed, but it was not loaded into the compilation. Not confirmed why the default types lookup missed it.

## Location
`tsconfig.json`

## Fix / Decision
Added `"types": ["node"]` to `compilerOptions`.

## Verification
`npx tsc --noEmit` exit 0; `npx expo lint` exit 0; `npm test` 9/9 pass.

## Not checked
Whether the same failure appears in a clean clone without the scaffold's `.git` state.
