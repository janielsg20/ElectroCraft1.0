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
- M02.4 — Definir Action, State, Navigation y Permission contracts: `ACTIVE`.
- Gate acumulado: `GREEN_THROUGH_M02.3`.
- Blockers P0/P1: `0`.

## Microfase activa
`M02.4` — Definir Action, State, Navigation y Permission contracts.

Objetivo actual: definir contratos canónicos portables/versionados para ActionGraph, State, Route/Navigation y Role/PermissionPolicy; conservar refs estables entre screens/routes/actions/state, reutilizar owners existentes detrás de application adapters y evitar persistir internals de Rete, React Router, Expo, Refine u otros engines.

## Referencias
- Spec: `.ai/microphases/M02_4.md`.
- Fase: `.ai/phases/F02.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.
- Cierre M02.3: `.ai/evidence/F02/M02.3/CLOSURE_2026-08-18.md`.

No iniciar M02.5 hasta cerrar M02.4 con tests/build/evidencia.
