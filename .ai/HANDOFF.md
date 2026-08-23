# HANDOFF — ElectroCraft

## Current

F04 / M04.7 — Workspace preferences — `ACTIVE`.

## Heredado

- F03/M03.12 cerró GREEN en head `af88c60264a243d97cd8e5ca708eedc8ded04028`.
- M04.1 cerró `COMPLETADA / GREEN` con source funcional validado `8fd9460a43a4a3b5eaf91e62b83f4b3cb7edf10b`.
- M04.2 cerró `COMPLETADA / GREEN` con source funcional `6847a5fa410f0478c7e393b3d06800b6f89af072`; workflow run `32430992572`, job `96622322833`, `success`.
- M04.3 cerró `COMPLETADA / GREEN` con source funcional `987f4c333f6e8b4c48d7ebad9c284e3925e9cf02` y evidencia `.ai/evidence/F04/M04.3/`.
- M04.6 cerró `COMPLETADA / GREEN` con source funcional `7378b0d69ded493ee8fd6a1cc3b245e2f485ee52`, gate `32619053208` success y Base CI `32619053241` success; PR `#45` fusionada a `main`.
- Evidencia M04.6: `.ai/evidence/F04/M04.6/CLOSURE_2026-08-23.md`.
- `@electrocraft/data-web` mantiene PGlite `0.5.5` + Drizzle `0.45.2`, IndexedDB baseline, OPFS AHP opt-in, multi-tab Worker oficial, migrations/health fail-closed y leader handoff validado en Chromium.
- `workspace_preferences` ya existe en el schema físico con PK `(workspace_id, key)` y `jsonb` para `value`; M04.7 debe reutilizarlo, no introducir localStorage o una segunda persistencia.
- Blockers P0/P1: `0`.

## Siguiente acción exacta

1. Definir primero el contract repository/service de Workspace preferences en `packages/application/src/projects/`.
2. Añadir lectura/escritura/borrado tipado sobre `workspace_preferences` en `packages/data-web/` con transacción Drizzle/PGlite.
3. Modelar defaults y clamps: Sidebar 240/64, Topbar 52, Context 288, Inspector 320, Status 26; side `left|right`, display `icons|text|icons+text`.
4. Persistir group order, visible panels, last tabs/document y saved layouts sin mutar contenido canónico del proyecto.
5. Sincronizar cambios entre tabs mediante storage/event layer.
6. Conectar `Configuración > Espacio de trabajo` con guardar/renombrar/aplicar/eliminar layout y restaurar default.
7. Añadir integración PGlite real, negative tests, reopen/round-trip, clamp móvil y E2E responsive.
8. Ejecutar gate dedicado + Base CI; no declarar M04.7 `COMPLETADA` sin evidencia.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M04_7.md → packages/data-web → packages/application/src/projects → apps/studio/src/features/projects → apps/studio/src/help/help-registry.ts → tooling/package-boundaries.json`.
