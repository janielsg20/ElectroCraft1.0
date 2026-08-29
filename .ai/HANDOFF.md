# HANDOFF — ElectroCraft

## Current

F08 / M08.3 — REST API Connector y OpenAPI import — `ACTIVE`.

Rama activa: `codex/m08-1-data-sources`.

F07 está `GREEN` y fusionada. M08.1 y M08.2 están implementadas con evidencia; la suite ejecutable completa se reserva para Gate F08 para no usar Actions por microfase.

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

## M08.3 — owner y reglas

Owner: Web Fetch API + DataSourceAdapter + `@scalar/openapi-parser@0.28.11`, parser aprobado en F00.

Debe producir:

1. `RestDataSourceAdapter`;
2. OpenAPI import adapter;
3. REST source wizard: URL base → Autenticación → OpenAPI/Manual → Operaciones → Probar → Guardar;
4. fixtures REST/OpenAPI;
5. normalización de response/error/pagination;
6. fallback explícito a ConnectorGateway cuando browser/CORS/security no permita ejecución directa.

No guardar bearer tokens/API keys en source config. No arbitrary JS transforms.

## Deuda de gate visible

- `package-lock.json` debe regenerarse por `packages/connectors` y la dependencia Studio.
- root `format/format:check` debe incluir connectors/data-web.
- no abrir PR ni ejecutar Actions hasta Gate F08 salvo blocker excepcional.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/phases/F08.md → M08_1.md → M08_2.md → M08_3.md → evidence/F08 → packages/domain/src/data → packages/application/src/data + connector-registry → packages/connectors → packages/data-web → apps/studio/src/features/data → tooling/vitest`.
