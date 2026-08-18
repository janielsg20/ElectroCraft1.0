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
| M02.6 | COMPLETADA | `.ai/evidence/F02/M02.6/CLOSURE_2026-08-18.md` |
| M02.7 | COMPLETADA | `.ai/evidence/F02/M02.7/CLOSURE_2026-08-18.md` |
| M02.8 | COMPLETADA | `.ai/evidence/F02/M02.8/CLOSURE_2026-08-18.md` |
| M02.9 | ACTIVE | `.ai/microphases/M02_9.md` |

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
- Theme visual-only, Blueprint install/conflict/rollback, registries de application y capability analysis neutral; ProjectDefinition/Document schema v3.
- Suite dedicada `14/14`; gate main `32182633428` success; artifact `9341317925`; digest `sha256:13d612fd3c8ae4af6cb88b52e5f3b1ce6d56d77e844b38f6625d959638a7f026`.

## Cierre M02.6
- PR `#8`; squash merge `c74fc8284a56487dc56b9dbb90775fb592f803d8`.
- JSON canónico determinista compartido, checksum `fnv1a64`, MigrationRegistry v1→v2→v3 e import transaccional fail-closed.
- Suite dedicada `14/14`; suite acumulada: Node `27/27`, Vitest `97/97`, Playwright `1/1`.
- Gate main `32186495673` success; artifact `9342646837`; digest `sha256:35ce99bc90392494dd1d0e6a276a41ec245e4b62a849a6d6f59fb454404121cc`.

## Cierre M02.7
- PR `#9`; squash merge `572baebbd6aa5bb62b57d085f7d178d49dd699e2`.
- `ElectroCraftExportIR` immutable/versionado y neutral a targets; no es source of truth persistida.
- Closed set de nueve `ExportTargetId`: local-project, react-web, static-web, pwa, android-expo, ios-expo, capacitor, lamp y wordpress.
- `TargetCompileContext` queda separado del IR y lleva target/config/capabilities/environment/toolchain/SecretRefs.
- `ExportValidationReport` bloquea refs rotas, secret values, caches/histories/prompts e internals target-specific antes de compilación.
- Forms se representan por refs a `ElectroCraftDocument kind=form`; Media se representa por manifest portable, no por blobs/runtime storage.
- Checksum de fixture congelado: `fnv1a64:3f5ab54591022ac0`; React Web y Android/Expo reciben exactamente esa misma revisión.
- Suite dedicada M02.7: `11/11` verdes; suite acumulada en `main`: Node `27/27`, Vitest `108/108`, Playwright `1/1`; lint/Prettier, typecheck, boundaries, Studio/PWA y build verdes.
- Gate PR final `32190889315` success; export parity static/Capacitor/LAMP/WordPress verde.
- Gate definitivo main `32191193359` — `success`.
- Marker: `PASS_M02_7_CANONICAL_EXPORT_IR`.
- Artifact final: `9344256616` — `m02-7-canonical-export-ir-evidence`.
- Digest: `sha256:52f1fd78d673b8094bf29be9d1b47e8aa7a1b92aa8f8c4b9e6f219687a3d375b`.
- P0/P1: `0`.

## Cierre M02.8
- PR `#10`; squash merge `cd89199a44ffbd2efda7892a4e658145de70b500`.
- Taxonomía ejecutable de 26 tipos: `14` Project Objects, `6` Application Registries y `6` Content Entities.
- Cada descriptor fija storage authority, serializer owner, migration owner, versioning authority y exporter access.
- `ProjectDefinition` continúa en schema v3 sin migración nueva; M02.8 formaliza ownership alrededor de refs existentes.
- Core/extension registries no se copian al proyecto; solo definitions `origin=user` pueden persistirse separadas y referenciarse por ID.
- Records/terms/relation edges/media metadata/user profiles/audit events permanecen storage-owned; ExportIR solo accede por resolver/manifest cuando corresponde.
- `validateElectroCraftProjectOwnershipBoundary` bloquea registries completos y content collections dentro de canonical project data con diagnostics reparables.
- ExportIR ejecuta el ownership boundary antes de parse/compile y permanece libre de live registries/content stores.
- Suite dedicada M02.8: `9/9` verde; pipeline raíz, M02.1–M02.7, Base CI, Studio y export parity verdes en PR.
- Gate definitivo main `32193738411` — `success`.
- Marker: `PASS_M02_8_MODEL_OWNERSHIP`.
- Artifact final: `9345132952` — `m02-8-model-ownership-evidence`.
- Digest: `sha256:7751ba52ff3cf167dad37e604617a1ac2fef808491952394bdb83023c825af1f`.
- P0/P1: `0`.

## Gate actual
F02 continúa activa con `GREEN_THROUGH_M02.8`.

## Siguiente transición permitida
Implementar y cerrar exclusivamente M02.9: wrappers versionados `{ engine, schemaVersion, value }` para payloads serializables de engines, inicialmente RQB rules y Tiptap richtext; validators/migrations permanecen en los adapters, Compatibility Analyzer bloquea engine/version no soportado y AppState/classes runtime de Rete/Puck siguen prohibidos. Después ejecutar el gate final de F02 antes de iniciar F03.
