# TRACKING — ElectroCraft current status

Date: 2026-08-18.

El tracking histórico previo a M00.9 se conserva íntegro en `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`.

## Estado formal
- Branch: `main`.
- Head consultado para iniciar M01.4: `b312dd77edf9245187d112d34649d0ae9d466a8b`.
- Baseline funcional de cierre M01.1–M01.3: `3fe3815824d7847e88c7f91006d7a6236f00e527`.
- F00: `COMPLETADA`.
- M00.9, M00.10 y M00.11: `COMPLETADAS` con evidencia real de GitHub Actions.
- F01 activa.
- M01.1, M01.2 y M01.3: `COMPLETADAS` con evidencia real de GitHub Actions.
- M01.4: `IMPLEMENTED_PENDING_CI`.
- Próxima microfase bloqueada hasta cierre: M01.5 — Crear CI base.

## Evidencia cerrada heredada
- M00.9/M00.10: run `32100542215`.
- M00.11: run `32100737146`.
- M01.1/M01.2/M01.3: run `32100786113`.
- Artifacts M01: `9311468160`, `9311475315`, `9311487017`.
- Commit statuses heredados `electrocraft/M00.9` … `electrocraft/M01.3`: `success` sobre la baseline funcional indicada.

## M01.4 — Studio Vite/PWA bootstrap — CANDIDATO
### Archivos modificados/añadidos
- `package.json`.
- `tsconfig.base.json`.
- `playwright.config.ts`.
- `apps/studio/package.json`.
- `apps/studio/vite.config.ts`.
- `apps/studio/index.html`.
- `apps/studio/public/electrocraft-dev.svg`.
- `apps/studio/src/index.ts`.
- `apps/studio/src/bootstrap-health.ts`.
- `apps/studio/src/App.tsx`.
- `apps/studio/src/main.tsx`.
- `apps/studio/src/styles.css`.
- `tooling/scripts/verify-studio-bootstrap.mjs`.
- `tooling/vitest/unit/studio-bootstrap-health.test.ts`.
- `tooling/vitest/contract/studio-import-boundary.test.ts`.
- `tooling/vitest/contract/studio-bootstrap-dependencies.test.ts`.
- `tooling/vitest/integration/studio-pwa-artifact.test.ts`.
- `tooling/playwright/workspace.spec.ts`.
- `tooling/fixtures/help.architecture.repository.json`.
- `.ai/HELP_ARCHITECTURE_REPOSITORY.md`.
- `.github/workflows/m01-4-studio-bootstrap.yml`.

### Engine/API utilizado
- React `19.2.8` + React DOM `19.2.8`.
- Vite existente `8.2.0`.
- `@vitejs/plugin-react` `6.0.5`.
- `vite-plugin-pwa` `1.3.0` con manifest/service worker técnico; `globPatterns: []` y `runtimeCaching: []` para no anticipar una política de cache avanzada.
- TypeScript `7.0.2`, Vitest `4.1.10`, Playwright `1.61.1` heredados del toolchain verde M01.3.

### Pruebas exactas del candidato
- Unit: health `ready` con todos los owners y `blocked` fail-closed si falta un owner.
- Contract: pins exactos React/Vite-PWA y boundary de imports públicos del Studio.
- Integration: presencia y contrato de `index.html`, `manifest.webmanifest`, `sw.js` y report generado.
- QA/Playwright: artifact PWA + native fixture heredado.
- Pipeline objetivo: `npm run check`.
- Cierre CI objetivo: marker `PASS_M01_4_STUDIO_BOOTSTRAP` y status `electrocraft/M01.4 = success`.

### Build/fixture result
- El contenedor de esta sesión no resuelve DNS hacia GitHub/npm, por lo que no se acepta una falsa evidencia de `npm install`/Vite real local.
- Se hicieron validaciones estáticas locales de sintaxis/estructura y se dejó workflow de evidencia real para ejecutar tras publicar el candidato.
- M01.4 permanece `IMPLEMENTED_PENDING_CI`; no se declara `COMPLETADA` sin el run real.

### Próxima microfase exacta
M01.5 — **Crear CI base**, únicamente después de `electrocraft/M01.4 = success`.
