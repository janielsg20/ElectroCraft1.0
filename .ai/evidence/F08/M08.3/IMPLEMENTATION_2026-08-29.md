# M08.3 — REST API Connector y OpenAPI import — implementación en progreso

Fecha: 2026-08-29
Rama: `codex/m08-1-data-sources`
Estado: `ACTIVE` — implementación funcional avanzada; cierre/gate todavía pendiente.

## Engine/API verificados

- Web Fetch API para ejecución directa en navegador.
- `DataSourceAdapter` + `ConnectorRegistry` como boundary único de ElectroCraft.
- `@scalar/openapi-parser@0.28.11` mediante `dereference()` para OpenAPI/Swagger JSON/YAML.
- La API pública de Scalar fue revalidada el 2026-08-29 contra el repositorio oficial actual; `dereference(specification)` sigue devolviendo `schema` + `errors` y la línea 0.28.x permanece compatible con el adapter implementado.

## Implementación existente y consolidada

- `packages/domain/src/data/rest.ts`
  - config REST portable;
  - métodos GET/POST/PUT/PATCH/DELETE;
  - path/query/header parameters tipados;
  - pagination hints page/offset/cursor;
  - bloqueo de headers sensibles.
- `packages/connectors/src/openapi-import-adapter.ts`
  - importa OpenAPI/Swagger mediante Scalar;
  - deriva base URL, operations, schemas, params, auth y pagination hints;
  - elimina headers de autenticación del contrato portable.
- `packages/connectors/src/rest-data-source-adapter.ts`
  - browser fetch;
  - timeout;
  - normalización HTTP 4xx/5xx;
  - typed input path/query/header/body;
  - `authRef` fail-closed;
  - ConnectorGateway explícito/fallback en modo auto;
  - resultado normalizado `ElectroCraftRestDataResult`.

## Cambios de esta continuación

- `packages/connectors/src/index.ts`
  - exporta públicamente REST adapter y OpenAPI importer; no se consumen internals por path privado.
- `apps/studio/src/features/data/studio-data-source-adapters.ts`
  - registra `rest.fetch` una sola vez en el mismo `ConnectorRegistry` del Studio.
- `apps/studio/src/features/data/rest-source-wizard.tsx`
  - wizard funcional: Endpoint base → Autenticación → OpenAPI/Manual → Operaciones → Probar → Guardar;
  - OpenAPI JSON/YAML conectado al import adapter real;
  - manual operations GET/POST/PUT/PATCH/DELETE;
  - path params tipados inferidos;
  - SecretRef solo como referencia; nunca token/API key/password;
  - prueba mediante `RestDataSourceAdapter` real;
  - aviso explícito para operaciones de escritura;
  - guarda mediante el runtime canónico del proyecto.
- `apps/studio/src/features/data/rest-source-wizard.css`
  - desktop hasta 820px;
  - mobile full-screen;
  - touch targets y reduced-motion.
- `apps/studio/src/features/data/data-sources-workspace.tsx`
  - `Nueva fuente` abre el wizard REST real;
  - conserva List/Detail/Inspector y ElectroCraft Data existente.
- Fixtures:
  - `tooling/fixtures/canonical-model/rest-data-source-v1.json`;
  - `tooling/fixtures/openapi/products-v1.yaml`.
- Tests preparados:
  - `tooling/vitest/unit/m08-3-rest-data-adapter.test.ts`;
  - OpenAPI import;
  - GET/POST + pagination;
  - authRef missing;
  - Gateway;
  - 4xx/5xx;
  - timeout;
  - bloqueo de secret headers;
  - contrato visible del wizard/registro Studio.

## Seguridad

- No se persisten bearer tokens, API keys, passwords ni cookies.
- `Authorization`, `X-Api-Key`, cookies y headers equivalentes se rechazan en config portable.
- Operaciones `requiresAuth` sin `authRef` fallan cerradas.
- `authRef` no contiene valor secreto; apunta a un ElectroCraft Object ID.
- CORS/red privada no se disfraza como éxito: modo `auto` exige ConnectorGateway cuando Fetch no puede ejecutar.

## Validación realizada en esta sesión

El contenedor disponible no resuelve `github.com`, por lo que no fue posible clonar/instalar el workspace para ejecutar la suite real sin recurrir a GitHub Actions. Se respetó la regla de no ejecutar Actions por microfase.

Sí se ejecutó validación sintáctica local con TypeScript 5.8.3 (`transpileModule`) sobre los nuevos TS/TSX y no se detectaron errores de parseo.

No se declara `GREEN` ni `DONE` sin lint/typecheck/Vitest/build reales.

## Pendiente antes de cerrar M08.3

1. Crear el descriptor Help exacto `help.data.rest` y usarlo en el wizard.
2. Ejecutar lint/typecheck/Vitest/build cuando el workspace sea ejecutable o dentro del gate acordado sin duplicar CI.
3. Corregir cualquier error real hallado por esa validación.
4. Mantener `M08.3` como única microfase `ACTIVE` hasta evidencia verde.
5. No activar M08.4 antes del cierre real de M08.3.
