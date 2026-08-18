import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tooling/playwright',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  outputDir: 'test-results/m01-3',
});
