import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['default'],
    passWithNoTests: false,
    projects: [
      {
        test: {
          name: 'unit',
          environment: 'node',
          include: ['tooling/vitest/unit/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'contract',
          environment: 'node',
          include: ['tooling/vitest/contract/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'integration',
          environment: 'node',
          include: ['tooling/vitest/integration/**/*.test.ts'],
        },
      },
    ],
  },
});
