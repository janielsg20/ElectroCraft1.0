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
- M02.6 — Serializer y migrations de proyecto: `ACTIVE`.
- Gate acumulado: `GREEN_THROUGH_M02.5`.
- Blockers P0/P1: `0`.

## Microfase activa
`M02.6` — Serializer y migrations de proyecto.

Objetivo actual: consolidar serialización determinista y checksum de snapshots canónicos; introducir un MigrationRegistry de schemaVersion que use Zod como boundary owner; probar una migración real mínima y asegurar que un import inválido devuelve diagnostics reparables sin mutar storage.

## Referencias
- Spec: `.ai/microphases/M02_6.md`.
- Fase: `.ai/phases/F02.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.
- Cierre M02.5: `.ai/evidence/F02/M02.5/CLOSURE_2026-08-18.md`.

No iniciar M02.7 hasta cerrar M02.6 con tests/build/evidencia.
