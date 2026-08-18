# ADR-DATA-SOURCES — M00.9 Data Source connectors POC

Status: `ACCEPTED — GREEN`
Date: 2026-08-17
Closed: 2026-08-18
Owner: F00 / M00.9

## Context
ElectroCraft needs portable data-source semantics for REST/OpenAPI and GraphQL without turning Core into a universal backend, leaking credentials to the client, adding SQL drivers, or creating a second query cache.

## Decision
1. Freeze a narrow `DataSourceAdapter` POC contract: `capabilities`, `listResources()`, `getSchema()` and `execute()`.
2. Normalize execution as `DataResult { data, errors, pageInfo, meta }`.
3. Use native Web Fetch API semantics for REST and GraphQL transports.
4. Select `@scalar/openapi-parser` as the OpenAPI parser; parser ownership stops at validate/dereference. ElectroCraft owns discovery/normalization.
5. Keep source configuration credential-free. It may contain `SecretRef`; literal credential values are rejected.
6. Resolve `SecretRef` only inside a Gateway/server boundary and inject authorization immediately before upstream fetch.
7. Route direct only when safe; `SecretRef`, known restricted CORS, or forced proxy routes through Gateway.
8. Keep TanStack Query as the future product query-cache owner. This POC implements no cache.
9. Keep database-specific connector packs optional and outside this POC/Core. No PostgreSQL/MySQL browser drivers are accepted here.

## Evidence
- REST read/write: PASS.
- GraphQL query/mutation: PASS.
- normalized GraphQL error: PASS.
- unsupported mutation capability: PASS.
- OpenAPI operation discovery over fixture: PASS.
- SecretRef client payload does not contain server secret: PASS.
- Gateway resolution/injection: PASS.
- direct-safe / CORS restricted policy: PASS.
- typecheck/lint/secret scan/build: PASS.
- real `@scalar/openapi-parser@0.28.11` API execution: PASS.
- exact-head GitHub Actions run: `32100542215` on `3fe3815824d7847e88c7f91006d7a6236f00e527`.
- log marker: `PASS_REAL_OPENAPI_PARSER scalar discovered 2 operations`.
- commit status: `electrocraft/M00.9 = success`.

## Closure
M00.9 is ACCEPTED/GREEN. The real parser and full Data Source POC gate succeeded on the same head used by M00.10 and the downstream architecture/F01 closure chain.
