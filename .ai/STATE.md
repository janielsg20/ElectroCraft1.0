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
- M02.5 — Definir Theme, Blueprint, Registries y Capability ownership: `ACTIVE`.
- Gate acumulado: `GREEN_THROUGH_M02.4`.
- Blockers P0/P1: `0`.

## Microfase activa
`M02.5` — Definir Theme, Blueprint, Registries y Capability ownership.

Objetivo actual: definir Theme como datos visuales portables; conservar template como `ElectroCraftDocument kind=template`; definir BlueprintPackage instalable con conflictos/rollback; mantener Capability y Component/Field/Action/Provider registries como registries versionados de aplicación y persistir solo `requiredCapabilities`, overrides por target y definitions creadas por usuario cuando corresponda.

## Referencias
- Spec: `.ai/microphases/M02_5.md`.
- Fase: `.ai/phases/F02.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.
- Cierre M02.4: `.ai/evidence/F02/M02.4/CLOSURE_2026-08-18.md`.

No iniciar M02.6 hasta cerrar M02.5 con tests/build/evidencia.
