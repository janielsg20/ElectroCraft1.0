# M04.1 validation report

- Event commit: `8d03646dc08b81157d4560e2f3d926cce7260cec`
- Checked-out branch head: `43c508d79bb8d1aea1ed83b83c4025ea15be4fb4`
- Runner: `ubuntu-latest` / Node `22.13.0`
- Formatting: Prettier --write applied before validation
- Overall: `RED`

| Gate | Exit code |
| --- | ---: |
| npm ci | 0 |
| Prettier write M04.1 surface | 0 |
| Prettier check M04.1 surface | 0 |
| npm run lint | 0 |
| npm run typecheck | 0 |
| npm run test:boundaries | 0 |
| targeted M04.1 Vitest | 0 |
| npm run test | 1 |
| npm run build | 0 |
| Playwright Chromium install | 0 |
| M04.1 browser storage smoke | 1 |

## Failure tail: full-test

```text
  ---
  duration_ms: 0.202449
  ...
# Subtest: Responsive Palette uses 2 columns only when useful and supports mobile
ok 14 - Responsive Palette uses 2 columns only when useful and supports mobile
  ---
  duration_ms: 0.274594
  ...
# Subtest: Unsupported insertion remains a visible diagnostic
ok 15 - Unsupported insertion remains a visible diagnostic
  ---
  duration_ms: 0.267414
  ...
# Subtest: M03.8 continuity remains GREEN before later F03 microphases advance
ok 16 - M03.8 continuity remains GREEN before later F03 microphases advance
  ---
  duration_ms: 0.425957
  ...
# Subtest: root exposes the six required M01.3 quality scripts
ok 17 - root exposes the six required M01.3 quality scripts
  ---
  duration_ms: 1.912908
  ...
# Subtest: toolchain pins are exact and typescript-eslint is intentionally absent with TypeScript 7
ok 18 - toolchain pins are exact and typescript-eslint is intentionally absent with TypeScript 7
  ---
  duration_ms: 1.341056
  ...
# Subtest: ESLint owns correctness rules while Prettier owns formatting
ok 19 - ESLint owns correctness rules while Prettier owns formatting
  ---
  duration_ms: 0.523101
  ...
# Subtest: Vitest is split into unit, contract and integration projects
ok 20 - Vitest is split into unit, contract and integration projects
  ---
  duration_ms: 0.525965
  ...
# Subtest: Playwright CI policy forbids accidental focused tests and is deterministic
ok 21 - Playwright CI policy forbids accidental focused tests and is deterministic
  ---
  duration_ms: 0.270218
  ...
# Subtest: negative: no second TypeScript lint engine is introduced behind ESLint
ok 22 - negative: no second TypeScript lint engine is introduced behind ESLint
  ---
  duration_ms: 0.312481
  ...
# Subtest: empty functional repository fixture contains all engine entrypoints
ok 23 - empty functional repository fixture contains all engine entrypoints
  ---
  duration_ms: 0.369013
  ...
# Subtest: root TypeScript configuration is strict and aliases only public workspace roots
ok 24 - root TypeScript configuration is strict and aliases only public workspace roots
  ---
  duration_ms: 31.966459
  ...
# Subtest: negative: TypeScript 7 rejects reintroducing baseUrl
ok 25 - negative: TypeScript 7 rejects reintroducing baseUrl
  ---
  duration_ms: 18.056451
  ...
# Subtest: negative: domain cannot import React, Puck, Drizzle, Expo, DOM or filesystem engines
ok 26 - negative: domain cannot import React, Puck, Drizzle, Expo, DOM or filesystem engines
  ---
  duration_ms: 9.212512
  ...
# Subtest: negative: deep workspace imports are rejected even when the package root is allowed
ok 27 - negative: deep workspace imports are rejected even when the package root is allowed
  ---
  duration_ms: 7.066376
  ...
# Subtest: negative: cross-package relative imports are rejected
ok 28 - negative: cross-package relative imports are rejected
  ---
  duration_ms: 7.546237
  ...
# Subtest: i18n may read only its declared repository-owned Spanish catalog root
ok 29 - i18n may read only its declared repository-owned Spanish catalog root
  ---
  duration_ms: 8.473713
  ...
# Subtest: negative: application cannot depend on runtime or adapter packages
ok 30 - negative: application cannot depend on runtime or adapter packages
  ---
  duration_ms: 8.904729
  ...
# Subtest: every workspace package exposes only its public root entry
ok 31 - every workspace package exposes only its public root entry
  ---
  duration_ms: 6.605581
  ...
# Subtest: workspace owns exactly 18 stable packages and two apps
not ok 32 - workspace owns exactly 18 stable packages and two apps
  ---
  duration_ms: 19.208899
  location: '/home/runner/work/ElectroCraft1.0/ElectroCraft1.0/tooling/test/workspace-boundaries.test.mjs:15:1'
  failureType: 'testCodeFailure'
  error: |-
    Expected values to be strictly equal:
    
    19 !== 18
    
  code: 'ERR_ASSERTION'
  name: 'AssertionError'
  expected: 18
  actual: 19
  operator: 'strictEqual'
  stack: |-
    TestContext.<anonymous> (file:///home/runner/work/ElectroCraft1.0/ElectroCraft1.0/tooling/test/workspace-boundaries.test.mjs:17:10)
    Test.runInAsyncScope (node:async_hooks:211:14)
    Test.run (node:internal/test_runner/test:931:25)
    Test.start (node:internal/test_runner/test:829:17)
    startSubtestAfterBootstrap (node:internal/test_runner/harness:296:17)
  ...
# Subtest: i18n is a stable adapter package and Studio is its only current app consumer
ok 33 - i18n is a stable adapter package and Studio is its only current app consumer
  ---
  duration_ms: 11.702821
  ...
# Subtest: domain remains framework-free with Zod as its only external boundary dependency
ok 34 - domain remains framework-free with Zod as its only external boundary dependency
  ---
  duration_ms: 9.81505
  ...
# Subtest: negative: a domain to editor dependency is rejected
ok 35 - negative: a domain to editor dependency is rejected
  ---
  duration_ms: 15.086336
  ...
# Subtest: native runtime and native preview do not depend on DOM/editor packages
ok 36 - native runtime and native preview do not depend on DOM/editor packages
  ---
  duration_ms: 9.079386
  ...
# Subtest: exporters depend on ExportIR/contracts, not Studio UI or runtimes
ok 37 - exporters depend on ExportIR/contracts, not Studio UI or runtimes
  ---
  duration_ms: 6.385006
  ...
# Subtest: native source/build/config fixture is complete and reproducible
ok 38 - native source/build/config fixture is complete and reproducible
  ---
  duration_ms: 0.346941
  ...
# Subtest: Spanish architecture help descriptor is registered as a fixture
ok 39 - Spanish architecture help descriptor is registered as a fixture
  ---
  duration_ms: 0.187196
  ...
1..39
# tests 39
# suites 0
# pass 38
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 296.330961
```

