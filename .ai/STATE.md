# STATE — ElectroCraft

## Estado actual
- F00 — Reconocimiento, verificación y arquitectura: `COMPLETADA`.
- F01 — Monorepo, límites, documentación y CI: `COMPLETADA`; Gate `GREEN`.
- F02 — Modelo canónico del proyecto: `COMPLETADA`; M02.1–M02.9 `COMPLETADAS`; Gate `GREEN`.
- F03 — Design System, AppShell, español y ayuda: `IN_PROGRESS`.
- M03.1 — shadcn/ui Radix, Lucide y tokens ElectroCraft: `COMPLETADA`; Gate `GREEN`.
- M03.2 — Construir AppShell desktop: `COMPLETADA`; Gate `GREEN`.
- M03.3 — Construir Sidebar global: `COMPLETADA`; Gate `GREEN`.
- M03.4 — Construir Topbar global + Settings: `COMPLETADA`; Gate `GREEN`.
- M03.5 — Construir Context/Canvas/Inspector/Status: `COMPLETADA`; Gate `GREEN`.
- M03.6 — Adaptar laptop/tablet/mobile: `COMPLETADA`; Gate `GREEN`.
- M03.7 — Aplicar Progressive Disclosure y arquitectura de información: `COMPLETADA`; Gate `GREEN`.
- M03.8 — Diseñar Palette descubrible sin multiplicar componentes: `COMPLETADA`; Gate `GREEN`.
- M03.9 — Apariencia del Studio Editor completo: `COMPLETADA`; Gate `GREEN`.
- M03.10 — Infraestructura español-primero e i18n tipado: `COMPLETADA`; Gate `GREEN`.
- M03.11 — Sistema de ayuda contextual y explicación de todas las secciones: `COMPLETADA`; Gate `GREEN`.
- M03.12 — E2E AppShell completo, responsive, estados y accesibilidad: `ACTIVE`.
- Blockers P0/P1 funcionales conocidos: `0`.

## Cierre M03.11
M03.11 cerró sobre head `afcb2c304332a4a3819ef878cb9d3e3c3e91ea9d` con workflow propietario `M03.11 Contextual Help Gate`, run `32320190802`, job `96280687167`, artifact `9389415829` y digest `sha256:500c49b1ab6c73ceec1ba80324964cc9b5d64b72cb867ec0707ca33edbaec2a8`.

Suite dedicada `12/12`, browser `5/5` y full repository gate GREEN. Base CI `32320190809` confirmó lint, typecheck, tests, build y Playwright repository gate GREEN sobre el mismo head.

## Microfase activa
`M03.12` — E2E AppShell completo, responsive, estados y accesibilidad.

Objetivo: cerrar F03 mediante una matriz Playwright semántica en 1440/1280/1024/768/375/320, sin esperas fijas, validando navegación, Settings, Help, Editor, estados, responsive, teclado/foco, ausencia de labels inglesas y aislamiento de StudioAppearanceProfile respecto al documento/Theme/ExportIR.

## Referencias
- Spec M03.12: `.ai/microphases/M03_12.md`.
- Fase: `.ai/phases/F03.md`.
- AppShell canónico: `.ai/APP_SHELL_SPEC.md`.
- Evidencia M03.11: `.ai/evidence/F03/M03.11/CLOSURE_2026-08-20.md`.
- Help catalog: `.ai/SECTION_HELP_CATALOG_ES.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.

No declarar M03.12/F03 completada sin viewport matrix, estados, keyboard/focus, screenshot/trace de fallos, no-English audit, aislamiento de apariencia y gate completo GREEN.
