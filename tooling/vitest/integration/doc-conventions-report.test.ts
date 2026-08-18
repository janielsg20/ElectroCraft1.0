import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');

describe('M01.6 documentation consistency report', () => {
  it('is ready and identifies a single valid active microphase', () => {
    const reportPath = path.join(root, 'tooling/dist/m01-6-doc-conventions-report.json');
    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8')) as {
      status: string;
      activeMicrophase: string | null;
      errors: string[];
      requiredDocs: number;
      requiredTemplates: number;
    };

    expect(report.status).toBe('ready');
    expect(report.activeMicrophase).toMatch(/^M\d{2}\.\d+$/);
    expect(report.errors).toEqual([]);
    expect(report.requiredDocs).toBeGreaterThanOrEqual(27);
    expect(report.requiredTemplates).toBe(4);
  });
});
