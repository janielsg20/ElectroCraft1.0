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

## Active
F00 / M00.5 — EN_CURSO.

Next microphase exact:
M00.5 — POC Query portable.
