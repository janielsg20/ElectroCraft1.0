# M04.2 validation report

- Source commit: `dfde8acaea45ff7ee73348bacaa8be76354a100c`
- Runner: `ubuntu-latest` / Node `22.13.0`
- Overall: `RED`

| Gate | Exit code |
| --- | ---: |
| npm ci | 0 |
| Prettier write M04.2 surface | 0 |
| Prettier check M04.2 surface | 0 |
| npm run lint | 0 |
| npm run typecheck | 1 |
| npm run test:boundaries | 0 |
| targeted M04.2 Vitest | 0 |
| npm run test | 0 |
| npm run build | 0 |
| Playwright Chromium install | 0 |
| M04.2 two-tab leader handoff | 1 |

## Failure tail: typecheck

```text

> electrocraft@0.0.0-m01.5 typecheck
> tsc -p tsconfig.json --noEmit && tsc -p packages/domain/tsconfig.json --noEmit

packages/data-web/src/browser.ts(63,46): error TS2345: Argument of type 'string | undefined' is not assignable to parameter of type '"electrocraft-studio-storage" | undefined'.
  Type 'string' is not assignable to type '"electrocraft-studio-storage"'.
```

## Failure tail: browser

```text

Running 1 test using 1 worker

  ✘  1 tooling/playwright/m04-2-multitab-storage.spec.ts:20:3 › M04.2 PGlite multi-tab worker › shares one logical IndexedDB database and survives leader handoff (9.2s)
  ✘  2 tooling/playwright/m04-2-multitab-storage.spec.ts:20:3 › M04.2 PGlite multi-tab worker › shares one logical IndexedDB database and survives leader handoff (retry #1) (9.9s)


  1) tooling/playwright/m04-2-multitab-storage.spec.ts:20:3 › M04.2 PGlite multi-tab worker › shares one logical IndexedDB database and survives leader handoff 

    Error: expect(received).toContain(expected) // indexOf

    Expected value: "leader"
    Received array: ["follower", "follower"]

      35 |
      36 |     const roles = [firstDiagnostics.coordination?.role, secondDiagnostics.coordination?.role];
    > 37 |     expect(roles).toContain('leader');
         |                   ^
      38 |     expect(roles).toContain('follower');
      39 |
      40 |     const leaderPage = firstDiagnostics.coordination?.role === 'leader' ? first : second;
        at /home/runner/work/ElectroCraft1.0/ElectroCraft1.0/tooling/playwright/m04-2-multitab-storage.spec.ts:37:19

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results/m01-4/m04-2-multitab-storage-M04-c15ed-and-survives-leader-handoff/test-failed-2.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results/m01-4/m04-2-multitab-storage-M04-c15ed-and-survives-leader-handoff/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results/m01-4/m04-2-multitab-storage-M04-c15ed-and-survives-leader-handoff/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/m01-4/m04-2-multitab-storage-M04-c15ed-and-survives-leader-handoff/trace.zip
    Usage:

        npx playwright show-trace test-results/m01-4/m04-2-multitab-storage-M04-c15ed-and-survives-leader-handoff/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

    Retry #1 ───────────────────────────────────────────────────────────────────────────────────────

    Error: expect(received).toContain(expected) // indexOf

    Expected value: "leader"
    Received array: ["follower", "follower"]

      35 |
      36 |     const roles = [firstDiagnostics.coordination?.role, secondDiagnostics.coordination?.role];
    > 37 |     expect(roles).toContain('leader');
         |                   ^
      38 |     expect(roles).toContain('follower');
      39 |
      40 |     const leaderPage = firstDiagnostics.coordination?.role === 'leader' ? first : second;
        at /home/runner/work/ElectroCraft1.0/ElectroCraft1.0/tooling/playwright/m04-2-multitab-storage.spec.ts:37:19

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results/m01-4/m04-2-multitab-storage-M04-c15ed-and-survives-leader-handoff-retry1/test-failed-1.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results/m01-4/m04-2-multitab-storage-M04-c15ed-and-survives-leader-handoff-retry1/test-failed-2.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    Error Context: test-results/m01-4/m04-2-multitab-storage-M04-c15ed-and-survives-leader-handoff-retry1/error-context.md

    attachment #4: trace (application/zip) ─────────────────────────────────────────────────────────
    test-results/m01-4/m04-2-multitab-storage-M04-c15ed-and-survives-leader-handoff-retry1/trace.zip
    Usage:

        npx playwright show-trace test-results/m01-4/m04-2-multitab-storage-M04-c15ed-and-survives-leader-handoff-retry1/trace.zip

    ────────────────────────────────────────────────────────────────────────────────────────────────

  1 failed
    tooling/playwright/m04-2-multitab-storage.spec.ts:20:3 › M04.2 PGlite multi-tab worker › shares one logical IndexedDB database and survives leader handoff 
```
