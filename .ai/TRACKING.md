# TRACKING — ElectroCraft current position

Date: 2026-08-31.

| Scope | Estado | Evidencia |
| --- | --- | --- |
| F00 | COMPLETADA / GREEN | `.ai/evidence/F00/` |
| F01 | COMPLETADA / GREEN | `.ai/evidence/F01/` |
| F02 | COMPLETADA / GREEN | `.ai/evidence/F02/` |
| F03 / M03.1–M03.12 | COMPLETADA / GREEN | `.ai/evidence/F03/CLOSURE_2026-08-20.md` |
| F04 / M04.1–M04.8 | COMPLETADA / GREEN | `.ai/evidence/F04/CLOSURE_2026-08-25.md` |
| F05 / M05.1–M05.8 | COMPLETADA / GREEN | PR `#60`; Base CI `33101434587` |
| F06 / M06.1–M06.8 | IMPLEMENTACIÓN FUSIONADA; reparaciones certificadas en F07 | PR `#64`; Base CI F07 `33262949215` |
| F07 / M07.1–M07.8 | COMPLETADA / GREEN | PR `#68`; Base CI `33262949215` |
| F08 / M08.1 | IMPLEMENTADA / PENDIENTE GATE F08 | `.ai/evidence/F08/M08.1/IMPLEMENTATION_2026-08-29.md` |
| F08 / M08.2 | IMPLEMENTADA / PENDIENTE GATE F08 | `.ai/evidence/F08/M08.2/IMPLEMENTATION_2026-08-29.md` |
| F08 / M08.3 | IMPLEMENTADA / GREEN MICROFASE | PR `#69`; Base CI `33326524968` (#818); merge `71f750017b0f37775918e26bbab86b63239736e4` |
| F08 / M08.4 | ACTIVE — candidata a gate | `.ai/evidence/F08/M08.4/IMPLEMENTATION_2026-08-31.md` |

## Rama activa

`codex/m08-4-graphql`

## M08.3 — cierre certificado

- REST/OpenAPI, SecretRef/Gateway, browser Fetch y wizard responsive certificados.
- Base CI `33326524968` (#818) terminó completamente verde.
- PR `#69` fue fusionada a `main` en `71f750017b0f37775918e26bbab86b63239736e4`.

## F08 / M08.4 — GraphQL

- `packages/domain/src/data/graphql.ts`: endpoint, headers no sensibles, timeout, execution mode, operations Query/Mutation y variables tipadas.
- `packages/connectors/src/graphql-data-source-adapter.ts`: `graphql.fetch`, ejecución browser/Gateway, timeout, GraphQL errors, introspection y conversión a `ElectroCraftDataSchema`.
- No hay Apollo/Relay/urql ni segunda caché; TanStack Query continúa como owner de cache async y `WebDataSourceRepository` permanece como fachada única.
- Studio registra GraphQL en el mismo ConnectorRegistry.
- `Nueva fuente` ofrece REST API o GraphQL sin romper el wizard REST certificado.
- Wizard: Endpoint → Autenticación → Esquema → Consultas/Mutaciones → Probar → Guardar.
- Raw document vive exclusivamente en Advanced; el flujo principal usa introspection y operaciones derivadas.
- Help `help.data.graphql`.
- Fixtures: `graphql-data-source-v1.json` y `graphql/introspection-products-v1.json`.
- Tests: Query, Mutation, variables, introspection allowed/denied, SecretRef/Gateway, headers sensibles y E2E desktop/mobile.

## Validación

M08.4 no se declara DONE todavía. El PR debe ejecutar un único gate real de documentación + lint + typecheck + Vitest + build + Playwright; se corregirán únicamente fallos observados.

## Siguiente acción exacta

Abrir PR de `codex/m08-4-graphql` a `main`, ejecutar el gate, cerrar M08.4 si queda verde, fusionar y activar `M08.5 — ConnectorGateway y SecretStore`.
