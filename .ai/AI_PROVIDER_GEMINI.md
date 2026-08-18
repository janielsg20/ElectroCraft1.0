# GEMINI / AI SDK PROVIDER SPEC

# Default stack
- Vercel AI SDK Core.
- `@ai-sdk/google`.
- Gemini as default provider.

# Primary product purpose
Gemini assists ElectroCraft in generating and refining **components, plugins and sections as code**. AI output is always Draft before any product-level Apply flow. Image generation is outside the current provider requirement.

The project persists logical profiles:
- Automático
- Rápido
- Calidad
- Código

It does not persist a Gemini model ID as canonical app data.

# Model resolution
At runtime/configuration:
1. verify current supported Gemini models;
2. map logical profile to an approved model;
3. record resolved model only in local AI session metadata.

# Structured code output
Use AI SDK typed structured output with Zod-compatible schemas.
The preferred artifact is a portable `CodeArtifact` containing:
- artifact type `component | plugin | section`;
- relative entry file;
- one or more typed code files;
- dependency proposals only, never automatic installs;
- validation checks;
- explicit `draftOnly: true`.

Validate provider output again at the ElectroCraft boundary. Reject path traversal, credential references and malformed cross-file entry references.

# Tools
Define tools through AI SDK tool APIs. Tool inputs use Zod schemas. Only AIToolRegistry-approved tools are exposed.
AI may read sanitized context, draft and validate. It may not Apply, write files/DB/SQL, execute arbitrary code, install packages/extensions, deploy or access secrets.

# Agent loop
Use bounded AI SDK tool loops only for iterative generation/refinement. Configure explicit stop conditions, active tool subset, max steps, timeout and cancellation.

# Gemini-native adapter
`GeminiNativeCapabilityAdapter` is optional. Use direct `@google/genai` only when an approved required API capability is not represented by the pinned AI SDK provider. In M00.8 it is restricted to a stable Interactions `v1` code-generation probe and must not become a second orchestration stack.

# Grounding/search
Off by default. User enables explicitly when a future code-generation flow genuinely needs external context; the UI must explain external network/data use.

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
