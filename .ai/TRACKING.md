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
| M02.9 | COMPLETADA | `.ai/evidence/F02/M02.9/CLOSURE_2026-08-18.md` |
| F02 Gate | GREEN | `.ai/evidence/F02/CLOSURE_2026-08-18.md` |
| F03 / M03.1 | ACTIVE | `.ai/microphases/M03_1.md` |

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
- `ElectroCraftExportIR` immutable/versionado y neutral a targets; nueve targets Core y `TargetCompileContext` separado.
- Checksum fixture `fnv1a64:3f5ab54591022ac0`; suite dedicada `11/11`; acumulada Node `27/27`, Vitest `108/108`, Playwright `1/1`.
- Gate main `32191193359` success; artifact `9344256616`; digest `sha256:52f1fd78d673b8094bf29be9d1b47e8aa7a1b92aa8f8c4b9e6f219687a3d375b`.

## Cierre M02.8
- PR `#10`; squash merge `cd89199a44ffbd2efda7892a4e658145de70b500`.
- Taxonomía ejecutable: 14 Project Objects + 6 Application Registries + 6 Content Entities; ownership/export boundary fail-closed.
- ProjectDefinition/Document permanecen v3; suite dedicada `9/9`.
- Gate main `32193738411` success; artifact `9345132952`; digest `sha256:7751ba52ff3cf167dad37e604617a1ac2fef808491952394bdb83023c825af1f`.

## Cierre M02.9
- PR `#11`; squash merge `53401b29df8ef44deb69468c92cd36ae5f547761`.
- Wrapper portable determinista `{ engine, schemaVersion, value }`; domain permanece engine-agnostic.
- RQB rules con `@react-querybuilder/core@8.23.0`; Tiptap rich-text JSON con grafo exacto `3.29.2` de core/html/Document/Paragraph/Text.
- Runtime/editor state de Puck/Rete/Zustand/TanStack permanece fuera del modelo canónico.
- Suite dedicada `11/11`; acumulada Node `27/27`, Vitest `128/128`, Playwright `1/1`.
- Gate main `32196416073` success; artifact `9346006290`; digest `sha256:0083bf96e88e0935a9876a37d8fc465b8315e03ec836dcd1d8bd8609c0d8770b`.

## Cierre F02
- Gate final `.github/workflows/f02-canonical-model-gate.yml` ejecutó las nueve suites dedicadas y luego `npm run check` sobre el árbol integrado.
- Run definitivo `32197039836` — `success` sobre `83d67d31ab10ac5b588b43ff7136e9cd219c62ef`.
- Marker: `PASS_F02_CANONICAL_MODEL_GATE`.
- Artifact: `9346213452` — `f02-canonical-model-evidence`.
- Digest: `sha256:160658d864ba742265c958ecab629fe855e5d425a78a3f643ecfce908c0aaa12`.
- Invariantes: 17 owners, sin `packages/contracts`, ProjectDefinition/Document v3, ownership 14/6/6, ExportIR target-neutral, wrappers OSS fail-closed, Node 27/27, Vitest 128/128, Playwright 1/1, blockers P0/P1 `0`.

## Gate actual
F02 `COMPLETADA` / Gate F02 `GREEN`. F03 está `IN_PROGRESS` con M03.1 como única microfase activa.

## Siguiente transición permitida
Implementar y cerrar exclusivamente M03.1: shadcn/ui sobre Radix, Lucide y tokens ElectroCraft en `packages/design-system`; después avanzar a M03.2.
