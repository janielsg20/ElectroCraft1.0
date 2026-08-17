# ELECTROCRAFT — EIGHTH FINAL DETAIL PREVIEW

Esta muestra reúne el Prompt Maestro, auditoría, decisiones OSS/export y microfases representativas para revisar el nivel de detalle sin abrir los 270 archivos.

---

## .ai/PROMPT_MAESTRO_ELECTROCRAFT.md

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


---

## .ai/FINAL_EIGHTH_REVIEW_AUDIT.md

# FINAL EIGHTH REVIEW AUDIT — ELECTROCRAFT

Date:
2026-08-16.

Status:
**APROBADA — EIGHTH FINAL MASTER SPEC**

# 1. Resultado estructural

- Fases Core: **28** (`F00`–`F27`).
- Microfases prescriptivas: **270**.
- Huecos de numeración: **0**.
- IDs inválidos: **0**.
- Referencias a microfases inexistentes: **0**.
- Owners de fase incorrectos: **0**.
- Títulos duplicados exactos: **0**.

# 2. Nivel obligatorio de cada microfase

270/270 contienen:

- Por qué existe.
- Resultado exacto.
- Engine owner.
- Ubicación de código obligatoria.
- Ubicación exacta en la app.
- Diseño visual exacto.
- Texto visible en español.
- Ayuda contextual.
- Precondiciones.
- Implementación línea por línea / paso por paso.
- Artefactos obligatorios.
- Estados.
- Responsive.
- Accesibilidad.
- Pruebas.
- Prohibiciones.
- Evidencia.

La microfase más corta supera aproximadamente 400 palabras y la mediana supera 550 palabras.

# 3. Corrección del boilerplate

La auditoría cualitativa detectó 116 microfases heredadas que repetían varios pasos genéricos.

Se corrigió:

- los requisitos universales permanecen en MICROPHASE_EXECUTION_CONTRACT;
- cada microfase recibió `Ubicación de código obligatoria`;
- cada fase recibió una secuencia concreta por package/adapter/UI/runtime/test;
- se eliminaron del bloque de implementación los siete pasos genéricos repetidos;
- CODEBASE_LOCATION_MAP.md fija ownership físico del monorepo.

Por tanto, el detalle no depende solo del número de palabras.

# 4. Paridad de exportación corregida

La séptima arquitectura degradaba Capacitor/LAMP/WordPress fuera de la ruta Core.

La octava revisión elimina esa clasificación.

Targets Core:

1. Proyecto local.
2. React Web.
3. Sitio estático.
4. PWA.
5. Android.
6. iOS.
7. Capacitor.
8. LAMP.
9. WordPress.

Todos deben registrar:

TargetDescriptor
ConfigSchema
CapabilityProfile
Compiler
VerificationProfile
ArtifactKinds
SecurityProfile
HelpDescriptor.

# 5. Export Target Contract

Se añadió un pipeline único:

ExportIR
-> TargetRegistry
-> Capability Analyzer
-> Config
-> RuntimeDependencyManifest
-> Compilers
-> Artifact
-> Verifier
-> ExportReport
-> Evidence.

Los targets comparten contrato, no tecnología.

# 6. Fases nuevas de exportación

F20:
Capability Analyzer + TargetRegistry + Export Center.

F21:
Local / React / Static / PWA.

F22–F23:
Expo Native / Android / iOS.

F24:
Capacitor.

F25:
LAMP.

F26:
WordPress.

F27:
hardening/paridad/release.

# 7. Capacitor

Ya no se describe como fallback.

Tiene:
descriptor,
Web runtime profile,
project/platform generation,
plugins/permissions,
deep links/auth/storage,
build/signing,
E2E/parity.

# 8. LAMP

Se evitó código propio innecesario.

Seleccionado:
Slim 4 + PSR-7 + Slim-CSRF + PDO + MySQL/MariaDB + Composer.

Slim posee:
routing/middleware/request-response.

PDO posee:
DB access/prepared statements.

ElectroCraft compila:
Routes, Data, Queries, State, Actions, Forms, Auth, Permissions, Administration y Rendering.

No se envía Refine/React por defecto.

# 9. WordPress

Se modernizó el target.

Salida:
Block Theme ZIP + Companion Plugin ZIP.

Decision ladder visual:
core block -> attrs/styles -> pattern -> template/part -> dynamic block -> custom block.

Decision ladder de datos:
WP entity -> CPT -> taxonomy/meta/options -> custom table cuando está justificado.

CPTs/roles/REST/data behavior:
Companion Plugin.

Theme:
diseño/templates/theme.json.

No se exige Elementor/ACF/JetEngine.

# 10. Studio OSS

Puck:
se mantiene.

Rete:
se mantiene.

PGlite/Drizzle:
se mantiene.

Refine:
se mantiene limitado a Administración.

RHF/Zod:
se mantiene.

RQB:
se mantiene limitado a condition authoring.

Tiptap:
se mantiene.

Zustand:
se mantiene.

Expo:
se mantiene.

AI SDK/Gemini:
se mantiene.

# 11. UI OSS corregida

Studio shadcn base:
Radix fijado explícitamente.

Se añaden selected AI Elements para no reconstruir:
Conversation, Message/Markdown, Prompt Input, Tool states y Plan UI.

No se instala el registry completo.
No se instala un graph/canvas AI que duplique Rete.

# 12. Pares de microfases similares revisados

- F00 export POC vs F27 final parity:
  POC valida arquitectura antes de construir; F27 valida producto completo.
- LAMP descriptor vs WordPress descriptor:
  ambos cumplen Target Contract pero generan runtimes/toolchains diferentes.
- Android vs iOS build:
  comparten ExportIR/Expo, pero toolchain/signing/artifact verification es diferente.
- Administration E2E vs runtime Preview:
  implementación del subsystem vs ejecución/observabilidad.

No son fases repetidas.

# 13. Español y ayuda

Las secciones principales están cubiertas por:
APP_SHELL_SPEC,
SCREEN_BY_SCREEN_SPEC,
SECTION_HELP_CATALOG_ES.

Exportar explica los nueve destinos.

Configuración permanece último control derecho.
Ayuda permanece inmediatamente antes.

# 14. Release gate

La release falla si:

- un target no tiene descriptor/compiler/verifier;
- un target no tiene fixture/evidence;
- WordPress no pasa clean install;
- LAMP no pasa install/migration/HTTP/security fixture;
- Capacitor no pasa source/sync verification;
- un artifact se declara sin existencia real;
- una diferencia cross-target no aparece en Compatibility;
- hay P0/P1 gaps;
- secrets/Studio histories se filtran al export.

# Conclusión

La arquitectura final conserva un único Builder y un único modelo canónico.

Se evita duplicar motores OSS y al mismo tiempo se da estatus real de primera clase a los nueve destinos de exportación.

La diferencia entre targets vive en compiler/runtime adapters, no en nueve versiones del proyecto.


---

## .ai/OSS_RECOMMENDATION_SUMMARY.md

# OSS RECOMMENDATION SUMMARY — ElectroCraft Eighth Final

Review date:
2026-08-16.

# Mantener

## Puck — Screen Composer
**Mantener.**
Aporta Composition/Components/Fields/Outline/Preview/Slots e historial de edición.
ElectroCraft debe extenderlo, no reconstruirlo.

Alternativas:
- Craft.js: más bajo nivel; obligaría a construir más chrome/editor UX.
- GrapesJS: fuerte para Web/HTML/CSS, pero peor encaje como canonical editor de un producto Web + Native + PHP + WordPress.

## Rete — Acciones y workflows
**Mantener.**
Aporta graph editor, processing Dataflow/ControlFlow e History.
React Flow es excelente UI de nodos, pero requeriría que ElectroCraft construyera más motor de workflow.

## PGlite + Drizzle
**Mantener.**
Studio/project/internal-data local.
No usar como backend universal de todos los exports.

## TanStack Query
**Mantener.**
Cache/invalidation/fetch lifecycle de runtimes JS.

## Refine + TanStack Table
**Mantener con alcance limitado.**
Refine solo para Administración, no para cada Screen normal.

## React Hook Form + Zod
**Mantener.**
Forms y validation en JS runtimes.
Server targets compilan constraints a validadores target-native.

## React Query Builder
**Mantener con alcance limitado.**
Condition-tree authoring/diagnostics, no todo QueryDefinition.

## Tiptap
**Mantener.**
Un único RichText payload/editor.

## Zustand
**Mantener.**
State mechanics en runtimes JS.

## React Native + Expo + Expo Router + Expo SQLite
**Mantener.**
Android/iOS nativo.

## AI SDK + @ai-sdk/google
**Mantener.**
Gemini sigue siendo proveedor principal sin crear un provider engine propio.

# Cambio de la Octava revisión

## Studio primitives
**shadcn/ui Radix**.

La especificación anterior utilizaba otra base.
ElectroCraft ahora fija Radix para mantener una foundation coherente con la selección de AI Elements.

El default actual del CLI no decide la arquitectura del proyecto; el base se fija explícitamente.

## AI Elements
**Añadir, pero solo componentes seleccionados.**

