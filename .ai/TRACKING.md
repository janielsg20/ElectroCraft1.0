# TRACKING — ElectroCraft current status

Date: 2026-08-18.

El tracking histórico previo a M00.9 se conserva íntegro en `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`.

## Estado formal
- Branch: `main`.
- Baseline funcional de cierre M01.1–M01.3: `3fe3815824d7847e88c7f91006d7a6236f00e527`.
- F00: `COMPLETADA`.
- M00.9, M00.10 y M00.11: `COMPLETADAS` con evidencia real de GitHub Actions.
- F01 activa.
- M01.1, M01.2, M01.3, M01.4 y M01.5: `COMPLETADAS` con evidencia real de GitHub Actions.
- Gate actual: `GREEN_THROUGH_M01.5`.
- Próxima microfase exacta: M01.6 — Documentar conventions.

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

## M01.4 — Studio Vite/PWA bootstrap — COMPLETADA
### Implementación
- Commit inicial: `e3f8ef23de22918f27d68a69e188fa9daf09553e`.
- React/Vite TypeScript composition root real en `apps/studio`.
- PWA técnica con manifest/service worker; sin runtime caching avanzado.
- Route temporal `/` con Project Home de desarrollo y health `ready/blocked` fail-closed.
- Help ID canónico `help.architecture.repository` preservado.
- No demo data ni modelo de navegación paralelo.
- Declaración `vite/client` en `apps/studio/src/vite-env.d.ts` para que TypeScript reconozca imports de assets/CSS sin relajar el typecheck.

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
1. Run `32145287163`: Prettier detectó drift en `apps/studio/src/styles.css` y `tooling/vitest/contract/studio-import-boundary.test.ts`; se aplicó exactamente el formato esperado, sin cambios lógicos.
2. Run `32146232918`: TypeScript detectó `TS2882` para `./styles.css`; se añadió `vite/client` manteniendo el gate estricto.
3. La revalidación heredada M01.1 detectó una aserción obsoleta al antiguo `apps/studio/dist/studio-architecture.js`. Commit `ed4e9f12486b3ddf4f3351517867a6ee9cd73a15` cambió solo ese closure gate para validar `index.html`, `manifest.webmanifest`, `sw.js` y `tooling/dist/m01-4-studio-bootstrap-report.json`.

### Revalidación heredada sobre el head de compatibilidad
Head: `ed4e9f12486b3ddf4f3351517867a6ee9cd73a15`.

- M00.9 — `success`; run `32146926071`.
- M00.10 — `success`; run `32146926071`, incluidos static parity, Capacitor, LAMP/MySQL/PDO/CSRF, WordPress wp-env y closure gate.
- M00.11 — `success`; run `32147304063`.
- M01.1 — `success`; run `32147392932`; marker actualizado para el artifact PWA vigente.
- M01.2 — `success`; run `32147392932`.
- M01.3 — `success`; run `32147392932`.

La evidencia formal se conserva en `.ai/evidence/F01/M01.4/CLOSURE_2026-08-18.md`.

## M01.5 — CI base reproducible — COMPLETADA
### Implementación
- Squash merge a `main`: `9fb64b7890ae92660d8d494d706245e800782e86`.
- PR validation head: `0a4a5f46758cbed23ead055dfab3a636884ead63`.
- PR head y commit fusionado comparten tree SHA `23bc994e19902830148650601656492a17dc7824`.
- `package-lock.json` raíz con `lockfileVersion: 3`.
- `package.json` raíz identifica `0.0.0-m01.5` y `packageManager: npm@10.9.2`.
- `.npmrc` fija `legacy-peer-deps=true`.
- `.github/workflows/ci.yml` ejecuta push a `main` + pull request, con permisos `contents: read`.
- Instalación bloqueada con `npm ci --ignore-scripts --no-audit --no-fund`.
- Cache segura mediante `actions/setup-node` + `cache: npm` + `cache-dependency-path: package-lock.json`; no se cachea `node_modules` como artifact propio.
- El workflow no contiene deploy, publish, Cloudflare/Vercel, secrets de nube ni permisos write de deployment.

