import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const allowExternalBlockers = process.env.ELECTROCRAFT_M03_1_ALLOW_EXTERNAL_BLOCKERS === '1';
const exactBaseCommit = '0afa33651a677fb2a1d47cf45c38fa7b22df6239';
const reportPath = 'tooling/dist/m03-1-design-system-report.json';

const requiredFiles = [
  'package.json',
  'packages/design-system/components.json',
  'packages/design-system/src/foundation/design-system-foundation.ts',
  'packages/design-system/src/foundation/theme-provider.tsx',
  'packages/design-system/src/icons/studio-icon-registry.ts',
  'packages/design-system/src/components/ui/button.tsx',
  'packages/design-system/src/components/ui/tooltip.tsx',
  'packages/design-system/src/components/ui/dropdown-menu.tsx',
  'packages/design-system/src/components/ui/sheet.tsx',
  'packages/design-system/src/components/ui/scroll-area.tsx',
  'packages/design-system/src/components/ui/separator.tsx',
  'packages/design-system/src/components/framework/index.ts',
  'apps/studio/src/shell/design-system-route.tsx',
  'apps/studio/src/i18n/studio-shell.es.ts',
  'apps/studio/src/help/help-registry.ts',
  'tooling/vitest/unit/design-system-foundation.test.ts',
  'tooling/vitest/contract/design-system-owner-boundary.test.ts',
  'tooling/vitest/integration/design-system-studio-foundation.test.ts',
  'tooling/playwright/m03-1-design-system.spec.ts',
];

for (const relativePath of requiredFiles) {
  assert.equal(fs.existsSync(path.join(root, relativePath)), true, `missing ${relativePath}`);
}

const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const readJson = (relativePath) => JSON.parse(read(relativePath));

for (const primitive of ['tooltip', 'dropdown-menu', 'sheet', 'scroll-area', 'separator']) {
  assert.match(
    read(`packages/design-system/src/components/ui/${primitive}.tsx`),
    /from 'radix-ui'/,
    `${primitive} must use radix-ui`,
  );
}

const componentsJson = readJson('packages/design-system/components.json');
assert.equal(componentsJson.style, 'radix-nova');
assert.equal(componentsJson.iconLibrary, 'lucide');
assert.equal(componentsJson.tailwind.cssVariables, true);
assert.equal(componentsJson.aliases.components, '#components');
assert.equal(componentsJson.aliases.ui, '#components/ui');
assert.equal(componentsJson.aliases.utils, '#lib/utils');

const rootPackageJson = readJson('package.json');
assert.equal(rootPackageJson.packageManager, 'npm@10.9.2');
assert.match(rootPackageJson.scripts['test:m03-1'], /design-system-foundation/);
assert.match(rootPackageJson.scripts['format:check'], /packages\/design-system\/src/);

const packageJson = readJson('packages/design-system/package.json');
const exactDesignSystemDependencies = Object.freeze({
  'class-variance-authority': '0.7.1',
  clsx: '2.1.1',
  'lucide-react': '1.31.0',
  'radix-ui': '1.6.7',
  'tailwind-merge': '3.6.0',
});
for (const [name, version] of Object.entries(exactDesignSystemDependencies)) {
  assert.equal(packageJson.dependencies[name], version, `${name} pin must be ${version}`);
}
assert.deepEqual(Object.keys(packageJson.exports), ['.', './framework-themes']);
assert.equal(packageJson.exports['.'], './src/index.ts');
assert.equal(packageJson.exports['./framework-themes'], './src/components/framework/index.ts');
assert.equal(packageJson.imports['#components/*'], './src/components/*.tsx');
assert.equal(packageJson.imports['#lib/*'], './src/lib/*.ts');

