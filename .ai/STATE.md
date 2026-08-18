# STATE — ElectroCraft

## Estado actual
- F00 — Reconocimiento, verificación y arquitectura: `COMPLETADA`.
- F01 — Monorepo, límites, documentación y CI: `COMPLETADA`.
- Gate F01: `GREEN`.
- M01.1–M01.6: `COMPLETADAS` con evidencia real.
- F02 — Modelo canónico del proyecto: `IN_PROGRESS`.
- M02.1 — Definir `ElectroCraftProjectDefinition` y `ElectroCraftDocument`: `ACTIVE`.
- Blockers P0/P1: `0`.

## Microfase activa
`M02.1` — Definir `ElectroCraftProjectDefinition` y `ElectroCraftDocument`.

Objetivo actual: definir los contratos canónicos base del proyecto/documento con schemas compartidos, validación fail-closed y round-trip estable antes de añadir engines o UI.

## Referencias
- Spec: `.ai/microphases/M02_1.md`.
- Fase: `.ai/phases/F02.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.
- Cierre F01: `.ai/evidence/F01/M01.6/CLOSURE_2026-08-18.md`.

No iniciar M02.2 hasta cerrar M02.1 con tests/build/evidencia.