Usar:
Conversation, Message/MessageResponse, PromptInput, Tool, Plan y CodeBlock cuando haga falta.

No instalar todo el registry.
No usar piezas graph/React Flow para competir con Rete.

# Export engines — todos Core

## Capacitor
**Core first-class target.**
Reutiliza Web Runtime + Capacitor native shell/plugins.
No es fallback de Expo.

## LAMP
**Core first-class target.**

Stack recomendado:
Slim 4 + PSR-7 + Slim-CSRF + PDO + MySQL/MariaDB + Composer.

Motivo:
no reconstruir router, middleware, request/response ni DB access.

## WordPress
**Core first-class target.**

Salida:
Block Theme + Companion Plugin.

Usar primero:
theme.json, blocks, templates, parts, patterns, CPTs, taxonomies, metadata, Options, Users/Roles/Capabilities, REST, HTTP API, Media Library, Admin APIs.

No crear un custom block por cada componente.
No registrar CPTs en Theme.

# Decisión de exportación

Todos:
Proyecto local, React Web, Sitio estático, PWA, Android, iOS, Capacitor, LAMP y WordPress

comparten:
ExportIR -> TargetRegistry -> Capability Analyzer -> Compiler -> Verifier -> ExportReport.

Eso evita nueve arquitecturas duplicadas y mantiene igualdad real de producto.


---

## .ai/EXPORT_TARGET_CONTRACT.md

# EXPORT TARGET CONTRACT — ElectroCraft Eighth Final

## Regla de producto

ElectroCraft tiene **nueve destinos de exportación Core de primera clase**.

No existe la categoría `optional target`.

Target IDs canónicos:

1. `local-project`
2. `react-web`
3. `static-web`
4. `pwa`
5. `android-expo`
6. `ios-expo`
7. `capacitor`
8. `lamp`
9. `wordpress`

Todos aparecen en:
- `Publicar > Compatibilidad`;
- `Publicar > Exportar`;
- Target Registry;
- Capability Analyzer;
- Export acceptance;
- fixture final;
- matriz de paridad;
- documentación de release.

La arquitectura puede agrupar targets por familia para evitar duplicación de código, pero **el producto, la UI y el QA no degradan ninguno a secundario**.

---

# 1. TargetRegistry

Cada target registra `ExportTargetDescriptor`:

- `id`
- `labelEs`
- `iconId`
- `family`
- `descriptionEs`
- `configSchema`
- `capabilityProfile`
- `compilerId`
- `runtimeProfile`
- `artifactKinds`
- `verificationProfile`
- `toolchainRequirements`
- `securityProfile`
- `helpId`

`family` sirve únicamente para compartir implementación:

- package
- web
- native
- hybrid
- server
- wordpress

No afecta prioridad.

---

# 2. Pipeline obligatorio para todos

Cada exportación pasa exactamente por:

1. congelar `ElectroCraftExportIR`;
2. validar schema/version;
3. resolver TargetDescriptor;
4. ejecutar Capability Analyzer;
5. impedir generación si hay blockers;
6. resolver configuración;
7. generar RuntimeDependencyManifest;
8. compilar rutas;
9. compilar componentes/layout/style;
10. compilar Data Sources/Queries;
11. compilar State;
12. compilar Actions/Workflows;
13. compilar Forms;
14. compilar Auth/Permissions;
15. compilar Administration cuando aplique;
16. localizar assets;
17. generar source/package;
18. ejecutar toolchain/installer validation;
19. comprobar artifacts reales;
20. producir ExportReport;
21. registrar evidence.

Ningún exporter puede saltarse la Capability scan.

---

# 3. Contrato de paridad

`equal target` no significa que todos los targets tengan la misma tecnología.

Significa:

- mismo estado en producto;
- misma visibilidad;
- mismo contract;
- misma política de blockers;
- misma exigencia de evidencia;
- misma obligación de documentar adaptaciones;
- misma obligación de seguridad;
- misma obligación de fixture.

Ejemplo:
un `Iframe` puede ser:
- Web: compatible;
- Android/iOS: adaptado o bloqueado;
- LAMP: compatible;
- WordPress: compatible/adaptado.

La diferencia se expresa como capability diagnostic.
No se elimina silenciosamente el componente.

---

# 4. Export Center

Ruta:
`Publicar > Exportar`.

Desktop:
- izquierda 240–260: destinos;
- centro flex: configuración;
- derecha 320: compatibilidad/resultado.

Destinos visibles, sin sección "Opcionales":

- Proyecto local
- React Web
- Sitio estático
- PWA
- Android
- iOS
- Capacitor
- LAMP
- WordPress

Se pueden agrupar visualmente:

### Paquete
Proyecto local

### Web
React Web
Sitio estático
PWA

### Móvil
Android
iOS
Capacitor

### Servidor / CMS
LAMP
WordPress

Los grupos son organización visual, no prioridad.

---

# 5. Estados iguales

Cada target muestra:

- No analizado
- Analizando…
- Compatible
- Compatible con adaptaciones
- Advertencias
- Bloqueado
- Generando…
- Verificando…
- Listo
- Error

Cada target tiene:
`Analizar`, `Configurar`, `Generar`, `Ver informe`.

---

# 6. Artifact evidence

No mostrar `Listo` solo porque el generator terminó.

Se requiere evidencia según target:

## Local
ZIP existe + checksum + reimport test.

## React
source dir/ZIP + install + typecheck + build.

## Static
generated files + local serve/smoke.

## PWA
build + manifest/service worker + offline fixture.

## Android
source + prebuild; APK/AAB solo si realmente producidos.

## iOS
source/Xcode/prebuild; IPA solo si realmente producido.

## Capacitor
web build + Capacitor config + native platform sync/build fixture.

## LAMP
package + Composer install + migrations + HTTP/security E2E.

## WordPress
Theme ZIP + Companion Plugin ZIP + wp-env activation/migration/E2E.

---

# 7. No-autonomy rule

Ninguna nueva opción de exportación puede añadirse como checkbox aislado.

Debe implementar:
TargetDescriptor -> capabilities -> compiler -> config -> artifact -> verification -> parity fixture.


---

## .ai/EXPORT_PARITY_MATRIX.md

# EXPORT PARITY MATRIX — ElectroCraft

Todos los destinos son Core.

| Capability | Proyecto local | React Web | Sitio estático | PWA | Android | iOS | Capacitor | LAMP | WordPress |
|---|---|---|---|---|---|---|---|---|---|
| Project package | Exact | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a |
| Screens | Stored | Exact | Exact* | Exact | Native map | Native map | WebView map | Server/Web map | Block/theme map |
| Navigation | Stored | React Router | URLs | React Router | Expo Router | Expo Router | Web Router | Slim routes | WP routes/templates |
| Internal Data | Stored | client/gateway profile | limited* | client/offline profile | SQLite/gateway | SQLite/gateway | Web/gateway | MySQL/MariaDB | WP data APIs |
| REST/GraphQL | Stored | adapter | build/client* | adapter | adapter/gateway | adapter/gateway | web adapter | server/client adapter | WP HTTP/REST adapter |
| State | Stored | Zustand | build/client* | Zustand | Zustand/RN | Zustand/RN | Web state | PHP/session/JS mapping | WP/JS/session mapping |
| Forms | Stored | RHF/Zod | limited* | RHF/Zod | RN forms | RN forms | Web forms | server forms | WP forms |
| Actions | Stored | JS runtime | limited* | JS runtime | Native runtime | Native runtime | JS runtime | PHP/JS compiler | WP/PHP/JS compiler |
| Auth | Stored | adapter | limited* | adapter | native adapter | native adapter | web adapter | PHP sessions | WP users/caps |
| Administration | Stored | Refine output | limited* | Refine output | Native Admin | Native Admin | Web Admin | generated admin | WP Admin |
| Media | Stored | assets | assets | assets/cache | bundled/remote | bundled/remote | web assets | public/storage | Media Library |
| Theme/Tokens | Stored | CSS | CSS | CSS | RN styles | RN styles | CSS | CSS/templates | theme.json/styles |
| Reusables | Stored | source | baked | source | source | source | source | compiled | patterns/blocks |
| Permissions | Stored | runtime | build/runtime* | runtime | runtime | runtime | runtime | middleware/service | WP capabilities/nonces |
| AI Studio history | Excluded default | Excluded | Excluded | Excluded | Excluded | Excluded | Excluded | Excluded | Excluded |

`*` Static target may legitimately block features that need mutable server/runtime state. It remains a full target: the analyzer must explain blockers instead of silently stripping them.

---

# Acceptance principle

Every row has one of:
- Exact
- Adapted
- Blocked with reason

Never:
- silently omitted
- fake implementation
- placeholder.

A release is not export-complete until every target has run its applicable fixture.


---

## .ai/CODEBASE_LOCATION_MAP.md

# CODEBASE LOCATION MAP — ElectroCraft Eighth Final

Este mapa es obligatorio para impedir que una IA cree módulos en lugares arbitrarios.

## Monorepo

### F00
- `experiments/`
- `.ai/adr/`
- `.ai/evidence/F00/`

