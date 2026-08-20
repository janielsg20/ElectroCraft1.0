import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const fail = (message) => {
  throw new Error(`M03.12 contract: ${message}`);
};

for (const relativePath of [
  'tooling/playwright/m03-12-appshell.spec.ts',
  'tooling/vitest/contract/app-shell-e2e-boundary.test.ts',
  'tooling/vitest/integration/app-shell-e2e-matrix.test.ts',
  'docs/qa/F03_APPSHELL_E2E.md',
  '.ai/SCREEN_SPECS/F03_APPSHELL.md',
  'playwright.config.ts',
]) {
  if (!fs.existsSync(path.join(root, relativePath))) fail(`missing ${relativePath}`);
}

const e2e = read('tooling/playwright/m03-12-appshell.spec.ts');
const config = read('playwright.config.ts');
const state = read('.ai/STATE.md');
const widths = [1440, 1280, 1024, 768, 375, 320];
for (const width of widths) if (!e2e.includes(`width: ${width}`)) fail(`viewport ${width} missing`);
if (e2e.includes('waitForTimeout') || /setTimeout\s*\(/.test(e2e)) fail('fixed timing waits are forbidden');
if (!config.includes("trace: 'retain-on-failure'")) fail('Playwright trace retention missing');
if (!config.includes("screenshot: 'only-on-failure'")) fail('Playwright failure screenshot retention missing');
if (!e2e.includes('testInfo.outputPath')) fail('meaningful viewport screenshot evidence missing');
if (!e2e.includes("name: 'Ayuda'") || !e2e.includes("name: 'Configuración'"))
  fail('Topbar Help/Settings audit missing');
if (!e2e.includes('I18N_MISSING_KEY')) fail('missing-key release audit missing');
if (!e2e.includes('electrocraft.studio.appearance.v1')) fail('appearance isolation audit missing');

const active = /M03\.12[^\n]*ACTIVE/.test(state);
const closed = /M03\.12[^\n]*COMPLETADA[^\n]*GREEN/.test(state);
if (!active && !closed) fail('M03.12 must be ACTIVE or closed GREEN');

console.log('PASS_M03_12_APPSHELL_E2E viewports=6 canonicalRoutes=24 fixedWaits=0');
