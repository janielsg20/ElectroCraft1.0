# HANDOFF — ElectroCraft

## Current
F03 / M03.6 — Adaptar laptop/tablet/mobile — `ACTIVE`.

## Estado heredado
- M03.5 fue integrado por PR `#18` como `main@f7577871dcadb843ea59a4bec0378cbbf9cc396b`.
- Gate propietario M03.5 sobre `main`: run `32297534296`, job `96212236246` — success.
- Artifact `9381789348`; digest `sha256:b5d07c57b0a24e8c1a4cf9df94707cd5eaf23948639fd8e0ab24081e46ac361b`.
- Full gate M03.5: Node `28/28`, Vitest `176/176`, Playwright `20/20`, typecheck/build GREEN.

## Implementación M03.6 actual
- Rama `agent/m03-6-responsive-shell` creada desde el `main` ya validado.
- Laptop conserva rail AppShell 64px; editor usa `split` >=1152 y un único overlay de herramienta secundaria entre 1024–1151.
- Tablet usa rail global 56px + navegación completa en Sheet y Contexto/Inspector en Sheets.
- Móvil usa Topbar compacta + dock inferior exacto `Componentes | Pantallas | Lienzo | Propiedades | Más`.
- Propiedades usa el `Sheet` Radix existente extendido con `side="bottom"`; Más expone Outline/Capas en Sheet full-height.
- Pantallas resuelve su href desde el registry canónico del Sidebar.
- Puck mantiene ownership detrás de `@electrocraft/editor-puck`; Studio no importa `@puckeditor/core`.
- Copy español, HelpRegistry, icon IDs semánticos y objetivos táctiles >=44px implementados.
- Unit/contract/integration/Playwright M03.6 preparados; M03.2 tablet actualizado al contrato superseding de rail.

## Siguiente acción exacta
1. Añadir structural gate M03.6 y workflow propietario.
2. Ejecutar gate dedicado y `npm run check` completo en GitHub Actions.
3. Corregir únicamente fallos reales de formato, typecheck, tests, build o browser audit.
4. Con M03.6 GREEN, registrar closure, pasar M03.6 a COMPLETADA y activar solo la microfase siguiente declarada por el repo.
5. No adelantar M03.7 mientras M03.6 permanezca ACTIVE.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M03_6.md → .ai/APP_SHELL_SPEC.md`.
