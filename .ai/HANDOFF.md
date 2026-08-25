# HANDOFF — ElectroCraft

## Current

F04 / M04.8 — Construir Project Revision Checkpoints y Restore — `ACTIVE`.

## Heredado

- F03/M03.12 cerró GREEN en head `af88c60264a243d97cd8e5ca708eedc8ded04028`.
- M04.1 cerró `COMPLETADA / GREEN` con source funcional validado `8fd9460a43a4a3b5eaf91e62b83f4b3cb7edf10b`.
- M04.2 cerró `COMPLETADA / GREEN` con source funcional `6847a5fa410f0478c7e393b3d06800b6f89af072`; workflow run `32430992572`, job `96622322833`, `success`.
- M04.3 cerró `COMPLETADA / GREEN` con source funcional `987f4c333f6e8b4c48d7ebad9c284e3925e9cf02` y evidencia `.ai/evidence/F04/M04.3/`.
- M04.6 cerró `COMPLETADA / GREEN` con source funcional `7378b0d69ded493ee8fd6a1cc3b245e2f485ee52`, gate `32619053208` success y Base CI `32619053241` success; PR `#45` fusionada a `main`.
- M04.7 cerró `COMPLETADA / GREEN` con source funcional `aa39665f8f395087755a068dd52b0eed6a4b2b1e`, gate `32811032183` success y Base CI `32811032115` success; PR `#46` fusionada a `main` en `b51242b889343daa7e86db7d9f167586abec1522`.
- Evidencia M04.7: `.ai/evidence/F04/M04.7/CLOSURE_2026-08-25.md`.
- `@electrocraft/data-web` mantiene PGlite `0.5.5` + Drizzle `0.45.2`, IndexedDB baseline, OPFS AHP opt-in, multi-tab Worker oficial, migrations/health fail-closed y leader handoff validado en Chromium.
- `workspace_preferences` reutiliza el mismo PGlite multi-tab Worker; no usa localStorage ni una segunda persistencia.
- Geometría Studio vigente: Sidebar `240/64`, Topbar `52`, Context `288`, Inspector `320`, Status `26`.
- Blockers P0/P1: `0`.

## Siguiente acción exacta

1. Evolucionar primero el repository/service contract de revisiones en `packages/application/src/projects/` y `packages/data-web/`; no crear un subsistema paralelo.
2. Definir manifest de revisión con `projectId`, `revisionId`, timestamp, reason, actor/source y refs por `objectId + checksum/version`.
3. Introducir object-version storage deduplicado para que una revisión no duplique payload cuando el checksum ya existe.
4. Mantener checkpoints manuales, pre-import, pre-migration, publish/export release e intervalo automático grueso.
5. Restaurar una revisión creando primero una nueva versión actual/checkpoint de seguridad; nunca borrar historial previo.
6. Conectar `Proyectos > abrir proyecto > Historial de versiones` y acceso desde save/status, con panel 300px + diff summary y confirmación destructiva.
7. Mantener Undo de sesión independiente de revisions; histories internos de Puck/Rete no forman parte del historial del proyecto.
8. Añadir unit/contract, integración PGlite real, negative/failure, round-trip y E2E restore/reopen.
9. Ejecutar gate dedicado M04.8 + Base CI y registrar evidencia antes de declarar la microfase completa.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M04_8.md → packages/data-web → packages/application/src/projects → apps/studio/src/features/projects → apps/studio/src/help/help-registry.ts → tooling/package-boundaries.json`.
