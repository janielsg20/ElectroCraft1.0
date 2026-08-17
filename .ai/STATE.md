# STATE — ElectroCraft Eighth Final

## Estado actual
- Fase activa: F00 — Reconocimiento, verificación y arquitectura.
- Microfase activa: M00.6 — POC Action Flow Rete.
- Última microfase cerrada: M00.5 — POC Query portable.
- Estado: `IN_PROGRESS`.
- Bloqueo de producto: ninguno.
- Bloqueo de cierre M00.6: el contenedor actual no puede resolver `registry.npmjs.org`; falta ejecutar el gate de paquetes publicados incluido en GitHub Actions.

## M00.6 — progreso verificable
- `ElectroCraftActionGraph` v1 existe como JSON canónico portable: Trigger -> Condition -> Data -> Toast.
- Adapter Rete genera runtime ControlFlow/Dataflow sin persistir clases/IDs/history del engine.
- Semántica fail-closed: kind/operator/operation/path/edge inválidos bloquean.
- Fuente oficial etiquetada y SHA-provenance auditada para Rete/editor/engine/history/area.
- Gates locales: lint PASS; syntax/type contract PASS; 9/9 tests PASS; source-tag runtime PASS; node+connection undo/redo PASS; build PASS.
- El intento de paquete publicado no se marca PASS: `rete` no está instalado porque npm no es resolvible en este contenedor.
- Workflow preparado: `.github/workflows/verify-m00-6-action-flow-rete.yml`; genera lockfile determinista, instala con `npm ci` y verifica versiones/lock.
- Evidencia: `.ai/evidence/F00/M00.6/`.

## M00.5 — cierre heredado
- `ElectroCraftQueryDefinition` v1 envuelve RQB sin persistir internals del engine.
- POC fijado a `@react-querybuilder/core@8.23.0` + `@electric-sql/pglite@0.5.5`, con lockfile reproducible.
- Nested AND/OR real, indexed `record_field_index` + JSONB extraction: GREEN.
- Unsupported operator/valueSource/field: blocker fail-closed; no fallback true/no-op.
- Injection payload permanece en `$n` params y no entra al SQL.
- Facet count sobre indexer, multi-source shape y Project Object close/reopen/re-execute: GREEN.
- GitHub Actions run `32063065255`, job `95488578412`, head `2315f0f2f6d26c3ef45d22d5fd0914d8e26b0503`: SUCCESS.

## Próximo paso exacto
Subir este cambio, ejecutar `Verify M00.6 Action Flow Rete`, registrar evidencia/lockfile y solo entonces cerrar M00.6. No iniciar M00.7 antes del gate verde.
