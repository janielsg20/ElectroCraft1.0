# TRACKING — Eighth Final Execution

Date: 2026-08-17.

## M00.1 — COMPLETADA
State: GREEN.

Evidence:
- `.ai/adr/ADR-0001-capability-ownership-map.md`
- `.ai/evidence/F00/M00.1/`
- `experiments/m00-1-requirements/`

Regression executed after M00.2:
- `npm run lint` -> PASS.
- `npm run typecheck` -> PASS.
- `npm test` -> PASS, 5/5.
- `npm run build` -> PASS.

## M00.2 — COMPLETADA
State: GREEN.

Evidence:
- `.ai/adr/ADR-0002-oss-responsibility-audit.md`
- `.ai/evidence/F00/M00.2/README.md`
- `.ai/evidence/F00/M00.2/source-audit.md`
- `.ai/evidence/F00/M00.2/test-output.txt`
- `.ai/evidence/F00/M00.2/build-summary.json`
- `experiments/m00-2-oss-audit/engine-audit.json`
- `experiments/m00-2-oss-audit/microphase-scan.json`

Files/areas modified:
- `.ai/ENGINE_RESPONSIBILITY_MATRIX.md`
- `.ai/DEPENDENCY_BASELINE.md`
- `.ai/OSS_DECISION_MATRIX.md`
- `.ai/adr/ADR-0002-oss-responsibility-audit.md`
- `.ai/MEMORY.md`
- `.ai/STATE.md`
- `.ai/TRACKING.md`
- `.ai/CHANGELOG.md`
- `.ai/HANDOFF.md`
- `.ai/evidence/F00/M00.2/*`
- `experiments/m00-2-oss-audit/*`

Engine/API evidence:
- Official/primary documentation/repositories for all 30 audited decisions.
- Real SQLite storage engine through Node 22 `node:sqlite`: persistence round-trip, transaction rollback and surfaced SQL error.
- PGlite/Drizzle package/runtime POC intentionally remains M00.4, its exact owning microphase.

Tests exactos:
- M00.2 `npm run lint` -> PASS.
- M00.2 `npm run typecheck` -> PASS, 10 ESM modules.
- M00.2 `npm test` -> PASS, 21/21.
- M00.2 `npm run integration` -> PASS.
- M00.2 `npm run build` -> PASS, 30-engine summary.
- M00.1 regression -> PASS, including 5/5 tests.
- Project integrity -> PASS, 270 microphases; no multipart import or temporary workflow residue.

Adaptation/blockers:
- The execution container cannot resolve `registry.npmjs.org` (`EAI_AGAIN`). No package-runtime result was fabricated.
- This does not steal or waive the DB engine gate: the real PGlite/Drizzle POC is explicitly M00.4 and remains mandatory before F00 can close.

## M00.3 — COMPLETADA
State: GREEN.

Evidence:
- `.ai/adr/ADR-0003-puck-composition-poc.md`
- `.ai/evidence/F00/M00.3/README.md`
- `.ai/evidence/F00/M00.3/source-audit.md`
- `.ai/evidence/F00/M00.3/test-output.txt`
- `.ai/evidence/F00/M00.3/regression-output.txt`
- `.ai/evidence/F00/M00.3/build-summary.json`
- `experiments/m00-3-puck-composition/`

Engine/API evidence:
- `@puckeditor/core@0.22.4`, MIT, tag `v0.22.4`, commit `92585c44f95cd1422b175cfbcdd72283fe2b4a52`.
- Exact official blobs SHA-checked for insert/reorder/replace/generateId/history.
- Composition contract: Puck.Components / Outline / Preview / Fields + onAction.
- Slot data contract: canonical `children[]` maps to a Puck slot prop.

Tests exactos:
- M00.3 `npm run lint` -> PASS, 9 official blobs verified.
- M00.3 `npm run typecheck` -> PASS.
- M00.3 `npm test` -> PASS, 16/16.
- M00.3 `npm run integration` -> PASS: insert/reorder/replace/Slot/onAction canonical sync.
- M00.3 `npm run build` -> PASS.
- M00.3 `npm run e2e` -> PASS: end-to-end structural harness Request/Resultado/Validación.
- M00.2 regression -> PASS, 21/21 + integration/build.
- M00.1 regression -> PASS, 5/5 + lint/typecheck/build.

Adaptation/blockers:
- `registry.npmjs.org` remains unreachable from this container. Full published React bundle mount was not fabricated; exact engine mechanics/history and Composition source/type contract were verified. Studio workspace installation must re-run package mount smoke after a real lockfile install.
- No architecture blocker remains for M00.4.

