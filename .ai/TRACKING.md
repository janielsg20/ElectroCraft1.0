# TRACKING — ElectroCraft current status

Date: 2026-08-18.

El tracking histórico previo a M00.9 se conserva íntegro en `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`.

## Estado formal
- Branch: `main`.
- Baseline funcional de cierre M01.1–M01.3: `3fe3815824d7847e88c7f91006d7a6236f00e527`.
- F00: `COMPLETADA`.
- M00.9, M00.10 y M00.11: `COMPLETADAS` con evidencia real de GitHub Actions.
- F01 activa.
- M01.1, M01.2 y M01.3: `COMPLETADAS` con evidencia real de GitHub Actions.
- M01.4: implementación y gate dedicado `success`; cierre formal pendiente únicamente de terminar la revalidación heredada sobre el head de compatibilidad.
- Próxima microfase bloqueada hasta cierre documental: M01.5 — Crear CI base.

## M00.9 — Data Sources — COMPLETADA
- Engine/API: `@scalar/openapi-parser@0.28.11` real + REST/GraphQL/Gateway fixtures.
- Run de evidencia exact-head: `32100542215`.
- Head: `3fe3815824d7847e88c7f91006d7a6236f00e527`.
- Job: `M00.9 real parser precondition` — `success`.
- Resultado: 14/14 tests offline, parser real, secret scan, metrics y build verdes.
- Marker observado en log: `PASS_REAL_OPENAPI_PARSER scalar discovered 2 operations`.
- Commit status: `electrocraft/M00.9 = success`.

## M00.10 — Export Target Parity — COMPLETADA
- Run: `32100542215`.
- Head: `3fe3815824d7847e88c7f91006d7a6236f00e527`.
- Jobs verdes: M00.9 precondition, static parity, Capacitor 8 real sync, Slim 4/PDO/CSRF/MySQL runtime, WordPress 7.0.2 wp-env runtime y closure gate.
- Markers requeridos cubiertos: `PASS_STATIC_PARITY`, `PASS_REAL_CAPACITOR_SYNC`, `PASS_REAL_LAMP`, `PASS_REAL_WORDPRESS`, `PASS_M00_10_CLOSURE_GATE`.
- Artifacts:
  - `9311394160` — `m00-10-static-artifacts`;
  - `9311399715` — `m00-10-capacitor-source`;
  - `9311407473` — `m00-10-lamp-source`;
  - `9311441488` — `m00-10-wordpress-source`.
- Commit status: `electrocraft/M00.10 = success`.

## M00.11 — Architecture Closure — COMPLETADA
- Run: `32100737146`.
- Head exacto heredado de M00.10: `3fe3815824d7847e88c7f91006d7a6236f00e527`.
- `F00 architecture closure`: `success`.
- Real engine matrix y marker `PASS_M00_11_ARCHITECTURE_CLOSURE`: verdes.
- Artifact `9311457041` — `m00-11-architecture-closure-evidence`.
- Commit status: `electrocraft/M00.11 = success`.

## M01.1 — Monorepo Ownership — COMPLETADA
- Run: `32100786113`.
- Head: `3fe3815824d7847e88c7f91006d7a6236f00e527`.
- Gates reales: install, exact toolchain, lint, TypeScript, Node contract/negative tests, build, Vitest, Vite y Playwright: `success`.
- Marker: `PASS_M01_1_MONOREPO`.
- Artifact `9311468160` — `m01-1-monorepo-evidence`.
- Commit status: `electrocraft/M01.1 = success`.

## M01.2 — TypeScript Boundaries — COMPLETADA
- Run reutilizable dentro de `32100786113`.
- Gates: lint, TypeScript strict, aliases/boundaries, contract/negative tests, deterministic reports: `success`.
- TypeScript 7 contract: `baseUrl` ausente; aliases workspace relativos `./...`; regresión impide reintroducir `baseUrl`.
- Marker: `PASS_M01_2_TYPESCRIPT_BOUNDARIES`.
- Artifact `9311475315` — `m01-2-typescript-boundaries-evidence`.
- Commit status: `electrocraft/M01.2 = success`.