### F01
- `apps/studio/`
- `packages/*/`
- `.github/workflows/`
- `tooling/`

### F02
- `packages/domain/`
- `packages/application/`
- `packages/contracts/`

### F03
- `packages/design-system/`
- `apps/studio/src/shell/`
- `apps/studio/src/i18n/`
- `apps/studio/src/help/`

### F04
- `packages/data-web/`
- `packages/application/src/projects/`
- `apps/studio/src/features/projects/`

### F05
- `packages/editor-puck/`
- `apps/studio/src/features/editor/`

### F06
- `packages/editor-puck/`
- `packages/design-system/`
- `apps/studio/src/features/editor/advanced/`

### F07
- `packages/domain/src/navigation/`
- `packages/application/src/navigation/`
- `apps/studio/src/features/navigation/`

### F08
- `packages/connectors/`
- `packages/data-web/`
- `packages/domain/src/data/`
- `apps/studio/src/features/data/`

### F09
- `packages/query-builder/`
- `packages/application/src/query/`
- `apps/studio/src/features/queries/`

### F10
- `packages/media/`
- `packages/rich-text/`
- `apps/studio/src/features/media/`

### F11
- `packages/state-runtime/`
- `packages/domain/src/state/`
- `apps/studio/src/features/state/`

### F12
- `packages/auth/`
- `packages/permissions/`
- `apps/studio/src/features/access/`

### F13
- `packages/workflow-rete/`
- `packages/domain/src/actions/`
- `apps/studio/src/features/workflows/`

### F14
- `packages/forms/`
- `apps/studio/src/features/forms/`

### F15
- `packages/admin-refine/`
- `apps/studio/src/features/administration/`

### F16
- `packages/themes/`
- `packages/reusables/`
- `apps/studio/src/features/appearance/`
- `apps/studio/src/features/templates/`

### F17
- `packages/extensions/`
- `packages/app-templates/`
- `apps/studio/src/features/extensions/`

### F18
- `packages/ai/`
- `apps/studio/src/features/ai/`
- `apps/studio/src/components/ai-elements/`

### F19
- `packages/preview/`
- `apps/studio/src/features/preview/`

### F20
- `packages/export-core/`
- `packages/compatibility/`
- `apps/studio/src/features/export/`

### F21
- `packages/runtime-web/`
- `packages/export-web/`
- `packages/export-core/`

### F22
- `packages/runtime-native/`
- `packages/data-native/`

### F23
- `packages/export-native/`
- `packages/runtime-native/`

### F24
- `packages/export-capacitor/`
- `packages/export-core/`

### F25
- `packages/export-lamp/`
- `packages/export-core/`
- `fixtures/lamp/`

### F26
- `packages/export-wordpress/`
- `packages/export-core/`
- `fixtures/wordpress/`

### F27
- `packages/testing/`
- `fixtures/canonical-app/`
- `.ai/evidence/F27/`
- `.ai/`

## Regla
Una microfase puede crear un submódulo dentro de estas raíces, pero no una raíz paralela sin ADR.
Los nombres finales de archivos se derivan de la capacidad; los packages anteriores son ownership boundaries.
UI nunca importa directamente una base de datos/engine target que pertenezca a otro package.


---

## .ai/DESIGN_SYSTEM.md

# DESIGN SYSTEM — ElectroCraft Studio — Eighth Final

# Primitive stack

- React 19 baseline, reverified at F00.
- Tailwind CSS 4 baseline, reverified at F00.
- shadcn/ui source components.
- **Radix base pinned explicitly**.
- Lucide.
- i18next/react-i18next.
- selected AI Elements components for AI-native UI.

Initialization must not rely on the current shadcn default.

Use the current official equivalent of:
`shadcn init --base radix`.

# Why Radix now

The previous specification selected a different shadcn primitive base; the Eighth review pins Radix for one coherent Studio/AI Elements foundation.

The eighth review changes this because:
1. `Generar con IA` is a first-class workspace.
2. AI Elements avoids rebuilding streaming messages/tool states/plans/Markdown UI.
3. a single primitive base is safer than mixing AI Elements expectations with another shadcn base.

This is a deliberate product compatibility choice, not a claim that Radix is universally better.

# Do not mix bases

No Base UI or React Aria shadcn components inside the production Design System without ADR.

If a missing primitive requires another library:
first verify Radix/shadcn current APIs; then wrap the exception behind one ElectroCraft primitive.

# Direction

Professional No-Code builder:
- minimal clean;
- high density;
- dominant canvas/workspace;
- clear hierarchy;
- restrained borders;
- strong focus/selection;
- no ornamental glass effects by default.

# Core Studio primitives

Button
IconButton
Field/Input
Textarea
Number
Select/Combobox
Checkbox
RadioGroup
Switch
Slider
Tabs
Disclosure/Accordion
Tooltip
Popover
Menu/ContextMenu
Dialog
Sheet/Drawer
Toast
Resizable
Scroll Area
Command/Search
Sidebar

Use shadcn source components rather than recreating them.

# AI-native primitives

Use AI Elements only where it owns a standard AI pattern:
Conversation
Message/MessageResponse
PromptInput
Tool
Plan
CodeBlock if required.

ElectroCraft still owns:
Context Inspector, Artifact Picker, Validation, Draft Preview, Diff and Apply.

# Density

High Density means:
- compact grouping;
- 28–36px desktop visual control heights where appropriate;
- efficient whitespace;
- labels remain readable;
- touch hit targets remain accessible.

# Icons

Lucide IDs are semantic product IDs.
Every icon-only control requires label/tooltip.

# Help

Main H1:
icon + title + CircleHelp.

Complex technical option:
Info icon.

Do not put Info beside every simple field.

# Studio Appearance vs App Theme

Studio Appearance:
workspace/user only.

App Theme:
exported application.

No implicit coupling.

# UI implementation policy

Before editing UI:
1. load shadcn skill;
2. load relevant UI/UX/Layout/Accessibility skills;
3. load React best-practices skill after multi-component work;
4. consult current official component docs;
5. follow ElectroCraft layout blueprints.

# Performance

Heavy engines are lazy-loaded by workspace:
- Puck when Editor opens;
- Rete when Workflows opens;
- Refine admin modules when Administration opens;
- AI SDK UI client/AI Elements only when Generar con IA opens;
- chart/calendar engines only when used.


---

## .ai/AI_UI_ELEMENTS_SPEC.md

# AI UI ELEMENTS SPEC — ElectroCraft

## Decision

ElectroCraft's AI Workbench must not rebuild streaming AI message/tool UI from scratch.

Use selected **AI Elements** components on top of shadcn/ui + AI SDK.

## Studio primitive decision

Because AI Elements is a Core part of `Generar con IA`, ElectroCraft pins the Studio to:

**shadcn/ui + Radix base**

instead of relying on shadcn's current default or mixing primitive bases.

This is an Eighth Review change.

Do not combine Radix/Base UI/React Aria implementations in the same Design System without ADR.

## Install only what is used

Initial candidates:
- conversation
- message / MessageResponse
- prompt-input
- tool
- plan
- code-block only if generated code display requires it

Do **not** install the entire AI Elements registry.

Do not install:
- React Flow Canvas/Node components for workflows;
- any component that duplicates Rete;
- voice/code/terminal components until a real product requirement exists.

## Ownership

AI Elements:
- streaming message layout;
- markdown response rendering;
- tool-call display;
- plan display;
- prompt input ergonomics.

ElectroCraft:
- artifact selector;
- Context Inspector;
- privacy controls;
- Draft Preview;
- Diff;
- Validation;
- Apply;
- reusable destination controls;
- Spanish terminology/help.

## Spanish

Wrap/override component labels through ElectroCraft translation keys.

AI Elements internal defaults cannot leak English into release UI.

## Testing

- streaming;
- long Markdown;
- tool pending/running/denied/error/completed;
- cancellation;
- keyboard;
- screen reader;
- Spanish labels;
- dark/light Studio theme;
- mobile wizard.


---

## .ai/LAMP_RUNTIME_SPEC.md

# LAMP RUNTIME / EXPORT SPEC — Core

## Target

`lamp`

Visible:
`Publicar > Exportar > LAMP`.

LAMP is a first-class ElectroCraft target.

## OSS stack

Generated server runtime:

- PHP 8.x baseline verified at F00/release;
- Slim Framework 4;
- PSR-7 implementation (Slim-Psr7 or approved equivalent);
- Slim-CSRF;
- PDO;
- MySQL/MariaDB;
- Composer for build/dependency resolution;
- PHP sessions for local/session auth state where used.

Do not write a proprietary router or middleware stack.

## Why Slim

Slim provides focused routing and middleware without imposing a large application architecture.
ElectroCraft still generates its own domain/application services from ExportIR.

## Generated structure

```text
app/
  Controllers/
  Middleware/
  Services/
  Repositories/
  Policies/
  Actions/
  Queries/
  Views/
  Support/
config/
database/
  migrations/
public/
  index.php
  assets/
routes/
storage/
composer.json
.env.example
README.md
```

`vendor/` may be included in a deployable ZIP if the user selects `Incluir dependencias`.

## Routing

