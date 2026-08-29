# HANDOFF — ElectroCraft

## Current

F08 / M08.3 — REST API Connector y OpenAPI import — `ACTIVE`.

Rama activa: `codex/m08-1-data-sources`.

F07 está `GREEN` y fusionada. M08.1 y M08.2 están implementadas con evidencia. M08.3 ya contiene core REST/OpenAPI, wizard, Help específico, fixtures y tests preparados, pero no se declara DONE sin validación ejecutable.

## Gate de entrada F08

- Base CI F07: `33262949215` (#795), success completo.
- PR F07: `#68`.
- merge: `e697a42546d23f89412e6dd616018759e719e448`.

## M08.1 — implementada / pendiente Gate F08

- DataSourceDefinition canónico en `packages/domain/src/data/source-definition.ts`.
- 11 capability flags canónicos.
- secrets excluidos; `authRef` portable.
- DataSourceAdapter + único ConnectorRegistry.
- `packages/connectors` paquete estable #20.
- `/data-sources` responsive + `help.data.sources`.

## M08.2 — implementada / pendiente Gate F08

- `InternalDataSourceAdapter` `internal.pglite`.
- CRUD/query/stats sobre la tabla genérica F04 `content_records`.
- No hay segunda DB ni tablas por modelo.
- schema discovery desde `ElectroCraftDataSchema`.
- companion browser sobre el mismo `electrocraft-studio-storage`/worker/migrations.
- permission port fail-closed limitado al proyecto abierto.
- UX `ElectroCraft Data`, `Local`, `Disponible sin conexión`, `Modelos`, `Registros`, `Copia de seguridad`.
- `help.data.internal`.
- fixtures, unit test e integración PGlite real preparados.

## M08.3 — implementado hasta ahora

Owner: Web Fetch API + DataSourceAdapter + `@scalar/openapi-parser@0.28.11`.

Disponible en la rama:

1. `RestDataSourceAdapter` con Fetch, timeout, typed params/body, result/error/pagination y gateway fallback;
2. OpenAPI import adapter Scalar para JSON/YAML/Swagger;
3. exports públicos de ambos adapters desde `@electrocraft/connectors`;
4. registro `rest.fetch` en el ConnectorRegistry real del Studio;
5. wizard REST: URL base → Autenticación → OpenAPI/Manual → Operaciones → Probar → Guardar;
6. HelpRegistry específico `help.data.rest`;
7. SecretRef-only; no bearer/API key/password en source config;
8. fixtures REST/OpenAPI;
9. tests M08.3 para import, GET/POST, pagination, auth missing, Gateway, 4xx/5xx, timeout y security.

Evidencia: `.ai/evidence/F08/M08.3/IMPLEMENTATION_2026-08-29.md`.

## Pendiente exacto para cerrar M08.3

1. Ejecutar lint/typecheck/Vitest/build en un workspace ejecutable; no usar Actions solo para una microfase.
2. Corregir fallos reales si aparecen.
3. Solo entonces cambiar M08.3 a DONE y activar M08.4.

## Deuda de gate F08 visible

- `package-lock.json` debe regenerarse por `packages/connectors` y la dependencia Studio.
- root `format/format:check` debe incluir connectors/data-web.
- no abrir PR ni ejecutar Actions hasta Gate F08 salvo blocker excepcional.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/phases/F08.md → M08_1.md → M08_2.md → M08_3.md → evidence/F08 → packages/domain/src/data → packages/application/src/data + connector-registry → packages/connectors → packages/data-web → apps/studio/src/features/data → tooling/vitest`.
