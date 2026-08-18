# AI PROVIDER BASELINE — M00.8

Reverified: 2026-08-17.
Status: `PROVISIONAL — code-generation scope; final live CI pending`.

## Product scope
Gemini in ElectroCraft is for generating and refining **code for components, plugins and sections**. Image generation is not a requirement of M00.8 and is not part of its closure gate.

## Primary stack
- `ai@7.0.48`
- `@ai-sdk/google@4.0.31`
- `zod@4.4.3`

AI SDK owns structured output, code/text generation, tool orchestration, bounded multi-step calls and streaming. `@ai-sdk/google` owns Google Generative AI transport. Zod owns portable validation.

## Narrow native adapter
- `@google/genai@2.15.0`
- Only `GeminiNativeCapabilityAdapter.probeStableInteractions()` is allowed in this POC.
- It uses Gemini API `v1` to prove a code-generation request through Interactions.
- It does not duplicate structured output, normal text/code generation, streaming or tool orchestration already owned by AI SDK.

## Runtime model profiles — session metadata only
- `Automático` -> `gemini-3.6-flash`
- `Rápido` -> `gemini-3.5-flash-lite`
- `Calidad` -> `gemini-3.6-flash`
- `Código` -> `gemini-3.6-flash`

Mappings are runtime/session metadata and must not be persisted as canonical project data. Canonical persistence stores only the logical profile.

## Current capability decision
- Structured plan: AI SDK `generateText` + `Output.object` + Zod.
- Code artifact: typed multi-file `CodeArtifactPoc` for `component | plugin | section`.
- Tools: AI SDK `tool`, `prepareStep`, `stopWhen: stepCountIs(3)`.
- Streaming: AI SDK `streamText` + AbortSignal for code Draft.
- Interactions v1: direct Google SDK probe only to validate the stable API surface for code generation.
- Secrets: server-side gateway only; the client contract contains no provider package or credential field.

## Security invariants
AI output is Draft-only. Generated artifacts reject traversal/absolute paths, duplicate paths, missing entry files and Gemini secret references. Model tools cannot Apply, write DB/SQL/files, execute arbitrary JS, install, deploy, delete projects or access secrets.

## Current official model rationale
Gemini 3.6 Flash is the current stable model explicitly documented for improved code generation and multi-step agentic workflows; Gemini 3.5 Flash-Lite remains the low-cost/fast profile. Model IDs remain replaceable runtime configuration.
