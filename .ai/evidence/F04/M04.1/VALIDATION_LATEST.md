# M04.1 validation report

- Tested commit: `ec96211397b04148c727d345c485d3f2c8d29d82`
- Runner: `ubuntu-latest` / Node `22.13.0`
- Overall: `RED`

| Gate | Exit code |
| --- | ---: |
| npm ci | 0 |
| Prettier M04.1 surface | 1 |
| npm run typecheck | 1 |
| npm run test:boundaries | 0 |
| targeted M04.1 Vitest | 0 |
| npm run build:studio | 0 |

## Failure tail: format

```text
Checking formatting...
[[33mwarn[39m] packages/data-web/src/repository.ts
[[33mwarn[39m] apps/studio/src/features/projects/project-storage-runtime.ts
[[33mwarn[39m] apps/studio/src/features/projects/storage-settings.tsx
[[33mwarn[39m] apps/studio/src/shell/studio-topbar.tsx
[[33mwarn[39m] tooling/vitest/contract/project-storage-boundary.test.ts
[[33mwarn[39m] tooling/vitest/integration/project-storage-pglite.test.ts
[[33mwarn[39m] Code style issues found in 6 files. Run Prettier with --write to fix.
```

## Failure tail: typecheck

```text

> electrocraft@0.0.0-m01.5 typecheck
> tsc -p tsconfig.json --noEmit && tsc -p packages/domain/tsconfig.json --noEmit

packages/data-web/src/browser.ts(63,26): error TS2339: Property 'usage' does not exist on type 'StorageEstimate | {}'.
  Property 'usage' does not exist on type '{}'.
packages/data-web/src/browser.ts(64,26): error TS2339: Property 'quota' does not exist on type 'StorageEstimate | {}'.
  Property 'quota' does not exist on type '{}'.
packages/data-web/src/browser.ts(90,26): error TS2345: Argument of type '[PGliteWorker, { schema: typeof import("/home/runner/work/ElectroCraft1.0/ElectroCraft1.0/packages/data-web/src/schema"); }]' is not assignable to parameter of type '[] | [DrizzleConfig<typeof import("/home/runner/work/ElectroCraft1.0/ElectroCraft1.0/packages/data-web/src/schema")> & ({ connection?: string | (PGliteOptions<Extensions> & { ...; }) | undefined; } | { ...; })] | [...] | [...]'.
  Type '[PGliteWorker, { schema: typeof import("/home/runner/work/ElectroCraft1.0/ElectroCraft1.0/packages/data-web/src/schema"); }]' is not assignable to type '[string | PGlite, DrizzleConfig<typeof import("/home/runner/work/ElectroCraft1.0/ElectroCraft1.0/packages/data-web/src/schema")>]'.
    Type at position 0 in source is not compatible with type at position 0 in target.
      Type 'PGliteWorker' is not assignable to type 'string | PGlite'.
        Type 'PGliteWorker' is not assignable to type 'PGlite'.
          Property '#private' in type 'PGliteWorker' refers to a different member that cannot be accessed from within type 'PGlite'.
packages/data-web/src/browser.ts(141,23): error TS7006: Parameter 'request' implicitly has an 'any' type.
packages/data-web/src/browser.ts(157,23): error TS7006: Parameter 'projectId' implicitly has an 'any' type.
packages/data-web/src/browser.ts(160,25): error TS7006: Parameter 'projectId' implicitly has an 'any' type.
packages/data-web/src/repository.ts(43,15): error TS2352: Conversion of type 'string | number | boolean | JSONType[] | { [key: string]: JSONType; } | null' to type 'ProjectRevisionManifest' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
  Type '{ [key: string]: JSONType; }' is missing the following properties from type 'ProjectRevisionManifest': schemaVersion, projectId, objects
```
