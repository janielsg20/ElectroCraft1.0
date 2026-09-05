import {
  assertElectroCraftAdvancedFieldModel,
  readElectroCraftAdvancedFieldMetadata,
  type ElectroCraftCalculatedFieldConfig,
  type ElectroCraftCalculatedOperand,
  type ElectroCraftDataField,
  type ElectroCraftDataModel,
  type ElectroCraftFieldRule,
  type JsonValue,
} from '@electrocraft/domain';

export interface AdvancedFieldRuntimeDiagnostic {
  readonly fieldKey: string;
  readonly path: string;
  readonly message: string;
}

export class AdvancedFieldRuntimeError extends Error {
  constructor(readonly diagnostics: readonly AdvancedFieldRuntimeDiagnostic[]) {
    super(`ADVANCED_FIELD_VALIDATION:${diagnostics.map(({ message }) => message).join(' | ')}`);
    this.name = 'AdvancedFieldRuntimeError';
  }
}

function isJsonObject(value: JsonValue | undefined): value is Record<string, JsonValue> {
  return Boolean(value) && !Array.isArray(value) && typeof value === 'object';
}

function isEmpty(value: JsonValue | undefined) {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
}

function comparable(value: JsonValue | undefined): string | number | boolean | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return JSON.stringify(value);
}

export function evaluateElectroCraftFieldRule(
  rule: ElectroCraftFieldRule,
  scope: Readonly<Record<string, JsonValue>>,
): boolean {
  if (rule.kind === 'and') return rule.rules.every((candidate) => evaluateElectroCraftFieldRule(candidate, scope));
  if (rule.kind === 'or') return rule.rules.some((candidate) => evaluateElectroCraftFieldRule(candidate, scope));
  if (rule.kind === 'not') return !evaluateElectroCraftFieldRule(rule.rule, scope);
  if (rule.kind !== 'comparison') return false;

  const current = scope[rule.fieldKey];
  if (rule.operator === 'empty') return isEmpty(current);
  if (rule.operator === 'not-empty') return !isEmpty(current);
  if (rule.operator === 'contains') {
    if (typeof current === 'string') return current.includes(String(rule.value ?? ''));
    if (Array.isArray(current)) return current.some((item) => comparable(item) === comparable(rule.value));
    return false;
  }
  if (rule.operator === 'equals') return comparable(current) === comparable(rule.value);
  if (rule.operator === 'not-equals') return comparable(current) !== comparable(rule.value);

  const left = comparable(current);
  const right = comparable(rule.value);
  if (left === null || right === null) return false;
  const normalizedLeft = typeof left === 'number' ? left : String(left);
  const normalizedRight = typeof right === 'number' ? right : String(right);
  if (rule.operator === 'greater-than') return normalizedLeft > normalizedRight;
  if (rule.operator === 'greater-than-or-equal') return normalizedLeft >= normalizedRight;
  if (rule.operator === 'less-than') return normalizedLeft < normalizedRight;
  return normalizedLeft <= normalizedRight;
}

function operandValue(
  operand: ElectroCraftCalculatedOperand,
  resolveField: (fieldKey: string) => JsonValue | undefined,
): JsonValue | undefined {
  return operand.kind === 'field' ? resolveField(operand.fieldKey) : operand.value;
}

function toNumber(value: JsonValue | undefined, fieldKey: string) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`Calculated ${fieldKey} requiere operandos numéricos.`);
  }
  return value;
}

export function evaluateElectroCraftCalculatedField(
  fieldKey: string,
  config: ElectroCraftCalculatedFieldConfig,
  resolveField: (fieldKey: string) => JsonValue | undefined,
): JsonValue {
  const values = config.operands.map((operand) => operandValue(operand, resolveField));
  if (config.operation === 'coalesce') return values.find((value) => !isEmpty(value)) ?? null;
  if (config.operation === 'concat') {
    return values
      .map((value) => {
        if (value === undefined || value === null) return '';
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
        return JSON.stringify(value);
      })
      .join('');
  }

  const numbers = values.map((value) => toNumber(value, fieldKey));
  if (config.operation === 'add') return numbers.reduce((total, value) => total + value, 0);
  if (config.operation === 'multiply') return numbers.reduce((total, value) => total * value, 1);
  if (config.operation === 'subtract') return numbers.slice(1).reduce((total, value) => total - value, numbers[0] ?? 0);
  return numbers.slice(1).reduce((total, value) => {
    if (value === 0) throw new TypeError(`Calculated ${fieldKey} no permite división por cero.`);
    return total / value;
  }, numbers[0] ?? 0);
}

