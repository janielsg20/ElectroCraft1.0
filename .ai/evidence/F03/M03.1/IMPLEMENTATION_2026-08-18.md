# M03.1 — Implementation evidence (2026-08-18)

Base: `main@0afa33651a677fb2a1d47cf45c38fa7b22df6239`.

## Engine/API verification
Official sources verified on 2026-08-18 and rechecked on 2026-08-19:
- shadcn/ui CLI v4 supports explicit `--base radix`; since July 2026 Base UI is the default but Radix remains fully supported.
- Radix recommends the unified, tree-shakeable `radix-ui` package.
- Lucide React is tree-shakeable and intended for direct named icon imports.
- Tailwind v4 + `@tailwindcss/vite` is the Vite integration used by this foundation.

Pinned/reverified stable versions:
- `radix-ui@1.6.7`
- `lucide-react@1.31.0`
- `tailwindcss@4.3.3`
- `@tailwindcss/vite@4.3.3`
- `class-variance-authority@0.7.1`
- `clsx@2.1.1`
- `tailwind-merge@3.6.0`

## Implemented in this overlay
- Replaced the earlier manual tooltip/dropdown/sheet/scroll/separator implementations with actual `radix-ui` primitives.
- shadcn-compatible `components.json` pinned to the current schema-supported `radix-nova` style, `cn()` utility, CVA Button and Input wrapper. The live official schema was rechecked on 2026-08-19 and explicitly includes `radix-nova`.
- Tailwind v4 semantic `@theme inline` mapping over ElectroCraft CSS variables.
- Tailwind source detection explicitly registers the shared design-system source with `@source` so monorepo execution does not depend on the Vite working directory.
- Typed Lucide semantic icon registry.
- Versioned portable design-system foundation config v1 with validator, v0→v1 migration, deterministic serialization and round-trip.
- Theme runtime with `light | dark | system` and High Density application attributes.
- Required Studio seams:
  - `apps/studio/src/shell/`
  - `apps/studio/src/i18n/`
  - `apps/studio/src/help/`
- Spanish-first navigation vocabulary and persistent `help.studio.shell`.
- React review: cheap derived theme label no longer uses `useMemo`; semantic Lucide component lookups are module-hoisted; M03.1-visible bootstrap/gallery copy is routed through the typed Spanish seam instead of new JSX hardcodes. Full i18next/react-i18next infrastructure remains correctly scoped to M03.10.
- Technical route `/__design-system` without advancing to the M03.2 AppShell.
- Unit, contract, integration, negative, migration/round-trip and real-browser Playwright coverage authored.
- shadcn package-local aliases use `package.json#imports` (`#components`, `#lib`, `#hooks`) so the CLI can target the owner without adding forbidden wildcard workspace aliases or deep workspace exports.
- Existing ElectroCraft owner invariants are preserved: `@electrocraft/design-system` still exposes only the root export and Studio consumes only that root.
- Root `package.json` now includes `test:m03-1` and brings design-system sources/config + the M03.1 workflow/verifier into the Prettier gate.
- Dedicated M03.1 GitHub Actions gate authored.
- El gate dedicado incluye bootstrap de lockfile no destructivo: `npm install --package-lock-only`, artifact `m03-1-lockfile-candidate`, ejecución completa con el lock candidato y fallo final deliberado si el lock no estaba versionado; nunca auto-commitea.
- Base CI and the dedicated M03.1 gate install Playwright Chromium before real browser coverage; the dedicated evidence upload runs even when the gate fails.
- Offline/closure structural verifier `tooling/scripts/verify-m03-1-design-system.mjs`; it now emits `tooling/dist/m03-1-design-system-report.json`, fails closed in CI when the exact lockfile graph is missing, and records the Playwright visual-validation contract.

## Local verification performed in ChatGPT runtime
- Offline M03.1 structural verifier: `PASS_M03_1_DESIGN_SYSTEM_STRUCTURE` with the explicit external-blocker override; generated report records the unresolved lockfile blocker instead of silently treating it as green.
- TypeScript/TSX syntax parse via TypeScript compiler API: `26` files, `0` syntax errors.
- JSON parse: `5/5` files passed.
- YAML parse: `2/2` workflows passed.
- Foundation runtime: schema v1, deterministic round-trip, v0→v1 migration and future-version fail-closed behavior passed in an executable transpiled check.

## Contract correction — 2026-08-19
A fresh audit of `.ai/microphases/M03_1.md` and the master prompt confirms that M03.1 requires real visual/E2E validation, responsive checks and keyboard/focus coverage, but **does not require** `React Web Page Design.svg` or any other external reference image. The v4 gate removes that non-canonical blocker. Visual evidence is the executable `/__design-system` Playwright suite at 360/768/1440 px plus keyboard/focus/theme/Dropdown/Sheet assertions.

## Environment blockers still preventing DONE
1. The ChatGPT container cannot reach the npm registry. Dependency installation and `package-lock.json` regeneration therefore cannot be performed here.
2. Because the lockfile cannot be regenerated, `npm ci`, full `npm run check`, Vite build and Playwright browser execution cannot be claimed green yet.

## Gate rule
M03.1 remains `ACTIVE` until:
1. the new package manifests are locked into `package-lock.json`;
2. `npm ci` succeeds;
3. the M03.1 workflow and full repository gate pass;
4. the design-system route is checked at mobile/tablet/desktop and with keyboard;

M03.2 must not start before those conditions are met.

## GitHub Actions evidence — run 32266099186 (2026-08-19)
Head: `1ab2ce7f9f1340cd07ad20c66370d65aa56d2bf9`.

Passed before the repository gate stopped:
- locked Node/npm toolchain;
- real npm lock generation;
- M03.1 verifier with `blockers=0`, `lockVerified=true`;
- `npm ci` (`625` packages);
- installed engine pins;
- dedicated M03.1 Vitest: `3` files, `15/15` tests;
- Playwright Chromium installation.

The repository gate then stopped at Prettier before semantic typecheck/build/E2E. Exactly 14 files were reported as needing formatting. No later gate stage is claimed green.

Artifacts recovered:
- `9370267875` — `m03-1-lockfile-candidate`; artifact digest `sha256:e8f3bc70e3d639cf840798eff418441a99db55593c36cea8fe3f2e9010d79f48`;
- `9370268489` — `m03-1-design-system-evidence`; artifact digest `sha256:a6100d24028f977c166437e6361622868bcf8314892a9e4d23e38ee1c5c4f91f`.

Recovered lock: lockfile v3, SHA-256 `1025aa726810d4fbbc313829ae59df9b4c5e85bf5f7ddb553daa754c75ca8789`. Overlay v5 versions this exact lock.

The v5 workflow additionally runs `npm run format` in the disposable Actions checkout, captures an exact formatting patch/tar artifact, then continues the full repository gate on the formatted tree. It still fails closed until that formatting diff is committed.
