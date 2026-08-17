# HANDOFF — Eighth Final

Current:
F00 / M00.5 / EN_CURSO.

Completed:
- M00.1 GREEN — capability/ownership map.
- M00.2 GREEN — OSS responsibility/API/license/target audit.
- M00.3 GREEN — Puck Composition ownership/adapter POC with exact-source mechanics/history, Slot mapping and canonical onAction sync.
- M00.4 GREEN — PGlite 0.5.5 + Drizzle 0.45.2 Studio DB POC with six generic tables, real persistence and real Chromium two-tab Worker evidence.

Read:
AGENTS -> RULES -> MEMORY -> STATE -> TRACKING -> `.ai/microphases/M00_5.md` -> React Query Builder/query portability official APIs.

Next:
Execute M00.5 — POC Query portable exactly. Reuse the frozen M00.4 `content_records` + `record_field_index` model. Prove nested AND/OR, indexed-vs-JSON extraction, parameter separation, unsupported-rule blocker, facets and output-shape portability without creating another query/persistence engine.

Carry-forward M00.4 invariants:
- PGlite owns embedded Postgres/persistence/multi-tab Worker; Drizzle owns schema/query/migrations.
- Physical ElectroCraft DB remains six generic tables; no table-per-model/field.
- Logical schema evolution does not imply `ALTER TABLE`.
- `project_objects.version` is format/object version, not wall-clock time.
- CI closure source of truth: GitHub Actions run `32061372828`, SUCCESS.

Carry-forward M00.3 install note:
The F00 container could not resolve npm registry, so the first Studio workspace that installs `@puckeditor/core` must smoke-mount the published Composition package. Do not replace Puck with a mock/parallel editor.

Do not begin M00.6 until M00.5 is green. Do not begin F01 until all F00 POCs and ADR closure are green.
