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
- M08.10 — Taxonomías dentro de Modelos: `ACTIVE`.

## Rama activa

`codex/m08-10-taxonomies`

## Último cierre certificado

M08.9 fue certificada por ElectroCraft Base CI run `33812380216` (#878): documentación, lint, typecheck, tests, build, las `121` pruebas Playwright, empty-repo y artifacts terminaron en `success`. PR `#75` se fusionó por squash a `main` en `93440130d8c5fd62f73366925df7695dd309daf3`.

## M08.10 — owner y alcance

Owner: `PGlite generic content store` existente, accesible mediante el adapter interno y el `ConnectorRegistry` certificados.

- `ElectroTaxonomy` será metadata canónica portable asociada a modelos por refs.
- los términos persistirán en el store genérico `taxonomy_terms`, con jerarquía por `parentId`.
- definición de taxonomía y administración contextual de términos permanecerán separadas en Studio.
- no se permite DDL dinámico, internals del engine ni un registry paralelo al ConnectorRegistry.

## Evidencia F08 reciente

- `.ai/evidence/F08/M08.6/CLOSURE_2026-09-03.md`
- `.ai/evidence/F08/M08.7/IMPLEMENTATION_2026-09-03.md`
- `.ai/evidence/F08/M08.7/CLOSURE_2026-09-03.md`
- `.ai/evidence/F08/M08.8/CLOSURE_2026-09-03.md`
- `.ai/evidence/F08/M08.9/IMPLEMENTATION_2026-09-03.md`
- `.ai/evidence/F08/M08.9/CLOSURE_2026-09-03.md`

## Siguiente transición

Inspeccionar contratos/storage/UI existentes, verificar la API oficial del owner y ejecutar `M08.10 — Taxonomías dentro de Modelos` sin abrir un subsystem paralelo.
