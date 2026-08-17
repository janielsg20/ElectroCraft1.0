# MEMORY — ElectroCraft Eighth Final

Product:
ElectroCraft — No-Code App Builder.

Execution:
F00 / M00.1, M00.2, M00.3, M00.4, M00.5, M00.6 and M00.7 COMPLETADAS; M00.8 activa.

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
- Secrets are refs only; permission evaluation fails closed.

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

M00.5 frozen invariants:
- Query POC pins `@react-querybuilder/core@8.23.0` and reuses `@electric-sql/pglite@0.5.5`; `package-lock.json` + `npm ci` are the reproducible install gate.
- `ElectroCraftQueryDefinition` v1 wraps only canonical RQB-compatible condition data and never persists engine classes/internal state.
- RQB owns nested boolean tree, operator formatting and bind-value parameterization.
- ElectroCraft owns fail-closed model/field/operator/valueSource policy, canonical field binding, index-vs-JSON physical mapping and source/result normalization.
- Unsupported semantics must become blockers; never fallback true/no-op.
- User values remain `$n` bind parameters and never enter SQL text.
- Indexed/faceted fields map to `record_field_index`; unindexed fields use typed JSONB extraction.
- Facet count, normalized multi-source output and Project Object close/reopen/re-execute are GREEN.
- Final CI source of truth: run `32063065255`, job `95488578412`, head `2315f0f2f6d26c3ef45d22d5fd0914d8e26b0503`, conclusion SUCCESS; artifact `9298848789`.

M00.6 frozen invariants:
- `ElectroCraftActionGraph` v1 is the only persisted workflow definition; Rete classes, generated IDs and history never enter canonical persistence.
- Rete owns node/connection mechanics; `rete-engine` owns ControlFlow/Dataflow; `rete-history-plugin` owns history node/connection undo/redo.
- Runtime pins are `rete@2.0.6`, `rete-engine@2.1.1`, `rete-area-plugin@2.3.2`, `rete-history-plugin@2.1.1`, with `@babel/runtime@7.29.7` override and committed lockfile.
- Unknown node kinds/operators/operations, unsafe data paths and invalid references fail closed.
- True branch Trigger -> Condition -> Data -> Toast and false/no-side-effect branch are GREEN on real published Rete packages.
- History node + connection undo/redo is GREEN on the real published package.
- `rete-history-plugin@2.2.0` is not used: CI exposed its published CommonJS dependency on missing `rete-comment-plugin`; pinning 2.1.1 preserves the required API without adding an unrelated engine.
- Final reproducibility CI source of truth: run `32069657914`, job `95509740663`, head `917ed319f1c5c0af1bc7f4b068b2693dbe9d5ebc`, conclusion SUCCESS; artifact `9301226707`.

M00.7 frozen invariants:
- Native runtime baseline is Expo/React Native with stable Expo Router Stack and standard JS Tabs test group; no `unstable-native-tabs` and no DOM renderer/table.
- Expo SQLite owns local native SQLite; Drizzle owns typed schema/query; Zustand owns declared JS runtime state/persist; Refine Core remains headless administration/data-hook orchestration.
- Native physical POC uses generic `content_records`, `relation_edges`, `record_field_index` tables and a canonical `Container/Text/Button/List` renderer mapping.
- Baseline native config contains no CAMERA or RECORD_AUDIO; capability fixture adds only requested camera capability.
- Guarded unauthenticated deep link fails closed to signin.
- Zustand `expo-sqlite/kv-store` hydration must be manual: `skipHydration:true`, followed by `rehydrate()` only after `ensureNativeSchema()`. This avoids a real parallel directory-creation race observed on Android.
- Published lockfile graph, strict TS, 13/13 tests, Android+iOS target exports, Android prebuild pruning and x86_64 release APK are GREEN.
- Real KVM Android runtime is GREEN: UI `M00.7 runtime OK`, SQLite/Drizzle/DataProvider/Zustand persistence all true, recordCount=1, guarded deep link -> `Inicio de sesión requerido`.
- Final CI source of truth: run `32078336103`, source/build job `95536145137`, Android job `95536362004`, head `c6e05a475fa0df7fd7ba2a8138e1392bcf6df797`, conclusion SUCCESS.
- Final artifacts: Android `9304563117`; source/build `9304237635`.

M00.8 active decisions under test:
- Primary provider/orchestration stack = AI SDK Core + `@ai-sdk/google` + Zod.
- Candidate pins: `ai@7.0.48`, `@ai-sdk/google@4.0.31`, `@google/genai@2.15.0`, `zod@4.4.3`, TypeScript `6.0.3`.
- Direct `@google/genai` is limited to one stable Gemini Interactions `v1` capability probe and cannot duplicate structured output/tools/streaming/image orchestration owned by AI SDK.
- Canonical project data persists logical profiles only (`Automático`, `Rápido`, `Calidad`, `Imagen`); resolved model IDs are runtime/session metadata.
- Gemini/provider secret is server-side gateway only; client contract never contains provider packages or credential fields.
- Model tools are read/draft/validate only; Apply, DB/SQL, arbitrary code, filesystem, install, deploy and secret access remain forbidden/fail-closed.
- M00.8 cannot close until published-package type/tests/build/security and live Gemini structured/tools/stream/image/Interactions gates are GREEN.

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
