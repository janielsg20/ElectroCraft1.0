import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('flat Studio shell and loading contract', () => {
  it('keeps Sidebar, brand and Topbar chrome flat without intersecting divider lines', () => {
    const styles = read('apps/studio/src/styles.css');
    const sidebar = read('apps/studio/src/shell/sidebar.css');
    const topbar = read('apps/studio/src/shell/topbar.css');

    expect(styles).not.toContain('border-right: 1px solid color-mix(in srgb, var(--border) 72%, transparent)');
    expect(styles).not.toContain('border-bottom: 1px solid color-mix(in srgb, var(--border) 48%, transparent)');
    expect(styles).not.toContain('border-bottom: 1px solid color-mix(in srgb, var(--border) 56%, transparent)');
    expect(sidebar).not.toContain('border-top: 1px solid color-mix(in srgb, var(--border) 56%, transparent)');
    expect(topbar).not.toContain('border-bottom: 1px solid var(--border)');
  });

  it('removes loading borders while keeping geometry and progressive entrance motion', () => {
    const html = read('apps/studio/index.html');
    const loadingCss = read('apps/studio/src/shell/loading-ui.css');

    expect(html).not.toContain('--boot-border:');
    expect(html).not.toContain('border-right: 1px solid var(--boot-border)');
    expect(html).not.toContain('border-bottom: 1px solid var(--boot-border)');
    expect(html).not.toContain('border: 1px solid var(--boot-border)');
    expect(loadingCss).not.toContain('gap: 1px;');
    expect(loadingCss).not.toContain('background: color-mix(in srgb, var(--border) 80%, var(--primary));');
    expect(loadingCss).toContain('animation: ec-route-skeleton-enter');
    expect(loadingCss).toContain('@keyframes ec-skeleton-group-in');
    expect(loadingCss).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('uses a borderless shimmer primitive and adds breathing room inside Inspector', () => {
    const globals = read('packages/design-system/src/styles/globals.css');
    const editor = read('apps/studio/src/shell/editor-workspace.css');
    const informationArchitecture = read('apps/studio/src/shell/information-architecture.css');

    expect(globals).toContain("[data-slot='skeleton']::after");
    expect(globals).toContain('animation: ec-skeleton-shimmer');
    expect(globals).toContain('@keyframes ec-skeleton-shimmer');
    expect(editor).toContain(".ec-editor-region[data-editor-region='inspector'] .ec-editor-tab-panel");
    expect(editor).toContain('padding: 10px 12px 14px;');
    expect(informationArchitecture).toContain('font-weight: 600;');
    expect(informationArchitecture).not.toContain('font-weight: 650;');
  });
});
