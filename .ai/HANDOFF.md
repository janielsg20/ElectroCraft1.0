# HANDOFF — Eighth Final

Current:
F00 / M00.6 / EN_CURSO — implementation ready, published-package CI gate pending.

Completed:
- M00.1 GREEN — capability/ownership map.
- M00.2 GREEN — OSS responsibility/API/license/target audit.
- M00.3 GREEN — Puck Composition ownership/adapter POC.
- M00.4 GREEN — PGlite + Drizzle generic Studio DB with real multi-tab/persistence evidence.
- M00.5 GREEN — RQB 8.23.0 portable query adapter with real PGlite execution, fail-closed safety, facets, multi-source and persistence round-trip.

M00.6 implemented now:
- canonical plain-JSON `ElectroCraftActionGraph` v1;
- Trigger -> Condition -> Data -> Toast fixture;
- Rete ControlFlow/Dataflow adapter;
- fail-closed canonical validation;
- classic history node/connection undo+redo tests;
- exact tagged-source provenance;
- local/source gates GREEN: lint, syntax/type, 9/9 tests, source runtime, build;
- exact direct Rete pins + transitive `@babel/runtime@7.29.7` override;
- workflow generates lockfile, installs via `npm ci`, then proves published npm runtime/history closure.

Pending before M00.6 can close:
1. upload the bundle over `main` through the user's GitHub Desktop workflow;
2. let `Verify M00.6 Action Flow Rete` install exact pins and run `npm run verify`;
3. capture the workflow result/artifact and generated lockfile;
4. update TRACKING/MEMORY/CHANGELOG/STATE/HANDOFF to COMPLETADA only if CI is GREEN.

Read next:
AGENTS -> RULES -> MEMORY -> STATE -> TRACKING -> `.ai/microphases/M00_6.md` -> `.ai/adr/ADR-0006-action-flow-rete-poc.md` -> `.ai/evidence/F00/M00.6/`.

Do not begin M00.7 until M00.6 is green. Do not begin F01 until all F00 POCs and ADR closure are green.
