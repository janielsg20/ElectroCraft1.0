import {
  electroCraftDataSchemaSchema,
  type ElectroCraftDataSchema,
  type JsonValue,
} from '@electrocraft/domain';
import { normalizeElectroCraftAdvancedFieldRecord } from './advanced-field-runtime';

export interface ElectroCraftRecordValidator {
  readonly schemaId: string;
  readonly schemaVersion: number;
  readonly modelId: string;
  validate(input: Readonly<Record<string, JsonValue>>): Readonly<Record<string, JsonValue>>;
}

export function compileElectroCraftRecordValidator(
  schemaInput: ElectroCraftDataSchema,
  modelId: string,
): ElectroCraftRecordValidator {
  const schema = electroCraftDataSchemaSchema.parse(schemaInput);
  const model = schema.models.find(({ id }) => id === modelId);
  if (!model) throw new Error(`Modelo interno no encontrado: ${modelId}.`);
  return Object.freeze({
    schemaId: schema.id,
    schemaVersion: schema.version,
    modelId: model.id,
    validate(input: Readonly<Record<string, JsonValue>>) {
      return normalizeElectroCraftAdvancedFieldRecord(model, input);
    },
  });
}
