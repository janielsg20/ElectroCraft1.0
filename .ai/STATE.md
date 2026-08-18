# STATE — ElectroCraft

## Estado actual
- F00 — Reconocimiento, verificación y arquitectura: `COMPLETADA`.
- F01 — Monorepo, límites, documentación y CI: `COMPLETADA`.
- Gate F01: `GREEN`.
- M01.1–M01.6: `COMPLETADAS` con evidencia real.
- F02 — Modelo canónico del proyecto: `IN_PROGRESS`.
- M02.1 — Definir `ElectroCraftProjectDefinition` y `ElectroCraftDocument`: `COMPLETADA`.
- M02.2 — Definir Component/Layout/Style: `ACTIVE`.
- Gate acumulado: `GREEN_THROUGH_M02.1`.
- Blockers P0/P1: `0`.

## Microfase activa
`M02.2` — Definir Component/Layout/Style.

Objetivo actual: definir metadata portable de componentes, layout semántico y estilos con overrides responsive/platform, versionado y migración, manteniendo Puck como adapter y evitando persistir internals de React/Tailwind/NativeWind.

## Referencias
- Spec: `.ai/microphases/M02_2.md`.
- Fase: `.ai/phases/F02.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.
- Cierre M02.1: `.ai/evidence/F02/M02.1/CLOSURE_2026-08-18.md`.

No iniciar M02.3 hasta cerrar M02.2 con tests/build/evidencia.
