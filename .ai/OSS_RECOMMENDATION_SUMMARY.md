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
