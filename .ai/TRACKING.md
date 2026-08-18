# TRACKING — ElectroCraft current status

Date: 2026-08-18.

El tracking histórico previo a M00.9 se conserva íntegro en `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`.

## Estado formal
- Branch: `main`.
- Baseline funcional de cierre: `3fe3815824d7847e88c7f91006d7a6236f00e527`.
- F00: `COMPLETADA`.
- M00.9, M00.10 y M00.11: `COMPLETADAS` con evidencia real de GitHub Actions.
- F01 activa.
- M01.1, M01.2 y M01.3: `COMPLETADAS` con evidencia real de GitHub Actions.
- Próxima microfase: M01.4 — Crear Studio Vite/PWA bootstrap.

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

## Correcciones de CI incorporadas durante el cierre
1. Los workflows publican commit statuses `pending`/`success`/`failure` con `target_url`; el conector ya no depende de una lista de checks vacía.
2. M00.9/M00.10 tienen cobertura de paths suficiente para revalidar cambios de F01/estado/workflows relevantes.
3. M01.2 y M01.3 usan `workflow_call` desde M01.1 para no exceder la profundidad permitida de `workflow_run`.
4. Workflows F01 usan Bash/`pipefail`; `| tee` no puede convertir fallos reales en falsos verdes.
5. LAMP Composer valida el manifiesto real sin confundir los pins exactos del POC con errores.
6. TypeScript 7 eliminó `baseUrl`; el validador propio quedó alineado.
7. Vite usa `apps/studio` como root y Playwright valida `apps/studio/dist/studio-architecture.js`.

## Regla de continuación
M01.4 puede iniciarse porque M01.3 está formalmente COMPLETADA y no quedan P0/P1 en la dependencia inmediata. No avanzar de M01.4 sin ejecutar y registrar sus gates obligatorios.
