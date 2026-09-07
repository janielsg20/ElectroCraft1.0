# TRACKING — ElectroCraft current position

Date: 2026-09-06.

| Scope              | Estado                                                     | Evidencia                                                                                                                                        |
| ------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| F00                | COMPLETADA / GREEN                                         | `.ai/evidence/F00/`                                                                                                                              |
| F01                | COMPLETADA / GREEN                                         | `.ai/evidence/F01/`                                                                                                                              |
| F02                | COMPLETADA / GREEN                                         | `.ai/evidence/F02/`                                                                                                                              |
| F03 / M03.1–M03.12 | COMPLETADA / GREEN                                         | `.ai/evidence/F03/CLOSURE_2026-08-20.md`                                                                                                         |
| F04 / M04.1–M04.8  | COMPLETADA / GREEN                                         | `.ai/evidence/F04/CLOSURE_2026-08-25.md`                                                                                                         |
| F05 / M05.1–M05.8  | COMPLETADA / GREEN                                         | PR `#60`; Base CI `33101434587`                                                                                                                  |
| F06 / M06.1–M06.8  | IMPLEMENTACIÓN FUSIONADA; reparaciones certificadas en F07 | PR `#64`; Base CI F07 `33262949215`                                                                                                              |
| F07 / M07.1–M07.8  | COMPLETADA / GREEN                                         | PR `#68`; Base CI `33262949215`                                                                                                                  |
| F08 / M08.1        | IMPLEMENTADA / PENDIENTE GATE F08                          | `.ai/evidence/F08/M08.1/IMPLEMENTATION_2026-08-29.md`                                                                                            |
| F08 / M08.2        | IMPLEMENTADA / PENDIENTE GATE F08                          | `.ai/evidence/F08/M08.2/IMPLEMENTATION_2026-08-29.md`                                                                                            |
| F08 / M08.3        | IMPLEMENTADA / GREEN MICROFASE                             | PR `#69`; Base CI `33326524968` (#818)                                                                                                           |
| F08 / M08.4        | IMPLEMENTADA / GREEN MICROFASE                             | PR `#70`; Base CI `33412562136` (#834)                                                                                                           |
| F08 / M08.5        | IMPLEMENTADA / GREEN MICROFASE                             | PR `#71`; Base CI `33685072920` (#837)                                                                                                           |
| F08 / M08.6        | IMPLEMENTADA / GREEN MICROFASE                             | PR `#72`; Base CI `33776935165`                                                                                                                  |
| F08 / M08.7        | IMPLEMENTADA / GREEN MICROFASE                             | PR `#73`; Base CI `33792230116` (#858); merge `7bded471c94bb50009a6b99215d6e02cb3b726b2`; `.ai/evidence/F08/M08.7/CLOSURE_2026-09-03.md`         |
| F08 / M08.8        | IMPLEMENTADA / GREEN MICROFASE                             | PR `#74`; Base CI `33804227049` (#875); merge `8225f3aa5797972265a470f49c8aff75c5bab87c`; `.ai/evidence/F08/M08.8/CLOSURE_2026-09-03.md`         |
| F08 / M08.9        | IMPLEMENTADA / GREEN MICROFASE                             | PR `#75`; Base CI `33812380216` (#878); merge `93440130d8c5fd62f73366925df7695dd309daf3`; `.ai/evidence/F08/M08.9/CLOSURE_2026-09-03.md`         |
| F08 / M08.10       | IMPLEMENTADA / GREEN MICROFASE                             | PR `#76`; Base CI `33896051996` (#882); merge `78c88b65ef8708575ea2885edf7ad6631a30afce`; `.ai/evidence/F08/M08.10/CLOSURE_2026-09-04.md`        |
| F08 / M08.11       | IMPLEMENTADA / GREEN MICROFASE                             | PR `#77` + audit PR `#78`; Base CI `33995779383` (#900); merge audit `89075e17b10332d5d6eaebbd9800f33e0987ffaf`; `M08.11/CLOSURE_2026-09-05.md` |
| F08 / M08.12       | IMPLEMENTADA / GREEN MICROFASE                             | PR `#79`; Base CI `34063642245` (#914); merge `096fb2bc6ae7110c899968b851728e0fa5795e96`; `M08.12/CLOSURE_2026-09-06.md`                         |
| F08 / M08.13       | IMPLEMENTADA / PENDIENTE GATE                              | `.ai/evidence/F08/M08.13/IMPLEMENTATION_2026-09-06.md`                                                                                            |

## Rama activa

`codex/m08-13-generic-field-indexer`

## Último cierre certificado — M08.12

Owner: `PGlite generic content store`.

- CRUD validado contra `ElectroCraftDataSchema`;
- soft delete `state=deleted + deletedAt`;
- `Datos > Registros` list/detail/form y vista de eliminados;
- integridad relacional mantiene `restrict/detach/cascade` atómico;
- carrera UI al alternar `Incluir eliminados` durante una mutación corregida sin relajar E2E;
- Base CI `34063642245` (#914) terminó completo en `success`;
- PR `#79` fusionada por squash en `096fb2bc6ae7110c899968b851728e0fa5795e96`.

## M08.13 — candidate

Owner: `PGlite generic content store` usando `record_field_index` existente.

- capacidades portables Searchable / Filterable / Sortable / Faceted;
- schema v8 añade `normalized_text` y elimina FTS GIN de expresión heredado;
- GenericFieldIndexer genera filas tipadas con ordinal;
- CRUD y filas de índice se actualizan de forma transaccional;
- cascades relacionales eliminan también sus filas de índice en la misma transacción;
- query usa índice para búsqueda, filtros configurados, sort y facets; mantiene fallback JSON donde corresponde;
- recurso `index:<modelId>` expone status/rebuild detrás del mismo ConnectorRegistry;
- Studio muestra `Campo > Avanzado > Búsqueda y filtros` sin exponer SQL;
- unit, contract, integration real PGlite y E2E incluidos.

## Auditoría transversal vigente

- sin segundo store o ConnectorRegistry;
- sin DDL por modelo/campo;
- sin acceso PGlite/Drizzle desde UI Studio;
- Base CI sigue siendo el gate de cierre completo;
- `main` continúa sin branch protection administrativa; la conexión actual no permite modificar esa configuración.

## Siguiente acción exacta

Abrir PR de M08.13, ejecutar un único ElectroCraft Base CI y reparar solo fallos reales. Con gate GREEN registrar cierre, fusionar y activar M08.14.
