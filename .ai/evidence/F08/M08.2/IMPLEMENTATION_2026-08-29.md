# M08.2 — ElectroCraft Data sobre PGlite — evidencia de implementación

Fecha: 2026-08-29.
Estado: `IMPLEMENTADA / PENDIENTE GATE F08`.

## Objetivo cubierto

Se implementó la fuente interna `ElectroCraft Data` sobre el owner existente `PGlite + Drizzle + generic content_records`, sin crear una segunda base local ni una tabla física por modelo.

## Arquitectura y owners

- `packages/application/src/data/index.ts`
  - `InternalDataRepository` y contratos de record/query/stats.
  - `InternalDataPermissionPort` inyectable y fail-closed.
- `packages/data-web/src/internal-data-repository.ts`
  - CRUD/query/stats mediante Drizzle sobre `content_records` existente.
  - schema discovery desde `ElectroCraftDataSchema` persistido como Project Object `data-schema`.
- `packages/data-web/src/browser-internal-data.ts`
  - companion port browser sobre el mismo database name/dataDir `electrocraft-studio-storage`.
  - usa el mismo `pglite.worker.ts`, migraciones y bridge Drizzle de F04.
  - `offlineCapable: true`.
- `packages/connectors/src/internal-data-source-adapter.ts`
  - `InternalDataSourceAdapter` registrado como `internal.pglite`.
  - capabilities: read/create/update/delete/pagination/filtering/sort/transactions.
  - no reclama aggregate/realtime/file si el adapter no los implementa.
- `apps/studio/src/features/data/data-source-runtime.ts`
  - registra el adapter por proyecto activo.
  - permission boundary permite solo el proyecto actualmente abierto.
  - fuente interna fuerza `authRef=null`, storage `content_records`, metadata offline y capabilities compatibles.
  - se eliminó el fallback incorrecto que trataba `lastDocumentId` como projectId.

## Store físico reutilizado

No se agregó ninguna tabla M08.2.

`packages/data-web/src/schema.ts` y la migración histórica M04.1 ya contienen una única tabla:

- `content_records(project_id, id, model_id, data, state, created_at, updated_at)`.

El schema lógico no se deriva inspeccionando tablas físicas. `getSchema()` lee `ElectroCraftDataSchema` canónico por `sourceRef`.

## UX Studio

Archivos:

- `apps/studio/src/features/data/data-sources-feature-workspace.tsx`
- `apps/studio/src/features/data/data-sources-feature-workspace.css`
- `apps/studio/src/help/help-registry.ts`
- `apps/studio/src/shell/app-shell-route.tsx`

La pantalla `Datos > Fuentes de datos` añade:

- CTA directo `Crear ElectroCraft Data` cuando todavía no existe.
- `ElectroCraft Data`.
- estado `Local`.
- `Disponible sin conexión`.
- contadores `Modelos` y `Registros`.
- tamaño aproximado del storage desde diagnostics existentes.
- acción `Copia de seguridad` reutilizando el backup de proyecto F04.
- accesos a `Modelos` y `Registros`.
- Help contextual `help.data.internal`.
- ningún SQL console ni textarea SQL para usuario beginner.

## Seguridad

- El adapter recibe `InternalDataPermissionPort`; lectura y mutaciones fallan cerradas si no autoriza.
- Studio autoriza M08.2 únicamente cuando el `projectId` solicitado coincide con el proyecto actualmente abierto.
- No se adelanta el motor de auth/roles de F12.
- La fuente interna no persiste secretos ni credenciales y no requiere Gateway.

## Fixtures y pruebas añadidas

Fixtures:

- `tooling/fixtures/canonical-model/internal-data-source-v1.json`
- `tooling/fixtures/canonical-model/internal-data-schema-v1.json`

Pruebas:

- `tooling/vitest/unit/m08-2-internal-data-adapter.test.ts`
  - registry + adapter;
  - CRUD/query/schema;
  - permission denial;
  - offline contract;
  - una sola tabla física `content_records`;
  - UX española obligatoria y ausencia de SQL console.
- `tooling/vitest/integration/m08-2-internal-data-pglite.test.ts`
  - `PGlite.create()` real en memoria;
  - migraciones idempotentes;
  - Drizzle real;
  - discovery de schema lógico;
  - create/read/filter/sort/pagination/update/delete;
  - reapertura creando un repository nuevo sobre la misma base;
  - stats.
- HelpRegistry y AppShell matrix actualizados para `help.data.internal`.

## Revisión realizada

- Se verificó que M04 ya posee el único generic record store requerido.
- Se verificó que el companion browser usa el mismo database name/dataDir y el mismo PGlite Worker/leader-election pattern de F04.
- Se verificó que no se agregaron tablas ni migraciones M08.2.
- Se verificó que no hay borrados inesperados en el diff de F08.
- Se verificó la API actual PGlite para creación in-memory antes de escribir la integración.

## Validación ejecutable pendiente

No se ejecutó GitHub Actions en esta microfase, respetando la política del proyecto de reservar la suite completa para el gate de fase.

Pendiente antes de Gate F08:

1. regenerar `package-lock.json` por el nuevo workspace/dependencia `@electrocraft/connectors`;
2. ampliar coverage de `format/format:check` a `packages/connectors` y `packages/data-web`;
3. ejecutar lint + typecheck + Vitest + build + Playwright en el único gate F08;
4. corregir únicamente errores reales que aparezcan en ese gate.

## Límite preservado

M08.2 no implementa REST/OpenAPI, GraphQL ni SecretStore/Gateway. Esas responsabilidades pertenecen a M08.3, M08.4 y M08.5 respectivamente.

## Siguiente microfase exacta

`M08.3 — REST API Connector y OpenAPI import`.
