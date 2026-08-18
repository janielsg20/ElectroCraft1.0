# HANDOFF — ElectroCraft

## Current
F02 / M02.1 — Definir `ElectroCraftProjectDefinition` y `ElectroCraftDocument` — `ACTIVE`.

## Siguiente acción exacta
1. Leer `.ai/microphases/M02_1.md`, `.ai/DATA_MODELS.md`, `.ai/ARCHITECTURE.md` y los requisitos R020/R032/R034/R057/R066–R068/R080/R081 aplicables.
2. Definir en el owner canónico `packages/domain` los contratos de `ElectroCraftProjectDefinition` y `ElectroCraftDocument` sin internals de engines.
3. Añadir schemas/validators fail-closed y fixtures mínimos de round-trip/serialización.
4. Añadir unit/contract/integration tests para IDs, versionado, metadata, screens/document y rechazo de claves no soportadas.
5. Ejecutar lint, typecheck, boundaries, tests, build y CI real.
6. Registrar evidencia M02.1 y solo entonces activar M02.2.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M02_1.md`.

F01 está cerrada; no reabrirla salvo regresión reproducible.
