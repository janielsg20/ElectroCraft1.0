import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('M01.6 documentation consistency report', () => {
  it('is ready and identifies a single valid active microphase', () => {
    const report = JSON.parse(
      readFileSync(
        'tooling/dist/m01-6-doc-conventions-report.json',
        'utf8',
      ),
    ) as {
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
