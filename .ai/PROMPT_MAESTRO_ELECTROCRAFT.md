# PROMPT MAESTRO — ELECTROCRAFT
## Octava revisión final — Builder de Apps No-Code, español, multi-target y asistido por Gemini

# 0. Este documento manda

Este archivo es el contrato principal para construir ElectroCraft.

ElectroCraft debe desarrollarse como un **Builder de Apps No-Code** desde la primera línea de arquitectura.

No es:
- un gestor PDF;
- un CMS con un editor visual añadido;
- un clon de WordPress;
- un Website Builder solamente;
- una colección de demos;
- un wrapper alrededor de otra plataforma low-code.

Las capacidades CMS, WordPress, LAMP, Web, Native, Administration, AI y connectors son partes del producto, pero ninguna sustituye el modelo canónico de App.

La IA implementadora NO debe resumir una microfase en frases vagas.

Si la microfase dice:
`construir Exportador WordPress`,
la IA debe ejecutar sus pasos, generar archivos reales, instalar/activar en fixture, ejecutar pruebas y registrar evidencia.

No se acepta:
- placeholder;
- botón sin backend;
- opción sin efecto;
- artifact inventado;
- "funciona" sin test;
- feature que solo existe en mock data permanente;
- target export omitido silenciosamente.

---

# 1. Identidad

Nombre:
**ElectroCraft**.

Categoría:
**No-Code App Builder**.

Idioma visible predeterminado:
**Español**.

Promesa:

> Construir una aplicación completa visualmente a partir de Pantallas, Componentes, Navegación, Datos, Estado, Acciones, Formularios, Usuarios y Recursos, probarla y exportarla a distintos runtimes sin que el usuario necesite programar.

ElectroCraft puede crear:
- Web Apps;
- sitios;
- PWA;
- apps Android/iOS;
- híbridas Capacitor;
- aplicaciones LAMP;
- proyectos WordPress;
- dashboards;
- CRM;
- reservas;
- comercio;
- directorios;
- LMS;
- inventario;
- portales;
- apps administrativas;
- apps de contenido.

---

# 2. Modelo mental canónico

```text
App
├── Pantallas
├── Navegación
├── Componentes
├── Fuentes de datos
├── Modelos y Registros
├── Consultas
├── Estado y variables
├── Acciones y workflows
├── Formularios
├── Usuarios y permisos
├── Administración
├── Medios
├── Temas y tokens
├── Reutilizables
├── Extensiones
└── Borradores de IA
```

Todo feature nuevo debe encajar primero en este modelo.

Si no encaja:
1. revisar Core/Preset/Block/Binding/Action/Provider;
2. revisar target adapter;
3. revisar OSS engine;
4. solo después escribir ADR para un subsistema nuevo.

---

# 3. Targets de exportación — todos Core

ElectroCraft tiene nueve destinos Core.

IDs:

1. `local-project`
2. `react-web`
3. `static-web`
4. `pwa`
5. `android-expo`
6. `ios-expo`
7. `capacitor`
8. `lamp`
9. `wordpress`

Visible:

- Proyecto local
- React Web
- Sitio estático
- PWA
- Android
- iOS
- Capacitor
- LAMP
- WordPress

No existe:
`Optional Target`.

No existe:
`Secondary Export`.

No esconder WordPress/LAMP/Capacitor en `Más`.

La UI puede agrupar por familia para orden:

Paquete:
Proyecto local.

Web:
React Web, Sitio estático, PWA.

Móvil:
Android, iOS, Capacitor.

Servidor/CMS:
LAMP, WordPress.

La agrupación NO significa prioridad.

---

# 4. Qué significa paridad de targets

No significa usar la misma tecnología en todos.

Significa:
- todos aparecen en Compatibilidad;
- todos aparecen en Exportar;
- todos tienen TargetDescriptor;
- todos tienen config schema;
- todos tienen capability profile;
- todos tienen compiler;
- todos tienen verifier;
- todos tienen artifact contract;
- todos tienen security gate;
- todos tienen tests;
- todos participan en la fixture final;
- ningún target pierde funciones silenciosamente.

Estados:

`Exact`
`Adapted`
`Warning`
`Blocked`

