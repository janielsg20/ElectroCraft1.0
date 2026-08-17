# AI ARTIFACT CATALOG — ElectroCraft

Every draft:
draftId, kind, title, baseRevision, operations, validation, compatibility, origin, previewRef, status.

Statuses:
Generando | Borrador | Requiere revisión | Válido | Con advertencias | Bloqueado | Aplicado | Descartado.

# Pantalla
ElectroCraftDocument kind=screen.

# Sección / Bloque
Reusable node subtree.

# Componente reutilizable
First prefer existing Core/Props/Preset/Block/Global.
New ComponentDefinition only if unique semantics require it.

# Plantilla
ElectroCraftDocument kind=template.

# Tema
ElectroCraftTheme/tokens/variants.

# Navegación
Navigation/Route patch.
Never provider-specific router objects.

# Modelo de datos
Internal DataSchema patch.

# Fuente/Operación de datos
May draft DataSource/operation configuration, but never credentials.
Connector availability/capability must validate.

# Consulta
ElectroCraftQueryDefinition.

# Formulario
ElectroCraftDocument kind=form + metadata/action refs.

# Acción / Workflow
ElectroCraftActionGraph.

# Administración
ElectroCraftDocument kind=admin-screen + resource/config.

# Dashboard
Admin screen composed with Metric/Chart/DataView etc.

# App completa / Kit
App Template/App Kit draft using existing artifacts.

# Extensión / Plugin
ElectroCraftExtensionPackage.
Declarative by default.
Code modules -> `Requiere revisión de código`.

# Contenido
Text/value drafts targeted to a selected field/component/record.
No auto-publish.

# Datos demo
Validated against Data Model and clearly removable.

# Imagen
AI image staged in Draft Media Store.
Apply -> MediaBlobStore.

# Reusable destinations
Block -> Componentes/Bloques.
Template -> Plantillas.
Theme -> Temas.
Form -> Formularios.
Query -> Consultas.
Workflow -> Acciones y workflows.
Extension -> Extensiones/Borradores.
App Kit -> Plantillas de App/Kits.