ElectroCraftRouteDefinition -> Slim routes.

- path params;
- route name;
- guards -> middleware;
- 404/error;
- redirects;
- REST endpoints.

## Data

Internal ElectroCraft Data -> MySQL/MariaDB schema.

Default strategy:
generic record tables + explicit relations/taxonomies + typed indexes, matching canonical semantics.

Exporter may offer an optimized dedicated-table strategy only when validation proves safe.

External REST/GraphQL:
- PHP server adapter when credentials/CORS require server;
- browser client adapter only when safe.

## Queries

ElectroCraftQueryDefinition -> parameterized PDO query or external connector adapter.

All user data values use prepared statements.
Identifiers/operators come only from validated compiler allowlists.

## State

Map scopes:
- request/component -> PHP/JS transient;
- screen -> request/JS;
- session -> PHP session;
- persistent user/app -> DB when configured;
- client interactive state -> generated JS module.

Do not pretend all Zustand state maps 1:1 to PHP.

## Forms

Server rendered or progressive-enhancement forms.

- Zod source schema compiles to server validation rules;
- CSRF via Slim-CSRF;
- uploads validated;
- ActionGraph submit target compiler;
- field errors in Spanish when app locale requires.

## Auth / Permissions

Generated:
- password hashing/verifying via PHP APIs;
- session middleware;
- role/capability policy service;
- route/service enforcement;
- login/logout/profile routes.

## Actions

ActionGraph compiles to:
- PHP service/action handlers for server operations;
- generated browser JS for UI/client actions;
- explicit bridge/endpoints where a flow crosses client/server.

## Rendering

ElectroCraft components compile to semantic HTML/CSS and minimal JS.

Do not ship React unless the chosen LAMP profile explicitly selects a React front-end.

## Security

- PDO prepared statements;
- Slim-CSRF;
- output escaping;
- validated uploads;
- secure sessions/cookies;
- permission middleware;
- `.env` secrets;
- production error details off.

## Verification

1. composer validate/install;
2. PHP syntax/static checks;
3. migration on clean MySQL/MariaDB fixture;
4. HTTP routing fixture;
5. CRUD/forms/auth/permission tests;
6. CSRF negative test;
7. SQL injection fixture;
8. same canonical app parity fixture.


---

## .ai/WORDPRESS_RUNTIME_SPEC.md

# WORDPRESS EXPORT SPEC — Core

Target:
`wordpress`.

Visible:
`Publicar > Exportar > WordPress`.

WordPress is a first-class ElectroCraft export target.

## Generated deliverables

1. **Block Theme ZIP**
2. **Companion Plugin ZIP**

Both are required for a project using dynamic ElectroCraft capabilities.

## Modern WordPress strategy

Do not generate a classic-theme architecture as the default.

Theme:
- `theme.json` current supported version;
- `/templates`;
- `/parts`;
- `/patterns`;
- `/styles`;
- `style.css`;
- optional `functions.php` only when theme-specific behavior is necessary.

Companion Plugin:
- content/data registrations;
- taxonomies;
- metadata;
- custom tables when justified;
- roles/capabilities;
- REST endpoints;
- forms/actions;
- migrations;
- administration features;
- custom dynamic blocks only when native/core blocks cannot represent semantics.

## Ownership

WordPress native APIs own:
- blocks;
- block templates;
- theme.json;
- CPTs;
- taxonomies;
- metadata;
- users/roles/capabilities;
- REST API;
- Media Library;
- Settings/Options;
- nonces;
- hooks;
- WP Cron where mapped.

ElectroCraft owns only the compiler/mapping from ExportIR.

## Content mapping

Data Model decision ladder:

1. built-in WordPress entity if semantically exact;
2. Custom Post Type;
3. taxonomy;
4. post/user/term metadata;
5. Options API for global singleton config;
6. custom table only for relations/high-volume/shape that is a poor fit for post/meta.

Custom Post Types live in the Companion Plugin, not the Theme.

## Visual mapping

Decision ladder:

1. core WordPress block;
2. block attributes/styles;
3. pattern;
4. template/template part;
5. theme.json token/style;
6. dynamic block;
7. custom block only when required.

Do not convert every ElectroCraft component into a custom WordPress block.

## Routes / Screens

Map:
- public content screens -> block templates/custom templates;
- archives -> archive templates;
- 404 -> 404 template;
- special app routes -> rewrite/REST/page template strategy according to capability;
- Administration -> WP Admin screens when semantics fit, otherwise plugin app screen.

## Queries

Use:
- WP_Query / term/user queries;
- REST API;
- custom-table repositories only when the data compiler selected custom tables.

Never emit raw SQL when native APIs cover the query.

## Forms / Actions

Forms:
- nonce;
- capability checks;
- validation/sanitization;
- REST route or admin-post strategy;
- ActionGraph compiler.

External data:
WordPress HTTP API server-side when secrets or server execution are required.

## Administration

Prefer native WordPress admin/data APIs and `@wordpress/*` packages for plugin UI.

Do not bundle a second React copy when WordPress-provided dependencies can be externalized.

## Security

Every mutation:
- nonce where applicable;
- capability check;
- sanitize input;
- validate;
- escape output;
- prepared `$wpdb` queries only for custom SQL.

## Lifecycle

Plugin:
- activation;
- versioned migration;
- deactivation;
- uninstall policy.

Uninstall never deletes user data without explicit generated policy.

## Verification

Use `wp-env` or approved current WordPress test environment:

1. start clean WordPress fixture;
2. install Theme ZIP;
3. install/activate Companion Plugin;
4. run migrations;
5. verify CPT/tax/meta/custom tables;
6. verify front-end templates;
7. verify forms/actions;
8. verify roles/capabilities/nonces;
9. verify REST endpoints;
10. deactivate/reactivate/upgrade;
11. test uninstall policy;
12. run same canonical app parity fixture.


---

## .ai/CAPACITOR_RUNTIME_SPEC.md

# CAPACITOR EXPORT SPEC — Core

Capacitor is a first-class export target, not a fallback label.

## Why it exists

Android/iOS Expo output is native React Native.

Capacitor offers a different valid product target:
reuse the Web runtime inside a native container and access native plugins.

ElectroCraft does not automatically prefer one.
The user chooses.

## Engine owner

Capacitor official runtime/CLI/plugins.

ElectroCraft owns:
- ExportIR mapping;
- generated Web runtime;
- capacitor config;
- capability/plugin mapping;
- permissions;
- artifact verification.

## Pipeline

1. Require green `react-web` runtime build.
2. Generate dedicated Web build profile for Capacitor.
3. Generate `capacitor.config.*`.
4. Add only used official/native plugins.
5. Add Android/iOS platforms.
6. `cap sync`.
7. Verify generated native projects.
8. Build smoke where toolchain is available.
9. Report unsupported native capabilities explicitly.

## UI

`Publicar > Exportar > Capacitor`.

Sections:
- Aplicación
- Web Runtime
- Plataformas
- Plugins
- Permisos
- Compatibilidad
- Build

No "fallback" badge.


---

## .ai/microphases/M00_10.md

# M00.10 — POC de paridad de exportación: Capacitor, LAMP y WordPress

**Fase propietaria:** F00 — Auditoría de producto, OSS y POCs

## Por qué existe
La octava revisión convierte Capacitor, LAMP y WordPress en targets Core iguales a Web/Android/iOS. Antes de congelar la arquitectura hay que demostrar que el mismo modelo canónico puede producir un artifact mínimo para estas tres familias sin crear modelos de proyecto separados.

## Resultado exacto
Tres POCs mínimos y reproducibles — Capacitor, LAMP/Slim y WordPress Block Theme + Companion Plugin — generados desde el mismo `ExportIrPoc`, con informe de compatibilidad y artifacts verificables.

## Engine owner
`Capacitor + Slim 4/PDO + WordPress native APIs`

## Responsabilidad ElectroCraft
Crear un ExportIR POC común, mappings y verificadores. No reconstruir routing/middleware de Slim, Native shell de Capacitor ni APIs de WordPress.

## Ubicación de código obligatoria
- `experiments/`
- `.ai/adr/`
- `.ai/evidence/F00/`

## Ubicación exacta en la app
No crea UI release. Vive en `experiments/export-target-poc/`.

## Diseño visual exacto
Harness técnico con selector `Capacitor | LAMP | WordPress`, panel `IR`, panel `Compatibilidad` y panel `Artifact/Verificación`.

## Texto visible en español
POC de exportación; Capacitor; LAMP; WordPress; Compatibilidad; Generar; Verificar; Artifact.

## Ayuda contextual
No añade HelpRegistry release. README del POC explica qué prueba y qué no prueba.

## Precondiciones
- `M00.9` COMPLETADA.
- POC de Screen, Data, Query, Action y Native disponibles.

