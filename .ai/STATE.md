# STATE — ElectroCraft

## Estado actual
- F00 — Reconocimiento, verificación y arquitectura: `COMPLETADA`.
- F01 — Monorepo, límites, documentación y CI: `COMPLETADA`.
- Gate F01: `GREEN`.
- M01.1–M01.6: `COMPLETADAS` con evidencia real.
- F02 — Modelo canónico del proyecto: `IN_PROGRESS`.
- M02.1 — Definir `ElectroCraftProjectDefinition` y `ElectroCraftDocument`: `COMPLETADA`.
- M02.2 — Definir Component/Layout/Style: `COMPLETADA`.
- M02.3 — Definir ownership de Data Sources, Data Models, Queries y Forms: `COMPLETADA`.
- M02.4 — Definir Action, State, Navigation y Permission contracts: `COMPLETADA`.
- M02.5 — Definir Theme, Blueprint, Registries y Capability ownership: `COMPLETADA`.
- M02.6 — Serializer y migrations de proyecto: `COMPLETADA`.
- M02.7 — Definir `ElectroCraftExportIR`: `ACTIVE`.
- Gate acumulado: `GREEN_THROUGH_M02.6`.
- Blockers P0/P1: `0`.

## Microfase activa
`M02.7` — Definir `ElectroCraftExportIR`.

Objetivo actual: definir un snapshot immutable/versionado neutral a targets que incluya Documents, Navigation, Data Sources sanitizadas, DataSchema, Queries, State, Actions, Forms, Roles, Theme, Media manifest y capability requirements; fijar los nueve `ExportTargetId`, `TargetCompileContext`, serialización/checksum deterministas y `ExportValidationReport`, excluyendo internals de Studio/engines, caches, historial AI y secret values.

## Referencias
- Spec: `.ai/microphases/M02_7.md`.
- Fase: `.ai/phases/F02.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.
- Cierre M02.6: `.ai/evidence/F02/M02.6/CLOSURE_2026-08-18.md`.

No iniciar M02.8 hasta cerrar M02.7 con tests/build/evidencia.
