# F00 / M00.6 evidence — POC Action Flow Rete

State: `COMPLETADA — GREEN`.

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

## Original local-network limitation

The ChatGPT execution container could not resolve `registry.npmjs.org`, so published package installation was not fabricated locally. GitHub Actions is the mandatory package-runtime gate.

## Final CI closure

GitHub Actions run `32069130478` / job `95508045917` / head `a58870b9eadf512e353ad89ea5c12c44a5530ba5` completed SUCCESS.

- registry health -> PASS;
- lockfile v3 -> PASS;
- exact installed versions -> PASS;
- `npm ci` -> PASS;
- lint -> PASS, 18 modules;
- typecheck -> PASS, 18 ESM modules;
- tests -> PASS, 9/9;
- real Rete engine -> `PASS_REAL_RETE_ENGINE`;
- real history -> `PASS_REAL_RETE_HISTORY`, node + connection undo/redo;
- build -> `PASS_BUILD`;
- closure -> `PASS_CLOSURE_GATE`;
- artifact -> `9301037810`;
- artifact digest -> `sha256:c18337a2ff70765d42bdc212e02c08fd317403bc351e222e9de7ef041851a0ce`.

The first CI run `32068398640` failed only on the published `rete-history-plugin@2.2.0` CommonJS bundle requiring missing `rete-comment-plugin`; the final compatible runtime pin is `rete-history-plugin@2.1.1`. No unrelated comment plugin was added.