Ejemplo:
una tabla puede ser HTML table en React/LAMP/WordPress,
cards en Native,
y seguir representando la misma semántica.

---

# 5. Export Target Contract

Todos los exporters ejecutan:

1. congelar revision;
2. construir ElectroCraftExportIR;
3. validar IR;
4. resolver TargetDescriptor;
5. analizar capabilities;
6. detener si hay blockers;
7. resolver target config;
8. construir RuntimeDependencyManifest;
9. compilar navegación;
10. compilar componentes/layout/style;
11. compilar datos/queries;
12. compilar state;
13. compilar actions;
14. compilar forms;
15. compilar auth/permissions;
16. compilar Administration;
17. localizar assets;
18. generar source/package;
19. ejecutar toolchain/installer validation;
20. verificar artifacts reales;
21. producir ExportReport;
22. registrar evidence.

No exporter salta Capability Analyzer.

---

# 6. Idioma

Engine:
i18next + react-i18next.

Español:
default y fallback.

IDs técnicos:
pueden permanecer ingleses.

Visible:
Pantalla, Fuente de datos, Consulta, Acción, Estado, Administración, Configuración, etc.

Todo string visible:
translation key.

Puck/Refine/Rete/AI Elements:
no pueden filtrar defaults ingleses.

Tests:
scan de strings ingleses conocidos.

---

# 7. Ayuda

Toda sección principal:
Lucide icon + H1 + CircleHelp.

CircleHelp:
Tooltip corto.
Popover desktop.
Sheet mobile.

Topbar:
Ayuda inmediatamente antes de Configuración.

Configuración:
siempre último control derecho.

Info icon:
solo en conceptos no triviales.

Ayuda debe explicar:
qué hace la sección;
cuándo usarla;
ejemplo;
relación con otras secciones;
efecto de la configuración.

---

# 8. Studio Design System

Stack:

- React;
- TypeScript strict;
- Vite;
- Tailwind;
- shadcn/ui;
- **Radix base fijada explícitamente**;
- Lucide;
- i18next;
- selected AI Elements.

La base no depende del default actual del CLI.

Inicialización usa el equivalente oficial actual:
`shadcn init --base radix`.

No mezclar Radix / Base UI / React Aria dentro del Design System sin ADR.

Razón del Radix pin:
Generar con IA es Core y utiliza AI Elements seleccionados.
Una foundation coherente evita mezclar primitive contracts.

---

# 9. Skills obligatorias para UI

Antes de implementar UI:
1. cargar skill shadcn;
2. cargar skill UI/UX/Layout/Accessibility disponible;
3. consultar docs oficiales actuales;
4. leer Design System;
5. leer AppShell;
6. leer Screen spec;
7. leer i18n/help.

Después de editar múltiples TSX:
cargar React best-practices skill.

No copiar una tendencia visual sin verificar usabilidad/densidad/accesibilidad.

---

# 10. Dirección visual

Minimal.
Clean.
Profesional.
High Density.
Canvas dominante.

High Density no significa:
- 22px buttons;
- texto ilegible;
- acciones siempre visibles;
- bordes alrededor de todo.

Usar Progressive Disclosure.

Jerarquía:
Workspace -> Section -> Group -> Control.

Desktop:
compacto.

Mobile:
reorganizar flujo, no escalar desktop.

---

# 11. AppShell

Desktop:

Sidebar:
240 expanded / 64 collapsed.

Topbar:
52.

Context:
288 default / 240 min / 380 max.

Main:
flex:1.

Inspector:
320 default / 280 min / 440 max.

Status:
26.

---

# 12. Sidebar exacto

## CONSTRUIR
Editor
Pantallas
Componentes
Plantillas
Generar con IA

## DATOS
Registros
Modelos
Fuentes de datos
Consultas

## LÓGICA
Acciones y workflows
Estado y variables
Formularios

## APP
Navegación
Usuarios y permisos
Administración

## RECURSOS
Medios
Extensiones

## APARIENCIA
Temas
Sistema de diseño
Tokens

## PUBLICAR
Vista previa
Compatibilidad
Exportar
Desplegar

Taxonomías y Relaciones:
dentro de Modelos.

---

# 13. Topbar

Left:
breadcrumb/app/save.

Center contextual:
document/screen/platform/breakpoint/undo/redo/zoom.

