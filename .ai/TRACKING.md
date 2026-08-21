# TRACKING — ElectroCraft current position

Date: 2026-08-20.

| Scope              | Estado             | Evidencia                                      |
| ------------------ | ------------------ | ---------------------------------------------- |
| F00                | COMPLETADA / GREEN | `.ai/evidence/F00/`                            |
| F01                | COMPLETADA / GREEN | `.ai/evidence/F01/`                            |
| F02                | COMPLETADA / GREEN | `.ai/evidence/F02/`                            |
| F03 / M03.1–M03.12 | COMPLETADA / GREEN | `.ai/evidence/F03/CLOSURE_2026-08-20.md`       |
| F04 / M04.1        | COMPLETADA / GREEN | `.ai/evidence/F04/M04.1/CLOSURE_2026-08-20.md` |
| F04 / M04.2        | COMPLETADA / GREEN | `.ai/evidence/F04/M04.2/CLOSURE_2026-08-20.md` |
| F04 / M04.3        | COMPLETADA / GREEN | `.ai/evidence/F04/M04.3/CLOSURE_2026-08-21.md` |
| F04 / M04.4        | COMPLETADA / GREEN | `.ai/evidence/F04/M04.4/CLOSURE_2026-08-21.md` |
| F04 / M04.5        | COMPLETADA / GREEN | `.ai/evidence/F04/M04.7/CLOSURE_2026-08-21.md` |
| F04 / M04.6        | COMPLETADA / GREEN | `.ai/evidence/F04/M04.7/CLOSURE_2026-08-21.md` |
| F04 / M04.7        | COMPLETADA / GREEN | `.ai/evidence/F04/M04.7/CLOSURE_2026-08-21.md` |
| F04 / M04.8        | ACTIVE             | `.ai/microphases/M04_8.md`                     |

## Cierre M04.1

- Rama `codex/m04-1-storage-foundation`; PR `#27`.
- Source funcional validado `8fd9460a43a4a3b5eaf91e62b83f4b3cb7edf10b`.
- Informe `.ai/evidence/F04/M04.1/VALIDATION_LATEST.md`: `GREEN`.
- Browser E2E: inicialización real de storage; save mediante runtime; reload; reopen del mismo proyecto; Settings > Almacenamiento usable en móvil sin overflow.
- Owner `@electrocraft/data-web` con PGlite `0.5.5` + Drizzle `0.45.2`, Worker, schema físico versionado y migration journal.
- Schema estable: projects, project_objects, project_revisions, content_records, taxonomy_terms, record_terms, relation_edges, record_field_index, workspace_preferences, media_metadata, audit_events, storage_migration_journal.

## Cierre M04.2

- Rama `codex/m04-2-multitab-worker`; PR `#28`.
- Source funcional validado `6847a5fa410f0478c7e393b3d06800b6f89af072`.
- Workflow `M04.2 Multi-Tab Worker Gate`: run `32430992572`, job `96622322833`, `success`.
- `npm ci`, Prettier, lint, typecheck, boundaries, Vitest dedicado, full `npm run test`, full `npm run build`, Chromium y Playwright multi-tab: GREEN.
- IndexedDB es baseline persistente; OPFS AHP queda como optimización capability-aware.
- Lifecycle real: bootstrap → migrations → health-check → repositories ready.
- Dos tabs comparten una única DB lógica mediante `PGliteWorker` con el mismo `id`.
- `onLeaderChange` revalida health; el E2E cierra el líder, verifica el handoff y guarda nuevamente desde el nuevo líder.
- La identidad observable del líder se anuncia desde `worker.init(options)`, ejecutado por PGlite únicamente en el Worker elegido como líder; PGlite/Web Locks conserva ownership de la elección.
- UI/application no importan PGlite/Drizzle raw.
- Blockers P0/P1 al cierre: `0`.

## Cierre M04.3

- Source funcional `987f4c333f6e8b4c48d7ebad9c284e3925e9cf02`.
- Dirty-set con debounce configurable, checksum canónico y reintento sin pérdida tras commit fallido.
- PGlite/Drizzle upsert/delete únicamente objetos afectados; no crea revisión por autosave.
- Checkpoints manual/pre-import/pre-migration/pre-publish/pre-export/interval y restauración explícita de la última revisión válida.
- Configuración > Almacenamiento expone integridad y recovery en español; screenshot browser versionado.
- Dedicado: 17/17; full Vitest: 82 archivos/300 tests; lint/typecheck/boundaries/test/build y Playwright Chromium 1/1 `GREEN`.
- Evidencia: `.ai/evidence/F04/M04.3/VALIDATION_LATEST.md` y `.ai/evidence/F04/M04.3/CLOSURE_2026-08-21.md`.
- Blockers P0/P1: `0`.

## Próxima microfase exacta

`M04.6 — Import/Backup/Restore`.
