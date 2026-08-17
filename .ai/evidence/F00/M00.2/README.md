# Evidence — F00 / M00.2

Status: `GREEN`.

## What was closed
- 30 approved OSS engine decisions audited for responsibility, public API, stability/preview lane, license, target applicability, boundary and primary sources.
- All nine export targets remain Core/equal-status.
- Engine ownership guardrails prevent parallel query-cache, admin/CRUD, table, form-state, validation, workflow, rich-text and runtime-state engines.
- shadcn Radix is explicit despite the upstream Base UI default.
- Gemini Interactions stable `v1` lane is separated from `v1beta`/preview capability gates.
- TanStack Table v9 beta is not silently promoted over stable v8.
- dnd-kit package/API transition is deferred to its owning implementation POC instead of hardcoding legacy imports.
- Expo SQLite native/web stability split is recorded.
- PGlite official 0.5.5 observation supersedes the earlier 0.5.4 audit pin.

## Executed gates
The exact command output is preserved in `test-output.txt`.

M00.2:
- `npm run lint` -> PASS.
- `npm run typecheck` -> PASS (10 ESM modules).
- `npm test` -> PASS, 21/21.
- `npm run integration` -> PASS using the real SQLite engine via Node 22 `node:sqlite`.
- `npm run build` -> PASS, `dist/audit-summary.json` generated for 30 engines.

Regression:
- M00.1 `npm run lint` -> PASS.
- M00.1 `npm run typecheck` -> PASS.
- M00.1 `npm test` -> PASS, 5/5.
- M00.1 `npm run build` -> PASS.
- Project integrity -> PASS: 270 microphase files, no multipart `.import` payloads and no temporary M00.2 auto-commit workflow.

## Real engine/storage evidence and scope boundary
M00.2 is the OSS **responsibility audit**, so it must not consume the dedicated engine POCs that immediately follow it. The fixture executes a real SQLite storage round-trip, transaction rollback and SQL-error diagnostic. It also verifies by contract that:
- M00.3 owns the real Puck Composition POC.
- M00.4 owns the real PGlite/Drizzle Studio DB POC.

The execution container cannot resolve the npm registry (`EAI_AGAIN`). No PGlite/Drizzle runtime result is fabricated. Their package/runtime execution remains exactly in M00.4, and F00/M00.11 still prohibits entering F01 if that POC is not green.

## Security evidence
`src/permission-adapter.mjs` is deny-by-default, validates canonical actions, rejects raw secrets, requires `secret:*` references, rejects unsafe prototype keys, strips secret fields before policy evaluation and fails closed on policy exceptions.

## Artifacts
- `engine-audit.json`
- `microphase-scan.json`
- `src/permission-adapter.mjs`
- `test/*.test.mjs`
- `.ai/adr/ADR-0002-oss-responsibility-audit.md`
- `source-audit.md`
- `environment.json`
- `test-output.txt`
- `build-summary.json`
