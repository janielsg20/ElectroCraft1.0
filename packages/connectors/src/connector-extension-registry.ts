import {
  ConnectorRegistry,
  dataSourceConnectorRegistry,
  type DataSourceAdapter,
  type ElectroCraftDataConnector,
} from '@electrocraft/application';
import {
  connectorExtensionManifestSchema,
  normalizeDataSourceCapabilities,
  type ConnectorExtensionConfigField,
  type ConnectorExtensionManifest,
  type ElectroCraftDataSourceDefinition,
  type ElectroCraftExportTargetId,
  type JsonValue,
} from '@electrocraft/domain';

export type ConnectorExtensionRegistryErrorCode =
  | 'CONNECTOR_EXTENSION_COLLISION'
  | 'CONNECTOR_EXTENSION_RUNTIME_MISMATCH'
  | 'CONNECTOR_EXTENSION_IN_USE'
  | 'CONNECTOR_EXTENSION_NOT_INSTALLED';

export class ConnectorExtensionRegistryError extends Error {
  constructor(
    readonly code: ConnectorExtensionRegistryErrorCode,
    message: string,
    readonly details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = 'ConnectorExtensionRegistryError';
  }
}

export interface ConnectorExtensionInstallInput {
  readonly manifest: ConnectorExtensionManifest;
  readonly adapter: DataSourceAdapter;
  readonly connector?: ElectroCraftDataConnector;
}

export interface ConnectorExtensionInstallation {
  readonly adapterId: string;
  readonly manifest: ConnectorExtensionManifest;
}

export interface ConnectorRuntimeDependency {
  readonly adapterId: string;
  readonly packageId: string;
  readonly version: string;
  readonly browserModule: string | null;
  readonly gatewayModule: string | null;
  readonly targetSupport: readonly ElectroCraftExportTargetId[];
}

export type ConnectorExtensionSourceDiagnosticCode =
  | 'MISSING_CONNECTOR_EXTENSION'
  | 'EXTENSION_SOURCE_KIND_MISMATCH'
  | 'EXTENSION_CAPABILITY_MISMATCH'
  | 'EXTENSION_CONFIG_REQUIRED'
  | 'EXTENSION_CONFIG_INVALID'
  | 'EXTENSION_SECRET_REF_REQUIRED';

export interface ConnectorExtensionSourceDiagnostic {
  readonly code: ConnectorExtensionSourceDiagnosticCode;
  readonly adapterId: string;
  readonly sourceId: string;
  readonly fieldKey?: string;
  readonly message: string;
}

function validateRuntimeCompatibility(manifest: ConnectorExtensionManifest, adapter: DataSourceAdapter) {
  if (adapter.adapterId !== manifest.adapterId) {
    throw new ConnectorExtensionRegistryError(
      'CONNECTOR_EXTENSION_RUNTIME_MISMATCH',
      'El adapter instalado no coincide con el manifest del conector.',
      { manifestAdapterId: manifest.adapterId, runtimeAdapterId: adapter.adapterId },
    );
  }

  if (!adapter.supportedDataSourceKinds.includes(manifest.sourceKind)) {
    throw new ConnectorExtensionRegistryError(
      'CONNECTOR_EXTENSION_RUNTIME_MISMATCH',
      'El adapter instalado no admite el tipo de fuente declarado por la extensión.',
      { adapterId: manifest.adapterId, sourceKind: manifest.sourceKind },
    );
  }

  const missingCapabilities = manifest.capabilities.filter((capability) => !adapter.capabilities.includes(capability));
  if (missingCapabilities.length > 0) {
    throw new ConnectorExtensionRegistryError(
      'CONNECTOR_EXTENSION_RUNTIME_MISMATCH',
      'El adapter instalado no implementa todas las capacidades declaradas por la extensión.',
      { adapterId: manifest.adapterId, missingCapabilities },
    );
  }
}

