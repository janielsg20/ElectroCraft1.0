# M08.1 — Fuentes de datos y ConnectorRegistry — implementación 2026-08-29

## Estado

`IMPLEMENTADA / PENDIENTE GATE F08`.

No se ejecutó GitHub Actions para esta microfase. La política de desarrollo de F08 reserva el gate completo `docs + lint + typecheck + test + build + Playwright` para el cierre de fase. Los tests M08.1 fueron añadidos/actualizados, pero esta evidencia no declara un GREEN no ejecutado.

## Gate de entrada

F07 quedó certificada por Base CI run `33262949215` (#795): documentación, lint, typecheck, Vitest, build, Playwright, empty-repo y artefactos terminaron `success`.

PR `#68` se fusionó a `main` en `e697a42546d23f89412e6dd616018759e719e448`.

## Owner y arquitectura

- `packages/domain/src/data/source-definition.ts` es el único owner del contrato portable `ElectroCraftDataSourceDefinition`.
- `packages/domain/src/contracts/data-definition.ts` conserva compatibilidad pública y ownership de DataField/DataModel/DataSchema, reexportando DataSource desde el owner anterior.
- `packages/application/src/connector-registry.ts` mantiene el único `dataSourceConnectorRegistry` runtime.
- `packages/connectors/` expone registro/factory de adapters sobre ese mismo registry; no existe singleton paralelo.
- `packages/data-web/src/data-source-repository.ts` consume el registry mediante una facade repository backend-agnostic.
- Studio persiste fuentes como Project Objects `kind=data-source` usando el storage/autosave F04 ya existente; no crea otro store físico.
- `tooling/package-boundaries.json` registra `@electrocraft/connectors` como paquete estable #20 con dependencias permitidas `domain + application`.

## Contrato portable

Capabilities canónicas exactas M08.1:

`read | create | update | delete | pagination | filtering | sort | aggregate | realtime | file | transactions`.

Aliases legacy se aceptan solo al importar/normalizar:

- `write` → `create + update + delete`;
- `filter` → `filtering`;
- `paginate` → `pagination`;
- `subscribe` → `realtime`;
- `files` → `file`.

La definición incluye `environmentScope`, overrides por `development | preview | production`, `schemaDiscovery`, `authRef`, configuración portable y metadata.

## Seguridad

- passwords/API keys/tokens/Authorization/credentials no pueden persistirse dentro de `config` ni `environmentOverrides`;
- validación recursiva bloquea claves de secret y obliga a usar `authRef`;
- `ConnectorRegistry.assertOperation()` bloquea operaciones no declaradas/no soportadas antes de ejecutar el adapter;
- un entorno fuera de `environmentScope` falla cerrado;
- SecretStore/Gateway real permanece reservado para M08.5.

## DataSourceAdapter

Contrato implementado:

- `testConnection(context)`;
- `listResources(context)`;
- `getSchema(context)`;
- `query(context, request)`;
- `mutate(context, request)`.

Adapters concretos no se adelantaron:

- Internal/PGlite → M08.2;
- REST/OpenAPI → M08.3;
- GraphQL → M08.4;
- Gateway/SecretStore → M08.5.

## Studio `/data-sources`

Ubicación canónica: `apps/studio/src/features/data/`.

Desktop:

- lista izquierda exacta 300px;
- detalle central con `Resumen`, `Configuración`, `Autenticación`, `Esquema`, `Prueba`;
- inspector derecho de seguridad/compatibilidad.

Tablet:

- inspector secundario pasa a Sheet.

Mobile:

- flujo list → detail con acción volver;
- no comprime tres columnas.

Copy visible incluye `Fuentes de datos`, `Nueva fuente`, `Interna`, `REST API`, `GraphQL`, `Probar conexión`, `Esquema`, `Credenciales`, `Requiere gateway`.

`help.data.sources` está registrado en HelpRegistry y es el descriptor contextual para el destino sidebar `data-sources`.

Si el adapter todavía pertenece a una microfase posterior, la UI muestra el motivo y deshabilita test/schema; no simula éxito.

## Tests preparados

`tooling/vitest/unit/m08-1-data-sources-registry.test.ts` cubre:

1. register/resolve/unregister;
2. unknown adapter y capabilities incompatibles;
3. normalización a los 11 capability flags;
4. operación no soportada fail-closed;
5. exclusión de secrets;
6. round-trip + Project Object F04;
7. facade `WebDataSourceRepository`;
8. contrato responsive/copy `/data-sources`.

También se actualizaron:

- `tooling/vitest/unit/help-registry.test.ts`;
- `tooling/vitest/integration/app-shell-e2e-matrix.test.ts`.

## Archivos principales

- `packages/domain/src/data/source-definition.ts`
- `packages/domain/src/data/index.ts`
- `packages/domain/src/contracts/data-definition.ts`
- `packages/application/src/data/index.ts`
- `packages/application/src/connector-registry.ts`
- `packages/connectors/package.json`
- `packages/connectors/src/index.ts`
- `packages/data-web/src/data-source-repository.ts`
- `packages/data-web/src/index.ts`
- `apps/studio/src/features/data/data-source-runtime.ts`
- `apps/studio/src/features/data/data-sources-workspace.tsx`
- `apps/studio/src/features/data/data-sources-workspace.css`
- `apps/studio/src/help/help-registry.ts`
- `apps/studio/src/shell/app-shell-route.tsx`
- `tooling/package-boundaries.json`
- `tsconfig.base.json`

## Validación pendiente de fase

El nuevo workspace `packages/connectors` requiere que el `package-lock.json` se regenere de forma reproducible antes del Gate F08. El entorno actual no puede acceder a GitHub/npm para ejecutar el toolchain local completo. No se abre PR ni se usa Actions por microfase; el lockfile, Prettier y suite completa se resolverán/certificarán en el gate único F08.

## Siguiente microfase exacta

`M08.2 — Fuente interna ElectroCraft Data sobre PGlite`.
