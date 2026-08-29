# TRACKING — ElectroCraft current position

Date: 2026-08-29.

| Scope | Estado | Evidencia |
| --- | --- | --- |
| F00 | COMPLETADA / GREEN | `.ai/evidence/F00/` |
| F01 | COMPLETADA / GREEN | `.ai/evidence/F01/` |
| F02 | COMPLETADA / GREEN | `.ai/evidence/F02/` |
| F03 / M03.1–M03.12 | COMPLETADA / GREEN | `.ai/evidence/F03/CLOSURE_2026-08-20.md` |
| F04 / M04.1–M04.8 | COMPLETADA / GREEN | `.ai/evidence/F04/CLOSURE_2026-08-25.md` |
| F05 / M05.1–M05.8 | COMPLETADA / GREEN | PR `#60`; Base CI `33101434587` |
| F06 / M06.1–M06.8 | IMPLEMENTACIÓN FUSIONADA; reparaciones certificadas en F07 | PR `#64`; Base CI F07 `33262949215` |
| F07 / M07.1–M07.8 | COMPLETADA / GREEN | PR `#68`; Base CI `33262949215`; merge `e697a42546d23f89412e6dd616018759e719e448` |
| F08 / M08.1 | IMPLEMENTADA / PENDIENTE GATE F08 | `.ai/evidence/F08/M08.1/IMPLEMENTATION_2026-08-29.md` |
| F08 / M08.2 | IMPLEMENTADA / PENDIENTE GATE F08 | `.ai/evidence/F08/M08.2/IMPLEMENTATION_2026-08-29.md` |
| F08 / M08.3 | ACTIVE — implementación funcional avanzada | `.ai/evidence/F08/M08.3/IMPLEMENTATION_2026-08-29.md` |

## Rama activa

`codex/m08-1-data-sources`

## F07 — cierre certificado

Base CI run `33262949215` (#795) terminó `success`; PR `#68` fue fusionada a `main` mediante `e697a42546d23f89412e6dd616018759e719e448`.

## F08 / M08.1

- DataSourceDefinition canónico + 11 capabilities.
- Secrets fuera del payload y authRef portable.
- DataSourceAdapter + único ConnectorRegistry.
- `packages/connectors` como paquete estable #20.
- `WebDataSourceRepository` y UI `/data-sources` responsive.
- Help `help.data.sources`.

## F08 / M08.2

- `InternalDataSourceAdapter` detrás del mismo ConnectorRegistry.
- `InternalDataRepository` sobre `content_records` PGlite/Drizzle existente.
- Schema discovery desde ElectroCraftDataSchema; no introspección física.
- CRUD/query/stats, offline, project permission boundary.
- UI `ElectroCraft Data · Local · Disponible sin conexión`, Modelos, Registros y backup.
- Help `help.data.internal`.
- Unit tests, fixture y integración PGlite real preparados.

## F08 / M08.3

- REST config/operation contracts, OpenAPI import y `RestDataSourceAdapter` reales.
- Exports públicos de `@electrocraft/connectors` completados.
- `rest.fetch` registrado en Studio sobre el mismo ConnectorRegistry.
- Wizard REST: Endpoint base → Autenticación → OpenAPI/Manual → Operaciones → Probar → Guardar.
- JSON/YAML OpenAPI, manual operations, SecretRef-only, browser/gateway behavior y resultado normalizado.
- Fixtures `rest-data-source-v1.json` + `openapi/products-v1.yaml`.
- Test suite M08.3 preparada para import, GET/POST, pagination, auth, gateway, 4xx/5xx, timeout y security.
- M08.3 permanece `ACTIVE`: falta `help.data.rest` exacto y validación ejecutable antes de declarar DONE.

## Validación

No se ejecuta Actions por microfase. El contenedor actual no resuelve `github.com`, así que solo se realizó parseo sintáctico TypeScript de los nuevos TS/TSX. El Gate F08 regenerará lockfile/formato y certificará lint/typecheck/tests/build/Playwright en una sola ejecución final de fase.

## Siguiente acción exacta

Añadir `help.data.rest`, ejecutar validación real cuando el workspace sea accesible y corregir únicamente fallos reales. Mantener M08.3 como única microfase `ACTIVE` hasta ese cierre.
