# GEMINI / AI SDK PROVIDER SPEC

# Default stack

- Vercel AI SDK Core.
- `@ai-sdk/google`.
- Gemini as default provider.

# Why

ElectroCraft should not maintain a provider abstraction that the AI SDK already provides.

The project persists logical profiles:
- Automático
- Rápido
- Calidad
- Imagen

It does not persist a Gemini model ID as canonical app data.

# Model resolution

At runtime/configuration:
1. query/verify current supported Gemini models;
2. map logical profile to an approved model;
3. record resolved model only in local AI session metadata.

Current model names are unstable and must be reverified before pinning.

# Structured output

Use AI SDK typed structured output with Zod-compatible schemas where supported.

Gemini structured schema limitations must be considered.
Avoid unnecessarily complex union-heavy schemas if the provider rejects them.
Split large generation into smaller typed artifacts when needed.

# Tools

Define tools through AI SDK tool APIs.
Tool inputs use Zod schemas.
Only AIToolRegistry-approved tools are exposed.

# Agent loop

Use ToolLoopAgent only for bounded iterative generation/refinement.

Configure:
- explicit stop condition;
- active tool subset;
- max steps;
- timeout;
- cancellation.

For critical project mutation planning use deterministic structured workflow, not open-ended autonomy.

# Gemini-native adapter

`GeminiNativeCapabilityAdapter` is optional.

Use direct `@google/genai` only if an approved required feature is not available through the pinned AI SDK Google provider.

The adapter must expose only the missing capability, for example `generateImageAdvanced`.
It must not duplicate text/tool/structured orchestration.

# Images

Prefer current Gemini native image models.
Do not design new architecture around deprecated Imagen models.

Image flow:
provider -> draft media staging -> preview -> user Apply -> MediaBlobStore.

# Grounding/search

Off by default.
User enables explicitly.
UI explains external network/data use.

# Errors — Spanish

- Proveedor de IA no configurado
- Sin conexión
- Credenciales no disponibles
- Límite de uso alcanzado
- Solicitud demasiado grande
- Respuesta incompleta
- Salida no válida
- Herramienta no permitida
- Generación cancelada
- El modelo seleccionado ya no está disponible

Technical provider details only in Debug.
