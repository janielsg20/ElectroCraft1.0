import type { ConnectorRegistry } from '@electrocraft/application';
import type {
  ConnectorExtensionManifest,
  ElectroCraftCanonicalDataSourceCapability,
  ElectroCraftDataSourceKind,
} from '@electrocraft/domain';

export type ConnectorCatalogOrigin = 'core' | 'extension';
export type ConnectorCatalogAvailability = 'installed' | 'unavailable';
export type ConnectorCatalogGatewayRequirement = 'none' | 'optional' | 'required';

export interface ConnectorExtensionCatalogReader {
  isInstalled(adapterId: string): boolean;
  getInstalled(adapterId: string): ConnectorExtensionManifest | null;
}

export interface ConnectorCatalogEntry {
  readonly id: string;
  readonly adapterId: string;
  readonly label: string;
  readonly description: string;
  readonly origin: ConnectorCatalogOrigin;
  readonly sourceKind: ElectroCraftDataSourceKind;
  readonly availability: ConnectorCatalogAvailability;
  readonly version: string | null;
  readonly capabilities: readonly ElectroCraftCanonicalDataSourceCapability[];
  readonly gateway: ConnectorCatalogGatewayRequirement;
  readonly compatibility: string;
  readonly installHref: string | null;
}

interface CoreConnectorCatalogDefinition {
  readonly id: string;
  readonly adapterId: string;
  readonly label: string;
  readonly description: string;
  readonly sourceKind: ElectroCraftDataSourceKind;
  readonly gateway: ConnectorCatalogGatewayRequirement;
}

interface OptionalConnectorCatalogDefinition {
  readonly id: string;
  readonly adapterId: string;
  readonly packageId: string;
  readonly label: string;
  readonly description: string;
  readonly sourceKind: ElectroCraftDataSourceKind;
  readonly capabilities: readonly ElectroCraftCanonicalDataSourceCapability[];
  readonly gateway: 'required';
}

const coreConnectors = Object.freeze([
  {
    id: 'internal',
    adapterId: 'internal.pglite',
    label: 'ElectroCraft Data',
    description: 'Datos internos locales sobre PGlite/Drizzle.',
    sourceKind: 'internal',
    gateway: 'none',
  },
  {
    id: 'rest',
    adapterId: 'rest.fetch',
    label: 'REST API',
    description: 'Fetch/OpenAPI con Gateway cuando la autenticación usa secretos.',
    sourceKind: 'rest',
    gateway: 'optional',
  },
  {
    id: 'graphql',
    adapterId: 'graphql.fetch',
    label: 'GraphQL',
    description: 'Query/Mutation e introspection con Gateway cuando se requieren secretos.',
    sourceKind: 'graphql',
    gateway: 'optional',
  },
] as const satisfies readonly CoreConnectorCatalogDefinition[]);

const optionalConnectorPacks = Object.freeze([
  {
    id: 'postgresql',
    adapterId: 'sql.postgresql',
    packageId: 'electrocraft.connector.postgresql',
    label: 'PostgreSQL',
    description: 'Pack SQL opcional. Core no incluye el driver; la ejecución se mantiene detrás del Gateway.',
    sourceKind: 'sql',
    capabilities: ['read', 'create', 'update', 'delete', 'filtering', 'sort', 'pagination', 'transactions'],
    gateway: 'required',
  },
  {
    id: 'mysql',
    adapterId: 'sql.mysql',
    packageId: 'electrocraft.connector.mysql',
    label: 'MySQL',
    description: 'Pack SQL opcional para MySQL/MariaDB. El driver vive fuera de Core y usa Gateway.',
    sourceKind: 'sql',
    capabilities: ['read', 'create', 'update', 'delete', 'filtering', 'sort', 'pagination', 'transactions'],
    gateway: 'required',
  },
] as const satisfies readonly OptionalConnectorCatalogDefinition[]);

function coreEntry(
  definition: CoreConnectorCatalogDefinition,
  registry: ConnectorRegistry,
): ConnectorCatalogEntry {
  const runtime = registry.list().find((entry) => entry.adapterId === definition.adapterId) ?? null;
  const installed = Boolean(runtime?.adapterRegistered);
  return Object.freeze({
    id: definition.id,
    adapterId: definition.adapterId,
    label: definition.label,
    description: definition.description,
    origin: 'core' as const,
    sourceKind: definition.sourceKind,
    availability: installed ? ('installed' as const) : ('unavailable' as const),
    version: installed ? 'Core' : null,
    capabilities: Object.freeze([...(runtime?.capabilities ?? [])]),
    gateway: definition.gateway,
    compatibility: installed ? 'Compatible con el runtime Core actual' : 'Runtime Core no registrado',
    installHref: null,
  });
}

function optionalEntry(
  definition: OptionalConnectorCatalogDefinition,
  extensions?: ConnectorExtensionCatalogReader,
): ConnectorCatalogEntry {
  const manifest = extensions?.getInstalled(definition.adapterId) ?? null;
  const installed = Boolean(manifest && extensions?.isInstalled(definition.adapterId));
  return Object.freeze({
    id: definition.id,
    adapterId: definition.adapterId,
    label: definition.label,
    description: definition.description,
    origin: 'extension' as const,
    sourceKind: definition.sourceKind,
    availability: installed ? ('installed' as const) : ('unavailable' as const),
    version: manifest?.extensionPackage.version ?? null,
    capabilities: Object.freeze([...(manifest?.capabilities ?? definition.capabilities)]),
    gateway: definition.gateway,
    compatibility: installed
      ? `Instalado desde ${manifest?.extensionPackage.packageId ?? definition.packageId}`
      : 'Requiere extensión compatible; no se incluye driver SQL en Core',
    installHref: installed ? null : `/extensions?connector=${definition.id}`,
  });
}

export function createConnectorCatalog(
  registry: ConnectorRegistry,
  extensions?: ConnectorExtensionCatalogReader,
): readonly ConnectorCatalogEntry[] {
  return Object.freeze([
    ...coreConnectors.map((definition) => coreEntry(definition, registry)),
    ...optionalConnectorPacks.map((definition) => optionalEntry(definition, extensions)),
  ]);
}

export const optionalConnectorPackIds = Object.freeze(optionalConnectorPacks.map((entry) => entry.id));
