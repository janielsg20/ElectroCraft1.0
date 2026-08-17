# AI ARCHITECTURE — ElectroCraft Eighth Final

Route:
`Construir > Generar con IA`.

Primary provider:
Gemini.

# Invocation stack

AI Workbench
-> ElectroCraftAIOrchestrator
-> AIContextBuilder
-> Vercel AI SDK
-> @ai-sdk/google
-> Gemini

Direct `@google/genai`:
only a narrow capability escape hatch proven by F00.

# UI stack

Selected AI Elements:
- Conversation
- Message / MessageResponse
- PromptInput
- Tool
- Plan
- CodeBlock only when a real code preview requires it.

ElectroCraft:
- artifact selection;
- Context Inspector;
- privacy;
- Draft Preview;
- Diff;
- Validation;
- Apply.

Do not install AI Elements graph/canvas pieces that duplicate Rete.

# Deterministic artifact pipeline

1. user selects artifact type;
2. user writes instruction;
3. AIContextBuilder resolves only allowed context;
4. user can inspect `Ver lo que se enviará`;
5. AI SDK requests structured plan/output;
6. validate provider output with Zod;
7. execute allowlisted read/draft tools;
8. write AIDraftWorkspace only;
9. validate canonical references/capabilities/security;
10. render Preview;
11. show Diff;
12. user explicitly chooses `Aplicar cambios`;
13. AIApplyService revalidates base revision;
14. transaction writes canonical objects;
15. create Project Revision;
16. invalidate caches/open affected artifact.

# Tools

Allowed:
sanitized read, draft creation/update, validate, compatibility, preview, diff.

Forbidden:
Apply, raw DB, raw SQL, filesystem write, package install, extension install, deploy, secret access, arbitrary code execution.

# Context

Default minimal.

May include selected:
Screen/nodes, Theme/Tokens, Navigation, Models, Data Source schemas, Queries, State, Actions, Administration, Media, user files.

Never send:
secret values, full project by default, auth headers, unrelated private records.

# Images

Use current verified Gemini image capability.
Stage result as draft media.
Apply -> MediaBlobStore.

# Generated code

Never import/eval automatically.

Status:
`Requiere revisión de código`.

Pipeline:
scan -> dependency policy -> lint -> typecheck -> tests -> isolated build/sandbox when available -> explicit install.

# Offline

AI route can show history/drafts.
Generate disabled with Spanish explanation.
ElectroCraft remains otherwise functional.
