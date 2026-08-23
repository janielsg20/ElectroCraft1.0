# ADR — Studio shell-first progressive loading

Status: Accepted
Date: 2026-08-22

## Context

ElectroCraft Studio must remain usable on slow connections and modest mobile hardware. The workspace shell, navigation and essential controls should not wait for editor engines, project tooling, galleries or secondary dialogs.

## Decision

Use a shell-first progressive loading model.

1. Render the Studio shell, navigation, topbar, theme and status surface first.
2. Lazy-load route modules that are not required for the current viewport or initial interaction.
3. Use geometry-matched skeletons for first-load content regions so layout does not jump when the module or data arrives.
4. Keep already rendered content visible during refreshes and show a compact local loader instead of replacing the whole screen.
5. Use loaders for explicit actions such as open, save, create or deferred dialog/module preparation.
6. Never block the entire Studio for a secondary module when the shell can remain interactive.
7. Loading indicators must expose accessible status text and respect `prefers-reduced-motion`.
8. Skeletons are presentation-only and must be hidden from assistive technology; their containing region owns the loading announcement.
9. Avoid expensive loading decoration: no image placeholders, blur-heavy overlays or gradient shimmer loops.
10. Prefer solid semantic surfaces, stable dimensions and CSS containment/content visibility where it reduces offscreen work without breaking focus or accessibility.

## Initial implementation

- `ProjectHome`, the Editor workspace and the internal Design System route are route-level lazy chunks.
- The New Project wizard is loaded only after the user requests it.
- Project data uses collection skeletons only for the initial empty load.
- Project refreshes preserve stale content while a compact loader communicates progress.
- `Skeleton` and `Loader` are shared Design System primitives.

## Consequences

- Faster first interactive shell and less initial JavaScript.
- Reduced layout shift during chunk/data loading.
- Loading states remain local and understandable.
- Route and feature authors must provide an appropriate skeleton or local loader when introducing meaningful asynchronous work.
