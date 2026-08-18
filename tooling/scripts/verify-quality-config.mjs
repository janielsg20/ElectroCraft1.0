import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const manifest = json('package.json');
const errors = [];
const requiredScripts = ['lint', 'typecheck', 'test', 'test:e2e', 'build', 'check'];
for (const name of requiredScripts) if (typeof manifest.scripts?.[name] !== 'string') errors.push(`missing root script ${name}`);

const exact = {
  '@eslint/js': '10.0.1',
  '@playwright/test': '1.61.1',
  eslint: '10.8.0',
  prettier: '3.9.6',
  typescript: '7.0.2',
  vite: '8.2.0',
  vitest: '4.1.10',
};
for (const [name, version] of Object.entries(exact)) {
  if (manifest.devDependencies?.[name] !== version) errors.push(`${name} pin must be ${version}`);
}
if (manifest.devDependencies?.['typescript-eslint']) errors.push('typescript-eslint must not be installed against TypeScript 7.0.2');
if (manifest.engines?.node !== '>=22.13.0') errors.push('Node engine must satisfy ESLint 10.8 minimum on Node 22');

const eslint = read('eslint.config.mjs');
for (const token of ["from '@eslint/js'", "from 'eslint/config'", "files: ['**/*.{js,mjs,cjs}']"]) {
  if (!eslint.includes(token)) errors.push(`ESLint config missing ${token}`);
}
for (const formattingRule of ["'indent'", "'semi'", "'quotes'", "'comma-dangle'", "'max-len'"]) {
  if (eslint.includes(formattingRule)) errors.push(`ESLint formatting rule conflicts with Prettier: ${formattingRule}`);
}

const prettier = json('.prettierrc.json');
if (prettier.singleQuote !== true || prettier.semi !== true || prettier.endOfLine !== 'lf') errors.push('Prettier policy mismatch');

const vitest = read('vitest.config.ts');
for (const name of ["name: 'unit'", "name: 'contract'", "name: 'integration'"]) {
  if (!vitest.includes(name)) errors.push(`Vitest config missing project ${name}`);
}
const playwright = read('playwright.config.ts');
for (const token of ['forbidOnly:', 'retries:', 'workers:', "testDir: './tooling/playwright'"]) {
  if (!playwright.includes(token)) errors.push(`Playwright config missing ${token}`);
}
const vite = read('apps/studio/vite.config.ts');
if (!vite.includes("target: 'baseline-widely-available'")) errors.push('Vite build target must be explicit');

const emptyRepoRequired = [
  'tooling/fixtures/empty-repo/package.json',
  'tooling/fixtures/empty-repo/tsconfig.json',
  'tooling/fixtures/empty-repo/eslint.config.mjs',
  'tooling/fixtures/empty-repo/vitest.config.ts',
  'tooling/fixtures/empty-repo/vite.config.ts',
  'tooling/fixtures/empty-repo/playwright.config.ts',
  'tooling/fixtures/empty-repo/src/index.ts',
  'tooling/fixtures/empty-repo/test/unit.test.ts',
  'tooling/fixtures/empty-repo/e2e/smoke.spec.ts',
];
for (const file of emptyRepoRequired) if (!fs.existsSync(path.join(root, file))) errors.push(`missing empty-repo fixture ${file}`);

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`PASS_M01_3_QUALITY_CONFIG scripts=${requiredScripts.length} toolchain=${Object.keys(exact).length} vitestProjects=3`);
