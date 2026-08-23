import {
  WORKSPACE_LAYOUT_LIMITS,
  resolveResponsiveWorkspaceLayout,
  type WorkspacePanelId,
} from '@electrocraft/application';
import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { evaluateStudioBootstrapHealth } from './bootstrap-health';
import { projectStorageRuntime } from './features/projects/project-storage-runtime';
import { workspacePreferencesRuntime } from './features/projects/workspace-preferences-runtime';
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
import './shell/workspace-preferences.css';

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

function subscribeViewport(listener: () => void) {
  if (typeof window === 'undefined') return () => undefined;
  window.addEventListener('resize', listener, { passive: true });
  return () => window.removeEventListener('resize', listener);
}

function getViewportWidth() {
  return typeof window === 'undefined' ? 1440 : window.innerWidth;
}

function clampPaneWidth(side: 'context' | 'inspector', value: number) {
  const limits = WORKSPACE_LAYOUT_LIMITS[side];
  return Math.min(limits.maxSize, Math.max(limits.minSize, Math.round(value)));
}

function WorkspaceAwareEditor() {
  const preferences = useSyncExternalStore(
    workspacePreferencesRuntime.subscribe,
    workspacePreferencesRuntime.getSnapshot,
    workspacePreferencesRuntime.getSnapshot,
  );
  const viewportWidth = useSyncExternalStore(subscribeViewport, getViewportWidth, () => 1440);
  const resolved = resolveResponsiveWorkspaceLayout(preferences.layout, viewportWidth);
  const [paneWidths, setPaneWidths] = useState(() => ({
    contextWidth: resolved.contextWidth,
    inspectorWidth: resolved.inspectorWidth,
  }));
  const cleanupDragRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    setPaneWidths({ contextWidth: resolved.contextWidth, inspectorWidth: resolved.inspectorWidth });
  }, [resolved.contextWidth, resolved.inspectorWidth]);

  useEffect(() => () => cleanupDragRef.current(), []);

  function startPaneDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const handle = target.closest<HTMLElement>('[data-resize-side]');
    const resizeSide = handle?.dataset.resizeSide;
    if (resizeSide !== 'left' && resizeSide !== 'right') return;

    cleanupDragRef.current();
    const panel = resizeSide === 'left' ? 'context' : 'inspector';
    const startX = event.clientX;
    const startWidth = panel === 'context' ? paneWidths.contextWidth : paneWidths.inspectorWidth;
    let latestWidth = startWidth;

    const move = (pointerEvent: PointerEvent) => {
      const delta = pointerEvent.clientX - startX;
      latestWidth = clampPaneWidth(panel, startWidth + (panel === 'context' ? delta : -delta));
      setPaneWidths((current) => ({
        ...current,
        ...(panel === 'context' ? { contextWidth: latestWidth } : { inspectorWidth: latestWidth }),
      }));
    };
    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
      cleanupDragRef.current = () => undefined;
      const patch = panel === 'context' ? { contextWidth: latestWidth } : { inspectorWidth: latestWidth };
      void workspacePreferencesRuntime.patchLayout(patch);
    };

    cleanupDragRef.current = stop;
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
  }

  function resizePaneWithKeyboard(event: ReactKeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const handle = target.closest<HTMLElement>('[data-resize-side]');
    const resizeSide = handle?.dataset.resizeSide;
    if (resizeSide !== 'left' && resizeSide !== 'right') return;

    const panel = resizeSide === 'left' ? 'context' : 'inspector';
    const limits = WORKSPACE_LAYOUT_LIMITS[panel];
    const currentWidth = panel === 'context' ? paneWidths.contextWidth : paneWidths.inspectorWidth;
    const step = event.shiftKey ? 24 : 8;
    let nextWidth: number | null = null;

    if (event.key === 'Home') nextWidth = limits.minSize;
    if (event.key === 'End') nextWidth = limits.maxSize;
    if (event.key === 'ArrowLeft') nextWidth = currentWidth + (panel === 'context' ? -step : step);
    if (event.key === 'ArrowRight') nextWidth = currentWidth + (panel === 'context' ? step : -step);
    if (nextWidth === null) return;

    const clampedWidth = clampPaneWidth(panel, nextWidth);
    setPaneWidths((current) => ({
      ...current,
      ...(panel === 'context' ? { contextWidth: clampedWidth } : { inspectorWidth: clampedWidth }),
    }));
    const patch = panel === 'context' ? { contextWidth: clampedWidth } : { inspectorWidth: clampedWidth };
    void workspacePreferencesRuntime.patchLayout(patch);
  }

  const visible = new Set<WorkspacePanelId>(resolved.visiblePanels);
  const style = {
    '--ec-workspace-context-width': `${paneWidths.contextWidth}px`,
    '--ec-workspace-inspector-width': `${paneWidths.inspectorWidth}px`,
  } as CSSProperties;

  return (
    <div
      className="ec-workspace-editor-preferences"
      style={style}
      data-context-visible={visible.has('context') ? 'true' : 'false'}
      data-inspector-visible={visible.has('inspector') ? 'true' : 'false'}
      onPointerDownCapture={startPaneDrag}
      onKeyDownCapture={resizePaneWithKeyboard}
    >
      <StudioEditorWorkspace />
    </div>
  );
}

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
        <WorkspaceAwareEditor />
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
            await workspacePreferencesRuntime.patchLayout({ lastDocumentId: opened.project.id });
            openEditor();
          }}
        />
      </Suspense>
    ) : (
      resolveStudioWorkspace(pathname, health)
    );
  return <StudioAppShellRoute status={shellStatus}>{workspace}</StudioAppShellRoute>;
}
