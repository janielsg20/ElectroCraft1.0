# ADR — M00.8 Gemini provider POC

Status: `PROVISIONAL — LOCAL CONTRACT GREEN; PUBLISHED/LIVE CI PENDING`
Date: 2026-08-17
Owner: F00 / M00.8

## Decision under test
ElectroCraft keeps one AI provider/orchestration stack: AI SDK Core + `@ai-sdk/google` + Zod. The project owns only the logical profile resolver, allowlist/security boundary, server-side gateway, Draft semantics and validation.

Direct `@google/genai` is retained only as a narrow diagnostic adapter proving Gemini Interactions on stable `v1`. It is not a second text/tools/structured stack.

## Exact pins
- `ai@7.0.48`
- `@ai-sdk/google@4.0.31`
- `@google/genai@2.15.0`
- `zod@4.4.3`
- `typescript@6.0.3`

The committed lockfile and `npm ci` become the reproducibility gate after the first Actions bootstrap run.

## Model mapping
Model IDs are runtime/session metadata. Canonical project data persists only `Automático | Rápido | Calidad | Imagen`.

## Image decision
Gemini native image generation is covered through AI SDK, so no image-generation escape hatch is justified. The POC uses current Gemini Image rather than deprecated/shut-down Imagen models.

## Gateway decision
Production-shaped boundary: client request -> server gateway -> AI SDK Google provider -> Gemini. The client contract cannot carry an API key, provider SDK object or SecretRef value.

## Tool decision
The POC exposes only a sanitized read tool for the real loop and separately verifies the broader allow/deny policy. `apply_to_project`, DB/SQL, code execution, filesystem, package/extension install, deploy and secrets fail closed.

## Closure gate
M00.8 remains open until GitHub Actions proves:
1. exact published package/lock graph;
2. TypeScript + tests + build;
3. real structured output;
4. bounded tool call;
5. real streaming plus cancellation handling;
6. real Gemini image response with sanitized evidence;
7. stable Interactions `v1` native probe;
8. client secret scan;
9. no canonical model-ID persistence.

No missing Gemini secret, skipped live call or fixture-only provider result may be reported as GREEN.
