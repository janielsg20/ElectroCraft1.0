import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');

describe('M01.5 CI base integration report', () => {
  it('is produced by the real repository build and records a ready locked CI contract', () => {
    const reportPath = path.join(root, 'tooling/dist/m01-5-ci-base-report.json');
    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as {
      microphase: string;
      status: string;
      engine: { node: string; npm: string; install: string; cache: string };
      lockfile: { path: string; version: number };
      diagnostics: unknown[];
    };

    expect(report.microphase).toBe('M01.5');
    expect(report.status).toBe('ready');
    expect(report.engine).toMatchObject({ node: '22.16.0', npm: '10.9.2', install: 'npm ci' });
    expect(report.lockfile).toEqual({ path: 'package-lock.json', version: 3 });
    expect(report.diagnostics).toEqual([]);
  });
});
