import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Studio build diagnostics', () => {
  it('keeps the PGlite exception narrow and an explicit lazy-chunk budget', () => {
    const config = readFileSync(resolve('apps/studio/vite.config.ts'), 'utf8');
    expect(config).toContain("message.includes('@electric-sql/pglite')");
    expect(config).toContain("message.includes('direct `eval`')");
    expect(config).toContain('chunkSizeWarningLimit: 700');
    expect(config).not.toContain("logLevel: 'error'");
    expect(config).not.toContain('checks: { eval: false');
  });
});
