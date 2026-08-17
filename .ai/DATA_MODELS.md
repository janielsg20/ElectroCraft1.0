# DATA MODELS — ElectroCraft

# Project
ElectroCraftProjectDefinition:
id, name, version, app settings, target preferences, root navigation ref, theme ref, document refs, data source refs, schema refs, query refs, state refs, action refs, role refs, extension refs.

# Document
kind:
screen | template | form | admin-screen | reusable-component.

# Navigation
ElectroCraftNavigationDefinition:
root navigator, nested stack/tabs/drawer/modal/screen refs.

ElectroCraftRouteDefinition:
route name/path, screenRef, params schema, guards, deep-link metadata.

# Data Source
ElectroCraftDataSourceDefinition:
kind, adapterId, authRef, config, capabilities.

# Internal Data
ElectroCraftDataSchema:
models, fields, taxonomies, relations, record states/index flags.

# Query
ElectroCraftQueryDefinition:
sourceRef, operation/resource, params, conditions, sort, pagination, combine, cache.

# State
ElectroCraftStateDefinition:
name/type/scope/default/persistence/sensitivity.

# Action
ElectroCraftActionGraph:
nodes/edges/version/trigger metadata.
Rete data is mapped, not persisted as class instances.

# Permission
roles/capabilities/resource/field/route/action policies.

# Theme
portable semantic tokens/variants.

# Extension
manifest + declarative artifact refs + optional quarantined code modules.

# AI Studio-only
AIGenerationSession, AIArtifactDraft, AIUsageEvent, AIPromptPreset.
Not normal project export.

# Export
ElectroCraftExportIR:
immutable validated snapshot for a target.
