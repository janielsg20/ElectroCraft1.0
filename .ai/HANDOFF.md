# HANDOFF — ElectroCraft

## Current

F05 / M05.1 — Crear PuckAdapter y component mapping — `ACTIVE`.

## Heredado

- F03/M03.12 cerró `COMPLETADA / GREEN` y habilitó F04.
- F04/M04.1–M04.7 cerraron `COMPLETADAS / GREEN` con PGlite/Drizzle multi-tab, autosave/recovery, Project Home, wizard/actions, backup/import y workspace preferences.
- M04.8 cerró `COMPLETADA / GREEN` en head funcional `1df11b22fcd3bee7ea37846a459e28374271fc85`; Base CI `32859794266` success; PR `#48` fusionada a `main` mediante squash en `ad64c0e5468b13a3fa3a712adb6621fa33d22fd0`.
- F04 queda `COMPLETADA / GREEN` con schema v5, `project_object_versions` deduplicado, checkpoints tipados, restore no destructivo y historial visible.
- Recovery/autosave heredado M04.3 usa el nuevo servicio de revisiones en Studio y conserva compatibilidad.
- El workflow dedicado M04.7 queda archivado; no crear gates por microfase salvo necesidad excepcional. Reutilizar Base CI para validación final.
- `@electrocraft/editor-puck` es el boundary propietario de Puck; `apps/studio` no debe importar `@puckeditor/core` directamente para lógica del adapter.
- Geometría Studio vigente: Sidebar `240/64`, Topbar `52`, Context `288`, Inspector `320`, Status `26`.
- Blockers P0/P1: `0`.

## Siguiente acción exacta

1. Terminar `PuckAdapter` en `packages/editor-puck/` y mantener todos los imports del engine detrás de ese owner.
2. Mapear ComponentDefinitions canónicos a `Config`/Fields/Slots públicos de Puck.
3. Tratar `ElectroCraftDocument.root` (`core.root`) como envelope canónico; proyectar sus hijos a `Puck Data.content` y reconstruir el root sin pérdida.
4. Preservar IDs estables y nesting; `Container.children` usa Slot público.
5. Unknown/unsupported component debe producir diagnostic visible y recuperable, no pérdida silenciosa.
6. Rechazar `zones` legacy con contenido en vez de persistir internals de Puck.
7. Mantener Studio detrás de `@electrocraft/editor-puck`; no recrear Composition/Fields/Outline/Preview del engine.
8. Mantener editor history separado de Project Revisions.
9. Cubrir unit/contract, integración con Puck real y Playwright browser round-trip.
10. Ejecutar un único Base CI final sobre el PR de M05.1 y registrar evidencia antes de marcarla `COMPLETADA`.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M05_1.md → packages/editor-puck → packages/domain/src/contracts/document.ts → apps/studio/src/features/editor → tooling/vitest → tooling/playwright`.
