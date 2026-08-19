# HANDOFF — ElectroCraft

## Current
F03 / M03.8 — Diseñar Palette descubrible sin multiplicar componentes — `ACTIVE`.

## Estado heredado
- M03.7 cerró GREEN en PR `#21`, head funcional `6f9acca7261f31ba38f79b286fa8e73124b89300`.
- Workflow propietario `M03.7 Information Architecture Gate`: run `32304389329` success; job `96233873445`.
- Artifact `9384209280`; digest `sha256:d9b13f174fb36d64571bb1f200aa3f5a408130bd18d19bcfdf22227594001b84`.
- Gate M03.7: structural `1/1`, Vitest dedicado `17/17`, Playwright dedicado `10/10`, Node global `30/30`, Vitest global `205/205` en 59 archivos, Playwright global `34/34`, lint/typecheck/build GREEN.

## Siguiente acción exacta
1. Integrar PR `#21` en `main` solo con autorización explícita y sin introducir cambios ajenos al scope validado.
2. Revalidar el gate propietario M03.7 sobre `main` y exigir GREEN.
3. Crear una rama limpia desde ese `main` para M03.8.
4. Leer `PALETTE_CATALOG_MATRIX.md` como fuente de verdad y `.ai/microphases/M03_8.md` como contrato ejecutable.
5. Crear `PALETTE_UX_SPEC.md` y el índice de search/synonyms antes de renderizar UI nueva.
6. Implementar Palette en `Construir > Editor > Componentes` y `Construir > Componentes` sin derivar directamente el catálogo desde ComponentRegistry.
7. Mantener Puck como owner de drag/insert, ofrecer click-to-insert accesible y no duplicar ComponentDefinitions.
8. No declarar M03.8 completa sin unit/contract/integration/negative/E2E, lint, typecheck, test y build GREEN.

## Decisiones vigentes
- La IA del Studio clasifica información como `primary | contextual | advanced | diagnostic`.
- Advanced usa Progressive Disclosure Radix encapsulado por `packages/design-system`; diagnostics críticos no se ocultan en Advanced.
- `/content` es la ruta canónica List/Detail; rutas redundantes/desconocidas fallan cerradas.
- Desktop conserva geometría M03.5.
- Laptop conserva rail 64px y usa split >=1152 / overlay secundario entre 1024–1151.
- Tablet usa rail global 56px + navegación completa en Sheet.
- Móvil usa dock 58px exacto `Componentes | Pantallas | Lienzo | Propiedades | Más`.
- Propiedades usa bottom Sheet; Más expone Outline/Capas full-height.
- Pantallas usa el registry canónico del Sidebar.
- `SheetContent` Radix existente soporta `left | right | bottom`; no existe otro drawer subsystem.
- Puck conserva ownership detrás de `@electrocraft/editor-puck`.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M03_8.md → PALETTE_CATALOG_MATRIX.md → UI_UX_LAYOUT_RULES.md`.