function optionMatches(left: JsonValue | undefined, right: string | number | boolean) {
  return left === right;
}

function validDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

function validTime(value: string) {
  if (!/^\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(value)) return false;
  const [hour, minute, second = '0'] = value.split(':');
  return Number(hour) <= 23 && Number(minute) <= 59 && Number(second) < 60;
}

function validateScalar(field: ElectroCraftDataField, value: JsonValue | undefined, path: string) {
  const diagnostics: AdvancedFieldRuntimeDiagnostic[] = [];
  const required = field.required ?? !field.nullable;
  if (isEmpty(value)) {
    if (required) diagnostics.push({ fieldKey: field.key, path, message: `${field.label} es obligatorio.` });
    return diagnostics;
  }

  const textTypes = ['text', 'textarea', 'email', 'phone', 'url', 'date', 'time', 'datetime', 'color'];
  const referenceTypes = ['image', 'file', 'relation', 'user', 'taxonomy'];
  if (['number', 'currency'].includes(field.type) && (typeof value !== 'number' || !Number.isFinite(value))) {
    diagnostics.push({ fieldKey: field.key, path, message: `${field.label} debe ser numérico.` });
  }
  if (['boolean', 'switch'].includes(field.type) && typeof value !== 'boolean') {
    diagnostics.push({ fieldKey: field.key, path, message: `${field.label} debe ser booleano.` });
  }
  if (textTypes.includes(field.type) && typeof value !== 'string') {
    diagnostics.push({ fieldKey: field.key, path, message: `${field.label} debe ser texto.` });
  }
  if (referenceTypes.includes(field.type) && typeof value !== 'string') {
    diagnostics.push({ fieldKey: field.key, path, message: `${field.label} debe ser una referencia de texto.` });
  }
  if (field.type === 'gallery' && (!Array.isArray(value) || value.some((item) => typeof item !== 'string'))) {
    diagnostics.push({ fieldKey: field.key, path, message: `${field.label} debe ser una lista de referencias.` });
  }
  if (field.type === 'map' && (!value || Array.isArray(value) || typeof value !== 'object')) {
    diagnostics.push({ fieldKey: field.key, path, message: `${field.label} debe ser un objeto de ubicación.` });
  }
  if (['select', 'radio'].includes(field.type)) {
    const allowed = field.options ?? [];
    if (!allowed.some((option) => optionMatches(value, option.value))) {
      diagnostics.push({ fieldKey: field.key, path, message: `${field.label} contiene una opción no permitida.` });
    }
  }
  if (field.type === 'checkbox') {
    const allowed = field.options ?? [];
    if (!Array.isArray(value) || value.some((item) => !allowed.some((option) => optionMatches(item, option.value)))) {
      diagnostics.push({ fieldKey: field.key, path, message: `${field.label} contiene opciones no permitidas.` });
    }
  }
  if (field.type === 'email' && typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    diagnostics.push({ fieldKey: field.key, path, message: `${field.label} no tiene un correo válido.` });
  }
  if (field.type === 'url' && typeof value === 'string') {
    try {
      const parsed = new URL(value);
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('protocol');
    } catch {
      diagnostics.push({ fieldKey: field.key, path, message: `${field.label} no tiene una URL válida.` });
    }
  }
  if (field.type === 'date' && typeof value === 'string' && !validDate(value)) {
    diagnostics.push({ fieldKey: field.key, path, message: `${field.label} no tiene una fecha válida.` });
  }
  if (field.type === 'time' && typeof value === 'string' && !validTime(value)) {
    diagnostics.push({ fieldKey: field.key, path, message: `${field.label} no tiene una hora válida.` });
  }
  if (field.type === 'datetime' && typeof value === 'string' && Number.isNaN(Date.parse(value))) {
    diagnostics.push({ fieldKey: field.key, path, message: `${field.label} no tiene fecha/hora válida.` });
  }
  if (field.type === 'color' && typeof value === 'string' && !/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)) {
    diagnostics.push({ fieldKey: field.key, path, message: `${field.label} no tiene un color hexadecimal válido.` });
  }
  if (field.validation?.min !== undefined && typeof value === 'number' && value < field.validation.min) {
    diagnostics.push({ fieldKey: field.key, path, message: `${field.label} debe ser mayor o igual que ${field.validation.min}.` });
  }
  if (field.validation?.max !== undefined && typeof value === 'number' && value > field.validation.max) {
    diagnostics.push({ fieldKey: field.key, path, message: `${field.label} debe ser menor o igual que ${field.validation.max}.` });
  }
  if (field.validation?.minLength !== undefined && typeof value === 'string' && value.length < field.validation.minLength) {
    diagnostics.push({ fieldKey: field.key, path, message: `${field.label} no alcanza la longitud mínima.` });
  }
  if (field.validation?.maxLength !== undefined && typeof value === 'string' && value.length > field.validation.maxLength) {
    diagnostics.push({ fieldKey: field.key, path, message: `${field.label} supera la longitud máxima.` });
  }
  if (field.validation?.pattern && typeof value === 'string') {
    try {
      if (!new RegExp(field.validation.pattern).test(value)) {
        diagnostics.push({ fieldKey: field.key, path, message: `${field.label} no cumple el patrón configurado.` });
      }
    } catch {
      diagnostics.push({ fieldKey: field.key, path, message: `${field.label} tiene un patrón de validación inválido.` });
    }
  }
  return diagnostics;
}