## M00.4 — COMPLETADA
State: GREEN.

Evidence:
- `.ai/adr/ADR-0004-studio-db-poc.md`
- `.ai/evidence/F00/M00.4/README.md`
- `.ai/evidence/F00/M00.4/source-audit.md`
- `.ai/evidence/F00/M00.4/test-output.txt`
- `.ai/evidence/F00/M00.4/integration-result.json`
- `.ai/evidence/F00/M00.4/two-tab-runtime.json`
- `.ai/evidence/F00/M00.4/browser-contract.json`
- `.ai/evidence/F00/M00.4/ci-summary.json`
- `experiments/m00-4-studio-db/`
- GitHub Actions run `32061372828`, head `92a1a0b7f21d4db4ebad637e11084bd80415f640`, artifact `9298292283`.

Files/areas modified:
- `.github/workflows/verify-m00-4-studio-db.yml`
- `experiments/m00-4-studio-db/*`
- `.ai/adr/ADR-0004-studio-db-poc.md`
- `.ai/evidence/F00/M00.4/*`
- `.ai/MEMORY.md`
- `.ai/STATE.md`
- `.ai/TRACKING.md`
- `.ai/CHANGELOG.md`
- `.ai/HANDOFF.md`

Engine/API evidence:
- `@electric-sql/pglite@0.5.5`: real embedded Postgres + persistent browser `idb://` + official `PGliteWorker`/`worker()` multi-tab integration.
- `drizzle-orm@0.45.2`: real PGlite driver, pg-core schema/query and `pglite/migrator` migration path.
- Exactly six generic ElectroCraft physical tables; logical `article`/`customer` models did not create physical tables.
- Incremental Project Object checksums, selective faceted index, schema evolution without `ALTER TABLE`.

Tests exactos:
- GitHub Actions npm registry/ping -> PASS.
- package install -> PASS.
- Chromium install -> PASS.
- `npm run lint` -> PASS.
- `npm run typecheck` -> PASS, 21 ESM-module syntax contract.
- `npm test` -> PASS, 12/12.
- `npm run integration` -> `PASS_NODE_ENGINE`.
- `npm run browser-contract` -> `PASS_STATIC_CONTRACT`.
- `npm run build` -> PASS.
- `npm run two-tab-runtime` -> `PASS_TWO_TAB`.
- `npm run closure-gate` -> PASS.
- Workflow run `32061372828` -> SUCCESS.

Persistence/performance evidence:
- object isolation -> PASS.
- two logical models/no physical tables -> PASS.
- faceted index/query -> PASS.
- logical field add/zero ALTER TABLE -> PASS.
- forced rollback -> PASS.
- Node close/reopen persistence -> PASS.
- browser tab A write visible in B -> PASS.
- browser tab B write visible in A -> PASS.
- two distinct Worker clients, leader/follower -> PASS.
- browser close/reopen persistence -> PASS.
- average save object/20 -> `1.291 ms`.
- average facet query/20 -> `1.602 ms`.

Adaptation/blockers:
- The original ChatGPT execution container still cannot resolve npm, so GitHub Actions was used as the real package/browser execution environment rather than treating SKIPPED as PASS.
- CI run 1 exposed a Vite navigation race; fixed by stable warmup/retry only for transient navigation without weakening assertions.
- CI run 2 exposed `Date.now()` overflow in `project_objects.version integer`; fixed by restoring version semantics to a small object/format version.
- Run 3 is fully GREEN. No M00.4 blocker remains.

## M00.5 — COMPLETADA
State: GREEN.

Evidence:
- `.ai/adr/ADR-0005-query-portable-poc.md`
- `.ai/evidence/F00/M00.5/README.md`
- `.ai/evidence/F00/M00.5/source-audit.md`
- `.ai/evidence/F00/M00.5/test-output.txt`
- `.ai/evidence/F00/M00.5/integration-result.json`
- `.ai/evidence/F00/M00.5/build-summary.json`
- `.ai/evidence/F00/M00.5/ci-summary.json`
- `experiments/m00-5-query-portable/`
- GitHub Actions run `32063065255`, job `95488578412`, head `2315f0f2f6d26c3ef45d22d5fd0914d8e26b0503`, artifact `9298848789`.

