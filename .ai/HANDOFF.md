# HANDOFF — ElectroCraft

## Current
F03 / M03.2 — Construir AppShell desktop — `ACTIVE`.

## Estado heredado
- `main@c0ee291f29405a1f1dd9fb1c14afe7d13b3a45ae` cerró M03.1 con run `32267795991` success.
- M03.1 artifact `9370938322`; digest `sha256:0aa9467b713fcc66f19d91acfd6d31c783b35aaa5ddddda04a8d5a379760156f`.
- M03.2 implementa únicamente la estructura AppShell y responsive. No implementa el Sidebar agrupado/persistente de M03.3 ni la Topbar funcional/Settings de M03.4.

## Siguiente acción exacta
1. Aplicar el overlay M03.2 sobre `main@c0ee291f29405a1f1dd9fb1c14afe7d13b3a45ae`.
2. Ejecutar `M03.2 AppShell Gate`.
3. Resolver solo evidencia real del run si aparece un formatting/test/build/E2E blocker.
4. Con M03.2 GREEN, registrar cierre y activar M03.3 — Construir Sidebar global.

## Decisiones vigentes
- `packages/design-system` sigue siendo único owner de primitives/tokens.
- Studio consume solo `@electrocraft/design-system` root export.
- Tablet/mobile usan Sheet Radix; no hay desktop comprimido.
- Navigation grouping/icons/active/preferences pertenecen a M03.3.
- Topbar completa y Settings pertenecen a M03.4.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M03_2.md`.
