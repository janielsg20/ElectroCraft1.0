# M03.7 — Implementation evidence — 2026-08-19

## Estado
`ACTIVE`. Implementación funcional escrita; pendiente gate propietario GREEN antes del cierre.

## Contrato implementado
- Taxonomía ejecutable `primary | contextual | advanced | diagnostic`.
- Navegación canónica permanece `primary`; no se crean rutas para detalles Advanced.
- Progressive Disclosure usa `Collapsible` Radix exportado por `packages/design-system`.
- `EmptyState` reusable usa design-system y copy español.
- Settings mantiene Espacio de trabajo/Sidebar como `primary`, persistencia de preferencias como `advanced` y error/bloqueo como `diagnostic` visible fuera de Advanced.
- Inspector mantiene `Puck.Fields` como contenido principal, muestra empty state sin selección y agrupa detalle secundario en Advanced.
- Canvas y Outline muestran empty states honestos sobre el documento estructural vacío sin retirar `Puck.Preview`/`Puck.Outline`.
- `/content` usa List/Detail en una sola ruta canónica con list `primary` y detail `contextual`.
- `/queries`, `/forms`, `/admin`, `/media`, `/export` usan empty states específicos mientras sus owners funcionales no existen.
- Rutas desconocidas siguen fail-closed.
- HelpRegistry documenta taxonomy, diagnostics visibles y prohibición de datos demo.
- `INFORMATION_ARCHITECTURE.md` es el owner documental canónico; `UX_INFORMATION_ARCHITECTURE.md` permanece alias de compatibilidad y no se bifurca.

## Owners preservados
- Puck detrás de `@electrocraft/editor-puck`.
- Sheet/Collapsible Radix desde design-system.
- Sidebar/routes desde `studioSidebarNavigation`.
- UI visible mediante i18n español.
- Preferences Studio no se convierten en Project Objects.

## Predecesor
M03.6 fue integrado y revalidado GREEN en `main` con run `32300959534`, job `96223126966`, artifact `9383033988` y digest `sha256:6aeb88b54a55b14943408c4acff321665eb7436289f826b3ef81e3e319c2bf73`.

## Pendiente para cierre
- Unit tests + negativos de taxonomy/registry.
- Contract/integration tests de owners/rutas/empty states.
- Browser audit Settings/Inspector/List-Detail/unknown route.
- Structural Node gate y workflow propietario M03.7.
- `npm run check` completo GREEN.