Files/areas modified:
- `.github/workflows/verify-m00-5-query-portable.yml`
- `experiments/m00-5-query-portable/*`
- `.ai/adr/ADR-0005-query-portable-poc.md`
- `.ai/evidence/F00/M00.5/*`
- `.ai/MEMORY.md`
- `.ai/STATE.md`
- `.ai/TRACKING.md`
- `.ai/CHANGELOG.md`
- `.ai/HANDOFF.md`

Engine/API evidence:
- `@react-querybuilder/core@8.23.0`: real parameterized formatter with numbered PostgreSQL-style bind params.
- `@electric-sql/pglite@0.5.5`: real query execution/persistence over the physical contract frozen by M00.4.
- RQB owns nested boolean tree/operator formatting/value binding; ElectroCraft owns fail-closed policy, canonical field binding, index-vs-JSON mapping and result normalization.

Tests exactos:
- GitHub Actions npm registry/ping -> PASS.
- locked package install with `npm ci` -> PASS.
- `npm run lint` -> PASS.
- `npm run typecheck` -> PASS, 12 ESM-module syntax/type contract.
- `npm test` -> PASS, 7/7.
- `npm run integration` -> `PASS_QUERY_ENGINE`.
- `npm run build` -> `PASS_BUILD`, compiler SHA `67cfd4e8c0ecff290da04013193ee37bd470931594a1322aa917580cb49348f9`.
- `npm run closure-gate` -> PASS.
- Workflow run `32063065255` -> SUCCESS.

Query/safety/persistence evidence:
- nested AND/OR -> PASS.
- indexed field -> `record_field_index`; unindexed fields -> JSONB extraction -> PASS.
- deliberately unsupported operator -> blocker -> PASS.
- injection payload remains in bind params and does not appear in SQL -> PASS.
- facet count -> PASS (`cables=2`, `power=1`).
- multi-source normalized shape -> PASS.
- Project Object save/close/reopen/load/re-execute -> PASS.
- RQB SQL evidence: `(__ecf0__ = $1 and (__ecf1__ = $2 or __ecf2__ = $3))`.
- RQB format avg/50 -> `0.0442 ms`.
- Electro compile avg/50 -> `0.0479 ms`.
- measured adapter overhead -> `0.0037 ms`.

Adaptation/blockers:
- CI run 1 reached 7/7 tests but PGlite correctly rejected package subpath `./package.json`; installed-version inspection was changed to read the manifest file without altering engine semantics.
- CI run 2 was GREEN. Run 3 versioned the generated lockfile and repeated the full gate with `npm ci` successfully.
- No M00.5 blocker remains.

## M00.6 — COMPLETADA
State: GREEN.

Evidence:
- `.ai/adr/ADR-0006-action-flow-rete-poc.md`
- `.ai/evidence/F00/M00.6/README.md`
- `.ai/evidence/F00/M00.6/source-audit.md`
- `.ai/evidence/F00/M00.6/source-provenance.json`
- `.ai/evidence/F00/M00.6/ci-summary.json`
- `.ai/evidence/F00/M00.6/integration-real.json`
- `.ai/evidence/F00/M00.6/history-real.json`
- `.ai/evidence/F00/M00.6/closure.json`
- `experiments/m00-6-action-flow-rete/`
- GitHub Actions final run `32069657914`, job `95509740663`, head `917ed319f1c5c0af1bc7f4b068b2693dbe9d5ebc`, artifact `9301226707`.

Files/areas modified:
- `.github/workflows/verify-m00-6-action-flow-rete.yml`
- `experiments/m00-6-action-flow-rete/*`
- `.ai/adr/ADR-0006-action-flow-rete-poc.md`
- `.ai/evidence/F00/M00.6/*`
- `.ai/MEMORY.md`
- `.ai/STATE.md`
- `.ai/TRACKING.md`
- `.ai/CHANGELOG.md`
- `.ai/HANDOFF.md`

Engine/API evidence:
- `rete@2.0.6`: NodeEditor/classic graph mechanics.
- `rete-engine@2.1.1`: real ControlFlow/Dataflow runtime.
- `rete-area-plugin@2.3.2`: area parent contract required by history.
- `rete-history-plugin@2.1.1`: real classic node/connection undo/redo.
- Canonical ElectroCraft workflow stays plain JSON and never persists Rete internals.

