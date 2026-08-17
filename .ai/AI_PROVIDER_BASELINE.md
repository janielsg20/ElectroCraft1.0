# AI PROVIDER BASELINE — M00.8

Reverified: 2026-08-17.
Status: `PROVISIONAL — static source contract ready; published-package + live Gemini CI pending`.

## Primary stack
- `ai@7.0.48`
- `@ai-sdk/google@4.0.31`
- `zod@4.4.3`

AI SDK owns structured output, tool orchestration, bounded multi-step calls, streaming and image abstraction. `@ai-sdk/google` owns Google Generative AI provider transport. Zod owns portable validation.

## Narrow native adapter
- `@google/genai@2.15.0`
- Only `GeminiNativeCapabilityAdapter.probeStableInteractions()` is allowed in this POC.
- It explicitly uses Gemini API `v1` to prove the stable Interactions API.
- It does not duplicate structured output, normal text generation, streaming or tool orchestration already owned by AI SDK.

## Runtime model profiles — session metadata only
- `Automático` -> `gemini-flash-latest`
- `Rápido` -> `gemini-3.5-flash-lite`
- `Calidad` -> `gemini-3.6-flash`
- `Imagen` -> `gemini-3.1-flash-image`

These mappings are reverified at runtime/configuration boundaries and **must not be persisted as canonical project data**. Canonical persistence stores only the logical profile.

## Current capability decision
- Structured output: AI SDK `generateText` + `Output.object` + Zod.
- Tools: AI SDK `tool`, `prepareStep`, `stopWhen: stepCountIs(3)`.
- Streaming: AI SDK `streamText` + AbortSignal.
- Image: AI SDK `generateImage` through the Google provider image factory; no Imagen dependency and no image-specific direct Google escape hatch.
- Interactions v1: direct Google SDK probe only to validate the stable API surface.
- Secrets: server-side gateway only; the client contract contains no provider package or credential field.

## Security invariants
AI can propose/read/draft/validate only. No Apply, raw DB, raw SQL, arbitrary JavaScript, filesystem write, install, deploy, project delete or secret access is exposed as a model tool.

## Primary references verified
- AI SDK current `Output.object`, tools/stepCountIs, streamText/AbortSignal and generateImage documentation.
- AI SDK Google Generative AI provider documentation for custom provider instances and Gemini capabilities.
- Google Gemini API version documentation: Interactions core is GA in stable `v1`.
- Google Gemini release notes/current model guide for Gemini 3.6 Flash, 3.5 Flash-Lite and Gemini 3.1 Flash Image.
