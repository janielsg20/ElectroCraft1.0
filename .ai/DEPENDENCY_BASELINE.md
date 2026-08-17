# DEPENDENCY BASELINE — ElectroCraft Eighth Final
Review date: 2026-08-16.

Versions are reverified at F00 before pinning.

# Studio

React 19 / Vite / Tailwind 4 compatible stack.
shadcn/ui with explicit `radix` base.
Lucide.
i18next/react-i18next.

AI Elements:
install only named components required by AI Workbench.
Never install entire registry blindly.

# Editor
Puck current stable with Slots.
DropZone is migration-only.

# Data
PGlite + Drizzle.
TanStack Query.
OpenAPI parser chosen by F00 POC.
GraphQL protocol adapter.
No server DB drivers in browser Studio Core unless a connector extension requires them.

# Administration
Refine Core + TanStack Table.

# Forms / validation
React Hook Form + Zod.

# Query UI
React Query Builder.

# Workflows
Rete + exact plugins required.
No React Flow in Core.

# Richtext
Tiptap.

# State
Zustand.

# AI
AI SDK Core + @ai-sdk/google + @ai-sdk/react where required.
Direct @google/genai only after capability-gap POC.

# Native
React Native + Expo + Expo Router + Expo SQLite.

# Capacitor
Current official Capacitor packages/plugins only for used capabilities.

# LAMP
Slim Framework 4.
Approved PSR-7 implementation.
Slim-CSRF.
PDO/MySQL.
Composer.

Pin supported PHP baseline in F00 after checking target hosting requirements and current security support.

# WordPress
No WordPress runtime npm package is the canonical target.

Compiler targets the current supported WordPress APIs:
theme.json current version, blocks/templates/parts/patterns, plugin APIs, REST, roles/caps, metadata.

Use @wordpress packages as externals where appropriate instead of bundling duplicate WordPress React/runtime libraries.

# Auxiliary
Lucide, ECharts, Victory Native, FullCalendar Standard, react-native-calendars, dnd-kit.

Everything is dependency-pruned.
