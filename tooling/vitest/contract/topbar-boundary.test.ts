import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');

describe('M03.4 Topbar contract', () => {
  it('uses only the shared design-system and semantic Lucide registry', () => {
    const source = read('apps/studio/src/shell/topbar.tsx');
    expect(source).toContain("from '@electrocraft/design-system'");
    expect(source).not.toContain('lucide-react');
    expect(read('packages/design-system/src/icons/studio-icon-registry.ts')).toContain("'studio.topbar.tools'");
  });
  it('keeps Settings last at the right edge and uses real Radix Sheet composition', () => {
    const source = read('apps/studio/src/shell/topbar.tsx');
    const right = source.slice(source.indexOf('className="ec-topbar-right"'));
    expect(right.indexOf('<HelpSheet')).toBeGreaterThan(-1);
    expect(right.indexOf('<SettingsSheet')).toBeGreaterThan(right.indexOf('<HelpSheet'));
    expect(source).toContain('<Sheet>');
    expect(source).toContain('preferencesPort.toggleSidebar');
  });
  it('does not fake unavailable history actions', () => {
    const source = read('apps/studio/src/shell/topbar.tsx');
    expect(source).toContain("studio.topbar.undo");
    expect(source).toContain("studio.topbar.redo");
    expect((source.match(/disabled/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
});
