# TRACKING — ElectroCraft current position

Date: 2026-08-20.

| Scope | Estado | Evidencia |
|---|---|---|
| F00 | COMPLETADA / GREEN | `.ai/evidence/F00/` |
| F01 | COMPLETADA / GREEN | `.ai/evidence/F01/` |
| F02 | COMPLETADA / GREEN | `.ai/evidence/F02/` |
| F03 / M03.1–M03.12 | COMPLETADA / GREEN | `.ai/evidence/F03/CLOSURE_2026-08-20.md` |
| F04 / M04.1 | COMPLETADA / GREEN | `.ai/evidence/F04/M04.1/CLOSURE_2026-08-20.md` |
| F04 / M04.2 | ACTIVE | `.ai/microphases/M04_2.md` |

## Cierre M04.1
- Rama `codex/m04-1-storage-foundation`; PR `#27`.
- Source funcional validado `8fd9460a43a4a3b5eaf91e62b83f4b3cb7edf10b`.
- Informe `.ai/evidence/F04/M04.1/VALIDATION_LATEST.md`: `GREEN`.
- `npm ci`, Prettier, lint, typecheck, boundaries, Vitest dedicado, full `npm run test`, full `npm run build`, instalación Chromium y smoke browser: exit code `0`.
- Browser E2E: inicialización real de storage; save mediante runtime; reload; reopen del mismo proyecto; Settings > Almacenamiento usable en móvil sin overflow.
- Owner `@electrocraft/data-web` con PGlite `0.5.5` + Drizzle `0.45.2`, Worker, schema físico versionado y migration journal.
- Backend persistente capability-aware: OPFS AHP cuando funciona/está soportado; fallback visible a IndexedDB; no existe degradación volátil silenciosa.
- Schema estable: projects, project_objects, project_revisions, content_records, taxonomy_terms, record_terms, relation_edges, record_field_index, workspace_preferences, media_metadata, audit_events, storage_migration_journal.
- Save/reopen/checksum/integrity/rollback/repair cubiertos por tests reales.
- Monorepo: 19 owner packages, 21 aliases, 2 apps.
- Blockers P0/P1 al cierre: `0`.

## Entrada M04.2
- Usar el Worker multi-tab oficial de PGlite con una sola DB lógica del Studio.
- Baseline compatible: `idb://...`; OPFS AHP permanece optimización capability-aware, no default universal.
- Lifecycle requerido: bootstrap → migrations → health check → repositories ready.
- Escuchar leader change y revalidar health/query invalidation sin abrir otra DB.
- Probar dos tabs/worker clients escribiendo/leyendo el mismo proyecto y handoff del leader.
- Mantener Drizzle/PGlite detrás de ports/adapters; UI nunca recibe client raw.
- Reutilizar schema/repository de M04.1; no crear un subsystem paralelo.
- Añadir integration fixture de migrations y persistence/reopen/recovery.

## Próxima microfase exacta
`M04.2 — Inicializar PGlite Multi-Tab Worker y migrations`.
