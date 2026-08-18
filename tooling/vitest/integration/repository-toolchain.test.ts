import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd());

describe('M01.3 integration — repository toolchain configuration', () => {
  it('exposes the required root quality scripts', () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    for (const script of ['lint', 'typecheck', 'test', 'test:e2e', 'build', 'check']) {
      expect(manifest.scripts[script]).toBeTypeOf('string');
    }
  });

  it('retains generated architecture reports before E2E', () => {
    expect(fs.existsSync(path.join(root, 'tooling/dist/workspace-report.json'))).toBeTruthy();
    expect(fs.existsSync(path.join(root, 'tooling/dist/typescript-boundary-report.json'))).toBeTruthy();
  });
});
