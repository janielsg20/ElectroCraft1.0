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
| F08 / M08.8 | IMPLEMENTADA / GREEN MICROFASE | PR `#74`; Base CI `33804227049` (#875); merge `8225f3aa5797972265a470f49c8aff75c5bab87c`; `.ai/evidence/F08/M08.8/CLOSURE_2026-09-03.md` |
| F08 / M08.9 | IMPLEMENTADA / GREEN MICROFASE | PR `#75`; Base CI `33812380216` (#878); merge `93440130d8c5fd62f73366925df7695dd309daf3`; `.ai/evidence/F08/M08.9/CLOSURE_2026-09-03.md` |
| F08 / M08.10 | ACTIVE | `.ai/microphases/M08_10.md` |

## Rama activa

`codex/m08-10-taxonomies`

## M08.8 — cierre certificado

- Owner: `PGlite generic content store` y schema canónico `ElectroCraftDataModel`.
- Field Registry portable, modelos persistidos como `data-schema` y registros en `content_records`.
- Studio incluye `Datos > Modelos`, impacto de datos y `help.content.models`.
- Base CI `33804227049` (#875) terminó documentación, lint, typecheck, tests, build, Playwright repository gate, empty-repo y artifacts en `success`.
- PR `#74` se fusionó por squash a `main` en `8225f3aa5797972265a470f49c8aff75c5bab87c`.

## M08.9 — cierre certificado

Owner: `PGlite generic content store`.

- contratos portables para Group/Repeater/Calculated/Conditional y capability `data.advanced-fields`;
- operaciones calculadas registradas y rule AST condicional sin `eval`;
- detección de ciclos, dependencias ausentes/cross-scope y validación anidada;
- normalización create/update detrás de `InternalDataSourceAdapter`/ConnectorRegistry;
- store físico genérico `content_records`, sin DDL dinámico;
- Studio con jerarquía indentada, configuración de estructura/dependencias y reordenamiento por botones;
- unit/contract/integration PGlite verdes; E2E M08.9 preparado para el gate.
- Base CI `33810318819` (#877) validó todo salvo un locator Playwright ambiguo (`120/121` E2E).
- La adaptación acotó el assertion al panel Campos; Base CI `33812380216` (#878) terminó completo en `success` y PR `#75` se fusionó a `main`.

## M08.10 — activa

Owner: `PGlite generic content store`.

- metadata canónica `ElectroTaxonomy` y refs a modelos;
- términos en `taxonomy_terms`, jerarquía portable mediante `parentId`;
- definición y administración de términos separadas en `Datos > Modelos > <modelo> > Taxonomías`;
- adapter/repository detrás del ConnectorRegistry, sin DDL dinámico.

## Validación de engine

La API oficial actual de PGlite confirma soporte de Drizzle, persistencia browser, consultas y transacciones. M08.9 reutiliza el mismo JSONB genérico; las expresiones y reglas son lógica portable de ElectroCraft, no ejecución SQL ni código dinámico.

## Siguiente acción exacta

Inspeccionar owners existentes y API oficial de PGlite; implementar M08.10 con unit/contract/integration/E2E y mantenerla activa hasta evidencia verde.
