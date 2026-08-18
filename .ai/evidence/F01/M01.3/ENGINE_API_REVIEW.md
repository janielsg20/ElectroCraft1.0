# M01.3 — Engine/API review

Revisión hecha el 2026-08-17.

- ESLint: flat config `eslint.config.mjs`; `@eslint/js` recommended. Pins: `eslint@10.8.0`, `@eslint/js@10.0.1`.
  - https://eslint.org/docs/latest/use/configure/configuration-files
  - https://www.npmjs.com/package/eslint
- Prettier: config local + `--check`/`--write`. Pin `prettier@3.9.6`.
  - https://prettier.io/docs/install.html
- Vitest: root `test.projects` con `unit`, `contract`, `integration`. Pin `vitest@4.1.10`.
  - https://vitest.dev/guide/projects.html
- Playwright Test: `defineConfig`, `testDir`, `forbidOnly`, retries/workers CI. Pin `@playwright/test@1.61.1`.
  - https://playwright.dev/docs/test-configuration
- Vite: build library y target explícito. Pin `vite@8.2.0`.
  - https://vite.dev/config/build-options
- TypeScript: pin heredado `typescript@7.0.2`.
- typescript-eslint estable declara TypeScript soportado `>=4.8.4 <6.1.0`; por tanto no se agrega contra TS 7.0.2.
  - https://typescript-eslint.io/users/dependency-versions/
