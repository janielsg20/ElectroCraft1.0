# GENERAR CON IA — UI SPEC — Eighth Final

Route:
`Construir > Generar con IA`.

Icon:
Sparkles.

Help:
CircleHelp.

# Desktop

## Context Panel — 288
Tabs:
Crear | Historial.

Artifact types:
Pantalla
Sección/Bloque
Componente reutilizable
Plantilla
Tema
Navegación
Modelo de datos
Consulta
Formulario
Acción/Workflow
Administración
Dashboard
App/Kit
Extensión/Plugin
Contenido
Datos demo
Imagen

## Workbench — flex

Use selected AI Elements:
Conversation
Message/MessageResponse
PromptInput
Tool
Plan

ElectroCraft local tabs:
Conversación | Vista previa | Cambios.

Toolbar:
artifact title, Regenerar, Descartar.

Composer placeholder:
`Describe lo que quieres crear…`

## Inspector — 320

Tabs:
Contexto | Opciones | Validación.

Context:
checkbox/count per selected source + `Ver lo que se enviará`.

Options:
Proveedor Gemini.
Modo Automático/Rápido/Calidad/Imagen.
Targets.
Reuse intent.
External grounding toggle off by default.
History/privacy.

Validation:
Estructura
Referencias
Datos
Navegación
Permisos
Compatibilidad
Seguridad
Código.

# Draft actions

Primary:
Aplicar cambios.

Secondary:
Guardar como reutilizable.
Descartar.

Apply disabled while blocker exists and must expose the reason.

# Responsive

Tablet:
Context/Inspector -> Sheets.

Mobile wizard:
1. Qué generar
2. Instrucciones
3. Contexto
4. Opciones
5. Generando
6. Revisar
7. Aplicar

# States

Proveedor no configurado.
Sin conexión.
Generando.
Herramienta ejecutándose.
Borrador listo.
Con advertencias.
Bloqueado.
Cancelado.
Error.
Aplicado.

# Spanish

Every AI Elements visible label/state is wrapped/overridden through ElectroCraft i18n.
No library English defaults may leak into release UI.
