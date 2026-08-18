# ADR-EXPORT-TARGET-PARITY — M00.10

Status: `ACCEPTED — GREEN`
Date: 2026-08-17
Closed: 2026-08-18
Owner: F00 / M00.10

## Context
Capacitor, LAMP and WordPress are first-class Core export targets. The architecture must prove that they compile from the same canonical model while preserving their actual runtime ownership.

## Decision
1. Freeze one `ExportIrPoc` as the only canonical input for this POC.
2. Use separate target compilers for Capacitor, LAMP and WordPress.
3. Treat `family` only as implementation reuse; never as product priority.
4. Require `CapabilityResult exact|adapted|blocked` before generation.
5. Capacitor uses official `@capacitor/*` CLI/runtime packages; no custom native shell.
6. LAMP uses Slim 4 + PSR-7 + Slim-CSRF + PDO/MySQL; no proprietary PHP router.
7. WordPress uses Block Theme + Companion Plugin + native CPT/REST/capability/lifecycle APIs; no CMS-specific canonical model.
8. A generated ZIP/file tree is not evidence of runtime correctness by itself. Each target must execute its real toolchain gate.
9. M00.10 CI begins by executing the M00.9 real-parser gate so the dependency precondition cannot be bypassed.

## Static evidence
- one IR fingerprint across 4 embedded target IR copies: PASS;
- 6/6 Node tests: PASS;
- strict JS typecheck for compiler surface: PASS;
- PHP syntax checks: PASS;
- capability report: 3 targets, 0 blockers: PASS;
- generated Capacitor/LAMP/WordPress sources are structurally distinct: PASS;
- artifact generation + SHA-256 evidence: PASS;
- harness build and required Spanish states: PASS.

## Real runtime evidence
Run `32100542215`, head `3fe3815824d7847e88c7f91006d7a6236f00e527`:
- Scalar real parser from M00.9: PASS;
- Capacitor `cap add/sync android`: PASS;
- Composer/Slim/PDO/MySQL/CSRF runtime: PASS;
- wp-env WordPress 7.0.2 activation/runtime fixture: PASS;
- M00.10 closure gate: PASS.

Artifacts: `9311394160`, `9311399715`, `9311407473`, `9311441488`.
Commit status: `electrocraft/M00.10 = success`.

## Rejected alternatives
- reuse the Web artifact and rename it LAMP/WordPress;
- create separate canonical project models per target;
- create a proprietary PHP router;
- map every visual node to a custom WordPress block;
- mark any of the three targets optional/fallback.

## Closure
M00.10 is ACCEPTED/GREEN. M00.11 was allowed to execute only after the exact-head combined closure gate succeeded.
