import js from '@eslint/js';
import { defineConfig } from 'eslint/config';

const nodeGlobals = Object.fromEntries(
  [
    'Buffer',
    'URL',
    'URLSearchParams',
    'clearInterval',
    'clearTimeout',
    'console',
    'fetch',
    'process',
    'setInterval',
    'setTimeout',
    'structuredClone',
  ].map((name) => [name, 'readonly']),
);

export default defineConfig([
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/artifacts/**',
      'playwright-report/**',
      'test-results/**',
      'experiments/**/generated/**',
    ],
  },
  {
    ...js.configs.recommended,
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: nodeGlobals,
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'off',
    },
  },
]);
