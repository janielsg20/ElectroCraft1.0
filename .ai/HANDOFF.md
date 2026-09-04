# HANDOFF — ElectroCraft

## Current

F08 / M08.10 — Taxonomías dentro de Modelos — `ACTIVE / CANDIDATA A GATE`.

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

## Implementación candidata

- contratos `ElectroTaxonomy`/`ElectroTaxonomyTerm` y refs canónicas fail-closed;
- capability `taxonomies` sobre la fuente/adaptador interno existente;
- migración PGlite/Drizzle v6: `taxonomy_terms.parent_id` y slug único por taxonomía;
- CRUD jerárquico detrás de ConnectorRegistry con permisos, ciclos, padres e hijos validados;
- Studio en `Modelos > Taxonomías`, con definición y gestor de términos separados;
- ayuda persistente en español actualizada;
- lint/typecheck/boundaries/build verdes; Node `41/41`; Vitest `552/552`.

E2E: `tooling/playwright/m08-10-taxonomies.spec.ts` está preparado. Localmente no pudo arrancar porque falta Chromium; la descarga desde `cdn.playwright.dev` agotó timeout y devolvió 502.

## Siguiente acción exacta

Publicar una única candidata M08.10 y ejecutar ElectroCraft Base CI/Playwright. Con `success`, registrar VALIDATION/CLOSURE, fusionar y activar M08.11. Ante fallo, corregir únicamente la evidencia observada.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M08_10.md → .ai/evidence/F08/M08.10/IMPLEMENTATION_2026-09-04.md → tooling/playwright/m08-10-taxonomies.spec.ts`.
