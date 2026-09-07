import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

function hexChannel(value: string, offset: number) {
  return Number.parseInt(value.slice(offset, offset + 2), 16) / 255;
}

function linearChannel(value: number) {
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const red = linearChannel(hexChannel(hex, 1));
  const green = linearChannel(hexChannel(hex, 3));
  const blue = linearChannel(hexChannel(hex, 5));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(left: string, right: string) {
  const a = luminance(left);
  const b = luminance(right);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function token(section: string, name: string) {
  const match = new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`).exec(section);
  if (!match?.[1]) throw new Error(`missing color token: ${name}`);
  return match[1];
}

describe('Studio UI/UX loading, contrast and perceived-performance boundary', () => {
  it('keeps readable text and visible interactive boundaries in light and dark themes', () => {
    const tokens = read('packages/design-system/src/styles/tokens.css');
    const darkMarker = tokens.indexOf('\n.dark,');
    expect(darkMarker).toBeGreaterThan(0);
    const light = tokens.slice(0, darkMarker);
    const dark = tokens.slice(darkMarker);

    for (const theme of [light, dark]) {
      const surface = token(theme, 'surface');
      expect(contrast(token(theme, 'foreground'), surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(token(theme, 'muted-foreground'), surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(token(theme, 'input'), surface)).toBeGreaterThanOrEqual(3);
      expect(contrast(token(theme, 'primary'), surface)).toBeGreaterThanOrEqual(3);
      expect(contrast(token(theme, 'accent-foreground'), token(theme, 'accent'))).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('does not weaken interactive borders on hover', () => {
    for (const relativePath of [
      'packages/design-system/src/components/ui/button.tsx',
      'packages/design-system/src/components/ui/input.tsx',
      'packages/design-system/src/components/ui/select.tsx',
      'packages/design-system/src/components/ui/checkbox.tsx',
      'packages/design-system/src/components/ui/radio-group.tsx',
    ]) {
      const source = read(relativePath);
      expect(source).not.toContain('hover:border-border');
      expect(source).toContain('focus-visible:ring-2');
    }
  });

  it('replaces known text-only runtime waits with the shared animated visual treatment', () => {
    const loadingCss = read('apps/studio/src/shell/loading-ui.css');
    for (const selector of [
      ".ec-screens-workspace > p[role='status']",
      ".ec-navigation-preview > p[role='status']",
      ".ec-data-sources-workspace > p[role='status']",
      ".ec-data-explorer > p[role='status']",
      ".ec-editor-screen-context-state[role='status']",
      "html[data-workspace-persistence-state='loading'] .ec-project-history-route-empty > p",
    ]) {
      expect(loadingCss).toContain(selector);
    }
    expect(loadingCss).toContain('@keyframes ec-loading-orbit');
    expect(loadingCss).toContain('@media (prefers-reduced-motion: reduce)');

    const editorScreens = read('apps/studio/src/features/navigation/editor-screen-selector.tsx');
    expect(editorScreens).toContain('<Loader label="Cargando Pantalla" size="xs" announce />');
    expect(editorScreens).not.toContain('return <span>Cargando Pantalla…</span>');
  });

  it('keeps project and screens navigation hot after the first storage read', () => {
    const storage = read('apps/studio/src/features/projects/project-storage-runtime.ts');
    const navigation = read('apps/studio/src/features/navigation/navigation-workspace-runtime.ts');

    expect(storage).toContain('let initialized = false');
    expect(storage).toContain('if (initialized) return snapshot');
    expect(storage).toContain('let openedProjectCache');
    expect(storage).toContain('let projectSummaryCache');
    expect(storage).toContain("service.listProjects({ search: '', status: 'all', sort: 'updated-desc' })");
    expect(storage).toContain('projectSummaryView(projectSummaryCache, request)');

    expect(navigation).toContain("snapshot.state === 'ready'");
    expect(navigation).toContain('snapshot.project?.id === projectId');
    expect(navigation).toContain('return Promise.resolve(snapshot)');
  });

  it('separates Screens panels by surface instead of adding heavy dividers', () => {
    const screensCss = read('apps/studio/src/features/navigation/screens-workspace.css');
    expect(screensCss).toContain('.ec-screens-workspace {');
    expect(screensCss).toContain('background: var(--background);');
    expect(screensCss).toContain('background: var(--surface);');
    expect(screensCss).toContain('color: var(--accent-foreground);');
  });
});
