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
M03.2 cerró con PR `#13`, merge `38b2f5aac504a406b42537b7aade8f3d26626e7d`, run `32272564567` `success`, artifact `9372759537`, digest `sha256:0d621a9e9e46b39019c5f5377c7f298c4ce920838f2208939b021b557a4fceb5` y full repository gate GREEN.

## Microfase activa
`M03.3` — Construir Sidebar global.

Objetivo: Sidebar global agrupado en `Construir | Datos | Lógica | App | Recursos | Apariencia | Publicar`, con 24 items, Lucide, item activo, collapse 240→64, tooltips accesibles y `WorkspacePreferencesPort` conectado a un adapter in-memory durante F03.

## Referencias
- Spec: `.ai/microphases/M03_3.md`.
- Fase: `.ai/phases/F03.md`.
- Evidencia M03.2: `.ai/evidence/F03/M03.2/CLOSURE_2026-08-19.md`.
- Evidencia M03.3: `.ai/evidence/F03/M03.3/IMPLEMENTATION_2026-08-19.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.

No iniciar M03.4 hasta cerrar M03.3 con suite dedicada, lint, typecheck, tests, build y Playwright pertinentes.
