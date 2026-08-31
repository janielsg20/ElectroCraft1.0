# HANDOFF — ElectroCraft

## Current

F08 / M08.5 — ConnectorGateway y SecretStore — `ACTIVE`.

Rama activa: `codex/m08-5-connector-gateway-secrets`.

M08.4 quedó certificada por ElectroCraft Base CI `33412562136` (#834) y PR `#70` fusionada por squash a `main` en `6b79ee859c9d0f4f712d897b4cc973bcc388cefb`.

## M08.5 owner y límites

Owner: `ConnectorGatewayPort + SecretStorePort`.

- reutiliza el único `ConnectorRegistry` y los DataSourceAdapter REST/GraphQL existentes;
- `SecretRef` es metadata portable, nunca el valor;
- Studio solo usa `SecretStoreAdminPort` (write/status/remove), sin operación de resolve/read-back;
- resolución del valor ocurre únicamente server-side dentro de ConnectorGateway;
- `ServerEnvironmentSecretStore` es válido para desarrollo; producción debe alojar el mismo port sobre un secret manager/server seguro;
- no `localStorage` para secretos;
- `.env.example` solo documenta nombres y URL de Gateway.

## Implementación actual

1. `packages/domain/src/data/secrets.ts`: SecretRef, scopes y binding;
2. `packages/application/src/data/secret-store.ts`: SecretStorePort/AdminPort;
3. `packages/application/src/data/connector-gateway.ts`: Gateway común REST/GraphQL;
4. server-env SecretStore;
5. server ConnectorGateway con inyección de credencial sin echo;
6. handler HTTP Web-standard;
7. cliente browser Gateway + secret admin;
8. bridges que conectan REST/GraphQL certificados al port común;
9. Studio activa Gateway por `VITE_ELECTROCRAFT_CONNECTOR_GATEWAY_URL` o permanece fail-closed;
10. Settings UI con Gateway/Secretos/Desarrollo/Producción, estado, creación de refs y reemplazo sin read-back;
11. fixture y Vitest de seguridad/runtime preparados.

## Pendiente

- HelpRegistry `help.data.secrets` y trigger contextual exacto;
- E2E desktop/mobile de Settings;
- bundle/export/log secret scan;
- validación ejecutable de M08.5.

No declarar GREEN ni activar M08.6 antes de ese gate.

## Read set

`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/phases/F08.md → .ai/microphases/M08_5.md → packages/domain/src/data/secrets.ts → packages/application/src/data/{connector-gateway,secret-store}.ts → packages/connectors/src/{server-secret-store,server-connector-gateway,connector-gateway-http-handler,connector-gateway-bridge}.ts → packages/data-web/src/browser-connector-gateway.ts → apps/studio/src/features/data/data-integrations-* → apps/studio/src/help → tooling/vitest → tooling/playwright`.
