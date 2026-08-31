# M08.4 — GraphQL Connector — cierre certificado

Fecha: 2026-08-31
Rama de implementación: `codex/m08-4-graphql`
Estado: `IMPLEMENTADA / GREEN MICROFASE`.

## Engine/API

- GraphQL estándar sobre Web Fetch API.
- `DataSourceAdapter` + único `ConnectorRegistry` como boundary ElectroCraft.
- `WebDataSourceRepository` existente como fachada web.
- Sin Apollo/Relay/urql y sin segunda caché GraphQL; TanStack Query conserva ownership de cache async.

## Implementación

- `packages/domain/src/data/graphql.ts`: endpoint, headers no sensibles, timeout, execution mode, Query/Mutation y variables tipadas.
- `packages/connectors/src/graphql-data-source-adapter.ts`: `graphql.fetch`, browser POST JSON, timeout, normalización HTTP + `data/errors`, SecretRef/Gateway fail-closed, introspection estándar, operations y `ElectroCraftDataSchema`.
- Studio registra `graphql.fetch` en el mismo ConnectorRegistry y ofrece wizard Endpoint → Autenticación → Esquema → Consultas/Mutaciones → Probar → Guardar.
- Raw GraphQL vive únicamente bajo Advanced.
- Help `help.data.graphql`.
- Fixtures, Vitest y Playwright desktop/mobile incluidos.

## Seguridad

- No se persisten bearer tokens, API keys, cookies ni passwords.
- Operaciones `requiresAuth` sin authRef fallan cerradas.
- authRef fuerza Gateway; Fetch directo se usa solo sin secretos y cuando CORS lo permite.
- Introspection denegada se reporta explícitamente.

## Gate real

ElectroCraft Base CI run `33412562136` (#834), HEAD certificado `f5f8059aaf37958dde7f37c51edd9a69b5daefab`:

- documentación: `success`;
- lint/Prettier: `success`;
- typecheck: `success`;
- Vitest: `success` — 518/518;
- build: `success`;
- Playwright repository gate: `success`;
- empty repository fixture: `success`;
- CI artifacts: `success`.

El único fallo observado en el run previo #833 era una expectativa E2E que traducía incorrectamente el nombre remoto `products` a `Productos`. El commit final corrigió únicamente esa expectativa a `Products`; la comparación fue de una línea.

## Merge

PR `#70` fusionada mediante squash a `main` en:

`6b79ee859c9d0f4f712d897b4cc973bcc388cefb`

## Siguiente microfase

`M08.5 — ConnectorGateway y SecretStore` activada en `codex/m08-5-connector-gateway-secrets`.
