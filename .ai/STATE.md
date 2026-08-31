# STATE — ElectroCraft

## Estado actual

- F00 — Reconocimiento, verificación y arquitectura: `COMPLETADA / GREEN`.
- F01 — Monorepo, límites, documentación y CI: `COMPLETADA / GREEN`.
- F02 — Modelo canónico del proyecto: `COMPLETADA / GREEN`.
- F03 — Design System, AppShell, español y ayuda: `COMPLETADA / GREEN`.
- F04 — Persistencia local, proyectos y revisiones: `COMPLETADA / GREEN`.
- F05 — Screen Composer con Puck: `COMPLETADA / GREEN`.
- F06 — Layout, responsive y edición avanzada: implementación fusionada; reparaciones heredadas certificadas dentro del gate F07.
- F07 — Pantallas, navegación y rutas: `COMPLETADA / GREEN`.
- F08 — Fuentes de datos, modelos, registros y conectores: `IN_PROGRESS`.
- M08.1 — Fuentes de datos y ConnectorRegistry: `IMPLEMENTADA / PENDIENTE GATE F08`.
- M08.2 — Fuente interna ElectroCraft Data sobre PGlite: `IMPLEMENTADA / PENDIENTE GATE F08`.
- M08.3 — REST API Connector y OpenAPI import: `IMPLEMENTADA / GREEN MICROFASE`.
- M08.4 — GraphQL Connector: `ACTIVE`.

## Rama activa

`codex/m08-4-graphql`

## Último cierre certificado

M08.3 fue certificada por Base CI run `33326524968` (#818): documentación, lint, typecheck, Vitest, build, Playwright, empty-repo y artifacts terminaron en `success`. PR `#69` se fusionó a `main` en `71f750017b0f37775918e26bbab86b63239736e4`.

## M08.1–M08.3

- DataSourceDefinition canónico + único ConnectorRegistry.
- ElectroCraft Data usa PGlite/Drizzle y `content_records` existente.
- REST usa Web Fetch API + `@scalar/openapi-parser@0.28.11` con SecretRef/Gateway, OpenAPI/manual, tests y E2E certificados.

## M08.4 implementación candidata

Owner aprobado: `GraphQL over fetch + DataSourceAdapter`.

- Contratos GraphQL portables en `packages/domain/src/data/graphql.ts`.
- `GraphQLDataSourceAdapter` `graphql.fetch` detrás del mismo ConnectorRegistry.
- Query/Mutation, variables tipadas, timeout, normalización `data/errors` y browser/Gateway.
- Introspection estándar convertida a `ElectroCraftDataSchema` y operaciones canónicas.
- Studio registra `graphql.fetch` junto a REST sin segundo registry ni segunda caché.
- `Nueva fuente` permite REST API o GraphQL.
- Wizard GraphQL: Endpoint → Autenticación → Esquema → Consultas/Mutaciones → Probar → Guardar.
- Raw GraphQL vive únicamente en `Advanced`.
- Help `help.data.graphql`.
- Fixtures, Vitest y Playwright M08.4 incluidos.

## Validación pendiente

M08.4 permanece `ACTIVE` hasta que el PR ejecute lint/typecheck/Vitest/build/Playwright. No se declara DONE antes de evidencia verde.

## Evidencia F08

- `.ai/evidence/F08/M08.1/IMPLEMENTATION_2026-08-29.md`
- `.ai/evidence/F08/M08.2/IMPLEMENTATION_2026-08-29.md`
- `.ai/evidence/F08/M08.3/IMPLEMENTATION_2026-08-29.md`
- `.ai/evidence/F08/M08.4/IMPLEMENTATION_2026-08-31.md`

## Siguiente transición

Ejecutar un único gate PR para M08.4. Corregir solo fallos reales. Si queda verde, cerrar M08.4, fusionar a `main` y activar `M08.5 — ConnectorGateway y SecretStore`.
