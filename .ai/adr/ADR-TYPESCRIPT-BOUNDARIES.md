# ADR — M01.2 TypeScript estricto y boundaries de importación

Date: 2026-08-17

Status: **IMPLEMENTED — LOCAL GREEN / REAL TOOLCHAIN CI PENDING**

## Context
M01.1 materializó 17 packages propietarios y dos composition roots. M01.2 debe convertir esos límites físicos en límites de compilación verificables antes de añadir features.

## Decision
1. `tsconfig.base.json` es la base TypeScript del monorepo con `strict: true`, `moduleResolution: Bundler`, `noEmit`, casing consistente y catch variables `unknown`.
2. `tsconfig.json` incluye únicamente source de `apps/*/src` y `packages/*/src`; los fixtures negativos quedan fuera de compilación por diseño.
3. Hay 19 aliases exactos —17 packages + 2 apps— y cada alias apunta solo al `src/index.ts` público. No se permiten wildcard aliases.
4. Cada workspace publica únicamente `exports["."] = "./src/index.ts"`; deep imports se rechazan en architecture tests.
5. Imports relativos que resuelvan fuera del directorio owner se rechazan; no existe acceso lateral por `../../otro-package`.
6. `domain` permanece dependency-free; su tsconfig usa `lib: ["ES2024"]` y `types: []` para excluir DOM/ambient Node, y la policy prohíbe imports React, Puck, Drizzle, Expo/React Native, filesystem o path.
7. `application` solo puede depender de `domain` en esta etapa; adapters/runtimes dependen hacia contracts, nunca al revés.
8. `runtime-native` mantiene el veto de Studio/DOM/editor y `exporters` mantiene el veto de UI/runtimes concretos.
9. Los errores de boundary son fail-closed y forman parte de `npm run check`.

## Public API usada
- TypeScript compiler: `tsc -p <config> --noEmit`.
- TypeScript `compilerOptions.strict`, `baseUrl`, `paths`, `moduleResolution=Bundler`.
- npm workspace package `exports` para superficie pública.

## Gap ElectroCraft
TypeScript resuelve y comprueba tipos, pero no conoce por sí mismo la dirección arquitectónica de ElectroCraft. `tooling/src/boundaries.mjs` añade únicamente esa política de ownership: owners permitidos, deep-import ban y cross-owner-relative ban. No reemplaza el compilador.

## Evidence
- `tsconfig.base.json`
- `tsconfig.json`
- `tooling/package-boundaries.json`
- `tooling/src/boundaries.mjs`
- `tooling/scripts/verify-typescript-boundaries.mjs`
- `tooling/test/typescript-boundaries.test.mjs`
- `tooling/fixtures/boundaries/*`
- `.ai/evidence/F01/M01.2/*`

## Closure
No cambiar a `ACCEPTED — GREEN` hasta que el workflow M01.2 ejecute el toolchain publicado y registre el marker `PASS_M01_2_TYPESCRIPT_BOUNDARIES` sobre un M01.1 GREEN real.
