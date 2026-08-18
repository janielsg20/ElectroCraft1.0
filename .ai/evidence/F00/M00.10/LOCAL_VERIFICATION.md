# M00.10 local verification — 2026-08-17

Status: `STATIC GREEN`

Environment observed:
- Node 22.16.0
- npm 10.9.2
- PHP 8.4.23 CLI
- Composer unavailable locally
- Docker unavailable locally
- npm registry DNS unavailable from this runner

## Commands/results
- `node scripts/generate.mjs` -> `PASS_GENERATE`
- `npm run lint` -> `PASS_LINT 22 JS modules syntax-checked`
- `npm run typecheck` -> PASS
- `npm test` -> 6/6 PASS
- `npm run verify:php` -> `PASS_PHP_SYNTAX 4 files`
- `npm run verify:static` -> `PASS_STATIC_PARITY ... targets=3 blocked=0`
- `npm run build` -> harness + 4 ZIP candidates

Canonical IR fingerprint from this build:
`01faceab0d9309d7`

## Important limitation
Local static GREEN is not runtime acceptance. This runner cannot install Composer/npm toolchains or run Docker/wp-env, so the workflow `.github/workflows/export-target-poc.yml` executes the mandatory real OSS gates. The ADR remains PROPOSED until that workflow is green.
