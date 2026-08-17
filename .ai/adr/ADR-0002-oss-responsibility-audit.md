# ADR-0002 — OSS responsibility audit

- Status: Accepted
- Date: 2026-08-17
- Phase/Microphase: F00 / M00.2

## Decision
ElectroCraft adopts the engine ownership and target boundaries encoded in `experiments/m00-2-oss-audit/engine-audit.json`. Existing public engine capabilities are reused; ElectroCraft implements canonical mapping, configuration, adapters, UX, capability analysis and exporters rather than parallel engines.

## Critical 2026 corrections
- shadcn/ui now defaults new projects to Base UI; Radix remains fully supported, so ElectroCraft selects Radix explicitly rather than depending on an upstream default.
- Gemini Interactions is GA in API `v1` and recommended for new projects; GenAI SDK preview access still defaults to `v1beta`, so stable/preview lanes are explicit capability choices.
- TanStack Table v9 is beta; ElectroCraft remains on the stable line until an owning phase explicitly opts in.
- dnd-kit is in a package/API migration from legacy `@dnd-kit/core` toward `@dnd-kit/react`; the owning POC pins one surface and does not rebuild Puck authoring.
- Expo SQLite is native-stable while web support is alpha.
- PGlite official tag/package 0.5.5 supersedes the earlier 0.5.4 observation; M00.4 re-verifies the exact package before its real DB POC.

## Ownership boundaries
- Puck owns visual authoring; Puck AI does not own ElectroCraft AI.
- Refine is restricted to Administration; TanStack Query/Table, RHF, Zod and RQB retain specialized ownership.
- Rete/Tiptap/Zustand own workflows/rich text/runtime state respectively.
- AI SDK + Google provider remains primary; `@google/genai` is capability-scoped. AI mutation is Draft -> explicit Apply.
- Expo/Router/SQLite are target/runtime concerns, not canonical model owners.
- Preview/experimental APIs are capability-gated.

## Executable audit strategy
M00.2 is the ownership/API/license/stability audit, not the engine implementation POC. Its isolated fixture executes:
- contract and source-matrix checks for all audited engines;
- deny-by-default auth/permission and SecretRef security tests;
- a real SQLite storage engine round-trip, transaction rollback and SQL-error diagnostic through Node 22 `node:sqlite` as representative native-storage evidence;
- exact boundary tests proving M00.3 owns the Puck POC and M00.4 owns the real PGlite/Drizzle Studio DB POC.

The package registry is unavailable in this execution environment, so M00.2 does not make a false claim that npm PGlite/Drizzle packages were executed. Their real engine execution remains exactly where the master plan assigns it: M00.4. This is a scope-preserving adaptation, not a waived product gate; M00.11 still prohibits entering F01 if the PGlite POC fails.

## Security
Credentials remain SecretRefs. The generic permission adapter is deny-by-default, rejects raw secret payloads and unsafe prototype keys, strips secret fields before policy evaluation, fails closed on policy errors, and is covered by allow/deny/error/security tests.

## Evidence
`.ai/evidence/F00/M00.2/` and `experiments/m00-2-oss-audit/`.
