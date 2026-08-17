# ADR-0004 — Studio DB genérica con PGlite + Drizzle

Date: 2026-08-17.
Status: ACCEPTED.
Owner: F00 / M00.4.

## Contexto

ElectroCraft necesita una Studio DB local que soporte Project Objects incrementales, revisiones, records de modelos lógicos, relaciones e índices selectivos sin convertir cada modelo o field definido por el usuario en una tabla/columna física. La arquitectura ya asignaba el runtime Postgres embebido a PGlite y el schema/query/migrations tipados a Drizzle, pero M00.4 debía probar ese ownership con los paquetes publicados y con multi-tab real.

## Decisión

1. PGlite `0.5.5` es el owner del Postgres embebido y de la persistencia browser. En browser se usa la integración oficial `PGliteWorker` + `worker()`; el worker crea una única base persistente `idb://electrocraft-m00-4-studio-db`.
2. Drizzle ORM `0.45.2` es el owner del schema/query y del flujo de migraciones. El POC ejecuta `drizzle-orm/pglite` y `drizzle-orm/pglite/migrator` reales.
3. El modelo físico ElectroCraft en `public` queda limitado a seis tablas genéricas: `projects`, `project_objects`, `project_revisions`, `content_records`, `relation_edges` y `record_field_index`.
4. `ElectroCraftDataSchema` permanece lógico. Modelos/fields nuevos viven en Project Objects/JSONB; añadir un field no ejecuta `ALTER TABLE` ni crea una tabla por modelo.
5. `record_field_index` contiene solamente valores tipados de fields declarados searchable/filterable/sortable/faceted/indexed; el payload completo continúa en `content_records.data`.
6. Los Project Objects se guardan por `(project_id, object_id)` con checksum canónico independiente; modificar un object no cambia el checksum del otro.
7. `project_objects.version` representa una versión pequeña del formato/object schema y no un timestamp. Orden temporal/diagnóstico pertenece a `updated_at` o al payload canónico.
8. El harness `Request / Resultado / Validación` es diagnóstico de F00 y no crea una ruta/UI de producto.

## Evidencia ejecutable

Fuente: `experiments/m00-4-studio-db/`.

GitHub Actions de cierre:
- workflow: `Verify M00.4 Studio DB`;
- run: `32061372828`;
- head SHA: `92a1a0b7f21d4db4ebad637e11084bd80415f640`;
- job: `95483180935`;
- conclusion: `success`;
- artifact: `9298292283`;
- artifact digest: `sha256:0590acc6ba339f9d02cd1d62caffe6f7c889f1a06ba8a58df717422e7af90643`.

Resultados de engine/storage real:
- `PASS_NODE_ENGINE` con PGlite `0.5.5` + Drizzle `0.45.2`;
- aislamiento de Project Objects: PASS;
- dos modelos lógicos sin nuevas tablas físicas: PASS;
- facet index/query: PASS;
- schema evolution con cero `ALTER TABLE`: PASS;
- rollback negativo: PASS;
- close/reopen persistence: PASS;
- promedio 20 saves: `1.291 ms`;
- promedio 20 facet queries: `1.602 ms`.

Resultados browser real:
- Chromium + dos tabs simultáneas: `PASS_TWO_TAB`;
- ambos clientes ready: PASS;
- escritura tab A visible en tab B: PASS;
- escritura tab B visible en tab A: PASS;
- clientes Worker distintos con leader/follower: PASS;
- close/reopen recupera el último Project Object: PASS.

Gates completos del run verde:
- npm registry/ping: PASS;
- instalación de paquetes publicados: PASS;
- lint: PASS;
- `npm run typecheck` (syntax contract para los módulos ESM del POC): PASS, 21 módulos;
- tests: PASS, 12/12;
- integración PGlite/Drizzle real: PASS;
- browser contract: PASS;
- build del POC: PASS;
- two-tab runtime: PASS;
- closure gate: PASS;
- workflow final: PASS.

## Fallos útiles encontrados antes del cierre

La primera corrida detectó una navegación transitoria de Vite durante la optimización de dependencias browser; el harness se estabilizó sin relajar las aserciones. La segunda corrida detectó que el harness usaba `Date.now()` como `project_objects.version`, excediendo PostgreSQL `integer`; se corrigió el significado de `version` a versión de formato pequeña. La tercera corrida quedó completamente verde.

## Gap OSS / semántica ElectroCraft

PGlite resuelve Postgres embebido, filesystem/persistencia y coordinación Worker multi-tab. Drizzle resuelve schema/query/migrations. ElectroCraft solo aporta el modelo físico genérico, canonical checksums, mapping de `ElectroCraftDataSchema`, política de index selectivo y semántica de Project Objects/revisions.

## Licencia

PGlite y Drizzle ORM se usan en sus líneas OSS aprobadas; la auditoría de F00 mantiene su decisión/licencia upstream. Este POC no introduce un engine paralelo.

## Consecuencias

M00.4 queda cerrada GREEN. La siguiente microfase exacta es M00.5 — POC Query portable. M00.5 puede reutilizar `content_records` + `record_field_index`, pero no puede cambiar el ownership de la Studio DB ni crear una segunda capa de persistencia.
