# HANDOFF — ElectroCraft

## Current

F08 / M08.12 — CRUD de Registros y validación — `ACTIVE`.

Rama activa: `codex/m08-12-record-crud-validation`.

M08.11 quedó certificada tras auditoría correctiva por ElectroCraft Base CI `33995779383` (#900) sobre `ec50b655560e749e98aead608924612346beb87d`. PR `#78` fue fusionada por squash a `main` en `89075e17b10332d5d6eaebbd9800f33e0987ffaf`.

## M08.11 — cierre certificado

`IMPLEMENTADA / GREEN MICROFASE`.

Owner: `PGlite generic content store` existente.

- `ElectroRelation`/`ElectroRelationEdge` son contratos portables;
- todos los edges viven en la tabla física estable `relation_edges`;
- cardinalidad `1:1`, `1:N`, `N:N` se valida en aplicación/repositorio;
- `restrict`, `detach` y `cascade` se resuelven atómicamente con el borrado del registro raíz;
- el adapter no ejecuta un segundo delete fuera de la transacción;
- cambio de cardinalidad/destino queda bloqueado con edges existentes;
- acceso pasa por `InternalRelationRepository`, `InternalDataSourceAdapter` y el único ConnectorRegistry;
- no hay DDL dinámico, segundo store, registry paralelo ni secretos persistidos.

Evidencia: `.ai/evidence/F08/M08.11/CLOSURE_2026-09-05.md`.

## Precondición M08.12

- M08.11: `GREEN` por Base CI `33995779383` (#900).
- docs, lint, lint offline, typecheck, boundaries, tests, build, Playwright, empty-repo y artifacts: `success`.
- PR correctiva `#78`: fusionada por squash en `89075e17b10332d5d6eaebbd9800f33e0987ffaf`.
- no quedaron P0/P1 abiertos en M08.11.

## M08.12 — objetivo exacto

Ruta: `Datos > Registros`.

- mantener `content_records` como store JSON físico propietario;
- validar create/update usando `ElectroCraftDataSchema` antes del write;
- implementar soft delete por policy de estado/deletedAt sin DDL por modelo;
- DataView/list + record form/detail en desktop;
- cards y controles adaptados en mobile;
- selector de tipo/modelo en toolbar;
- todos los writes pasan por service/adapter/ConnectorRegistry;
- errores de validación permanecen visibles y reparables.

## Límites

- no crear otra tabla por modelo o tipo de contenido;
- no insertar records desde UI saltándose el service;
- no persistir internals PGlite como parte del proyecto canónico;
- no duplicar ConnectorRegistry ni repositorios de datos;
- no declarar cierre sin unit/integration/negative/persistence/E2E y gate completo.

## Siguiente acción exacta

Inspeccionar `InternalDataRepository`, contratos de modelo/fields, adapter interno y superficies actuales de contenido. Definir primero validation compiler/service y soft-delete policy; después integrar `Datos > Registros` y sus tests.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M08_12.md → .ai/evidence/F08/M08.11/CLOSURE_2026-09-05.md → packages/domain/src/data → packages/application/src/data → packages/data-web/src/internal-data-repository.ts → packages/connectors/src/internal-data-source-adapter.ts → apps/studio/src/features/data → tooling/vitest → tooling/playwright`.