Tests exactos:
- registry health -> PASS.
- committed lockfile install with `npm ci` -> PASS.
- exact installed versions and lockfile v3 -> PASS.
- `npm run lint` -> PASS, 18 modules.
- `npm run typecheck` -> PASS, 18 ESM modules.
- `npm test` -> PASS, 9/9.
- `npm run source-runtime` -> `PASS_SOURCE_TAG_RUNTIME`.
- `npm run integration` -> `PASS_REAL_RETE_ENGINE`.
- `npm run history` -> `PASS_REAL_RETE_HISTORY`; node + connection undo/redo.
- `npm run build` -> `PASS_BUILD`, adapter SHA `e58dfaea25629933ce416175d4d12380d957ee9a9c1285f4ca4d33bef8ff1c65`.
- `npm run closure-gate` -> `PASS_CLOSURE_GATE`.
- Final workflow run `32069657914` -> SUCCESS.

Adaptation/blockers:
- Run 1 `32068398640` exposed `rete-history-plugin@2.2.0` eagerly requiring missing `rete-comment-plugin` from its published CommonJS bundle; the POC was pinned to compatible `rete-history-plugin@2.1.1` rather than adding an unrelated comment engine.
- Run 2 became GREEN and generated the deterministic lockfile.
- Run 3 committed that lockfile, used `npm ci` only and repeated the complete suite GREEN.
- No M00.6 blocker remains.

## M00.7 — COMPLETADA
State: GREEN.

Evidence:
- `.ai/adr/ADR-0007-native-runtime-poc.md`
- `.ai/evidence/F00/M00.7/README.md`
- `.ai/evidence/F00/M00.7/ci-summary.json`
- `.ai/evidence/F00/M00.7/android-native-runtime.json`
- `.ai/evidence/F00/M00.7/android-prebuild-summary.json`
- `.ai/evidence/F00/M00.7/build-summary.json`
- `.ai/evidence/F00/M00.7/capability-pruning.json`
- `experiments/m00-7-native-runtime/`
- GitHub Actions final run `32078336103`, head `c6e05a475fa0df7fd7ba2a8138e1392bcf6df797`.

Engine/API evidence:
- Expo/React Native owns native platform runtime; Expo Router stable Stack + JS Tabs test group.
- Expo SQLite + Drizzle execute the generic native persistence path.
- Zustand owns persisted runtime state using `expo-sqlite/kv-store`; hydration is ordered manually after DB initialization.
- Refine Core stays headless and executes the custom native DataProvider.
- No DOM table/renderer is introduced.

Tests exactos:
- registry + committed `npm ci` -> PASS.
- exact versions + lockfile v3 -> PASS.
- lint -> 34 modules PASS.
- strict TypeScript -> PASS.
- tests -> 13/13 PASS.
- real package resolution -> PASS.
- baseline/camera capability pruning -> PASS.
- Android + iOS target exports -> PASS.
- Android prebuild without CAMERA/RECORD_AUDIO -> PASS.
- x86_64 Android release APK -> PASS.
- KVM emulator -> PASS.
- visible `M00.7 runtime OK` -> PASS.
- SQLite/Drizzle/DataProvider/Zustand persistence -> PASS, recordCount=1.
- `electrocraft://guarded` -> `Inicio de sesión requerido` -> PASS.
- commit status `M00.7 Native Runtime` -> SUCCESS.

Artifacts:
- Android `9304563117`, digest `sha256:ef6bcc5fe1eb7750a3731a89b5daa0c7af7c1fbe7c550cb81bb277041141f3d8`.
- source/build `9304237635`, digest `sha256:c7be19042662e0845bd650af2da8e157bd8a0493d2d51981836fd7c913c46f63`.
- lockfile SHA-256 `1eeb7b543cbc3876c5467fedfa21bd6d8f84466b5dbff9dd71ec340337c17882`.

Adaptation/blockers:
- A real runtime run exposed an Expo SQLite directory-creation race between canonical DB startup and automatic Zustand kv-store hydration.
- Accepted fix: `skipHydration:true`; explicit `rehydrate()` only after `ensureNativeSchema()`; regression test freezes the order.
- No M00.7 blocker remains.

## Active
F00 / M00.8 — EN_CURSO.

Implementation prepared:
- `experiments/gemini-provider-poc/`.
- AI SDK + `@ai-sdk/google` primary; Zod typed output.
- `@google/genai` restricted to stable Interactions `v1` probe.
- structured output, bounded tool loop, streaming/cancel, Gemini image, secure server gateway.
- logical profiles only in canonical data; resolved IDs are session metadata.
- local source/security gates GREEN; published package + live Gemini CI pending.

Next microphase exact after GREEN:
M00.9 — POC Data Sources.

Do not begin M00.9 until M00.8 is GREEN.
