# STATE — ElectroCraft

## Estado actual
- F00 — Reconocimiento, verificación y arquitectura: `COMPLETADA`.
- F01 — Monorepo, límites, documentación y CI: `COMPLETADA`.
- Gate F01: `GREEN`.
- F02 — Modelo canónico del proyecto: `COMPLETADA`.
- M02.1–M02.9: `COMPLETADAS` con evidencia real.
- Gate F02: `GREEN`.
- F03 — Design System, AppShell, español y ayuda: `IN_PROGRESS`.
- M03.1 — Inicializar shadcn/ui Radix, Lucide y tokens ElectroCraft: `ACTIVE`.
- Avance local M03.1: foundation/tokens, primitives reales sobre `radix-ui`, Lucide registry, Tailwind v4, galería `/__design-system`, i18n/help/shell y suites de prueba preparados sobre `main@0afa336`.
- Blockers P0/P1 de producto: `0`.
- Bloqueo local de cierre: registry npm inaccesible. El workflow M03.1 v4 lo compensa generando un lockfile candidato en GitHub Actions, ejecutando el gate real y subiendo `m03-1-lockfile-candidate` sin escribir automáticamente en el repo.

## Microfase activa
`M03.1` — Inicializar shadcn/ui Radix, Lucide y tokens ElectroCraft.

Objetivo actual: consolidar `packages/design-system` como owner del sistema visual, inicializar el stack shadcn/ui sobre Radix, Tailwind y Lucide, definir tokens semánticos ElectroCraft, tema light/dark/system, primitives accesibles y una galería técnica reutilizable sin adelantar AppShell M03.2.

## Referencias
- Spec: `.ai/microphases/M03_1.md`.
- Fase: `.ai/phases/F03.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.
- Evidencia parcial M03.1: `.ai/evidence/F03/M03.1/IMPLEMENTATION_2026-08-18.md`.
- Cierre F02: `.ai/evidence/F02/CLOSURE_2026-08-18.md`.

No iniciar M03.2 hasta cerrar M03.1 con instalación shadcn/Radix/Tailwind/Lucide reproducible, lint, typecheck, tests, build y validación visual/teclado pertinente.

## Estado de implementación M03.1
- Overlay v4 mantiene primitives sobre `radix-ui` real y corrige/normaliza la evidencia reproducible del commit base.
- Código/evidence/tests/gate están preparados sobre `main@0afa336`.
- Pendientes para DONE: lockfile real, `npm ci`/`npm run check` y Playwright real. El gate v4 comprueba el lockfile de forma ejecutable y usa `/__design-system` + Playwright para la validación visual requerida por contrato.
