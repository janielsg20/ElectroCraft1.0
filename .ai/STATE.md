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
- M08.6 — Data Explorer y prueba de operaciones: `IMPLEMENTADA / GREEN MICROFASE`.
- M08.7 — Connector SDK boundary y optional database packs: `ACTIVE`.

## Rama activa

`codex/m08-7-connector-sdk-packs`

Estado de implementación M08.7: `IMPLEMENTADA / CANDIDATA A VALIDACIÓN`.

## Último cierre certificado

M08.6 fue certificada por ElectroCraft Base CI run `33776935165`: documentación, lint, typecheck, tests, build, Playwright repository gate, empty-repo y artifacts terminaron en `success`. PR `#72` se fusionó por squash a `main` en `d89235f36f81fd91f9d8d676191c8ab52dbf7804`.

## F08 implementado hasta M08.6

- DataSourceDefinition canónico + único ConnectorRegistry.
- ElectroCraft Data usa PGlite/Drizzle y `content_records` existente.
- REST usa Web Fetch API + OpenAPI con SecretRef/Gateway fail-closed.
- GraphQL usa Fetch, Query/Mutation, variables tipadas e introspection sobre el mismo DataSourceAdapter/ConnectorRegistry.
- `SecretRef` portable separa metadata/binding/scope del valor secreto.
- `SecretStorePort` permite write/status/remove y resolución únicamente para ejecución server-side; Studio consume solo el subset admin sin read-back.
- `ConnectorGatewayPort` común expone REST y GraphQL sin crear otro registry.
- Data Explorer usa resources/operations reales, ejecución explícita, confirmación de mutaciones, traza sanitizada/truncada y handoff a Draft QueryDefinition canónico.

## M08.7 candidata a validación

Owner: `ConnectorRegistry + ElectroCraftExtensionPackage`.

- `ConnectorExtensionManifest` define adapter/source kind/config schema/capabilities/Gateway/runtime/target support sin secretos embebidos;
- `ConnectorExtensionRegistry` instala adapters reales sobre el único ConnectorRegistry, valida manifest/source, bloquea uninstall en uso y diagnostica connector ausente;
- `pruneRuntimeDependencies()` conserva solo runtime/gateway de conectores usados;
- `packages/data-web` expone catálogo Core/Extensión basado en estado real;
- Studio añade `Datos > Fuentes de datos > Nueva fuente > Más conectores`;
- PostgreSQL/MySQL permanecen packs opcionales y ningún driver SQL fue añadido a Core;
- `help.data.connectors` está conectado al HelpRegistry;
- tests M08.7 cubren installed/missing/uninstall/pruning/config/SecretRef/read-create/security y contrato UI.

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
- `.ai/evidence/F08/M08.6/CLOSURE_2026-09-03.md`
- `.ai/evidence/F08/M08.7/IMPLEMENTATION_2026-09-03.md`

## Siguiente transición

Validar la candidata M08.7 con lint, typecheck, tests y build; después ejecutar ElectroCraft Base CI/Playwright. Solo con gate verde fusionar y activar `M08.8 — Modelos de datos y Field Registry`.
