# ADR-0006 — M00.6 Action Flow Rete POC

Status: `ACCEPTED — CI GREEN`
Date: 2026-08-17
Owner: F00 / M00.6

## Decision

ElectroCraft persists a versioned, plain-JSON `ElectroCraftActionGraph`. Rete owns graph mechanics and workflow processing. The adapter maps the canonical graph to Rete nodes/connections at runtime and never persists Rete classes, engine-generated node IDs, history stacks or editor internals.

Minimum fixture:

`Trigger(record.created) -> Condition(priority == high) -> Data(set status=processed) -> Toast("Registro procesado")`

The adapter generates separate Rete control/data connections from each logical canonical edge. `rete-engine` owns ControlFlow/Dataflow traversal. `rete-history-plugin` with `Presets.classic.setup()` owns node/connection undo/redo. A headless `BaseAreaPlugin` subclass exists only in the isolated POC harness because the official history preset requires an area parent; it is not product UI or a second history engine.

## Pinned engine set

- `rete@2.0.6`
- `rete-engine@2.1.1`
- `rete-history-plugin@2.1.1`
- `rete-area-plugin@2.3.2`
- transitive override: `@babel/runtime@7.29.7`

All are MIT. Direct Rete packages are pinned to published npm versions; `@babel/runtime` is overridden so the dependency graph does not float inside `^7.21.0`.

Compatibility decision: `rete-history-plugin@2.2.0` was tested first in GitHub Actions run `32068398640`. Install and lock generation succeeded, but importing the published CommonJS bundle failed because it eagerly requires `rete-comment-plugin` despite that peer being optional, while npm had no compatible `rete-comment-plugin@^2.2.0`. ElectroCraft therefore pins `rete-history-plugin@2.1.1`, whose required history API is unchanged for this POC and which does not introduce the comment-plugin dependency. This avoids installing an unrelated engine solely to work around an upstream packaging defect.

Upstream release-tag note: npm is the source of truth for installed package versions, while named Git tags/blob SHAs are used only as source/API provenance. The CI gate verifies installed npm manifests directly.

## Ownership boundary

Rete owns node/connection graph mechanics, ControlFlow traversal, Dataflow evaluation/cache behavior, and history undo/redo. ElectroCraft owns only the canonical action vocabulary, fail-closed validation, canonical-to-Rete mapping, declared runtime effects and persistence/export portability.

## Fail-closed rules

- unknown node kind -> blocker;
- unsupported condition operator -> blocker;
- unsupported data operation -> blocker;
- unsafe data path (`__proto__`, `constructor`) -> blocker;
- missing node/edge references -> blocker;
- Rete engine objects in canonical persistence -> blocker.

## Evidence

Local/source-tag gates are GREEN: lint, syntax/type contract, 9/9 tests, source runtime, true/false ControlFlow/Dataflow paths, classic history node/connection undo/redo, canonical JSON round-trip and build.

Exact source provenance is recorded at `experiments/m00-6-action-flow-rete/vendor-source/provenance.json`.

## Closure gate

GitHub Actions run `32069130478` on head `a58870b9eadf512e353ad89ea5c12c44a5530ba5` is GREEN. It verified registry access, exact installed versions, lockfile v3, `npm ci`, lint, typecheck, 9/9 tests, source runtime, `PASS_REAL_RETE_ENGINE`, `PASS_REAL_RETE_HISTORY`, `PASS_BUILD` and `PASS_CLOSURE_GATE`. Artifact `9301037810` has digest `sha256:c18337a2ff70765d42bdc212e02c08fd317403bc351e222e9de7ef041851a0ce`.

The generated lockfile is committed and the final workflow installs from it with `npm ci`. M00.6 is closed; M00.7 may begin.
