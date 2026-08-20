import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DEFAULT_BROWSER_STORAGE_BACKEND } from '@electrocraft/data-web';

const read = (path: string) => readFileSync(path, 'utf8');

describe('M04.2 multi-tab worker boundary', () => {
  it('keeps IndexedDB as the browser baseline and OPFS as an explicit optimization', () => {
    expect(DEFAULT_BROWSER_STORAGE_BACKEND).toBe('indexeddb');
    const browser = read('packages/data-web/src/browser.ts');
    expect(browser).toContain("preferredBackend ?? DEFAULT_BROWSER_STORAGE_BACKEND");
    expect(browser).toContain("preferredBackend === 'opfs-ahp'");
    expect(browser).toContain('idb://');
    expect(browser).toContain('opfs-ahp://');
  });

  it('uses the official PGlite multi-tab worker and revalidates leader handoff', () => {
    const browser = read('packages/data-web/src/browser.ts');
    expect(browser).toContain('PGliteWorker.create');
    expect(browser).toContain('id: databaseName');
    expect(browser).toContain('.onLeaderChange');
    expect(browser).toContain("lifecyclePhase: 'leader-handoff'");
    expect(browser).toContain('verifyStudioStorageHealth');
  });

  it('keeps PGlite/Drizzle behind data-web while application exposes generic coordination diagnostics', () => {
    const application = read('packages/application/src/projects/project-storage.ts');
    expect(application).not.toContain('@electric-sql/pglite');
    expect(application).not.toContain('drizzle-orm');
    expect(application).toContain("mode: 'multi-tab'");
    expect(application).toContain("'leader' | 'follower' | 'unknown'");
  });

  it('keeps the Vite configuration required by the official multi-tab worker', () => {
    const vite = read('apps/studio/vite.config.ts');
    expect(vite).toContain("exclude: ['@electric-sql/pglite']");
    expect(vite).toContain("format: 'es'");
  });
});
