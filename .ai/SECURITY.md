# SECURITY — ElectroCraft Eighth Final

# Imports/project
schema versions, checksums, ZIP traversal, safe paths, migrations.

# Data Sources
SecretRef only.
ConnectorGateway for secret/server operations.
Validate URLs, headers, operation input, response limits/timeouts.

# Query
allowlisted operators/identifiers.
Parameterize data values.
Fail closed on unsupported rule.

# Internal Data
transactions, schema validation, permission enforcement.

# Media
MIME/signature, size, SVG sanitization, safe file names, usage-aware delete.

# Authentication
secure password/session target adapters.
Route/resource/record/field/action enforcement.
Visibility is not security.

# AI
no key in client/project/export.
minimal context.
tool allowlist.
prompt injection treated as data.
Draft only.
Apply host-side.
code quarantine.

# Capacitor
no secret in bundled Web assets.
plugin permissions generated only when used.
secure storage strategy for sensitive runtime credentials/session tokens.

# LAMP
Slim error details off in production.
Slim-CSRF for browser mutations.
PDO prepared statements.
safe dynamic identifier allowlists.
password_hash/password_verify.
secure cookies/sessions.
escape output.
upload validation.
`.env` values outside artifact/project.

# WordPress
nonce where applicable.
capability check before protected mutation.
sanitize + validate input.
context-correct escape output.
REST permission_callback.
prepared `$wpdb` statements for custom SQL.
safe activation/migrations.
non-destructive uninstall default.

# Generated artifact scanning
no Studio secrets/history.
no hardcoded provider credentials.
dependency/security scan appropriate to target.
