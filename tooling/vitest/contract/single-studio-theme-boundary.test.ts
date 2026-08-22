import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Studio single-theme boundary', () => {
  it('keeps shadcn Radix as the only Studio UI foundation', () => {
    const manifest = JSON.parse(read('packages/design-system/package.json')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      exports?: Record<string, string>;
    };
    const deps = { ...manifest.dependencies, ...manifest.devDependencies };

    expect(deps['radix-ui']).toBeDefined();
    for (const removed of [
      '@ark-ui/react',
      '@base-ui/react',
      '@headlessui/react',
      '@heroui/react',
      '@heroui/styles',
      'react-aria',
      'react-aria-components',
      'motion',
      'daisyui',
    ]) {
      expect(deps[removed]).toBeUndefined();
    }
    expect(manifest.exports?.['./framework-themes']).toBeUndefined();
  });

  it('contains no external framework imports or preset registry in runtime appearance sources', () => {
    const sources = [
      read('packages/design-system/src/index.ts'),
      read('packages/design-system/src/styles/globals.css'),
      read('packages/design-system/src/styles/studio-appearance-tokens.css'),
      read('apps/studio/src/theme.ts'),
      read('apps/studio/src/theme-provider.tsx'),
      read('apps/studio/src/shell/appearance-panel.tsx'),
    ].join('\n');

    for (const removed of [
      '@ark-ui/react',
      '@base-ui/react',
      '@headlessui/react',
      '@heroui/',
      'daisyui',
      'aceternity',
      'magicui',
      'framework-themes',
      'MARKET_STUDIO_APPEARANCE_PRESETS',
      'BUILT_IN_STUDIO_APPEARANCE_PRESETS',
    ]) {
      expect(sources.toLowerCase()).not.toContain(removed.toLowerCase());
    }
  });

  it('documents one ElectroCraft Studio theme with light and dark modes', () => {
    const architecture = read('.ai/ARCHITECTURE.md');
    const decisions = read('.ai/DECISIONS.md');
    const descriptor = read('packages/design-system/src/index.ts');

    expect(architecture).toContain('único tema visual del Studio');
    expect(decisions).toContain('single-theme');
    expect(descriptor).toContain("colorModes: ['light', 'dark']");
  });
});
