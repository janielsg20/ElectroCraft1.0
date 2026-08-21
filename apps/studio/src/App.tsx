import { useSyncExternalStore } from 'react';
import { evaluateStudioBootstrapHealth } from './bootstrap-health';
import { projectStorageRuntime } from './features/projects/project-storage-runtime';
import { HelpTrigger } from './help/help-ui';
import { getHelpIdForNavigationItem } from './help/help-registry';
import { studioWorkspaceDescriptor } from './index';
import { studioT } from './i18n/studio-shell.es';
import { StudioAppShellRoute } from './shell/app-shell-route';
import { DesignSystemDevelopmentRoute } from './shell/design-system-route';
import { StudioEditorWorkspace } from './shell/editor-workspace';
import { StudioContentListDetailRoute, StudioModuleEmptyStateRoute } from './shell/information-architecture-ui';
import { resolveSidebarActiveItem } from './shell/sidebar-navigation';
import './styles.css';
import './shell/sidebar.css';
import './shell/topbar.css';
import './shell/editor-workspace.css';
import './shell/responsive-shell.css';
import './shell/information-architecture.css';

const projectHomeRoute = Object.freeze({
  id: 'project-home-development',
  pathname: '/',
  finalNavigation: false,
});

const designSystemRoute = '/__design-system';
const contentRoute = '/content';
const canonicalEmptyModuleRoutes = new Set(['/queries', '/forms', '/admin', '/media', '/export']);

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
  if (pathname === projectHomeRoute.pathname) return <StudioEditorWorkspace />;
  if (pathname === contentRoute) return <StudioContentListDetailRoute />;
  if (canonicalEmptyModuleRoutes.has(pathname)) return <StudioModuleEmptyStateRoute pathname={pathname} />;
  return <StudioWorkspaceBootstrap pathname={pathname} health={health} />;
}

export function App() {
  const pathname = window.location.pathname;
  const storage = useSyncExternalStore(
    projectStorageRuntime.subscribe,
    projectStorageRuntime.getSnapshot,
    projectStorageRuntime.getSnapshot,
  );

  if (pathname === designSystemRoute) {
    return <DesignSystemDevelopmentRoute />;
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

  return <StudioAppShellRoute status={shellStatus}>{resolveStudioWorkspace(pathname, health)}</StudioAppShellRoute>;
}
