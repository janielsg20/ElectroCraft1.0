# INFORMATION ARCHITECTURE — ElectroCraft

Visible UI language: Spanish.

# Sidebar

## CONSTRUIR
1. Editor — `PanelsTopLeft`
2. Pantallas — `PanelsTopLeft`/`Files`
3. Componentes — `Blocks`
4. Plantillas — `LayoutTemplate`
5. Generar con IA — `Sparkles`

## DATOS
1. Registros — `Database`
2. Modelos — `Boxes`
3. Fuentes de datos — `PlugZap`
4. Consultas — `ListFilter`

Taxonomías and Relaciones are NOT top-level.
They live under:
`Datos > Modelos`.

## LÓGICA
1. Acciones y workflows — `Workflow`
2. Estado y variables — `Variable`
3. Formularios — `ClipboardList`

## APP
1. Navegación — `Route`
2. Usuarios y permisos — `ShieldCheck`
3. Administración — `Gauge`

## RECURSOS
1. Medios — `Images`
2. Extensiones — `Puzzle`

## APARIENCIA
1. Temas — `Palette`
2. Sistema de diseño — `SwatchBook`
3. Tokens — `Braces`

## PUBLICAR
1. Vista previa — `Eye`
2. Compatibilidad — `BadgeCheck`
3. Exportar — `PackageOpen`
4. Desplegar — `Rocket`

# Why this hierarchy

The hierarchy follows the mental sequence of building an app:

1. What does the user see?
2. Where does data come from?
3. What happens when the user interacts?
4. How does the app navigate/authenticate/manage data?
5. What reusable resources exist?
6. How does it look?
7. How is it published?

CMS terminology is not the primary navigation model.

# Topbar right

1. Vista previa
2. Exportar
3. Estado local
4. Ayuda
5. Configuración

Configuración is always last.

# Settings

- General
- Espacio de trabajo
- Apariencia del Studio
- Editor
- Datos y almacenamiento
- IA
- Exportación
- Integraciones
- Avanzado
