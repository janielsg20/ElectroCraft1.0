# M00.9 — OpenAPI parser OSS evaluation

Date: 2026-08-17
Closed: 2026-08-18
Status: `SELECTED — EXECUTED / GREEN`

## Candidates

| Candidate | License | Current evaluated release | API fit | Browser fit | Decision |
|---|---|---:|---|---|---|
| `@scalar/openapi-parser` | MIT | `0.28.11` | `validate()` + `dereference()`; Swagger 2.0 / OpenAPI 3.0 / 3.1 / 3.2 | Designed for modern JS/browser use | **Selected** |
| `@apidevtools/swagger-parser` | MIT | `12.1.0` | parse/validate/bundle/dereference; Swagger 2.0 / OpenAPI 3.0 | Browser-capable with bundler | Alternative only |

## Decision
Select `@scalar/openapi-parser@0.28.11` for M00.9. It covers the OpenAPI versions ElectroCraft is likely to ingest and exposes the two narrow primitives needed by the POC: validation and dereference. ElectroCraft still owns operation/resource normalization; the parser does not become the DataSourceAdapter contract.

`@apidevtools/swagger-parser` remains a viable fallback. It is not selected because Scalar better matches the evaluated scope; no claim is made that the alternative is unusable.

## API actually wired
`src/openapi.js::parseOpenApiWithScalar()` dynamically imports:
- `validate` from `@scalar/openapi-parser`;
- `dereference` from `@scalar/openapi-parser`.

There is intentionally no JSON-only fallback. `scripts/parser-probe.mjs` executes the real installed dependency and discovers both fixture operations.

## Bundle/dependency boundary
The selected parser is one optional POC dependency. ElectroCraft Core receives only normalized source/operation semantics. No PostgreSQL/MySQL browser/server driver and no query-cache package is introduced by this POC.

## Executed CI evidence
- GitHub Actions run: `32100542215`.
- Head: `3fe3815824d7847e88c7f91006d7a6236f00e527`.
- Exact installed parser: `@scalar/openapi-parser@0.28.11`.
- Exact TypeScript pin: `7.0.2`.
- Offline tests: 14/14 PASS.
- Real parser marker: `PASS_REAL_OPENAPI_PARSER scalar discovered 2 operations`.
- Secret scan, metrics and build: PASS.
- Commit status: `electrocraft/M00.9 = success`.

The former local npm/DNS limitation is retained only as historical context; GitHub Actions provided the required real OSS execution and closed the gate.
