# HANDOFF — ElectroCraft

## Current
F03 / M03.7 — Aplicar Progressive Disclosure y arquitectura de información — `ACTIVE`.

## Estado heredado
- M03.6 cerró GREEN en PR `#19`, head funcional `f82d119d4c65bad6908674801dcb18ff318bab88`.
- Run propietario `32299990614` success; job `96220101415`.
- Artifact `9382670739`; digest `sha256:8220e02ccde96f013de24c4ee258f3bbe36fb1600d486e6b65277ba4353bb67f`.
- Gate M03.6: structural `1/1`, Vitest dedicado `12/12`, Playwright dedicado `4/4`, Node global `29/29`, Vitest global `188/188`, Playwright global `24/24`, typecheck/build GREEN.

## Siguiente acción exacta
1. Confirmar que el gate M03.6 post-cierre sigue GREEN con `M03.6 COMPLETADA` y `M03.7 ACTIVE`.
2. Integrar PR `#19` en `main` sin introducir cambios ajenos al scope validado.
3. Revalidar el gate propietario M03.6 sobre `main` y exigir GREEN.
4. Crear una rama limpia desde ese `main` y comenzar M03.7 según `.ai/microphases/M03_7.md`.
5. Crear `UX_INFORMATION_ARCHITECTURE.md`, clasificar opciones primary/contextual/advanced/diagnostic y aplicar primero a Settings/Inspector/List-Detail.
6. No implementar M03.8 mientras M03.7 permanezca ACTIVE.

## Decisiones vigentes
- Desktop conserva geometría M03.5.
- Laptop conserva rail 64px y usa split >=1152 / overlay secundario entre 1024–1151.
- Tablet usa rail global 56px + navegación completa en Sheet.
- Móvil usa dock 58px exacto `Componentes | Pantallas | Lienzo | Propiedades | Más`.
- Propiedades usa bottom Sheet; Más expone Outline/Capas full-height.
- Pantallas usa el registry canónico del Sidebar.
- `SheetContent` Radix existente soporta `left | right | bottom`; no existe otro drawer subsystem.
- Puck conserva ownership detrás de `@electrocraft/editor-puck`.
- M03.7 debe reducir complejidad visible sin eliminar capacidades, rutas canónicas ni diagnostics importantes.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M03_7.md → UI_UX_LAYOUT_RULES.md`.
