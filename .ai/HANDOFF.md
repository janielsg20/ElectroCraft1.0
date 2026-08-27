# HANDOFF — ElectroCraft

## Current

F05 / M05.8 — Editor core E2E — `ACTIVE`.

## Heredado

- F04/M04.1–M04.8 cerró `COMPLETADA / GREEN` con persistencia, recovery, Project Home, backup/import, workspace preferences y revisiones no destructivas.
- M05.1–M05.6 están `COMPLETADA / GREEN` con sus respectivos Base CI y merges registrados en STATE/TRACKING.
- M05.7 cerró `COMPLETADA / GREEN`; head `f07d6ddcffbf98f1e53ad7d9ff1a19478c99bffc`, Base CI `33089363788` (#709), PR `#59` fusionada a `main` en `f75dcb85ca73b05008c982958f442f6f6031fd40`.
- `@electrocraft/editor-puck` sigue siendo el boundary propietario; Studio no persiste internals Puck/Tiptap.
- Composition pública Puck vive dentro del AppShell; Preview mantiene aislamiento por iframe.
- Slots, permissions, migration, action sync, visual history, inline editing y extensiones mínimas de Palette/Outline ya están cerrados.
- No crear workflow dedicado M05.8; usar únicamente el Base CI transversal final.
- Blockers P0/P1 conocidos: `0`.

## Objetivo M05.8

1. Abrir un proyecto real con `Container`, `Text`, `Image` y `Button` disponibles en el `Config` Puck activo.
2. Insertar componentes desde la Palette real y comprobar persistencia canónica por F04 autosave.
3. Seleccionar mediante `Puck.Outline` y editar mediante `Puck.Fields`/inline sin UI paralela.
4. Probar nesting/reorder y que `ElectroCraftDocument` conserve IDs/estructura sin `history/ui/zones`.
5. Probar Undo/Redo del Topbar contra la history pública Puck y que los cambios resultantes vuelvan al documento canónico.
6. Recargar/reabrir el proyecto y comprobar que el estado durable vuelve desde storage, no desde AppState de Puck.
7. Mantener fail-closed visible si falta renderer/config canónica.

## Implementación actual

- Rama `codex/m05-8-editor-core-e2e`.
- Nuevo `studio-core-components.ts` con definiciones canónicas built-in y renderers para los cuatro componentes core requeridos.
- `useStudioPuckEditorRuntime()` pasa estas definitions/renderers al único `loadStudioPuckEditor()`.
- `puck-composition.css` da presentación mínima al contenido real del Canvas.
- Integration/contract/Playwright cubren registry, insertion, selection/edit, nesting/reorder, history, autosave y reopen.

## Siguiente acción exacta

1. Revisar diff completo contra `main` y corregir riesgos de tipo/formato.
2. Abrir una única PR de M05.8.
3. Usar únicamente `ElectroCraft Base CI` como gate.
4. Corregir cualquier fallo real en la misma rama.
5. Con head exacto GREEN, fusionar M05.8 y actualizar STATE/TRACKING/HANDOFF/F05 para el cierre de F05 o la siguiente microfase canónica.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M05_8.md → packages/editor-puck → apps/studio/src/features/editor → apps/studio/src/shell → tooling/vitest → tooling/playwright`.
