# M03.3 — Implementación — 2026-08-19

## Estado
`ACTIVE` — implementación preparada; cierre condicionado al Gate GREEN real.

## Base
- `main@38b2f5aac504a406b42537b7aade8f3d26626e7d`.
- Predecesor M03.2: run `32272740576` success; artifact `9372820239`.

## Implementación
- `apps/studio/src/shell/sidebar-navigation.ts`: grupos y orden exactos de `APP_SHELL_SPEC`, destinos tipados y resolución de item activo.
- `apps/studio/src/shell/workspace-preferences.ts`: `WorkspacePreferencesPort` + adapter in-memory de F03.
- `apps/studio/src/shell/app-shell.tsx`: Lucide semántico, `aria-current`, Tooltip Radix, collapse 240→64 y consumo del port con `useSyncExternalStore`.
- `apps/studio/src/shell/sidebar.css`: High Density, activo/focus, rail laptop y touch target móvil.
- `apps/studio/src/i18n/studio-shell.es.ts`: grupos/items/copy nuevos en español antes del render.
- `apps/studio/src/help/help-registry.ts`: `help.studio.shell` actualizado con comportamiento y frontera de persistencia.
- `packages/design-system/src/icons/studio-icon-registry.ts`: IDs Lucide del Sidebar sin imports directos desde Studio.

## Invariantes
- Sin `Taxonomías` ni `Relaciones` como top-level.
- Sin `localStorage`, PGlite ni Project Objects para la preferencia de Sidebar.
- F04 sustituirá únicamente el adapter de `WorkspacePreferencesPort`.
- M03.4 Topbar/Settings permanece fuera de scope.
- Studio consume `@electrocraft/design-system` solo por root export.

## Pruebas preparadas
- Unit: grupos/orden, active resolver, negative path, round-trip del preferences port.
- Contract: boundaries, registry Lucide, `aria-current`, Tooltip, no persistencia prematura.
- Integration: SSR real del AppShell con estado expandido/colapsado.
- Playwright: grupos, active item, collapse 240→64, tooltip de teclado y Sheet móvil.
- Verifier: `tooling/scripts/verify-m03-3-sidebar.mjs`.
- Workflow: `.github/workflows/m03-3-sidebar.yml`.

No declarar M03.3 COMPLETADA hasta obtener evidencia Actions GREEN.
