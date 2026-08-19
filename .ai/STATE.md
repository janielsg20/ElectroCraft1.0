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
- M03.9 — Apariencia del Studio Editor completo: `ACTIVE`.
- Blockers P0/P1 funcionales conocidos: `0`.

## Cierre M03.8
M03.8 cerró funcionalmente sobre head `b3e66bf4d85518ea3f3102e8ffe0db472aea9947` con workflow propietario `M03.8 Discoverable Palette Gate`, run `32308655658` `success`, job `96246831243`, artifact `9385669357` y digest `sha256:1692ec47ef5cab4a30a480d8c3b7fb2763c9f2daf2faf5ad0e88b5aa1429434c`.

Gate dedicado: structural `7/7`, revalidación M03.5 `1/1`, Vitest `27/27`, Playwright `11/11`. Full `npm run check`: Node `37/37`, Vitest `230/230` en 63 archivos, Playwright `45/45`, lint/format, TypeScript strict, boundaries y build GREEN.

## Microfase activa
`M03.9` — Apariencia del Studio Editor completo.

Objetivo: crear una preferencia real `StudioAppearanceProfile` separada del theme del proyecto, aplicada mediante Studio design tokens con Preview/Apply/Revert, presets personales, responsive/accesibilidad y aislamiento probado respecto a ElectroCraftDocument, frontend Theme y ExportIR.

## Referencias
- Spec M03.9: `.ai/microphases/M03_9.md`.
- Fase: `.ai/phases/F03.md`.
- Evidencia M03.8: `.ai/evidence/F03/M03.8/CLOSURE_2026-08-19.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.

No declarar M03.9 completada sin `StudioAppearanceProfile schema`, `StudioAppearanceSettingsPanel`, Studio token provider, appearance isolation E2E y su propia evidencia real GREEN.
