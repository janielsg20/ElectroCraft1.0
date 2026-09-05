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
- M08.12 — CRUD de Registros y validación: `ACTIVE`.

## Rama activa

`codex/m08-12-record-crud-validation`

## Último cierre certificado

M08.11 quedó certificada tras la auditoría correctiva por ElectroCraft Base CI run `33995779383` (#900) sobre candidate `ec50b655560e749e98aead608924612346beb87d`: documentación, lint, lint offline, typecheck, boundaries, tests, build, Playwright, empty-repo y artifacts terminaron en `success`. PR `#78` se fusionó por squash a `main` en `89075e17b10332d5d6eaebbd9800f33e0987ffaf`.

## M08.11 — cierre auditado

Owner: `PGlite generic content store` existente, accesible mediante el adapter interno y el `ConnectorRegistry` certificados.

- `ElectroRelation` es metadata canónica portable con origen, destino, cardinalidad, inverso, integridad y permisos.
- todos los vínculos persisten en la tabla genérica existente `relation_edges`.
- cardinalidad `1:1`, `1:N` y `N:N` se valida en aplicación/repositorio, nunca mediante DDL por relación.
- `restrict`, `detach` y `cascade` se ejecutan de forma atómica con el borrado del registro raíz.
- cambiar cardinalidad o destino queda bloqueado mientras existan vínculos incompatibles.
- Studio expone `Datos > Modelos > <modelo> > Relaciones` y selectores de registros.
- Data Explorer descubre las relaciones como recursos `relation:<id>` detrás del mismo ConnectorRegistry.
- no se permite un segundo store, un registry paralelo, internals PGlite ni secretos persistidos.

## M08.12 — alcance activo

Owner: `PGlite generic content store` existente.

- `content_records` continúa como almacenamiento JSON físico estable.
- cada create/update debe validar contra `ElectroCraftDataSchema` antes de escribir.
- soft delete debe seguir una policy portable de estado/deletedAt sin DDL dinámico.
- `Datos > Registros` debe ofrecer DataView/lista en desktop y cards en mobile, con selector de modelo y formulario/detail.
- ningún write de UI puede saltarse service/adapter/ConnectorRegistry.

## Evidencia F08 reciente

- `.ai/evidence/F08/M08.10/CLOSURE_2026-09-04.md`
- `.ai/evidence/F08/M08.11/IMPLEMENTATION_2026-09-04.md`
- `.ai/evidence/F08/M08.11/CLOSURE_2026-09-05.md`

## Siguiente transición

Iniciar M08.12 desde `main` certificado. Leer `.ai/microphases/M08_12.md`, inspeccionar el CRUD existente de `content_records`, definir la validación canónica y la policy de soft delete sin crear otro store ni otra ruta de persistencia.
