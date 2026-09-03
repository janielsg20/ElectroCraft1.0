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
- M08.9 — Group, Repeater, Calculated y Conditional Fields: `ACTIVE`.

## Rama activa

`codex/m08-9-advanced-fields`

## Último cierre certificado

M08.8 fue certificada por ElectroCraft Base CI run `33804227049` (#875): documentación, lint, typecheck, tests, build, Playwright repository gate, empty-repo y artifacts terminaron en `success`. PR `#74` se fusionó por squash a `main` en `8225f3aa5797972265a470f49c8aff75c5bab87c`.

## M08.9 — owner y alcance

Owner: `PGlite generic content store` existente, accesible mediante el adapter interno y el `ConnectorRegistry` certificados.

- Group/Repeater son estructuras de campos anidados con orden portable.
- Calculated ejecuta solo operaciones registradas; Conditional interpreta un rule AST tipado sin `eval`.
- Dependencias, ciclos, scopes y validación anidada fallan cerrados antes de persistir.
- El adapter interno normaliza create/update antes de escribir en `content_records`.
- Studio integra estructura, dependencias y alternativa accesible de reordenamiento en `Datos > Modelos > Campos`.
- No hay DDL dinámico, tablas por campo/modelo ni valores secretos en el schema.

## Evidencia F08 reciente

- `.ai/evidence/F08/M08.6/CLOSURE_2026-09-03.md`
- `.ai/evidence/F08/M08.7/IMPLEMENTATION_2026-09-03.md`
- `.ai/evidence/F08/M08.7/CLOSURE_2026-09-03.md`
- `.ai/evidence/F08/M08.8/CLOSURE_2026-09-03.md`
- `.ai/evidence/F08/M08.9/IMPLEMENTATION_2026-09-03.md`

## Siguiente transición

Publicar una única candidata M08.9 y ejecutar Base CI/Playwright como gate final. Con gate verde, fusionar y activar `M08.10 — Taxonomías dentro de Modelos`.
