# HANDOFF — ElectroCraft

## Current

F08 / M08.13 — Índice tipado para búsqueda/filtros — `ACTIVE` (`IMPLEMENTADA / PENDIENTE GATE`).

Rama activa: `codex/m08-13-generic-field-indexer`.

M08.12 quedó certificada por ElectroCraft Base CI `34063642245` (#914) sobre `8b9371756006a754bbbf1702cff963369eeeabd6`. PR `#79` fue fusionada por squash a `main` en `096fb2bc6ae7110c899968b851728e0fa5795e96`.

## M08.12 — cierre certificado

`IMPLEMENTADA / GREEN MICROFASE`.

Evidencia: `.ai/evidence/F08/M08.12/CLOSURE_2026-09-06.md`.

## M08.13 — objetivo y owner

Owner: `PGlite generic content store` existente.

Ruta visible: `Datos > Modelos > Campo > Avanzado > Búsqueda y filtros`.

- reutilizar `record_field_index`; no crear otra tabla;
- capacidades explícitas Searchable / Filterable / Sortable / Faceted;
- filas tipadas y `normalizedText` con ordinal;
- CRUD de registro + índice dentro de una transacción;
- búsqueda/filtros/orden/facetas por índice cuando estén configurados;
- fallback JSON para filtros/orden no indexados;
- operación visible de rebuild y estado `disabled|empty|ready|stale`;
- todo query/rebuild detrás del único `ConnectorRegistry`.

## Implementación candidata

- contrato `ElectroCraftFieldIndexing` portable en metadata;
- `GenericFieldIndexer` en `packages/data-web/src/generic-field-indexer.ts`;
- storage schema v8 añade `normalized_text` y elimina el GIN FTS de expresión heredado;
- browser repository usa el indexed repository como owner de CRUD;
- relation cascade limpia filas de índice en la misma transacción;
- adapter `GenericFieldIndexedInternalDataSourceAdapter` expone search/facets y recurso `index:<modelId>`;
- Studio permite editar capacidades, inspeccionar estado y reconstruir;
- unit, contract, integration PGlite y E2E añadidos.

Evidencia candidata: `.ai/evidence/F08/M08.13/IMPLEMENTATION_2026-09-06.md`.

## Límites

- no DDL dinámico por modelo/campo;
- no índices SQL nuevos por campo;
- no segundo query engine/store/ConnectorRegistry;
- no acceso PGlite/Drizzle desde Studio UI;
- no declarar cierre sin Base CI completo GREEN.

## Siguiente acción exacta

Abrir PR de M08.13 y ejecutar un único ElectroCraft Base CI completo. Reparar cualquier fallo real sin relajar tests. Solo con gate GREEN registrar `CLOSURE`, fusionar y activar M08.14.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M08_13.md → .ai/evidence/F08/M08.12/CLOSURE_2026-09-06.md → .ai/evidence/F08/M08.13/IMPLEMENTATION_2026-09-06.md → packages/domain/src/data/field-indexing.ts → packages/data-web/src/generic-field-indexer.ts → packages/connectors/src/generic-field-index-adapter.ts → apps/studio/src/features/data/advanced-field-editor.tsx → tooling/vitest → tooling/playwright`.
