import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = readFileSync('tooling/src/doc-conventions.mjs', 'utf8');

describe('M01.6 documentation tooling boundary', () => {
  it('uses only repository/file-system concerns and no product owner imports', () => {
    expect(source).not.toMatch(/@electrocraft\//);
    expect(source).not.toMatch(/from ['"]\.\.\/\.\.\/apps\//);
    expect(source).not.toMatch(/from ['"]\.\.\/\.\.\/packages\//);
    expect(source).not.toMatch(/react|vite-plugin|playwright\/test/i);
  });
});
