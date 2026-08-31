import type { SecretStorePort, SecretStoreStatus, SecretStoreWriteRequest } from '@electrocraft/application';
import {
  secretEnvironmentVariableName,
  type ElectroCraftSecretEnvironment,
  type ElectroCraftSecretRef,
} from '@electrocraft/domain';

export class SecretStoreError extends Error {
  constructor(
    readonly code: 'SECRET_WRITE_DISABLED' | 'SECRET_ENVIRONMENT_DISABLED' | 'SECRET_VALUE_INVALID',
    message: string,
  ) {
    super(message);
    this.name = 'SecretStoreError';
  }
}

export interface ServerEnvironmentSecretStoreOptions {
  readonly environment: Record<string, string | undefined>;
  readonly allowWrites?: boolean;
  readonly provider?: string;
}

export class ServerEnvironmentSecretStore implements SecretStorePort {
  private readonly environment: Record<string, string | undefined>;
  private readonly allowWrites: boolean;
  private readonly provider: string;

  constructor(options: ServerEnvironmentSecretStoreOptions) {
    this.environment = options.environment;
    this.allowWrites = options.allowWrites ?? false;
    this.provider = options.provider ?? 'server-env';
  }

  private assertEnvironment(ref: ElectroCraftSecretRef, environment: ElectroCraftSecretEnvironment) {
    if (!ref.environmentScope.includes(environment)) {
      throw new SecretStoreError(
        'SECRET_ENVIRONMENT_DISABLED',
        `El secreto ${ref.label} no está habilitado para ${environment}.`,
      );
    }
  }

  private variableName(ref: ElectroCraftSecretRef, environment: ElectroCraftSecretEnvironment) {
    this.assertEnvironment(ref, environment);
    return secretEnvironmentVariableName(ref, environment);
  }

  async write(request: SecretStoreWriteRequest): Promise<SecretStoreStatus> {
    if (!this.allowWrites) {
      throw new SecretStoreError(
        'SECRET_WRITE_DISABLED',
        'El almacén server-env es de solo lectura; usa un secret manager de servidor para reemplazar valores.',
      );
    }
    if (!request.value.trim()) {
      throw new SecretStoreError('SECRET_VALUE_INVALID', 'El valor secreto no puede estar vacío.');
    }
    this.environment[this.variableName(request.ref, request.environment)] = request.value;
    return this.status(request.ref, request.environment);
  }

  async resolve(ref: ElectroCraftSecretRef, environment: ElectroCraftSecretEnvironment) {
    return this.environment[this.variableName(ref, environment)] ?? null;
  }

  async status(ref: ElectroCraftSecretRef, environment: ElectroCraftSecretEnvironment): Promise<SecretStoreStatus> {
    const configured = Boolean(this.environment[this.variableName(ref, environment)]);
    return Object.freeze({
      refId: ref.id,
      environment,
      configured,
      provider: this.provider,
      updatedAt: null,
    });
  }

  async remove(ref: ElectroCraftSecretRef, environment: ElectroCraftSecretEnvironment) {
    if (!this.allowWrites) {
      throw new SecretStoreError(
        'SECRET_WRITE_DISABLED',
        'El almacén server-env es de solo lectura; elimina el valor desde el servidor o secret manager.',
      );
    }
    delete this.environment[this.variableName(ref, environment)];
  }
}

export function createServerEnvironmentSecretStore(options: ServerEnvironmentSecretStoreOptions) {
  return new ServerEnvironmentSecretStore(options);
}
