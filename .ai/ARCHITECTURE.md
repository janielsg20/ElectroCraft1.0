# ARCHITECTURE — ElectroCraft Eighth Final

# Layer direction

```text
domain
  -> application/use-cases
  -> ports
  -> engine/target adapters
  -> Studio / runtimes / exporters
```

Domain imports no React, Puck, Refine, Rete, Expo, Capacitor, Slim, WordPress or AI SDK.

# Canonical objects

- ElectroCraftProjectDefinition
- ElectroCraftDocument
- ElectroCraftNavigationDefinition
- ElectroCraftRouteDefinition
- ElectroCraftDataSourceDefinition
- ElectroCraftDataSchema
- ElectroCraftQueryDefinition
- ElectroCraftStateDefinition
- ElectroCraftActionGraph
- ElectroCraftRole/PermissionPolicy
- ElectroCraftTheme/DesignSystem
- ElectroCraftExtensionPackage
- ElectroCraftExportIR

# Documents

Kinds:

- screen
- template
- form
- admin-screen
- reusable-component

Node:
componentRef, props, slots, layout, style, responsive, platform, bindings, actionRefs, conditions, accessibility.

Puck edits a projection.
ElectroCraftDocument is canonical.

# Studio

React/Vite.
shadcn/ui source components sobre Radix.
Un único tema visual del Studio: ElectroCraft, con modos claro y oscuro. No existen adapters multi-framework, galerías de temas ni presets de apariencia del Studio.
Radix conserva ownership de primitives, overlays, portals y focus management del AppShell.
El tema del Studio es una preferencia del workspace y permanece aislado de `ElectroCraftTheme/DesignSystem`, que sigue perteneciendo a las aplicaciones creadas/exportadas.
AI Elements for AI-native UI only.
i18next.
Puck.
PGlite/Drizzle.
Rete.
Refine for Administration.
AI SDK for Gemini generation.

# Data Sources

ConnectorRegistry:
Internal ElectroCraft Data / REST/OpenAPI / GraphQL / extensions.

Secrets:
SecretRef + ConnectorGateway.

# Shared target contract

Every export uses:
ElectroCraftExportIR -> ExportTargetDescriptor -> Capability Analyzer -> target compiler/runtime -> artifact verifier.

Nine Core targets:
local/react/static/pwa/android/ios/capacitor/lamp/wordpress.

# Web family

React DOM runtime.
React Router target compiler.
TanStack Query/Zustand/RHF/Zod/Action runtime.
Static/PWA are target profiles, not separate canonical models.

# Native family

React Native + Expo.
Expo Router.
Expo SQLite where required.

# Capacitor

Uses the generated Web runtime inside Capacitor.
Maps supported native/device capabilities through Capacitor plugins.
It is independent from the Expo target family at artifact level.

# LAMP

Generated PHP runtime:
Slim 4 + PSR-7 + PDO + Slim-CSRF + MySQL/MariaDB.
ElectroCraft compiles routes/data/actions/forms/auth.
Slim owns HTTP routing/middleware.

# WordPress

Generated:
Block Theme + Companion Plugin.

Uses WordPress native blocks/theme.json/templates/parts/patterns/content APIs/REST/users/capabilities/media.

ElectroCraft does not recreate WordPress APIs.

# AI

AI SDK/provider state is transient.
AI writes AIDraftWorkspace only.
User Apply uses canonical application services.

# Extensions

Declarative-first.
A connector/target/plugin extension cannot create a second canonical model.

# Core invariant

One semantic feature.
Many target adapters.
No target-specific duplicate product model.
