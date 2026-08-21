# M04.2 validation report

- Source commit: `da72e8f1724763a5bbd36449148d0bd1d25c1b5d`
- Runner: `ubuntu-latest` / Node `22.13.0`
- Overall: `RED`

| Gate | Exit code |
| --- | ---: |
| npm ci | 0 |
| Prettier write M04.2 surface | 0 |
| Prettier check M04.2 surface | 0 |
| npm run lint | 0 |
| npm run typecheck | 0 |
| npm run test:boundaries | 0 |
| targeted M04.2 Vitest | 0 |
| npm run test | 0 |
| npm run build | 0 |
| Playwright Chromium install | 0 |
| M04.2 two-tab leader handoff | 1 |

## Failure tail: browser

```text

Running 1 test using 1 worker

  ✘  1 tooling/playwright/m04-2-multitab-storage.spec.ts:20:3 › M04.2 PGlite multi-tab worker › shares one logical IndexedDB database and survives leader handoff (30.3s)
  ✘  2 tooling/playwright/m04-2-multitab-storage.spec.ts:20:3 › M04.2 PGlite multi-tab worker › shares one logical IndexedDB database and survives leader handoff (retry #1) (30.7s)


  1) tooling/playwright/m04-2-multitab-storage.spec.ts:20:3 › M04.2 PGlite multi-tab worker › shares one logical IndexedDB database and survives leader handoff 

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: "follower,leader"
    Received: "follower,follower"

    Call Log:
    - Test timeout of 30000ms exceeded

      42 |         { timeout: 30_000 },
      43 |       )
    > 44 |       .toBe('follower,leader');
         |        ^
      45 |
      46 |     const [settledFirst, settledSecond] = await Promise.all([initializeStorage(first), initializeStorage(second)]);
      47 |     const leaderPage = settledFirst.coordination?.role === 'leader' ? first : second;
        at /home/runner/work/ElectroCraft1.0/ElectroCraft1.0/tooling/playwright/m04-2-multitab-storage.spec.ts:44:8

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

    Error: expect(received).toBe(expected) // Object.is equality

    Expected: "follower,leader"
    Received: "follower,follower"

    Call Log:
    - Test timeout of 30000ms exceeded

      42 |         { timeout: 30_000 },
      43 |       )
    > 44 |       .toBe('follower,leader');
         |        ^
      45 |
      46 |     const [settledFirst, settledSecond] = await Promise.all([initializeStorage(first), initializeStorage(second)]);
      47 |     const leaderPage = settledFirst.coordination?.role === 'leader' ? first : second;
        at /home/runner/work/ElectroCraft1.0/ElectroCraft1.0/tooling/playwright/m04-2-multitab-storage.spec.ts:44:8

    attachment #1: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results/m01-4/m04-2-multitab-storage-M04-c15ed-and-survives-leader-handoff-retry1/test-failed-2.png
    ────────────────────────────────────────────────────────────────────────────────────────────────

    attachment #2: screenshot (image/png) ──────────────────────────────────────────────────────────
    test-results/m01-4/m04-2-multitab-storage-M04-c15ed-and-survives-leader-handoff-retry1/test-failed-1.png
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
