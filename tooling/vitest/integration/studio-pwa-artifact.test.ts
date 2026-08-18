import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = path.resolve(process.cwd());
const dist = path.join(root, 'apps/studio/dist');

describe('M01.4 integration — generated Vite/PWA artifact', () => {
  it('produces the installable technical shell and route artifact', () => {
    const report = JSON.parse(
      fs.readFileSync(path.join(root, 'tooling/dist/m01-4-studio-bootstrap-report.json'), 'utf8'),
    );
    const manifest = JSON.parse(fs.readFileSync(path.join(dist, 'manifest.webmanifest'), 'utf8'));

    expect(report.microphase).toBe('M01.4');
    expect(report.route).toBe('/');
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(fs.existsSync(path.join(dist, 'sw.js'))).toBe(true);
    expect(fs.existsSync(path.join(dist, 'index.html'))).toBe(true);
  });
});
