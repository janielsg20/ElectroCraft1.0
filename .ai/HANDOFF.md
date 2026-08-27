# HANDOFF — ElectroCraft

## Current

F05 / M05.6 — Text/RichText inline editing — `ACTIVE`.

## Heredado

- F04/M04.1–M04.8 cerró `COMPLETADA / GREEN` con persistencia, recovery, Project Home, backup/import, workspace preferences y revisiones no destructivas.
- M05.1 cerró `COMPLETADA / GREEN`; PR `#49`, Base CI `32868029914` (#656), squash `733abdc44f21d16b56b4624c7bec61f0131bd3f1`.
- M05.2 cerró `COMPLETADA / GREEN`; Base CI `32990513971` (#661), PR `#50` fusionada a `main` en `fadc2ecb64764c120c75cb5e4c7b154d3cc4ade6`.
- M05.3 cerró `COMPLETADA / GREEN`; head `176b41a31a017f800cb8f63b41be3b7e65f52324`, Base CI `33016557679` (#674), PR `#52` fusionada a `main` en `fd5901dff66acca5d92ffee832a2ac881721458b`.
- M05.4 cerró `COMPLETADA / GREEN`; head `a56575ab62660eb94d70ae08aaf0df6c5cd6a010`, Base CI `33035570789` (#692), PR `#56` fusionada a `main` en `98b51b7ad35b3204f0b67899b4fd2392d1c100e7`.
- M05.5 cerró `COMPLETADA / GREEN`; head `9d61c1e3f9976893594b518e952320e723b59f81`, Base CI `33081006606` (#702), PR `#57` fusionada a `main` en `7aeaf701b077781f5b6ca0d659be2726dec7412b`.
- `@electrocraft/editor-puck` sigue siendo el boundary propietario; Studio no persiste internals Puck.
- Composition pública Puck vive dentro del AppShell; Preview mantiene aislamiento por iframe.
- Slots anidados, allow/disallow, permisos públicos y migración oficial legacy `zones -> slots` ya están cerrados.
- `onAction(action, appState, prevAppState)` sincroniza cambios authoring estables a `ElectroCraftDocument` mediante el autosave F04.
- Deshacer/Rehacer usa exclusivamente history pública Puck y permanece separado de Project Revisions.
- No crear workflow dedicado M05.6; usar únicamente el Base CI transversal final.
- Blockers P0/P1 conocidos: `0`.

## Objetivo M05.6

1. Activar `contentEditable` público Puck para los campos canónicos de `Text`; Heading/Párrafo heredan por resolver al mismo componentRef.
2. Activar `richtext + contentEditable` público Puck para `RichText`, manteniendo Tiptap como único engine richtext.
3. Mantener el valor RichText como string HTML canónico; no persistir documentos Tiptap, selection, UI o history del engine.
4. Reutilizar el pipeline M05.4 + F04 para persistir cambios inline y la history M05.5 para undo/redo.
5. No interceptar shortcuts de edición desde el shell mientras el foco esté en contentEditable.
6. Mantener focus-visible sutil y reduced-motion en el Canvas sin construir toolbar propia; el menú contextual pertenece al campo RichText de Puck.
7. Probar mapping, round-trip, configuración inválida, render seguro, browser persistence, responsive e aislamiento de internals.

## Siguiente acción exacta

1. Revisar el diff de `codex/m05-6-inline-richtext` contra `main`.
2. Abrir una única PR contra `main` cuando unit/contract/integration/Playwright y documentación estén listos.
3. Usar únicamente `ElectroCraft Base CI` como gate transversal final.
4. Corregir fallos reales en la misma rama sin crear workflows o PRs paralelas.
5. Con head exacto GREEN, fusionar M05.6 y después activar `M05.7 — Extensiones de palette y outline solo necesarias`.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M05_6.md → packages/editor-puck → apps/studio/src/features/editor → apps/studio/src/shell → tooling/vitest → tooling/playwright`.
