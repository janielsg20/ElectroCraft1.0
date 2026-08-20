import type { ProjectStorageStatus } from '@electrocraft/application';

export interface BrowserStorageCapability {
  readonly backend: 'opfs-ahp' | 'indexeddb' | 'memory';
  readonly dataDir: string;
  readonly status: ProjectStorageStatus;
}

function isSafariBrowser(userAgent: string): boolean {
  return /Safari/i.test(userAgent) && !/(Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS)/i.test(userAgent);
}

export function resolveBrowserStorageCapability(environment: {
  readonly hasWorker: boolean;
  readonly hasIndexedDb: boolean;
  readonly hasOpfs: boolean;
  readonly userAgent: string;
}): BrowserStorageCapability {
  if (environment.hasWorker && environment.hasOpfs && !isSafariBrowser(environment.userAgent)) {
    return {
      backend: 'opfs-ahp',
      dataDir: 'opfs-ahp://electrocraft/studio/',
      status: { health: 'ready', backend: 'opfs-ahp', persistent: true, worker: true },
    };
  }
  if (environment.hasWorker && environment.hasIndexedDb) {
    return {
      backend: 'indexeddb',
      dataDir: 'idb://electrocraft-studio',
      status: {
        health: environment.hasOpfs ? 'degraded' : 'ready',
        backend: 'indexeddb',
        persistent: true,
        worker: true,
        reasonCode: environment.hasOpfs ? 'OPFS_UNSAFE_BROWSER' : 'OPFS_UNAVAILABLE',
      },
    };
  }
  return {
    backend: 'memory',
    dataDir: 'memory://',
    status: {
      health: 'degraded',
      backend: 'memory',
      persistent: false,
      worker: false,
      reasonCode: 'PERSISTENCE_UNAVAILABLE',
    },
  };
}

export function detectBrowserStorageCapability(): BrowserStorageCapability {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return resolveBrowserStorageCapability({ hasWorker: false, hasIndexedDb: false, hasOpfs: false, userAgent: '' });
  }
  return resolveBrowserStorageCapability({
    hasWorker: typeof Worker !== 'undefined',
    hasIndexedDb: typeof indexedDB !== 'undefined',
    hasOpfs: typeof navigator.storage?.getDirectory === 'function',
    userAgent: navigator.userAgent,
  });
}
