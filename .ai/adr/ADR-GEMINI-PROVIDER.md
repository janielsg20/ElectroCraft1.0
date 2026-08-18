# ADR — M00.8 Gemini provider POC

Status: `ACCEPTED / GREEN`
Date: 2026-08-17
Owner: F00 / M00.8

## Product decision
Gemini in ElectroCraft is for generating and refining code for **components, plugins and sections**. Image generation is not required and is not part of the M00.8 architecture or closure gate.

## Accepted architecture
ElectroCraft keeps one primary AI stack: AI SDK Core + `@ai-sdk/google` + Zod. ElectroCraft owns logical profile resolution, portable code-artifact contracts, allowlist/security, server-side gateway, Draft semantics and post-generation validation.

Direct `@google/genai` is retained only as a narrow adapter proving Gemini Interactions `v1` with a stateless code-generation request (`store:false`). It is not a second orchestration stack.

## Exact pins proven
- `ai@7.0.48`
- `@ai-sdk/google@4.0.31`
- `@google/genai@2.15.0`
- `zod@4.4.3`
- `typescript@6.0.3`

The committed lockfile + `npm ci` are the reproducibility gate.

## Model mapping
Canonical project data persists only `Automático | Rápido | Calidad | Código`. Resolved Gemini model IDs are runtime/session metadata and may change without project migrations. The coding profile proven by this POC resolves to `gemini-3.6-flash`.

## Code artifact contract
`CodeArtifactPoc` supports `component | plugin | section`, `entryFile`, one or more code files, dependency proposals, validation checks and a Draft-only flag. Gemini's provider response schema uses a normal boolean for compatibility; ElectroCraft then rejects `draftOnly !== true` at its boundary.

Generated code is rejected for traversal/absolute paths, duplicate paths, invalid entry references or Gemini-secret references. It is never executed or applied automatically.

## Gateway/tool decision
Client -> server gateway -> AI SDK Google provider -> Gemini. Client data cannot contain API keys/provider SDK objects. The real tool loop exposes sanitized context only. Apply, DB/SQL, arbitrary code execution, filesystem writes, install, deploy and secret access fail closed.

## Final evidence
Final GitHub Actions run `32088311808`, head `9f732e1715da3f6b953dec05223d22b2773b3225`, SUCCESS.

- static job `95565335277` -> SUCCESS;
- live Gemini job `95565379219` -> SUCCESS;
- `PASS_LIVE_GEMINI_CODE`;
- `PASS_LIVE_CLOSURE_GATE`;
- real generated component: 1 TSX file, 1609 bytes, SHA-256 `6805458a7e430a6ce49c664397b4514ed2ec325adb5a7c3e23ed8c6515cb6d18`;
- live artifact `9307469682`;
- static artifact `9307452584`.

## Frozen decision
M00.8 is complete. Future AI product work must preserve the code-generation purpose, server-only credentials, Draft/validation boundary and replaceable runtime model mapping. Image-generation capability may only be added by a separately owned future requirement; it is not inherited from M00.8.
