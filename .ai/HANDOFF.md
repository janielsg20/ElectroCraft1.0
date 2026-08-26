# HANDOFF — ElectroCraft

## Current

F05 / M05.2 — Componer Components/Outline/Preview/Fields — `ACTIVE`.

## Heredado

- F03/M03.12 cerró `COMPLETADA / GREEN` y habilitó F04.
- F04/M04.1–M04.8 cerró `COMPLETADA / GREEN` con PGlite/Drizzle multi-tab, autosave/recovery, Project Home, wizard/actions, backup/import, workspace preferences y revisiones no destructivas.
- M04.8 cerró en head funcional `1df11b22fcd3bee7ea37846a459e28374271fc85`; Base CI `32859794266` success; PR `#48` fusionada a `main` en `ad64c0e5468b13a3fa3a712adb6621fa33d22fd0`.
- M05.1 cerró `COMPLETADA / GREEN` en head `9aa330dbf44b39485516ee0d3dc181a9aee4196b`; Base CI `32868029914` (#656) success; PR `#49` fusionada mediante squash a `main` en `733abdc44f21d16b56b4624c7bec61f0131bd3f1`.
- `@electrocraft/editor-puck` es el boundary propietario de Puck; `apps/studio` no importa `@puckeditor/core` para lógica del adapter.
- M05.1 dejó projection canónica `ElectroCraftDocument <-> Puck Data`, IDs/nesting preservados, diagnostics visibles, `zones` legacy fail-closed y autosave canónico sin persistir internals del engine.
- Editor history permanece separado de Project Revisions.
- Geometría Studio vigente: Sidebar `240/64`, Topbar `52`, Context `288`, Inspector `320`, Status `26`.
- No crear gates por microfase salvo necesidad excepcional. Reutilizar únicamente Base CI para validación final.
- Blockers P0/P1: `0`.

## Siguiente acción exacta

1. Mantener `Puck.Components`, `Puck.Outline`, `Puck.Preview` y `Puck.Fields` como superficies Composition públicas; no recrearlas.
2. Mantener Palette ElectroCraft como UX de descubrimiento, pero resolver click-to-insert desde el `Config` activo de Puck, no desde un registro paralelo.
3. Mapear tokens del Studio a variables oficiales `--puck-*` sin usar `overrides` experimentales para styling básico.
4. Mantener `Puck.Preview` en iframe con `syncHostStyles: false` para aislar el tema del frontend del tema del Studio.
5. Conservar `enabled`/`waitForStyles` del iframe para las interaction styles de Puck.
6. No instalar Puck AI ni depender de Puck Cloud/API keys.
7. Mantener teclado, focus-visible, Sheets responsive y alternativa de click a DnD.
8. Cubrir contract/unit, Composition real y Playwright de aislamiento/teclado.
9. Abrir PR solo cuando el conjunto M05.2 esté preparado y ejecutar un único Base CI final.
10. Registrar evidencia GREEN antes de marcar M05.2 `COMPLETADA`; después activar M05.3.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M05_2.md → packages/editor-puck → apps/studio/src/features/editor → apps/studio/src/shell/editor-workspace.tsx → apps/studio/src/shell/palette-panel.tsx → tooling/vitest → tooling/playwright`.
