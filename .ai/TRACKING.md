# TRACKING — ElectroCraft current position

Date: 2026-08-18.

Historial detallado:
- hasta M00.8: `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`;
- M00.9–M01.5: `.ai/archive/TRACKING_THROUGH_M01.5_2026-08-18.md`;
- changelog histórico: `.ai/archive/CHANGELOG_THROUGH_M00.8_2026-08-17.md`.

| Scope | Estado | Evidencia principal |
|---|---|---|
| F00 | COMPLETADA | `.ai/evidence/F00/` |
| M01.1–M01.6 | COMPLETADAS | `.ai/evidence/F01/` + workflows heredados |
| F01 Gate | GREEN | `.ai/evidence/F01/M01.6/CLOSURE_2026-08-18.md` |
| M02.1 | COMPLETADA | `.ai/evidence/F02/M02.1/CLOSURE_2026-08-18.md` |
| M02.2 | COMPLETADA | `.ai/evidence/F02/M02.2/CLOSURE_2026-08-18.md` |
| M02.3 | COMPLETADA | `.ai/evidence/F02/M02.3/CLOSURE_2026-08-18.md` |
| M02.4 | ACTIVE | `.ai/microphases/M02_4.md` |

## Cierre M02.1
- PR `#3`; squash merge `cf4649d98f96a553daa020581a918d9559131137`.
- Zod `4.4.3`; ProjectDefinition/Document/IDs/refs/migración `page -> screen`; repository port; 12/12 tests; artifact `9336023224`.

## Cierre M02.2
- PR `#4`; squash merge `80a30bb992804a5c0bc839b001022f844001754a`.
- ComponentDefinition/Layout/Style portables/versionados; adapter real Puck `0.22.4`; 12/12 tests; run `32170341661`; artifact `9337016899`.

## Cierre M02.3
- Implementación integrada en `main`: `9bc51e70407ea37b48072e48cf5c01a1e2719565`.
- Canonical owner: `packages/domain/src/contracts/`; DataSource/DataSchema/DataModel/Query/Form bindings versionados y strict/fail-closed.
- `ElectroCraftDataSourceDefinition` conserva config no sensible y `authRef`; no persiste credenciales/tokens.
- `ElectroCraftDataSchema` valida models, fields, relaciones e índices/facets por referencia.
- `ElectroCraftQueryDefinition` conserva source/schema/model, condiciones, sort, pagination/cache sin internals del engine.
- `@electrocraft/query-rqb` usa React Query Builder `8.23.0` y mantiene SQL parametrizado con valores separados en params.
- `ConnectorRegistry` vive en application como registry efímero; no forma parte del ProjectDefinition persistido.
- Form continúa como `ElectroCraftDocument kind=form` con `formMeta`; no se creó un segundo árbol de formularios.
- `data-core`, `query-rqb` y `forms` se reutilizan como owners/adapters existentes.
- Tests dedicados M02.3: unit/contract/integration `13/13` verdes.
- Suite raíz observada en el mismo gate: Vitest `55/55`, Node `27/27`, Playwright `1/1`; lint, typecheck, boundaries, build y PWA verdes.
- Integración real RQB `8.23.0` + PGlite `0.5.5` verde, incluyendo query parametrizada, persistence, facets y multi-source.
- Gate M02.3 en `main`: run `32173466071` — `success`.
- Marker: `PASS_M02_3_DATA_QUERY_FORM_OWNERSHIP`.
- Artifact: `9338135809` — `m02-3-data-query-form-evidence`.
- Digest: `sha256:59cb527f9451c0e1c1e1d22f9fc5ee3600041b0a29bd0c44f53ab8fbf0428382`.
- P0/P1: `0`.

## Gate actual
F02 continúa activa con `GREEN_THROUGH_M02.3`.

## Siguiente transición permitida
Implementar y cerrar exclusivamente M02.4 con ActionGraph, State, Route/Navigation y Permission contracts portables/versionados, migrations/round-trip, refs estables, tests de scope/persistence y evidencia; después avanzar a M02.5.
