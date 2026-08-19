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
- M03.7 — Aplicar Progressive Disclosure y arquitectura de información: `ACTIVE`.
- Blockers P0/P1: `0` funcionales conocidos; implementar M03.7 solo después de integrar M03.6 y confirmar su gate propietario GREEN sobre `main`.

## Cierre predecesor
M03.6 cerró en PR `#19` sobre head funcional `f82d119d4c65bad6908674801dcb18ff318bab88` con run propietario `32299990614` `success`, job `96220101415`, artifact `9382670739`, digest `sha256:8220e02ccde96f013de24c4ee258f3bbe36fb1600d486e6b65277ba4353bb67f` y full `npm run check` GREEN.

## Microfase activa
`M03.7` — Aplicar Progressive Disclosure y arquitectura de información.

Objetivo: reducir complejidad visible sin eliminar potencia profesional, clasificando opciones como primary/contextual/advanced/diagnostic, manteniendo módulos de primer nivel en navegación, colocando detalles secundarios en Disclosure y definiendo empty states/microcopy/help sin rutas redundantes.

## Referencias
- Spec: `.ai/microphases/M03_7.md`.
- Fase: `.ai/phases/F03.md`.
- Evidencia M03.6: `.ai/evidence/F03/M03.6/CLOSURE_2026-08-19.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.

No implementar M03.7 hasta integrar PR `#19` y confirmar el gate M03.6 GREEN sobre `main`. No activar M03.8 ni declarar M03.7 completada sin su propia evidencia real.
