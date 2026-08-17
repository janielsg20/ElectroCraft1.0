# DATA SOURCE ARCHITECTURE

# Canonical definition

`ElectroCraftDataSourceDefinition`

Fields:
- id
- name
- kind
- adapterId
- environmentScope
- authRef
- config
- capabilitySnapshot
- schemaDiscoveryPolicy
- enabled

No secret values.

# Operations

`DataOperationDefinition`
- id
- sourceRef
- kind: read/create/update/delete/custom
- resource
- inputSchema
- outputSchema
- pagination
- cache hints
- capability requirements

# Core sources

## Internal ElectroCraft Data
PGlite/Drizzle generic records.
Offline.

## REST
Fetch-compatible adapter.
Manual or OpenAPI-imported operations.

## GraphQL
Schema/introspection when available.
Query/mutation definitions.

# Optional source packs

PostgreSQL/MySQL and other credential-bearing database drivers run through ConnectorGateway.
They are not bundled into Core.

# ConnectorGateway

Purpose:
- hide credentials;
- solve server-only connectors;
- solve CORS where configured;
- centralize rate/auth/proxy policy.

Project stores:
SecretRef and gateway config reference.

Project does not store:
API key/password/private cert.

# Runtime

Screen component
 -> Binding / Query
 -> DataSourceAdapter
 -> direct safe endpoint OR ConnectorGateway
 -> external/internal source

TanStack Query owns cache lifecycle.

# Admin

Refine gets an `ElectroCraftDataProviderAdapter` backed by the same DataSource/Query services.
Refine is a consumer, not canonical data architecture.

# AI

Gemini/AI generation may inspect source schemas only when the user includes them in context.
It receives sanitized definitions, not secrets.
