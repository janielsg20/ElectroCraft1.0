import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from 'react';
import { evaluateStudioBootstrapHealth } from './bootstrap-health';
import { projectStorageRuntime } from './features/projects/project-storage-runtime';
import { HelpTrigger } from './help/help-ui';
import { getHelpIdForNavigationItem } from './help/help-registry';
import { studioWorkspaceDescriptor } from './index';
import { studioT } from './i18n/studio-shell.es';
import { StudioAppShellRoute } from './shell/app-shell-route';
import { StudioRouteSkeleton } from './shell/loading-ui';
import { resolveSidebarActiveItem } from './shell/sidebar-navigation';
import './styles.css';
import './shell/sidebar.css';
import './shell/topbar.css';
import './shell/editor-workspace.css';
import './shell/responsive-shell.css';
import './shell/information-architecture.css';
import './shell/loading-ui.css';

const projectHomeRoute = Object.freeze({
  id: 'project-home-development',
  pathname: '/',
  finalNavigation: false,
});

const designSystemRoute = '/__design-system';
const editorRoute = '/editor';
const contentRoute = '/content';
const canonicalEmptyModuleRoutes = new Set(['/queries', '/forms', '/admin', '/media', '/export']);

const ProjectHome = lazy(() =>
  import('./features/projects/project-home').then((module) => ({ default: module.ProjectHome })),
);
const StudioEditorWorkspace = lazy(() =>
  import('./shell/editor-workspace').then((module) => ({ default: module.StudioEditorWorkspace })),
);
const DesignSystemDevelopmentRoute = lazy(() =>
  import('./shell/design-system-route').then((module) => ({ default: module.DesignSystemDevelopmentRoute })),
);
const StudioContentListDetailRoute = lazy(() =>
  import('./shell/information-architecture-ui').then((module) => ({ default: module.StudioContentListDetailRoute })),
);
const StudioModuleEmptyStateRoute = lazy(() =>
  import('./shell/information-architecture-ui').then((module) => ({ default: module.StudioModuleEmptyStateRoute })),
);

function StudioWorkspaceBootstrap({
  pathname,
  health,
}: {
  readonly pathname: string;
  readonly health: ReturnType<typeof evaluateStudioBootstrapHealth>;
}) {
  const isProjectHome = pathname === projectHomeRoute.pathname;
  const activeItemId = resolveSidebarActiveItem(pathname);
  const helpId = activeItemId ? getHelpIdForNavigationItem(activeItemId) : 'help.studio.shell';

  return (
    <section className="workspace-bootstrap" data-help-id={studioWorkspaceDescriptor.helpId}>
      <p className="development-kicker">{studioT('studio.bootstrap.m03Kicker')}</p>
      <div className="flex items-center gap-2">
        <h1 id="development-title">{studioT('studio.bootstrap.title')}</h1>
        <HelpTrigger helpId={helpId} />
      </div>
      <p className="development-summary">{studioT('studio.bootstrap.foundationSummary')}</p>

      <div className="development-status" data-state={health.state}>
        <span className="status-dot" aria-hidden="true" />
        <div>
          <p className="status-label">{studioT('studio.bootstrap.environmentStatus')}</p>
          <p className="status-value" role="status" aria-live="polite">
            {health.label}
          </p>
          <p className="status-detail">{health.detail}</p>
        </div>
      </div>

      {isProjectHome ? (
        <section className="project-home" aria-labelledby="project-home-title">
          <p className="route-label">{studioT('studio.bootstrap.projectRouteLabel')}</p>
          <h2 id="project-home-title">{studioT('studio.bootstrap.projectHomeTitle')}</h2>
          <p>{studioT('studio.bootstrap.projectHomeSummary')}</p>
          <p>
            <a href={designSystemRoute}>{studioT('studio.bootstrap.openDesignSystemGallery')}</a>
          </p>
        </section>
      ) : (
        <section className="project-home" aria-labelledby="route-blocked-title">
          <p className="route-label">{studioT('studio.bootstrap.routeUnavailableLabel')}</p>
          <h2 id="route-blocked-title">{studioT('studio.bootstrap.routeBackTitle')}</h2>
          <p>{studioT('studio.bootstrap.routeUnavailableSummary')}</p>
        </section>
      )}

      <aside className="architecture-help" aria-label={studioT('studio.bootstrap.architectureHelpLabel')}>
        <strong>{studioT('studio.bootstrap.architectureHelpTitle')}</strong>
        <p>{studioT('studio.bootstrap.architectureHelpSummary')}</p>
        <code>{studioWorkspaceDescriptor.helpId}</code>
      </aside>
    </section>
  );
}

function resolveStudioWorkspace(pathname: string, health: ReturnType<typeof evaluateStudioBootstrapHealth>) {
  if (pathname === editorRoute) {
    return (
      <Suspense fallback={<StudioRouteSkeleton kind="editor" label="Cargando editor" />}>
        <StudioEditorWorkspace />
      </Suspense>
    );
  }
  if (pathname === contentRoute) {
    return (
      <Suspense fallback={<StudioRouteSkeleton kind="generic" label="Cargando contenido" />}>
        <StudioContentListDetailRoute />
      </Suspense>
    );
  }
  if (canonicalEmptyModuleRoutes.has(pathname)) {
    return (
      <Suspense fallback={<StudioRouteSkeleton kind="generic" label="Cargando módulo" />}>
        <StudioModuleEmptyStateRoute pathname={pathname} />
      </Suspense>
    );
  }
  return <StudioWorkspaceBootstrap pathname={pathname} health={health} />;
}

export function App() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const storage = useSyncExternalStore(
    projectStorageRuntime.subscribe,
    projectStorageRuntime.getSnapshot,
    projectStorageRuntime.getSnapshot,
  );

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function openEditor() {
    window.history.pushState({}, '', editorRoute);
    setPathname(editorRoute);
  }

  if (pathname === designSystemRoute) {
    return (
      <div className="ec-design-system">
        <Suspense fallback={<StudioRouteSkeleton kind="generic" label="Cargando Design System" />}>
          <DesignSystemDevelopmentRoute />
        </Suspense>
      </div>
    );
  }

  const health = evaluateStudioBootstrapHealth(studioWorkspaceDescriptor.dependencies);
  const shellStatus =
    health.state === 'blocked' || storage.state === 'blocked'
      ? 'blocked'
      : storage.state === 'error'
        ? 'error'
        : storage.state === 'saving'
          ? 'saving'
          : 'ready';

  const workspace =
    pathname === '/' ? (
      <Suspense fallback={<StudioRouteSkeleton kind="projects" label="Cargando proyectos" />}>
        <ProjectHome
          onOpen={async (id) => {
            const opened = await projectStorageRuntime.openProject(id);
            if (!opened) throw new Error('No se pudo abrir el proyecto.');
            openEditor();
          }}
        />
      </Suspense>
    ) : (
      resolveStudioWorkspace(pathname, health)
    );
  return <StudioAppShellRoute status={shellStatus}>{workspace}</StudioAppShellRoute>;
}
