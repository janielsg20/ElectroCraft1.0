# M03.4 — Implementación — 2026-08-19

## Estado
`ACTIVE` — implementación preparada; cierre condicionado al Gate GREEN real.

## Base
- `main@5d6e5d341222b924c3f8eb40567ab15dc1628ff8`.
- Predecesor M03.3: run `32275890306` success; artifact `9374022673`.

## Implementación
- Topbar global de 52px con regiones izquierda/centro/derecha.
- Breadcrumb, contexto de ruta/proyecto y estado local visible.
- Documento, plataforma, breakpoint responsive, historial deshabilitado explícitamente cuando no aplica y zoom normalizado.
- Vista previa, Exportar, indicador Local, Ayuda y Configuración.
- Settings gear como última acción del extremo derecho.
- Settings abre Sheet Radix y configura `WorkspacePreferencesPort` del Sidebar.
- Ayuda abre `help.studio.shell`; la ayuda crítica no queda reducida a tooltip.
- Laptop/tablet/mobile trasladan herramientas secundarias a Sheet; móvil conserva targets >=44px.
- Lucide se consume exclusivamente por registry semántico del design-system.

## Invariantes
- Sin persistencia de preferencias en Project Objects.
- Sin `localStorage` ni PGlite añadidos por M03.4.
- Settings reutiliza el port ya creado en M03.3.
- Radix conserva restore-focus por defecto al cerrar Sheet.
- M03.5 Inspector permanece fuera de scope.

## Pruebas preparadas
- Unit: breakpoints y zoom.
- Contract: owner boundaries, gear último, Sheet Radix, restore-focus no sobrescrito.
- Integration: SSR de las tres regiones y estados.
- Playwright: geometría 52px, Settings, toggle Sidebar, restore-focus, Ayuda, tools Sheet tablet y touch targets móvil.
- Verifier: `tooling/scripts/verify-m03-4-topbar.mjs`.
- Workflow: `.github/workflows/m03-4-topbar-settings.yml`.

No declarar M03.4 COMPLETADA hasta obtener evidencia Actions GREEN.
