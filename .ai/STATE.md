# STATE — ElectroCraft

## Estado actual
- F00 — Reconocimiento, verificación y arquitectura: `COMPLETADA`.
- F01 — Monorepo, límites, documentación y CI: `COMPLETADA`; Gate `GREEN`.
- F02 — Modelo canónico del proyecto: `COMPLETADA`; M02.1–M02.9 `COMPLETADAS`; Gate `GREEN`.
- F03 — Design System, AppShell, español y ayuda: `IN_PROGRESS`.
- M03.1 — shadcn/ui Radix, Lucide y tokens ElectroCraft: `COMPLETADA`; Gate `GREEN`.
- M03.2 — Construir AppShell desktop: `COMPLETADA`; Gate `GREEN`.
- M03.3 — Construir Sidebar global: `COMPLETADA`; Gate `GREEN`.
- M03.4 — Construir Topbar global + Settings: `ACTIVE`.
- Blockers P0/P1: `0`.

## Cierre predecesor
M03.3 cerró sobre `main@5d6e5d341222b924c3f8eb40567ab15dc1628ff8` con run `32275890306` `success`, artifact `9374022673`, digest `sha256:3068924b873f9ccbff75f5ddfbfefa57ee8ddbb55c7baa2fce5bd0d0ce153923` y full `npm run check` GREEN.

## Microfase activa
`M03.4` — Construir Topbar global + Settings.

Objetivo: Topbar global de 52px con breadcrumb/proyecto/guardado a la izquierda, herramientas contextuales en el centro y Vista previa/Exportar/Local/Ayuda/Configuración a la derecha; gear último y Settings en Sheet Radix con restore-focus.

## Referencias
- Spec: `.ai/microphases/M03_4.md`.
- AppShell contract: `.ai/APP_SHELL_SPEC.md`.
- Fase: `.ai/phases/F03.md`.
- Evidencia M03.3: `.ai/evidence/F03/M03.3/CLOSURE_2026-08-19.md`.
- Evidencia M03.4: `.ai/evidence/F03/M03.4/IMPLEMENTATION_2026-08-19.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.

No iniciar M03.5 hasta cerrar M03.4 con lint, typecheck, tests, build y validación Playwright pertinentes.
