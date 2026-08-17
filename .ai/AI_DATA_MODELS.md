# AI DATA MODELS — ElectroCraft Studio-only

# AIGenerationRequest
- id
- artifactKind
- instruction
- contextRefs[]
- providerKey logical
- modelProfile
- targetPlatforms[]
- reuseIntent
- allowedToolIds[]
- privacyPolicyRef
- baseProjectRevision
- locale = es

No provider response object is stored here.

# AIGenerationPlan
- schemaVersion
- artifactKind
- title
- summary
- assumptions[]
- dependencies[]
- operations[]
- requestedTools[]
- targetCapabilities[]
- warnings[]

# AIChangeOperation
- create/update project object draft
- create/update record draft
- stage media
- create reusable artifact draft
- create extension draft

Delete:
off by default and requires explicit destructive user intent/policy.

# AIArtifactDraft
- draftId
- sessionId
- kind
- title
- baseRevision
- proposed objects/patches
- stagedMediaRefs
- validation
- compatibility
- origin
- status
- timestamps

# AIOrigin
- provider logical ID
- modelProfile
- resolvedModelId optional diagnostic
- interaction/session metadata optional
- generatedAt

Never key/token/secret.

# AIValidationReport
Groups:
structure, references, data, navigation, permissions, compatibility, security, code, warnings.

Severity:
info/warning/blocker.

# Studio persistence
ai_generation_sessions
ai_artifact_drafts
ai_usage_events
ai_prompt_presets.

Not normal app export.
