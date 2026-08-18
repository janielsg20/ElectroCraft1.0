import { Button, StudioThemeProvider, TooltipProvider } from '@electrocraft/design-system';
import { evaluateStudioBootstrapHealth } from './bootstrap-health';
import { tStudio } from './i18n/es';
import { studioWorkspaceDescriptor } from './index';
import { DesignSystemGallery } from './shell/DesignSystemGallery';

function RouteUnavailable() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-4 text-foreground">
      <section className="w-full max-w-lg rounded-lg border bg-card p-5 shadow-[var(--ec-shadow-panel)]" aria-labelledby="route-unavailable-title">
        <h1 id="route-unavailable-title" className="text-lg font-semibold text-card-foreground">
          {tStudio('route.unavailable')}
        </h1>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{tStudio('route.summary')}</p>
        <Button asChild size="sm" className="mt-4">
          <a href="/">{tStudio('route.backHome')}</a>
        </Button>
      </section>
    </main>
  );
}

export function App() {
  const health = evaluateStudioBootstrapHealth(studioWorkspaceDescriptor.dependencies);
  const isProjectHome = window.location.pathname === '/';

  return (
    <StudioThemeProvider>
      <TooltipProvider>{isProjectHome ? <DesignSystemGallery health={health} /> : <RouteUnavailable />}</TooltipProvider>
    </StudioThemeProvider>
  );
}
