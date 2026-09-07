# STATE — ElectroCraft

## Estado actual

- F00 — Reconocimiento, verificación y arquitectura: `COMPLETADA / GREEN`.
- F01 — Monorepo, límites, documentación y CI: `COMPLETADA / GREEN`.
- F02 — Modelo canónico del proyecto: `COMPLETADA / GREEN`.
- F03 — Design System, AppShell, español y ayuda: `COMPLETADA / GREEN`.
- F04 — Persistencia local, proyectos y revisiones: `COMPLETADA / GREEN`.
- F05 — Screen Composer con Puck: `COMPLETADA / GREEN`.
- F06 — Layout, responsive y edición avanzada: implementación fusionada; reparaciones certificadas dentro del gate F07.
- F07 — Pantallas, navegación y rutas: `COMPLETADA / GREEN`.
- F08 — Fuentes de datos, modelos, registros y conectores: `IN_PROGRESS`.
- M08.1 — Fuentes de datos y ConnectorRegistry: `IMPLEMENTADA / PENDIENTE GATE F08`.
- M08.2 — Fuente interna ElectroCraft Data sobre PGlite: `IMPLEMENTADA / PENDIENTE GATE F08`.
- M08.3 — REST API Connector y OpenAPI import: `IMPLEMENTADA / GREEN MICROFASE`.
- M08.4 — GraphQL Connector: `IMPLEMENTADA / GREEN MICROFASE`.
- M08.5 — ConnectorGateway y SecretStore: `IMPLEMENTADA / GREEN MICROFASE`.
- M08.6 — Data Explorer y prueba de operaciones: `IMPLEMENTADA / GREEN MICROFASE`.
- M08.7 — Connector SDK boundary y optional database packs: `IMPLEMENTADA / GREEN MICROFASE`.
- M08.8 — Modelos de datos y Field Registry: `IMPLEMENTADA / GREEN MICROFASE`.
- M08.9 — Group, Repeater, Calculated y Conditional Fields: `IMPLEMENTADA / GREEN MICROFASE`.
- M08.10 — Taxonomías dentro de Modelos: `IMPLEMENTADA / GREEN MICROFASE`.
- M08.11 — Relaciones 1:1, 1:N y N:N: `IMPLEMENTADA / GREEN MICROFASE`.
- M08.12 — CRUD de Registros y validación: `IMPLEMENTADA / GREEN MICROFASE`.
- M08.13 — Índice tipado para búsqueda/filtros: `ACTIVE`.

## Rama activa

`codex/m08-13-generic-field-indexer`

## Último cierre certificado

M08.12 quedó certificada por ElectroCraft Base CI run `34063642245` (#914) sobre candidate `8b9371756006a754bbbf1702cff963369eeeabd6`: documentación, lint, lint offline, typecheck, boundaries, tests, build y Playwright terminaron en `success`. PR `#79` se fusionó por squash a `main` en `096fb2bc6ae7110c899968b851728e0fa5795e96`.

## M08.12 — cierre auditado

Owner: `PGlite generic content store` existente.

- `content_records` continúa como almacenamiento JSON físico estable y `deletedAt` implementa la policy genérica de soft delete.
- create/update valida contra `ElectroCraftDataSchema` antes de escribir.
- soft delete usa `state=deleted` + `deletedAt`, sin DDL dinámico por modelo.
- `Datos > Registros` ofrece selector de modelo, list/detail, formulario generado y vista de eliminados.
- ningún write de UI salta service/adapter/ConnectorRegistry.
- integridad relacional `restrict/detach/cascade` mantiene atomicidad y comparte la policy soft-delete.
- la carrera entre una mutación activa y `Incluir eliminados` quedó serializada antes del gate final.

## M08.13 — estado de implementación

`IN_PROGRESS / PENDIENTE GATE`.

Owner: `PGlite generic content store` existente, usando la tabla física genérica `record_field_index` ya reservada por F04.

- `GenericFieldIndexer` proyecta únicamente campos con capacidades explícitas `searchable`, `filterable`, `sortable` o `faceted`.
- las capacidades se guardan de forma portable en metadata canónica y mantienen compatibilidad con los flags heredados `indexed`/`faceted`.
- storage schema v8 añade `normalized_text` y elimina el FTS GIN de expresión heredado; no crea índices físicos por campo/modelo.
- create/update/delete mantiene registro + filas tipadas dentro de una sola transacción Drizzle/PGlite.
- cascades relacionales eliminan también sus filas de índice dentro de la transacción existente.
- query usa el índice para búsqueda normalizada, filtros configurados, orden y facetas, con fallback JSON para campos no indexados.
- el adapter interno expone estado y rebuild como recursos `index:<modelId>` detrás del mismo `ConnectorRegistry`.
- Studio incorpora `Campo > Avanzado > Búsqueda y filtros` con Searchable, Filterable, Sortable, Faceted, estado y reconstrucción.

## Evidencia F08 reciente

- `.ai/evidence/F08/M08.11/CLOSURE_2026-09-05.md`
- `.ai/evidence/F08/M08.12/IMPLEMENTATION_2026-09-05.md`
- `.ai/evidence/F08/M08.12/CLOSURE_2026-09-06.md`
- `.ai/evidence/F08/M08.13/IMPLEMENTATION_2026-09-06.md`

## Siguiente transición

Completar pruebas y evidencia de M08.13, ejecutar un único ElectroCraft Base CI completo y, solo con gate GREEN, registrar cierre, fusionar y activar M08.14.