## Failure tail: browser

```text

Running 3 tests using 1 worker

  ✓  1 tooling/playwright/m04-1-storage.spec.ts:4:3 › M04.1 almacenamiento local real › initializes the browser database behind Settings without exposing engine internals (8.3s)
  ✓  2 tooling/playwright/m04-1-storage.spec.ts:30:3 › M04.1 almacenamiento local real › saves and reopens a project through the application runtime after reload (11.2s)
  ✘  3 tooling/playwright/m04-1-storage.spec.ts:66:3 › M04.1 almacenamiento local real › keeps storage diagnostics usable on mobile without horizontal overflow (7.7s)
  ✘  4 tooling/playwright/m04-1-storage.spec.ts:66:3 › M04.1 almacenamiento local real › keeps storage diagnostics usable on mobile without horizontal overflow (retry #1) (7.9s)


  1) tooling/playwright/m04-1-storage.spec.ts:66:3 › M04.1 almacenamiento local real › keeps storage diagnostics usable on mobile without horizontal overflow 

    Error: expect(received).toBeGreaterThanOrEqual(expected)

    Expected: >= 36
    Received:    28

      78 |     const repair = storage.getByRole('button', { name: 'Revisar' });
      79 |     const repairBox = await repair.boundingBox();
    > 80 |     expect(repairBox?.height ?? 0).toBeGreaterThanOrEqual(36);
         |                                    ^
      81 |
      82 |     const metrics = await page.evaluate(() => ({
      83 |       scrollWidth: document.documentElement.scrollWidth,
        at /home/runner/work/ElectroCraft1.0/ElectroCraft1.0/tooling/playwright/m04-1-storage.spec.ts:80:36

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results/m01-4/m04-1-storage-M04-1-almace-7f09b-without-horizontal-overflow/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results/m01-4/m04-1-storage-M04-1-almace-7f09b-without-horizontal-overflow/error-context.md

    attachment #3: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/m01-4/m04-1-storage-M04-1-almace-7f09b-without-horizontal-overflow/trace.zip
    Usage:

        npx playwright show-trace test-results/m01-4/m04-1-storage-M04-1-almace-7f09b-without-horizontal-overflow/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

    Retry #1 ───────────────────────────────────────────────────────────────────────────────────────

    Error: expect(received).toBeGreaterThanOrEqual(expected)

    Expected: >= 36
    Received:    28

      78 |     const repair = storage.getByRole('button', { name: 'Revisar' });
      79 |     const repairBox = await repair.boundingBox();
    > 80 |     expect(repairBox?.height ?? 0).toBeGreaterThanOrEqual(36);
         |                                    ^
      81 |
      82 |     const metrics = await page.evaluate(() => ({
      83 |       scrollWidth: document.documentElement.scrollWidth,
        at /home/runner/work/ElectroCraft1.0/ElectroCraft1.0/tooling/playwright/m04-1-storage.spec.ts:80:36

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results/m01-4/m04-1-storage-M04-1-almace-7f09b-without-horizontal-overflow-retry1/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results/m01-4/m04-1-storage-M04-1-almace-7f09b-without-horizontal-overflow-retry1/error-context.md

    attachment #3: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/m01-4/m04-1-storage-M04-1-almace-7f09b-without-horizontal-overflow-retry1/trace.zip
    Usage:

        npx playwright show-trace test-results/m01-4/m04-1-storage-M04-1-almace-7f09b-without-horizontal-overflow-retry1/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    tooling/playwright/m04-1-storage.spec.ts:66:3 › M04.1 almacenamiento local real › keeps storage diagnostics usable on mobile without horizontal overflow 
  2 passed (39.9s)
```
