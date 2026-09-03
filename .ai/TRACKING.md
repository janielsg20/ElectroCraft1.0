# TRACKING — ElectroCraft current position

Date: 2026-09-03.

| Scope | Estado | Evidencia |
| --- | --- | --- |
| F00 | COMPLETADA / GREEN | `.ai/evidence/F00/` |
| F01 | COMPLETADA / GREEN | `.ai/evidence/F01/` |
| F02 | COMPLETADA / GREEN | `.ai/evidence/F02/` |
| F03 / M03.1–M03.12 | COMPLETADA / GREEN | `.ai/evidence/F03/CLOSURE_2026-08-20.md` |
| F04 / M04.1–M04.8 | COMPLETADA / GREEN | `.ai/evidence/F04/CLOSURE_2026-08-25.md` |
| F05 / M05.1–M05.8 | COMPLETADA / GREEN | PR `#60`; Base CI `33101434587` |
| F06 / M06.1–M06.8 | IMPLEMENTACIÓN FUSIONADA; reparaciones certificadas en F07 | PR `#64`; Base CI F07 `33262949215` |
| F07 / M07.1–M07.8 | COMPLETADA / GREEN | PR `#68`; Base CI `33262949215` |
| F08 / M08.1 | IMPLEMENTADA / PENDIENTE GATE F08 | `.ai/evidence/F08/M08.1/IMPLEMENTATION_2026-08-29.md` |
| F08 / M08.2 | IMPLEMENTADA / PENDIENTE GATE F08 | `.ai/evidence/F08/M08.2/IMPLEMENTATION_2026-08-29.md` |
| F08 / M08.3 | IMPLEMENTADA / GREEN MICROFASE | PR `#69`; Base CI `33326524968` (#818) |
| F08 / M08.4 | IMPLEMENTADA / GREEN MICROFASE | PR `#70`; Base CI `33412562136` (#834) |
| F08 / M08.5 | IMPLEMENTADA / GREEN MICROFASE | PR `#71`; Base CI `33685072920` (#837) |
| F08 / M08.6 | IMPLEMENTADA / GREEN MICROFASE | PR `#72`; Base CI `33776935165` |
| F08 / M08.7 | IMPLEMENTADA / GREEN MICROFASE | PR `#73`; Base CI `33792230116` (#858); merge `7bded471c94bb50009a6b99215d6e02cb3b726b2`; `.ai/evidence/F08/M08.7/CLOSURE_2026-09-03.md` |
| F08 / M08.8 | ACTIVE | `.ai/microphases/M08_8.md` |

## Rama activa

`codex/m08-8-data-models-field-registry`

## M08.7 — cierre certificado

- Owner: `ConnectorRegistry + ElectroCraftExtensionPackage`.
- El único `ConnectorRegistry` instala adapters de extensión reales y falla cerrado cuando un connector requerido no existe.
- PostgreSQL/MySQL permanecen packs opcionales, sin drivers SQL embebidos en Core.
- SQL exige `ConnectorGateway` + `SecretRef`; uninstall en uso queda bloqueado.
- `pruneRuntimeDependencies()` mantiene solo dependencias de packs realmente usados.
- Studio incluye `Más conectores` y `help.data.connectors`.
- Base CI `33792230116` (#858) terminó documentación, lint, typecheck, tests, build, Playwright repository gate, empty-repo y artifacts en `success`.
- PR `#73` se fusionó por squash a `main` en `7bded471c94bb50009a6b99215d6e02cb3b726b2`.

## M08.8 — implementación activa

Owner: `PGlite generic content store`.

- ampliar `ElectroCraftDataModel` y el contrato de campos sin romper schemas REST/GraphQL existentes;
- crear Field Registry portable con families, validación, opciones, permissions e indexing;
- mantener `content_records` como store físico genérico y `data-schema` como metadata canónica;
- implementar `Datos > Modelos` con lista 280–320 px, detalle por tabs y estados responsive/accessibles;
- mostrar impacto de datos antes de rename/delete de campos;
- registrar `help.content.models`;
- añadir unit/contract, integration PGlite y E2E antes del gate.

## Validación de engine

La API oficial actual de PGlite confirma soporte de Drizzle, persistencia browser, consultas y transacciones. M08.8 reutiliza ese engine; no introduce DDL dinámico ni un ORM/store paralelo.

## Siguiente acción exacta

Completar la implementación de M08.8 en esta rama, preparar evidence y ejecutar una única Base CI/Playwright al finalizar la microfase. Si queda verde, fusionar y activar `M08.9`.
