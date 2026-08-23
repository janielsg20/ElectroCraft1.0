import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8');

describe('Studio progressive loading boundary', () => {
  it('shows a zero-JS boot shell before React replaces the root', () => {
    const html = read('apps/studio/index.html');
    expect(html).toContain('id="ec-boot-shell"');
    expect(html).toContain('Cargando la interfaz base de ElectroCraft Studio');
    expect(html).toContain("html[data-ec-theme='dark'] #ec-boot-shell");
    expect(html).not.toContain('@keyframes');
  });

  it('renders the React shell before heavy route modules and gives geometry-matched fallbacks', () => {
    const app = read('apps/studio/src/App.tsx');
    expect(app).toContain("const ProjectHome = lazy(() =>");
    expect(app).toContain("const StudioEditorWorkspace = lazy(() =>");
    expect(app).toContain("const DesignSystemDevelopmentRoute = lazy(() =>");
    expect(app).toContain("const StudioContentListDetailRoute = lazy(() =>");
    expect(app).toContain("const StudioModuleEmptyStateRoute = lazy(() =>");
    expect(app).toContain('<StudioAppShellRoute status={shellStatus}>{workspace}</StudioAppShellRoute>');
    expect(app).toContain('<StudioRouteSkeleton kind="projects" label="Cargando proyectos" />');
    expect(app).toContain('<StudioRouteSkeleton kind="editor" label="Cargando editor" />');
  });

  it('loads project data progressively and defers the new-project wizard until requested', () => {
    const projectHome = read('apps/studio/src/features/projects/project-home.tsx');
    expect(projectHome).toContain("const NewProjectWizard = lazy(() =>");
    expect(projectHome).toContain("const initialLoading = state === 'loading' && projects.length === 0");
    expect(projectHome).toContain("const refreshing = state === 'loading' && projects.length > 0");
    expect(projectHome).toContain('<ProjectCollectionSkeleton view={view} />');
    expect(projectHome).toContain('data-refreshing={refreshing');
    expect(projectHome).toContain('Preparando nuevo proyecto');
    expect(projectHome).not.toContain('<p role="status">Cargando proyectos…</p>');
  });

  it('keeps skeleton and loader primitives lightweight and accessible', () => {
    const skeleton = read('packages/design-system/src/components/ui/skeleton.tsx');
    const loader = read('packages/design-system/src/components/ui/loader.tsx');
    const loadingCss = read('apps/studio/src/shell/loading-ui.css');
    expect(skeleton).toContain('animate-pulse');
    expect(skeleton).toContain('motion-reduce:animate-none');
    expect(skeleton).toContain('aria-hidden="true"');
    expect(loader).toContain("aria-live={announce ? 'polite' : undefined}");
    expect(loader).toContain('motion-reduce:animate-none');
    expect(loadingCss).toContain('contain: layout paint');
    expect(loadingCss).toContain('content-visibility: auto');
    expect(loadingCss).toContain('backdrop-filter: none');
  });
});
