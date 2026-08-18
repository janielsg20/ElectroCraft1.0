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
| M02.4 | COMPLETADA | `.ai/evidence/F02/M02.4/CLOSURE_2026-08-18.md` |
| M02.5 | ACTIVE | `.ai/microphases/M02_5.md` |

## Cierre M02.1
- PR `#3`; squash merge `cf4649d98f96a553daa020581a918d9559131137`.
- Zod `4.4.3`; ProjectDefinition/Document/IDs/refs/migración `page -> screen`; repository port; 12/12 tests; artifact `9336023224`.

## Cierre M02.2
- PR `#4`; squash merge `80a30bb992804a5c0bc839b001022f844001754a`.
- ComponentDefinition/Layout/Style portables/versionados; adapter real Puck `0.22.4`; 12/12 tests; run `32170341661`; artifact `9337016899`.

## Cierre M02.3
- Implementación integrada en `main`: `9bc51e70407ea37b48072e48cf5c01a1e2719565`.
- DataSource/DataSchema/DataModel/Query/Form bindings portables/versionados y strict/fail-closed.
- React Query Builder `8.23.0` + PGlite `0.5.5`; SQL parametrizado; ConnectorRegistry efímero.
- Tests dedicados `13/13`; Vitest `55/55`; Node `27/27`; Playwright `1/1`; full check verde.
- Gate `32173466071` — `success`; artifact `9338135809`; digest `sha256:59cb527f9451c0e1c1e1d22f9fc5ee3600041b0a29bd0c44f53ab8fbf0428382`.

## Cierre M02.4
- PR `#6`; squash merge `786a3364ed342ac39c50d5e8d30e9705c02cf8df`.
- Canonical owner: `packages/domain/src/contracts/app-behavior.ts`.
- `ElectroCraftActionGraph` persiste nodos/edges/refs como JSON versionado; Rete `NodeEditor` y objetos runtime permanecen en `workflow-rete`.
- `ElectroCraftStateDefinition` define scope, tipo, default, persistence y sensibilidad; Zustand runtime no forma parte del proyecto persistido.
- `ElectroCraftRouteDefinition`/`ElectroCraftNavigationDefinition` conservan refs estables sin objetos React Router/Expo Router.
- `ElectroCraftRole`/`ElectroCraftPermissionPolicy` son declarativos; evaluación fail-closed y `deny` prevalece sobre `allow`.
- `application` valida refs cruzadas entre screens, routes, navigation, actions, state, policies y roles.
- Adapter real Rete `2.0.6`; runtime Zustand `5.0.14`; lockfile reproducible.
- Tests dedicados M02.4: unit/contract/integration `13/13` verdes.
- `npm run check` verde tanto en PR como en `main`.
- Integración Rete aceptada M00.6: `success`.
- Gate PR: run `32179429432` — `success`.
- Gate final en `main`: run `32179623373` — `success`.
- Marker: `PASS_M02_4_ACTION_STATE_NAVIGATION_PERMISSION`.
- Artifact final: `9340298589` — `m02-4-action-state-navigation-permission-evidence`.
- Digest: `sha256:0e5510f45d214343131e5c203f8ab04fc85c9f677e0aa027b71e5726e4abfc64`.
- P0/P1: `0`.

## Gate actual
F02 continúa activa con `GREEN_THROUGH_M02.4`.

## Siguiente transición permitida
Implementar y cerrar exclusivamente M02.5 con Theme visual portable, BlueprintPackage instalable/conflict/rollback y registries/capabilities de aplicación; después avanzar a M02.6.
