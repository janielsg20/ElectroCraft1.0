# STATE — ElectroCraft

## Estado actual
- F00 — Reconocimiento, verificación y arquitectura: `COMPLETADA`.
- F01 — Monorepo, límites, documentación y CI: `COMPLETADA`; Gate `GREEN`.
- F02 — Modelo canónico del proyecto: `COMPLETADA`; M02.1–M02.9 `COMPLETADAS`; Gate `GREEN`.
- F03 — Design System, AppShell, español y ayuda: `IN_PROGRESS`.
- M03.1 — shadcn/ui Radix, Lucide y tokens ElectroCraft: `COMPLETADA`; Gate `GREEN`.
- M03.2 — Construir AppShell desktop: `ACTIVE`.
- Blockers P0/P1: `0`.

## Cierre predecesor
M03.1 cerró sobre `main@c0ee291f29405a1f1dd9fb1c14afe7d13b3a45ae` con run `32267795991` `success`, artifact `9370938322`, digest `sha256:0aa9467b713fcc66f19d91acfd6d31c783b35aaa5ddddda04a8d5a379760156f` y full `npm run check` GREEN.

## Microfase activa
`M03.2` — Construir AppShell desktop.

Objetivo: shell global `100dvh` con Sidebar `240/64`, Topbar `52`, workspace flexible con scroll interno y Statusbar `26`; responsive real desktop/laptop/tablet/mobile y ayuda/i18n accesibles, sin adelantar las capacidades completas de Sidebar M03.3 ni Topbar M03.4.

## Referencias
- Spec: `.ai/microphases/M03_2.md`.
- Fase: `.ai/phases/F03.md`.
- Evidencia M03.1: `.ai/evidence/F03/M03.1/CLOSURE_2026-08-19.md`.
- Evidencia M03.2: `.ai/evidence/F03/M03.2/IMPLEMENTATION_2026-08-19.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.

No iniciar M03.3 hasta cerrar M03.2 con lint, typecheck, tests, build y validación Playwright pertinentes.
