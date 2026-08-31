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
- M08.4 — GraphQL Connector: `IMPLEMENTADA / GREEN MICROFASE`.
- M08.5 — ConnectorGateway y SecretStore: `ACTIVE`.

## Rama activa

`codex/m08-5-connector-gateway-secrets`

## Último cierre certificado

M08.4 fue certificada por ElectroCraft Base CI run `33412562136` (#834): documentación, lint, typecheck, 518/518 Vitest, build, Playwright, empty-repo y artifacts terminaron en `success`. PR `#70` se fusionó mediante squash a `main` en `6b79ee859c9d0f4f712d897b4cc973bcc388cefb`.

## F08 implementado hasta M08.4

- DataSourceDefinition canónico + único ConnectorRegistry.
- ElectroCraft Data usa PGlite/Drizzle y `content_records` existente.
- REST usa Web Fetch API + OpenAPI con SecretRef/Gateway fail-closed.
- GraphQL usa Fetch, Query/Mutation, variables tipadas e introspection sobre el mismo DataSourceAdapter/ConnectorRegistry.

## M08.5 implementación activa

Owner: `ConnectorGatewayPort + SecretStorePort`.

- `SecretRef` portable separa metadata/binding/scope del valor secreto.
- `SecretStorePort` permite write/status/remove y resolución únicamente para ejecución server-side; Studio consume solo el subset admin sin read-back.
- `ConnectorGatewayPort` común expone REST y GraphQL sin crear otro registry.
- `ServerEnvironmentSecretStore` aporta adapter de desarrollo server-env; write queda deshabilitado salvo host explícitamente mutable.
- `ServerConnectorGateway` resuelve SecretRef, inyecta credenciales server-side y normaliza REST/GraphQL sin retornar secretos.
- Handler HTTP Web-standard + clientes browser conectan Studio con un Gateway alojado por servidor/secret manager.
- REST y GraphQL se adaptan al port común mediante bridges, preservando los adapters certificados.
- `.env.example` contiene solo URL pública del Gateway y convención de nombres, nunca valores.
- Settings ya incluye Gateway de conectores / Secretos, Desarrollo/Producción, estado, crear referencia y crear/reemplazar/eliminar valor sin read-back.
- Fixture y Vitest M08.5 cubren write/no readback, environment resolution, auth injection, HTTP round-trip y secret scan básico.

## Validación pendiente

M08.5 permanece `ACTIVE`. No ejecutar GitHub Actions por cada incremento. Antes de declararla GREEN faltan HelpRegistry `help.data.secrets`, E2E responsive/UI, revisión de export/bundle leak scan y gate ejecutable final de la microfase.

## Evidencia F08

- `.ai/evidence/F08/M08.1/IMPLEMENTATION_2026-08-29.md`
- `.ai/evidence/F08/M08.2/IMPLEMENTATION_2026-08-29.md`
- `.ai/evidence/F08/M08.3/IMPLEMENTATION_2026-08-29.md`
- `.ai/evidence/F08/M08.4/IMPLEMENTATION_2026-08-31.md`
- `.ai/evidence/F08/M08.5/IMPLEMENTATION_2026-08-31.md`

## Siguiente transición

Completar Help `help.data.secrets`, E2E/settings responsive, export/log/bundle leak scan y validación real de M08.5. Solo con gate verde cerrar M08.5 y activar `M08.6 — Data Explorer y prueba de operaciones`.
