# HANDOFF — ElectroCraft

## Current

F08 / M08.10 — Taxonomías dentro de Modelos — `ACTIVE`.

Rama activa: `codex/m08-10-taxonomies`.

M08.9 quedó certificada por ElectroCraft Base CI `33812380216` (#878) y PR `#75` fusionada por squash a `main` en `93440130d8c5fd62f73366925df7695dd309daf3`.

## M08.10 owner y límites

Owner: `PGlite generic content store` existente.

- `ElectroTaxonomy` debe ser metadata portable y referenciar modelos canónicos.
- términos viven en el storage genérico `taxonomy_terms`; `parentId` expresa jerarquía.
- definición y administración de términos son superficies separadas.
- el acceso pasa por adapter/repository y el único ConnectorRegistry.
- no hay DDL dinámico, internals PGlite ni secretos persistidos.

## UX objetivo

Ruta: `Datos > Modelos > <modelo> > Taxonomías` y gestor de términos contextual.

- List izquierda y detail con Identidad/Jerarquía/Modelos/Campos/Plantillas.
- gestor de términos separado y contextual.
- estados initial/loading/ready/empty/error/saving/saved/blocked cuando apliquen.
- ayuda `help.content.models` actualizada en español si introduce concepto nuevo.

## Precondición certificada

- M08.9: `GREEN` por Base CI `33812380216` (#878).
- PR `#75`: fusionada por squash.
- no hay P0/P1 abiertos en la dependencia inmediata.

## Siguiente acción exacta

Inspeccionar implementación existente, verificar la API pública actual de PGlite y construir M08.10 detrás del owner certificado. Ejecutar unit/contract/integration/negative/round-trip/E2E antes de publicar una única candidata.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/phases/F08.md → .ai/microphases/M08_10.md → packages/domain/src/data/ → packages/connectors/src/ → packages/data-web/src/ → apps/studio/src/features/data/ → tooling/vitest → tooling/playwright`.
