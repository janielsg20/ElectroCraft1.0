# HANDOFF — ElectroCraft

## Current
F03 / M03.4 — Construir Topbar y Settings Gear — `ACTIVE`.

## Estado heredado
- `main@5d6e5d341222b924c3f8eb40567ab15dc1628ff8` cerró M03.3 con run `32275890306` success.
- M03.3 artifact `9374022673`; digest `sha256:3068924b873f9ccbff75f5ddfbfefa57ee8ddbb55c7baa2fce5bd0d0ce153923`.
- El full repository gate de M03.3 pasó suite dedicada, lint, typecheck, boundaries, tests, build y Playwright; no hubo formatting candidate pendiente.

## Siguiente acción exacta
1. Implementar Topbar 52px sobre el AppShell existente, sin reemplazar Sidebar ni primitives.
2. Mantener Settings Gear como último control del extremo derecho y validar restore focus del Sheet Radix.
3. Conectar Configuración a `WorkspacePreferencesPort` para alternar Sidebar Expandida/Compacta.
4. Ejecutar `M03.4 Topbar Gate`; corregir solo fallos reales y cerrar GREEN antes de M03.5.

## Decisiones vigentes
- La Topbar usa el mismo design-system Radix/Lucide; Studio no importa `lucide-react` directamente.
- Deshacer/Rehacer permanecen explícitamente deshabilitados hasta que exista su owner funcional; no se simulan acciones.
- `Proyecto local`, estado de guardado y `Local` describen contexto del Studio, no crean Project Objects canónicos.
- Ayuda crítica se renderiza en un Sheet persistente usando `help.studio.shell`; no vive solo en tooltip.
- Settings reutiliza `WorkspacePreferencesPort`; F04 podrá sustituir únicamente el adapter de persistencia.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M03_4.md → .ai/APP_SHELL_SPEC.md`.
