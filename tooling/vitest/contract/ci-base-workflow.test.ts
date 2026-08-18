import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

const workflow = read('.github/workflows/ci.yml');

describe('M01.5 base CI workflow contract', () => {
  it('runs on push and pull request with a locked npm install and safe cache', () => {
    expect(workflow).toContain('push:');
    expect(workflow).toContain('branches: [main]');
    expect(workflow).toContain('pull_request:');
    expect(workflow).toContain('contents: read');
    expect(workflow).toContain('uses: actions/setup-node@v7');
    expect(workflow).toContain('cache: npm');
    expect(workflow).toContain('cache-dependency-path: package-lock.json');
    expect(workflow).toContain('npm ci --ignore-scripts --no-audit --no-fund');
  });

  it('executes every required quality gate explicitly', () => {
    for (const command of ['npm run lint', 'npm run typecheck', 'npm run test', 'npm run build', 'npm run test:e2e']) {
      expect(workflow).toContain(command);
    }
  });

  it('keeps package boundaries and deployment concerns out of the CI workflow', () => {
    expect(workflow).not.toMatch(/packages\/[\w-]+\/src\//);
    expect(workflow).not.toMatch(/apps\/studio\/src\//);
    expect(workflow).not.toContain('secrets.');
    expect(workflow).not.toMatch(/\b(wrangler|vercel|npm publish|docker push)\b/i);
  });
});