function matchesConfigFieldType(field: ConnectorExtensionConfigField, value: JsonValue): boolean {
  if (field.type === 'string') return typeof value === 'string';
  if (field.type === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (field.type === 'boolean') return typeof value === 'boolean';
  if (field.type === 'url') {
    if (typeof value !== 'string') return false;
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  }
  return true;
}

function validateSourceAgainstManifest(
  source: ElectroCraftDataSourceDefinition,
  manifest: ConnectorExtensionManifest,
): readonly ConnectorExtensionSourceDiagnostic[] {
  const diagnostics: ConnectorExtensionSourceDiagnostic[] = [];

  if (source.kind !== manifest.sourceKind) {
    diagnostics.push({
      code: 'EXTENSION_SOURCE_KIND_MISMATCH',
      adapterId: source.adapterId,
      sourceId: source.id,
      message: `El conector ${source.adapterId} requiere una fuente ${manifest.sourceKind}.`,
    });
  }

  const manifestCapabilities = new Set(manifest.capabilities);
  const unsupportedCapabilities = normalizeDataSourceCapabilities(source.capabilities).filter(
    (capability) => !manifestCapabilities.has(capability),
  );
  if (unsupportedCapabilities.length > 0) {
    diagnostics.push({
      code: 'EXTENSION_CAPABILITY_MISMATCH',
      adapterId: source.adapterId,
      sourceId: source.id,
      message: `La fuente solicita capacidades que la extensión no declara: ${unsupportedCapabilities.join(', ')}.`,
    });
  }

  for (const field of manifest.configSchema.fields) {
    if (field.type === 'secret-ref') {
      if (field.required && !source.authRef) {
        diagnostics.push({
          code: 'EXTENSION_SECRET_REF_REQUIRED',
          adapterId: source.adapterId,
          sourceId: source.id,
          fieldKey: field.key,
          message: `${field.label} requiere una SecretRef configurada mediante Gateway.`,
        });
      }
      continue;
    }

    const value = source.config[field.key];
    if (value === undefined) {
      if (field.required && field.defaultValue === undefined) {
        diagnostics.push({
          code: 'EXTENSION_CONFIG_REQUIRED',
          adapterId: source.adapterId,
          sourceId: source.id,
          fieldKey: field.key,
          message: `Falta el campo obligatorio ${field.label}.`,
        });
      }
      continue;
    }

    if (!matchesConfigFieldType(field, value)) {
      diagnostics.push({
        code: 'EXTENSION_CONFIG_INVALID',
        adapterId: source.adapterId,
        sourceId: source.id,
        fieldKey: field.key,
        message: `El valor de ${field.label} no cumple el tipo ${field.type} declarado por la extensión.`,
      });
    }
  }

  return Object.freeze(diagnostics);
}

export class ConnectorExtensionRegistry {
  private readonly installed = new Map<string, ConnectorExtensionManifest>();

  constructor(private readonly connectorRegistry: ConnectorRegistry) {}

  install(input: ConnectorExtensionInstallInput): ConnectorExtensionInstallation {
    const manifest = connectorExtensionManifestSchema.parse(input.manifest);
    validateRuntimeCompatibility(manifest, input.adapter);

    if (input.connector && input.connector.adapterId !== manifest.adapterId) {
      throw new ConnectorExtensionRegistryError(
        'CONNECTOR_EXTENSION_RUNTIME_MISMATCH',
        'El DataConnector instalado no coincide con el manifest de la extensión.',
        { manifestAdapterId: manifest.adapterId, connectorAdapterId: input.connector.adapterId },
      );
    }

    if (this.connectorRegistry.has(manifest.adapterId) && !this.installed.has(manifest.adapterId)) {
      throw new ConnectorExtensionRegistryError(
        'CONNECTOR_EXTENSION_COLLISION',
        'El adapterId de la extensión ya pertenece a un conector Core o a otro owner.',
        { adapterId: manifest.adapterId },
      );
    }

    if (this.installed.has(manifest.adapterId)) {
      this.connectorRegistry.unregister(manifest.adapterId);
    }

    this.connectorRegistry.registerAdapter(input.adapter);
    if (input.connector) this.connectorRegistry.register(input.connector);
    this.installed.set(manifest.adapterId, manifest);

    return Object.freeze({ adapterId: manifest.adapterId, manifest });
  }

  uninstall(adapterId: string, sources: readonly ElectroCraftDataSourceDefinition[]): boolean {
    if (!this.installed.has(adapterId)) return false;

    const consumers = sources.filter((source) => source.adapterId === adapterId);
    if (consumers.length > 0) {
      throw new ConnectorExtensionRegistryError(
        'CONNECTOR_EXTENSION_IN_USE',
        'No se puede desinstalar el conector porque existen fuentes de datos que todavía lo usan.',
        { adapterId, sourceIds: consumers.map((source) => source.id) },
      );
    }

    this.connectorRegistry.unregister(adapterId);
    this.installed.delete(adapterId);
    return true;
  }

  requireInstalled(adapterId: string): ConnectorExtensionManifest {
    const manifest = this.installed.get(adapterId);
    if (!manifest) {
      throw new ConnectorExtensionRegistryError(
        'CONNECTOR_EXTENSION_NOT_INSTALLED',
        'El conector requerido no está instalado.',
        { adapterId },
      );
    }
    return manifest;
  }

  isInstalled(adapterId: string): boolean {
    return this.installed.has(adapterId);
  }

  getInstalled(adapterId: string): ConnectorExtensionManifest | null {
    return this.installed.get(adapterId) ?? null;
  }

  listInstalled(): readonly ConnectorExtensionInstallation[] {
    return Object.freeze(
      [...this.installed.values()]
        .map((manifest) => Object.freeze({ adapterId: manifest.adapterId, manifest }))
        .sort((left, right) => left.manifest.extensionPackage.displayName.localeCompare(right.manifest.extensionPackage.displayName)),
    );
  }

  diagnoseSource(source: ElectroCraftDataSourceDefinition): readonly ConnectorExtensionSourceDiagnostic[] {
    if (!this.connectorRegistry.has(source.adapterId)) {
      return Object.freeze([
        {
          code: 'MISSING_CONNECTOR_EXTENSION' as const,
          adapterId: source.adapterId,
          sourceId: source.id,
          message: `Falta el conector ${source.adapterId}. Instala la extensión requerida antes de usar esta fuente.`,
        },
      ]);
    }

    const manifest = this.installed.get(source.adapterId);
    return manifest ? validateSourceAgainstManifest(source, manifest) : Object.freeze([]);
  }

  pruneRuntimeDependencies(
    sources: readonly ElectroCraftDataSourceDefinition[],
  ): readonly ConnectorRuntimeDependency[] {
    const usedAdapterIds = new Set(sources.map((source) => source.adapterId));
    return Object.freeze(
      [...this.installed.values()]
        .filter((manifest) => usedAdapterIds.has(manifest.adapterId))
        .map((manifest) =>
          Object.freeze({
            adapterId: manifest.adapterId,
            packageId: manifest.extensionPackage.packageId,
            version: manifest.extensionPackage.version,
            browserModule: manifest.runtime.browserModule,
            gatewayModule: manifest.runtime.gatewayModule,
            targetSupport: Object.freeze([...manifest.targetSupport]),
          }),
        )
        .sort((left, right) => left.packageId.localeCompare(right.packageId)),
    );
  }
}

export const connectorExtensionRegistry = new ConnectorExtensionRegistry(dataSourceConnectorRegistry);
