# ADR — M00.8 Gemini provider POC

Status: `PROVISIONAL — CODE GENERATION SCOPE; FINAL LIVE CI PENDING`
Date: 2026-08-17
Owner: F00 / M00.8

## Product decision
Gemini is required in ElectroCraft to generate and refine code for **components, plugins and sections**. Image generation is not required and is removed from the M00.8 architecture and closure gate.

## Decision under test
ElectroCraft keeps one main AI stack: AI SDK Core + `@ai-sdk/google` + Zod. The project owns logical profile resolution, portable code artifact contracts, allowlist/security, server-side gateway, Draft semantics and validation.

Direct `@google/genai` is retained only as a narrow diagnostic adapter proving Gemini Interactions `v1` with a code-generation request. It is not a second text/tools/structured stack.

## Exact pins
- `ai@7.0.48`
- `@ai-sdk/google@4.0.31`
- `@google/genai@2.15.0`
- `zod@4.4.3`
- `typescript@6.0.3`

The committed lockfile + `npm ci` are the reproducibility gate.

## Model mapping
Model IDs are runtime/session metadata. Canonical project data persists only `Automático | Rápido | Calidad | Código`. The current coding profile resolves to `gemini-3.6-flash` and must remain replaceable without migrations.

## Code artifact decision
Gemini returns a typed `CodeArtifactPoc` with `component | plugin | section`, `entryFile`, multi-file contents, dependency proposals, validation checks and `draftOnly: true`. Output is validated before it can become a future product Apply candidate.

## Gateway decision
Client request -> server gateway -> AI SDK Google provider -> Gemini. The client contract cannot carry an API key, provider SDK object or SecretRef value.

## Tool decision
The POC exposes sanitized context only for the real tool loop and verifies the broader allow/deny policy. `apply_to_project`, DB/SQL, arbitrary code execution, filesystem write, package/extension install, deploy and secrets fail closed.

## Closure gate
M00.8 remains open until GitHub Actions proves:
1. exact published package/lock graph;
2. TypeScript + tests + build;
3. real structured generation plan for code;
4. real multi-file code artifact generation;
5. bounded tool call;
6. real code streaming plus cancellation;
7. stable Interactions `v1` code probe;
8. client secret scan and code artifact safety validation;
9. no canonical model-ID persistence.

No missing secret, skipped live request or fixture-only provider result may be reported as GREEN.
