# HANDOFF — ElectroCraft

## Current
F02 / M02.2 — Definir Component/Layout/Style — `ACTIVE`.

## Siguiente acción exacta
1. Leer `.ai/microphases/M02_2.md`, `.ai/DATA_MODELS.md`, `.ai/ARCHITECTURE.md` y los contratos creados en M02.1.
2. Definir en `packages/domain/src/contracts/` `ElectroCraftComponentDefinition`, `ElectroCraftLayout` y `ElectroCraftStyle` como metadata portable y versionada.
3. Modelar layout con modos semánticos y estilos con responsive/platform overrides; no persistir Tailwind/NativeWind strings como fuente canónica.
4. Añadir migración/serializer de ComponentDefinition cuando el shape persistido cambie y application-facing types sin engines.
5. Implementar el adapter/composición Puck en `packages/editor-puck` usando la API pública de `Config`/`ComponentConfig`, sin copiar internals de Puck al canonical model.
6. Añadir fixtures, unit/contract/integration, round-trip y negative tests; ejecutar lint, typecheck, boundaries, tests, build y CI real.
7. Registrar evidencia M02.2 y solo entonces activar M02.3.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M02_2.md`.

M02.1 está cerrada; no reabrirla salvo regresión reproducible.
