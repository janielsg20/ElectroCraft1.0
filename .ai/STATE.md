# STATE — ElectroCraft Eighth Final

## Estado actual
- Fase activa: F00 — Reconocimiento, verificación y arquitectura.
- Microfase activa: M00.5 — POC Query portable.
- Última microfase cerrada: M00.4 — POC Studio DB genérica.
- Estado: `IN_PROGRESS`.
- Bloqueos: ninguno para iniciar M00.5.

## M00.4 — cierre
- POC real fijado a `@electric-sql/pglite@0.5.5` + `drizzle-orm@0.45.2`.
- Browser usa la integración oficial `PGliteWorker` + `worker()` con `idb://electrocraft-m00-4-studio-db`; no hay singleton PGlite en main thread.
- Drizzle posee schema/query/migrations; migration reproducible crea exactamente `projects`, `project_objects`, `project_revisions`, `content_records`, `relation_edges` y `record_field_index`.
- Dos modelos lógicos + records no crean tablas físicas nuevas; añadir un field al `ElectroCraftDataSchema` produce cero `ALTER TABLE`.
- Project Objects se guardan incrementalmente con checksums independientes; `version` es versión pequeña de formato/object, no timestamp.
- `record_field_index` materializa solo fields declarados queryables/faceted.
- Integración PGlite/Drizzle real: GREEN, incluido rollback y close/reopen persistence.
- Chromium dos-tabs real: GREEN; A↔B visible, clientes distintos leader/follower y persistencia tras reapertura.
- GitHub Actions run `32061372828`, head `92a1a0b7f21d4db4ebad637e11084bd80415f640`: SUCCESS.
- Gates: npm registry/install, lint, typecheck-script, 12/12 tests, integration, browser-contract, build, two-tab runtime y closure-gate: GREEN.
- Latencia observada: save object `1.291 ms` promedio/20; facet query `1.602 ms` promedio/20.
- Evidencia: `.ai/evidence/F00/M00.4/` y `.ai/adr/ADR-0004-studio-db-poc.md`.

## Próximo paso
Ejecutar M00.5 — POC Query portable.
