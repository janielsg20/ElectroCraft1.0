# TRACKING — ElectroCraft current position

Date: 2026-08-20.

## Estado por fase
| Scope | Estado | Evidencia principal |
|---|---|---|
| F00 | COMPLETADA | `.ai/evidence/F00/` |
| F01 | COMPLETADA / GREEN | `.ai/evidence/F01/` |
| F02 | COMPLETADA / GREEN | `.ai/evidence/F02/` |
| M03.1–M03.9 | COMPLETADAS / GREEN | `.ai/evidence/F03/` |
| M03.10 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.10/CLOSURE_2026-08-20.md` |
| M03.11 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.11/CLOSURE_2026-08-20.md` |
| F03 / M03.12 | ACTIVE | `.ai/microphases/M03_12.md` |

## Cierre M03.11
- Rama `codex/m03-11-contextual-help`; PR `#25` apilado sobre M03.10.
- Head funcional `afcb2c304332a4a3819ef878cb9d3e3c3e91ea9d`.
- Workflow propietario run `32320190802`; job `96280687167`; artifact `9389415829`; digest `sha256:500c49b1ab6c73ceec1ba80324964cc9b5d64b72cb867ec0707ca33edbaec2a8`.
- HelpRegistry: 27 descriptores = 24 destinos canónicos + 3 transversales.
- Suite dedicada `12/12`; browser audit `5/5`; full repository gate GREEN.
- Base CI `32320190809`: lint/typecheck/tests/build/Playwright GREEN.
- Blockers P0/P1: `0`.

## Transición M03.12
- M03.12 es la única microfase `ACTIVE`.
- Playwright usa locators y web-first assertions con auto-waiting; no `waitForTimeout`.
- Viewports contractuales: `1440`, `1280`, `1024`, `768`, `375`, `320`.
- Debe cubrir rutas y superficies reales del AppShell, Settings, Help, Editor, Screens, Componentes, Datos/Consultas/Formularios/Admin/Medios, Temas, Preview, Compatibility y Export/Deploy sin fingir capacidades ausentes.
- Debe verificar estados `loading/empty/error/disabled/saving` donde existan seams reales, keyboard/focus, no-English leaks y aislamiento de StudioAppearanceProfile.
- Screenshots/traces se conservan para fallos/estados significativos; no usar sleeps fijos.
- Al cerrar M03.12, cerrar Gate F03 y activar F04/M04.1 automáticamente.

## Historial extendido
- cierres F00–F02: `.ai/evidence/`;
- cierres/progreso F03: `.ai/evidence/F03/`;
- histórico largo: `.ai/archive/` y `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`.
