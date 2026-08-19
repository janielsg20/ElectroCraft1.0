# INFORMATION ARCHITECTURE — ElectroCraft

Visible UI language: Spanish.

## Sidebar

### CONSTRUIR
1. Editor — `PanelsTopLeft`
2. Pantallas — `PanelsTopLeft`/`Files`
3. Componentes — `Blocks`
4. Plantillas — `LayoutTemplate`
5. Generar con IA — `Sparkles`

### DATOS
1. Registros — `Database`
2. Modelos — `Boxes`
3. Fuentes de datos — `PlugZap`
4. Consultas — `ListFilter`

Taxonomías and Relaciones are NOT top-level. They live under `Datos > Modelos`.

### LÓGICA
1. Acciones y workflows — `Workflow`
2. Estado y variables — `Variable`
3. Formularios — `ClipboardList`

### APP
1. Navegación — `Route`
2. Usuarios y permisos — `ShieldCheck`
3. Administración — `Gauge`

### RECURSOS
1. Medios — `Images`
2. Extensiones — `Puzzle`

### APARIENCIA
1. Temas — `Palette`
2. Sistema de diseño — `SwatchBook`
3. Tokens — `Braces`

### PUBLICAR
1. Vista previa — `Eye`
2. Compatibilidad — `BadgeCheck`
3. Exportar — `PackageOpen`
4. Desplegar — `Rocket`

## Why this hierarchy

The hierarchy follows the mental sequence of building an app:

1. What does the user see?
2. Where does data come from?
3. What happens when the user interacts?
4. How does the app navigate/authenticate/manage data?
5. What reusable resources exist?
6. How does it look?
7. How is it published?

CMS terminology is not the primary navigation model.

## Topbar right

1. Vista previa
2. Exportar
3. Estado local
4. Ayuda
5. Configuración

Configuración is always last.

## Settings

Canonical future sections remain:
- General
- Espacio de trabajo
- Apariencia del Studio
- Editor
- Datos y almacenamiento
- IA
- Exportación
- Integraciones
- Avanzado

M03.7 does not invent unavailable settings. It applies Progressive Disclosure only to controls that already have a real owner.

# M03.7 — Progressive Disclosure contract

## Taxonomy
Every visible option/control belongs to exactly one level:

| Level | Visibility | Use |
|---|---|---|
| `primary` | always visible | modules, primary actions, frequent properties |
| `contextual` | shown when the task/context requires it | document, selection, responsive and secondary tools |
| `advanced` | inside Progressive Disclosure | infrequent configuration or technical detail not required for the common task |
| `diagnostic` | visible when it explains system state | saving, error, blocked, local/runtime and other state signals |

### Invariants
1. `primary` never hides behind Advanced.
2. `advanced` must use a Radix disclosure surface; a nested section does not become another page just to reduce visible density.
3. A `diagnostic` that is required to understand system state never hides inside Advanced.
4. Modules remain top-level canonical Sidebar destinations.
5. `contextual` may live in Topbar, Sheet, Inspector or Detail without changing ownership.
6. The taxonomy is breakpoint-independent; responsive reflow cannot remove primary capability.

## Owners
- Navigation/routes: `studioSidebarNavigation` + AppShell.
- Progressive Disclosure: Radix `Collapsible` exported by `packages/design-system`.
- Sheet/Drawer: the existing design-system `SheetContent left | right | bottom`.
- Visual composition: Puck behind `@electrocraft/editor-puck`.
- Visible copy: Spanish i18n.
- Critical/advanced explanations: `help.studio.shell`.

## Settings application
- `Espacio de trabajo` and the Sidebar preference are `primary` and stay visible.
- Preference persistence/session detail is `advanced` and lives in `Avanzado`.
- `error` / `blocked` status is `diagnostic`, uses a visible alert and remains outside Advanced.
- Settings stays a Radix Sheet and the gear remains the final Topbar action.

## Inspector application
- Primary properties and `Puck.Fields` are `primary`.
- If there is no real selection, Inspector shows an empty state; it does not create demo fields or selection state.
- Component-declared advanced details belong under `Avanzado` when they exist.
- Puck retains ownership of Fields; ElectroCraft only composes information architecture.

## List / Detail application
- `/content` remains one canonical route.
- List = `primary`.
- Detail = `contextual` in the same workspace; no redundant `/content/detail` route is introduced.
- No data and no selection are represented by explicit empty states.

## Empty-state inventory
| ID | Context | Pattern |
|---|---|---|
| `project-home` | project not open | single |
| `canvas` | document without components | single |
| `outline` | document without layers | single |
| `inspector` | no selection | single |
| `content` | no records | list |
| `content-detail` | no record selected | detail |
| `queries` | no queries | single |
| `forms` | no forms | single |
| `administration` | administration not configured | single |
| `media` | no media | single |
| `export` | export not prepared | single |

An empty state describes real absence. It never injects cards, records, widgets, metrics or generated results to simulate functionality.

## Canonical routes and no redundant pages
- `/content`: List/Detail.
- `/queries`, `/forms`, `/admin`, `/media`, `/export`: keep their canonical route and may show a specific empty state while the functional owner is not implemented.
- Unknown routes remain fail-closed through the existing unavailable-route surface.
- Project Home, Canvas, Outline and Inspector do not receive new routes just because they need empty states.

## Responsive behavior
- Desktop/laptop may expose more context simultaneously.
- Tablet continues to use rail + Sheets.
- Mobile continues to use the exact five-item dock and Sheets.
- The taxonomy and ownership do not change with breakpoint.

## Accessibility
- Disclosure uses a real Radix trigger and exposes open/closed state.
- Focus-visible and restore-focus are not replaced with manual focus hacks.
- Empty states use descriptive text and do not depend only on icons.
- Critical diagnostics use visible semantic state (`role=alert` where appropriate).

## Prohibitions
- No redundant routes for Advanced options.
- No hiding errors/blockers required to understand current system state.
- No direct `@puckeditor/core` import from Studio.
- No Studio UI preference persisted as a Project Object.
- No demo data to fill lists, Canvas or Inspector.
