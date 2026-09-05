# HANDOFF — ElectroCraft

## Current

F08 / M08.11 — Relaciones 1:1, 1:N y N:N — `ACTIVE`.

Rama activa: `codex/m08-11-relations`.

M08.10 quedó certificada por ElectroCraft Base CI `33896051996` (#882) y PR `#76` fusionada por squash a `main` en `78c88b65ef8708575ea2885edf7ad6631a30afce`.

## M08.11 — estado de implementación

`IMPLEMENTADA / PENDIENTE GATE`.

## M08.11 owner y límites

Owner: `PGlite generic content store` existente.

- `ElectroRelation` es metadata portable; source/target son refs de modelos canónicos.
- todos los edges viven en la tabla física existente `relation_edges`.
- cardinalidad `1:1`, `1:N`, `N:N` se valida en aplicación/repositorio.
- `restrict`, `detach` y `cascade` controlan integridad de borrado.
- acceso a edges pasa por `InternalRelationRepository`, `InternalDataSourceAdapter` y el único ConnectorRegistry.
- no hay migración M08.11, DDL dinámico, segundo store, registry paralelo ni secretos persistidos.

## UX implementada

Ruta: `Datos > Modelos > <modelo> > Relaciones`.

- list compacta origen · cardinalidad · destino;
- detail con Nombre, Clave, Origen, Tipo, Destino, Inverso, Integridad y Permisos;
- selectores de registros para crear edges;
- lista de vínculos con eliminación explícita;
- campos `relation` pueden enlazar `relationRef` canónico;
- layout responsive: 2 columnas desktop, 1 columna tablet, controles apilados móvil.

## Precondición certificada

- M08.10: `GREEN` por Base CI `33896051996` (#882), `123/123` Playwright.
- PR `#76`: fusionada por squash en `78c88b65ef8708575ea2885edf7ad6631a30afce`.
- no hay P0/P1 abiertos en la dependencia inmediata.

## Implementación candidata

- contratos `ElectroRelation` y `ElectroRelationEdge`;
- capability `relations` en DataSource y adapter interno;
- `relations[]` en schema canónico con refs fail-closed;
- `relationRef` opcional y backward-compatible en campos relation;
- repositorio Drizzle sobre `relation_edges` existente;
- validación de cardinalidad/duplicados/endpoints;
- integridad `restrict/detach/cascade`;
- recursos `relation:<id>` descubribles desde Data Explorer;
- Studio Modelos > Relaciones + selectores de records;
- unit/contract/integration PGlite/E2E preparados.

Evidencia: `.ai/evidence/F08/M08.11/IMPLEMENTATION_2026-09-04.md`.

## Siguiente acción exacta

Ejecutar ElectroCraft Base CI sobre PR `#77`. Solo con `success` registrar cierre, fusionar y activar M08.12. Ante fallo, corregir exclusivamente la señal observada.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M08_11.md → .ai/evidence/F08/M08.10/CLOSURE_2026-09-04.md → .ai/evidence/F08/M08.11/IMPLEMENTATION_2026-09-04.md → packages/domain/src/data/relations.ts → packages/data-web/src/internal-relation-repository.ts → packages/connectors/src/internal-data-source-adapter.ts → apps/studio/src/features/data/relation-editor.tsx → tooling/vitest → tooling/playwright/m08-11-relations.spec.ts`.
