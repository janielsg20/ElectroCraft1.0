# HANDOFF — ElectroCraft

## Current
F03 / M03.3 — Construir Sidebar global — `ACTIVE`.

## Estado heredado
- `main@38b2f5aac504a406b42537b7aade8f3d26626e7d` cerró M03.2 con run `32272740576` success.
- M03.2 artifact `9372820239`; digest `sha256:81531bf99ddd82d56ba813ec87f15305f6af0407498915363d802b174c97bce8`.
- El full repository gate de M03.2 pasó lint, typecheck, boundaries, tests, build y Playwright; no hubo formatting candidate pendiente.

## Siguiente acción exacta
1. Ejecutar `M03.3 Sidebar Gate` sobre la rama de implementación.
2. Resolver únicamente fallos reales de formato, typecheck, tests, build o Playwright.
3. Con M03.3 GREEN, registrar cierre y activar M03.4 — Construir Topbar global + Settings.
4. No adelantar persistencia PGlite: F03 usa `WorkspacePreferencesPort` con adapter in-memory explícito.

## Decisiones vigentes
- Los grupos del Sidebar son exactamente `Construir | Datos | Lógica | App | Recursos | Apariencia | Publicar`.
- El Sidebar usa Lucide mediante el registry semántico de `packages/design-system`; Studio no importa `lucide-react` directamente.
- Desktop permite `240→64`; laptop conserva rail 64; tablet/mobile reutilizan el Sheet Radix del AppShell.
- `WorkspacePreferencesPort` desacopla la UI de persistencia. F04 podrá cambiar solo el adapter.
- Topbar funcional, Ayuda/Configuración y Settings pertenecen a M03.4.

## Read set
`AGENTS → .ai/README → RULES → MEMORY → STATE → TRACKING → HANDOFF → .ai/microphases/M03_3.md → .ai/APP_SHELL_SPEC.md`.
