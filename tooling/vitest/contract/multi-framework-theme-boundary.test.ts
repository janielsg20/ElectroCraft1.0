import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { BUILT_IN_STUDIO_APPEARANCE_PRESETS } from '../../../apps/studio/src/theme';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Studio multi-framework appearance contract', () => {
  it('registers one applicable built-in theme for every approved framework family', () => {
    const frameworks = new Set(BUILT_IN_STUDIO_APPEARANCE_PRESETS.map((preset) => preset.framework));

    expect(frameworks).toEqual(
      new Set(['electrocraft', 'aceternity-magic', 'daisyui', 'headlessui', 'ark-base', 'heroui']),
    );
    expect(BUILT_IN_STUDIO_APPEARANCE_PRESETS.every((preset) => preset.description.length > 12)).toBe(true);
  });

  it('keeps third-party primitive imports inside the design-system owner', () => {
    const appearance = read('apps/studio/src/shell/appearance-panel.tsx');
    const adapter = read('packages/design-system/src/components/framework/framework-theme-card.tsx');

    for (const packageName of ['@headlessui/react', '@ark-ui/react', '@base-ui/react', '@heroui/react']) {
      expect(appearance).not.toContain(packageName);
      expect(adapter).toContain(packageName);
    }
  });

  it('documents Radix ownership and the approved adapter boundary', () => {
    const adr = read('.ai/adr/ADR-STUDIO-MULTI-FRAMEWORK-THEMES.md');
    const architecture = read('.ai/ARCHITECTURE.md');

    expect(adr).toContain('Radix');
    expect(adr).toContain('@electrocraft/design-system');
    expect(architecture).toContain('Multi-framework appearance adapters');
  });
});