### Engine/API utilizado
- GitHub Actions.
- `actions/checkout@v6` con `persist-credentials: false`.
- `actions/setup-node@v7`.
- Node `22.16.0`.
- npm `10.9.2`.
- npm lockfile v3 + `npm ci`.
- ESLint, Prettier, TypeScript, Vitest, Vite y Playwright existentes continúan siendo los owners de sus gates.

### Tooling y pruebas añadidas
- `tooling/src/ci-base.mjs`: evaluator fail-closed del contrato CI.
- `tooling/scripts/verify-ci-base.mjs`: genera `tooling/dist/m01-5-ci-base-report.json`.
- `tooling/test/ci-base.test.mjs`: caso ready, negativo unlocked+secret y negativo stale-lock.
- `tooling/vitest/contract/ci-base-workflow.test.ts`: valida el workflow real, comandos obligatorios, cache/lock, ausencia de deep-source/deploy/secret.
- `tooling/vitest/integration/ci-base-report.test.ts`: valida el reporte real generado por build.
- Help descriptor `help.architecture.repository` actualizado en español.

### Adaptación registrada
- Primer intento de generar lockfile: run `32157236793`, fallo interno npm/Arborist `Cannot read properties of null (reading 'edgesOut')`.
- No se desactivó lint, typecheck, tests, boundaries ni ningún gate para sortearlo.
- El lockfile se generó con `legacy-peer-deps`; la misma política quedó persistida en `.npmrc` para que `npm ci` reproduzca la resolución.

### Evidencia dedicada M01.5
- Base CI PR run: `32158198590`.
- Validated head: `0a4a5f46758cbed23ead055dfab3a636884ead63`.
- Validated tree: `23bc994e19902830148650601656492a17dc7824`, idéntico al árbol del squash merge en `main`.
- Job `Locked lint typecheck test build`: `success`.
- Gates verdes: locked toolchain, `npm ci`, lint, typecheck, tests, build, Playwright, empty-repo fixture, CI report verification y closure marker.
- Marker: `PASS_M01_5_BASE_CI`.
- Artifact `9332533012` — `m01-5-base-ci-evidence`.
- Digest: `sha256:439631825171a8316e5b850051ea63f3eb693f3235a8cd71e803a6a04afe5758`.

### Revalidación heredada sobre `main`
Head: `9fb64b7890ae92660d8d494d706245e800782e86`.

- M01.4 — `success`; run `32158500101`.
- M00.9 — `success`; run `32158500161`.
- M00.10 — `success`; run `32158500161`, incluidos static parity, Capacitor, LAMP/MySQL/PDO/CSRF, WordPress wp-env y closure gate.
- M00.11 — `success`; run `32158786503`.
- M01.1 — `success`; run `32158875745`.
- M01.2 — `success`; run `32158875745`.
- M01.3 — `success`; run `32158875745`.

La evidencia formal se conserva en `.ai/evidence/F01/M01.5/CLOSURE_2026-08-18.md`.

## Correcciones de CI incorporadas durante el cierre
1. Los workflows publican commit statuses `pending`/`success`/`failure` con `target_url`; el conector ya no depende de una lista de checks vacía.
2. M00.9/M00.10 tienen cobertura de paths suficiente para revalidar cambios de F01/estado/workflows relevantes.
3. M01.2 y M01.3 usan `workflow_call` desde M01.1 para no exceder la profundidad permitida de `workflow_run`.
4. Workflows F01 usan Bash/`pipefail`; `| tee` no puede convertir fallos reales en falsos verdes.
5. LAMP Composer valida el manifiesto real sin confundir los pins exactos del POC con errores.
6. TypeScript 7 eliminó `baseUrl`; el validador propio quedó alineado.
7. Vite usa `apps/studio` como root y Playwright valida el artifact del owner correcto.
8. Desde M01.4, M01.1 valida el artifact PWA vigente en vez del artifact temporal de librería usado antes de que existiera la app real.
9. Desde M01.5, el CI base usa lockfile + `npm ci` y cache npm por lockfile; no muta dependencias durante el gate ni posee permisos de deploy.

## Regla de continuación
M01.5 está formalmente `COMPLETADA`. La siguiente y única microfase activa debe ser M01.6 — **Documentar conventions** siguiendo `.ai/microphases/M01_6.md`.
