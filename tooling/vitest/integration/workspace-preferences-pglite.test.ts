import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import { DEFAULT_STUDIO_WORKSPACE_PREFERENCES } from '@electrocraft/application';
import { applyStudioStorageMigrations, createDrizzleProjectRepository } from '@electrocraft/data-web';
import * as schema from '../../../packages/data-web/src/schema';
describe('M04.7 PGlite preferences', () => {
  it('persists, reopens and resets Studio-only layout', async () => {
    const c = await PGlite.create('memory://');
    try {
      await applyStudioStorageMigrations(c);
      let r = createDrizzleProjectRepository(drizzle(c, { schema }));
      await r.saveWorkspacePreferences('device', {
        ...DEFAULT_STUDIO_WORKSPACE_PREFERENCES,
        sidebarSide: 'right',
        sidebarDisplay: 'icons',
        groupOrder: ['data', 'build'],
        layouts: [{ id: 'focus', name: 'Foco', contextWidth: 260, inspectorWidth: 300, visiblePanels: ['canvas'] }],
      });
      r = createDrizzleProjectRepository(drizzle(c, { schema }));
      expect(await r.getWorkspacePreferences('device')).toMatchObject({
        sidebarSide: 'right',
        sidebarDisplay: 'icons',
        groupOrder: ['data', 'build'],
      });
      await r.resetWorkspacePreferences('device');
      expect(await r.getWorkspacePreferences('device')).toEqual(DEFAULT_STUDIO_WORKSPACE_PREFERENCES);
    } finally {
      await c.close();
    }
  });
});
