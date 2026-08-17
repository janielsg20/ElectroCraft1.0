# ENGINE RESPONSIBILITY MATRIX — ElectroCraft Eighth Final

# Studio primitives

## shadcn/ui + Radix
Own:
Dialog, Popover, Tooltip, Menu, Sheet, Tabs, Fields, accessibility/focus/keyboard primitives copied as project source.

ElectroCraft owns:
Spanish copy, tokens, density, composition, AppShell and product semantics.

Do not mix Base UI or React Aria component bases without ADR.

## Lucide
Own:
icons.
ElectroCraft owns semantic icon IDs.

## i18next/react-i18next
Own:
translation lookup, pluralization and locale namespaces.

# AI-native UI

## AI Elements
Own selected standard AI UI:
Conversation, Message/MessageResponse, PromptInput, Tool, Plan and required display helpers.

ElectroCraft owns:
artifact picker, context/privacy inspector, Draft Preview, Diff, Validation, Apply and reusable destinations.

AI Elements never owns the workflow graph.

# Screen Composer

## Puck
Own:
visual insertion/DnD, Slots, Components, Fields, Outline, Preview and editor history.

ElectroCraft owns:
canonical Document, Screen context, Layout/Style, responsive/platform overrides, Bindings, Actions, accessibility and target mapping.

# Studio/local data

## PGlite + Drizzle
Own:
embedded PostgreSQL runtime, transactions and schema/access mechanics.

ElectroCraft owns:
repositories, project_objects, project_revisions and Internal Data semantics.

# Runtime async data

## TanStack Query
Own:
cache/fetch/retry/invalidation lifecycle where the JS runtime uses it.

# Data sources

## ConnectorRegistry/DataSourceAdapter
ElectroCraft contract because one portable app must describe Internal/REST/GraphQL/connector sources independently of a target.

Framework/native HTTP/DB APIs remain target adapters.

# Administration

## Refine Core
Own:
headless CRUD/resource/admin orchestration.

## TanStack Table
Own:
table state/algorithms.

Refine is not a required runtime for normal Screens and is not shipped to LAMP/WordPress by default.

# Forms

## React Hook Form
Own JS/React form state.

## Zod
Own Studio/Web/Native validation schemas.

LAMP/WordPress compilers generate target-native server validation from the portable form constraints; they do not execute Zod in PHP.

# Query authoring

## React Query Builder
Own:
condition-tree authoring and diagnostics where suitable.

It does not own DataSource, operation selection, cache or target compiler.

# Workflow

## Rete
Own:
graph editor, sockets/connections, history and JS ControlFlow/Dataflow.

ElectroCraftActionGraph is canonical.
LAMP/WordPress compile it to target services/hooks/endpoints.

# Rich text

## Tiptap
Own:
rich-text editing/JSON and Web static rendering tools.

No second persistent rich-text payload.

# State

## Zustand
Own JS runtime state mechanics.
ElectroCraftStateDefinition stays canonical and targets adapt scopes.

# AI

## Vercel AI SDK
Own:
provider/model invocation, streaming, structured output, tool calls and bounded agent loops.

## @ai-sdk/google
Default Gemini provider.

## @google/genai
Narrow capability adapter only when a F00 POC proves a required Gemini feature is missing from the pinned AI SDK provider.

# Native

## React Native + Expo + Expo Router + Expo SQLite
Own Android/iOS native runtime, routing, device ecosystem and local SQLite.

# Hybrid

## Capacitor
Own native WebView shell/platform projects/plugin runtime for the Capacitor target.

It does not replace Expo and is not a fallback label.

# LAMP

## Slim 4 + PSR-7
Own HTTP routing/middleware/request-response.

## Slim-CSRF
Own CSRF middleware mechanism.

## PDO/MySQL/MariaDB
Own PHP DB access/runtime.

ElectroCraft owns code generation from canonical semantics.

# WordPress

## WordPress native APIs
Own:
blocks, Block Theme/theme.json, templates/parts/patterns, CPTs, taxonomies, metadata, options, users/roles/capabilities, REST, HTTP API, Media Library, hooks/nonces/admin.

ElectroCraft owns the Theme/Plugin compiler.

# Auxiliary target adapters

- Apache ECharts: Web charts.
- Victory Native: Native charts.
- FullCalendar Standard: Web calendar.
- react-native-calendars: Native calendar.
- dnd-kit: Web Kanban.

Everything is included only when a generated target needs it.
