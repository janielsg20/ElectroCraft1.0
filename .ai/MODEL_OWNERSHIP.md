# MODEL OWNERSHIP — ElectroCraft

Purpose:
prevent duplicate sources of truth.

# Persisted Project Objects
- ElectroCraftProjectDefinition
- ElectroCraftDocument
- ElectroCraftNavigationDefinition
- ElectroCraftRouteDefinition
- ElectroCraftDataSourceDefinition
- ElectroCraftDataSchema
- ElectroCraftQueryDefinition
- ElectroCraftActionGraph
- ElectroCraftStateDefinition
- Roles/Policies
- Theme/DesignSystem
- project reusable definitions
- installed extension metadata

# Content entities — not project definitions
- internal records
- taxonomy terms
- relation edges
- users/auth data
- audit events
- form drafts

# Studio-only
- workspace preferences
- Studio Appearance
- Puck/Rete session histories
- AI generation sessions/drafts/history
- debug traces
- caches

# App registries — not copied wholesale into project
- ComponentRegistry
- FieldRegistry
- ActionNodeRegistry
- ConnectorRegistry
- CapabilityRegistry
- AppTemplateCatalog

# Engine state that must never become canonical
- Puck AppState/history/classes
- Rete node/socket classes/history
- TanStack Query cache
- TanStack Table row model
- Refine hook state
- Zustand store instance
- React Router route objects
- Expo Router objects
- AI SDK messages/tool/provider objects

# One-tree rule
ElectroCraftDocument handles:
screen/template/form/admin-screen/reusable-component.

# Data rule
DataSourceDefinition identifies source/adapter.
Internal DataSchema describes ElectroCraft Data.
External source schemas are connector metadata/snapshots, not converted blindly into internal Data Models.

# AI rule
AIArtifactDraft is a Studio proposal.
After Apply, normal canonical objects are created/updated.
There is no AI-specific Screen/Query/Form model.
