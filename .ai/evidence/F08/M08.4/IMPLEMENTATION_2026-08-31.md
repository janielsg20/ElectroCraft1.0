# M08.4 — GraphQL Connector — implementación candidata

Fecha: 2026-08-31
Rama: `codex/m08-4-graphql`
Estado: `ACTIVE` — implementación completa candidata a gate PR.

## Engine/API

- GraphQL estándar sobre Web Fetch API.
- `DataSourceAdapter` + único `ConnectorRegistry` como boundary ElectroCraft.
- `WebDataSourceRepository` existente como fachada web.
- Sin Apollo/Relay/urql y sin segunda caché GraphQL; TanStack Query conserva ownership de cache async.

## Implementación

- `packages/domain/src/data/graphql.ts`
  - endpoint HTTP(S), headers no sensibles, timeout y execution mode;
  - Query/Mutation operations;
  - variables tipadas string/number/boolean/array/json;
  - bloqueo de Authorization/API keys/cookies en config portable.
- `packages/connectors/src/graphql-data-source-adapter.ts`
  - `graphql.fetch`;
  - browser POST JSON;
  - timeout;
  - normalización HTTP + `data/errors` GraphQL;
  - SecretRef/Gateway fail-closed;
  - introspection estándar;
  - generación de operations desde Query/Mutation fields;
  - conversión de object types a `ElectroCraftDataSchema`.
- Studio
  - registro `graphql.fetch` en el mismo ConnectorRegistry;
  - `Nueva fuente` permite elegir REST API o GraphQL;
  - wizard: Endpoint → Autenticación → Esquema → Consultas/Mutaciones → Probar → Guardar;
  - raw document únicamente bajo Advanced;
  - desktop reutiliza el límite de 820 px y móvil usa Sheet full-screen;
  - Help `help.data.graphql`.

## Seguridad

- No se persisten bearer tokens, API keys, cookies ni passwords.
- Operaciones `requiresAuth` sin authRef fallan cerradas.
- authRef fuerza Gateway; Fetch directo se usa solo sin secretos y cuando CORS lo permite.
- Introspection denegada se reporta como error explícito; no se simula un esquema.

## Fixtures/tests

- `tooling/fixtures/canonical-model/graphql-data-source-v1.json`.
- `tooling/fixtures/graphql/introspection-products-v1.json`.
- `tooling/vitest/unit/m08-4-graphql-data-adapter.test.ts`:
  - Query;
  - Mutation + variables;
  - introspection allowed;
  - introspection denied;
  - SecretRef/Gateway;
  - secret headers.
- `tooling/playwright/m08-4-graphql.spec.ts`:
  - create project → GraphQL → introspection → Query → test → save;
  - registro `graphql.fetch`;
  - responsive móvil/no overflow.
- M08.3 E2E se adapta al selector de tipo sin alterar el wizard REST certificado.

## Auditoría UI/React

- Se reutilizan primitives shadcn/Radix del Design System.
- No se añade framework UI.
- Estados inicial/loading/error/test/save se expresan dentro del wizard.
- Labels persistentes, aria-label en Select, status/error anunciables y touch targets heredados del Sheet/wizard.
- No se crean componentes React inline ni efectos para estado derivado; capacidades y operación seleccionada se derivan con useMemo/lookup.

## Validación pendiente

La implementación no se declara GREEN antes del gate. El PR ejecutará documentación, lint, typecheck, Vitest, build y Playwright una sola vez. Cualquier fallo se corregirá por causa observada.

## Siguiente microfase tras GREEN

`M08.5 — ConnectorGateway y SecretStore`.
