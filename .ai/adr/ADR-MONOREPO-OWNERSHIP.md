# ADR — M01.1 Monorepo y packages propietarios

Date: 2026-08-17

Status: **IMPLEMENTED — LOCAL GREEN / F00 ENTRY GATE + REAL TOOLCHAIN CI PENDING**

## Context
F01 necesita límites físicos antes de construir producto. M00.11 congeló ownership OSS/canónico; M01.1 materializa esos límites en `apps/*`, `packages/*`, tooling y CI sin añadir subsystems de producto.

## Decision
1. Root usa npm workspaces `apps/*` + `packages/*`.
2. Existen exactamente 17 packages de responsabilidad estable: `domain`, `application`, `design-system`, `editor-puck`, `data-core`, `query-rqb`, `media-tiptap`, `state-zustand`, `auth-core`, `workflow-rete`, `forms`, `admin-refine`, `runtime-web`, `runtime-native`, `export-ir`, `exporters`, `testing`.
3. Existen dos composition roots: `apps/studio` y `apps/native-preview`.
4. `domain` no tiene dependencia interna y su source no puede importar React, Puck, Drizzle, Expo/React Native, DOM ni Node filesystem/path.
5. `application` depende únicamente de `domain` en M01.1.
6. Engine adapters dependen de contratos/ports y no crean wrappers vacíos para TanStack Query/Table, RHF o Zod.
7. `runtime-native` no puede depender de `design-system`, `editor-puck`, `admin-refine` ni `runtime-web`.
8. `exporters` depende de `export-ir`/contratos y no de Studio UI ni runtimes específicos.
9. Cada package expone una única raíz pública inicial mediante `exports["."]`; exports más finos deben justificarse en su fase propietaria.
10. La configuración de boundaries es ejecutable y fail-closed; una dependencia prohibida falla tests.
11. `apps/native-preview` contiene source de adapter y fixture reproducible `source + app.json + eas.json + build config` sin inventar un runtime Native alternativo a Expo.
12. M01.1 fija toolchain CI directo: TypeScript 7.0.2, Vite 8.2.0, Vitest 4.1.10 y Playwright Test 1.61.1. M01.2 seguirá siendo owner de `strict TypeScript`, aliases finales y architecture tests ampliados.

## Consequences
- Las features futuras deben entrar en el package owner existente o justificar un ADR; no se crea un package por cada dependencia OSS.
- Apps son composition roots y no pueden convertirse en source-of-truth del dominio.
- La matriz `tooling/package-boundaries.json` es una regla ejecutable, no documentación decorativa.
- El CI de M01.1 solo se ejecuta después del workflow M00.11 exitoso, por lo que F01 no se declara iniciado sobre F00 fallido.

## Closure rule
No cambiar este ADR a `ACCEPTED — GREEN`, no marcar M01.1 COMPLETADA y no activar M01.2 hasta que:
1. M00.11 haya concluido `success` sobre el mismo head;
2. el workflow `M01.1 Monorepo Ownership Gate` haya instalado el toolchain real;
3. Vite, Vitest y Playwright Test hayan pasado;
4. se haya emitido `PASS_M01_1_MONOREPO`.
