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
- M02.7 — Definir `ElectroCraftExportIR`: `COMPLETADA`.
- M02.8 — Clasificar ownership: Project Objects vs Registries vs Content Entities: `ACTIVE`.
- Gate acumulado: `GREEN_THROUGH_M02.7`.
- Blockers P0/P1: `0`.

## Microfase activa
`M02.8` — Clasificar ownership: Project Objects vs Registries vs Content Entities.

Objetivo actual: fijar una taxonomía explícita y verificable para cada entidad del modelo; definir qué se serializa como Project Object, qué vive como Registry/Definition disponible y qué pertenece a Content Entities/records runtime, documentando owner, almacenamiento, serializer/migration access y participación en ExportIR sin crear una segunda fuente de verdad.

## Referencias
- Spec: `.ai/microphases/M02_8.md`.
- Fase: `.ai/phases/F02.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.
- Cierre M02.7: `.ai/evidence/F02/M02.7/CLOSURE_2026-08-18.md`.

No iniciar M02.9 hasta cerrar M02.8 con tests/build/evidencia.
