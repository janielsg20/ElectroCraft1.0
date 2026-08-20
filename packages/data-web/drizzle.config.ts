import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'postgresql',
  driver: 'pglite',
  schema: './src/schema.ts',
  out: './drizzle',
  dbCredentials: { url: './.local/drizzle-kit-db' },
  strict: true,
  verbose: true,
});
