# MEMORY — ElectroCraft Eighth Final

Product:
ElectroCraft — No-Code App Builder.

Execution:
F00 / M00.1, M00.2, M00.3 and M00.4 COMPLETADAS; M00.5 activa.

M00.1 frozen invariants:
- R001–R084 tienen owner canónico, fase y aplicabilidad.
- CMS se subordina a Datos/Pantallas/Administración; no es la raíz del producto.
- Pantallas y Navegación/Rutas tienen ownership separado.
- all nine export destinations are Core and equal-status requirements.
- Target-specific behavior remains in capabilities/adapters/compilers, never parallel canonical trees.
- executable ownership fixture: `experiments/m00-1-requirements/`.

M00.2 frozen invariants:
- 30 audited OSS decisions are frozen in `experiments/m00-2-oss-audit/engine-audit.json` and ADR-0002.
- Puck owns visual authoring; Puck AI is not ElectroCraft AI.
- shadcn/ui base = Radix explicitly even though Base UI is upstream default for new projects.
- i18next owns i18n catalogs/fallback; Spanish is mandatory fallback.
- PGlite owns embedded local Postgres runtime and official multi-tab Worker behavior; Drizzle owns typed SQL/schema/migrations.
- TanStack Query owns async cache. Refine is Administration only. TanStack Table owns table mechanics. RHF owns React form state. Zod owns schemas. RQB owns narrow condition authoring.
- Rete owns workflow graph/processing; Tiptap owns rich text; Zustand owns declared JS runtime state.
- Gemini Interactions core is GA in API `v1`; `v1beta`, preview models/agents/tools remain capability-gated. AI SDK + `@ai-sdk/google` remains the primary abstraction; `@google/genai` is narrow/capability-specific.
- AI only writes Draft; Apply remains explicit.
- Expo SQLite native lane is stable; web is alpha/capability-gated.
- dnd-kit upstream package/API transition must be pinned by the owning POC and never duplicates Puck surfaces.
- Secrets are references only; permission evaluation fails closed.

M00.3 frozen invariants:
- F00 Puck POC pins `@puckeditor/core@0.22.4`/MIT to tag `v0.22.4` for reproducible source evidence; product install must reverify the lockfile version.
- Puck owns insert/reorder/edit/Slot/history; ElectroCraft owns the canonical mapping and never a parallel visual-editor engine.
- `Container.children[]` canonical <-> Puck `children` Slot is the nesting boundary.
- Palette `Section` is `Container{semanticElement:"section"}`, not another canonical node type.
- Composition shell = Puck.Components + Puck.Outline + Puck.Preview + Puck.Fields with `onAction`.
- `onAction` rebuilds `ElectroCraftDocument` from public `newState.data`; Puck ui/index/zone/history internals cannot enter persistence.
- Exact upstream Puck blobs are SHA-verified and execute insert/reorder/replace/history including undo/redo in `experiments/m00-3-puck-composition/`.
- Full published React package mount must be smoke-tested when the Studio workspace can install packages; the F00 container had no npm-registry DNS and no mock mount was accepted.

M00.4 frozen invariants:
- Studio DB POC pins `@electric-sql/pglite@0.5.5` and `drizzle-orm@0.45.2` and executes the published packages in GitHub Actions.
- PGlite owns embedded Postgres, persistence and the official `PGliteWorker`/`worker()` multi-tab mechanism; browser storage baseline uses `idb://...`.
- Drizzle owns typed physical schema/query/migrations; ElectroCraft does not create a second DB engine.
- ElectroCraft physical public schema = exactly `projects`, `project_objects`, `project_revisions`, `content_records`, `relation_edges`, `record_field_index` for this POC contract.
- `ElectroCraftDataSchema` models/fields remain logical and live in canonical data/JSONB; adding a model/field does not create a table or `ALTER TABLE`.
- `record_field_index` only materializes declared queryable/faceted/sortable/searchable fields.
- Project Objects save incrementally by ID with deterministic checksums; unrelated object checksum remains unchanged.
- `project_objects.version` is a small object/format version; timestamps/order belong in timestamps or payload.
- Real Node PGlite/Drizzle round-trip, rollback, close/reopen and latencies are GREEN.
- Real Chromium two-tab PGlite Worker A↔B visibility + leader/follower + reopen persistence are GREEN.
- CI source of truth: run `32061372828`, head `92a1a0b7f21d4db4ebad637e11084bd80415f640`, conclusion SUCCESS; evidence in `.ai/evidence/F00/M00.4/`.

Core mental model:
Screens, Navigation, Components, Data Sources, Queries, State, Actions, Forms, Auth, Administration, Resources.

Export targets — all Core:
local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp, wordpress.

Export:
one TargetRegistry, one Capability Analyzer, one Export Target Contract.

LAMP:
Slim 4 + PSR-7 + Slim-CSRF + PDO + MySQL/MariaDB.

WordPress:
Block Theme + Companion Plugin, native WP APIs.

No optional export category.
