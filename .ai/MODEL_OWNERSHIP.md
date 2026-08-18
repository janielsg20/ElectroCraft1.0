# MODEL OWNERSHIP — ElectroCraft

Purpose: prevent duplicate sources of truth and make serializer, migration, storage and exporter access explicit.

## Three ownership categories

### 1. Project Objects — persisted canonical configuration
Project Objects belong to the project schema and are versioned/migrated through `@electrocraft/domain`.

- `ElectroCraftProjectDefinition`
- `ElectroCraftDocument` (`screen`, `template`, `form`, `admin-screen`, `reusable-component`)
- `ElectroCraftDataSourceDefinition`
- `ElectroCraftDataSchema`
- `ElectroCraftQueryDefinition`
- `ElectroCraftActionGraph`
- `ElectroCraftStateDefinition`
- `ElectroCraftRole` / `ElectroCraftPermissionPolicy`
- `ElectroCraftRouteDefinition`
- `ElectroCraftNavigationDefinition`
- `ElectroCraftTheme`
- user-created registry definitions referenced by stable ID

ProjectDefinition stores refs and requirements; it never becomes a mega blob containing registries or content rows.

### 2. Application Registries — app-versioned definitions
Registries are owned by the running ElectroCraft application and are loaded/resolved by `@electrocraft/application`.

- ComponentDefinition registry
- FieldType registry
- ActionNode registry
- Provider registry
- ConnectorRegistry
- ElectroPlatformCapabilityRegistry
- core Blueprint catalog

Core/extension registry definitions are not copied into projects. Only `origin=user` definitions may be persisted separately and referenced through `userRegistryDefinitionRefs`.

### 3. Content / Runtime Entities — storage-owned data
Content entities are data, not project configuration.

- records
- taxonomy terms
- relation edges
- media metadata
- users/profile data
- audit events

They live in content/auth/media storage and are resolved by IDs. Exporters obtain only required content through resolver/manifest boundaries; ProjectDefinition never embeds complete record sets.

## Ownership matrix

| Model | Category | Storage authority | Serializer owner | Migration owner | Export access |
|---|---|---|---|---|---|
| ProjectDefinition | Project Object | canonical project | domain canonical serializer | domain MigrationRegistry | embedded |
| Document / Form / reusable component | Project Object | canonical project | domain canonical serializer | domain MigrationRegistry | embedded/ref |
| DataSource / DataSchema / Query | Project Object | canonical project | domain canonical serializer | domain MigrationRegistry | embedded |
| ActionGraph / State | Project Object | canonical project | domain canonical serializer | domain MigrationRegistry | embedded |
| Roles / Policies | Project Object | canonical project | domain canonical serializer | domain MigrationRegistry | embedded |
| Route / Navigation | Project Object | canonical project | domain canonical serializer | domain MigrationRegistry | embedded |
| Theme / Design System | Project Object | canonical project | domain canonical serializer | domain MigrationRegistry | embedded |
| ComponentDefinition / FieldType / ActionNode / Provider | Registry | application registry | application registry loader | app-version migration | stable refs |
| PlatformCapability | Registry | application registry | application registry loader | app-version migration | required capability refs/report |
| core Blueprint catalog | Registry | application registry | catalog loader | app-version migration | none after install |
| records / terms / relation edges | Content Entity | content storage | content adapter | content-schema migration | resolver |
| media metadata | Content Entity | media storage | media adapter | content-schema migration | MediaManifest |
| users/profile data | Content Entity | auth storage | auth adapter | auth/content migration | refs/sanitized resolver |
| audit events | Content Entity | audit storage | audit adapter | audit schema migration | none |

The executable source of truth for the complete 26-entry classification is `packages/domain/src/contracts/model-ownership.ts`.

## ProjectDefinition rule
- `themeRef` points to an ElectroCraftTheme object.
- `originBlueprint` is provenance only; the full BlueprintPackage remains external.
- `requiredCapabilities` and `targetCapabilityOverrides` express requirements/exceptions only.
- `userRegistryDefinitionRefs` may reference only definitions whose origin is `user`.
- complete registries and content collections are forbidden inside ProjectDefinition.

## Theme / Blueprint / Template rules
- Theme owns visual tokens only; never component trees, routes, queries, state or runtime objects.
- BlueprintPackage is versioned install material. After install, artifacts become normal canonical objects; ProjectDefinition retains only optional provenance.
- Template remains `ElectroCraftDocument kind=template`; there is no second ElectroTemplate tree.

## ExportIR rule
`ElectroCraftExportIR` is generated from Project Objects plus only the required sanitized/resolved content surface. It may carry a portable `MediaManifest`, form document refs and capability refs, but never a live registry, content store, cache or runtime engine object.

The target compiler receives the frozen IR revision plus a separate `TargetCompileContext`. Registry/core definitions are resolved by app/target adapters outside the canonical project snapshot.

## Engine state that must never become canonical
- Puck AppState/history/classes
- Rete node/socket classes/history
- TanStack Query cache
- TanStack Table row model
- Refine hook state
- Zustand store instance
- React Router / Expo Router runtime objects
- AI SDK messages/tool/provider objects
- Studio workspace preferences, debug traces and AI draft/history state

## One-tree and data rules
- ElectroCraftDocument handles screen/template/form/admin-screen/reusable-component.
- Internal DataSchema describes logical project data; content rows remain storage-owned entities.
- External source schemas are connector metadata/snapshots, not blindly converted into internal models.
- AIArtifactDraft is a Studio proposal; Apply creates/updates normal canonical objects.

## Contracts location rule
F01 fixed exactly 17 owner packages and assigned canonical contracts to `@electrocraft/domain`. Therefore the historical F02 path `packages/contracts/` is implemented as `packages/domain/src/contracts/`; do not create an 18th package.
