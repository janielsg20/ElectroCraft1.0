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
| F03 / M03.6 | ACTIVE | `.ai/microphases/M03_6.md` + `.ai/evidence/F03/M03.6/IMPLEMENTATION_2026-08-19.md` |

## Cierres canónicos recientes
### M03.4
- Head `dd6ac8ea28276d9a1fc05f387338cba5980462a5`.
- Run en `main` `32278183037` — success; job `96150413578`.
- Artifact `9374817606`; digest `sha256:7f22461f600be17afa7b72a2cb54cccf0d08115ca9fe30c8dd2b583567847dd9`.
- Node `27/27`, Vitest `169/169`, build PASS, Playwright `16/16` y `npm run check` GREEN.

### M03.5
- PR `#18`; squash merge `f7577871dcadb843ea59a4bec0378cbbf9cc396b`.
- Head funcional validado `5044a3456cee87094f66d8c5f262b457ea338020`.
- Run propietario PR `32296070741` — success; artifact `9381289623`.
- Revalidación en `main`: run `32297534296`, job `96212236246` — success.
- Artifact main `9381789348`; digest `sha256:b5d07c57b0a24e8c1a4cf9df94707cd5eaf23948639fd8e0ab24081e46ac361b`.
- Full gate: Node `28/28`, Vitest `176/176`, Playwright `20/20`, typecheck/build GREEN.
- Contexto 288px 240–380, Canvas dominante, Inspector 320px 280–440 y Statusbar AppShell 26px.

## Implementación M03.6 en curso
- Rama limpia: `agent/m03-6-responsive-shell`, creada desde `main` después del GREEN de M03.5.
- Owner: `shadcn/ui Radix + AppShell`; Puck sigue detrás de `@electrocraft/editor-puck`.
- Laptop: rail AppShell 64px; estrategia `split` cuando viewport >=1152 y `overlay` para herramientas secundarias cuando viewport 1024–1151.
- Tablet 768–1023: rail global 56px + navegación completa en Sheet; Contexto/Inspector permanecen en Sheets y el Canvas domina.
- Móvil <768: Topbar compacta + dock inferior exacto `Componentes | Pantallas | Lienzo | Propiedades | Más`.
- `Pantallas` resuelve su href desde el registry canónico del Sidebar; no hardcodea una ruta paralela.
- `Propiedades` usa `Sheet side="bottom"`; `Más` expone Outline/Capas en Sheet full-height.
- `Sheet` Radix existente se extendió con `side="bottom"`; no se añadió otro drawer subsystem.
- Iconos móviles viven en el registry semántico Lucide del design-system.
- Objetivos táctiles del rail, dock y cierres de Sheets: >=44px; dock móvil 58px.
- Tests añadidos: unit, contract, integration y Playwright M03.6. M03.2 tablet se actualizó al contrato superseding de rail 56px.
- Pendiente: structural gate M03.6, workflow propietario, ejecución real de lint/typecheck/tests/build/E2E y cierre documental.

## Historial extendido
- hasta M00.8: `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`;
- M00.9–M01.5: `.ai/archive/TRACKING_THROUGH_M01.5_2026-08-18.md`;
- changelog histórico: `.ai/archive/CHANGELOG_THROUGH_M00.8_2026-08-17.md`;
- cierres F02: `.ai/evidence/F02/`;
- cierres/progreso F03: `.ai/evidence/F03/`.
