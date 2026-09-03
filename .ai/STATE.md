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
- M08.5 — ConnectorGateway y SecretStore: `IMPLEMENTADA / GREEN MICROFASE`.
- M08.6 — Data Explorer y prueba de operaciones: `ACTIVE`.

## Rama activa

`codex/m08-6-data-explorer`

## Último cierre certificado

M08.5 fue certificada por ElectroCraft Base CI run `33685072920` (#837): documentación, lint, typecheck, 525/525 Vitest, build, secret leak scan, Playwright, empty-repo y artifacts terminaron en `success`. PR `#71` se fusionó mediante squash a `main` en `64da0f30d46730b9f29a4cc05edaf941b0714e85`.

## F08 implementado hasta M08.5

- DataSourceDefinition canónico + único ConnectorRegistry.
- ElectroCraft Data usa PGlite/Drizzle y `content_records` existente.
- REST usa Web Fetch API + OpenAPI con SecretRef/Gateway fail-closed.
- GraphQL usa Fetch, Query/Mutation, variables tipadas e introspection sobre el mismo DataSourceAdapter/ConnectorRegistry.
- `SecretRef` portable separa metadata/binding/scope del valor secreto.
- `SecretStorePort` permite write/status/remove y resolución únicamente para ejecución server-side; Studio consume solo el subset admin sin read-back.
- `ConnectorGatewayPort` común expone REST y GraphQL sin crear otro registry.
- `ServerEnvironmentSecretStore` aporta adapter de desarrollo server-env; write queda deshabilitado salvo host explícitamente mutable.
- `ServerConnectorGateway` resuelve SecretRef, inyecta credenciales server-side y normaliza REST/GraphQL sin retornar secretos.
- Handler HTTP Web-standard + clientes browser conectan Studio con un Gateway alojado por servidor/secret manager.
- REST y GraphQL se adaptan al port común mediante bridges, preservando los adapters certificados.
- `.env.example` contiene solo URL pública del Gateway y convención de nombres, nunca valores.
- Settings ya incluye Gateway de conectores / Secretos, Desarrollo/Producción, estado, crear referencia y crear/reemplazar/eliminar valor sin read-back.
- Fixture y Vitest M08.5 cubren write/no readback, environment resolution, auth injection, HTTP round-trip, ExportIR/logs y secret leak scan del bundle.

## M08.6 candidata a cierre

Owner: `ConnectorRegistry + DataSourceAdapter`.

- ruta: `Datos > Fuentes de datos > <fuente> > Explorar`;
- resources/operations a la izquierda, parámetros y ejecución explícita al centro, resultado tabla/JSON a la derecha;
- mutaciones requieren confirmación;
- trace avanzado debe permanecer sanitizado;
- `Crear consulta desde esta operación` produce un Draft `QueryDefinition`;
- no convertir Explorer en runtime de producción ni auto-ejecutar mutaciones.
- implementación, lint, typecheck, build y `529/529` pruebas Vitest están verdes localmente;
- E2E real está preparado y espera Chromium/Base CI para certificación y captura.

## Evidencia F08

- `.ai/evidence/F08/M08.1/IMPLEMENTATION_2026-08-29.md`
- `.ai/evidence/F08/M08.2/IMPLEMENTATION_2026-08-29.md`
- `.ai/evidence/F08/M08.3/IMPLEMENTATION_2026-08-29.md`
- `.ai/evidence/F08/M08.4/IMPLEMENTATION_2026-08-31.md`
- `.ai/evidence/F08/M08.5/IMPLEMENTATION_2026-08-31.md`
- `.ai/evidence/F08/M08.5/VALIDATION_2026-09-02.md`
- `.ai/evidence/F08/M08.5/secret-leak-scan.json`
- `.ai/evidence/F08/M08.5/CLOSURE_2026-09-02.md`
- `.ai/evidence/F08/M08.6/IMPLEMENTATION_2026-09-03.md`
- `.ai/evidence/F08/M08.6/VALIDATION_2026-09-03.md`

## Siguiente transición

Publicar la candidata M08.6, ejecutar una sola Base CI con Playwright y corregir únicamente cualquier fallo observado antes de fusionar/certificar.
