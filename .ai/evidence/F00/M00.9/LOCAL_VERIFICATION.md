# M00.9 local verification — 2026-08-17

Base repository commit: `54a6ed1863c129ecef2d840c08469469b3ec835e`

## Green locally
- `npm run lint`: PASS — 21 JS files syntax checked.
- `npm run typecheck`: PASS — strict JS check via TypeScript 5.8.3.
- `npm run test:offline`: PASS — 14/14.
- `npm run secret-scan`: PASS.
- `npm run metrics`: PASS — own source 21,756 bytes; SQL driver deps 0; query-cache deps 0.
- `npm run build`: PASS — `dist/` generated.
- technical harness served at `127.0.0.1:4179`: PASS.
- harness probes: REST read PASS; GraphQL mutation PASS; Gateway PASS; client envelope shows `SecretRef` and no resolved secret.

## Intentionally not green locally
- `npm run test:parser`: `ERR_MODULE_NOT_FOUND` for `@scalar/openapi-parser` because npm/DNS is not available in this container.
- This is not skipped or mocked. Full closure requires the GitHub Actions workflow to install `@scalar/openapi-parser@0.28.11` and emit `PASS_REAL_OPENAPI_PARSER`.
