from pathlib import Path
import re


def read(path):
    return Path(path).read_text()


def write(path, content):
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content)


def replace_once(path, old, new):
    content = read(path)
    if old not in content:
        raise SystemExit(f'missing replacement in {path}: {old[:100]!r}')
    write(path, content.replace(old, new, 1))


def regex_once(path, pattern, replacement):
    content = read(path)
    next_content, count = re.subn(pattern, replacement, content, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(f'regex replacement count {count} in {path}: {pattern[:100]}')
    write(path, next_content)


# Application record contract: expose soft-delete metadata and query policy.
replace_once(
    'packages/application/src/data/index.ts',
    "  readonly updatedAt: string;\n}\n\nexport interface InternalDataFilter",
    "  readonly updatedAt: string;\n  readonly deletedAt: string | null;\n}\n\nexport interface InternalDataFilter",
)
replace_once(
    'packages/application/src/data/index.ts',
    "  readonly sort?: InternalDataSort;\n}\n",
    "  readonly sort?: InternalDataSort;\n  readonly includeDeleted?: boolean;\n}\n",
)

# Canonical storage migration: deleted_at belongs to generic content_records, never to per-model DDL.
replace_once(
    'packages/data-web/src/schema-contract.ts',
    'export const STUDIO_STORAGE_SCHEMA_VERSION = 6 as const;',
    'export const STUDIO_STORAGE_SCHEMA_VERSION = 7 as const;',
)
replace_once(
    'packages/data-web/src/schema.ts',
    "    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),\n  },\n  (table) => [\n    primaryKey({ columns: [table.projectId, table.id] }),\n    index('content_records_model_idx').on(table.projectId, table.modelId),",
    "    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),\n    deletedAt: timestamp('deleted_at', { withTimezone: true }),\n  },\n  (table) => [\n    primaryKey({ columns: [table.projectId, table.id] }),\n    index('content_records_model_idx').on(table.projectId, table.modelId),",
)
replace_once(
    'packages/data-web/src/migration.ts',
    "export const M08_10_TAXONOMY_TERMS_CHECKSUM = 'm08.10:taxonomy-terms-v6' as const;",
    "export const M08_10_TAXONOMY_TERMS_CHECKSUM = 'm08.10:taxonomy-terms-v6' as const;\nexport const M08_12_RECORD_SOFT_DELETE_CHECKSUM = 'm08.12:record-soft-delete-v7' as const;",
)
replace_once(
    'packages/data-web/src/migration.ts',
    "export const M08_10_TAXONOMY_TERMS_SQL = `\nALTER TABLE taxonomy_terms ADD COLUMN IF NOT EXISTS parent_id text;\nDROP INDEX IF EXISTS taxonomy_terms_taxonomy_idx;\nCREATE UNIQUE INDEX IF NOT EXISTS taxonomy_terms_taxonomy_slug_idx\n  ON taxonomy_terms(project_id, taxonomy_id, slug);\n`;",
    "export const M08_10_TAXONOMY_TERMS_SQL = `\nALTER TABLE taxonomy_terms ADD COLUMN IF NOT EXISTS parent_id text;\nDROP INDEX IF EXISTS taxonomy_terms_taxonomy_idx;\nCREATE UNIQUE INDEX IF NOT EXISTS taxonomy_terms_taxonomy_slug_idx\n  ON taxonomy_terms(project_id, taxonomy_id, slug);\n`;\nexport const M08_12_RECORD_SOFT_DELETE_SQL = `\nALTER TABLE content_records ADD COLUMN IF NOT EXISTS deleted_at timestamptz;\nCREATE INDEX IF NOT EXISTS content_records_active_model_idx\n  ON content_records(project_id, model_id, created_at, id)\n  WHERE deleted_at IS NULL;\n`;",
)
replace_once(
    'packages/data-web/src/migration.ts',
    "  await applyMigration(\n    client,\n    STUDIO_STORAGE_SCHEMA_VERSION,\n    M08_10_TAXONOMY_TERMS_CHECKSUM,\n    M08_10_TAXONOMY_TERMS_SQL,\n  );",
    "  await applyMigration(client, 6, M08_10_TAXONOMY_TERMS_CHECKSUM, M08_10_TAXONOMY_TERMS_SQL);\n  await applyMigration(\n    client,\n    STUDIO_STORAGE_SCHEMA_VERSION,\n    M08_12_RECORD_SOFT_DELETE_CHECKSUM,\n    M08_12_RECORD_SOFT_DELETE_SQL,\n  );",
)
write(
    'packages/data-web/drizzle/0006_m08_12_record_soft_delete.sql',
    "ALTER TABLE content_records ADD COLUMN IF NOT EXISTS deleted_at timestamptz;\n\nCREATE INDEX IF NOT EXISTS content_records_active_model_idx\n  ON content_records(project_id, model_id, created_at, id)\n  WHERE deleted_at IS NULL;\n",
)
replace_once(
    'packages/data-web/src/storage-health.ts',
    "  M08_10_TAXONOMY_TERMS_CHECKSUM,\n} from './migration';",
    "  M08_10_TAXONOMY_TERMS_CHECKSUM,\n  M08_12_RECORD_SOFT_DELETE_CHECKSUM,\n} from './migration';",
)
replace_once(
    'packages/data-web/src/storage-health.ts',
    "    M08_10_TAXONOMY_TERMS_CHECKSUM,\n  ];",
    "    M08_10_TAXONOMY_TERMS_CHECKSUM,\n    M08_12_RECORD_SOFT_DELETE_CHECKSUM,\n  ];",
)

# Full record validator is compiled from the canonical data schema and reuses the M08.9 normalization owner.
write(
    'packages/connectors/src/record-validation.ts',
    r'''import {
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
''',
)
replace_once(
    'packages/connectors/src/index.ts',
    "export * from './rest-data-source-adapter';",
    "export * from './rest-data-source-adapter';\nexport * from './record-validation';",
)

# Strengthen scalar validation used recursively by normal and advanced fields.
regex_once(
    'packages/connectors/src/advanced-field-runtime.ts',
    r"function validateScalar\(field: ElectroCraftDataField, value: JsonValue \| undefined, path: string\) \{.*?\n\}\n\nfunction normalizeScope",
    r'''function optionMatches(left: JsonValue, right: string | number | boolean) {
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

function normalizeScope''',
)
replace_once(
    'packages/connectors/src/advanced-field-runtime.ts',
    "  const byKey = new Map(scopedFields.map((field) => [field.key, field]));\n  const result: Record<string, JsonValue> = { ...input };\n  const diagnostics: AdvancedFieldRuntimeDiagnostic[] = [];",
    "  const byKey = new Map(scopedFields.map((field) => [field.key, field]));\n  const result: Record<string, JsonValue> = { ...input };\n  const diagnostics: AdvancedFieldRuntimeDiagnostic[] = [];\n  for (const key of Object.keys(input)) {\n    if (!byKey.has(key)) diagnostics.push({ fieldKey: key, path: `${path}.${key}`, message: `El campo ${key} no existe en el modelo.` });\n  }\n  for (const field of scopedFields) {\n    if (result[field.key] === undefined && field.defaultValue !== undefined && field.type !== 'calculated') {\n      result[field.key] = structuredClone(field.defaultValue);\n    }\n  }",
)

# Internal adapter compiles validation from the active ElectroCraftDataSchema on every write.
replace_once(
    'packages/connectors/src/internal-data-source-adapter.ts',
    "import { normalizeElectroCraftAdvancedFieldRecord } from './advanced-field-runtime';",
    "import { compileElectroCraftRecordValidator } from './record-validation';",
)
replace_once(
    'packages/connectors/src/internal-data-source-adapter.ts',
    "  return Object.freeze({\n    offset: optionalNumber(input.offset, 'offset'),\n    limit: optionalNumber(input.limit, 'limit'),\n    ...(filter ? { filter } : {}),\n    ...(sort ? { sort } : {}),\n  });",
    "  if (input.includeDeleted !== undefined && typeof input.includeDeleted !== 'boolean') {\n    throw new TypeError('includeDeleted debe ser booleano.');\n  }\n  return Object.freeze({\n    offset: optionalNumber(input.offset, 'offset'),\n    limit: optionalNumber(input.limit, 'limit'),\n    ...(filter ? { filter } : {}),\n    ...(sort ? { sort } : {}),\n    ...(typeof input.includeDeleted === 'boolean' ? { includeDeleted: input.includeDeleted } : {}),\n  });",
)
replace_once(
    'packages/connectors/src/internal-data-source-adapter.ts',
    "    const schema = await this.options.repository.getSchema(this.options.projectId, context.source.id);\n    const model = schema?.models.find(({ id }) => id === resourceId);\n    if (!model) throw new Error(`Modelo interno no encontrado: ${resourceId}.`);\n    return normalizeElectroCraftAdvancedFieldRecord(model, data);",
    "    const schema = await this.options.repository.getSchema(this.options.projectId, context.source.id);\n    if (!schema) throw new Error('No hay un schema de datos interno para esta fuente.');\n    return compileElectroCraftRecordValidator(schema, resourceId).validate(data);",
)
replace_once(
    'packages/connectors/src/internal-data-source-adapter.ts',
    "                  defaultValue: 50,\n                }),\n                Object.freeze({\n                  name: 'filter',",
    "                  defaultValue: 50,\n                }),\n                Object.freeze({\n                  name: 'includeDeleted',\n                  label: 'Incluir eliminados',\n                  location: 'input' as const,\n                  inputPath: Object.freeze(['includeDeleted']),\n                  required: false,\n                  valueType: 'boolean' as const,\n                  defaultValue: false,\n                }),\n                Object.freeze({\n                  name: 'filter',",
)

# Generic content repository uses active records by default and soft-deletes instead of destroying rows.
replace_once(
    'packages/data-web/src/internal-data-repository.ts',
    "import { and, asc, count, eq } from 'drizzle-orm';",
    "import { and, asc, count, eq, isNull } from 'drizzle-orm';",
)
replace_once(
    'packages/data-web/src/internal-data-repository.ts',
    "    updatedAt: row.updatedAt.toISOString(),\n  });",
    "    updatedAt: row.updatedAt.toISOString(),\n    deletedAt: row.deletedAt?.toISOString() ?? null,\n  });",
)
replace_once(
    'packages/data-web/src/internal-data-repository.ts',
    "  return Object.freeze({ offset, limit, filter: query?.filter, sort: query?.sort });",
    "  return Object.freeze({ offset, limit, filter: query?.filter, sort: query?.sort, includeDeleted: query?.includeDeleted === true });",
)
replace_once(
    'packages/data-web/src/internal-data-repository.ts',
    ".where(and(eq(schema.contentRecords.projectId, projectId), eq(schema.contentRecords.modelId, modelId)))\n        .orderBy(asc(schema.contentRecords.createdAt), asc(schema.contentRecords.id))",
    ".where(\n          query.includeDeleted\n            ? and(eq(schema.contentRecords.projectId, projectId), eq(schema.contentRecords.modelId, modelId))\n            : and(\n                eq(schema.contentRecords.projectId, projectId),\n                eq(schema.contentRecords.modelId, modelId),\n                isNull(schema.contentRecords.deletedAt),\n              ),\n        )\n        .orderBy(asc(schema.contentRecords.createdAt), asc(schema.contentRecords.id))",
)
replace_once(
    'packages/data-web/src/internal-data-repository.ts',
    "          eq(schema.contentRecords.id, id),\n        ),\n      )\n      .returning();\n    if (!updated[0]) throw new Error(`internal data record not found: ${id}`);",
    "          eq(schema.contentRecords.id, id),\n          isNull(schema.contentRecords.deletedAt),\n        ),\n      )\n      .returning();\n    if (!updated[0]) throw new Error(`internal data record not found or deleted: ${id}`);",
)
regex_once(
    'packages/data-web/src/internal-data-repository.ts',
    r"  async function deleteRecord\(projectIdInput: string, modelIdInput: string, recordIdInput: string\): Promise<boolean> \{.*?\n  \}\n\n  async function getStats",
    r'''  async function deleteRecord(projectIdInput: string, modelIdInput: string, recordIdInput: string): Promise<boolean> {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const modelId = requireNonEmpty(modelIdInput, 'modelId');
    const recordId = requireNonEmpty(recordIdInput, 'recordId');
    const now = new Date();
    const deleted = await db
      .update(schema.contentRecords)
      .set({ state: 'deleted', deletedAt: now, updatedAt: now })
      .where(
        and(
          eq(schema.contentRecords.projectId, projectId),
          eq(schema.contentRecords.modelId, modelId),
          eq(schema.contentRecords.id, recordId),
          isNull(schema.contentRecords.deletedAt),
        ),
      )
      .returning({ id: schema.contentRecords.id });
    return deleted.length > 0;
  }

  async function getStats''',
)
replace_once(
    'packages/data-web/src/internal-data-repository.ts',
    ".where(eq(schema.contentRecords.projectId, projectId));\n    return Object.freeze({",
    ".where(and(eq(schema.contentRecords.projectId, projectId), isNull(schema.contentRecords.deletedAt)));\n    return Object.freeze({",
)
replace_once(
    'packages/data-web/src/internal-data-repository.ts',
    ".where(and(eq(schema.contentRecords.projectId, projectId), eq(schema.contentRecords.modelId, modelId)));\n    let populatedCount = 0;",
    ".where(\n        and(\n          eq(schema.contentRecords.projectId, projectId),\n          eq(schema.contentRecords.modelId, modelId),\n          isNull(schema.contentRecords.deletedAt),\n        ),\n      );\n    let populatedCount = 0;",
)

# Relation integrity remains atomic, but cascade/delete now uses the M08.12 soft-delete policy.
replace_once(
    'packages/data-web/src/internal-relation-repository.ts',
    "import { and, asc, eq } from 'drizzle-orm';",
    "import { and, asc, eq, isNull } from 'drizzle-orm';",
)
replace_once(
    'packages/data-web/src/internal-relation-repository.ts',
    "        eq(schema.contentRecords.id, recordId),\n      ),",
    "        eq(schema.contentRecords.id, recordId),\n        isNull(schema.contentRecords.deletedAt),\n      ),",
)
regex_once(
    'packages/data-web/src/internal-relation-repository.ts',
    r"    return db\.transaction\(async \(tx\) => \{\n      for \(const edgeId of edgeIds\) \{.*?\n    \}\);\n  \}\n\n  return Object\.freeze",
    r'''    return db.transaction(async (tx) => {
      for (const edgeId of edgeIds) {
        await tx
          .delete(schema.relationEdges)
          .where(and(eq(schema.relationEdges.projectId, projectId), eq(schema.relationEdges.id, edgeId)));
      }
      const now = new Date();
      for (const node of cascadeNodes.values()) {
        await tx
          .update(schema.contentRecords)
          .set({ state: 'deleted', deletedAt: now, updatedAt: now })
          .where(
            and(
              eq(schema.contentRecords.projectId, projectId),
              eq(schema.contentRecords.modelId, node.modelId),
              eq(schema.contentRecords.id, node.recordId),
              isNull(schema.contentRecords.deletedAt),
            ),
          );
      }
      const deletedRoot = await tx
        .update(schema.contentRecords)
        .set({ state: 'deleted', deletedAt: now, updatedAt: now })
        .where(
          and(
            eq(schema.contentRecords.projectId, projectId),
            eq(schema.contentRecords.modelId, modelId),
            eq(schema.contentRecords.id, recordId),
            isNull(schema.contentRecords.deletedAt),
          ),
        )
        .returning({ id: schema.contentRecords.id });
      return deletedRoot.length > 0;
    });
  }

  return Object.freeze''',
)

# Storage regression expectations now include migration 7.
for path in [
    'tooling/vitest/contract/m08-10-taxonomy-boundary.test.ts',
    'tooling/vitest/contract/project-storage-boundary.test.ts',
]:
    replace_once(path, 'STUDIO_STORAGE_SCHEMA_VERSION).toBe(6)', 'STUDIO_STORAGE_SCHEMA_VERSION).toBe(7)')
replace_once(
    'tooling/vitest/unit/project-storage-multitab-lifecycle.test.ts',
    "  M08_10_TAXONOMY_TERMS_CHECKSUM,\n  STUDIO_STORAGE_SCHEMA_VERSION,",
    "  M08_10_TAXONOMY_TERMS_CHECKSUM,\n  M08_12_RECORD_SOFT_DELETE_CHECKSUM,\n  STUDIO_STORAGE_SCHEMA_VERSION,",
)
replace_once(
    'tooling/vitest/unit/project-storage-multitab-lifecycle.test.ts',
    "          M08_10_TAXONOMY_TERMS_CHECKSUM,\n          checksum,",
    "          M08_10_TAXONOMY_TERMS_CHECKSUM,\n          checksum,",
)
replace_once(
    'tooling/vitest/unit/project-storage-multitab-lifecycle.test.ts',
    "    const client = createHealthClient(M08_10_TAXONOMY_TERMS_CHECKSUM);",
    "    const client = createHealthClient(M08_12_RECORD_SOFT_DELETE_CHECKSUM);",
)
replace_once(
    'tooling/vitest/unit/project-storage-multitab-lifecycle.test.ts',
    "      migrationChecksum: M08_10_TAXONOMY_TERMS_CHECKSUM,",
    "      migrationChecksum: M08_12_RECORD_SOFT_DELETE_CHECKSUM,",
)
replace_once(
    'tooling/vitest/integration/project-storage-multitab-migrations.test.ts',
    "  M08_10_TAXONOMY_TERMS_CHECKSUM,\n  STUDIO_STORAGE_SCHEMA_VERSION,",
    "  M08_10_TAXONOMY_TERMS_CHECKSUM,\n  M08_12_RECORD_SOFT_DELETE_CHECKSUM,\n  STUDIO_STORAGE_SCHEMA_VERSION,",
)
replace_once(
    'tooling/vitest/integration/project-storage-multitab-migrations.test.ts',
    "      migrationChecksum: M08_10_TAXONOMY_TERMS_CHECKSUM,",
    "      migrationChecksum: M08_12_RECORD_SOFT_DELETE_CHECKSUM,",
)
replace_once(
    'tooling/vitest/integration/project-storage-multitab-migrations.test.ts',
    "      { schema_version: STUDIO_STORAGE_SCHEMA_VERSION, checksum: M08_10_TAXONOMY_TERMS_CHECKSUM },",
    "      { schema_version: 6, checksum: M08_10_TAXONOMY_TERMS_CHECKSUM },\n      { schema_version: STUDIO_STORAGE_SCHEMA_VERSION, checksum: M08_12_RECORD_SOFT_DELETE_CHECKSUM },",
)

# M08.12 unit/integration coverage.
write(
    'tooling/vitest/unit/m08-12-record-validation.test.ts',
    r'''import { describe, expect, it } from 'vitest';
import { compileElectroCraftRecordValidator } from '@electrocraft/connectors';
import {
  createDeterministicObjectId,
  electroCraftDataFieldSchema,
  electroCraftDataModelSchema,
  electroCraftDataSchemaSchema,
} from '@electrocraft/domain';

function fixture() {
  const model = electroCraftDataModelSchema.parse({
    id: createDeterministicObjectId('data-model', 'm08-12-product'),
    key: 'product',
    label: 'Producto',
    fields: [
      electroCraftDataFieldSchema.parse({
        id: createDeterministicObjectId('data-field', 'm08-12-name'),
        key: 'name', label: 'Nombre', type: 'text', nullable: false, required: true,
        indexed: true, faceted: false, relationModelRef: null,
        validation: { minLength: 3, pattern: '^[A-Z]' }, metadata: {},
      }),
      electroCraftDataFieldSchema.parse({
        id: createDeterministicObjectId('data-field', 'm08-12-price'),
        key: 'price', label: 'Precio', type: 'number', nullable: false,
        indexed: true, faceted: false, relationModelRef: null,
        validation: { min: 0 }, defaultValue: 0, metadata: {},
      }),
      electroCraftDataFieldSchema.parse({
        id: createDeterministicObjectId('data-field', 'm08-12-status'),
        key: 'status', label: 'Estado', type: 'select', nullable: false,
        indexed: true, faceted: true, relationModelRef: null,
        options: [{ label: 'Activo', value: 'active' }, { label: 'Pausado', value: 'paused' }], metadata: {},
      }),
    ],
    metadata: {},
  });
  const schema = electroCraftDataSchemaSchema.parse({
    schemaVersion: 1,
    id: createDeterministicObjectId('data-schema', 'm08-12-schema'),
    version: 3,
    sourceRef: createDeterministicObjectId('data-source', 'm08-12-source'),
    name: 'ElectroCraft Data', models: [model], metadata: {},
  });
  return { model, schema };
}

describe('M08.12 record validation compiler', () => {
  it('compiles from ElectroCraftDataSchema, applies defaults and returns normalized data', () => {
    const { model, schema } = fixture();
    const validator = compileElectroCraftRecordValidator(schema, model.id);
    expect(validator).toMatchObject({ schemaId: schema.id, schemaVersion: 3, modelId: model.id });
    expect(validator.validate({ name: 'Mesa', status: 'active' })).toEqual({ name: 'Mesa', price: 0, status: 'active' });
  });

  it('fails closed for required, pattern, option, numeric and unknown-field violations', () => {
    const { model, schema } = fixture();
    const validator = compileElectroCraftRecordValidator(schema, model.id);
    expect(() => validator.validate({ name: 'ab', price: -1, status: 'unknown', extra: true })).toThrow(
      /VALIDATION|obligatorio|patrón|opción|campo/i,
    );
  });
});
''',
)
write(
    'tooling/vitest/integration/m08-12-record-crud-pglite.test.ts',
    r'''import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { describe, expect, it } from 'vitest';
import { ConnectorRegistry } from '@electrocraft/application';
import { createInternalDataSourceAdapter } from '@electrocraft/connectors';
import { applyStudioStorageMigrations, createDrizzleInternalDataRepository } from '@electrocraft/data-web';
import {
  createDeterministicObjectId,
  electroCraftDataFieldSchema,
  electroCraftDataModelSchema,
  electroCraftDataSchemaSchema,
  electroCraftDataSourceDefinitionSchema,
} from '@electrocraft/domain';
import * as storageSchema from '../../../packages/data-web/src/schema';

describe('M08.12 CRUD validated through ConnectorRegistry and PGlite', () => {
  it('validates writes, persists round-trip and soft-deletes without destroying the row', async () => {
    const client = await PGlite.create();
    try {
      await applyStudioStorageMigrations(client);
      const db = drizzle(client, { schema: storageSchema });
      const projectId = 'project-m08-12';
      const source = electroCraftDataSourceDefinitionSchema.parse({
        schemaVersion: 1,
        id: createDeterministicObjectId('data-source', 'm08-12-internal'),
        version: 1, key: 'electroCraftData', label: 'ElectroCraft Data', kind: 'internal',
        adapterId: 'internal.pglite', authRef: null, config: { storage: 'content_records' },
        environmentScope: ['development'], environmentOverrides: {}, schemaDiscovery: 'on-demand',
        capabilities: ['read', 'create', 'update', 'delete', 'pagination', 'filtering', 'sort', 'transactions'], metadata: {},
      });
      const model = electroCraftDataModelSchema.parse({
        id: createDeterministicObjectId('data-model', 'm08-12-product'), key: 'product', label: 'Producto',
        fields: [electroCraftDataFieldSchema.parse({
          id: createDeterministicObjectId('data-field', 'm08-12-product-name'), key: 'name', label: 'Nombre',
          type: 'text', nullable: false, required: true, indexed: false, faceted: false, relationModelRef: null,
          validation: { minLength: 3 }, metadata: {},
        })], metadata: {},
      });
      const dataSchema = electroCraftDataSchemaSchema.parse({
        schemaVersion: 1, id: createDeterministicObjectId('data-schema', 'm08-12-schema'), version: 1,
        sourceRef: source.id, name: 'ElectroCraft Data', models: [model], metadata: {},
      });
      await db.insert(storageSchema.projects).values({ id: projectId, name: 'M08.12', metadata: {} });
      await db.insert(storageSchema.projectObjects).values({
        projectId, objectId: dataSchema.id, kind: 'data-schema', schemaVersion: 1,
        payload: dataSchema, checksum: 'm08-12-schema',
      });
      const repository = createDrizzleInternalDataRepository(db);
      const registry = new ConnectorRegistry();
      registry.registerAdapter(createInternalDataSourceAdapter({
        projectId, repository, permissions: { authorize: () => true },
      }));

      await expect(registry.mutate(source, 'development', {
        resourceId: model.id, operation: 'create', input: { id: 'invalid', data: { name: 'x' } },
      })).rejects.toThrow(/longitud mínima|obligatorio/i);

      await expect(registry.mutate(source, 'development', {
        resourceId: model.id, operation: 'create', input: { id: 'product-a', data: { name: 'Mesa' } },
      })).resolves.toMatchObject({ id: 'product-a', data: { name: 'Mesa' }, deletedAt: null });
      await expect(registry.mutate(source, 'development', {
        resourceId: model.id, operation: 'update', input: { id: 'product-a', data: { name: 'Mesa Pro' } },
      })).resolves.toMatchObject({ id: 'product-a', data: { name: 'Mesa Pro' } });
      await expect(registry.query(source, 'development', { resourceId: model.id })).resolves.toMatchObject({
        total: 1, rows: [expect.objectContaining({ id: 'product-a', data: { name: 'Mesa Pro' } })],
      });

      await expect(registry.mutate(source, 'development', {
        resourceId: model.id, operation: 'delete', input: { id: 'product-a' },
      })).resolves.toEqual({ deleted: true });
      await expect(registry.query(source, 'development', { resourceId: model.id })).resolves.toMatchObject({ total: 0, rows: [] });
      await expect(registry.query(source, 'development', {
        resourceId: model.id, input: { includeDeleted: true },
      })).resolves.toMatchObject({
        total: 1,
        rows: [expect.objectContaining({ id: 'product-a', state: 'deleted', deletedAt: expect.any(String) })],
      });
      const physical = await db.select().from(storageSchema.contentRecords);
      expect(physical).toHaveLength(1);
      expect(physical[0]?.deletedAt).toBeInstanceOf(Date);
      await expect(registry.mutate(source, 'development', {
        resourceId: model.id, operation: 'update', input: { id: 'product-a', data: { name: 'No revive' } },
      })).rejects.toThrow(/deleted|not found/i);
    } finally {
      await client.close();
    }
  });
});
''',
)

# Real records workspace for /content. All writes go through dataSourceWorkspaceRuntime -> ConnectorRegistry.
write(
    'apps/studio/src/features/data/records-workspace.tsx',
    r'''import type { InternalDataRecord } from '@electrocraft/application';
import { Button, Input } from '@electrocraft/design-system';
import {
  readElectroCraftAdvancedFieldMetadata,
  type ElectroCraftDataField,
  type ElectroCraftDataModel,
  type ElectroCraftDataSchema,
  type JsonValue,
} from '@electrocraft/domain';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { dataSourceWorkspaceRuntime } from './data-source-runtime';
import './records-workspace.css';

type RecordDraft = Readonly<Record<string, JsonValue>>;

function queryResult(value: JsonValue): { rows: readonly InternalDataRecord[]; total: number } {
  if (!value || Array.isArray(value) || typeof value !== 'object') return { rows: [], total: 0 };
  const candidate = value as Record<string, JsonValue>;
  return {
    rows: Array.isArray(candidate.rows) ? (candidate.rows as unknown as InternalDataRecord[]) : [],
    total: typeof candidate.total === 'number' ? candidate.total : 0,
  };
}

function topLevelFields(model: ElectroCraftDataModel) {
  return model.fields.filter((field) => readElectroCraftAdvancedFieldMetadata(field).parentFieldRef === null);
}

function initialDraft(model: ElectroCraftDataModel): RecordDraft {
  return Object.freeze(
    Object.fromEntries(
      topLevelFields(model)
        .filter(({ type }) => type !== 'calculated')
        .flatMap((field) => (field.defaultValue === undefined ? [] : [[field.key, structuredClone(field.defaultValue)]])),
    ) as Record<string, JsonValue>,
  );
}

function recordLabel(record: InternalDataRecord, model: ElectroCraftDataModel) {
  const first = topLevelFields(model).find(({ type }) => ['text', 'textarea', 'email', 'phone'].includes(type));
  const value = first ? record.data[first.key] : undefined;
  return typeof value === 'string' && value.trim() ? value : record.id;
}

function complexField(field: ElectroCraftDataField) {
  return ['richtext', 'gallery', 'map', 'group', 'repeater', 'json'].includes(field.type);
}

function FieldEditor({
  field,
  value,
  jsonText,
  disabled,
  onValue,
  onJsonText,
}: {
  readonly field: ElectroCraftDataField;
  readonly value: JsonValue | undefined;
  readonly jsonText: string | undefined;
  readonly disabled: boolean;
  readonly onValue: (value: JsonValue | undefined) => void;
  readonly onJsonText: (value: string) => void;
}) {
  if (field.type === 'calculated') {
    return <Input value={value == null ? 'Se calcula al guardar' : String(value)} disabled />;
  }
  if (complexField(field)) {
    return (
      <textarea
        aria-label={field.label}
        rows={field.type === 'repeater' || field.type === 'group' ? 6 : 4}
        disabled={disabled}
        value={jsonText ?? JSON.stringify(value ?? (field.type === 'gallery' || field.type === 'repeater' ? [] : {}), null, 2)}
        onChange={(event) => onJsonText(event.target.value)}
      />
    );
  }
  if (field.type === 'checkbox') {
    const selected = Array.isArray(value) ? value : [];
    return (
      <select
        multiple
        aria-label={field.label}
        disabled={disabled}
        value={selected.map(String)}
        onChange={(event) => onValue(Array.from(event.currentTarget.selectedOptions).map(({ value }) => value))}
      >
        {(field.options ?? []).map((option) => <option key={String(option.value)} value={String(option.value)}>{option.label}</option>)}
      </select>
    );
  }
  if (['select', 'radio'].includes(field.type)) {
    return (
      <select aria-label={field.label} disabled={disabled} value={value == null ? '' : String(value)} onChange={(event) => onValue(event.target.value)}>
        <option value="">Seleccionar…</option>
        {(field.options ?? []).map((option) => <option key={String(option.value)} value={String(option.value)}>{option.label}</option>)}
      </select>
    );
  }
  if (['boolean', 'switch'].includes(field.type)) {
    return (
      <label className="ec-record-boolean">
        <input type="checkbox" disabled={disabled} checked={value === true} onChange={(event) => onValue(event.target.checked)} />
        <span>{value === true ? 'Sí' : 'No'}</span>
      </label>
    );
  }
  if (['number', 'currency'].includes(field.type)) {
    return <Input type="number" disabled={disabled} value={typeof value === 'number' ? String(value) : ''} onChange={(event) => onValue(event.target.value === '' ? undefined : Number(event.target.value))} />;
  }
  if (field.type === 'textarea') {
    return <textarea aria-label={field.label} rows={4} disabled={disabled} value={typeof value === 'string' ? value : ''} onChange={(event) => onValue(event.target.value)} />;
  }
  const inputType = field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : field.type === 'datetime' ? 'datetime-local' : field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'color' ? 'color' : 'text';
  return <Input type={inputType} disabled={disabled} value={typeof value === 'string' ? value : ''} onChange={(event) => onValue(event.target.value)} />;
}

export function RecordsWorkspace() {
  const sourceSnapshot = useSyncExternalStore(
    dataSourceWorkspaceRuntime.subscribe,
    dataSourceWorkspaceRuntime.getSnapshot,
    dataSourceWorkspaceRuntime.getSnapshot,
  );
  const internalSource = useMemo(
    () => sourceSnapshot.sources.find(({ kind, adapterId }) => kind === 'internal' && adapterId === 'internal.pglite') ?? null,
    [sourceSnapshot.sources],
  );
  const [schema, setSchema] = useState<ElectroCraftDataSchema | null>(null);
  const [modelId, setModelId] = useState('');
  const [records, setRecords] = useState<readonly InternalDataRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<RecordDraft>({});
  const [jsonTexts, setJsonTexts] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Cargando registros…');

  const model = schema?.models.find(({ id }) => id === modelId) ?? schema?.models[0] ?? null;
  const selected = records.find(({ id }) => id === selectedId) ?? null;

  useEffect(() => { void dataSourceWorkspaceRuntime.load(); }, []);
  useEffect(() => {
    if (!internalSource || !sourceSnapshot.project) { setSchema(null); setMessage('Crea ElectroCraft Data y al menos un modelo para gestionar registros.'); return; }
    let active = true;
    setLoading(true);
    void dataSourceWorkspaceRuntime.introspectSchema(internalSource, 'development')
      .then((next) => {
        if (!active) return;
        setSchema(next);
        setModelId((current) => next?.models.some(({ id }) => id === current) ? current : (next?.models[0]?.id ?? ''));
        setMessage(next?.models.length ? 'Selecciona un modelo y un registro.' : 'Crea un modelo antes de añadir registros.');
      })
      .catch((error: unknown) => active && setMessage(error instanceof Error ? error.message : 'No se pudo cargar el esquema.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [internalSource, sourceSnapshot.project]);

  async function refresh(preferredId?: string | null) {
    if (!internalSource || !model) return;
    setLoading(true);
    try {
      const result = queryResult(await dataSourceWorkspaceRuntime.query(internalSource, 'development', model.id, { offset: 0, limit: 200, includeDeleted }));
      setRecords(result.rows);
      const nextSelected = preferredId && result.rows.some(({ id }) => id === preferredId) ? preferredId : (result.rows.find(({ deletedAt }) => !deletedAt)?.id ?? result.rows[0]?.id ?? null);
      setSelectedId(nextSelected);
      setMessage(`${result.total} registro(s) cargado(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudieron cargar los registros.');
    } finally { setLoading(false); }
  }

  useEffect(() => { setCreating(false); setSelectedId(null); setRecords([]); if (model && internalSource) void refresh(null); }, [model?.id, internalSource?.id, includeDeleted]);
  useEffect(() => {
    if (!model) return;
    const next = selected ? selected.data : creating ? initialDraft(model) : {};
    setDraft(Object.freeze({ ...next }));
    setJsonTexts({});
  }, [selected?.id, creating, model?.id]);

  function setField(key: string, value: JsonValue | undefined) {
    setDraft((current) => {
      const next = { ...current } as Record<string, JsonValue>;
      if (value === undefined) delete next[key]; else next[key] = value;
      return Object.freeze(next);
    });
  }

  function materializeDraft() {
    const next = { ...draft } as Record<string, JsonValue>;
    for (const [key, text] of Object.entries(jsonTexts)) {
      if (!text.trim()) { delete next[key]; continue; }
      try { next[key] = JSON.parse(text) as JsonValue; }
      catch { throw new Error(`El campo ${model?.fields.find((field) => field.key === key)?.label ?? key} contiene JSON inválido.`); }
    }
    return next;
  }

  async function save() {
    if (!internalSource || !model) return;
    setMessage('Validando y guardando registro…');
    try {
      const data = materializeDraft();
      if (creating) {
        const created = await dataSourceWorkspaceRuntime.mutate(internalSource, 'development', model.id, 'create', { data });
        const id = created && !Array.isArray(created) && typeof created === 'object' && typeof (created as Record<string, JsonValue>).id === 'string' ? String((created as Record<string, JsonValue>).id) : null;
        setCreating(false);
        await refresh(id);
        setMessage('Registro creado y validado.');
      } else if (selected) {
        await dataSourceWorkspaceRuntime.mutate(internalSource, 'development', model.id, 'update', { id: selected.id, data, state: selected.state });
        await refresh(selected.id);
        setMessage('Registro actualizado y validado.');
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo guardar el registro.'); }
  }

  async function remove() {
    if (!internalSource || !model || !selected || selected.deletedAt) return;
    setMessage('Moviendo registro a eliminados…');
    try {
      await dataSourceWorkspaceRuntime.mutate(internalSource, 'development', model.id, 'delete', { id: selected.id });
      await refresh(null);
      setMessage('Registro eliminado de forma reversible en almacenamiento.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se pudo eliminar el registro.'); }
  }

  if (!sourceSnapshot.project) return <div className="ec-records-empty"><strong>Abre un proyecto para gestionar registros.</strong></div>;
  if (!internalSource) return <div className="ec-records-empty"><strong>ElectroCraft Data no está configurada.</strong><a href="/data-sources">Ir a Fuentes de datos</a></div>;
  if (!schema?.models.length) return <div className="ec-records-empty"><strong>No hay modelos de datos.</strong><a href="/models">Crear un modelo</a></div>;

  return (
    <div className="ec-records-workspace" data-records-workspace>
      <div className="ec-records-toolbar">
        <label>Modelo<select aria-label="Modelo de registros" value={model?.id ?? ''} onChange={(event) => setModelId(event.target.value)}>{schema.models.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.label}</option>)}</select></label>
        <label className="ec-records-toggle"><input type="checkbox" checked={includeDeleted} onChange={(event) => setIncludeDeleted(event.target.checked)} />Incluir eliminados</label>
        <Button size="sm" disabled={!model || loading} onClick={() => { if (!model) return; setCreating(true); setSelectedId(null); setDraft(initialDraft(model)); setJsonTexts({}); setMessage('Nuevo registro listo para completar.'); }}>Nuevo registro</Button>
      </div>
      <div className="ec-records-list-detail" data-list-detail-pattern>
        <section className="ec-records-list" aria-label="Lista de registros">
          <div className="ec-records-list-heading"><strong>{model?.pluralLabel ?? model?.label ?? 'Registros'}</strong><span>{loading ? '…' : records.length}</span></div>
          {records.length ? records.map((record) => (
            <button key={record.id} type="button" className="ec-record-card" aria-current={record.id === selectedId ? 'true' : undefined} data-deleted={record.deletedAt ? 'true' : undefined} onClick={() => { setCreating(false); setSelectedId(record.id); }}>
              <strong>{model ? recordLabel(record, model) : record.id}</strong><small>{record.id}</small><span>{record.deletedAt ? 'Eliminado' : record.state}</span>
            </button>
          )) : <div className="ec-records-empty"><strong>No hay registros en este modelo.</strong><span>Usa “Nuevo registro” para crear el primero.</span></div>}
        </section>
        <section className="ec-records-detail" aria-label="Detalle del registro">
          {model && (creating || selected) ? (
            <>
              <div className="ec-records-detail-heading"><div><strong>{creating ? `Nuevo ${model.singularLabel ?? model.label}` : recordLabel(selected!, model)}</strong><small>{selected?.deletedAt ? `Eliminado ${selected.deletedAt}` : 'Validación canónica activa'}</small></div><div className="ec-records-actions"><Button size="sm" disabled={Boolean(selected?.deletedAt) || loading} onClick={() => void save()}>Guardar</Button>{selected && !selected.deletedAt ? <Button size="sm" variant="ghost" onClick={() => void remove()}>Eliminar</Button> : null}</div></div>
              <div className="ec-record-form">
                {topLevelFields(model).map((field) => <label key={field.id}><span>{field.label}{(field.required ?? !field.nullable) ? ' *' : ''}</span>{field.help ? <small>{field.help}</small> : null}<FieldEditor field={field} value={draft[field.key]} jsonText={jsonTexts[field.key]} disabled={Boolean(selected?.deletedAt)} onValue={(value) => setField(field.key, value)} onJsonText={(value) => setJsonTexts((current) => ({ ...current, [field.key]: value }))} /></label>)}
              </div>
            </>
          ) : <div className="ec-records-empty"><strong>Selecciona un registro.</strong><span>El detalle y el formulario aparecerán aquí.</span></div>}
        </section>
      </div>
      <p className="ec-records-status" role={/No se pudo|inválid|obligatorio|Error/i.test(message) ? 'alert' : 'status'}>{message}</p>
    </div>
  );
}
''',
)
write(
    'apps/studio/src/features/data/records-workspace.css',
    r'''.ec-records-workspace { display:flex; flex-direction:column; min-height:0; gap:12px; padding:0 16px 16px; }
.ec-records-toolbar { min-height:44px; display:flex; align-items:end; gap:10px; flex-wrap:wrap; padding:10px 0; }
.ec-records-toolbar label { display:grid; gap:4px; font-size:12px; color:var(--ec-text-muted, #6b7280); }
.ec-records-toolbar select, .ec-record-form select, .ec-record-form textarea { min-height:36px; border:1px solid var(--ec-border, #d1d5db); border-radius:8px; background:var(--ec-surface, #fff); color:inherit; padding:7px 10px; }
.ec-records-toggle { display:flex !important; grid-auto-flow:column; align-items:center; gap:7px !important; min-height:36px; }
.ec-records-list-detail { display:grid; grid-template-columns:minmax(260px, 34%) minmax(0, 1fr); min-height:0; gap:12px; flex:1; }
.ec-records-list, .ec-records-detail { min-width:0; min-height:0; overflow:auto; border-radius:12px; background:var(--ec-panel, rgba(127,127,127,.04)); padding:12px; }
.ec-records-list-heading, .ec-records-detail-heading { display:flex; align-items:center; justify-content:space-between; gap:10px; padding:2px 2px 10px; }
.ec-records-list-heading span { font-size:12px; color:var(--ec-text-muted, #6b7280); }
.ec-record-card { width:100%; display:grid; grid-template-columns:minmax(0,1fr) auto; gap:3px 8px; text-align:left; border:0; border-radius:9px; background:transparent; color:inherit; padding:10px; cursor:pointer; }
.ec-record-card:hover, .ec-record-card[aria-current='true'] { background:var(--ec-hover, rgba(127,127,127,.09)); }
.ec-record-card strong { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ec-record-card small { grid-column:1; color:var(--ec-text-muted, #6b7280); overflow:hidden; text-overflow:ellipsis; }
.ec-record-card span { grid-column:2; grid-row:1 / span 2; align-self:center; font-size:11px; text-transform:capitalize; color:var(--ec-text-muted, #6b7280); }
.ec-record-card[data-deleted='true'] { opacity:.62; }
.ec-records-actions { display:flex; gap:6px; }
.ec-records-detail-heading strong, .ec-records-detail-heading small { display:block; }
.ec-records-detail-heading small { margin-top:3px; color:var(--ec-text-muted, #6b7280); }
.ec-record-form { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; padding:6px 2px 12px; }
.ec-record-form > label { min-width:0; display:grid; align-content:start; gap:5px; font-size:12px; }
.ec-record-form > label > span { font-weight:600; }
.ec-record-form > label > small { color:var(--ec-text-muted, #6b7280); }
.ec-record-form textarea { width:100%; resize:vertical; font-family:inherit; }
.ec-record-form select[multiple] { min-height:96px; }
.ec-record-boolean { min-height:36px; display:flex; align-items:center; gap:8px; }
.ec-records-status { margin:0; min-height:20px; padding:0 2px; font-size:12px; color:var(--ec-text-muted, #6b7280); }
.ec-records-empty { min-height:120px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:5px; text-align:center; color:var(--ec-text-muted, #6b7280); padding:20px; }
.ec-records-empty strong { color:var(--ec-text, inherit); }
.ec-records-empty a { text-decoration:underline; }
@media (max-width: 1023px) { .ec-records-list-detail { grid-template-columns:minmax(220px, 42%) minmax(0,1fr); } .ec-record-form { grid-template-columns:1fr; } }
@media (max-width: 767px) { .ec-records-workspace { padding:0 10px 12px; } .ec-records-toolbar { align-items:stretch; } .ec-records-toolbar > * { flex:1 1 100%; } .ec-records-list-detail { display:flex; flex-direction:column; } .ec-records-list { overflow:visible; } .ec-records-detail { overflow:visible; } .ec-record-card { min-height:58px; } }
@media (prefers-reduced-motion: reduce) { .ec-record-card { scroll-behavior:auto; } }
''',
)
replace_once(
    'apps/studio/src/features/data/index.ts',
    "export * from './data-sources-workspace';",
    "export * from './data-sources-workspace';\nexport * from './records-workspace';",
)
replace_once(
    'apps/studio/src/shell/information-architecture-ui.tsx',
    "import type { ReactNode } from 'react';",
    "import type { ReactNode } from 'react';\nimport { RecordsWorkspace } from '../features/data/records-workspace';",
)
regex_once(
    'apps/studio/src/shell/information-architecture-ui.tsx',
    r"      <div className=\"ec-ia-list-detail\" data-list-detail-pattern>.*?\n      </div>\n    </section>\n  \);\n}\n\nexport function StudioModuleEmptyStateRoute",
    r'''      <RecordsWorkspace />
    </section>
  );
}

export function StudioModuleEmptyStateRoute''',
)

# Contract/UI boundaries and implementation evidence.
write(
    'tooling/vitest/contract/m08-12-record-boundary.test.ts',
    r'''import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { STUDIO_STORAGE_SCHEMA_VERSION } from '@electrocraft/data-web';

const read = (path: string) => readFileSync(resolve(path), 'utf8');

describe('M08.12 record CRUD architecture boundary', () => {
  it('keeps one generic store, canonical validation, soft delete and ConnectorRegistry writes', () => {
    const schema = read('packages/data-web/src/schema.ts');
    const migration = read('packages/data-web/drizzle/0006_m08_12_record_soft_delete.sql');
    const repository = read('packages/data-web/src/internal-data-repository.ts');
    const adapter = read('packages/connectors/src/internal-data-source-adapter.ts');
    const validator = read('packages/connectors/src/record-validation.ts');
    const workspace = read('apps/studio/src/features/data/records-workspace.tsx');
    expect(STUDIO_STORAGE_SCHEMA_VERSION).toBe(7);
    expect(schema).toContain("'content_records'");
    expect(schema).toContain("deletedAt: timestamp('deleted_at'");
    expect(migration).toContain('ALTER TABLE content_records ADD COLUMN IF NOT EXISTS deleted_at');
    expect(repository).toContain("set({ state: 'deleted', deletedAt: now");
    expect(repository).not.toMatch(/CREATE TABLE|user_model|dynamic_model/i);
    expect(adapter).toContain('compileElectroCraftRecordValidator');
    expect(validator).toContain('electroCraftDataSchemaSchema.parse');
    expect(workspace).toContain('dataSourceWorkspaceRuntime.mutate');
    expect(workspace).not.toContain('createDrizzleInternalDataRepository');
  });
});
''',
)
write(
    'tooling/playwright/m08-12-records.spec.ts',
    r'''import { expect, test, type Page } from '@playwright/test';

async function createProject(page: Page) {
  await page.goto('/');
  const newProject = page.getByRole('button', { name: 'Nuevo proyecto' }).first();
  await expect(newProject).toBeEnabled({ timeout: 60_000 });
  await newProject.click();
  await page.getByLabel('Nombre del proyecto').fill('App Registros F08');
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Siguiente' }).click();
  await page.getByRole('button', { name: 'Crear proyecto' }).click();
  await expect(page.locator('[data-editor-sync-state="ready"]')).toBeVisible({ timeout: 60_000 });
}

async function createInternalSource(page: Page) {
  await page.goto('/data-sources');
  await expect(page.getByRole('heading', { name: 'Fuentes de datos' })).toBeVisible({ timeout: 60_000 });
  const createInternal = page.getByRole('button', { name: 'Crear ElectroCraft Data' });
  if (await createInternal.isVisible()) {
    await createInternal.click();
    await expect(page.getByText('ElectroCraft Data creada.')).toBeVisible({ timeout: 60_000 });
  }
}

test('M08.12 crea, valida, edita y elimina suavemente un registro desde /content', async ({ page }) => {
  test.setTimeout(180_000);
  await createProject(page);
  await createInternalSource(page);
  await page.goto('/models');
  const newModel = page.getByRole('button', { name: 'Nuevo modelo' });
  await expect(newModel).toBeEnabled({ timeout: 60_000 });
  await newModel.click();
  await expect(page.getByRole('heading', { name: 'Nuevo modelo', exact: true })).toBeVisible({ timeout: 60_000 });

  await page.goto('/content');
  await expect(page.locator('[data-records-workspace]')).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Nuevo registro' }).click();
  const detail = page.getByRole('region', { name: 'Detalle del registro' });
  const firstText = detail.locator('input[type="text"]').first();
  await firstText.fill('Producto E2E');
  await detail.getByRole('button', { name: 'Guardar' }).click();
  await expect(page.getByRole('status')).toContainText(/Registro creado|registro\(s\) cargado/i, { timeout: 60_000 });
  await expect(page.getByText('Producto E2E', { exact: true }).first()).toBeVisible();

  await detail.getByRole('button', { name: 'Eliminar' }).click();
  await expect(page.getByRole('status')).toContainText(/eliminado/i, { timeout: 60_000 });
  await page.getByLabel('Incluir eliminados').check();
  await expect(page.getByText('Eliminado', { exact: true }).first()).toBeVisible({ timeout: 60_000 });
});
''',
)
write(
    '.ai/evidence/F08/M08.12/IMPLEMENTATION_2026-09-05.md',
    '''# M08.12 — Implementación candidata\n\nFecha: 2026-09-05.\nRama: `codex/m08-12-record-crud-validation`.\nEstado: `IMPLEMENTADA / PENDIENTE GATE`.\n\n## Owner y arquitectura\n\n- Owner: `PGlite generic content store` existente.\n- `content_records` permanece como única tabla física de registros.\n- Migración v7 añade únicamente `deleted_at` e índice parcial para registros activos; no existe DDL por modelo.\n- El adapter compila/ejecuta validación desde `ElectroCraftDataSchema` antes de create/update y mantiene normalización M08.9.\n- Todas las mutaciones de Studio pasan por `dataSourceWorkspaceRuntime -> WebDataSourceRepository -> ConnectorRegistry -> InternalDataSourceAdapter`.\n\n## Validación\n\n- required/nullability;\n- tipo número/boolean/text/referencia/lista/objeto;\n- min/max y minLength/maxLength;\n- pattern;\n- email, URL, fecha, hora, datetime y color;\n- opciones select/radio/checkbox;\n- campos desconocidos fail-closed;\n- defaults;\n- Group/Repeater/Calculated/Conditional continúan bajo el runtime M08.9.\n\n## Soft delete\n\n- `state = deleted` + `deleted_at`;\n- queries excluyen eliminados por defecto;\n- `includeDeleted` permite inspección explícita;\n- updates no reviven registros eliminados;\n- `restrict/detach/cascade` conserva atomicidad y cascade aplica la misma policy soft-delete.\n\n## UI\n\n`Datos > Registros` deja de ser placeholder y ofrece selector de modelo, lista/detail, formulario generado por campos, create/update/delete y vista opcional de eliminados. Desktop mantiene dos regiones; mobile usa cards apiladas.\n\n## Tests añadidos\n\n- `tooling/vitest/unit/m08-12-record-validation.test.ts`;\n- `tooling/vitest/integration/m08-12-record-crud-pglite.test.ts`;\n- `tooling/vitest/contract/m08-12-record-boundary.test.ts`;\n- `tooling/playwright/m08-12-records.spec.ts`.\n\n## Gate\n\nPendiente de PR y ElectroCraft Base CI completo. No declarar cierre hasta GREEN.\n''',
)

# Update continuity without falsely closing M08.12.
replace_once(
    '.ai/TRACKING.md',
    "| F08 / M08.12       | ACTIVE                                                     | `.ai/microphases/M08_12.md`",
    "| F08 / M08.12       | IMPLEMENTADA / PENDIENTE GATE                              | `.ai/evidence/F08/M08.12/IMPLEMENTATION_2026-09-05.md`",
)
replace_once(
    '.ai/STATE.md',
    "- M08.12 — CRUD de Registros y validación: `ACTIVE`.",
    "- M08.12 — CRUD de Registros y validación: `IMPLEMENTADA / PENDIENTE GATE`.",
)
replace_once(
    '.ai/HANDOFF.md',
    "F08 / M08.12 — CRUD de Registros y validación — `ACTIVE`.",
    "F08 / M08.12 — CRUD de Registros y validación — `ACTIVE` (`IMPLEMENTADA / PENDIENTE GATE`).",
)

print('M08.12 patch applied')