Right:
1. Vista previa
2. Exportar
3. Estado local
4. Ayuda
5. Configuración

Settings always final.

---

# 14. Modelo canónico

## ElectroCraftProjectDefinition

References:
documents, navigation, routes, data sources, schema, queries, state, actions, roles, theme, extensions.

No mega JSON.

## ElectroCraftDocument

Kinds:
screen
template
form
admin-screen
reusable-component.

Node:
id
componentRef
props
slots
layout
style
responsive
platform
bindings
actionRefs
conditions
accessibility.

No WebScreen tree.
No NativeScreen tree.
No WordPressScreen tree.
No PHP Screen tree.

---

# 15. Puck — Screen Composer

Puck owns:
Components
Fields
Outline
Preview
Slots
DnD
editor history.

New nesting:
Slots.

DropZone:
legacy migration only.

ElectroCraft adds:
Screen context,
Layout/Style,
responsive,
platform overrides,
bindings,
actions,
a11y,
guides/rulers,
target compatibility.

No second visual editor.

---

# 16. Component rationalization

Decision ladder:

1. existing Core;
2. prop/config;
3. Preset;
4. Block;
5. Binding;
6. Alias;
7. Action;
8. Provider;
9. new Core with proof.

Row:
Container preset.

Heading:
Text preset.

Dynamic Image:
Image + Binding.

Email:
FormField alias.

Product Card:
Block.

No component explosion.

WordPress exporter also follows a second target ladder:
core WP block -> attributes/styles -> pattern -> template/part -> dynamic block -> custom block.

---

# 17. Layout/Style

Canonical:
ElectroCraftLayout / ElectroCraftStyle.

Not raw Tailwind.

Concepts:
Container/Flex/Row/Column/Stack/Grid/Wrap/Overlay/Absolute/Scroll/SafeArea.

Properties:
spacing, size, min/max, align, order, gap, position, overflow, z-index.

Target:
Web -> CSS.
Native -> RN styles.
LAMP -> CSS/HTML.
WordPress -> theme.json/block styles/CSS.
Capacitor -> Web CSS.

---

# 18. Persistencia Studio

PGlite + Drizzle.

Worker multi-tab.

UI nunca raw DB.

project_objects:
incremental.

project_revisions:
cross-session.

Puck/Rete history:
session.

Media:
MediaBlobStore.

---

# 19. Data Sources

First-class.

ElectroCraftDataSourceDefinition:
id/name/kind/adapterId/config/authRef/environment/capabilities.

Core sources:
Internal ElectroCraft Data.
REST/OpenAPI.
GraphQL.

Connector extensions:
allowed.

SecretRef:
never raw secret.

ConnectorGateway:
server-side/safe boundary when needed.

---

# 20. Internal Data

Visible:
Datos > Modelos / Registros.

Modelo:
fields, relations, taxonomies, states, validation, indexes.

No dynamic DDL per user field in Studio.

Generic records + typed selective index.

Target compilers:
React may keep local/gateway profile.
Expo may use SQLite.
LAMP compiles to MySQL/MariaDB.
WordPress compiles through WP entity decision ladder.

---

# 21. REST/OpenAPI

Core connector.

Source config:
base URL;
authRef;
headers safe;
operations;
timeout.

OpenAPI:
parser OSS chosen in F00.

Operation:
method/path/input/output/pagination.

Direct browser:
only safe/CORS/no secret.

Otherwise:
Gateway.

---

# 22. GraphQL

Core connector.

Schema/introspection when allowed.

Operations:
query/mutation.

Variables:
typed mapping.

TanStack Query:
cache lifecycle on JS runtimes.

No second GraphQL cache.

---

# 23. Queries

QueryDefinition:
sourceRef
operation/resource
params
condition payload
sort
pagination
combine
cache policy.

RQB:
condition authoring only.

Fail closed.

Target compilers:
React/Expo/Capacitor JS adapters.
LAMP server adapters/PDO.
WordPress WP_Query/REST/custom repository when required.

---

# 24. Bindings

Sources:
literal
query
record
relation
state
route
current user
form
action output
media
safe environment.

Store refs.
Type validate.

No arbitrary JS in Core.

---

# 25. State

Visible:
Lógica > Estado y variables.

