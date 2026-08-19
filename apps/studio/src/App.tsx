import { evaluateStudioBootstrapHealth } from './bootstrap-health';
import { studioWorkspaceDescriptor } from './index';
import { studioT } from './i18n/studio-shell.es';
import { StudioAppShellRoute } from './shell/app-shell-route';
import { DesignSystemDevelopmentRoute } from './shell/design-system-route';
import './styles.css';
import './shell/sidebar.css';

const projectHomeRoute = Object.freeze({
  id: 'project-home-development',
  pathname: '/',
  finalNavigation: false,
});

const designSystemRoute = '/__design-system';

function StudioWorkspaceBootstrap({
  pathname,
  health,
}: {
  readonly pathname: string;
  readonly health: ReturnType<typeof evaluateStudioBootstrapHealth>;
}) {
  const isProjectHome = pathname === projectHomeRoute.pathname;

  return (
    <section className="workspace-bootstrap" data-help-id={studioWorkspaceDescriptor.helpId}>
      <p className="development-kicker">{studioT('studio.bootstrap.m03Kicker')}</p>
      <h1 id="development-title">{studioT('studio.bootstrap.title')}</h1>
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

export function App() {
  const pathname = window.location.pathname;

  if (pathname === designSystemRoute) {
    return <DesignSystemDevelopmentRoute />;
  }

  const health = evaluateStudioBootstrapHealth(studioWorkspaceDescriptor.dependencies);
  const shellStatus = health.state === 'blocked' ? 'blocked' : 'ready';

  return (
    <StudioAppShellRoute status={shellStatus} pathname={pathname}>
      <StudioWorkspaceBootstrap pathname={pathname} health={health} />
    </StudioAppShellRoute>
  );
}
