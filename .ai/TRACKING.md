# TRACKING — ElectroCraft current position

Date: 2026-08-19.

Historial detallado y evidencia previa permanecen en `.ai/evidence/`, `.ai/archive/` y `.ai/TRACKING_HISTORY_THROUGH_M00.8.md`.

| Scope | Estado | Evidencia principal |
|---|---|---|
| F00 | COMPLETADA | `.ai/evidence/F00/` |
| F01 | COMPLETADA / GREEN | `.ai/evidence/F01/` |
| F02 | COMPLETADA / GREEN | `.ai/evidence/F02/CLOSURE_2026-08-18.md` |
| M03.1 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.1/CLOSURE_2026-08-19.md` |
| M03.2 | COMPLETADA / GREEN | `.ai/evidence/F03/M03.2/CLOSURE_2026-08-19.md` |
| F03 / M03.3 | ACTIVE | `.ai/microphases/M03_3.md` + `.ai/evidence/F03/M03.3/IMPLEMENTATION_2026-08-19.md` |

## Cierre M03.1
- Head definitivo: `c0ee291f29405a1f1dd9fb1c14afe7d13b3a45ae`.
- Run `32267795991`: `success`.
- Artifact `9370938322`; digest `sha256:0aa9467b713fcc66f19d91acfd6d31c783b35aaa5ddddda04a8d5a379760156f`.
- Foundation shadcn/Radix, Lucide, Tailwind v4, tema, galería y full `npm run check` GREEN.

## Cierre M03.2
- PR `#13`; merge `38b2f5aac504a406b42537b7aade8f3d26626e7d`.
- Run propietario `32272564567`: `success` sobre head `49d87cadcc62b005f4f92b92fd541de276a58699`.
- Suite dedicada, Chromium, full repository gate, marker y status final: GREEN.
- Artifact `9372759537`; digest `sha256:0d621a9e9e46b39019c5f5377c7f298c4ce920838f2208939b021b557a4fceb5`.
- AppShell conserva `100dvh`, Sidebar `240/64`, Topbar `52`, workspace flexible y Statusbar `26`; tablet/mobile usan Sheet Radix.

## Inicio M03.3
- Sidebar owner: `shadcn/ui Radix + AppShell`; no se crea otro sistema de navegación.
- Grupos exactos: `Construir | Datos | Lógica | App | Recursos | Apariencia | Publicar`.
- 24 items exactos; Taxonomías/Relaciones no son top-level.
- Cada item usa Lucide + label; `aria-current="page"` identifica la ruta activa.
- Desktop permite collapse persistible 240→64; laptop conserva rail 64; tablet/mobile usan el Sheet estructural heredado.
- `WorkspacePreferencesPort` se define ahora con adapter in-memory; F04 podrá sustituir solo el adapter por PGlite.
- Ayuda crítica permanece en `help.studio.shell`; los tooltips no sustituyen la ayuda persistente.

## Gate actual
F03 está `IN_PROGRESS`; M03.1 y M03.2 están `COMPLETADAS/GREEN`; M03.3 es la única microfase `ACTIVE`.

## Siguiente transición permitida
Cerrar exclusivamente M03.3 con evidencia real. Solo después activar M03.4 — Construir Topbar y Settings Gear.
