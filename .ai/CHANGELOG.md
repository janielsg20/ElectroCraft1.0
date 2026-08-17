# CHANGELOG

## 2026-08-16 — Eighth Final Master Spec

- ElectroCraft remains a No-Code App Builder.
- All nine export destinations are Core and first-class: Local, React, Static, PWA, Android, iOS, Capacitor, LAMP and WordPress.
- Removed the lower-priority/optional export category.
- Added shared Export Target Contract, TargetRegistry, ExportParityMatrix and unified Export Center.
- Added F24 Capacitor with full source/plugin/permission/build/parity workflow.
- Added F25 LAMP with Slim 4, PSR-7, Slim-CSRF, PDO and MySQL/MariaDB.
- Added F26 WordPress with modern Block Theme + Companion Plugin.
- Moved final hardening/parity/release to F27.
- Added F00 export-parity POC before architecture closure.
- Studio shadcn base changed to Radix for one coherent foundation with selected AI Elements.
- Added selected AI Elements instead of rebuilding AI streaming/message/tool/plan UI.
- Preserved Puck, Rete, PGlite, Refine, RHF/Zod, RQB, Tiptap, Zustand, Expo and AI SDK ownership.
- Added exact codebase-location requirements to every microphase.
- Replaced repeated implementation boilerplate with phase-specific code/package execution sequences.
- Final plan: 28 phases and 270 prescriptive microphases.

## 2026-08-17 — F00 / M00.1 completed

- Added atomic R001–R084 capability/ownership/phase/target mapping.
- Added executable M00.1 contract fixture with 5 passing tests.
- Frozen all nine export destinations as explicit equal-status Core owners.
- Frozen CMS capabilities below the App Builder mental model and separated Screens from Navigation/Routes ownership.
- Updated REQUIREMENTS and TRACEABILITY and recorded F00 evidence.
- Advanced active execution to M00.2.

## 2026-08-17 — F00 / M00.2 completed

- Audited 30 approved OSS engine decisions against official/primary sources and froze ownership/API/stability/license/target boundaries in ADR-0002.
- Corrected current upstream assumptions: explicit shadcn Radix despite Base UI default; Gemini Interactions GA `v1`; TanStack Table v9 beta; dnd-kit package migration; Expo SQLite web alpha; PGlite 0.5.5 observation.
- Added a deny-by-default permission/SecretRef adapter with raw-secret, unsafe-key and fail-closed security coverage.
- Added an isolated zero-external-dependency audit fixture and real SQLite storage round-trip/transaction/error evidence.
- M00.2 gates passed: lint, typecheck, 21/21 tests, integration and build.
- Re-ran M00.1 regression: lint, typecheck, 5/5 tests and build all passed.
- Preserved exact phase ownership: Puck runtime POC = M00.3; PGlite/Drizzle runtime POC = M00.4. No false package-runtime result was recorded when npm registry access was unavailable.
- Advanced active execution to M00.3.

## 2026-08-17 — F00 / M00.3 completed

- Pinned the reproducible Puck POC to `@puckeditor/core@0.22.4` / tag `v0.22.4` with exact Git-blob provenance and MIT license.
- Added canonical Container/Text/Button fixture plus `Section` Palette preset as Container + `semanticElement=section`.
- Added bidirectional ElectroCraftDocument <-> Puck Data adapter using Slots for canonical `children[]`.
- Added Composition shell contract with Puck.Components, Puck.Outline, Puck.Preview, Puck.Fields and onAction synchronization.
- Executed exact upstream Puck insert/reorder/replace/history source; undo/redo and canonical round-trip passed.
- Added fail-fast guards preventing Puck UI/index/zone/history internals from entering persisted ElectroCraft snapshots.
- M00.3 gates passed: lint, typecheck, 16/16 tests, integration, build and structural E2E harness.
- Re-ran M00.2 (21/21 + integration/build) and M00.1 (5/5 + build) regressions successfully.
- Documented npm-registry environment limitation instead of faking a React package mount; the real Studio workspace must smoke-test the published bundle after installation.
- Advanced active execution to M00.4 — POC Studio DB genérica.

## 2026-08-17 — F00 / M00.4 completed

