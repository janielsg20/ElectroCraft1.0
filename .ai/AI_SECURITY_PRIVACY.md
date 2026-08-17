# AI SECURITY / PRIVACY — ElectroCraft

# Credentials
Production client never contains Gemini/provider secrets.

Client -> AIGateway -> AI SDK/@ai-sdk-google -> Gemini.

# Context minimization
Default:
selected minimal context.

UI:
`Ver lo que se enviará`.

No full-project dump by default.

Data Source secrets are SecretRefs and are never resolved into model context.

# Prompt injection
Records, imported files, Web results and extension metadata are untrusted data.
They cannot grant tools/permissions.

# Tools
AI SDK tool request still passes:
allowlist + schema + permission + context policy + step limits.

Forbidden:
Apply, raw DB, SQL, filesystem write, install, deploy, secret read, arbitrary code execution.

# Generated code
Never eval/import/run automatically.
Quarantine -> scan -> dependency policy -> lint -> typecheck -> tests -> isolated build/sandbox when available -> explicit install.

# External grounding
Off by default.
Explicit user/provider policy required.

# History
No prompts / metadata-only / full-local.

# Apply boundary
Only user UI calls AIApplyService.
Draft -> final validation -> transaction -> Project Revision.

No model/tool path can bypass Apply.
