# EXTENSION / PLUGIN SYSTEM — ElectroCraft

Visible:
`Recursos > Extensiones`.

# ElectroCraftExtensionPackage

Declarative content may include:
- Presets/Blocks/Components metadata
- Templates
- Themes
- Data Model patches
- Connector definitions
- Queries
- Forms
- ActionGraphs
- Admin Screens
- Help/i18n
- App Template fragments
- Media/assets
- capability declarations

# Install
Delegates to existing services/registries.
No second runtime.

# Lifecycle
Borrador -> Validar -> Impacto -> Permisos -> Compatibilidad -> Instalar -> Activar/Desactivar -> Upgrade -> Desinstalar.

# Connector extensions
May register DataSourceAdapter/gateway/runtime descriptors.
Secrets remain external.

# AI
AI-generated extensions always start as Borrador.

# Code-bearing
`Requiere revisión de código`.
No automatic execution or install.
