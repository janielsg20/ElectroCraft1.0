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
- M08.11 — Relaciones 1:1, 1:N y N:N: `ACTIVE / IMPLEMENTADA / PENDIENTE GATE`.

## Rama activa

`codex/m08-11-relations`

## Último cierre certificado

M08.10 fue certificada por ElectroCraft Base CI run `33896051996` (#882): documentación, lint, typecheck, tests, build, las `123` pruebas Playwright, empty-repo y artifacts terminaron en `success`. PR `#76` se fusionó por squash a `main` en `78c88b65ef8708575ea2885edf7ad6631a30afce`.

## M08.11 — owner y alcance

Owner: `PGlite generic content store` existente, accesible mediante el adapter interno y el `ConnectorRegistry` certificados.

- `ElectroRelation` es metadata canónica portable con origen, destino, cardinalidad, inverso, integridad y permisos.
- todos los vínculos persisten en la tabla genérica existente `relation_edges`.
- cardinalidad `1:1`, `1:N` y `N:N` se valida en aplicación/repositorio, nunca mediante DDL por relación.
- `restrict`, `detach` y `cascade` expresan integridad de borrado observable.
- Studio expone `Datos > Modelos > <modelo> > Relaciones` y selectores de registros.
- Data Explorer descubre las relaciones como recursos `relation:<id>` detrás del mismo ConnectorRegistry.
- no se permite un segundo store, un registry paralelo, internals PGlite ni secretos persistidos.

## Evidencia F08 reciente

- `.ai/evidence/F08/M08.9/CLOSURE_2026-09-03.md`
- `.ai/evidence/F08/M08.10/IMPLEMENTATION_2026-09-04.md`
- `.ai/evidence/F08/M08.10/CLOSURE_2026-09-04.md`
- `.ai/evidence/F08/M08.11/IMPLEMENTATION_2026-09-04.md`

## Siguiente transición

M08.11 está implementada en `codex/m08-11-relations` pero no está cerrada. Revisar formato/tipos estáticos, publicar una única candidata y ejecutar ElectroCraft Base CI completo. Solo con gate GREEN registrar cierre, fusionar y activar `M08.12`.
