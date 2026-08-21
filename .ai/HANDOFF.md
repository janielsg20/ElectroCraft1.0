# HANDOFF — ElectroCraft

## Current
F04 / M04.3 — Persistencia incremental, autosave y recovery — `ACTIVE`.

## Heredado
- F03/M03.12 cerró GREEN en head `af88c60264a243d97cd8e5ca708eedc8ded04028`.
- M04.1 cerró `COMPLETADA / GREEN` con source funcional validado `8fd9460a43a4a3b5eaf91e62b83f4b3cb7edf10b`.
- M04.2 cerró `COMPLETADA / GREEN` con source funcional `6847a5fa410f0478c7e393b3d06800b6f89af072`; workflow run `32430992572`, job `96622322833`, `success`.
- Evidencia M04.2: `.ai/evidence/F04/M04.2/VALIDATION_LATEST.md` + `.ai/evidence/F04/M04.2/CLOSURE_2026-08-20.md`.
- `@electrocraft/data-web` mantiene PGlite `0.5.5` + Drizzle `0.45.2`, IndexedDB baseline, OPFS AHP opt-in, multi-tab Worker oficial, migrations/health fail-closed y leader handoff validado en Chromium.
- PGlite conserva ownership de la elección; ElectroCraft solo publica una identidad observable del Worker líder desde `worker.init(options)` para evitar una carrera detectada en `PGliteWorker.isLeader`.
- Monorepo actual: 19 owner packages, 21 aliases, 2 apps.
- Blockers P0/P1 conocidos: `0`.

## Siguiente acción exacta
1. Releer `.ai/microphases/M04_3.md` y mantener PGlite/Drizzle como único engine de persistencia.
2. Cambiar primero repository/service contract para soportar dirty objects, deletes incrementales, checkpoints y recovery.
3. Mantener un dirty-set canónico y aplicar debounce/idle configurable antes de escribir.
4. En cada autosave, validar checksum y hacer upsert/delete solo de object IDs afectados dentro de una única transacción.
5. Mantener `currentRevisionBase` como checkpoint base; autosave incremental no crea una revisión completa por acción.
6. Crear checkpoints restaurables manuales, pre-import, pre-migration, pre-publish, pre-export y por intervalo grueso configurable.
7. Si integrity falla, localizar la revisión restaurable válida más reciente y ofrecer restore explícito; no ocultar corrupción.
8. Conectar productores estables de Puck/Rete/Settings al runtime incremental sin persistir histories de sesión.
9. Añadir unit/contract/integration/negative/round-trip/E2E y verificar que un cambio aislado no reescribe objetos no dirty.
10. Validar format, lint, typecheck, boundaries, full tests, build y E2E específico antes de cerrar M04.3.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M04_3.md → packages/data-web → packages/application/src/projects → apps/studio/src/features/projects → tooling/package-boundaries.json`.
