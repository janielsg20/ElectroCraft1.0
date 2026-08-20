# M04.1 validation report

- Source commit: `e729d9085744b6935f8589ef09a65af4736383bb`
- Runner: `ubuntu-latest` / Node `22.13.0`
- Formatting: Prettier --write applied before validation
- Overall: `RED`

| Gate | Exit code |
| --- | ---: |
| npm ci | 0 |
| Prettier write M04.1 surface | 0 |
| Prettier check M04.1 surface | 0 |
| npm run lint | 1 |
| npm run typecheck | 0 |
| npm run test:boundaries | 0 |
| targeted M04.1 Vitest | 0 |
| npm run build:studio | 0 |

## Failure tail: lint

```text

> electrocraft@0.0.0-m01.5 lint
> eslint "tooling/**/*.{js,mjs,cjs}" eslint.config.mjs && npm run format:check


> electrocraft@0.0.0-m01.5 format:check
> prettier --check package.json package-lock.json tsconfig.json tsconfig.base.json eslint.config.mjs .prettierrc.json vitest.config.ts playwright.config.ts .github/workflows/ci.yml .github/workflows/f02-canonical-model-gate.yml .github/workflows/m02-1-canonical-model.yml .github/workflows/m02-2-component-layout-style.yml .github/workflows/m02-3-data-ownership.yml .github/workflows/m02-4-action-state-navigation-permission.yml .github/workflows/m02-5-theme-blueprint-registries-capabilities.yml .github/workflows/m02-6-serializer-migration-registry.yml .github/workflows/m02-7-export-ir.yml .github/workflows/m02-8-model-ownership.yml .github/workflows/m02-9-engine-payload-wrappers.yml .github/workflows/m03-1-design-system.yml .github/workflows/m03-2-app-shell.yml .github/workflows/m03-3-sidebar.yml .github/workflows/m03-4-topbar-settings.yml packages/domain/package.json packages/application/package.json packages/editor-puck/package.json packages/data-core/package.json packages/query-rqb/package.json packages/forms/package.json packages/auth-core/package.json packages/state-zustand/package.json packages/workflow-rete/package.json packages/export-ir/package.json packages/design-system/package.json packages/design-system/components.json "packages/domain/src/**/*.ts" "packages/application/src/**/*.ts" "packages/editor-puck/src/**/*.ts" "packages/data-core/src/**/*.ts" "packages/query-rqb/src/**/*.ts" "packages/forms/src/**/*.ts" "packages/auth-core/src/**/*.ts" "packages/state-zustand/src/**/*.ts" "packages/workflow-rete/src/**/*.ts" "packages/export-ir/src/**/*.ts" "packages/design-system/src/**/*.{ts,tsx,css}" apps/studio/index.html apps/studio/package.json apps/studio/vite.config.ts "apps/studio/src/**/*.{ts,tsx,css}" "tooling/vitest/**/*.ts" "tooling/playwright/**/*.ts" tooling/scripts/verify-m03-1-design-system.mjs tooling/scripts/verify-m03-2-app-shell.mjs tooling/scripts/verify-m03-3-sidebar.mjs tooling/scripts/verify-m03-4-topbar.mjs "tooling/fixtures/empty-repo/**/*.{ts,mjs,json}" "tooling/fixtures/doc-conventions/**/*.json" "tooling/fixtures/canonical-model/**/*.json" tooling/fixtures/help.architecture.models.json

Checking formatting...
[[33mwarn[39m] tooling/playwright/m04-1-storage.spec.ts
[[33mwarn[39m] Code style issues found in the above file. Run Prettier with --write to fix.
```
