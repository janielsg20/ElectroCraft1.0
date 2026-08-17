# STATE — ElectroCraft Eighth Final

## Estado actual
- Fase activa: F00 — Reconocimiento, verificación y arquitectura.
- Microfase activa: M00.6 — POC Action Flow Rete.
- Última microfase cerrada: M00.5 — POC Query portable.
- Estado: `IN_PROGRESS`.
- Bloqueos: ninguno para iniciar M00.6.

## M00.5 — cierre
- `ElectroCraftQueryDefinition` v1 envuelve RQB sin persistir internals del engine.
- POC fijado a `@react-querybuilder/core@8.23.0` + `@electric-sql/pglite@0.5.5`, con lockfile reproducible.
- Nested AND/OR real, indexed `record_field_index` + JSONB extraction: GREEN.
- Unsupported operator/valueSource/field: blocker fail-closed; no fallback true/no-op.
- Injection payload permanece en `$n` params y no entra al SQL.
- Facet count sobre indexer, multi-source shape y Project Object close/reopen/re-execute: GREEN.
- GitHub Actions run `32063065255`, job `95488578412`, head `2315f0f2f6d26c3ef45d22d5fd0914d8e26b0503`: SUCCESS.
- Gates: registry, `npm ci`, lint, syntax/type contract, 7/7 tests, real integration, build y closure-gate: GREEN.
- Latencia observada: RQB format `0.0442 ms`; Electro compile `0.0479 ms`; adapter overhead `0.0037 ms`, promedio/50.
- Evidencia: `.ai/evidence/F00/M00.5/` y `.ai/adr/ADR-0005-query-portable-poc.md`.

## Próximo paso
Ejecutar M00.6 — POC Action Flow Rete.
