import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(process.cwd());

describe('M01.4 contract — React/Vite/PWA pins', () => {
  it('pins the verified Studio bootstrap engines exactly', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'apps/studio/package.json'), 'utf8'));

    expect(manifest.dependencies.react).toBe('19.2.8');
    expect(manifest.dependencies['react-dom']).toBe('19.2.8');
    expect(manifest.devDependencies['@vitejs/plugin-react']).toBe('6.0.5');
    expect(manifest.devDependencies['vite-plugin-pwa']).toBe('1.3.0');
  });
});
