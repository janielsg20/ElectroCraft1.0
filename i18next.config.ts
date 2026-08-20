import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: ['es'],
  extract: {
    input: ['apps/studio/src/shell/language-settings.tsx'],
    output: 'locales/{{language}}/{{namespace}}.json',
  },
  lint: {
    ignore: ['**/*.test.ts', '**/*.spec.ts'],
    checkInterpolationParams: true,
    checkConcatenation: 'error',
  },
  types: {
    input: 'locales/es/**/*.json',
    basePath: 'locales/es',
    output: 'packages/i18n/src/generated/i18next.d.ts',
    resourcesFile: 'packages/i18n/src/generated/resources.d.ts',
  },
});
