# M03.3 — Implementation evidence — 2026-08-19

Status: `ACTIVE`.

Base: `main@38b2f5aac504a406b42537b7aade8f3d26626e7d`.

## Scope
- Sidebar global agrupado exacto.
- 24 items con Lucide + label.
- item activo con `aria-current="page"`.
- collapse desktop 240→64.
- tooltips accesibles en rail.
- `WorkspacePreferencesPort` + adapter in-memory F03.
- responsive heredado: laptop 64; tablet/mobile Sheet Radix.
- ayuda persistente `help.studio.shell`.

## Fuera de scope
- Topbar funcional/Settings Gear: M03.4.
- Persistencia PGlite de preferencias: F04.
- Contenido funcional de rutas del editor: fases propietarias posteriores.

## Gate preparado
- verifier estructural M03.3.
- unit del preferences port.
- contract del mapa/grupos/sidebar.
- integration runtime con Radix/AppShell.
- Playwright desktop/collapse/active/tooltip/mobile.
- full `npm run check`.

No declarar M03.3 COMPLETADA hasta obtener evidencia GREEN de Actions.
