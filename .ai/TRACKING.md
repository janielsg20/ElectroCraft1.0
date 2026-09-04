# TRACKING — ElectroCraft current position

Date: 2026-09-04.

| Scope              | Estado                                                     | Evidencia                                                                                                                                |
| ------------------ | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| F00                | COMPLETADA / GREEN                                         | `.ai/evidence/F00/`                                                                                                                      |
| F01                | COMPLETADA / GREEN                                         | `.ai/evidence/F01/`                                                                                                                      |
| F02                | COMPLETADA / GREEN                                         | `.ai/evidence/F02/`                                                                                                                      |
| F03 / M03.1–M03.12 | COMPLETADA / GREEN                                         | `.ai/evidence/F03/CLOSURE_2026-08-20.md`                                                                                                 |
| F04 / M04.1–M04.8  | COMPLETADA / GREEN                                         | `.ai/evidence/F04/CLOSURE_2026-08-25.md`                                                                                                 |
| F05 / M05.1–M05.8  | COMPLETADA / GREEN                                         | PR `#60`; Base CI `33101434587`                                                                                                          |
| F06 / M06.1–M06.8  | IMPLEMENTACIÓN FUSIONADA; reparaciones certificadas en F07 | PR `#64`; Base CI F07 `33262949215`                                                                                                      |
| F07 / M07.1–M07.8  | COMPLETADA / GREEN                                         | PR `#68`; Base CI `33262949215`                                                                                                          |
| F08 / M08.1        | IMPLEMENTADA / PENDIENTE GATE F08                          | `.ai/evidence/F08/M08.1/IMPLEMENTATION_2026-08-29.md`                                                                                    |
| F08 / M08.2        | IMPLEMENTADA / PENDIENTE GATE F08                          | `.ai/evidence/F08/M08.2/IMPLEMENTATION_2026-08-29.md`                                                                                    |
| F08 / M08.3        | IMPLEMENTADA / GREEN MICROFASE                             | PR `#69`; Base CI `33326524968` (#818)                                                                                                   |
| F08 / M08.4        | IMPLEMENTADA / GREEN MICROFASE                             | PR `#70`; Base CI `33412562136` (#834)                                                                                                   |
| F08 / M08.5        | IMPLEMENTADA / GREEN MICROFASE                             | PR `#71`; Base CI `33685072920` (#837)                                                                                                   |
| F08 / M08.6        | IMPLEMENTADA / GREEN MICROFASE                             | PR `#72`; Base CI `33776935165`                                                                                                          |
| F08 / M08.7        | IMPLEMENTADA / GREEN MICROFASE                             | PR `#73`; Base CI `33792230116` (#858); merge `7bded471c94bb50009a6b99215d6e02cb3b726b2`; `.ai/evidence/F08/M08.7/CLOSURE_2026-09-03.md` |
| F08 / M08.8        | IMPLEMENTADA / GREEN MICROFASE                             | PR `#74`; Base CI `33804227049` (#875); merge `8225f3aa5797972265a470f49c8aff75c5bab87c`; `.ai/evidence/F08/M08.8/CLOSURE_2026-09-03.md` |
| F08 / M08.9        | IMPLEMENTADA / GREEN MICROFASE                             | PR `#75`; Base CI `33812380216` (#878); merge `93440130d8c5fd62f73366925df7695dd309daf3`; `.ai/evidence/F08/M08.9/CLOSURE_2026-09-03.md` |
| F08 / M08.10       | IMPLEMENTADA / GREEN MICROFASE                             | PR `#76`; Base CI `33896051996` (#882); merge `78c88b65ef8708575ea2885edf7ad6631a30afce`; `.ai/evidence/F08/M08.10/CLOSURE_2026-09-04.md` |
| F08 / M08.11       | ACTIVE / IMPLEMENTADA / PENDIENTE GATE                    | `.ai/evidence/F08/M08.11/IMPLEMENTATION_2026-09-04.md`                                                                                   |

## Rama activa

`codex/m08-11-relations`

## M08.10 — cierre certificado

Owner: `PGlite generic content store`.

- `ElectroTaxonomy`/`ElectroTaxonomyTerm` portables y refs fail-closed;
- términos jerárquicos en `taxonomy_terms` mediante `parentId`;
- adapter/repository detrás del ConnectorRegistry;
- definición y gestor de términos separados en `Datos > Modelos > <modelo> > Taxonomías`;
- Base CI `33896051996` (#882) terminó completo en `success` con `123/123` Playwright;
- PR `#76` se fusionó por squash a `main` en `78c88b65ef8708575ea2885edf7ad6631a30afce`.

## M08.11 — candidata

Owner: `PGlite generic content store`.

- metadata canónica `ElectroRelation` con source/target/cardinality/inverse/delete behavior/permisos;
- capability canónica `relations`;
- edges en la tabla genérica existente `relation_edges`, sin nueva migración ni DDL por cardinalidad;
- validación de `1:1`, `1:N`, `N:N`, duplicados y records destino/origen en aplicación/repositorio;
- integridad `restrict`, `detach`, `cascade` antes de borrar records;
- recursos `relation:<id>` expuestos por InternalDataSourceAdapter/ConnectorRegistry y Data Explorer;
- Studio añade `Datos > Modelos > <modelo> > Relaciones`, definición detallada y selectores de registros;
- campos `relation` pueden referenciar `relationRef` manteniendo compatibilidad con `relationModelRef`;
- unit/contract/integration PGlite/E2E preparados; gate completo todavía pendiente.

## Validación de engine

PGlite/Drizzle siguen siendo el único owner físico. `relation_edges` ya existía en el schema estable; M08.11 añade lógica portable y repositorio sobre esa tabla, no otro motor ni schema físico por relación.

## Siguiente acción exacta

Revisar formato/tipos de la candidata, abrir PR M08.11 y ejecutar una única ElectroCraft Base CI. Con `success`, registrar VALIDATION/CLOSURE, fusionar y activar M08.12. Ante fallo, corregir únicamente la evidencia observada.
