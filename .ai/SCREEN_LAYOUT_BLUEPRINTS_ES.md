# SCREEN LAYOUT BLUEPRINTS — ElectroCraft

# A — Screen Composer
Sidebar global 240/64.
Context 288.
Canvas flex.
Inspector 320.
Status 26.
Topbar 52.

# B — List + Detail
Used:
Pantallas, Modelos, Consultas, Estado, Usuarios, Extensiones.
Desktop:
left 280–320, detail flex, optional right 300–340.
Mobile:
list route -> detail route.

# C — Data Sources
left source list 300.
center config/explorer flex.
right capability/security summary 300 optional.
Tabs:
Resumen / Configuración / Autenticación / Esquema / Explorar / Compatibilidad.

# D — Data Management
Registros/Admin list.
Toolbar 40–44.
table/list flex.
Mobile cards.
filters as popover/sheet.

# E — Navigation Builder
left tree 300.
center structure preview flex.
right inspector 320.
Use tree before graph.

# F — Workflow
left flow/node palette 280.
Rete canvas flex.
right inspector 320.
toolbar 44.

# G — AI
left 288 Crear/Historial.
center conversation/preview/diff + composer.
right 320 Contexto/Opciones/Validación.

# H — Media
folders/tags 220–240.
grid/list flex.
asset inspector 300.

# I — Compatibility/Export
target list 220–260.
main report/config flex.
summary 300–340.

# J — Settings
Sheet right 380–420 desktop.
Full route mobile.

# Shared header
icon + H1 + CircleHelp.
Primary action at far right.
One-line description only if useful.

# Spacing
outer 12–16 desktop high-density.
section 12–16.
field 8–12.
toolbar 4–8.
icon-label 6–8.
