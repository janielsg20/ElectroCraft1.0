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
- M03.10 — Infraestructura español-primero e i18n tipado: `ACTIVE`.
- Blockers P0/P1 funcionales conocidos: `0`.

## Cierre M03.9
M03.9 cerró sobre head `457375512fcc3cc9da056720b86bad0c7233d920` con workflow propietario `M03.9 Editor Appearance Profile Gate`, run `32315742507` success, job `96267423764`, artifact `9388009972` y digest `sha256:d802096889a8ffed4a3806e5bb3bce8e11e570676cdee142afc9ba74a3a3cb5d`.

Suite dedicada: unit `8/8`, contract `4/4`, integration `2/2`, Playwright `7/7`. Full gate: Node `37/37`, Vitest `244/244` en 66 archivos, Playwright `52/52`, lint/format, TypeScript strict, boundaries y build GREEN. Base CI `32315742400` GREEN. M01.4 reparado y GREEN en run `32315742430`.

## Microfase activa
`M03.10` — Infraestructura español-primero e i18n tipado.

Objetivo: consolidar copy español, namespaces, fallback, tipado estricto, errores/Intl y selector `Configuración > General > Idioma` sobre `i18next + react-i18next`, preservando IDs internos estables y evitando fugas de labels inglesas desde engines OSS.

## Referencias
- Spec M03.10: `.ai/microphases/M03_10.md`.
- Fase: `.ai/phases/F03.md`.
- Evidencia M03.9: `.ai/evidence/F03/M03.9/CLOSURE_2026-08-19.md`.
- I18N spec: `.ai/I18N_SPEC.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.

No declarar M03.10 completada sin `packages/i18n/`, `locales/es/`, catálogo tipado/fallback, ui-string lint/test, selector real de idioma, HelpDescriptor y evidencia GREEN de lint/typecheck/test/build/E2E.
