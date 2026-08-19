# HANDOFF — ElectroCraft

## Current
F03 / M03.4 — Construir Topbar global + Settings — `ACTIVE`.

## Estado heredado
- `main@5d6e5d341222b924c3f8eb40567ab15dc1628ff8` cerró M03.3 con run `32275890306` success.
- M03.3 artifact `9374022673`; digest `sha256:3068924b873f9ccbff75f5ddfbfefa57ee8ddbb55c7baa2fce5bd0d0ce153923`.
- Full gate M03.3: Node `27/27`, Vitest `161/161`, build PASS y Playwright `12/12`.

## Siguiente acción exacta
1. Ejecutar `M03.4 Topbar Settings Gate` sobre la rama de implementación.
2. Resolver únicamente fallos reales de formato, typecheck, tests, build o Playwright.
3. Con M03.4 GREEN en PR, fusionar y volver a validar el gate propietario en `main`.
4. Solo después registrar cierre y activar M03.5.

## Decisiones vigentes
- Topbar mantiene 52px y tres regiones responsive.
- Settings gear es la última acción derecha y abre Sheet Radix.
- Settings > Espacio de trabajo controla el mismo `WorkspacePreferencesPort` del Sidebar.
- Radix mantiene restore-focus por defecto; no se sobrescribe `onCloseAutoFocus`.
- Ayuda crítica usa `help.studio.shell` en un Sheet visible, no solo Tooltip.
- M03.5 Inspector permanece fuera de scope.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M03_4.md → .ai/APP_SHELL_SPEC.md`.