## Implementación paso por paso
1. Define un `ExportIrPoc` con una pantalla, Container/Text/Form, ruta, modelo `Appointment`, query, estado, ActionGraph y rol.
2. POC Capacitor: genera Web build mínimo, `capacitor.config`, añade/sincroniza plataforma disponible y verifica project source.
3. POC LAMP: usa Slim 4 + PSR-7 + PDO; genera una ruta GET, una POST protegida por CSRF y migration MySQL fixture.
4. POC WordPress: genera Block Theme mínimo con theme.json/index template y Companion Plugin con un CPT y REST route protegida.
5. No uses la misma salida Web como falso resultado de LAMP/WordPress; cada target debe usar su runtime real.
6. Genera CapabilityResult por target con exact/adapted/blocked.
7. Ejecuta Composer install/PHP syntax para LAMP.
8. Ejecuta wp-env o test harness WordPress disponible; si el entorno no puede ejecutarlo todavía, documenta el requisito como POC blocker y no apruebes el ADR.
9. Verifica que un cambio en el ExportIR POC afecte los tres compilers sin modificar tres modelos canónicos.
10. Documenta qué lógica puede compartir Target Contract y qué debe quedar en adapter específico.
11. Cierra `EXPORT_TARGET_ARCHITECTURE_POC.md` con decisión.
12. Solo después permite M00.11.
13. Aísla el experimento; no importes implementación de producto no aprobada.
14. Define fixture mínimo reproducible.
15. Ejecuta la API OSS real que se está evaluando.
16. Mide el gap entre OSS y semántica ElectroCraft.
17. Documenta decisión/limitación/licencia/API usada.
18. Guarda logs/artifacts en evidence.

## Artefactos obligatorios al cerrar
- `experiments/export-target-poc/`
- `EXPORT_TARGET_ARCHITECTURE_POC.md`
- `capacitor-poc/`
- `lamp-poc/`
- `wordpress-theme-poc/`
- `wordpress-plugin-poc/`
- verification logs.

## Estados UI obligatorios
POC: idle, generating, validating, passed, failed.

## Responsive
No aplica al producto; harness usable en desktop.

## Accesibilidad
Labels y botones del harness operables por teclado.

## Pruebas obligatorias
1. Same ExportIR feeds all three.
2. Capacitor source/sync verification.
3. Slim route/PDO/CSRF fixture.
4. WordPress theme/plugin recognition/activation fixture.
5. Capability report.
6. No target-specific canonical model.
7. lint/typecheck/test/build for POC tooling.

## Prohibido
- No aprobar arquitectura si WordPress o LAMP solo generan placeholders.
- No construir router PHP propio.
- No crear CMS model exclusivo para WordPress.
- No clasificar ninguno como optional/fallback.

## Evidencia TRACKING
- commands;
- artifacts;
- test reports;
- screenshots/logs;
- ADR decision.


---

## .ai/microphases/M20_8.md

# M20.8 — ExportTargetRegistry y contrato de paridad de los nueve destinos

**Fase propietaria:** F20 — Compatibilidad multi-target

## Por qué existe
Tratar todos los exports por igual requiere un registry y un contrato formal. WordPress, LAMP y los demás targets deben compartir configuración, estados y evidencia del mismo nivel de producto.

## Resultado exacto
`ExportTargetRegistry` contiene los nueve targets Core y todos implementan el mismo descriptor/config/capability/compiler/verifier contract.

## Engine owner
`ElectroCraft Export Target Contract`

## Responsabilidad ElectroCraft
Definir el contrato portable de exportación. Los frameworks target solo implementan sus responsabilidades específicas.

## Ubicación de código obligatoria
- `packages/export-core/`
- `packages/compatibility/`
- `apps/studio/src/features/export/`

## Ubicación exacta en la app
No crea una sección nueva; alimenta `Publicar > Compatibilidad` y `Publicar > Exportar`.

## Diseño visual exacto
Los nueve targets usan el mismo componente de destino/estado. Se permiten grupos visuales por familia, pero no badges `Opcional`, `Secundario` o ranking automático.

## Texto visible en español
Proyecto local; React Web; Sitio estático; PWA; Android; iOS; Capacitor; LAMP; WordPress; Compatible; Adaptaciones; Advertencias; Bloqueado; Analizar; Configurar; Generar.

## Ayuda contextual
HelpRegistry `help.export.targets` explica que todos los targets son destinos Core y que una app concreta puede tener blockers diferentes.

## Precondiciones
- M20.7 COMPLETADA.
- `EXPORT_TARGET_CONTRACT.md` vigente.

## Implementación paso por paso
1. Define `ExportTargetDescriptor` y `ExportTargetRegistry`.
2. Registra exactamente los nueve IDs canónicos.
3. Exige a cada descriptor `configSchema`, `capabilityProfile`, `compilerId`, `verificationProfile`, `artifactKinds`, `toolchainRequirements` y `helpId`.
4. Elimina flags de target optional/secondary.
5. Define family únicamente para compartir implementación y agrupar UX.
6. Define estados comunes No analizado/Analizando/Compatible/Adaptado/Advertencias/Bloqueado/Generando/Verificando/Listo/Error.
7. Define `ExportArtifactEvidence` común.
8. Define `ExportReport` común.
9. Test duplicate/missing target, missing verifier and descriptor schema validation.
10. Test UI ordering remains stable and all nine targets discoverable.
11. Document TargetRegistry extension rule for future targets.
12. No avances si cualquier target Core carece de descriptor.
13. Actualiza Capability/TargetDescriptor contract.
14. Analiza todos los nueve targets desde el mismo project snapshot.
15. Renderiza Compatibility/Export UI desde registries, no arrays hardcoded divergentes.
16. Bloquea Generate solo por blockers reales.
17. Prueba target parity/status/config host.

## Artefactos obligatorios al cerrar
- ExportTargetDescriptor.
- ExportTargetRegistry.
- nine descriptor fixtures.
- contract tests.
- EXPORT_TARGET_CONTRACT.md aligned.

## Estados UI obligatorios
Usa los estados comunes del Target Contract.

## Responsive
Targets remain reachable at 320/375/768/desktop without horizontal overflow.

## Accesibilidad
Target selector keyboard navigable; status has text + icon, not color only.

## Pruebas obligatorias
1. Nine descriptors.
2. No optional flags.
3. Schema validation.
4. UI discovery.
5. Status rendering.
6. lint/typecheck/test/build.

## Prohibido
- No esconder LAMP/WordPress bajo `Más`.
- No tratar Capacitor como simple fallback.
- No crear target config outside registry.

## Evidencia TRACKING
Registry dump, tests, screenshots and next microphase.


---

## .ai/microphases/M20_9.md

# M20.9 — Export Center unificado con todos los destinos Core

**Fase propietaria:** F20 — Compatibilidad multi-target

## Por qué existe
El usuario debe percibir y operar todas las exportaciones con el mismo nivel de importancia. La UX no puede contradecir la arquitectura.

## Resultado exacto
`Publicar > Exportar` muestra los nueve destinos, reutiliza el mismo pipeline visual y enlaza cada uno con su análisis/configuración/generación/informe.

## Engine owner
`shadcn/ui Radix + ElectroCraft ExportTargetRegistry`

## Responsabilidad ElectroCraft
Componer una UX común; no duplicar un formulario/export screen completo por target.

## Ubicación de código obligatoria
- `packages/export-core/`
- `packages/compatibility/`
- `apps/studio/src/features/export/`

## Ubicación exacta en la app
`Publicar > Exportar`.

## Diseño visual exacto
Desktop:
- destinos 240–260 izquierda;
- configuración flex centro;
- compatibilidad/resultado 320 derecha.

Grupos visuales:
Paquete: Proyecto local.
Web: React Web, Sitio estático, PWA.
Móvil: Android, iOS, Capacitor.
Servidor/CMS: LAMP, WordPress.

Los grupos no cambian estatus.
Mobile:
Destino -> Configurar -> Revisar compatibilidad -> Generar -> Resultado.

## Texto visible en español
Exportar; Destinos; Proyecto local; React Web; Sitio estático; PWA; Android; iOS; Capacitor; LAMP; WordPress; Analizar; Configurar; Generar; Ver informe; Artifact.

## Ayuda contextual
`help.export.center`.

## Precondiciones
- M20.8 COMPLETADA.

## Implementación paso por paso
1. Renderiza targets exclusivamente desde ExportTargetRegistry.
2. Mantén orden estable y agrupación indicada.
3. Seleccionar target carga config schema y latest Compatibility result.
4. `Generar` permanece disabled con blockers y explica el primer blocker + `Ver todos`.
5. Si no se ha analizado, primary action es `Analizar`.
6. Después de analizar sin blockers, primary action pasa a `Generar`.
7. Durante export muestra stepper Validar -> Compilar -> Empaquetar -> Verificar.
8. Resultado muestra artifacts reales, tamaño/checksum cuando exista y botones Abrir carpeta/Ver informe según entorno.
9. Toolchain missing se diferencia de project incompatibility.
10. Cada target muestra `Ayuda` contextual específica sin salir del workflow.
11. Implementa deep-link `?target=wordpress` etc.
12. Test keyboard/focus, all targets, blockers, toolchain missing, mobile flow and Spanish overflow.
13. Actualiza Capability/TargetDescriptor contract.
14. Analiza todos los nueve targets desde el mismo project snapshot.
15. Renderiza Compatibility/Export UI desde registries, no arrays hardcoded divergentes.
16. Bloquea Generate solo por blockers reales.
17. Prueba target parity/status/config host.

