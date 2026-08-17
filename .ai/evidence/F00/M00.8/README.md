# F00 / M00.8 evidence — AI SDK + Gemini

State: `IN_PROGRESS — local source contract GREEN; published-package/live Gemini CI pending`.

## Local evidence
- `npm run verify-local` -> `PASS_LOCAL_CONTRACT_GATE`.
- 7 TypeScript source modules present.
- Node script syntax -> PASS.
- Full package typecheck is intentionally not claimed locally because this execution container cannot reach npm registry.

## Required CI gates
- npm registry + deterministic lockfile + exact pins;
- TypeScript and build against published package types;
- structured valid/invalid Zod tests;
- allowed/denied tool tests;
- stream complete/incomplete/error/cancel policy tests;
- gateway/client secret scan;
- real package API integration contract;
- live Gemini structured output;
- live bounded tool loop;
- live streaming;
- cancellation fail-closed;
- live Gemini image;
- direct `@google/genai` Interactions stable-v1 probe;
- final status `M00.8 Gemini Provider = success`.

## Secret gate
`GEMINI_API_KEY` must exist only as a GitHub Actions/server secret. If absent, live CI must fail with `BLOCKED_MISSING_GEMINI_API_KEY`; this is a real closure blocker, not a reason to skip the gate.