Canonical:
StateDefinition.

JS runtime:
Zustand.

Scopes:
component
screen
app
session
persistent
derived.

LAMP:
explicit request/session/DB/client JS mapping.

WordPress:
explicit PHP/JS/session/storage mapping.

If a scope cannot map safely:
Compatibility diagnostic.

---

# 26. Rete — Actions/workflows

Visible:
Lógica > Acciones y workflows.

Rete owns:
graph
connections
history
ControlFlow/Dataflow JS.

Canonical:
ElectroCraftActionGraph.

Node families:
Trigger
Condition
Logic
Data
State
Navigation
UI
Auth
HTTP
Provider
Native.

LAMP compiler:
PHP services/handlers + browser JS when needed.

WordPress:
hooks/services/REST/client JS.

No React Flow parallel.

---

# 27. Forms

Form:
ElectroCraftDocument kind=form.

JS:
RHF + Zod.

Capabilities:
conditions
multi-step
repeater
calculated
draft
uploads
create/update
auth
ActionGraph submit.

LAMP/WordPress:
compile portable validation rules to server validators.
Do not run Zod in PHP.

CSRF/nonces:
target-native.

---

# 28. Auth/Permissions

Visible:
App > Usuarios y permisos.

Tabs:
Usuarios
Roles
Simulador.

Permissions:
route
resource
record
field
action
admin
design/settings
export.

UI hiding != enforcement.

Target enforcement:
React/Expo adapters.
Capacitor Web/native session adapter.
LAMP middleware/services.
WordPress capabilities/nonces/REST permission_callback.

---

# 29. Administración

Visible:
App > Administración.

Studio/React Admin:
Refine + TanStack Table.

Refine not global runtime.

Views:
Dashboard
List
Create
Edit
Detail
Kanban
Calendar
Custom.

LAMP:
generated PHP/HTML admin runtime; do not ship Refine by default.

WordPress:
native WP Admin/REST/@wordpress packages; do not ship Refine runtime.

---

# 30. Media

Metadata:
PGlite.

Bytes:
MediaBlobStore.

Tiptap:
single RichText engine.

Export:
Web assets.
Expo assets/remote.
Capacitor Web assets.
LAMP public/storage.
WordPress Media Library/import mapping.

---

# 31. Reusables

Theme:
app visual tokens.

Studio Appearance:
workspace-only.

Template:
Document template.

Saved Block:
subtree.

Global Component:
versioned reusable.

App Template:
full app/domain structure.

App Kit:
theme + templates + structure/data/logic.

---

# 32. Extensions

Declarative-first.

Can contain:
Components/Blocks
Templates
Theme
Data Model patches
Connectors
Queries
Forms
ActionGraphs
Admin Screens
Help/i18n
App Template fragments
Media.

Install delegates to owners.

Code:
quarantine.

No auto execution.

---

# 33. AI — provider/runtime

Visible:
Construir > Generar con IA.

Core:
Vercel AI SDK.

Provider:
@ai-sdk/google / Gemini.

Direct @google/genai:
only if F00 proves missing necessary Gemini capability.

No custom generic provider engine.

---

# 34. AI UI — AI Elements

Install only required selected components:
Conversation
Message/MessageResponse
PromptInput
Tool
Plan
CodeBlock only if needed.

Do not install entire registry.

Do not use AI Elements graph/React Flow UI to replace Rete.

AI Elements owns generic AI presentation.
ElectroCraft owns project-specific context/draft/diff/apply.

---

# 35. AI artifact generation

May generate:
Screen
Section/Block
Reusable Component
Template
Theme
Navigation
Data Model
Query
Form
ActionGraph
Admin Screen
Dashboard
App/Kit
Extension
Text
Demo Data
Image.

Uses existing canonical types.

No AI-specific parallel Screen/Form/Query architecture.

---

# 36. AI context/privacy

Default:
minimal selected context.

User control:
Ver lo que se enviará.

May include selected:
screen/nodes/theme/navigation/models/data source schema/queries/state/actions/admin/media/files.

Never:
secret values.
full project without explicit reason.
unrelated private records.

---

# 37. AI tools

AI SDK tools.

Allowed:
read sanitized data.
draft operations.
validation.
compatibility.
preview.
diff.

