# M08.10 — Implementación candidata — 2026-09-04

## Resultado

M08.10 implementa taxonomías portables dentro de Modelos y administración contextual de términos sobre el store PGlite existente. La microfase permanece `ACTIVE / CANDIDATA A GATE` hasta ejecutar Playwright en un entorno con Chromium y certificar ElectroCraft Base CI.

## Owner y API verificada

- Owner: `PGlite generic content store` detrás de `InternalDataSourceAdapter` y el `ConnectorRegistry` existente.
- API oficial verificada el 2026-09-04: PGlite expone persistencia browser mediante IndexedDB/Worker, consultas y transacciones; Drizzle documenta soporte directo para PGlite.
- Referencias: `https://pglite.dev/docs/`, `https://pglite.dev/docs/api`, `https://pglite.dev/docs/filesystems`, `https://pglite.dev/docs/orm-support`.
- No se añadió DDL por modelo o taxonomía ni se persistieron internals del engine.

## Contrato y almacenamiento

- `ElectroTaxonomy` conserva identidad, jerarquía, refs de modelos y refs de plantillas como metadata canónica.
- Los campos `taxonomy` pueden conservar `taxonomyRef`; el schema falla cerrado ante taxonomías inexistentes o no asociadas al modelo.
- `ElectroTaxonomyTerm` conserva `taxonomyRef`, `slug`, `name`, `parentId` y metadata portable.
- La capability canónica `taxonomies` se declara tanto en la fuente interna como en su adapter.
- Storage schema v6 añade `parent_id` y unicidad de slug por proyecto/taxonomía a `taxonomy_terms`.
- CRUD y lectura de términos pasan por recursos `taxonomy:<id>` del adapter registrado; permisos, refs, ciclos, jerarquía plana, hijos y slugs duplicados fallan cerrados.

## Studio

- Ruta: `Datos > Modelos > <modelo> > Taxonomías`.
- Lista izquierda + detalle de Identidad/Jerarquía/Modelos/Campos/Plantillas.
- Definición y `Gestor de términos` son superficies separadas.
- El gestor permite crear, editar, jerarquizar y eliminar términos con errores visibles en español.
- El editor de campos permite enlazar un campo `Taxonomía` a una definición asociada al modelo.
- UI responsive: dos columnas en desktop; una columna en laptop/tablet/móvil; controles shadcn/Radix para Checkbox y Select.
- `help.content.models` documenta taxonomías, términos, `parentId` y `taxonomy_terms`.

## Archivos principales

- `packages/domain/src/contracts/data-definition.ts`
- `packages/domain/src/data/taxonomies.ts`
- `packages/domain/src/data/source-definition.ts`
- `packages/application/src/data/index.ts`
- `packages/connectors/src/internal-data-source-adapter.ts`
- `packages/data-web/src/internal-data-repository.ts`
- `packages/data-web/src/schema.ts`
- `packages/data-web/src/migration.ts`
- `packages/data-web/drizzle/0005_m08_10_taxonomy_terms.sql`
- `apps/studio/src/features/data/data-model-runtime.ts`
- `apps/studio/src/features/data/taxonomy-editor.tsx`
- `apps/studio/src/features/data/data-models-workspace.tsx`
- `apps/studio/src/features/data/data-models-workspace.css`
- `apps/studio/src/help/help-registry.ts`
- `locales/es/help.json`

## Pruebas

- Dedicadas M08.10: `5/5` GREEN.
  - `tooling/vitest/unit/m08-10-taxonomies.test.ts`
  - `tooling/vitest/contract/m08-10-taxonomy-boundary.test.ts`
  - `tooling/vitest/integration/m08-10-taxonomies-pglite.test.ts`
- `npm run lint`: GREEN.
- `npm run typecheck`: GREEN.
- `npm run test:boundaries`: GREEN.
- `npm run test`: GREEN; Node `41/41`, Vitest `552/552`, build Studio/PWA y secret scan verdes.
- `npm run build`: GREEN.
- `tooling/playwright/m08-10-taxonomies.spec.ts`: escrito; ejecución local bloqueada antes de abrir la app porque Chromium no está instalado y `cdn.playwright.dev` devolvió timeout de 30 s y `502 Bad Gateway` durante la descarga.

## Siguiente acción

Publicar una única candidata M08.10 y ejecutar ElectroCraft Base CI/Playwright. Solo con resultado completo `success` registrar VALIDATION/CLOSURE, fusionar y activar `M08.11 — Relaciones 1:1, 1:N y N:N`.
