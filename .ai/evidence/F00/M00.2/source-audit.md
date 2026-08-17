# Source audit — F00 / M00.2

Verified: 2026-08-17. Only official/primary documentation or repositories are used for the architecture corrections below.

## Critical current corrections
- shadcn/ui: Base UI became the default for new projects in July 2026 while Radix remains fully supported. ElectroCraft therefore chooses Radix explicitly: https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default
- shadcn CLI supports explicit base selection: https://ui.shadcn.com/docs/changelog/2026-03-cli-v4
- Gemini API versions: Interactions core is GA in `v1`; SDKs default to `v1beta`, and `v1` can be selected explicitly: https://ai.google.dev/gemini-api/docs/api-versions
- Gemini recommends Interactions for new development: https://ai.google.dev/gemini-api/docs/interactions-overview
- TanStack Table v9 is beta and requires the beta dist-tag; omitting it keeps the stable v8 line: https://tanstack.com/table/beta/docs/installation
- dnd-kit documents migration from legacy `@dnd-kit/core` to `@dnd-kit/react`: https://dndkit.com/react/guides/migration/
- Expo SQLite web support is alpha; native remains the target baseline: https://docs.expo.dev/versions/latest/sdk/sqlite/
- Puck permissions/history/viewports are public APIs: https://puckeditor.com/docs/api-reference/permissions and https://puckeditor.com/docs/api-reference/puck-api
- PGlite multi-tab Worker is an official ownership concern: https://pglite.dev/docs/multi-tab-worker
- PGlite 0.5.5 was verified from the official `@electric-sql/pglite@0.5.5` tag/package in `electric-sql/pglite`.
- i18next latest observed release during the audit: v26.3.6 in `i18next/i18next` official releases.
- Drizzle ORM latest stable observed release during the audit: 0.45.2 in `drizzle-team/drizzle-orm` official releases; 1.0 RC is not silently adopted.
- Zod latest observed release during the audit: v4.4.3 in `colinhacks/zod` official releases.

The complete source list for all audited engines lives in `experiments/m00-2-oss-audit/engine-audit.json`.
