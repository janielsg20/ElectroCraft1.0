import {
  electroCraftProjectDefinitionSchema,
  electroCraftRegistryDefinitionSchema,
  electroCraftTargetIdSchema,
  electroPlatformCapabilityDefinitionSchema,
  type ElectroCraftCapabilityId,
  type ElectroCraftCapabilitySupportMode,
  type ElectroCraftObjectId,
  type ElectroCraftProjectDefinition,
  type ElectroCraftRegistryDefinition,
  type ElectroCraftRegistryDefinitionKind,
  type ElectroCraftTargetId,
  type ElectroPlatformCapabilityDefinition,
} from '@electrocraft/domain';

export interface CapabilityAnalysisEntry {
  capabilityId: ElectroCraftCapabilityId;
  target: ElectroCraftTargetId;
  mode: ElectroCraftCapabilitySupportMode;
  source: 'registry' | 'project-override' | 'missing';
  adapter: string | null;
  reason: string | null;
}

export interface CapabilityAnalysisReport {
  schemaVersion: 1;
  registryVersion: number;
  projectId: ElectroCraftObjectId;
  entries: CapabilityAnalysisEntry[];
  blocked: boolean;
}

export class ElectroPlatformCapabilityRegistry {
  readonly version: number;
  readonly #definitions = new Map<ElectroCraftCapabilityId, ElectroPlatformCapabilityDefinition>();

  constructor(version: number) {
    if (!Number.isInteger(version) || version <= 0) throw new TypeError('registry version must be a positive integer');
    this.version = version;
  }

  register(input: unknown): ElectroPlatformCapabilityDefinition {
    const definition = electroPlatformCapabilityDefinitionSchema.parse(input);
    for (const support of definition.support) electroCraftTargetIdSchema.parse(support.target);
    const existing = this.#definitions.get(definition.id);
    if (existing && existing.version >= definition.version) {
      throw new TypeError(`capability ${definition.id} must advance its definition version`);
    }
    this.#definitions.set(definition.id, definition);
    return definition;
  }

  get(id: ElectroCraftCapabilityId): ElectroPlatformCapabilityDefinition | undefined {
    return this.#definitions.get(id);
  }

  analyze(projectInput: unknown): CapabilityAnalysisReport {
    const project = electroCraftProjectDefinitionSchema.parse(projectInput);
    const entries: CapabilityAnalysisEntry[] = [];

    for (const target of project.defaultTargets) {
      for (const capabilityId of project.requiredCapabilities) {
        const definition = this.#definitions.get(capabilityId);
        const support = definition?.support.find((entry) => entry.target === target);
        const override = project.targetCapabilityOverrides[target]?.[capabilityId];
        const mode = override ?? support?.mode ?? 'blocked';
        entries.push({
          capabilityId,
          target,
          mode,
          source: override ? 'project-override' : support ? 'registry' : 'missing',
          adapter: support?.adapter ?? null,
          reason: support?.reason ?? (support ? null : 'Capability is not registered for this target.'),
        });
      }
    }

    return {
      schemaVersion: 1,
      registryVersion: this.version,
      projectId: project.id,
      entries,
      blocked: entries.some(({ mode }) => mode === 'blocked'),
    };
  }
}

export class ElectroCraftDefinitionRegistry {
  readonly kind: ElectroCraftRegistryDefinitionKind;
  readonly #definitions = new Map<ElectroCraftObjectId, ElectroCraftRegistryDefinition>();

  constructor(kind: ElectroCraftRegistryDefinitionKind) {
    this.kind = kind;
  }

  register(input: unknown): ElectroCraftRegistryDefinition {
    const definition = electroCraftRegistryDefinitionSchema.parse(input);
    if (definition.kind !== this.kind) {
      throw new TypeError(`definition kind ${definition.kind} cannot be registered in ${this.kind} registry`);
    }
    const existing = this.#definitions.get(definition.id);
    if (existing && existing.version >= definition.version) {
      throw new TypeError(`definition ${definition.id} must advance its version`);
    }
    this.#definitions.set(definition.id, definition);
    return definition;
  }

  get(id: ElectroCraftObjectId): ElectroCraftRegistryDefinition | undefined {
    return this.#definitions.get(id);
  }

  values(): ElectroCraftRegistryDefinition[] {
    return [...this.#definitions.values()];
  }
}

export interface AppDefinitionRegistries {
  component: ElectroCraftDefinitionRegistry;
  field: ElectroCraftDefinitionRegistry;
  action: ElectroCraftDefinitionRegistry;
  provider: ElectroCraftDefinitionRegistry;
}

export function createAppDefinitionRegistries(): AppDefinitionRegistries {
  return {
    component: new ElectroCraftDefinitionRegistry('component'),
    field: new ElectroCraftDefinitionRegistry('field'),
    action: new ElectroCraftDefinitionRegistry('action'),
    provider: new ElectroCraftDefinitionRegistry('provider'),
  };
}

export interface ProjectRegistryDiagnostic {
  code: 'missing-user-definition-ref' | 'non-user-definition-persisted';
  ref: ElectroCraftObjectId;
}

export function validateProjectRegistryDefinitions(
  projectInput: unknown,
  definitionInputs: readonly unknown[],
): ProjectRegistryDiagnostic[] {
  const project: ElectroCraftProjectDefinition = electroCraftProjectDefinitionSchema.parse(projectInput);
  const definitions = definitionInputs.map((input) => electroCraftRegistryDefinitionSchema.parse(input));
  const byId = new Map(definitions.map((definition) => [definition.id, definition] as const));
  const diagnostics: ProjectRegistryDiagnostic[] = [];

  for (const ref of project.userRegistryDefinitionRefs) {
    const definition = byId.get(ref);
    if (!definition) diagnostics.push({ code: 'missing-user-definition-ref', ref });
    else if (definition.origin !== 'user') diagnostics.push({ code: 'non-user-definition-persisted', ref });
  }

  return diagnostics;
}