## Artefactos obligatorios al cerrar
- ExportCenter.
- TargetSelector.
- TargetConfigHost.
- ExportProgress.
- ExportResult.
- E2E tests.

## Estados UI obligatorios
No analizado, Analizando, Bloqueado, Ready, Generando, Verificando, Listo, Error.

## Responsive
Exact layout above.

## Accesibilidad
Focus follows workflow; progress uses aria-live politely; target statuses have text.

## Pruebas obligatorias
1. All nine visible.
2. No optional grouping.
3. Blocker disables Generate.
4. Toolchain missing distinct.
5. Deep-link target.
6. Mobile wizard.
7. keyboard.
8. lint/typecheck/test/build.

## Prohibido
- No hardcode one target's form into ExportCenter.
- No special CTA priority for one destination.
- No fake artifacts.

## Evidencia TRACKING
Screenshots desktop/mobile, E2E report, registry mapping.


---

## .ai/microphases/M24_6.md

# M24.6 — Build, signing y artifact verification Capacitor

**Fase propietaria:** F24 — Exportación Capacitor

## Por qué existe
Capacitor es first-class; su exporter debe llegar hasta la misma evidencia de build que Android/iOS Expo cuando el entorno lo permite.

## Resultado exacto
Al cerrar esta microfase, **Build, signing y artifact verification Capacitor** funciona de forma observable dentro del target correspondiente y pasa su gate. No se acepta un archivo generado sin validación ni una opción visual sin compiler/runtime real.

## Engine owner
`Capacitor native projects + Android/iOS toolchains`

## Responsabilidad ElectroCraft
ElectroCraft implementa únicamente el mapping desde modelos canónicos, la UX española, configuración, validación, diagnósticos, seguridad, compilación y evidencia. El framework/SDK target conserva routing/runtime/API behavior que ya ofrece.

## Ubicación de código obligatoria
- `packages/export-capacitor/`
- `packages/export-core/`

## Ubicación exacta en la app
`Publicar > Exportar > Capacitor > Build`.

## Diseño visual exacto
Dos cards Android/iOS: Source, Toolchain, Signing, Build, Artifact. Cada artifact muestra path/tamaño/checksum.

## Texto visible en español
Build; Código fuente; Firmado; APK/AAB; Xcode/IPA; Verificar artifact.

## Ayuda contextual
Usa HelpRegistry `help.export.capacitor.build`. El H1 usa `CircleHelp`; las opciones técnicas muestran Info solo cuando explican una decisión o requisito del target.

## Precondiciones
- Gate de la fase anterior satisfecho.
- ExportIR/TargetRegistry/Capability Analyzer disponibles.
- Tests existentes verdes antes de modificar el target.
- No existe un exporter paralelo para la misma responsabilidad.

## Implementación paso por paso
1. Detecta toolchain real.
2. Android: build debug and verify APK when available; release/AAB only with real signing.
3. iOS: verify Xcode/source; build/IPA only on valid macOS/signing.
4. Never infer success from exit message alone; stat/checksum artifacts.
5. Keep source generation green even if local signing is unavailable; report exact toolchain state.
6. Store sanitized build report.
7. Reutiliza Web Runtime, no dupliques React exporter.
8. Genera Capacitor config/platform projects.
9. Incluye solo plugins/capabilities usados.
10. Ejecuta sync/build verification.
11. Comprueba no Expo dependency leakage.
12. Registra artifact/report.

## Artefactos obligatorios al cerrar
- `CapacitorBuildReport`
- `artifact verifier`
- `Android/iOS build fixtures`

## Estados UI obligatorios
- No analizado.
- Analizando…
- Compatible / Compatible con adaptaciones / Advertencias / Bloqueado.
- Generando…
- Verificando…
- Listo.
- Error con recuperación.

## Responsive
- Desktop: lista de targets 240–260, config central, compatibilidad 320.
- Tablet: targets en rail/Sheet; configuración central.
- Mobile: selector de destino -> configuración -> compatibilidad -> generar -> resultado.

## Accesibilidad
- teclado completo;
- focus-visible;
- labels persistentes;
- estados no dependen solo de color;
- icon-only con aria-label;
- errores anunciables;
- progress/status accesible.

## Pruebas obligatorias
1. Android build where available.
2. iOS source/build where available.
3. Missing toolchain state.
4. Artifact checksum.
90. lint.
91. typecheck.
92. test.
93. build.

## Prohibido
- No inventar APK/IPA.
- No marcar source como bloqueado solo porque signing no está configurado.

## Evidencia TRACKING
- archivos generados/modificados;
- target descriptor/compiler utilizado;
- capability report;
- comandos reales de validación;
- paths/checksums de artifacts cuando existan;
- errores/limitaciones;
- siguiente microfase exacta.


---

## .ai/microphases/M25_5.md

# M25.5 — Data Sources, Queries y Formularios en LAMP

**Fase propietaria:** F25 — Exportación LAMP con Slim/PDO

## Por qué existe
El target debe ejecutar consultas/formularios tanto contra su DB interna como contra fuentes externas sin un segundo query/form engine.

## Resultado exacto
Al cerrar esta microfase, **Data Sources, Queries y Formularios en LAMP** funciona de forma observable dentro del target correspondiente y pasa su gate. No se acepta un archivo generado sin validación ni una opción visual sin compiler/runtime real.

## Engine owner
`PDO + PHP HTTP client strategy + Slim-CSRF + generated validation`

## Responsabilidad ElectroCraft
ElectroCraft implementa únicamente el mapping desde modelos canónicos, la UX española, configuración, validación, diagnósticos, seguridad, compilación y evidencia. El framework/SDK target conserva routing/runtime/API behavior que ya ofrece.

## Ubicación de código obligatoria
- `packages/export-lamp/`
- `packages/export-core/`
- `fixtures/lamp/`

## Ubicación exacta en la app
`Publicar > Exportar > LAMP > Datos y formularios`.

## Diseño visual exacto
Compatibility/config summary: internal DB, external sources, server-side secrets, CSRF, upload limits.

## Texto visible en español
Datos y formularios; Fuentes externas; CSRF; Validación; Cargas; Ejecutar en servidor.

## Ayuda contextual
Usa HelpRegistry `help.export.lamp.data`. El H1 usa `CircleHelp`; las opciones técnicas muestran Info solo cuando explican una decisión o requisito del target.

## Precondiciones
- Gate de la fase anterior satisfecho.
- ExportIR/TargetRegistry/Capability Analyzer disponibles.
- Tests existentes verdes antes de modificar el target.
- No existe un exporter paralelo para la misma responsabilidad.

## Implementación paso por paso
1. Compile QueryDefinition internal operations to repositories/PDO.
2. Compile REST/GraphQL server operations through approved HTTP client/native strategy selected at implementation; secrets resolve from env.
3. Generate validation from portable form/Zod schema into PHP validator rules or generated deterministic validators; do not run Zod on server PHP.
4. Integrate Slim-CSRF for unsafe browser forms.
5. Compile uploads with MIME/size/path policy.
6. Compile Form submit to ActionGraph/service calls.
7. Return field errors in exported app locale.
8. Test internal/external query, invalid form, CSRF fail, upload fail and successful mutation.
9. Compila Routes a Slim, Data a PDO/MySQL y Screens a HTML/PHP.
10. Usa Slim/PSR-7/CSRF/PDO; no infra HTTP/DB propietaria.
11. Genera Composer/migrations/env example.
12. Ejecuta clean install + HTTP/security tests.
13. Empaqueta ZIP y verifica checksum.

## Artefactos obligatorios al cerrar
- `LAMP query compiler`
- `external source adapter`
- `PHP form validator`
- `CSRF integration`
- `form tests`

## Estados UI obligatorios
- No analizado.
- Analizando…
- Compatible / Compatible con adaptaciones / Advertencias / Bloqueado.
- Generando…
- Verificando…
- Listo.
- Error con recuperación.

## Responsive
- Desktop: lista de targets 240–260, config central, compatibilidad 320.
- Tablet: targets en rail/Sheet; configuración central.
- Mobile: selector de destino -> configuración -> compatibilidad -> generar -> resultado.

## Accesibilidad
- teclado completo;
- focus-visible;
- labels persistentes;
- estados no dependen solo de color;
- icon-only con aria-label;
- errores anunciables;
- progress/status accesible.

## Pruebas obligatorias
1. Internal query.
2. External source.
3. CSRF positive/negative.
4. Validation.
5. Upload.
90. lint.
91. typecheck.
92. test.
93. build.

## Prohibido
- No expose connector secrets to browser.
- No duplicate form state model.

## Evidencia TRACKING
- archivos generados/modificados;
- target descriptor/compiler utilizado;
- capability report;
- comandos reales de validación;
- paths/checksums de artifacts cuando existan;
- errores/limitaciones;
- siguiente microfase exacta.


---

## .ai/microphases/M26_5.md

# M26.5 — Mapear Modelos, Registros, Taxonomías, Relaciones y opciones

