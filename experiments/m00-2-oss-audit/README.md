# M00.2 — OSS responsibility audit fixture

Purpose: make the F00/M00.2 ownership decision executable without creating product code or a parallel subsystem.

## Commands

```bash
npm run lint
npm run typecheck
npm test
npm run integration
npm run build
```

This fixture intentionally has **zero npm dependencies** so the audit is reproducible in the constrained execution environment. The real storage integration uses the SQLite engine bundled with Node 22 via `node:sqlite`; it validates persistence, transactions and error propagation for the audited native SQLite lane.

M00.2 is an ownership/API/license/stability audit. It does **not** steal the dedicated engine POCs from later F00 microphases:
- M00.3 executes the real Puck Composition editor POC.
- M00.4 executes the real PGlite/Drizzle Studio DB POC.
- M00.6 executes the real Rete workflow POC.
- M00.7 executes the real Expo native runtime POC.
- M00.8 executes the real AI SDK/Gemini POC.

The package-specific PGlite/Drizzle runtime smoke is therefore not falsely claimed here; their official API/ownership is audited here and their executable database POC remains M00.4 exactly as the master plan prescribes.
