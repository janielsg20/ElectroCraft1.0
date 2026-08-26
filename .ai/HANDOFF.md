# HANDOFF — ElectroCraft

## Current

F05 / M05.4 — Sincronizar Puck actions con ElectroCraftDocument — `ACTIVE`.

## Heredado

- F04/M04.1–M04.8 cerró `COMPLETADA / GREEN` con persistencia, recovery, Project Home, backup/import, workspace preferences y revisiones no destructivas.
- M05.1 cerró `COMPLETADA / GREEN`; PR `#49`, Base CI `32868029914` (#656), squash `733abdc44f21d16b56b4624c7bec61f0131bd3f1`.
- M05.2 cerró `COMPLETADA / GREEN`; Base CI `32990513971` (#661), PR `#50` fusionada a `main` en `fadc2ecb64764c120c75cb5e4c7b154d3cc4ade6`.
- M05.3 cerró `COMPLETADA / GREEN`; head `176b41a31a017f800cb8f63b41be3b7e65f52324`, Base CI `33016557679` (#674), PR `#52` fusionada a `main` en `fd5901dff66acca5d92ffee832a2ac881721458b`.
- `@electrocraft/editor-puck` sigue siendo el boundary propietario; Studio no persiste internals Puck.
- Composition pública Puck ya vive dentro del AppShell; Preview mantiene aislamiento de tema por iframe.
- Slots anidados, allow/disallow, permisos públicos y migración oficial legacy `zones -> slots` ya están cerrados.
- Editor history permanece separado de Project Revisions.
- No crear workflow dedicado M05.4; usar únicamente el Base CI transversal final.
- Blockers P0/P1 conocidos: `0`.

## Objetivo M05.4

1. Consumir `onAction`, `appState` y `prevAppState` desde el API público Puck.
2. Tras una acción estable, reconstruir el `ElectroCraftDocument` canónico usando el adapter existente.
3. Conectar el documento reconstruido al autosave incremental/debounce F04 y al repository propietario existente.
4. No crear MapOperations ni CommandBus universal para duplicar el engine.
5. Verificar reorder/edit/duplicate/delete sobre datos Puck reales.
6. Mantener selección e history del editor fuera del documento persistido y fuera de Project Revisions.
7. Mantener Composition/Slots/Fields/Outline/Preview públicos como única UI Puck.
8. Cubrir round-trip, nesting, selection/history, error/fail-closed y E2E browser/storage.

## Siguiente acción exacta

1. Inspeccionar el wiring actual de `PuckEditorRoot`, `puck-document-session` y `puck-document-persistence`.
2. Confirmar la firma pública de `onAction/appState/prevAppState` en la versión Puck bloqueada.
3. Implementar una única ruta de sincronización canónica detrás de `@electrocraft/editor-puck` y Studio/editor.
4. Añadir unit/contract/integration/E2E específicos M05.4.
5. Abrir PR contra `main` y usar únicamente `ElectroCraft Base CI` como gate final.
6. Registrar evidencia GREEN antes de activar M05.5.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M05_4.md → packages/editor-puck → apps/studio/src/features/editor → tooling/vitest → tooling/playwright`.
