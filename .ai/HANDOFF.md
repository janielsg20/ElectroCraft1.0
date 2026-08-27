# HANDOFF — ElectroCraft

## Current

F05 / M05.4 — Sincronizar Puck actions con ElectroCraftDocument — `ACTIVE`.

## Heredado

- F04/M04.1–M04.8 cerró `COMPLETADA / GREEN` con persistencia, recovery, Project Home, backup/import, workspace preferences y revisiones no destructivas.
- M05.1 cerró `COMPLETADA / GREEN`; PR `#49`, Base CI `32868029914` (#656), squash `733abdc44f21d16b56b4624c7bec61f0131bd3f1`.
- M05.2 cerró `COMPLETADA / GREEN`; Base CI `32990513971` (#661), PR `#50` fusionada a `main` en `fadc2ecb64764c120c75cb5e4c7b154d3cc4ade6`.
- M05.3 cerró `COMPLETADA / GREEN`; head `176b41a31a017f800cb8f63b41be3b7e65f52324`, Base CI `33016557679` (#674), PR `#52` fusionada a `main` en `fd5901dff66acca5d92ffee832a2ac881721458b`.
- `@electrocraft/editor-puck` sigue siendo el boundary propietario; Studio no persiste internals Puck.
- Composition pública Puck ya vive dentro del AppShell; Preview mantiene aislamiento por iframe.
- Slots anidados, allow/disallow, permisos públicos y migración oficial legacy `zones -> slots` ya están cerrados.
- Editor history permanece separado de Project Revisions.
- No crear workflow dedicado M05.4; usar únicamente el Base CI transversal final.
- Blockers P0/P1 conocidos: `0`.

## Implementado en M05.4

1. `resolvePuckDocumentActionChange()` consume snapshots públicos `onAction/appState/prevAppState` y filtra acciones que no cambian `Data.content/root/zones`.
2. `createStudioPuckActionSync()` reconstruye el documento canónico solo después de cambios authoring estables y falla cerrado con error visible.
3. `loadStudioPuckEditor()` abre el documento real del proyecto y conecta la sesión Puck con `projectStorageRuntime.queueAutosave()`; reutiliza el debounce F04 de 650 ms.
4. El editor visible usa `config`, `data` y `onAction` de la sesión canónica sin perder minimizar/maximizar/colapsar paneles añadidos recientemente en `main`.
5. Empty states de Canvas/Inspector/Outline observan `Data.content` activo en vez del placeholder estructural.
6. Selección, DnD, `ui` e history Puck siguen session-only y no entran en el payload canónico ni en Project Revisions.
7. Unit/integration cubren UI-only, edit, reorder, duplicate, remove, fail-closed y payload sin internals.
8. Playwright cubre browser/storage real, dirty state, flush F04 y confirma que selección post-flush no vuelve a disparar autosave.
9. La PR draft `#55` de la rama original quedó cerrada sin merge por conflicto con mejoras recientes del editor; la implementación activa vive en `codex/m05-4-puck-action-sync-v2`, nacida del `main` actual.

## Siguiente acción exacta

1. Añadir contract test M05.4 para ownership/onAction/autosave/history.
2. Abrir PR de `codex/m05-4-puck-action-sync-v2` contra `main`.
3. Usar únicamente `ElectroCraft Base CI` como gate final.
4. Corregir solo fallos reales detectados por ese gate; no añadir workflows dedicados.
5. Registrar head/run/PR GREEN y marcar M05.4 `COMPLETADA` únicamente con evidencia.
6. Activar `M05.5 — Usar Puck visual history` solo después del merge GREEN.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M05_4.md → packages/editor-puck → apps/studio/src/features/editor → tooling/vitest → tooling/playwright`.