Forbidden:
Apply.
raw DB.
SQL.
filesystem arbitrary write.
install.
deploy.
secret access.
code execution.

---

# 38. AI Apply

Model cannot Apply.

Only user:
Aplicar cambios.

Then:
base revision check
stale conflict
final validation
transaction
canonical services
Project Revision
cache invalidation
open artifact.

---

# 39. ExportIR

Immutable snapshot.

Includes:
Documents
Navigation
DataSource sanitized definitions
DataSchema
Queries
State
Actions
Forms
Roles
Theme
Media manifest
capability requirements.

Excludes:
Studio workspace.
Puck/Rete histories.
AI history/prompts.
cache.
secret values.

All nine targets receive same IR revision/checksum.

---

# 40. Compatibility

Visible:
Publicar > Compatibilidad.

Targets:
all nine.

No optional section.

For every feature:
source
target
status
reason
adaptation
fix
go-to-origin.

Never silent.

---

# 41. Export Center

Visible:
Publicar > Exportar.

Desktop:
Target list 240–260.
Config center.
Compatibility/Result 320.

Same workflow:
Analizar
Configurar
Generar
Verificar
Informe.

Generate disabled with blockers.

Toolchain missing is not the same as project incompatibility.

---

# 42. Proyecto local

ZIP portable.

Includes:
manifest/project objects/selected content/media/migrations/metadata.

Excludes:
secrets
Studio preferences by default
histories/cache/AI prompts by default.

Verify:
checksum + reimport.

---

# 43. React Web

Runtime independent from Puck.

React DOM.
React Router.
TanStack Query.
Zustand.
RHF/Zod.
Action runtime.
Auth adapters.

Refine only if Administration included.

Verify:
install/typecheck/build/E2E.

---

# 44. Static

First-class target.

Can block features requiring mutable server/runtime semantics.

That is valid if Compatibility shows blocker before generation.

Generate:
HTML/CSS/assets/minimal allowed JS.

Verify local serve/smoke.

---

# 45. PWA

React/Web profile with:
manifest
service worker
offline strategy
installability.

Verify:
build/offline/manifest.

---

# 46. Android/iOS

React Native + Expo + Expo Router.

Expo SQLite where required.

Device APIs only when used.

Source always generated when compatible.

Build artifacts:
only claimed if real.

Signing:
external/toolchain reality.

---

# 47. Capacitor

First-class.

Not fallback.

Uses:
Web Runtime -> Capacitor -> platform projects/plugins.

Flow:
Web build
capacitor config
add platform
sync
plugins/permissions
deep links/auth/storage
build verify.

No Expo dependency.

---

# 48. LAMP architecture

First-class.

Generated stack:
PHP
Slim 4
PSR-7 implementation
Slim-CSRF
PDO
MySQL/MariaDB
Composer.

Do not build proprietary PHP router/middleware.

Generated folders:
app/Controllers
Middleware
Services
Repositories
Policies
Actions
Queries
Views
Support
config
database/migrations
public
routes
storage.

---

# 49. LAMP navigation/render

Routes -> Slim.

Guards -> middleware.

Screen -> semantic HTML/PHP views.

Theme/Layout/Style -> CSS.

React not default.

Client interactive behavior:
minimal generated JS when needed.

Escape dynamic output.

---

# 50. LAMP data/query

Internal Data -> MySQL/MariaDB.

Default:
generic portable records + relations/taxonomies/index.

PDO prepared statements.

Identifiers/operators:
compiler allowlist.

External REST/GraphQL:
server adapter when secrets/server required.

---

# 51. LAMP forms/auth/actions

Forms:
server validation.
Slim-CSRF.
uploads safe.
ActionGraph submit.

Auth:
password hashing.
PHP session.
secure cookies.
permissions middleware/services.

State:
explicit server/client mapping.

Actions:
PHP handler vs client JS according to semantics.

Administration:
generated target-specific admin.
No Refine runtime default.

---

# 52. LAMP artifact

Composer.
.env.example.
migration runner.
README.

Option:
include vendor.

Verify:
composer install
PHP checks
clean DB migration
HTTP E2E
forms
auth
permissions
injection
CSRF
XSS
artifact checksum.

---

# 53. WordPress architecture

First-class.

