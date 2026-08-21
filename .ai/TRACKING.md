# TRACKING — ElectroCraft current position

Date: 2026-08-20.

| Scope | Estado | Evidencia |
|---|---|---|
| F00 | COMPLETADA / GREEN | `.ai/evidence/F00/` |
| F01 | COMPLETADA / GREEN | `.ai/evidence/F01/` |
| F02 | COMPLETADA / GREEN | `.ai/evidence/F02/` |
| F03 / M03.1–M03.12 | COMPLETADA / GREEN | `.ai/evidence/F03/CLOSURE_2026-08-20.md` |
| F04 / M04.1 | COMPLETADA / GREEN | `.ai/evidence/F04/M04.1/CLOSURE_2026-08-20.md` |
| F04 / M04.2 | COMPLETADA / GREEN | `.ai/evidence/F04/M04.2/CLOSURE_2026-08-20.md` |
| F04 / M04.3 | ACTIVE | `.ai/microphases/M04_3.md` |

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

## Entrada M04.3
- Persistir incrementalmente por `project_object`; no crear una revisión/snapshot completo por cada acción.
- Mantener dirty-set de object IDs canónicos; debounce/idle configurable y checksum antes de persistir.
- Una transacción debe upsert/delete únicamente objetos afectados y actualizar `projects.updatedAt/currentRevisionBase` sin reescribir objetos no modificados.
- `Guardado` solo después del commit.
- Crear checkpoints restaurables antes de import/migration destructiva, publish/export, manualmente y por intervalo grueso configurable.
- Recovery normal abre los últimos `project_objects` committed; si integrity falla debe exponer la última revisión válida restaurable.
- Histories Puck/Rete permanecen session-local; no se serializan como history persistente.
- Reutilizar PGlite/Drizzle + migration journal existente; no crear un segundo storage engine.
- Añadir unit/contract/integration/round-trip/negative/E2E y gates completos.

## Próxima microfase exacta
`M04.3 — Persistencia incremental, autosave y recovery`.
