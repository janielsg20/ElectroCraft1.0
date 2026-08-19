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
| F03 / M03.5 | ACTIVE | `.ai/microphases/M03_5.md` + `.ai/evidence/F03/M03.5/IMPLEMENTATION_2026-08-19.md` |

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

## Implementación M03.5
- Base exacta: `main@dd6ac8ea28276d9a1fc05f387338cba5980462a5`.
- Contexto: 288px desktop, rango 240–380px.
- Canvas: región dominante `minmax(0, 1fr)` con `Puck.Preview` real.
- Inspector: 320px desktop, rango 280–440px.
- Status: se conserva el Statusbar owner de AppShell a 26px, informativo y sin acciones nuevas.
- Resizers desktop accesibles por puntero/teclado y con límites explícitos.
- Laptop: Contexto 240px + Canvas; Inspector en Sheet.
- Tablet/móvil: Canvas prioritario; Contexto e Inspector en Sheet.
- Puck permanece encapsulado por `@electrocraft/editor-puck`; no existe import directo desde Studio.
- Placeholders son estructurales y explícitos; no simulan widgets ni persistencia futura.
- Tests unit/contract/integration/node/E2E incluidos; gate completo pendiente sobre el árbol aplicado.
- M03.6 no puede iniciar hasta Gate GREEN de M03.5.

## Historial extendido
- hasta M00.8: `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`;
- M00.9–M01.5: `.ai/archive/TRACKING_THROUGH_M01.5_2026-08-18.md`;
- changelog histórico: `.ai/archive/CHANGELOG_THROUGH_M00.8_2026-08-17.md`;
- cierres F02: `.ai/evidence/F02/`;
- cierres/progreso F03: `.ai/evidence/F03/`.
