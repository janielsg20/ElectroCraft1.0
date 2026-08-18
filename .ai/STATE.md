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
- M02.8 — Clasificar ownership: Project Objects vs Registries vs Content Entities: `COMPLETADA`.
- M02.9 — Definir wrappers versionados para payloads de engines: `ACTIVE`.
- Gate acumulado: `GREEN_THROUGH_M02.8`.
- Blockers P0/P1: `0`.

## Microfase activa
`M02.9` — Definir wrappers versionados para payloads de engines.

Objetivo actual: definir el patrón portable `{ engine, schemaVersion, value }`, aplicarlo inicialmente a RQB rules y Tiptap richtext mediante validators/migrations en sus adapters, detectar engines/versiones no soportados y documentar qué payloads OSS pueden persistirse sin convertir AppState/classes/runtime internals de Rete/Puck en modelo canónico.

## Referencias
- Spec: `.ai/microphases/M02_9.md`.
- Fase: `.ai/phases/F02.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.
- Cierre M02.8: `.ai/evidence/F02/M02.8/CLOSURE_2026-08-18.md`.

No cerrar F02 ni iniciar F03 hasta cerrar M02.9 con tests/build/evidencia y ejecutar el gate final de F02.
