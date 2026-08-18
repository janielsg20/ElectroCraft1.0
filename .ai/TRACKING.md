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
| M02.2 | ACTIVE | `.ai/microphases/M02_2.md` |

## Cierre M02.1
- PR: `#3` — `Implement M02.1 canonical project and document model`.
- Squash merge a `main`: `cf4649d98f96a553daa020581a918d9559131137`.
- Owner canónico: `packages/domain/src/contracts/`; no se creó `packages/contracts` porque F01 congeló 17 owners y ese package no existe.
- Boundary: Zod `4.4.3` bloqueado en `package-lock.json`.
- Modelo: `ElectroCraftProjectDefinition`, `ElectroCraftDocument`, IDs deterministas, refs/versionado, migración legacy `page -> screen`, serialización estable y validation fail-closed.
- Application boundary: repository port + `ProjectDocumentService` para save/reopen/recovery.
- Tests específicos: unit/contract/integration — `12/12` verdes.
- Gate dedicado en `main`: run `32167600544` — `success`.
- Marker: `PASS_M02_1_PROJECT_DOCUMENT_MODEL`.
- Artifact final: `9336023224` — `m02-1-canonical-model-evidence`.
- Digest: `sha256:1007752a6368d124818bbfbfffac199eac91629227b93c77b632da3987074fcb`.
- Revalidación heredada en el mismo head: `electrocraft/M01.4`, `electrocraft/M00.9` y `electrocraft/M00.10` en `success`; matriz M00.10 incluyó Static, Capacitor, Slim/PDO/CSRF y WordPress reales.
- Adaptaciones durante CI: formato Prettier aplicado; test boundary corregido para distinguir el target canónico `react` de imports React; gate F01 actualizado para permitir únicamente Zod + imports relativos dentro de domain, manteniendo prohibidos frameworks/runtimes/adapters.
- P0/P1: `0`.

## Gate actual
F02 continúa activa con `GREEN_THROUGH_M02.1`.

## Siguiente transición permitida
Cerrar M02.2 con ComponentDefinition/Layout/Style portables, adapter Puck, version/migration, round-trip, unit/contract/integration y evidencia; después avanzar exclusivamente a M02.3.
