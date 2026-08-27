# HANDOFF — ElectroCraft

## Current

F05 / M05.5 — Usar Puck visual history — `ACTIVE`.

## Heredado

- F04/M04.1–M04.8 cerró `COMPLETADA / GREEN` con persistencia, recovery, Project Home, backup/import, workspace preferences y revisiones no destructivas.
- M05.1 cerró `COMPLETADA / GREEN`; PR `#49`, Base CI `32868029914` (#656), squash `733abdc44f21d16b56b4624c7bec61f0131bd3f1`.
- M05.2 cerró `COMPLETADA / GREEN`; Base CI `32990513971` (#661), PR `#50` fusionada a `main` en `fadc2ecb64764c120c75cb5e4c7b154d3cc4ade6`.
- M05.3 cerró `COMPLETADA / GREEN`; head `176b41a31a017f800cb8f63b41be3b7e65f52324`, Base CI `33016557679` (#674), PR `#52` fusionada a `main` en `fd5901dff66acca5d92ffee832a2ac881721458b`.
- M05.4 cerró `COMPLETADA / GREEN`; head `a56575ab62660eb94d70ae08aaf0df6c5cd6a010`, Base CI `33035570789` (#692), PR `#56` fusionada a `main` en `98b51b7ad35b3204f0b67899b4fd2392d1c100e7`.
- `@electrocraft/editor-puck` sigue siendo el boundary propietario; Studio no persiste internals Puck.
- Composition pública Puck vive dentro del AppShell; Preview mantiene aislamiento por iframe.
- Slots anidados, allow/disallow, permisos públicos y migración oficial legacy `zones -> slots` ya están cerrados.
- `onAction(action, appState, prevAppState)` ya sincroniza cambios authoring estables a `ElectroCraftDocument` mediante el autosave F04.
- Editor history permanece separado de Project Revisions.
- No crear workflow dedicado M05.5; usar únicamente el Base CI transversal final.
- Blockers P0/P1 conocidos: `0`.

## Objetivo M05.5

1. Conectar Deshacer/Rehacer del Topbar a la history pública de Puck.
2. Mantener history Puck session-only; nunca serializarla dentro de `ElectroCraftDocument` o ProjectDefinition.
3. Sincronizar el documento canónico y marcar dirty después de undo/redo mediante el pipeline M05.4 + F04.
4. Exponer `visualHistoryLimit` en Configuración > Editor con default/rango seguros.
5. Recortar history con `setHistories`/`setHistoryIndex` públicos sin cambiar el estado visible actual.
6. Evitar mezclar stacks al cambiar de documento/sesión.
7. Probar límites, branch después de undo, edit/drag/delete, save/reopen y history limpia en sesión nueva.

## Siguiente acción exacta

1. Verificar la API pública de history disponible en la versión Puck fijada por el repo.
2. Identificar el owner actual de Topbar, settings/preferencias y lifecycle de la sesión Puck.
3. Implementar un adapter pequeño dentro de `@electrocraft/editor-puck`; no crear store/CommandBus/history paralelo.
4. Añadir unit/integration/contract/E2E proporcionales a M05.5.
5. Abrir PR contra `main` y usar únicamente `ElectroCraft Base CI` como gate final.
6. Registrar head/run/PR GREEN y marcar M05.5 `COMPLETADA` únicamente con evidencia.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M05_5.md → packages/editor-puck → apps/studio/src/features/editor → apps/studio/src/shell → tooling/vitest → tooling/playwright`.