- Added isolated `experiments/m00-4-studio-db/` POC with exact `@electric-sql/pglite@0.5.5` + `drizzle-orm@0.45.2` pins.
- Added Drizzle schema/migration for six generic ElectroCraft tables and proved logical models/fields do not generate physical tables or `ALTER TABLE`.
- Added canonical Project Object checksums, selective `record_field_index`, transactional record/index writes, rollback and persistence fixtures.
- Added official PGlite `PGliteWorker` + `worker()` browser path with persistent `idb://` storage and a Request/Resultado/Validación technical harness.
- Added GitHub Actions closure workflow because the development container could not resolve npm; npm registry/package installation and Chromium became real CI gates instead of SKIPPED results.
- CI run 1 exposed a transient Vite navigation race; harness stabilization preserved all assertions.
- CI run 2 exposed an actual object-version semantic bug (`Date.now()` outside PostgreSQL `integer`); `project_objects.version` was corrected to a small format/object version.
- CI run 3 (`32061372828`, head `92a1a0b7f21d4db4ebad637e11084bd80415f640`) passed npm install, lint, typecheck-script, 12/12 tests, real PGlite/Drizzle integration, browser contract, build, real two-tab Chromium runtime and closure gate.
- Real two-tab evidence proves A↔B visibility, distinct leader/follower clients and persistence after close/reopen.
- Recorded ADR-0004 and `.ai/evidence/F00/M00.4/` artifacts; advanced active execution to M00.5 — POC Query portable.

## 2026-08-17 — F00 / M00.5 completed

- Added isolated `experiments/m00-5-query-portable/` POC with exact `@react-querybuilder/core@8.23.0` + `@electric-sql/pglite@0.5.5` pins and committed lockfile.
- Added versioned `ElectroCraftQueryDefinition` wrapper for nested AND/OR rules without persisting RQB internals.
- Added fail-closed model/field/operator/valueSource validation; unsupported semantics cannot degrade to fallback true/no-op.
- Added RQB parameterized PostgreSQL-style `$n` output; injection payload remains separate from SQL text.
- Added canonical physical binding: indexed/faceted fields -> `record_field_index`, non-indexed fields -> typed JSONB extraction from `content_records.data`.
- Added real facet counts, normalized multi-source output and Project Object persistence close/reopen/re-execute on PGlite.
- CI run 1 passed 7/7 tests but exposed PGlite package export-map inspection (`./package.json` not exported); manifest inspection was corrected without changing engine behavior.
- CI run 2 became GREEN; run 3 committed the generated lockfile and repeated the full suite with `npm ci`.
- Final run `32063065255`, head `2315f0f2f6d26c3ef45d22d5fd0914d8e26b0503`, passed registry, locked install, lint, 12-module syntax/type contract, 7/7 tests, real RQB/PGlite integration, build and closure gate.
- Measured RQB format average/50 `0.0442 ms`, Electro compile average/50 `0.0479 ms`, adapter overhead `0.0037 ms`.
- Recorded ADR-0005 and `.ai/evidence/F00/M00.5/`; advanced active execution to M00.6 — POC Action Flow Rete.

## 2026-08-17 — F00 / M00.6 completed

- Added isolated `experiments/m00-6-action-flow-rete/` with canonical `ElectroCraftActionGraph` v1 and Trigger -> Condition -> Data -> Toast fixture.
- Mapped the canonical graph to real Rete ControlFlow/Dataflow without persisting Rete classes, generated IDs or history internals.
- Added fail-closed validation for unsupported node/operator/operation/path/reference semantics.
- Proved classic history node + connection undo/redo using the real published history package.
- First Actions run `32068398640` exposed a packaging incompatibility in `rete-history-plugin@2.2.0` (`rete-comment-plugin` required from the published CommonJS bundle); pinned `rete-history-plugin@2.1.1` instead of adding an unrelated comment engine.
- Actions run `32069130478` passed the full real-package gate and generated the deterministic lockfile.
- Committed that lockfile and changed the workflow to install only with `npm ci`.
- Final reproducibility run `32069657914`, job `95509740663`, head `917ed319f1c5c0af1bc7f4b068b2693dbe9d5ebc` passed registry, locked install, exact version/lock checks, lint, 18-module type contract, 9/9 tests, source runtime, `PASS_REAL_RETE_ENGINE`, `PASS_REAL_RETE_HISTORY`, build and closure gate.
- Final artifact `9301226707`, digest `sha256:9a34d39785c8283a5f6f59272b30964939cacae04931f5bb79ce1899e946cd9b`.
- Recorded ADR-0006/evidence and advanced active execution to M00.7 — POC Native runtime.
