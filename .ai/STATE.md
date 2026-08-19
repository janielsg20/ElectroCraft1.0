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
- Blockers P0/P1: `0` funcionales conocidos.

## Cierre predecesor
M03.5 fue integrado por PR `#18` como `main@f7577871dcadb843ea59a4bec0378cbbf9cc396b` y revalidado con run propietario `32297534296` `success`, job `96212236246`, artifact `9381789348`, digest `sha256:b5d07c57b0a24e8c1a4cf9df94707cd5eaf23948639fd8e0ab24081e46ac361b` y full `npm run check` GREEN.

## Microfase activa
`M03.6` — Adaptar laptop/tablet/mobile.

Objetivo: preservar todas las capacidades del editor al adaptar laptop, tablet y móvil; laptop usa rail y overlay cuando el Canvas queda estrecho, tablet usa rail + Sheets y móvil usa Topbar compacta + navegación inferior con Properties/Outline en superficies táctiles adecuadas.

## Referencias
- Spec: `.ai/microphases/M03_6.md`.
- AppShell contract: `.ai/APP_SHELL_SPEC.md`.
- Fase: `.ai/phases/F03.md`.
- Evidencia M03.5: `.ai/evidence/F03/M03.5/CLOSURE_2026-08-19.md`.
- Evidencia M03.6: `.ai/evidence/F03/M03.6/IMPLEMENTATION_2026-08-19.md`.
- Tracking: `.ai/TRACKING.md`.
- Handoff: `.ai/HANDOFF.md`.

M03.6 puede continuar dentro de su contrato. No activar M03.7 ni declarar M03.6 completada hasta que lint, typecheck, tests, build y browser gate sean GREEN con evidencia real.
