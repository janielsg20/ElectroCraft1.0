# OSS DECISION MATRIX — ElectroCraft Eighth Final
Review date: 2026-08-16.

Exact versions are verified before pinning. This document freezes responsibilities, not vendor version strings.

# 1. Studio Design System

## shadcn/ui + Radix — SELECTED

Eighth-review correction:
the Studio no longer selects React Aria as its shadcn base.

Reason:
`Generar con IA` is a Core workspace and ElectroCraft will use selected AI Elements components instead of rebuilding streaming messages, tool states, plans and Markdown rendering.
The implementation must use one coherent shadcn primitive base.

shadcn currently supports Base UI, React Aria and Radix; Base UI is the default for new projects, but Radix remains fully supported.

ElectroCraft deliberately pins:
`shadcn init --base radix`.

Do not follow the CLI default implicitly.

## AI Elements — SELECTED, NARROW INSTALL

Use:
Message/MessageResponse, Conversation, Prompt Input, Tool, Plan and only other components that pass a real-use test.

Do not install all components.

Do not use AI Elements React Flow Node/Canvas to replace Rete.

# 2. Screen Composer

## Puck — SELECTED

Keep.

Puck provides:
- compositional editor UI;
- Components;
- Fields;
- Outline;
- Preview;
- Slots for recursive nesting;
- editor history.

New nesting uses `slot`.
Legacy `DropZone` is migration-only.

ElectroCraft owns:
portable Screen/Document, layout/style, responsive/platform overrides, bindings, actions, accessibility and target renderers.

## Craft.js — NOT DEFAULT

Still lower-level for the amount of authoring chrome ElectroCraft needs.
Would force more custom Palette/Inspector/Outline/editor behavior.

## GrapesJS — NOT CORE

Strong Web/HTML/CSS builder, but its project model competes with ElectroCraft's Web/Native/LAMP/WordPress-neutral document semantics.

# 3. Workflow

## Rete.js — SELECTED

Keep.

Reasons:
- visual programming focus;
- React renderer;
- DataflowEngine;
- ControlFlowEngine;
- History plugin;
- modular packages;
- MIT.

ElectroCraftActionGraph remains canonical.

## React Flow — NOT DEFAULT

Excellent node-canvas UI, but it would make ElectroCraft own more workflow processing/history semantics.
Do not install alongside Rete without ADR.

# 4. Local Studio / Internal Data

## PGlite + Drizzle — SELECTED

Keep.

Use:
- Studio project metadata;
- internal ElectroCraft Data;
- migrations;
- transactions;
- multi-tab Worker.

Do not use as universal exported backend.

# 5. Async data lifecycle

## TanStack Query — SELECTED

Keep for Web/Studio/runtime query cache/invalidation.

PGlite live queries may trigger invalidation/adaptation; they are not a second cache engine.

# 6. Data Sources

## ElectroCraft ConnectorRegistry — REQUIRED PRODUCT CONTRACT

Core:
- Internal ElectroCraft Data;
- REST/OpenAPI;
- GraphQL.

Additional connectors can be extensions.

Secret-bearing/server-only connectors go through ConnectorGateway.

# 7. Administration

## Refine Core + TanStack Table — SELECTED, LIMITED SCOPE

Refine is a specialized Administration engine, not the normal Screen runtime.

Reuse:
DataProvider, accessControlProvider, auditLogProvider, hooks and table lifecycle.

# 8. Forms

## React Hook Form + Zod — SELECTED

No custom form state/validation engine.

# 9. Query condition authoring

## React Query Builder — SELECTED, NARROW

Use condition-tree UI/diagnostics where it fits.

It does not own the whole ElectroCraftQueryDefinition.

# 10. Rich Text

## Tiptap — SELECTED

One rich-text format/editor.

Inside Puck, use a custom field/wrapper that edits the portable Tiptap payload.
Do not also use a second persistent Puck RichText payload.

# 11. State

## Zustand — SELECTED

Generated runtime/store mechanics.
Canonical ElectroCraftStateDefinition remains portable.

# 12. AI

## Vercel AI SDK + @ai-sdk/google — SELECTED

Own:
model/provider calls, tools, streaming, structured outputs and bounded agent loops.

Gemini remains the default product provider.

## AI Elements — SELECTED UI

Owns standard AI streaming UI pieces.

## @google/genai — CONDITIONAL ESCAPE HATCH

Only when F00 proves a required current Gemini-native capability is not exposed adequately by the pinned AI SDK provider.

No second complete AI stack.

# 13. Native

## React Native + Expo + Expo Router + Expo SQLite — SELECTED

Primary Android/iOS runtime/export.

# 14. Capacitor

## Capacitor — SELECTED CORE EXPORT TARGET

Not a fallback and not optional.
It reuses the Web runtime in a native container and maps capabilities through Capacitor plugins.

It remains architecturally different from Expo.

# 15. LAMP

## Slim 4 + PSR-7 + PDO + Slim-CSRF — SELECTED CORE EXPORT STACK

Why:
- avoid proprietary PHP router;
- avoid proprietary middleware pipeline;
- focused/minimal runtime;
- PDO prepared statements;
- Composer build;
- compatible with Apache/Nginx/shared-hosting style deployment after dependencies are packaged.

ElectroCraft compiles domain semantics; Slim owns HTTP routing/middleware.

# 16. WordPress

## WordPress native APIs + Block Theme architecture — SELECTED CORE EXPORT STACK

Use:
- theme.json;
- block templates;
- template parts;
- patterns;
- CPT/tax/meta/options/users/roles;
- REST API;
- Media Library;
- WordPress nonces/capabilities;
- @wordpress packages when building plugin admin UI.

Generate:
Block Theme + Companion Plugin.

Do not create CPTs in the Theme.
Do not rebuild WordPress content/role/media APIs.

# 17. Auxiliary presentation

- Lucide — icons.
- Apache ECharts — Web charts.
- Victory Native — Native charts.
- FullCalendar Standard — Web calendar.
- react-native-calendars — Native calendar.
- dnd-kit — Web Kanban.

All conditional/dependency-pruned.

# 18. Whole low-code platforms

Appsmith, ToolJet, Budibase and Lowcoder remain product references only.
They are complete platforms, not focused engine dependencies.

# Final rule

ElectroCraft assembles focused OSS engines behind portable contracts.

The same feature must never be implemented twice merely because another target uses another runtime.
Target-specific code belongs in compilers/adapters, not new canonical models.
