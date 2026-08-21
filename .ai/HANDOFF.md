# HANDOFF — ElectroCraft

## Current

F04 / M04.6 — Import/Backup/Restore — `ACTIVE`.

## Heredado

- F03/M03.12 cerró GREEN en head `af88c60264a243d97cd8e5ca708eedc8ded04028`.
- M04.1 cerró `COMPLETADA / GREEN` con source funcional validado `8fd9460a43a4a3b5eaf91e62b83f4b3cb7edf10b`.
- M04.2 cerró `COMPLETADA / GREEN` con source funcional `6847a5fa410f0478c7e393b3d06800b6f89af072`; workflow run `32430992572`, job `96622322833`, `success`.
- M04.3 cerró `COMPLETADA / GREEN` con source funcional `987f4c333f6e8b4c48d7ebad9c284e3925e9cf02` y evidencia `.ai/evidence/F04/M04.3/`.
- Evidencia M04.2: `.ai/evidence/F04/M04.2/VALIDATION_LATEST.md` + `.ai/evidence/F04/M04.2/CLOSURE_2026-08-20.md`.
- `@electrocraft/data-web` mantiene PGlite `0.5.5` + Drizzle `0.45.2`, IndexedDB baseline, OPFS AHP opt-in, multi-tab Worker oficial, migrations/health fail-closed y leader handoff validado en Chromium.
- PGlite conserva ownership de la elección; ElectroCraft solo publica una identidad observable del Worker líder desde `worker.init(options)` para evitar una carrera detectada en `PGliteWorker.isLeader`.
- Monorepo actual: 19 owner packages, 21 aliases, 2 apps.
- Blockers P0/P1 conocidos: `0`.

## Siguiente acción exacta

1. Releer `.ai/microphases/M04_6.md` y mantener PGlite/Drizzle como único owner de persistencia.
2. Cambiar primero repository/service contract para listar, buscar, ordenar, abrir y cambiar estado de proyectos.
3. Añadir la migration mínima para Archive/Trash en `projects`, sin crear un modelo paralelo.
4. Construir la pantalla raíz `Proyectos` cuando no existe proyecto abierto, con toolbar 44px y CTA `Nuevo proyecto`.
5. Renderizar grid/list desde la DB real con empty/loading/error states honestos.
6. Abrir un proyecto cargando sus objetos committed y conservar recovery M04.3.
7. Añadir unit/contract/integration/negative/round-trip/E2E responsive y gates completos.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M04_6.md → packages/data-web → packages/application/src/projects → apps/studio/src/features/projects → tooling/package-boundaries.json`.
