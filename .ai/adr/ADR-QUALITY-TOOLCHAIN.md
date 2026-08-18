# ADR — M01.3 Toolchain de lint, test y build

Date: 2026-08-17

Status: **IMPLEMENTED — LOCAL STATIC GREEN / REAL OSS TOOLCHAIN CI PENDING**

## Context
M01.1 creó el monorepo y M01.2 convirtió sus límites en reglas TypeScript/arquitectura. M01.3 debe fijar un único pipeline reproducible de calidad antes de construir el Studio real.

## Decision
1. ESLint usa flat config y `@eslint/js`; valida JS/MJS/tooling, no formato.
2. Prettier es el único owner de formato para TS/JS/JSON/Markdown/YAML. No se duplican `indent`, `semi`, `quotes`, `comma-dangle` o `max-len` en ESLint.
3. TypeScript sigue en `7.0.2`. `typescript-eslint` estable no se instala porque su rango soportado actual es `<6.1.0`; introducirlo sería un peer/tooling mismatch. TypeScript se valida con `tsc` strict y los architecture tests de M01.2.
4. Vitest `4.1.10` usa tres projects explícitos: `unit`, `contract`, `integration`.
5. Playwright Test `1.61.1` es el runner E2E/QA; en CI activa `forbidOnly`, un worker y retry acotado. M01.3 no agrega UI ni browser-driven features.
6. Vite `8.2.0` conserva el build real de `apps/studio` y explicita `baseline-widely-available`.
7. Scripts raíz obligatorios: `lint`, `typecheck`, `test`, `test:e2e`, `build`, `check`.
8. `tooling/fixtures/empty-repo` ejecuta ESLint, Prettier, tsc, Vitest, Vite y Playwright con el mismo root toolchain para demostrar que la configuración funciona en un repo mínimo.
9. Node mínimo se eleva a `>=22.13.0` para satisfacer el engine publicado de ESLint 10.

## No duplicación
ElectroCraft no implementa linter, formatter, compiler, unit runner, bundler ni E2E runner alternativo. Los scripts propios solo verifican ownership/configuración y producen evidencia reproducible.

## Closure
No cambiar a `ACCEPTED — GREEN` hasta que GitHub Actions ejecute `npm run check` y `npm run test:empty-repo` con los packages publicados y emita `PASS_M01_3_QUALITY_TOOLCHAIN` sobre M01.2 GREEN real.
