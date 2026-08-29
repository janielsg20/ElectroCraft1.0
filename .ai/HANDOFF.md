# HANDOFF — ElectroCraft

## Current

F08 / M08.1 — Fuentes de datos y ConnectorRegistry — `ACTIVE`.

Rama activa: `codex/m08-1-data-sources`.

F07 está cerrada y fusionada. M08.1 tiene implementación funcional preparada y evidencia; la suite completa se reserva para el Gate F08 para evitar Actions por microfase.

## Gate de entrada F08

- Base CI F07: run `33262949215` (#795), `success` completo.
- PR F07: `#68`.
- merge a `main`: `e697a42546d23f89412e6dd616018759e719e448`.
- las reparaciones Playwright heredadas de F06 quedaron certificadas dentro de este gate.

## M08.1 implementada

### Contrato

- Owner único de DataSource: `packages/domain/src/data/source-definition.ts`.
- Capabilities canónicas: `read/create/update/delete/pagination/filtering/sort/aggregate/realtime/file/transactions`.
- Aliases legacy se normalizan al importar; no crean una segunda semántica.
- `environmentScope` + overrides por development/preview/production.
- config portable rechaza passwords, API keys, tokens, Authorization y credenciales; usar `authRef`.

### Runtime

- `packages/application/src/connector-registry.ts` conserva el único singleton `dataSourceConnectorRegistry`.
- `DataSourceAdapter`: `testConnection`, `listResources`, `getSchema`, `query`, `mutate`.
- Registry bloquea adapter/kind/capability/environment incompatibles antes de ejecutar.
- `packages/connectors` registra adapters sobre el registry de aplicación; no posee otro registry runtime.
- `packages/data-web` consume el registry mediante `WebDataSourceRepository` y reutiliza PGlite/Drizzle existente.
- `tooling/package-boundaries.json` reconoce `@electrocraft/connectors` como paquete estable #20.

### Studio

`/data-sources` carga directamente `apps/studio/src/features/data/data-sources-workspace.tsx`.

- Desktop: lista 300px + detalle + inspector seguridad/compatibilidad.
- Tablet: inspector a Sheet.
- Mobile: list → detail.
- Secciones: Resumen, Configuración, Autenticación, Esquema, Prueba.
- Copy: Fuentes de datos, Nueva fuente, Interna, REST API, GraphQL, Probar conexión, Esquema, Credenciales, Requiere gateway.
- Help: `help.data.sources`.
- adapters aún no implementados se muestran como no registrados y acciones dependientes quedan deshabilitadas con motivo.

## Tests preparados

- `tooling/vitest/unit/m08-1-data-sources-registry.test.ts`
- `tooling/vitest/unit/help-registry.test.ts`
- `tooling/vitest/integration/app-shell-e2e-matrix.test.ts`

Cubren registry register/unregister, compatibilidad, 11 capabilities, unsupported operation, secret exclusion, round-trip, facade data-web y responsive/copy.

## Validación pendiente de fase

`packages/connectors` es un workspace nuevo y obliga a regenerar `package-lock.json` antes del Gate F08. También se aplicará Prettier y la suite completa en ese único gate. No abrir PR mientras se desarrollen las microfases de F08 para no disparar CI en cada commit.

## Siguiente microfase exacta

`M08.2 — Fuente interna ElectroCraft Data sobre PGlite`.

No crear una segunda base local: reutilizar PGlite + Drizzle + generic record store existente. No exponer SQL a beginner. El adapter interno debe vivir detrás del mismo ConnectorRegistry.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/phases/F08.md → .ai/microphases/M08_1.md → .ai/microphases/M08_2.md → .ai/evidence/F08/ → packages/domain/src/data → packages/application/src/data + connector-registry → packages/connectors → packages/data-web → apps/studio/src/features/data → tooling/vitest`.
