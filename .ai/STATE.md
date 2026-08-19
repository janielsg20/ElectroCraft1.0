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
- M03.6 — Adaptar laptop/tablet/mobile: `ACTIVE`.
- Blockers P0/P1: `0` funcionales conocidos; iniciar implementación M03.6 solo después de integrar M03.5 y confirmar su gate propietario GREEN en `main`.

## Cierre predecesor
M03.5 cerró en PR `#18` sobre head `5044a3456cee87094f66d8c5f262b457ea338020` con run propietario `32296070741` `success`, artifact `9381289623`, digest `sha256:c78ebf5db9dd87d2235a08907f2f9e51ce9e00a070190540322530d026f4c73c` y full `npm run check` GREEN.

## Microfase activa
`M03.6` — Adaptar laptop/tablet/mobile.

Objetivo: preservar todas las capacidades del editor al adaptar laptop, tablet y móvil; laptop usa colapso/overlay cuando el Canvas queda estrecho, tablet usa rail + Sheets y móvil usa Topbar compacta + navegación inferior con Properties/Outline en superficies táctiles adecuadas.

## Referencias
- Spec: `.ai/microphases/M03_6.md`.
- AppShell contract: `.ai/APP_SHELL_SPEC.md`.
- Fase: `.ai/phases/F03.md`.
- Evidencia M03.5: `.ai/evidence/F03/M03.5/CLOSURE_2026-08-19.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.

No implementar M03.6 hasta integrar PR `#18` y confirmar el gate M03.5 GREEN sobre `main`. Después continuar solo dentro del contrato M03.6.
