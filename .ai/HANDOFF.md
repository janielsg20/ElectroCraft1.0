# HANDOFF — ElectroCraft

## Current

F05 / M05.7 — Extensiones de palette y outline solo necesarias — `ACTIVE`.

## Heredado

- F04/M04.1–M04.8 cerró `COMPLETADA / GREEN` con persistencia, recovery, Project Home, backup/import, workspace preferences y revisiones no destructivas.
- M05.1 cerró `COMPLETADA / GREEN`; PR `#49`, Base CI `32868029914` (#656), squash `733abdc44f21d16b56b4624c7bec61f0131bd3f1`.
- M05.2 cerró `COMPLETADA / GREEN`; Base CI `32990513971` (#661), PR `#50` fusionada a `main` en `fadc2ecb64764c120c75cb5e4c7b154d3cc4ade6`.
- M05.3 cerró `COMPLETADA / GREEN`; head `176b41a31a017f800cb8f63b41be3b7e65f52324`, Base CI `33016557679` (#674), PR `#52` fusionada a `main` en `fd5901dff66acca5d92ffee832a2ac881721458b`.
- M05.4 cerró `COMPLETADA / GREEN`; head `a56575ab62660eb94d70ae08aaf0df6c5cd6a010`, Base CI `33035570789` (#692), PR `#56` fusionada a `main` en `98b51b7ad35b3204f0b67899b4fd2392d1c100e7`.
- M05.5 cerró `COMPLETADA / GREEN`; head `9d61c1e3f9976893594b518e952320e723b59f81`, Base CI `33081006606` (#702), PR `#57` fusionada a `main` en `7aeaf701b077781f5b6ca0d659be2726dec7412b`.
- M05.6 cerró `COMPLETADA / GREEN`; head `96145da4e74d856c1368f9a0418379acfcff0b2a`, Base CI `33086731332` (#707), PR `#58` fusionada a `main` en `459d07d73f08fb8b2a826f54787124011f7c7ca8`.
- `@electrocraft/editor-puck` sigue siendo el boundary propietario; Studio no persiste internals Puck/Tiptap.
- Composition pública Puck vive dentro del AppShell; Preview mantiene aislamiento por iframe.
- Slots anidados, allow/disallow, permisos públicos, migration `zones -> slots`, onAction sync, visual history e inline editing ya están cerrados.
- No crear workflow dedicado M05.7; usar únicamente el Base CI transversal final.
- Blockers P0/P1 conocidos: `0`.

## Objetivo M05.7

1. Mantener `Puck.Components` como owner de la lista draggable y usar `Config.categories` público para agrupar definiciones canónicas.
2. Conservar búsqueda, categorías, favoritos y recientes como capas de descubrimiento Electro alrededor de Puck; nunca duplicar ComponentDefinitions.
3. Mantener favoritos/recientes como preferencia workspace/user y fuera de `ElectroCraftDocument`.
4. Probar un modo `puck-base` donde desactivar extensiones Electro deja `Puck.Components` funcional.
5. Mantener `Puck.Outline` directo; no usar overrides/plugins experimentales para funciones release-critical.
6. Traducir lock a permisos públicos `edit/drag/delete/duplicate`; no inventar hidden/visibility sin owner canónico.
7. Mantener diagnóstico recuperable fuera de la lista insertable.
8. Probar categorías, lock, fallback base, búsqueda/preferencias y ausencia de internals en canonical data.

## Siguiente acción exacta

1. Revisar el diff de `codex/m05-7-palette-outline-extensions` contra `main`.
2. Corregir cualquier riesgo de tipo/formato antes de abrir PR.
3. Abrir una única PR contra `main` y usar únicamente `ElectroCraft Base CI`.
4. Corregir fallos reales en la misma rama, sin workflows ni PRs paralelas.
5. Con head exacto GREEN, fusionar M05.7 y activar `M05.8 — Editor core E2E`.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M05_7.md → packages/editor-puck → apps/studio/src/features/editor → apps/studio/src/shell/palette-* → tooling/vitest → tooling/playwright`.
