# M00.4 source/API audit

## PGlite

Pin ejecutado: `@electric-sql/pglite@0.5.5`.

APIs ejecutadas:
- `PGlite` para el runtime Postgres embebido;
- `PGliteWorker` desde `@electric-sql/pglite/worker` para el cliente browser;
- `worker()` desde `@electric-sql/pglite/worker` para el worker process;
- `PGlite("idb://electrocraft-m00-4-studio-db")` para persistencia browser del POC.

Ownership confirmado: Postgres embebido, filesystem/persistencia y coordinación multi-tab permanecen upstream. ElectroCraft no implementa un singleton main-thread ni otro DB engine.

## Drizzle ORM

Pin ejecutado: `drizzle-orm@0.45.2`.

APIs ejecutadas:
- `drizzle-orm/pglite` para el driver PGlite;
- `drizzle-orm/pg-core` para el schema físico;
- `drizzle-orm/pglite/migrator` para aplicar la migration reproducible;
- query builder/transacciones Drizzle para CRUD/index/query/rollback.

Ownership confirmado: schema/query/migrations permanecen Drizzle. ElectroCraft solo define su canonical physical contract y adapters semánticos.

## Gap ElectroCraft

ElectroCraft aporta:
- las seis tablas genéricas requeridas;
- canonical checksum por Project Object;
- mapping de modelos/fields lógicos a JSONB + `record_field_index` selectivo;
- política de cero tabla dinámica/cero `ALTER TABLE` por cambio lógico;
- semántica de revisions/version/portable data.

El runtime browser y el engine DB no se reimplementan.
