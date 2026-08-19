# STATE — ElectroCraft

## Estado actual
- F00 — Reconocimiento, verificación y arquitectura: `COMPLETADA`.
- F01 — Monorepo, límites, documentación y CI: `COMPLETADA`; Gate `GREEN`.
- F02 — Modelo canónico del proyecto: `COMPLETADA`; M02.1–M02.9 `COMPLETADAS`; Gate `GREEN`.
- F03 — Design System, AppShell, español y ayuda: `IN_PROGRESS`.
- M03.1 — shadcn/ui Radix, Lucide y tokens ElectroCraft: `COMPLETADA`; Gate `GREEN`.
- M03.2 — Construir AppShell desktop: `COMPLETADA`; Gate `GREEN`.
- M03.3 — Construir Sidebar global: `ACTIVE`.
- Blockers P0/P1: `0`.

## Cierre predecesor
M03.2 cerró sobre `main@38b2f5aac504a406b42537b7aade8f3d26626e7d` con run `32272740576` `success`, artifact `9372820239`, digest `sha256:81531bf99ddd82d56ba813ec87f15305f6af0407498915363d802b174c97bce8` y full `npm run check` GREEN.

## Microfase activa
`M03.3` — Construir Sidebar global.

Objetivo: Sidebar global izquierdo con grupos exactos `Construir | Datos | Lógica | App | Recursos | Apariencia | Publicar`, iconos Lucide, `aria-current`, collapse desktop `240→64`, tooltip en modo compacto y `WorkspacePreferencesPort` con adapter in-memory reemplazable por persistencia F04.

## Referencias
- Spec: `.ai/microphases/M03_3.md`.
- AppShell contract: `.ai/APP_SHELL_SPEC.md`.
- Fase: `.ai/phases/F03.md`.
- Evidencia M03.2: `.ai/evidence/F03/M03.2/CLOSURE_2026-08-19.md`.
- Evidencia M03.3: `.ai/evidence/F03/M03.3/IMPLEMENTATION_2026-08-19.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.

No iniciar M03.4 hasta cerrar M03.3 con lint, typecheck, tests, build y validación Playwright pertinentes.
