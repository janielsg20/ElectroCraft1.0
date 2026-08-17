# DATA ARCHITECTURE — ElectroCraft

# Studio DB
PGlite + Drizzle behind multi-tab Worker.

Baseline persistent filesystem:
`idb://...` unless F00 proves a better supported option.

# Project tables

## projects
identity/status/current metadata.

## project_objects
objectId/kind/version/payload/checksum/updatedAt.

## project_revisions
cross-session checkpoint manifests.

## workspace_preferences
Studio-only layout/appearance/preferences.

# Internal Data Source tables

## records
generic modelId + JSON data + state metadata.

## taxonomy_terms
## record_terms
## relation_edges

## record_field_index
selective typed values for searchable/filterable/sortable/faceted fields only.

No dynamic table per field.

# Media
PGlite stores metadata.
MediaBlobStore stores bytes:
OPFS preferred + IndexedDB Blob fallback.

# Users/auth
Separate runtime/auth tables where local auth is enabled.
Credentials never part of ProjectDefinition.

# AI Studio-only tables
- ai_generation_sessions
- ai_artifact_drafts
- ai_usage_events
- ai_prompt_presets

Not normal project exports.

# External Data Sources
REST/GraphQL/connector packs are NOT mirrored automatically into PGlite.
Runtime queries go through DataSourceAdapter/Gateway.

Caching:
TanStack Query at runtime.

Optional local cache/sync requires an explicit future Offline Data Sync feature, not silent duplication.

# Secrets
Project stores SecretRef only.
SecretStore/Gateway stores values outside project.

# Incremental project save
dirty IDs -> validate -> deterministic serialize -> checksum -> transaction -> upsert dirty objects -> project timestamp -> commit.

# Revisions
manual/pre-import/pre-migration/export/AI-apply/extension-install/coarse-auto.

Undo is not revision.
