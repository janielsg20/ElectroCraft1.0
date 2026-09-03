# TRACKING — ElectroCraft current position

Date: 2026-09-03.

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
| F08 / M08.4 | IMPLEMENTADA / GREEN MICROFASE | PR `#70`; Base CI `33412562136` (#834); merge `6b79ee859c9d0f4f712d897b4cc973bcc388cefb` |
| F08 / M08.5 | IMPLEMENTADA / GREEN MICROFASE | PR `#71`; Base CI `33685072920` (#837); merge `64da0f30d46730b9f29a4cc05edaf941b0714e85` |
| F08 / M08.6 | ACTIVE | `.ai/evidence/F08/M08.6/IMPLEMENTATION_2026-09-03.md` |

## Rama activa

`codex/m08-6-data-explorer`

## M08.4 — cierre certificado

- GraphQL Fetch, Query/Mutation, variables tipadas, introspection, Gateway fail-closed, wizard y Help quedaron certificados.
- Base CI `33412562136` (#834) terminó documentación, lint, typecheck, 518/518 Vitest, build, Playwright, empty-repo y artifacts en `success`.
- PR `#70` fue fusionada por squash a `main` en `6b79ee859c9d0f4f712d897b4cc973bcc388cefb`.

## M08.5 — cierre certificado

- `packages/domain/src/data/secrets.ts`: `SecretRef`, binding bearer/header/query, scopes Desarrollo/Producción y nombres de server env deterministas.
- `packages/application/src/data/secret-store.ts`: `SecretStorePort`, subset `SecretStoreAdminPort` y persistencia exclusiva de metadata `secret-ref`.
- `packages/application/src/data/connector-gateway.ts`: único `ConnectorGatewayPort` REST/GraphQL.
- `packages/connectors/src/server-secret-store.ts`: adapter server-env; read-back no forma parte del admin UI.
- `packages/connectors/src/server-connector-gateway.ts`: resolución de SecretRef + inyección server-side + respuesta tipada sin credential echo.
- `packages/connectors/src/connector-gateway-http-handler.ts`: handler Web-standard para status/execute/secrets.
- `packages/connectors/src/connector-gateway-bridge.ts`: adapta REST/GraphQL certificados al único port común.
- `packages/data-web/src/browser-connector-gateway.ts`: cliente browser del Gateway y admin de secretos sin resolve/read.
- Studio configura el Gateway solo por `VITE_ELECTROCRAFT_CONNECTOR_GATEWAY_URL`; ausencia de URL mantiene fail-closed.
- Settings incluye Gateway de conectores, Secretos, Desarrollo, Producción, Configurado/Falta configuración y Probar conexión.
- `.env.example` no contiene valores.
- Fixture `secret-ref-v1.json` + `m08-5-connector-gateway-secrets.test.ts` certificados.
- `build:studio` ejecuta el scan reproducible de bundle/source maps/PWA.
- Base CI `33685072920` (#837) terminó documentación, lint, typecheck, 525/525 Vitest, build, leak scan, Playwright, empty-repo y artifacts en `success`.
- PR `#71` se fusionó por squash a `main` en `64da0f30d46730b9f29a4cc05edaf941b0714e85`.

## F08 / M08.6 — Data Explorer y prueba de operaciones

- Owner: `ConnectorRegistry + DataSourceAdapter` existentes.
- `packages/domain/src/data/explorer.ts` define operation/parameter descriptors portables.
- `packages/application/src/data/data-explorer.ts` ejecuta por ConnectorRegistry, mide tiempo, sanitiza y trunca.
- Internal/REST/GraphQL exponen parámetros reales desde sus adapters/repository existentes.
- Studio incluye layout de tres paneles, tabla/JSON, estados españoles y `help.data.explorer`.
- Mutaciones requieren confirmación explícita; no hay auto-run.
- `Crear consulta desde esta operación` persiste Draft QueryDefinition canónico.
- Local: lint, typecheck, build, Node `41/41` y Vitest `529/529` verdes.
- E2E real preparado; el contenedor local no incluye Chromium y Base CI es el gate pendiente.

## Siguiente acción exacta

Publicar la rama candidata, abrir PR M08.6 y ejecutar Base CI una sola vez para validar Playwright, artifacts y el resto del gate antes de fusionar.