function normalizeScope(
  model: ElectroCraftDataModel,
  parentFieldRef: string | null,
  input: Readonly<Record<string, JsonValue>>,
  path: string,
): {
  readonly data: Readonly<Record<string, JsonValue>>;
  readonly diagnostics: readonly AdvancedFieldRuntimeDiagnostic[];
} {
  const scopedFields = model.fields
    .filter((field) => readElectroCraftAdvancedFieldMetadata(field).parentFieldRef === parentFieldRef)
    .sort(
      (left, right) =>
        readElectroCraftAdvancedFieldMetadata(left).order - readElectroCraftAdvancedFieldMetadata(right).order,
    );
  const byKey = new Map(scopedFields.map((field) => [field.key, field]));
  const result: Record<string, JsonValue> = { ...input };
  const diagnostics: AdvancedFieldRuntimeDiagnostic[] = [];
  for (const key of Object.keys(input)) {
    if (!byKey.has(key)) diagnostics.push({ fieldKey: key, path: `${path}.${key}`, message: `El campo ${key} no existe en el modelo.` });
  }
  for (const field of scopedFields) {
    if (result[field.key] === undefined && field.defaultValue !== undefined && field.type !== 'calculated') {
      result[field.key] = structuredClone(field.defaultValue);
    }
  }
  const resolving = new Set<string>();
  const resolved = new Set<string>();

  const resolveField = (fieldKey: string): JsonValue | undefined => {
    const field = byKey.get(fieldKey);
    if (!field) return result[fieldKey];
    if (resolved.has(fieldKey)) return result[fieldKey];
    if (resolving.has(fieldKey)) throw new TypeError(`Ciclo de cálculo detectado en ${fieldKey}.`);
    resolving.add(fieldKey);
    const advanced = readElectroCraftAdvancedFieldMetadata(field);
    if (field.type === 'calculated' && advanced.calculated) {
      result[field.key] = evaluateElectroCraftCalculatedField(field.key, advanced.calculated, resolveField);
    }
    resolving.delete(fieldKey);
    resolved.add(fieldKey);
    return result[fieldKey];
  };

  for (const field of scopedFields) {
    if (field.type === 'calculated') {
      try {
        resolveField(field.key);
      } catch (error) {
        diagnostics.push({
          fieldKey: field.key,
          path: `${path}.${field.key}`,
          message: error instanceof Error ? error.message : `No se pudo calcular ${field.label}.`,
        });
      }
    }
  }

  for (const field of scopedFields) {
    const advanced = readElectroCraftAdvancedFieldMetadata(field);
    const fieldPath = `${path}.${field.key}`;
    let value = result[field.key];

    if (field.type === 'conditional' && advanced.conditional) {
      const active = evaluateElectroCraftFieldRule(advanced.conditional.rule, result);
      if (!active) {
        if (advanced.conditional.whenFalse === 'null') result[field.key] = null;
        else delete result[field.key];
        continue;
      }
      value = result[field.key];
      if (advanced.conditional.valueType === 'number' && !isEmpty(value) && typeof value !== 'number') {
        diagnostics.push({ fieldKey: field.key, path: fieldPath, message: `${field.label} debe ser numérico.` });
      }
      if (advanced.conditional.valueType === 'boolean' && !isEmpty(value) && typeof value !== 'boolean') {
        diagnostics.push({ fieldKey: field.key, path: fieldPath, message: `${field.label} debe ser booleano.` });
      }
      if (advanced.conditional.valueType === 'text' && !isEmpty(value) && typeof value !== 'string') {
        diagnostics.push({ fieldKey: field.key, path: fieldPath, message: `${field.label} debe ser texto.` });
      }
      diagnostics.push(...validateScalar(field, value, fieldPath));
      continue;
    }

    if (field.type === 'group') {
      if (isEmpty(value)) {
        diagnostics.push(...validateScalar(field, value, fieldPath));
        continue;
      }
      if (!isJsonObject(value)) {
        diagnostics.push({ fieldKey: field.key, path: fieldPath, message: `${field.label} debe ser un objeto.` });
        continue;
      }
      const nested = normalizeScope(model, field.id, value, fieldPath);
      result[field.key] = nested.data as JsonValue;
      diagnostics.push(...nested.diagnostics);
      continue;
    }

    if (field.type === 'repeater') {
      if (isEmpty(value)) {
        diagnostics.push(...validateScalar(field, value, fieldPath));
        continue;
      }
      if (!Array.isArray(value)) {
        diagnostics.push({ fieldKey: field.key, path: fieldPath, message: `${field.label} debe ser una lista.` });
        continue;
      }
      const minItems = advanced.repeater?.minItems;
      const maxItems = advanced.repeater?.maxItems;
      if (minItems !== undefined && value.length < minItems) {
        diagnostics.push({
          fieldKey: field.key,
          path: fieldPath,
          message: `${field.label} requiere al menos ${minItems} elemento(s).`,
        });
      }
      if (maxItems !== undefined && value.length > maxItems) {
        diagnostics.push({
          fieldKey: field.key,
          path: fieldPath,
          message: `${field.label} admite como máximo ${maxItems} elemento(s).`,
        });
      }
      const normalizedItems: JsonValue[] = [];
      value.forEach((item, index) => {
        if (!isJsonObject(item)) {
          diagnostics.push({
            fieldKey: field.key,
            path: `${fieldPath}[${index}]`,
            message: `${field.label}: cada elemento debe ser un objeto.`,
          });
          return;
        }
        const nested = normalizeScope(model, field.id, item, `${fieldPath}[${index}]`);
        normalizedItems.push(nested.data as JsonValue);
        diagnostics.push(...nested.diagnostics);
      });
      result[field.key] = normalizedItems;
      continue;
    }

    if (field.type !== 'calculated') diagnostics.push(...validateScalar(field, value, fieldPath));
  }

  return Object.freeze({ data: Object.freeze(result), diagnostics: Object.freeze(diagnostics) });
}

export function normalizeElectroCraftAdvancedFieldRecord(
  model: ElectroCraftDataModel,
  input: Readonly<Record<string, JsonValue>>,
): Readonly<Record<string, JsonValue>> {
  assertElectroCraftAdvancedFieldModel(model);
  const normalized = normalizeScope(model, null, input, '$');
  if (normalized.diagnostics.length) throw new AdvancedFieldRuntimeError(normalized.diagnostics);
  return normalized.data;
}
