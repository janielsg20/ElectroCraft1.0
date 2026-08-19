# TRACKING — ElectroCraft current position

Date: 2026-08-19.

El historial detallado previo permanece versionado en Git y en los archivos de evidencia/archivo. Este documento mantiene la posición operativa actual sin duplicar logs extensos.

## Estado por fase
| Scope | Estado | Evidencia principal |
|---|---|---|
| F00 | COMPLETADA | `.ai/evidence/F00/` |
| F01 / M01.1–M01.6 | COMPLETADA / GREEN | `.ai/evidence/F01/` |
| F02 / M02.1–M02.9 | COMPLETADA / GREEN | `.ai/evidence/F02/` |
| M03.1 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.1/CLOSURE_2026-08-19.md` |
| M03.2 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.2/CLOSURE_2026-08-19.md` |
| M03.3 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.3/CLOSURE_2026-08-19.md` |
| M03.4 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.4/CLOSURE_2026-08-19.md` |
| M03.5 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.5/CLOSURE_2026-08-19.md` |
| F03 / M03.6 | ACTIVE | `.ai/microphases/M03_6.md` |

## Cierres canónicos recientes
### M03.3
- PR `#15`; merge `5d6e5d341222b924c3f8eb40567ab15dc1628ff8`.
- Run en `main` `32275890306` — success.
- Artifact `9374022673`; digest `sha256:3068924b873f9ccbff75f5ddfbfefa57ee8ddbb55c7baa2fce5bd0d0ce153923`.
- Node `27/27`, Vitest `161/161`, build PASS, Playwright `12/12`.

### M03.4
- Head `dd6ac8ea28276d9a1fc05f387338cba5980462a5`.
- Run en `main` `32278183037` — success; job `96150413578`.
- Artifact `9374817606`; digest `sha256:7f22461f600be17afa7b72a2cb54cccf0d08115ca9fe30c8dd2b583567847dd9`.
- Closure marker `PASS_M03_4_TOPBAR_SETTINGS`.
- Node `27/27`, Vitest `169/169`, build PASS, Playwright `16/16` y `npm run check` GREEN.
- Topbar 52px, Settings gear último, Sheet Radix, restore-focus y WorkspacePreferencesPort compartido.

### M03.5
- PR `#18`; base `main@dd6ac8ea28276d9a1fc05f387338cba5980462a5`.
- Head validado `5044a3456cee87094f66d8c5f262b457ea338020`.
- Run propietario `32296070741` — success; job `96207545673`.
- Artifact `9381289623`; digest `sha256:c78ebf5db9dd87d2235a08907f2f9e51ce9e00a070190540322530d026f4c73c`.
- Closure marker `PASS_M03_5_EDITOR_LAYOUT`.
- Structural `1/1`; Vitest dedicado `7/7`; Playwright dedicado `4/4`.
- Full gate: Node `28/28`, Vitest `176/176` en 53 archivos, Playwright `20/20`, typecheck/build GREEN.
- Contexto 288px 240–380, Canvas dominante, Inspector 320px 280–440 y Statusbar AppShell 26px.
- Radix `SheetTrigger` preserva restore-focus y `help.studio.shell` conserva ownership único en AppShell.

## Transición M03.6
- M03.6 es la única microfase `ACTIVE`.
- Su implementación permanece bloqueada únicamente por la integración de PR `#18` y la revalidación M03.5 sobre `main`; no existe blocker funcional P0/P1 conocido.
- Scope siguiente: laptop con colapso/overlay cuando Canvas sea estrecho; tablet con rail + Sheets; móvil con Topbar compacta + bottom nav `Components | Screens | Canvas | Properties | More`, Properties en bottom Sheet y Outline en Sheet full-height.
- No puede desaparecer ninguna capacidad primaria ni adelantarse scope de M03.7+.

## Historial extendido
- hasta M00.8: `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`;
- M00.9–M01.5: `.ai/archive/TRACKING_THROUGH_M01.5_2026-08-18.md`;
- changelog histórico: `.ai/archive/CHANGELOG_THROUGH_M00.8_2026-08-17.md`;
- cierres F02: `.ai/evidence/F02/`;
- cierres/progreso F03: `.ai/evidence/F03/`.
