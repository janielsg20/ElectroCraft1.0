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
| M03.6 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.6/CLOSURE_2026-08-19.md` |
| F03 / M03.7 | ACTIVE | `.ai/microphases/M03_7.md` |

## Cierres canónicos recientes
### M03.5
- PR `#18`; squash merge `f7577871dcadb843ea59a4bec0378cbbf9cc396b`.
- Run propietario PR `32296070741` — success; artifact `9381289623`.
- Revalidación en `main`: run `32297534296`, job `96212236246` — success.
- Artifact main `9381789348`; digest `sha256:b5d07c57b0a24e8c1a4cf9df94707cd5eaf23948639fd8e0ab24081e46ac361b`.
- Full gate: Node `28/28`, Vitest `176/176`, Playwright `20/20`, typecheck/build GREEN.

### M03.6
- PR `#19`; head funcional validado `f82d119d4c65bad6908674801dcb18ff318bab88`.
- Run propietario `32299990614` — success; job `96220101415`.
- Artifact `9382670739`; digest `sha256:8220e02ccde96f013de24c4ee258f3bbe36fb1600d486e6b65277ba4353bb67f`.
- Structural `1/1`; Vitest dedicado `12/12`; Playwright dedicado `4/4`.
- Full gate: Node `29/29`, Vitest `188/188` en 56 archivos, Playwright `24/24`, typecheck/build GREEN.
- Laptop conserva rail 64px y usa overlay secundario cuando viewport <1152 dentro de la banda laptop.
- Tablet usa rail global 56px + navegación completa y herramientas secundarias en Sheets.
- Móvil usa dock inferior 58px exacto `Componentes | Pantallas | Lienzo | Propiedades | Más`; Propiedades bottom Sheet y Más/Capas full-height.
- Pantallas reutiliza el registry canónico del Sidebar; Puck permanece detrás de `@electrocraft/editor-puck`.

## Transición M03.7
- M03.7 es la única microfase `ACTIVE`.
- Su contrato exige `UX_INFORMATION_ARCHITECTURE.md`, clasificación primary/contextual/advanced/diagnostic, Progressive Disclosure primero en Settings/Inspector/List-Detail, empty states y microcopy/help sin rutas redundantes.
- La implementación M03.7 permanece bloqueada únicamente hasta integrar PR `#19` y revalidar M03.6 GREEN sobre `main`.

## Historial extendido
- hasta M00.8: `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`;
- M00.9–M01.5: `.ai/archive/TRACKING_THROUGH_M01.5_2026-08-18.md`;
- changelog histórico: `.ai/archive/CHANGELOG_THROUGH_M00.8_2026-08-17.md`;
- cierres F02: `.ai/evidence/F02/`;
- cierres/progreso F03: `.ai/evidence/F03/`.
