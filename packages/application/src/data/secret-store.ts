import type {
  ElectroCraftObjectId,
  ElectroCraftSecretEnvironment,
  ElectroCraftSecretRef,
  JsonValue,
} from '@electrocraft/domain';
import type { StoredProjectObjectInput } from '../projects/project-storage';

export interface SecretStoreStatus {
  readonly refId: ElectroCraftObjectId;
  readonly environment: ElectroCraftSecretEnvironment;
  readonly configured: boolean;
  readonly provider: string;
  readonly updatedAt: string | null;
}

export interface SecretStoreWriteRequest {
  readonly ref: ElectroCraftSecretRef;
  readonly environment: ElectroCraftSecretEnvironment;
  readonly value: string;
}

export interface SecretStorePort {
  write(request: SecretStoreWriteRequest): Promise<SecretStoreStatus>;
  resolve(ref: ElectroCraftSecretRef, environment: ElectroCraftSecretEnvironment): Promise<string | null>;
  status(ref: ElectroCraftSecretRef, environment: ElectroCraftSecretEnvironment): Promise<SecretStoreStatus>;
  remove(ref: ElectroCraftSecretRef, environment: ElectroCraftSecretEnvironment): Promise<void>;
}

export type SecretStoreAdminPort = Pick<SecretStorePort, 'write' | 'status' | 'remove'>;

export function createStoredSecretRefObject(ref: ElectroCraftSecretRef): StoredProjectObjectInput {
  return Object.freeze({
    objectId: ref.id,
    kind: 'secret-ref',
    schemaVersion: ref.schemaVersion,
    payload: structuredClone(ref) as unknown as JsonValue,
  });
}
