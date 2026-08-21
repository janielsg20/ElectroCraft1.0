import { PGlite } from '@electric-sql/pglite';
import { worker } from '@electric-sql/pglite/worker';

interface StorageLeaderMeta {
  readonly clientId?: unknown;
  readonly leaderSignalChannel?: unknown;
}

const LEADER_REQUEST = 'electrocraft-storage-leader-request' as const;
const LEADER_ACTIVE = 'electrocraft-storage-leader-active' as const;

function createLeaderSignal(meta: StorageLeaderMeta | undefined) {
  if (typeof meta?.clientId !== 'string' || typeof meta.leaderSignalChannel !== 'string') return null;
  const channel = new BroadcastChannel(meta.leaderSignalChannel);
  const announce = () => {
    channel.postMessage({ type: LEADER_ACTIVE, clientId: meta.clientId });
  };
  channel.addEventListener('message', (event) => {
    if (event.data?.type === LEADER_REQUEST) announce();
  });
  return { announce } as const;
}

worker({
  async init(options) {
    // PGlite calls init() only inside the elected leader worker. The small
    // BroadcastChannel signal therefore identifies the real leader without
    // reimplementing or competing with PGlite's own Web Locks election.
    const leaderSignal = createLeaderSignal(options.meta as StorageLeaderMeta | undefined);
    const db = await PGlite.create({
      dataDir: options.dataDir,
      relaxedDurability: false,
    });
    leaderSignal?.announce();
    return db;
  },
});
