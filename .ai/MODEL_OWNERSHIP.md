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
- ElectroCraftRole / ElectroCraftPermissionPolicy
- ElectroCraftTheme
- user-created ElectroCraftRegistryDefinition objects referenced by the project
- installed extension metadata

# ProjectDefinition stores references/requirements, not registries
- `themeRef` points to an ElectroCraftTheme object.
- `originBlueprint` is optional provenance only; the full BlueprintPackage is external.
- `requiredCapabilities` and `targetCapabilityOverrides` express project requirements/target exceptions.
- `userRegistryDefinitionRefs` may reference only definitions whose origin is `user`.
- CapabilityRegistry, ComponentRegistry, FieldRegistry, ActionRegistry and ProviderRegistry are never copied wholesale into ProjectDefinition.

# Theme rule
ElectroCraftTheme owns visual design only:
- tokens
- typography
- variants
- spacing
- radius
- shadows
- motion

Theme must not own component trees, routes, queries, state, actions or runtime engine objects.

# Blueprint rule
ElectroCraftBlueprintPackage is external/versioned install material.
A Blueprint may declare artifacts and required capabilities, but after install its artifacts are normal canonical objects.
ProjectDefinition preserves only optional `originBlueprint` provenance.
Install planning/conflicts/rollback belong to application, not to persisted project JSON.

# Template rule
There is no second ElectroTemplate model.
Template remains `ElectroCraftDocument kind=template` with `templateMeta` and Display Conditions.

# Registry rule
Application registries:
- ComponentRegistry
- FieldRegistry
- ActionRegistry
- ProviderRegistry
- ConnectorRegistry
- ElectroPlatformCapabilityRegistry

Core/extension definitions live in those registries. Only user-created registry definitions are eligible to persist as project objects.
Registry instances, Maps, callbacks and engine/provider objects are runtime-only.

# Capability rule
Capability definitions live in the versioned application registry.
The project stores required capability IDs and explicit target overrides only.
The analyzer emits a neutral `supported | adapted | blocked` report.
ExportIR consumes the report, not the live registry.

# Contracts location rule
F01 fixed exactly 17 owner packages and assigned canonical contracts to `@electrocraft/domain`.
Therefore the historical F02 map entry `packages/contracts/` is implemented as `packages/domain/src/contracts/`.
Do not create an 18th `@electrocraft/contracts` package or duplicate canonical schemas.

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
- ActionRegistry
- ProviderRegistry
- ConnectorRegistry
- ElectroPlatformCapabilityRegistry
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
