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
- M08.8 — Modelos de datos y Field Registry: `ACTIVE`.

## Rama activa

`codex/m08-8-data-models-field-registry`

## Último cierre certificado

M08.7 fue certificada por ElectroCraft Base CI run `33792230116` (#858): documentación, lint, typecheck, tests, build, Playwright repository gate, empty-repo y artifacts terminaron en `success`. PR `#73` se fusionó por squash a `main` en `7bded471c94bb50009a6b99215d6e02cb3b726b2`.

## M08.8 — owner y alcance

Owner: `PGlite generic content store` existente, accesible mediante el adapter interno y el `ConnectorRegistry` ya certificados.

- `ElectroCraftDataModel` continúa siendo el modelo canónico; se amplía, no se reemplaza.
- Field Registry define metadata portable de tipos/capacidades/validación/UX.
- Los modelos se persisten como objetos canónicos `data-schema` del proyecto.
- Los registros permanecen en `content_records`; no se crea una tabla física por modelo ni DDL dinámico.
- `storageHint` es metadata para compilers/targets, nunca DDL del Studio.
- Studio implementa `Datos > Modelos` con lista + detalle y Progressive Disclosure.
- Rename/delete de campos debe mostrar impacto de uso/datos antes de aplicar cambios destructivos.
- Ayuda propietaria: `help.content.models`.

## Evidencia F08 reciente

- `.ai/evidence/F08/M08.6/CLOSURE_2026-09-03.md`
- `.ai/evidence/F08/M08.7/IMPLEMENTATION_2026-09-03.md`
- `.ai/evidence/F08/M08.7/CLOSURE_2026-09-03.md`

## Siguiente transición

Implementar M08.8, validar localmente todo lo disponible sin disparar Actions intermedias, publicar una única candidata y ejecutar Base CI/Playwright solo como gate de microfase. Con gate verde, fusionar y activar `M08.9 — Group, Repeater, Calculated y Conditional Fields`.