const tsconfigBase = readJson('tsconfig.base.json');
assert.equal(tsconfigBase.compilerOptions.resolvePackageJsonImports, true);
assert.equal(
  Object.keys(tsconfigBase.compilerOptions.paths).some((alias) => alias.includes('*')),
  false,
);
assert.doesNotMatch(read('apps/studio/src/App.tsx'), /@electrocraft\/design-system\//);

const studioPackage = readJson('apps/studio/package.json');
const exactStudioDevDependencies = Object.freeze({
  '@tailwindcss/vite': '4.3.3',
  tailwindcss: '4.3.3',
});
for (const [name, version] of Object.entries(exactStudioDevDependencies)) {
  assert.equal(studioPackage.devDependencies[name], version, `${name} pin must be ${version}`);
}

assert.match(read('apps/studio/src/help/help-registry.ts'), /help\.studio\.shell/);
assert.match(read('apps/studio/src/i18n/studio-shell.es.ts'), /Generar con IA/);
assert.match(read('apps/studio/src/i18n/studio-shell.es.ts'), /studio\.bootstrap\.m03Kicker/);
assert.match(read('packages/design-system/src/foundation/design-system-foundation.ts'), /schemaVersion/);
assert.match(
  read('packages/design-system/src/foundation/design-system-foundation.ts'),
  /migrateDesignSystemFoundationConfig/,
);
assert.match(read('packages/design-system/src/styles/globals.css'), /@theme inline/);
assert.match(read('packages/design-system/src/styles/globals.css'), /@source '\.\.\/'/);
assert.match(read('packages/design-system/src/styles/globals.css'), /min-height: 2\.75rem/);
assert.match(read('packages/design-system/src/styles/tokens.css'), /--overlay:/);
assert.doesNotMatch(read('packages/design-system/src/components/ui/sheet.tsx'), /bg-black/);
assert.match(read('packages/design-system/src/components/ui/scroll-area.tsx'), /role="region"/);
assert.match(read('.github/workflows/ci.yml'), /playwright install --with-deps chromium/);
assert.match(read('.github/workflows/m03-1-design-system.yml'), /if: always\(\)/);
assert.match(read('.github/workflows/m03-1-design-system.yml'), /npm install --package-lock-only/);
assert.match(read('.github/workflows/m03-1-design-system.yml'), /m03-1-lockfile-candidate/);
assert.match(read('.github/workflows/m03-1-design-system.yml'), /Require committed lockfile synchronization/);
assert.match(read('.github/workflows/m03-1-design-system.yml'), /npm run format/);
assert.match(read('.github/workflows/m03-1-design-system.yml'), /m03-1-formatting-candidate/);
assert.match(read('.github/workflows/m03-1-design-system.yml'), /Require committed formatting synchronization/);

const blockers = [];

const lockPath = path.join(root, 'package-lock.json');
let lockfileVersion = null;
let lockVerified = false;
if (!fs.existsSync(lockPath)) {
  blockers.push('package-lock.json missing; exact M03.1 dependency graph is not locked');
} else {
  try {
    const lock = readJson('package-lock.json');
    lockfileVersion = lock.lockfileVersion ?? null;
    const designSystemLock = lock.packages?.['packages/design-system'];
    const studioLock = lock.packages?.['apps/studio'];

    if (!designSystemLock || !studioLock) {
      blockers.push('package-lock.json does not contain the design-system/studio workspace entries');
    } else {
      for (const [name, version] of Object.entries(exactDesignSystemDependencies)) {
        if (designSystemLock.dependencies?.[name] !== version) {
          blockers.push(`package-lock workspace pin mismatch for ${name}@${version}`);
        }
        if (lock.packages?.[`node_modules/${name}`]?.version !== version) {
          blockers.push(`package-lock resolved package mismatch for ${name}@${version}`);
        }
      }
      for (const [name, version] of Object.entries(exactStudioDevDependencies)) {
        if (studioLock.devDependencies?.[name] !== version) {
          blockers.push(`package-lock Studio pin mismatch for ${name}@${version}`);
        }
        if (lock.packages?.[`node_modules/${name}`]?.version !== version) {
          blockers.push(`package-lock resolved package mismatch for ${name}@${version}`);
        }
      }
      lockVerified = blockers.every((blocker) => !blocker.startsWith('package-lock'));
    }
  } catch (error) {
    blockers.push(`package-lock.json cannot be parsed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const report = Object.freeze({
  schemaVersion: 1,
  microphase: 'M03.1',
  baseCommit: exactBaseCommit,
  status: blockers.length === 0 ? 'closure-structure-ready' : 'blocked-external-closure-inputs',
  packageManager: rootPackageJson.packageManager,
  shadcnStyle: componentsJson.style,
  primitiveBase: 'radix',
  radixUiVersion: packageJson.dependencies['radix-ui'],
  lucideReactVersion: packageJson.dependencies['lucide-react'],
  tailwindVersion: studioPackage.devDependencies.tailwindcss,
  lockfileVersion,
  lockVerified,
  visualValidation: Object.freeze({
    route: '/__design-system',
    viewports: [360, 768, 1440],
    required: ['keyboard', 'focus-visible', 'theme', 'dropdown', 'sheet', 'responsive'],
    execution: 'playwright',
  }),
  requiredFilesChecked: requiredFiles.length,
  blockers: Object.freeze(blockers),
});

fs.mkdirSync(path.join(root, 'tooling/dist'), { recursive: true });
fs.writeFileSync(path.join(root, reportPath), `${JSON.stringify(report, null, 2)}\n`);

if (blockers.length > 0 && !allowExternalBlockers) {
  console.error(blockers.join('\n'));
  console.error(`M03.1 report: ${reportPath}`);
  process.exit(1);
}

console.log(
  `PASS_M03_1_DESIGN_SYSTEM_STRUCTURE blockers=${blockers.length} lockVerified=${lockVerified} visual=playwright`,
);
