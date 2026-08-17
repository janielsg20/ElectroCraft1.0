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