**Fase propietaria:** F26 — Exportación WordPress Block Theme + Companion Plugin

## Por qué existe
WordPress already provides content types, taxonomies, metadata, options and users; the exporter should choose those before custom tables.

## Resultado exacto
Al cerrar esta microfase, **Mapear Modelos, Registros, Taxonomías, Relaciones y opciones** funciona de forma observable dentro del target correspondiente y pasa su gate. No se acepta un archivo generado sin validación ni una opción visual sin compiler/runtime real.

## Engine owner
`WordPress CPT/Taxonomy/Metadata/Options APIs + custom tables only when justified`

## Responsabilidad ElectroCraft
ElectroCraft implementa únicamente el mapping desde modelos canónicos, la UX española, configuración, validación, diagnósticos, seguridad, compilación y evidencia. El framework/SDK target conserva routing/runtime/API behavior que ya ofrece.

## Ubicación de código obligatoria
- `packages/export-wordpress/`
- `packages/export-core/`
- `fixtures/wordpress/`

## Ubicación exacta en la app
`Publicar > Exportar > WordPress > Datos`.

## Diseño visual exacto
Per-model mapping table: WordPress entity, storage strategy, fields, index/query notes, custom-table reason. User may inspect but not hand-edit generated SQL.

## Texto visible en español
Datos; Tipo de contenido; Taxonomía; Metadatos; Opciones; Tabla personalizada; Razón.

## Ayuda contextual
Usa HelpRegistry `help.export.wordpress.data`. El H1 usa `CircleHelp`; las opciones técnicas muestran Info solo cuando explican una decisión o requisito del target.

## Precondiciones
- Gate de la fase anterior satisfecho.
- ExportIR/TargetRegistry/Capability Analyzer disponibles.
- Tests existentes verdes antes de modificar el target.
- No existe un exporter paralelo para la misma responsabilidad.

## Implementación paso por paso
1. For each DataModel run mapping ladder built-in entity -> CPT -> metadata/taxonomy/options -> custom table.
2. Register CPTs in plugin with namespaced slugs and REST support where needed.
3. Register taxonomies and term metadata.
4. Map singleton/global config to Options API when semantically appropriate.
5. Map user profile fields to user meta only when model is user-linked.
6. Use custom tables for relations/high-volume/data shapes that are a poor fit for post/meta; generate dbDelta-compatible/versioned schema strategy according to current WP guidance.
7. Migrate demo/records when user selects content export.
8. Test CRUD/query semantics.
9. Primero ejecuta mapping ladder a APIs WordPress nativas.
10. Genera Block Theme para diseño y Companion Plugin para comportamiento/datos.
11. Usa theme.json/blocks/CPT/tax/meta/options/REST/users/media antes de custom code/tables.
12. Ejecuta wp-env clean install/lifecycle/security tests.
13. Verifica Theme ZIP + Plugin ZIP checksums.

## Artefactos obligatorios al cerrar
- `WordPressDataMappingPlan`
- `CPT/tax/meta compiler`
- `custom table compiler`
- `data tests`

## Estados UI obligatorios
- No analizado.
- Analizando…
- Compatible / Compatible con adaptaciones / Advertencias / Bloqueado.
- Generando…
- Verificando…
- Listo.
- Error con recuperación.

## Responsive
- Desktop: lista de targets 240–260, config central, compatibilidad 320.
- Tablet: targets en rail/Sheet; configuración central.
- Mobile: selector de destino -> configuración -> compatibilidad -> generar -> resultado.

## Accesibilidad
- teclado completo;
- focus-visible;
- labels persistentes;
- estados no dependen solo de color;
- icon-only con aria-label;
- errores anunciables;
- progress/status accesible.

## Pruebas obligatorias
1. CPT CRUD.
2. Taxonomy.
3. Meta.
4. Options.
5. Custom relation table when required.
90. lint.
91. typecheck.
92. test.
93. build.

## Prohibido
- No store arbitrary high-volume relations in postmeta without analysis.
- No theme-owned content types.

## Evidencia TRACKING
- archivos generados/modificados;
- target descriptor/compiler utilizado;
- capability report;
- comandos reales de validación;
- paths/checksums de artifacts cuando existan;
- errores/limitaciones;
- siguiente microfase exacta.


---

## .ai/microphases/M26_9.md

# M26.9 — wp-env, artifact verification y paridad WordPress

**Fase propietaria:** F26 — Exportación WordPress Block Theme + Companion Plugin

## Por qué existe
WordPress cannot be considered equal if the ZIPs are never installed and exercised in a real clean WordPress environment.

## Resultado exacto
Al cerrar esta microfase, **wp-env, artifact verification y paridad WordPress** funciona de forma observable dentro del target correspondiente y pasa su gate. No se acepta un archivo generado sin validación ni una opción visual sin compiler/runtime real.

## Engine owner
`WordPress wp-env/current approved test environment + ElectroCraft parity harness`

## Responsabilidad ElectroCraft
ElectroCraft implementa únicamente el mapping desde modelos canónicos, la UX española, configuración, validación, diagnósticos, seguridad, compilación y evidencia. El framework/SDK target conserva routing/runtime/API behavior que ya ofrece.

## Ubicación de código obligatoria
- `packages/export-wordpress/`
- `packages/export-core/`
- `fixtures/wordpress/`

## Ubicación exacta en la app
No nueva UI; valida `Compatibilidad/Exportar > WordPress`.

## Diseño visual exacto
Export result lists Theme ZIP and Plugin ZIP with checksums plus activation/migration/E2E report.

## Texto visible en español
Tema listo; Plugin listo; Activado; Migraciones correctas; Pruebas WordPress; Paridad.

## Ayuda contextual
Usa HelpRegistry `help.export.parity`. El H1 usa `CircleHelp`; las opciones técnicas muestran Info solo cuando explican una decisión o requisito del target.

## Precondiciones
- Gate de la fase anterior satisfecho.
- ExportIR/TargetRegistry/Capability Analyzer disponibles.
- Tests existentes verdes antes de modificar el target.
- No existe un exporter paralelo para la misma responsabilidad.

## Implementación paso por paso
1. Generate Theme ZIP and Plugin ZIP.
2. Start clean WordPress test environment.
3. Install/activate plugin and theme.
4. Run migrations and import fixture content.
5. Verify front-end templates, REST, forms, auth/caps, admin, media.
6. Deactivate/reactivate and run upgrade path.
7. Verify uninstall policy without accidental data loss.
8. Compare canonical app semantic parity and documented adaptations.
9. Checksum both artifacts and archive evidence.
10. Primero ejecuta mapping ladder a APIs WordPress nativas.
11. Genera Block Theme para diseño y Companion Plugin para comportamiento/datos.
12. Usa theme.json/blocks/CPT/tax/meta/options/REST/users/media antes de custom code/tables.
13. Ejecuta wp-env clean install/lifecycle/security tests.
14. Verifica Theme ZIP + Plugin ZIP checksums.

## Artefactos obligatorios al cerrar
- `Theme ZIP`
- `Companion Plugin ZIP`
- `wp-env report`
- `WordPress E2E report`
- `parity snapshot`

## Estados UI obligatorios
- No analizado.
- Analizando…
- Compatible / Compatible con adaptaciones / Advertencias / Bloqueado.
- Generando…
- Verificando…
- Listo.
- Error con recuperación.

## Responsive
- Desktop: lista de targets 240–260, config central, compatibilidad 320.
- Tablet: targets en rail/Sheet; configuración central.
- Mobile: selector de destino -> configuración -> compatibilidad -> generar -> resultado.

## Accesibilidad
- teclado completo;
- focus-visible;
- labels persistentes;
- estados no dependen solo de color;
- icon-only con aria-label;
- errores anunciables;
- progress/status accesible.

## Pruebas obligatorias
1. Clean install.
2. Theme render.
3. Plugin activation.
4. Forms/REST/RBAC.
5. Upgrade/lifecycle.
6. Artifact checksum.
90. lint.
91. typecheck.
92. test.
93. build.

## Prohibido
- No mark WordPress Ready without clean install fixture.

## Evidencia TRACKING
- archivos generados/modificados;
- target descriptor/compiler utilizado;
- capability report;
- comandos reales de validación;
- paths/checksums de artifacts cuando existan;
- errores/limitaciones;
- siguiente microfase exacta.


---

## .ai/microphases/M27_15.md

# M27.15 — Fixture única de reservas para los nueve destinos de exportación

**Fase propietaria:** F27 — Hardening, paridad de exportación y release

## Por qué existe
Demostrar que Preview, Administración y exporters consumen el mismo estado y no demos desconectadas.

## Resultado exacto
Al cerrar esta microfase, **Usar una tienda editable como fixture single-source cross-target** debe quedar integrado, persistido/exportable cuando corresponda y cubierto por pruebas. No basta con un tipo, un botón o un placeholder.

## Engine owner
`cross-target fixture/test harness`

## Responsabilidad ElectroCraft
Construye únicamente la semántica portable, adapter, configuración, UX y diagnostics que el engine no trae. No dupliques el motor.

## Ubicación visual
QA fixtures/release reports; no nueva product UI salvo diagnostics.

