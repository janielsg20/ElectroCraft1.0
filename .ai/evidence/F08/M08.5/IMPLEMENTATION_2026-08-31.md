# M08.5 — ConnectorGateway y SecretStore — implementación activa

Fecha: 2026-08-31
Rama: `codex/m08-5-connector-gateway-secrets`
Estado: `ACTIVE` — implementación funcional en progreso; no GREEN todavía.

## Owner

`ConnectorGatewayPort + SecretStorePort`.

No se crea un segundo ConnectorRegistry ni un segundo DataSource runtime.

## Contratos

- `packages/domain/src/data/secrets.ts`
  - `ElectroCraftSecretRef` portable;
  - scopes `development|production`;
  - Preview resuelve contra Desarrollo;
  - bindings bearer/header/query;
  - convención determinista de server env.
- `packages/application/src/data/secret-store.ts`
  - `SecretStorePort` server-side;
  - `SecretStoreAdminPort` limitado a write/status/remove;
  - helper de persistencia `secret-ref` que contiene únicamente metadata.
- `packages/application/src/data/connector-gateway.ts`
  - `ConnectorGatewayPort` único con REST y GraphQL.

## Implementación server/browser

- `packages/connectors/src/server-secret-store.ts`
  - adapter server-env para desarrollo;
  - write deshabilitado por defecto;
  - resolve solo server-side.
- `packages/connectors/src/server-connector-gateway.ts`
  - resuelve SecretRef por ID;
  - obtiene el valor desde SecretStore;
  - inyecta bearer/header/query exclusivamente en servidor;
  - REST/GraphQL retornan resultados tipados con `transport: gateway` y sin credential echo.
- `packages/connectors/src/connector-gateway-http-handler.ts`
  - Web Request/Response handler para status/execute/secrets;
  - respuestas de write/status nunca incluyen value.
- `packages/connectors/src/connector-gateway-bridge.ts`
  - conecta los adapters REST/GraphQL certificados al port común.
- `packages/data-web/src/browser-connector-gateway.ts`
  - cliente browser de Gateway;
  - cliente admin de secretos sin operación resolve/read.

## Studio

- `studio-data-source-adapters.ts` usa `VITE_ELECTROCRAFT_CONNECTOR_GATEWAY_URL` para crear un único browser Gateway.
- Sin URL, REST/GraphQL mantienen comportamiento fail-closed para fuentes que requieren Gateway.
- `data-integrations-runtime.ts` persiste solo `secret-ref` y envía valores directamente al secret admin.
- `data-integrations-settings.tsx` añade en Configuración:
  - Gateway de conectores;
  - Secretos;
  - Desarrollo / Producción;
  - Configurado / Falta configuración;
  - Probar conexión;
  - crear referencia;
  - crear/reemplazar/eliminar valor sin read-back.
- `.env.example` contiene solo URL pública y convención de nombres.

## Seguridad

- ningún valor secreto se escribe en DataSourceDefinition, SecretRef, `.env.example`, localStorage ni snapshot UI;
- UI usa `type=password` y limpia el valor antes de esperar la respuesta;
- browser no expone `SecretStorePort.resolve`;
- Gateway no devuelve headers autorizados ni valores resueltos;
- errores de Gateway no incluyen el valor secreto.

## Fixtures/tests preparados

- `tooling/fixtures/canonical-model/secret-ref-v1.json`.
- `tooling/vitest/unit/m08-5-connector-gateway-secrets.test.ts`:
  - secret write/no read-back;
  - Preview → Development environment resolution;
  - server-side bearer injection;
  - browser ↔ HTTP handler ↔ server Gateway round-trip;
  - remove/status;
  - DataSource config secret rejection;
  - `.env.example` y source localStorage scan.

## Pendiente antes de GREEN

1. Publicar el cierre candidato con el gate de fugas integrado.
2. Ejecutar ElectroCraft Base CI una sola vez sobre ese commit.
3. Registrar el run GREEN antes de activar M08.6.

Help, E2E responsive, capturas y el scan explícito de export/bundle/logs ya están implementados. La evidencia ejecutable actual vive en `VALIDATION_2026-09-02.md` y `secret-leak-scan.json`. M08.5 no se declara DONE hasta que Actions valide el cierre candidato.
