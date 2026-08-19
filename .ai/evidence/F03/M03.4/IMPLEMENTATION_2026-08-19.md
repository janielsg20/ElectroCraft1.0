# M03.4 — Implementation evidence — 2026-08-19

Status: `ACTIVE`.

Base: `main@5d6e5d341222b924c3f8eb40567ab15dc1628ff8`.

## Scope
- Topbar global exacta de 52px.
- Left: proyecto local, breadcrumb activo y estado honesto.
- Center: documento, plataforma, breakpoint, historial y zoom; acciones sin owner permanecen disabled.
- Right: Vista previa, Exportar, indicador Local, Ayuda y Configuración.
- Settings Gear siempre último al extremo derecho.
- Settings Sheet Radix con restore focus y control real del Sidebar mediante `WorkspacePreferencesPort`.
- Help Sheet persistente con `help.studio.shell`.
- Tablet/móvil trasladan herramientas secundarias a Sheet; no comprimen desktop.

## Fuera de scope
- Historial real/undo-redo del editor.
- Persistencia PGlite de preferencias.
- Inspector final de M03.5.

## Gate preparado
- verifier estructural M03.4.
- unit del modelo de breadcrumb/estado.
- contract de layout, orden Settings y Lucide/i18n.
- integration Topbar + Settings + WorkspacePreferencesPort.
- Playwright desktop/responsive/keyboard/focus/restore focus/settings.
- full `npm run check`.

No declarar M03.4 COMPLETADA hasta obtener evidencia GREEN de Actions.
