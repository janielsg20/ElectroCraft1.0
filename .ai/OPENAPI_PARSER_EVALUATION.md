# M00.9 — OpenAPI parser OSS evaluation

Date: 2026-08-17
Status: `SELECTED — CI EXECUTION PENDING`

## Candidates

| Candidate | License | Current evaluated release | API fit | Browser fit | Decision |
|---|---|---:|---|---|---|
| `@scalar/openapi-parser` | MIT | `0.28.11` | `validate()` + `dereference()`; Swagger 2.0 / OpenAPI 3.0 / 3.1 / 3.2 | Designed for modern JS/browser use | **Selected** |
| `@apidevtools/swagger-parser` | MIT | `12.1.0` | parse/validate/bundle/dereference; Swagger 2.0 / OpenAPI 3.0 | Browser-capable with bundler | Alternative only |

## Decision
Select `@scalar/openapi-parser@0.28.11` for M00.9. It covers the OpenAPI versions ElectroCraft is likely to ingest and exposes the two narrow primitives needed by the POC: validation and dereference. ElectroCraft still owns operation/resource normalization; the parser does not become the DataSourceAdapter contract.

`@apidevtools/swagger-parser` remains a viable fallback, but its documented scope centers on Swagger 2.0/OpenAPI 3.0 and its repository had a July 2026 open issue about a vulnerable transitive ref-parser version. That is not used as a claim that the package is unusable; it simply removes any reason to prefer it for this POC.

## API actually wired
`src/openapi.js::parseOpenApiWithScalar()` dynamically imports:
- `validate` from `@scalar/openapi-parser`;
- `dereference` from `@scalar/openapi-parser`.

There is intentionally no JSON-only fallback. `scripts/parser-probe.mjs` must execute the real installed dependency and discover both fixture operations.

## Bundle/dependency boundary
The selected parser is one optional POC dependency. ElectroCraft Core receives only normalized source/operation semantics. No PostgreSQL/MySQL browser/server driver and no query-cache package is introduced by this POC.

## Environment limitation
The current local execution environment cannot resolve npm, so the selected package cannot be installed here. Local typecheck/lint/offline tests/build are green, but the real-parser gate remains red locally with `ERR_MODULE_NOT_FOUND`. `.github/workflows/data-source-poc.yml` installs the real package and runs the full `npm run check` after the overlay is uploaded.
