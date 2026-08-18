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
| M02.3 | ACTIVE | `.ai/microphases/M02_3.md` |

## Cierre M02.1
- PR `#3`; squash merge `cf4649d98f96a553daa020581a918d9559131137`.
- Zod `4.4.3`; ProjectDefinition/Document/IDs/refs/migración `page -> screen`; repository port; 12/12 tests; artifact `9336023224`.

## Cierre M02.2
- PR: `#4` — `Implement M02.2 component layout style contracts`.
- Squash merge a `main`: `80a30bb992804a5c0bc839b001022f844001754a`.
- Canonical owner: `packages/domain/src/contracts/`; no se creó `packages/contracts` porque F01 mantiene 17 owners estables.
- `ElectroCraftComponentDefinition`, `ElectroCraftLayout` y `ElectroCraftStyle` versionados y strict/fail-closed.
- Layout semántico: `flow`, `stack`, `row`, `grid`, `overlay`.
- Style estructurado con tokens/valores y overrides responsive/platform; Tailwind/NativeWind strings no son fuente canónica.
- Migración legacy de ComponentDefinition y round-trip determinista.
- Application boundary: `ComponentDefinitionService` + repository port para save/reopen/migration write-back.
- Adapter real: `@electrocraft/editor-puck` usa API pública `Config`/`ComponentConfig`; renderer se inyecta y nunca se persiste.
- Engine pin: `@puckeditor/core@0.22.4`; Zod continúa en `4.4.3`; lockfile reproducible validado con `npm ci`.
- Tests dedicados M02.2: unit/contract/integration `12/12` verdes, incluyendo `Render` real de Puck y persistence/reopen/migration.
- Gate M02.2 final en `main`: run `32170341661` — `success`.
- Marker: `PASS_M02_2_COMPONENT_LAYOUT_STYLE`.
- Artifact final: `9337016899` — `m02-2-component-layout-style-evidence`.
- Digest: `sha256:422bc021de29231f08aff28064099eb6b0632e1ef3aa33bdabb970d9a734907b`.
- Revalidación completa del mismo head: M00.9, M00.10, M00.11, M01.1, M01.2, M01.3, M01.4, M02.1 y M02.2 en `success`.
- Adaptaciones durante CI: se restauró la versión interna `@electrocraft/editor-puck` a `0.0.0-m01.3` para conservar coherencia de workspaces; se usó el `Config` público por defecto de Puck 0.22.4 para evitar un genérico incompatible; helpers temporales de lock/formato fueron retirados antes del head final.
- P0/P1: `0`.

## Gate actual
F02 continúa activa con `GREEN_THROUGH_M02.2`.

## Siguiente transición permitida
Cerrar M02.3 con ownership portable de Data Sources/Data Models/Queries/Forms, bindings, query safety/result integration y evidencia; después avanzar exclusivamente a M02.4.
