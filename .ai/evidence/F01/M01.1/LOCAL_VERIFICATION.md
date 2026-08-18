# M01.1 — Verificación local

Date: 2026-08-17 America/New_York

Status: **LOCAL STATIC GREEN — REAL ROOT TOOLCHAIN CI PENDING — F00 ENTRY GATE PENDING**

## Implementación verificada
- npm workspaces: `apps/*` + `packages/*`.
- 17 owner packages estables.
- 2 composition roots: `apps/studio` y `apps/native-preview`.
- matriz ejecutable `tooling/package-boundaries.json`.
- source/config/build fixture Native: `src/native-adapter.ts`, `app.json`, `eas.json`, fixture JSON.
- HelpDescriptor español `help.architecture.repository` sin crear un HelpRegistry paralelo.
- workflow condicionado al success de M00.11.

## Pipeline local exacto
`npm run check`:
- `npm run lint` -> `PASS_LINT_WORKSPACE packages=17 apps=2 scripts=5`.
- `npm run typecheck` -> PASS con TypeScript global disponible en el contenedor.
- `npm test` -> PASS, 7/7.
- `npm run build` -> `PASS_BUILD_WORKSPACE packages=17 apps=2`.
- dependency graph SHA-256 -> `bf72f2a3dbf72a7a59deb26eaea4b0414459973a6a37184785ebeb029d47601d`.

## Negative/error coverage
- dependencia `domain -> editor-puck` -> rechazada.
- dependencia Native a editor/DOM packages -> rechazada.
- exporters hacia Studio/runtime-specific packages -> rechazada.
- package sin public root export -> validator fail-closed.

## Regresión acumulativa
- M00.9 offline -> PASS, 14/14 + secret scan + metrics + build.
- M00.10 static -> PASS, 6/6 + PHP syntax + parity + build.
- M00.11 offline -> PASS, 6/6 + matrix/report/build.

## Limitación local real
El contenedor no resolvió `registry.npmjs.org`; la instalación de los pins root no se declaró PASS. Por ello Vite/Vitest/Playwright reales permanecen como gate obligatorio de GitHub Actions.

Archivo: `local-real-toolchain-blocked.log`.
