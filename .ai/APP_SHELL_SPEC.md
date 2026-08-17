# APP SHELL SPEC — ElectroCraft Eighth Final

Visible UI:
Spanish.

Studio primitives:
shadcn/ui Radix.

# Desktop >=1280

Sidebar:
240 expanded / 64 collapsed.

Topbar:
52.

Context:
288 default, 240 min, 380 max.

Main:
flex:1.

Inspector:
320 default, 280 min, 440 max.

Statusbar:
26.

# Sidebar

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

# Topbar right exact order
Vista previa
Exportar
Estado local
Ayuda
Configuración

Configuración remains the final far-right control.

# Editor
Context tabs:
Componentes / Pantallas / Capas.

Inspector:
Contenido / Diseño / Estilo / Responsive / Datos / Acciones / Accesibilidad / Avanzado.

# AI Workbench
Context 288:
Crear / Historial.

Center:
AI Elements Conversation/Message + Preview/Diff product tabs + PromptInput.

Inspector 320:
Contexto / Opciones / Validación.

# Export Center
Target list 240–260.
Config flex.
Compatibility/result 320.

All targets shown:
Proyecto local, React Web, Sitio estático, PWA, Android, iOS, Capacitor, LAMP, WordPress.

Groups are visual only:
Paquete / Web / Móvil / Servidor-CMS.
No optional group.

# Tablet
Rail + Sheets for secondary panes.

# Mobile
Task-first:
list/step -> detail/config -> result.
Never squeeze desktop three-column layout.
