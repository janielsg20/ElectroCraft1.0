import {
  electroCraftComponentDefinitionSchema,
  importElectroCraftComponentDefinition,
  validateComponentDefinitionReferences,
  type ElectroCraftComponentDefinition,
  type ElectroCraftObjectId,
} from '@electrocraft/domain';

export interface CanonicalComponentDefinitionRecord {
  kind: 'component-definition';
  id: ElectroCraftObjectId;
  schemaVersion: 1;
  payload: unknown;
}

export interface CanonicalComponentDefinitionRepository {
  put(record: CanonicalComponentDefinitionRecord): Promise<void>;
  get(id: ElectroCraftObjectId): Promise<CanonicalComponentDefinitionRecord | null>;
}

export type ComponentDefinitionBlockedCode =
  | 'INVALID_COMPONENT_DEFINITION'
  | 'REFERENCE_ERROR'
  | 'PERSISTENCE_ERROR'
  | 'MISSING_COMPONENT_DEFINITION';

export interface ComponentDefinitionBlockedResult {
  status: 'blocked';
  code: ComponentDefinitionBlockedCode;
  message: string;
  details?: unknown;
}

export interface ComponentDefinitionSavedResult {
  status: 'saved';
  definition: ElectroCraftComponentDefinition;
}

export interface ComponentDefinitionReadyResult {
  status: 'ready';
  definition: ElectroCraftComponentDefinition;
  migrated: boolean;
}

export type ComponentDefinitionSaveResult = ComponentDefinitionSavedResult | ComponentDefinitionBlockedResult;
export type ComponentDefinitionReopenResult = ComponentDefinitionReadyResult | ComponentDefinitionBlockedResult;

function blocked(
  code: ComponentDefinitionBlockedCode,
  message: string,
  details?: unknown,
): ComponentDefinitionBlockedResult {
  return details === undefined ? { status: 'blocked', code, message } : { status: 'blocked', code, message, details };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown persistence error';
}

export class ComponentDefinitionService {
  constructor(private readonly repository: CanonicalComponentDefinitionRepository) {}

  async save(input: unknown): Promise<ComponentDefinitionSaveResult> {
    const parsed = electroCraftComponentDefinitionSchema.safeParse(input);
    if (!parsed.success) {
      return blocked('INVALID_COMPONENT_DEFINITION', parsed.error.message);
    }

    const diagnostics = validateComponentDefinitionReferences(parsed.data);
    if (diagnostics.length > 0) {
      return blocked('REFERENCE_ERROR', 'component definition references are invalid', { diagnostics });
    }

    try {
      await this.repository.put({
        kind: 'component-definition',
        id: parsed.data.id,
        schemaVersion: 1,
        payload: parsed.data,
      });
      return { status: 'saved', definition: parsed.data };
    } catch (error) {
      return blocked('PERSISTENCE_ERROR', errorMessage(error));
    }
  }

  async reopen(id: ElectroCraftObjectId): Promise<ComponentDefinitionReopenResult> {
    let record: CanonicalComponentDefinitionRecord | null;
    try {
      record = await this.repository.get(id);
    } catch (error) {
      return blocked('PERSISTENCE_ERROR', errorMessage(error));
    }

    if (record === null) {
      return blocked('MISSING_COMPONENT_DEFINITION', 'component definition record was not found', { id });
    }

    try {
      const imported = importElectroCraftComponentDefinition(record.payload);
      const diagnostics = validateComponentDefinitionReferences(imported.definition);
      if (diagnostics.length > 0) {
        return blocked('REFERENCE_ERROR', 'component definition references are invalid', { diagnostics });
      }

      if (imported.migratedFrom !== null) {
        await this.repository.put({
          kind: 'component-definition',
          id: imported.definition.id,
          schemaVersion: 1,
          payload: imported.definition,
        });
      }

      return {
        status: 'ready',
        definition: imported.definition,
        migrated: imported.migratedFrom !== null,
      };
    } catch (error) {
      return blocked('INVALID_COMPONENT_DEFINITION', errorMessage(error));
    }
  }
}
