# TRACKING — ElectroCraft current position

Date: 2026-09-05.

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
| F08 / M08.12       | ACTIVE                                                     | `.ai/microphases/M08_12.md`                                                                                                                      |

## Rama activa

`codex/m08-12-record-crud-validation`

## M08.11 — cierre certificado

Owner: `PGlite generic content store`.

- metadata canónica `ElectroRelation` con source/target/cardinality/inverse/delete behavior/permisos;
- capability canónica `relations`;
- edges en la tabla genérica existente `relation_edges`, sin DDL por cardinalidad;
- validación de `1:1`, `1:N`, `N:N`, duplicados y records destino/origen en aplicación/repositorio;
- integridad `restrict`, `detach`, `cascade` es atómica con el borrado del record raíz;
- cambio de cardinalidad/destino queda bloqueado mientras existan edges;
- recursos `relation:<id>` pasan por InternalDataSourceAdapter/ConnectorRegistry y Data Explorer;
- Studio expone `Datos > Modelos > <modelo> > Relaciones` con definición y selectores;
- Base CI `33995779383` (#900) terminó completo en `success` incluyendo los nuevos gates `lint:offline` y `test:boundaries`;
- PR correctiva `#78` se fusionó por squash a `main` en `89075e17b10332d5d6eaebbd9800f33e0987ffaf`.

## Auditoría transversal cerrada

- sin `TODO:`/`FIXME` activos relevantes detectados;
- sin `test.skip`/`describe.skip` detectados;
- sin `@ts-ignore`, `@ts-expect-error` o `eslint-disable` usados para ocultar errores;
- logs temporales de Vite eliminados e ignorados;
- Base CI ejecuta documentación, lint, lint offline, typecheck, boundaries, tests, build, Playwright y fixtures;
- timeout del job aumentado a 45 minutos para evitar falsos `cancelled` en el borde de Playwright.

## Riesgo de gobernanza

`main` no tiene branch protection/required status checks configurados. La conexión actual no permite cambiar settings administrativos. Debe mantenerse como pendiente de configuración del repositorio, no como defecto de implementación de F08.

## M08.12 — inicio

Owner: `PGlite generic content store`.

- reutilizar `content_records` JSON;
- validar create/update desde `ElectroCraftDataSchema` antes de persistir;
- definir soft delete por policy portable de estado/deletedAt;
- construir `Datos > Registros` con DataView/list + detail y cards mobile;
- mantener todas las mutaciones detrás de service/adapter/ConnectorRegistry.

## Siguiente acción exacta

Implementar M08.12 microfase por microfase sobre `codex/m08-12-record-crud-validation`, comenzando por validation compiler/service y soft-delete policy antes de ampliar la UI de Registros.
