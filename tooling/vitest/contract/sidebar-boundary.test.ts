import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { studioIconRegistry } from '../../../packages/design-system/src/icons/studio-icon-registry';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('M03.3 Sidebar boundaries', () => {
  it('keeps Sidebar behavior inside Studio shell and consumes only the design-system root export', () => {
    const shell = read('apps/studio/src/shell/app-shell.tsx');
    const navigation = read('apps/studio/src/shell/sidebar-navigation.ts');

    expect(shell).toContain("from '@electrocraft/design-system'");
    expect(navigation).toContain("from '@electrocraft/design-system'");
    expect(shell).not.toContain('@electrocraft/design-system/');
    expect(navigation).not.toContain('@electrocraft/design-system/');
  });

  it('uses the real AppShell contract for active state, Radix tooltips and workspace preferences', () => {
    const shell = read('apps/studio/src/shell/app-shell.tsx');
    const preferences = read('apps/studio/src/shell/workspace-preferences.ts');
    const route = read('apps/studio/src/shell/app-shell-route.tsx');

    expect(shell).toContain('aria-current');
    expect(shell).toContain('TooltipTrigger');
    expect(shell).toContain('useSyncExternalStore');
    expect(shell).toContain('data-sidebar-collapsed');
    expect(preferences).toContain('export interface WorkspacePreferencesPort');
    expect(route).toContain('createMemoryWorkspacePreferencesPort');
    expect(preferences).not.toContain('localStorage');
    expect(preferences).not.toContain('PGlite');
  });

  it('registers semantic Lucide IDs rather than importing icons directly in Studio', () => {
    for (const iconId of [
      'studio.sidebar.collapse',
      'studio.sidebar.expand',
      'studio.sidebar.editor',
      'studio.sidebar.screens',
      'studio.sidebar.components',
      'studio.sidebar.aiGenerate',
      'studio.sidebar.records',
      'studio.sidebar.workflows',
      'studio.sidebar.navigation',
      'studio.sidebar.users',
      'studio.sidebar.designSystem',
      'studio.sidebar.deploy',
    ] as const) {
      expect(studioIconRegistry[iconId]).toBeDefined();
    }

    expect(read('apps/studio/src/shell/app-shell.tsx')).not.toContain("from 'lucide-react'");
    expect(read('apps/studio/src/shell/sidebar-navigation.ts')).not.toContain("from 'lucide-react'");
  });

  it('keeps M03.4 Topbar/Settings behavior out of M03.3', () => {
    const shell = read('apps/studio/src/shell/app-shell.tsx');
    expect(shell).not.toContain('TopbarSettings');
    expect(shell).not.toContain('WorkspaceSettingsDialog');
  });
});