Output:
1. Block Theme ZIP.
2. Companion Plugin ZIP.

Theme:
visual/layout.

Plugin:
dynamic/persistent functionality.

No required Elementor/ACF/JetEngine dependency.

---

# 54. WordPress Block Theme

Generate:
style.css metadata
theme.json current supported version
templates
parts
patterns
styles/style variations where used.

Map Theme tokens to theme.json first.

Generate CSS only where theme.json/blocks cannot express safely.

Dynamic content registration:
not Theme.

---

# 55. WordPress components

Mapping ladder:

1. native core block;
2. block attrs/styles;
3. pattern;
4. template/part;
5. dynamic block;
6. custom block.

Do not create custom block for every ElectroCraft component.

Saved Blocks:
patterns where semantic.

Header/Footer:
template parts.

---

# 56. WordPress data

Decision ladder:

1. existing WP entity;
2. CPT;
3. taxonomy;
4. meta;
5. Options API;
6. custom table if justified.

CPT/tax/register:
Companion Plugin.

Relations/high-volume:
custom table when postmeta is poor fit.

Users:
WP users/roles/caps where semantically suitable.

Media:
WP Media Library.

---

# 57. WordPress queries/forms/actions

Queries:
WP_Query/term/user APIs first.
Custom repository only when custom tables.

External sources:
WordPress HTTP API server-side if required.

Forms:
validation
sanitize
nonce
capability
REST/admin-post strategy
ActionGraph compiler.

Actions:
hooks/services/REST/client JS.

WP Cron:
only where scheduling semantics fit.

---

# 58. WordPress Administration/security

Administration:
native WP Admin patterns and @wordpress packages where appropriate.

Do not bundle duplicate React when WP provides it.

Security:
nonce
capability
sanitize
validate
escape
permission_callback
prepared custom SQL.

Lifecycle:
activation
migrations
deactivation
uninstall.

Uninstall:
non-destructive default.

---

# 59. WordPress verification

Clean wp-env/current approved environment.

Install Theme ZIP.
Install/activate Plugin ZIP.
Migrate.
Import fixture.
Verify front.
Verify REST/forms.
Verify RBAC.
Verify Admin/Media.
Upgrade/deactivate/reactivate.
Uninstall policy.
Checksums.

No Ready without clean fixture.

---

# 60. Runtime Dependency Manifest

Per target.

Studio-only:
Puck
Rete editor
AI SDK
AI Elements
Studio chrome
project DB tooling.

Never copy package.json.

React:
conditional JS packages.

Expo:
used native packages.

Capacitor:
Web deps + used Capacitor plugins.

LAMP:
Composer target deps only.

WordPress:
native/externalized WP packages where possible.

---

# 61. Security

Imports:
versions/checksum/path safety.

Data:
validation/parameterization.

Secrets:
outside project/bundle.

Media:
MIME/SVG/upload.

Auth:
real enforcement.

AI:
untrusted.

Capacitor:
no secret Web assets.

LAMP:
CSRF/PDO/session/escape.

WordPress:
nonce/caps/sanitize/escape.

---

# 62. Accessibility

WCAG 2.2 AA target.

Studio:
keyboard/focus/labels/contrast/touch/reduced motion.

DnD:
alternatives.

AI:
status announcements.

Export Center:
all targets keyboard reachable.

Generated outputs:
target-native semantic/accessibility practices.

---

# 63. Performance

Lazy-load heavy Studio engines.

Avoid:
Puck loaded on Project Home.
Rete loaded outside Workflows.
AI Elements/AI SDK client outside AI workspace.
ECharts/Calendar when not used.

Generated targets:
dependency pruning.
large lists virtualization/pagination as appropriate.
media optimization.

---

# 64. Testing

Every microphase:
lint
typecheck
unit/contract
integration
build
E2E/fixture where relevant.

Target claims:
artifact evidence.

AI CI:
deterministic mock.

Real external/toolchain:
actual or explicit SKIPPED evidence with reason.
Never fake pass.

---

# 65. F00 POCs

Before architecture lock prove:

- Puck composition/Slots;
- PGlite Worker/persistence;
- Query model;
- Rete Action Flow;
- Expo runtime;
- AI SDK/Gemini/AI Elements;
- Data Sources REST/GraphQL/Gateway;
- export parity POC Capacitor/LAMP/WordPress.

