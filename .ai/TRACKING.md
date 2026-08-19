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
| M03.7 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.7/CLOSURE_2026-08-19.md` |
| M03.8 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.8/CLOSURE_2026-08-19.md` |
| F03 / M03.9 | ACTIVE | `.ai/microphases/M03_9.md` |

## Cierres canónicos recientes
### M03.7
- PR `#21`; integrado en `main` mediante merge `8eeeb40cf0965db880bf6b451dee28c0c0c2041f`.
- Workflow propietario `M03.7 Information Architecture Gate`: run `32304389329` — success; artifact `9384209280`.
- Structural `1/1`; Vitest dedicado `17/17`; Playwright dedicado `10/10`.
- Full gate: Node `30/30`, Vitest `205/205` en 59 archivos, Playwright `34/34`, lint/typecheck/build GREEN.
- Implementa taxonomía `primary | contextual | advanced | diagnostic`; Advanced usa Progressive Disclosure Radix y diagnostics de estado no se esconden.
- Inspector conserva ownership de Puck; `/content` es la ruta canónica List/Detail; rutas redundantes fallan cerradas.

### M03.8
- Rama `agent/m03-8-palette-discoverability` creada desde `main` ya revalidado tras M03.7.
- Head funcional canónico `b3e66bf4d85518ea3f3102e8ffe0db472aea9947`.
- Workflow propietario `M03.8 Discoverable Palette Gate`: run `32308655658` — success; job `96246831243`.
- Artifact `9385669357`; digest `sha256:1692ec47ef5cab4a30a480d8c3b7fb2763c9f2daf2faf5ad0e88b5aa1429434c`.
- Structural M03.8 `7/7`; M03.5 successor composition `1/1`; Vitest dedicado `27/27`; Playwright dedicado `11/11`.
- Full gate: Node `37/37`, Vitest `230/230` en 63 archivos, Playwright `45/45`, lint/format, TypeScript strict, boundaries y builds GREEN.
- Palette gobernada por `.ai/PALETTE_CATALOG_MATRIX.md` con las 10 categorías exactas, search conceptual y UX High Density responsive.
- Favoritos/Recientes persisten solo `paletteItemId` como workspace preferences.
- Puck conserva drag/composition ownership; click-to-insert pasa por `@electrocraft/editor-puck` y los mappings ausentes quedan visibles como diagnostics fail-closed.
- Los gates históricos M03.5/M03.6/M03.7 se adaptaron a la nueva composición/transición sin retirar sus checks funcionales, responsive o de boundary.

## Transición M03.9
- M03.9 es la única microfase `ACTIVE`.
- Owner: `shadcn/ui Radix + ElectroCraft Studio tokens`.
- Ubicación: `Configuración > Apariencia del Studio`.
- Debe definir `StudioAppearanceProfile` como preference schema separada del theme del proyecto.
- Debe soportar Modo/Colores/Tipografía/Iconos/Forma/Densidad/Movimiento, Preview/Apply/Revert, presets personales, reduced motion y Restore Accessible Defaults.
- El E2E debe demostrar que cambiar la apariencia del Studio no modifica ElectroCraftDocument, Theme del proyecto ni ExportIR.

## Historial extendido
- hasta M00.8: `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`;
- M00.9–M01.5: `.ai/archive/TRACKING_THROUGH_M01.5_2026-08-18.md`;
- changelog histórico: `.ai/archive/CHANGELOG_THROUGH_M00.8_2026-08-17.md`;
- cierres F02: `.ai/evidence/F02/`;
- cierres/progreso F03: `.ai/evidence/F03/`.
