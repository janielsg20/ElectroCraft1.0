import {
  createStoredSecretRefObject,
  type ConnectorGatewayStatus,
  type SecretStoreStatus,
} from '@electrocraft/application';
import {
  createDeterministicObjectId,
  electroCraftSecretRefSchema,
  type ElectroCraftSecretBinding,
  type ElectroCraftSecretEnvironment,
  type ElectroCraftSecretRef,
} from '@electrocraft/domain';
import { projectStorageRuntime } from '../projects/project-storage-runtime';
import { studioConnectorGateway, studioSecretStoreAdmin } from './studio-data-source-adapters';

export type DataIntegrationsState = 'initial' | 'loading' | 'ready' | 'saving' | 'error';

export interface DataIntegrationsSnapshot {
  readonly state: DataIntegrationsState;
  readonly refs: readonly ElectroCraftSecretRef[];
  readonly gateway: ConnectorGatewayStatus;
  readonly secretStatus: Readonly<Record<string, SecretStoreStatus>>;
  readonly message: string;
}

export interface CreateSecretRefInput {
  readonly label: string;
  readonly key: string;
  readonly environmentScope: readonly ElectroCraftSecretEnvironment[];
  readonly binding: ElectroCraftSecretBinding;
}

const listeners = new Set<() => void>();
let snapshot: DataIntegrationsSnapshot = Object.freeze({
  state: 'initial',
  refs: Object.freeze([]),
  gateway: Object.freeze({ configured: false, provider: 'none', message: 'Falta configuración.' }),
  secretStatus: Object.freeze({}),
  message: 'Integraciones pendientes de carga.',
});

function publish(next: DataIntegrationsSnapshot) {
  snapshot = Object.freeze({
    ...next,
    refs: Object.freeze([...next.refs]),
    secretStatus: Object.freeze({ ...next.secretStatus }),
  });
  for (const listener of listeners) listener();
  return snapshot;
}

function normalizeSecretKey(value: string) {
  const normalized = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
  const prefixed = /^[A-Z]/.test(normalized) ? normalized : `SECRET_${normalized || 'VALUE'}`;
  return prefixed.slice(0, 80);
}

function statusKey(refId: string, environment: ElectroCraftSecretEnvironment) {
  return `${refId}:${environment}`;
}

async function load() {
  publish({ ...snapshot, state: 'loading', message: 'Cargando Gateway y secretos…' });
  await projectStorageRuntime.initialize();
  const projectId = projectStorageRuntime.currentProjectId();
  const gatewayPort = studioConnectorGateway();
  const gateway = gatewayPort
    ? await gatewayPort.status().catch(() => ({
        configured: false,
        provider: 'connector-gateway',
        message: 'No se pudo contactar ConnectorGateway.',
      }))
    : { configured: false, provider: 'none', message: 'Falta configuración.' };

  if (!projectId) {
    return publish({
      state: 'ready',
      refs: [],
      gateway,
      secretStatus: {},
      message: 'Abre un proyecto para administrar referencias de secretos.',
    });
  }
  const opened = await projectStorageRuntime.openProject(projectId);
  const refs = (opened?.objects ?? [])
    .filter(({ kind }) => kind === 'secret-ref')
    .flatMap(({ payload }) => {
      const parsed = electroCraftSecretRefSchema.safeParse(payload);
      return parsed.success ? [parsed.data] : [];
    })
    .sort((left, right) => left.label.localeCompare(right.label, 'es'));
  return publish({
    state: 'ready',
    refs,
    gateway,
    secretStatus: {},
    message: gateway.configured ? `${refs.length} referencia(s) de secreto.` : 'Configura ConnectorGateway para usar secretos.',
  });
}

async function persistRef(ref: ElectroCraftSecretRef) {
  const projectId = projectStorageRuntime.currentProjectId();
  if (!projectId) throw new Error('Abre un proyecto antes de crear un secreto.');
  const opened = await projectStorageRuntime.openProject(projectId);
  if (!opened) throw new Error('El proyecto seleccionado ya no está disponible.');
  projectStorageRuntime.queueAutosave({ project: opened.project, dirtyObjects: [createStoredSecretRefObject(ref)] });
  await projectStorageRuntime.flushAutosave();
}

export const dataIntegrationsRuntime = Object.freeze({
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => snapshot,
  load,
  async createRef(input: CreateSecretRefInput) {
    const ref = electroCraftSecretRefSchema.parse({
      schemaVersion: 1,
      id: createDeterministicObjectId('secret', globalThis.crypto.randomUUID()),
      version: 1,
      key: normalizeSecretKey(input.key || input.label),
      label: input.label.trim(),
      environmentScope: [...input.environmentScope],
      binding: input.binding,
      metadata: { owner: 'ConnectorGateway' },
    });
    publish({ ...snapshot, state: 'saving', message: 'Guardando referencia de secreto…' });
    try {
      await persistRef(ref);
      await load();
      return ref;
    } catch (error) {
      publish({
        ...snapshot,
        state: 'error',
        message: error instanceof Error ? error.message : 'No se pudo guardar la referencia de secreto.',
      });
      throw error;
    }
  },
  async replaceSecret(ref: ElectroCraftSecretRef, environment: ElectroCraftSecretEnvironment, value: string) {
    const admin = studioSecretStoreAdmin();
    if (!admin) throw new Error('Falta configuración de ConnectorGateway.');
    publish({ ...snapshot, state: 'saving', message: 'Aplicando secreto…' });
    try {
      const status = await admin.write({ ref, environment, value });
      publish({
        ...snapshot,
        state: 'ready',
        secretStatus: { ...snapshot.secretStatus, [statusKey(ref.id, environment)]: status },
        message: 'Secreto aplicado. El valor no volverá a mostrarse.',
      });
      return status;
    } catch (error) {
      publish({ ...snapshot, state: 'error', message: error instanceof Error ? error.message : 'No se pudo aplicar el secreto.' });
      throw error;
    }
  },
  async refreshSecretStatus(ref: ElectroCraftSecretRef, environment: ElectroCraftSecretEnvironment) {
    const admin = studioSecretStoreAdmin();
    if (!admin) return null;
    const status = await admin.status(ref, environment);
    publish({ ...snapshot, secretStatus: { ...snapshot.secretStatus, [statusKey(ref.id, environment)]: status } });
    return status;
  },
  secretStatus(refId: string, environment: ElectroCraftSecretEnvironment) {
    return snapshot.secretStatus[statusKey(refId, environment)] ?? null;
  },
  async removeSecret(ref: ElectroCraftSecretRef, environment: ElectroCraftSecretEnvironment) {
    const admin = studioSecretStoreAdmin();
    if (!admin) throw new Error('Falta configuración de ConnectorGateway.');
    await admin.remove(ref, environment);
    const status = await admin.status(ref, environment);
    publish({
      ...snapshot,
      secretStatus: { ...snapshot.secretStatus, [statusKey(ref.id, environment)]: status },
      message: 'Secreto eliminado del almacén del servidor.',
    });
  },
});
