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
| M02.5 | COMPLETADA | `.ai/evidence/F02/M02.5/CLOSURE_2026-08-18.md` |
| M02.6 | ACTIVE | `.ai/microphases/M02_6.md` |

## Cierre M02.1
- PR `#3`; squash merge `cf4649d98f96a553daa020581a918d9559131137`.
- Zod `4.4.3`; ProjectDefinition/Document/IDs/refs/migración `page -> screen`; 12/12 tests; artifact `9336023224`.

## Cierre M02.2
- PR `#4`; squash merge `80a30bb992804a5c0bc839b001022f844001754a`.
- ComponentDefinition/Layout/Style portables/versionados; adapter real Puck `0.22.4`; 12/12 tests; run `32170341661`; artifact `9337016899`.

## Cierre M02.3
- Implementación integrada: `9bc51e70407ea37b48072e48cf5c01a1e2719565`.
- DataSource/DataSchema/DataModel/Query/Form bindings portables/versionados; RQB `8.23.0` + PGlite `0.5.5`.
- Gate `32173466071` success; artifact `9338135809`; digest `sha256:59cb527f9451c0e1c1e1d22f9fc5ee3600041b0a29bd0c44f53ab8fbf0428382`.

## Cierre M02.4
- PR `#6`; squash merge `786a3364ed342ac39c50d5e8d30e9705c02cf8df`.
- ActionGraph/State/Route/Navigation/Role/PermissionPolicy; Rete `2.0.6`; Zustand `5.0.14`; fail-closed permissions.
- Gate main `32179623373` success; artifact `9340298589`; digest `sha256:0e5510f45d214343131e5c203f8ab04fc85c9f677e0aa027b71e5726e4abfc64`.

## Cierre M02.5
- PR `#7`; squash merge `7cb7016d6ae6e4e91cef3a7de41de66cb861fc55`.
- `ElectroCraftTheme` visual-only; template permanece `ElectroCraftDocument kind=template` con `templateMeta` y Display Conditions.
- `ElectroCraftBlueprintPackage` externo/versionado; `ElectroCraftBlueprintInstaller` en application con plan, conflicto y rollback verificables.
- `ElectroPlatformCapabilityRegistry` y Component/Field/Action/Provider registries viven en application; ProjectDefinition no serializa registries runtime.
- `ElectroCraftProjectDefinition` evoluciona a schema v3 con `originBlueprint`, `requiredCapabilities`, `targetCapabilityOverrides` y `userRegistryDefinitionRefs`.
- `ElectroCraftDocument` evoluciona a schema v3; migrations explícitas desde v2/v1/page.
- `export-ir` consume reporte neutral `supported | adapted | blocked` en vez del registry vivo.
- Se preservó el invariant F01 de exactamente 17 owner packages; la referencia histórica `packages/contracts/` se resuelve a `packages/domain/src/contracts/`, sin package 18.
- Tests dedicados M02.5: `14/14` verdes.
- Suite acumulada en `main`: Node `27/27`, Vitest `83/83`, Playwright `1/1`; lint/Prettier, typecheck, boundaries, Studio/PWA y build verdes.
- Evidencia generada: `capabilityEntries=9`, cobertura supported/adapted/blocked completa; `blueprintConflicts=1`; rollback confirmado.
- Gate PR final `32182296286` success; gates heredados M02.1–M02.4 y Studio verdes; export parity WordPress/LAMP/Capacitor/static verde.
- Gate definitivo en `main`: run `32182633428` — `success`.
- Marker: `PASS_M02_5_THEME_BLUEPRINT_REGISTRY_CAPABILITY`.
- Artifact final: `9341317925` — `m02-5-theme-blueprint-registry-capability-evidence`.
- Digest: `sha256:13d612fd3c8ae4af6cb88b52e5f3b1ce6d56d77e844b38f6625d959638a7f026`.
- P0/P1: `0`.

## Gate actual
F02 continúa activa con `GREEN_THROUGH_M02.5`.

## Siguiente transición permitida
Implementar y cerrar exclusivamente M02.6: serialización determinista, checksum canonical snapshot, MigrationRegistry por schemaVersion, migration real verificable e import inválido con diagnostics sin mutar storage; después avanzar a M02.7.
