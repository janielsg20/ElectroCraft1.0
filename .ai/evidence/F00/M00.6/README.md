# F00 / M00.6 evidence — POC Action Flow Rete

State: `IN_PROGRESS — local/source-tag gates GREEN; published-package CI pending`.

## Implemented

- Canonical `ElectroCraftActionGraph` v1, plain JSON only.
- Trigger -> Condition -> Data -> Toast fixture.
- Rete adapter with paired ControlFlow/Dataflow runtime mapping.
- Fail-closed validation for unsupported semantics and unsafe data paths.
- Headless area test harness only for the official history preset contract.
- Real package integration/history scripts for CI.
- Official tagged-source runtime evidence with SHA provenance for offline verification.

## Local gates executed

- `npm run lint` -> PASS, 18 modules.
- `npm run typecheck` -> PASS, 18 ESM modules.
- `npm test` -> PASS, 9/9.
- `npm run source-runtime` -> `PASS_SOURCE_TAG_RUNTIME`.
- source-tag ControlFlow/Dataflow true branch -> PASS.
- source-tag false branch/no side effects -> PASS.
- source-tag classic history node undo/redo -> PASS.
- source-tag classic history connection undo/redo -> PASS.
- canonical JSON round-trip/no engine instances -> PASS.
- `npm run build` -> `PASS_BUILD`.

## Network blocker

`getent hosts registry.npmjs.org` returned no resolution and `curl` timed out while resolving the npm registry. Therefore `node_modules` could not be installed in this container and `npm run integration` correctly fails with `ERR_MODULE_NOT_FOUND` for `rete`.

This is a tooling/network blocker, not a passing package-runtime result. The included GitHub Actions workflow is the mandatory final gate.

## Required CI result before closure

The workflow must prove:

1. npm registry health;
2. generated lockfile with exact direct pins plus `@babel/runtime@7.29.7`;
3. exact installed versions;
4. 9/9 or better tests;
5. `PASS_REAL_RETE_ENGINE`;
6. `PASS_REAL_RETE_HISTORY` with node + connection undo/redo;
7. `PASS_BUILD`;
8. `PASS_CLOSURE_GATE`;
9. generated lockfile/evidence artifact captured.

Do not start M00.7 until these are GREEN and continuity docs are closed.