## Ubicación de código obligatoria
- `packages/testing/`
- `fixtures/canonical-app/`
- `.ai/evidence/F27/`
- `.ai/`

## Ubicación exacta en la app
No crea nueva UI. Ejecuta QA sobre las pantallas reales y produce evidencia/reports.

## Diseño visual exacto
Use real Store fixture across Editor/IA/Preview/Administración/Exports; gaps reopen owner microphase.

## Texto visible en español
Validación final; Pruebas; Cobertura; Bloqueado; Listo para publicar.

## Ayuda contextual
Usa HelpRegistry `help.release`. Si esta microfase introduce un concepto nuevo, añade/actualiza su HelpDescriptor en español. La ayuda crítica no puede vivir solo en un tooltip.

## Precondiciones
- La microfase anterior de la fase está COMPLETADA o la dependencia está documentada como ya disponible.
- Los contratos canónicos necesarios existen.
- El engine owner está encapsulado detrás del adapter correspondiente.

## Implementación línea por línea
1. Crea una sola app fixture `Reserva Studio` sin clones target-specific.
2. Screens: Inicio, Servicios, Reservar, Mis citas, Perfil, Login y Administración.
3. Navigation: Stack/Tabs + protected routes + params/deep-link fixture.
4. Data: Servicios, Clientes, Citas; relations y searchable fields.
5. Añade una REST source mock y una query externa para probar connectors.
6. State: selección de servicio/fecha, UI filters y session state.
7. Form: reserva con validation/upload-free portable fields y ActionGraph submit.
8. Workflow: nueva cita -> pendiente -> notification/provider fixture.
9. Auth/RBAC: cliente y administrador.
10. Administration: list/calendar/metrics.
11. AI: Gemini mock genera un reusable block -> Draft/Diff/Apply.
12. Freeze one ExportIR revision/checksum.
13. Exporta: Local, React, Static, PWA, Android, iOS, Capacitor, LAMP y WordPress.
14. Static puede reportar blockers para partes dinámicas; eso es válido solo si están diagnosticados antes y el target artifact respeta el subset/strategy definido.
15. Ejecuta target-specific fixtures y conserva reports.
16. Compara semantic parity table.
17. No uses datasets manuales diferentes por target.
18. Cierra solo cuando las nueve filas tengan Exact/Adapted/Blocked con evidencia.
19. Ejecuta la fixture canónica, no una demo alternativa.
20. Corre gate específico solicitado sobre todo el sistema.
21. Reabre owner microphase ante gap P0/P1.
22. Actualiza matrices/evidence con paths reales.
23. No compenses un target fallido con otro.
24. Cierra release solo con evidencia coherente.

## Artefactos obligatorios al cerrar
- `editable-store-e2e-project`
- `cross-target equivalence report`

## Estados y errores
- Define empty/loading/error/disabled/blocked cuando tengan sentido.
- Un caso unsupported nunca se convierte silenciosamente en success.
- Diagnostics deben incluir código, ubicación, causa y acción sugerida.

## Responsive y accesibilidad si toca UI
- Desktop high-density sin overflow.
- Tablet usa Sheet/Drawer para tooling secundario.
- Mobile usa route/card/bottom-sheet, no desktop comprimido.
- Keyboard/focus-visible/aria-label.
- Alternative a DnD/gestos.

## Pruebas obligatorias
1. Unit/contract del valor Electro.
2. Integration con engine/storage real.
3. Negative/failure path.
4. Round-trip si persiste canonical data.
5. E2E si existe UI.
6. Target fixture si afecta export/native/server.
7. lint.
8. typecheck.
9. test.
10. build.

## Prohibido
- No crear subsystem paralelo.
- No persistir engine internals como modelo canónico.
- No usar mocks permanentes.

## Evidencia TRACKING
- archivos modificados;
- engine/API usado;
- pruebas ejecutadas;
- build/fixture;
- blockers/adaptations;
- siguiente microfase.


---

## .ai/microphases/M27_17.md

# M27.17 — Documentation/release gate

**Fase propietaria:** F27 — Hardening, paridad de exportación y release

## Por qué existe
Esta microfase existe para **Documentation/release gate** dentro de la responsabilidad de `F27`: demostrar equivalencia/cobertura/release. Debe cerrar una capacidad concreta y no abrir un subsystem paralelo.

## Resultado exacto
Al cerrar esta microfase, **Documentation/release gate** debe existir como capacidad real, integrada y verificable. No se acepta placeholder ni una implementación paralela al engine.

## Engine owner
`all engines via test harness`

### Regla
Antes de escribir código, consulta la API pública del engine. Si ya existe la capacidad, úsala. ElectroCraft solo debe aportar canonical mapping, configuración, UX, adapter, target semantics o exportación.

## Packages/área de código
`testing/fixtures/docs`

## Ubicación visual
QA/release; no crear nueva UI salvo diagnóstico necesario.


## Ubicación de código obligatoria
- `packages/testing/`
- `fixtures/canonical-app/`
- `.ai/evidence/F27/`
- `.ai/`

## Ubicación exacta en la app
No crea nueva UI. Ejecuta QA sobre las pantallas reales y produce evidencia/reports.

## Diseño visual exacto
Use real Store fixture across Editor/IA/Preview/Administración/Exports; gaps reopen owner microphase.

## Texto visible en español
Validación final; Pruebas; Cobertura; Bloqueado; Listo para publicar.

## Ayuda contextual
Usa HelpRegistry `help.release`. Si esta microfase introduce un concepto nuevo, añade/actualiza su HelpDescriptor en español. La ayuda crítica no puede vivir solo en un tooltip.

## Precondiciones
- `M27.16` COMPLETADA.
- Engine owner disponible detrás de su adapter.
- No existen errores P0/P1 de la dependencia inmediata.
- Tests existentes están verdes antes de modificar comportamiento.

## Implementación línea por línea
1. Ejecuta lint/typecheck/test/build del monorepo.
2. Ejecuta Studio/browser E2E.
3. Ejecuta security/accessibility/performance gates.
4. Ejecuta exporter fixtures para los nueve targets.
5. Verifica artifacts/checksums y clean-install reports donde correspondan.
6. Verifica documentación española/help y no stale Eighth-predecessor terminology ni etiquetas de exportación secundaria.
7. Verifica dependency/license/security baseline actual.
8. Verifica release notes y migration docs.
9. Verifica TRACKING/MEMORY/STATE/HANDOFF coherentes.
10. Release gate falla si cualquier target Core carece de descriptor/compiler/verifier/evidence.
11. Release gate falla si WordPress/LAMP son omitidos por falta de toolchain sin reportar un blocker real del entorno.
12. Solo entonces marca ElectroCraft Core `RELEASE_READY`.
13. Ejecuta la fixture canónica, no una demo alternativa.
14. Corre gate específico solicitado sobre todo el sistema.
15. Reabre owner microphase ante gap P0/P1.
16. Actualiza matrices/evidence con paths reales.
17. No compenses un target fallido con otro.
18. Cierra release solo con evidencia coherente.

## Artefactos obligatorios al cerrar
- `implementation artifact in the phase-owned package`
- `unit/integration test proving observable behavior`

## Flujo de datos obligatorio
1. Usuario/Runtime produce una intención.
2. UI/hook llama al adapter o application service propietario.
3. El engine OSS ejecuta la responsabilidad que le pertenece.
4. ElectroCraft normaliza solo lo que necesita persistencia/portabilidad.
5. Storage o target adapter persiste/ejecuta.
6. Resultado tipado vuelve a UI/runtime.
7. Error/diagnostic permanece visible y reparable.

## Estados cuando apliquen
- initial;
- loading;
- ready;
- empty;
- error;
- disabled;
- saving;
- saved;
- blocked.

## Responsive si existe UI
- Desktop >=1280: patrón completo/high density.
- Laptop 1024–1279: reduce herramientas secundarias antes de reducir la región principal.
- Tablet 768–1023: tools secundarias a Sheet/Drawer.
- Mobile <768: route/card/bottom-sheet/full-height tool; nunca desktop comprimido.

## Accesibilidad
- keyboard;
- focus-visible;
- aria-label en icon-only;
- labels persistentes;
- errores no dependientes del color;
- alternativa a DnD cuando aplique;
- touch targets correctos;
- reduced motion donde corresponda.

## Pruebas obligatorias
1. Unit/contract para lógica Electro propia.
2. Integration con engine/storage real.
3. Negative/error test.
4. Persistence/round-trip si toca canonical data.
5. E2E si existe interacción de usuario.
6. Target fixture si afecta export/native/server.
7. `lint`.
8. `typecheck`.
9. `test`.
10. `build`.

## Prohibido
- reconstruir una función disponible en el engine;
- añadir subsystem/widget/model únicamente por conveniencia;
- persistir engine internals como proyecto canónico;
- usar datos hardcoded permanentes;
- declarar COMPLETADA sin evidencia.

## Evidencia que debes registrar en TRACKING
- archivos modificados;
- API/engine utilizado;
- tests exactos;
- build/fixture result;
- blockers o adaptación;
- próxima microfase exacta.

