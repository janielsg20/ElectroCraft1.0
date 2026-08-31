# HANDOFF — ElectroCraft

## Current

F08 / M08.4 — GraphQL Connector — `ACTIVE`.

Rama activa: `codex/m08-4-graphql`.

M08.3 quedó certificada por Base CI `33326524968` (#818) y PR `#69` fusionada a `main` en `71f750017b0f37775918e26bbab86b63239736e4`.

## M08.4 owner y límites

Owner: `GraphQL over fetch + DataSourceAdapter`.

- reutiliza `DataSourceAdapter`, `ConnectorRegistry` y `WebDataSourceRepository` existentes;
- no introduce Apollo/Relay/urql ni una segunda caché GraphQL;
- TanStack Query mantiene ownership de cache async;
- secrets siguen siendo `authRef` y requieren ConnectorGateway cuando corresponda;
- raw GraphQL solo vive en Advanced.

## Implementación candidata

1. contratos GraphQL portables y bloqueo de headers sensibles;
2. `GraphQLDataSourceAdapter` `graphql.fetch`;
3. Query/Mutation + variables tipadas;
4. introspection estándar → `ElectroCraftDataSchema` + operation definitions;
5. browser Fetch, timeout, normalización `data/errors`, Gateway fallback;
6. registro Studio en el único ConnectorRegistry;
7. selector `Nueva fuente` REST API / GraphQL;
8. wizard GraphQL de seis pasos;
9. Help `help.data.graphql`;
10. fixtures, Vitest y Playwright desktop/mobile.

## Gate requerido

Abrir PR de esta rama a `main` y ejecutar una sola validación real: documentación, lint/Prettier, typecheck, Vitest, build y Playwright. M08.4 permanece ACTIVE hasta ese resultado.

## Si el gate queda verde

- registrar run/commit en evidencia;
- cambiar M08.4 a IMPLEMENTADA/GREEN;
- fusionar a `main`;
- activar `M08.5 — ConnectorGateway y SecretStore`.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/phases/F08.md → .ai/microphases/M08_4.md → packages/domain/src/data → packages/application/src/data + connector-registry → packages/connectors → packages/data-web → apps/studio/src/features/data → apps/studio/src/help → tooling/vitest → tooling/playwright`.
