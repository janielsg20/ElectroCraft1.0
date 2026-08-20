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
- M03.11 — Sistema de ayuda contextual y explicación de todas las secciones: `ACTIVE`.
- Blockers P0/P1 funcionales conocidos: `0`.

## Cierre M03.10
M03.10 cerró sobre head `4731b1056bf8e75377e45f3ff1b438a4d9e9a101` con workflow propietario `M03.10 Spanish-first i18n Gate`, run `32318184912` success, job `96274840342`, artifact `9388906418` y digest `sha256:3f7573c3af3da92fd002097155d926505d1711feb6b09da336caf42511b0dba6`.

Suite dedicada `12/12`; Playwright dedicado `4/4`. Full gate: Node `39/39`, Vitest `256/256` en 69 archivos, Playwright `56/56`, lint/format, TypeScript strict, boundaries y build/PWA GREEN. Base CI `32318184871` GREEN sobre el mismo head.

## Microfase activa
`M03.11` — Sistema de ayuda contextual y explicación de todas las secciones.

Objetivo: construir un `HelpRegistry` único y tipado, un `HelpTrigger` reutilizable y un Help Drawer global con búsqueda, usando Lucide + primitives shadcn/ui Radix, copy español desde el namespace `help`, adaptación Popover desktop / Sheet móvil y enlaces de ayuda desde estados vacíos reales.

La navegación canónica vigente es la cerrada por M03.3/APP_SHELL_SPEC. M03.11 no debe reintroducir destinos antiguos como Taxonomías/Relaciones/Roles ni inventar rutas/capacidades ausentes.

## Referencias
- Spec M03.11: `.ai/microphases/M03_11.md`.
- Fase: `.ai/phases/F03.md`.
- AppShell canónico: `.ai/APP_SHELL_SPEC.md`.
- Evidencia M03.10: `.ai/evidence/F03/M03.10/CLOSURE_2026-08-20.md`.
- I18N spec: `.ai/I18N_SPEC.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.

No declarar M03.11 completada sin HelpRegistry tipado, HelpTrigger reutilizable, Help Drawer con búsqueda, catálogo de ayuda español, adaptación responsive/keyboard/focus, enlaces desde empty states reales y evidencia GREEN de lint/typecheck/test/build/E2E.
