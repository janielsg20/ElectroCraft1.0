# STATE — ElectroCraft

## Estado actual
- F00 — Reconocimiento, verificación y arquitectura: `COMPLETADA`.
- F01 — Monorepo, límites, documentación y CI: `COMPLETADA`.
- Gate F01: `GREEN`.
- M01.1–M01.6: `COMPLETADAS` con evidencia real.
- F02 — Modelo canónico del proyecto: `IN_PROGRESS`.
- M02.1 — Definir `ElectroCraftProjectDefinition` y `ElectroCraftDocument`: `COMPLETADA`.
- M02.2 — Definir Component/Layout/Style: `COMPLETADA`.
- M02.3 — Definir ownership de Data Sources, Data Models, Queries y Forms: `ACTIVE`.
- Gate acumulado: `GREEN_THROUGH_M02.2`.
- Blockers P0/P1: `0`.

## Microfase activa
`M02.3` — Definir ownership de Data Sources, Data Models, Queries y Forms.

Objetivo actual: definir contratos portables/versionados para DataSourceDefinition, ElectroCraftDataSchema/DataModel, QueryDefinition y bindings; mantener Form como `ElectroCraftDocument kind=form` con `formMeta`; reutilizar `data-core`, `query-rqb` y `forms` como owners/adapters existentes, sin persistir secrets ni internals de engines.

## Referencias
- Spec: `.ai/microphases/M02_3.md`.
- Fase: `.ai/phases/F02.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.
- Cierre M02.2: `.ai/evidence/F02/M02.2/CLOSURE_2026-08-18.md`.

No iniciar M02.4 hasta cerrar M02.3 con tests/build/evidencia.
