import { Skeleton } from '@electrocraft/design-system';

export type StudioRouteLoadingKind = 'projects' | 'editor' | 'generic';

export function StudioRouteSkeleton({
  kind,
  label,
}: {
  readonly kind: StudioRouteLoadingKind;
  readonly label: string;
}) {
  if (kind === 'projects') {
    return (
      <section className="ec-route-skeleton ec-route-skeleton--projects" role="status" aria-live="polite">
        <span className="sr-only">{label}</span>
        <div className="ec-route-skeleton-heading" aria-hidden="true">
          <div className="ec-route-skeleton-title">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-3 w-56 max-w-[42vw]" />
        </div>
        <div className="ec-route-skeleton-toolbar" aria-hidden="true">
          <Skeleton className="h-8 min-w-44 flex-1" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="ec-route-skeleton-project-grid" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="ec-route-skeleton-project-card" key={index}>
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
              <div className="ec-route-skeleton-actions">
                <Skeleton className="h-7 w-16" />
                <Skeleton className="h-7 w-16" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (kind === 'editor') {
    return (
      <section className="ec-route-skeleton ec-route-skeleton--editor" role="status" aria-live="polite">
        <span className="sr-only">{label}</span>
        <aside className="ec-route-skeleton-editor-panel" aria-hidden="true">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-4/5" />
        </aside>
        <div className="ec-route-skeleton-canvas" aria-hidden="true">
          <Skeleton className="h-7 w-40" />
          <div className="ec-route-skeleton-canvas-sheet">
            <Skeleton className="h-7 w-2/5" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
            <Skeleton className="mt-4 h-24 w-full" />
          </div>
        </div>
        <aside className="ec-route-skeleton-editor-panel" aria-hidden="true">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-20 w-full" />
        </aside>
      </section>
    );
  }

  return (
    <section className="ec-route-skeleton ec-route-skeleton--generic" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-36 w-full" />
    </section>
  );
}
