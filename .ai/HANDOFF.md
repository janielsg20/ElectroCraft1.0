# HANDOFF — ElectroCraft

## Current
F03 / M03.3 — Construir Sidebar global — `ACTIVE`.

## Estado heredado
- M03.1: `COMPLETADA/GREEN`.
- M03.2: `COMPLETADA/GREEN`; PR `#13`, merge `38b2f5aac504a406b42537b7aade8f3d26626e7d`, run `32272564567`, artifact `9372759537`.
- AppShell estructural ya es real: 100dvh, Sidebar 240/64, Topbar 52, workspace flexible, Statusbar 26 y Sheet Radix responsive.

## Siguiente acción exacta
1. Implementar Sidebar agrupado exacto de M03.3 sobre el AppShell existente.
2. Conectar collapse a `WorkspacePreferencesPort` con adapter in-memory F03.
3. Ejecutar suite dedicada y full repository gate con Playwright.
4. Si GREEN, registrar cierre M03.3 y activar M03.4 — Topbar y Settings Gear.

## Decisiones vigentes
- `packages/design-system` sigue siendo único owner de primitives/tokens/Lucide registry.
- Studio consume solo `@electrocraft/design-system` por root export.
- No duplicar router, Sidebar ni primitives shadcn/Radix.
- `WorkspacePreferencesPort` es contrato de UI; F04 sustituirá únicamente el adapter por persistencia PGlite.
- Tooltips apoyan el rail colapsado, pero la ayuda crítica vive en `help.studio.shell`.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M03_3.md`.