## M01.3 — Quality Toolchain — COMPLETADA
- Run reutilizable dentro de `32100786113`.
- Root pipeline `lint → typecheck → boundaries → tests → build → Playwright`: `success`.
- Empty functional repository fixture: `success`.
- Marker: `PASS_M01_3_QUALITY_TOOLCHAIN`.
- Artifact `9311487017` — `m01-3-quality-toolchain-evidence`.
- Commit status: `electrocraft/M01.3 = success`.

## M01.4 — Studio Vite/PWA bootstrap — CIERRE EN VALIDACIÓN FINAL
### Implementación
- Commit inicial: `e3f8ef23de22918f27d68a69e188fa9daf09553e`.
- React/Vite TypeScript composition root real en `apps/studio`.
- PWA técnica con manifest/service worker; sin runtime caching avanzado.
- Route temporal `/` con Project Home de desarrollo y health `ready/blocked` fail-closed.
- Help ID canónico `help.architecture.repository` preservado.
- No demo data ni modelo de navegación paralelo.
- Declaración `vite/client` añadida en `apps/studio/src/vite-env.d.ts` para que TypeScript conozca imports de assets/CSS sin relajar el typecheck.

### Engine/API utilizado
- React `19.2.8` + React DOM `19.2.8`.
- Vite `8.2.0`.
- `@vitejs/plugin-react` `6.0.5`.
- `vite-plugin-pwa` `1.3.0`.
- TypeScript `7.0.2`, Vitest `4.1.10`, Playwright `1.61.1`.

### Evidencia dedicada M01.4
- Run verde: `32146389103`.
- Head: `e0a73dd0163e62c02aeebb79c2414f38e261d7cc`.
- Job `M01.4 React/Vite/PWA bootstrap`: `success`.
- Marker: `PASS_M01_4_STUDIO_BOOTSTRAP`.
- Commit status: `electrocraft/M01.4 = success`.
- Artifact `9327946718` — `m01-4-studio-bootstrap-evidence`.
- Digest: `sha256:294db22929694beea2197dedf20f2acb9d9d8f241dd655a972d2d67bcdfa332a`.
- Gates verdes: exact pins, Prettier/lint, typecheck, boundaries, Node tests, Vitest unit/contract/integration, Vite production build, PWA artifact verification, Playwright QA y closure marker.

### Correcciones observadas por CI
1. Run `32145287163`: Prettier detectó drift en dos archivos; se aplicó exactamente el formato emitido por Prettier 3.9.6, sin cambios lógicos.
2. Run `32146232918`: TypeScript detectó `TS2882` para `./styles.css`; se añadió `vite/client` y el gate permaneció estricto.
3. Revalidación heredada M01.1 detectó una aserción obsoleta al antiguo `apps/studio/dist/studio-architecture.js`. Commit `ed4e9f12486b3ddf4f3351517867a6ee9cd73a15` actualiza únicamente ese closure gate para validar `index.html`, `manifest.webmanifest`, `sw.js` y `tooling/dist/m01-4-studio-bootstrap-report.json`.

## Correcciones de CI incorporadas durante el cierre
1. Los workflows publican commit statuses `pending`/`success`/`failure` con `target_url`; el conector ya no depende de una lista de checks vacía.
2. M00.9/M00.10 tienen cobertura de paths suficiente para revalidar cambios de F01/estado/workflows relevantes.
3. M01.2 y M01.3 usan `workflow_call` desde M01.1 para no exceder la profundidad permitida de `workflow_run`.
4. Workflows F01 usan Bash/`pipefail`; `| tee` no puede convertir fallos reales en falsos verdes.
5. LAMP Composer valida el manifiesto real sin confundir los pins exactos del POC con errores.
6. TypeScript 7 eliminó `baseUrl`; el validador propio quedó alineado.
7. Vite usa `apps/studio` como root y Playwright valida el artifact del owner correcto.
8. Desde M01.4, M01.1 valida el artifact PWA vigente en vez del artifact temporal de librería usado antes de que existiera la app real.

## Regla de continuación
No iniciar M01.5 hasta que la revalidación heredada provocada por `ed4e9f12486b3ddf4f3351517867a6ee9cd73a15` termine verde y el cierre documental de M01.4 se publique sobre `main`.