Architecture ADR closes only after these.

---

# 66. Phase order

F00 — Auditoría de producto, OSS y POCs.
F01 — Monorepo, límites, documentación y CI.
F02 — Modelo canónico de App y ownership.
F03 — Design System, AppShell, español y ayuda.
F04 — Persistencia local, proyectos y revisiones.
F05 — Screen Composer con Puck.
F06 — Layout, responsive y edición avanzada.
F07 — Pantallas, navegación y rutas.
F08 — Fuentes de datos, modelos, registros y conectores.
F09 — Consultas, bindings, listings y filtros.
F10 — Medios y Rich Text.
F11 — Estado, variables y entorno.
F12 — Usuarios, autenticación y permisos.
F13 — Acciones, workflows y automatizaciones.
F14 — Formularios.
F15 — Administración visual y DataViews.
F16 — Temas, plantillas y componentes reutilizables.
F17 — Extensiones, Kits de App y plantillas de proyecto.
F18 — Generar con IA — Gemini.
F19 — Vista previa, Debug y runtime diagnostics.
F20 — Compatibilidad, TargetRegistry y Export Center.
F21 — Runtime Web + Local/React/Static/PWA.
F22 — Runtime Native con Expo.
F23 — Capacidades Native + Android/iOS.
F24 — Exportación Capacitor.
F25 — Exportación LAMP con Slim/PDO.
F26 — Exportación WordPress Block Theme + Plugin.
F27 — Hardening, paridad de exportación y release.

---

# 67. Contrato de microfase

Cada microfase debe contener:

Por qué existe.
Resultado exacto.
Engine owner.
Responsabilidad ElectroCraft.
Ubicación exacta.
Diseño visual exacto.
Texto visible en español.
Ayuda contextual.
Precondiciones.
Implementación paso por paso.
Artefactos.
Estados.
Responsive.
Accesibilidad.
Pruebas.
Prohibiciones.
Evidencia.

Si no hay UI:
decirlo.

---

# 68. Ejecución paso a paso de una microfase

1. leer Rules/Memory/State/Tracking;
2. leer active microphase;
3. leer specs enlazadas;
4. inspeccionar código;
5. inspeccionar tests;
6. confirmar engine owner;
7. verificar docs oficiales actuales;
8. detectar duplicación;
9. escribir/actualizar tests de contrato;
10. implementar domain semantics si aplica;
11. implementar application use case;
12. implementar adapter/compiler;
13. implementar UI/runtime;
14. añadir i18n;
15. añadir HelpDescriptor;
16. conectar persistence;
17. conectar permissions/security;
18. implementar loading/empty/error/disabled;
19. desktop;
20. tablet;
21. mobile;
22. keyboard/a11y;
23. security;
24. performance;
25. lint;
26. typecheck;
27. tests;
28. build;
29. E2E/fixture;
30. artifact verification si target;
31. corregir errores;
32. guardar evidence;
33. actualizar Tracking/Memory/State/Changelog/Handoff;
34. avanzar solo con gate verde.

---

# 69. Definition of Done ElectroCraft

No está terminado hasta que:

Studio:
- español;
- Help;
- responsive;
- accessible;
- no fake UI.

Builder:
- projects/persistence;
- Screen Composer;
- Navigation;
- Data Sources;
- Models/Records;
- Queries/Bindings;
- State;
- Workflows;
- Forms;
- Auth/RBAC;
- Administration;
- Media/RichText;
- Themes/Templates/Reusables;
- Extensions/App Templates.

AI:
- Gemini;
- AI SDK;
- AI Elements UI;
- structured Drafts;
- tool safety;
- Preview/Diff;
- Apply/revision.

Export:
- TargetRegistry nine targets;
- Compatibility all nine;
- Export Center all nine;
- Local verified;
- React verified;
- Static verified;
- PWA verified;
- Android verified;
- iOS verified;
- Capacitor verified;
- LAMP verified;
- WordPress verified.

Quality:
- security;
- a11y;
- performance;
- dependency pruning;
- migrations;
- final parity fixture;
- no unexplained divergence;
- no P0/P1 gap;
- all evidence stored.

Only then:
`RELEASE_READY`.
