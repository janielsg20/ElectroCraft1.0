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
4. Probar nesting/reorder mediante acciones públicas Puck y conservar IDs/estructura sin `history/ui/zones`.
5. Probar Undo/Redo del Topbar contra la history pública Puck y sincronizar los resultados al documento canónico.
6. Recargar/reabrir el proyecto y comprobar que el estado durable vuelve desde storage, no desde AppState de Puck.
7. Mantener fail-closed visible si falta renderer/config canónica.

## Implementación actual

- Rama `codex/m05-8-editor-core-e2e`; PR `#60`.
- `puck-core-components.tsx` es el único kit core built-in para los cuatro componentes requeridos.
- `loadStudioPuckEditor()` usa ese kit por defecto; el hook Studio no duplica definitions/renderers.
- `puckEditorCommandControls` es un bridge session-only al dispatch de Puck y no almacena estado del editor.
- `puck-composition.css` presenta el contenido real usando los `data-ec-core-component` del kit único.
- Integration/contract/Playwright cubren registry, insert, move/nest/reorder, selection/edit, history, autosave y reopen.

## Siguiente acción exacta

1. Esperar el Base CI automático del último head de PR `#60`.
2. Corregir cualquier fallo real en la misma rama sin workflows adicionales.
3. Con head exacto GREEN, fusionar PR `#60` mediante squash.
4. Actualizar STATE/TRACKING/HANDOFF/F05 con evidencia final y cerrar F05 o activar la siguiente microfase canónica.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M05_8.md → packages/editor-puck → apps/studio/src/features/editor → apps/studio/src/shell → tooling/vitest → tooling/playwright`.
