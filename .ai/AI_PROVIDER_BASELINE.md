# AI PROVIDER BASELINE — M00.8

Reverified: 2026-08-17.
Status: `FROZEN / GREEN`.

## Product scope
Gemini in ElectroCraft is for generating and refining **code for components, plugins and sections**. Image generation is not a requirement of M00.8 and is not part of its closure gate.

## Proven primary stack
- `ai@7.0.48`
- `@ai-sdk/google@4.0.31`
- `zod@4.4.3`

AI SDK owns structured output, code/text generation, tool orchestration, bounded multi-step calls and streaming. `@ai-sdk/google` owns Google Generative AI transport. Zod owns portable validation.

## Narrow native adapter
- `@google/genai@2.15.0`.
- Only `GeminiNativeCapabilityAdapter.probeStableInteractions()` is approved by M00.8.
- It uses Interactions API `v1`, `store:false`, solely to prove a stateless code-generation request.
- It must not duplicate structured output, normal code generation, streaming or tool orchestration already owned by AI SDK.

## Runtime model profiles — session metadata only
- `Automático` -> `gemini-3.6-flash`
- `Rápido` -> `gemini-3.5-flash-lite`
- `Calidad` -> `gemini-3.6-flash`
- `Código` -> `gemini-3.6-flash`

Canonical persistence stores only the logical profile, never a concrete model ID.

## Proven capabilities
- structured generation plan through AI SDK `generateText` + `Output.object` + Zod;
- real typed `CodeArtifactPoc` for `component | plugin | section`;
- bounded tool loop with sanitized context;
- streamed code + AbortSignal cancellation;
- stateless Interactions `v1` code probe;
- server-only secret boundary;
- generated-code post-validation and fail-closed policy.

## Security invariants
AI output is Draft-only. Generated artifacts reject traversal/absolute paths, duplicate paths, missing entry files, Gemini secret references and `draftOnly=false`. Model tools cannot Apply, write DB/SQL/files, execute arbitrary JS, install, deploy, delete projects or access secrets.

## Final CI source of truth
Run `32088311808`, head `9f732e1715da3f6b953dec05223d22b2773b3225`, SUCCESS. Live output includes `PASS_LIVE_GEMINI_CODE` and closure includes `PASS_LIVE_CLOSURE_GATE`.
