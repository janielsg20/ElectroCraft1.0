# HANDOFF — ElectroCraft

## Current

F06 / M06.2 — Responsive inheritance y reset — `ACTIVE`.

## Heredado

- F00–F04 están `COMPLETADA / GREEN`.
- F05/M05.1–M05.8 cerró `COMPLETADA / GREEN`; PR `#60`, squash `a81ca149c17391b9fe77aaaf57b125d229320173`, Base CI `33101434587` (#742).
- `@electrocraft/editor-puck` sigue siendo el boundary propietario; Studio no persiste internals Puck/Tiptap.
- Composition, Slots, Fields, Outline, Preview, action sync, visual history y autosave/reopen ya están integrados sobre el modelo canónico.
- M06.1 está `COMPLETADA / GREEN`: documento v4, migración v3, Layout/Style por nodo, adapter Puck, Inspector Diseño/Estilo y Canvas semántico.
- Evidencia M06.1: `.ai/evidence/F06/M06.1/CLOSURE_2026-08-27.md`; gate local 41 Node, 415 Vitest, build y Playwright real verdes.
- Blockers P0/P1 conocidos: `0`.

## Objetivo M06.2

1. Definir presets Desktop/Laptop/Tablet/Mobile y custom breakpoints estables.
2. Mapear los viewports visibles a `viewports` público de Puck sin persistir viewport/geometry transitoria.
3. Editar base + overrides canónicos por breakpoint sin duplicar documentos.
4. Mostrar origen Base/Heredado/Anulado y escribir/resetear solo la propiedad actual.
5. Conservar custom breakpoints en round-trip aunque difieran de los viewports internos de Puck.
6. Validar desktop/tablet/mobile, diagnostics de targets, accesibilidad y ayuda persistente.

## Siguiente acción exacta

1. Auditar el modelo responsive existente y la API pública `viewports` de la versión Puck instalada.
2. Diseñar la mínima extensión canónica para custom breakpoints y herencia por propiedad.
3. Implementar adapter + Topbar/Inspector reutilizando el owner M06.1.
4. Añadir unit/contract/integration/negative/round-trip/E2E y ejecutar lint, typecheck, test y build antes de cerrar M06.2.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/phases/F06.md → .ai/microphases/M06_2.md → .ai/EDITOR_ENGINE.md → .ai/DATA_MODELS.md → packages/domain → packages/editor-puck → packages/design-system → apps/studio/src/features/editor → tooling/vitest → tooling/playwright`.
