import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('M01.4 Studio PWA build and Native fixture remain reproducible', async () => {
  const root = process.cwd();
  const workspace = JSON.parse(fs.readFileSync(path.join(root, 'tooling/dist/workspace-report.json'), 'utf8'));
  const quality = JSON.parse(fs.readFileSync(path.join(root, 'tooling/dist/quality-toolchain-report.json'), 'utf8'));
  const studio = JSON.parse(
    fs.readFileSync(path.join(root, 'tooling/dist/m01-4-studio-bootstrap-report.json'), 'utf8'),
  );

  expect(workspace.packageCount).toBe(17);
  expect(workspace.appCount).toBe(2);
  expect(quality.microphase).toBe('M01.3');
  expect(studio.microphase).toBe('M01.4');
  expect(studio.route).toBe('/');
  expect(fs.existsSync(path.join(root, 'apps/studio/dist/index.html'))).toBeTruthy();
  expect(fs.existsSync(path.join(root, 'apps/studio/dist/manifest.webmanifest'))).toBeTruthy();
  expect(fs.existsSync(path.join(root, 'apps/studio/dist/sw.js'))).toBeTruthy();
  expect(fs.existsSync(path.join(root, workspace.nativeFixture))).toBeTruthy();
});
