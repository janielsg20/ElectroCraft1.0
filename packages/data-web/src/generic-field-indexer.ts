import type {
  InternalDataIndexStatus,
  InternalDataQuery,
  InternalDataQueryResult,
  InternalDataRecord,
  InternalDataRecordInput,
  InternalDataRecordUpdate,
  InternalDataRepository,
} from '@electrocraft/application';
import {
  electroCraftDataSchemaSchema,
  hasElectroCraftFieldIndexing,
  normalizeElectroCraftIndexText,
  readElectroCraftAdvancedFieldMetadata,
  readElectroCraftFieldIndexing,
  type ElectroCraftDataField,
  type ElectroCraftDataModel,
  type ElectroCraftDataSchema,
  type JsonValue,
} from '@electrocraft/domain';
import { and, asc, eq, isNull } from 'drizzle-orm';
import { createDrizzleInternalDataRepository } from './internal-data-repository';
import type { StudioProjectDatabase } from './repository';
import * as schema from './schema';

type IndexInsert = typeof schema.recordFieldIndex.$inferInsert;
type IndexRow = typeof schema.recordFieldIndex.$inferSelect;
type ExtractedValue = Readonly<{ value: JsonValue; ordinal: number }>;

function requireNonEmpty(value: string, field: string) {
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${field} must not be empty`);
  return normalized;
}

function asJsonObject(value: unknown, field: string): Readonly<Record<string, JsonValue>> {
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new TypeError(`${field} must be a JSON object`);
  return value as Readonly<Record<string, JsonValue>>;
}

function toRecord(row: typeof schema.contentRecords.$inferSelect): InternalDataRecord {
  return Object.freeze({
    id: row.id,
    modelId: row.modelId,
    data: Object.freeze({ ...asJsonObject(row.data, 'record.data') }),
    state: row.state,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: row.deletedAt?.toISOString() ?? null,
  });
}

function normalizeQuery(query: InternalDataQuery | undefined) {
  return Object.freeze({
    offset: Math.max(0, Math.trunc(query?.offset ?? 0)),
    limit: Math.min(200, Math.max(1, Math.trunc(query?.limit ?? 50))),
    filter: query?.filter,
    sort: query?.sort,
    search: query?.search,
    facets: Object.freeze([...(query?.facets ?? [])]),
    includeDeleted: query?.includeDeleted === true,
  });
}

async function dataSchemasForProject(db: StudioProjectDatabase, projectId: string): Promise<readonly ElectroCraftDataSchema[]> {
  const rows = await db
    .select({ payload: schema.projectObjects.payload })
    .from(schema.projectObjects)
    .where(and(eq(schema.projectObjects.projectId, projectId), eq(schema.projectObjects.kind, 'data-schema')));
  return Object.freeze(
    rows
      .flatMap(({ payload }) => {
        const parsed = electroCraftDataSchemaSchema.safeParse(payload);
        return parsed.success ? [parsed.data] : [];
      })
      .sort((left, right) => right.version - left.version),
  );
}

async function dataModelForProject(db: StudioProjectDatabase, projectId: string, modelId: string) {
  for (const dataSchema of await dataSchemasForProject(db, projectId)) {
    const model = dataSchema.models.find(({ id }) => id === modelId);
    if (model) return Object.freeze({ dataSchema, model });
  }
  throw new Error(`Modelo interno no encontrado para indexación: ${modelId}.`);
}

async function dataModelForSource(db: StudioProjectDatabase, projectId: string, sourceId: string, modelId: string) {
  const dataSchema = (await dataSchemasForProject(db, projectId)).find(({ sourceRef }) => sourceRef === sourceId);
  const model = dataSchema?.models.find(({ id }) => id === modelId) ?? null;
  if (!dataSchema || !model) throw new Error(`Modelo interno no encontrado para la fuente: ${modelId}.`);
  return Object.freeze({ dataSchema, model });
}

function childContainers(
  model: ElectroCraftDataModel,
  field: ElectroCraftDataField,
  data: Readonly<Record<string, JsonValue>>,
  visited = new Set<string>(),
): readonly Readonly<Record<string, JsonValue>>[] {
  if (visited.has(field.id)) return Object.freeze([]);
  visited.add(field.id);
  const parentRef = readElectroCraftAdvancedFieldMetadata(field).parentFieldRef;
  if (!parentRef) return Object.freeze([data]);
  const parent = model.fields.find(({ id }) => id === parentRef);
  if (!parent) return Object.freeze([]);
  const next: Readonly<Record<string, JsonValue>>[] = [];
  for (const container of childContainers(model, parent, data, visited)) {
    const value = container[parent.key];
    if (parent.type === 'repeater' && Array.isArray(value)) {
      for (const item of value) {
        if (item && !Array.isArray(item) && typeof item === 'object') {
          next.push(item as Readonly<Record<string, JsonValue>>);
        }
      }
    } else if (value && !Array.isArray(value) && typeof value === 'object') {
      next.push(value as Readonly<Record<string, JsonValue>>);
    }
  }
  return Object.freeze(next);
}

function extractedValues(
  model: ElectroCraftDataModel,
  field: ElectroCraftDataField,
  data: Readonly<Record<string, JsonValue>>,
): readonly ExtractedValue[] {
  const values: JsonValue[] = [];
  for (const container of childContainers(model, field, data)) {
    const value = container[field.key];
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) values.push(...value.filter((item) => item !== null));
    else values.push(value);
  }
  return Object.freeze(values.map((value, ordinal) => Object.freeze({ value, ordinal })));
}

function typedIndexValue(field: ElectroCraftDataField, value: JsonValue): Partial<IndexInsert> | null {
  if (typeof value === 'number' && Number.isFinite(value)) return { valueKind: 'number', numericValue: value };
  if (typeof value === 'boolean') return { valueKind: 'boolean', booleanValue: value };
  if (typeof value !== 'string') return null;
  if (field.type === 'date' || field.type === 'datetime') {
    const timestamp = new Date(value);
    if (Number.isFinite(timestamp.getTime())) return { valueKind: 'date', timestampValue: timestamp };
  }
  return {
    valueKind: 'text',
    textValue: value,
    normalizedText: normalizeElectroCraftIndexText(value),
  };
}

export function createGenericFieldIndexRows(
  projectId: string,
  model: ElectroCraftDataModel,
  recordId: string,
  data: Readonly<Record<string, JsonValue>>,
): IndexInsert[] {
  const rows: IndexInsert[] = [];
  for (const field of model.fields) {
    if (!hasElectroCraftFieldIndexing(field)) continue;
    const flags = readElectroCraftFieldIndexing(field);
    for (const { value, ordinal } of extractedValues(model, field, data)) {
      const typed = typedIndexValue(field, value);
      if (!typed?.valueKind) continue;
      rows.push({
        projectId,
        modelId: model.id,
        recordId,
        fieldId: field.id,
        ordinal,
        valueKind: typed.valueKind,
        textValue: typed.textValue,
        normalizedText: typed.normalizedText,
        numericValue: typed.numericValue,
        booleanValue: typed.booleanValue,
        timestampValue: typed.timestampValue,
        searchable: flags.searchable,
        filterable: flags.filterable,
        sortable: flags.sortable,
        faceted: flags.faceted,
      });
    }
  }
  return rows;
}

function comparable(value: JsonValue | undefined): string | number | boolean | null {
  if (value === undefined || value === null) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return JSON.stringify(value);
}

function compareValues(left: JsonValue | undefined, right: JsonValue | undefined) {
  const a = comparable(left);
  const b = comparable(right);
  if (a === b) return 0;
  if (a === null) return -1;
  if (b === null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'es');
}

function indexRowJsonValue(row: IndexRow): JsonValue {
  if (row.valueKind === 'number') return row.numericValue ?? null;
  if (row.valueKind === 'boolean') return row.booleanValue ?? null;
  if (row.valueKind === 'date') return row.timestampValue?.toISOString() ?? null;
  return row.textValue ?? null;
}

function fieldRows(rows: readonly IndexRow[], fieldId: string) {
  return rows.filter((row) => row.fieldId === fieldId);
}

async function currentIndexStatus(
  db: StudioProjectDatabase,
  projectId: string,
  sourceId: string,
  modelId: string,
): Promise<InternalDataIndexStatus> {
  const { model } = await dataModelForSource(db, projectId, sourceId, modelId);
  const indexableFieldCount = model.fields.filter(hasElectroCraftFieldIndexing).length;
  const records = await db
    .select({ id: schema.contentRecords.id, data: schema.contentRecords.data })
    .from(schema.contentRecords)
    .where(
      and(
        eq(schema.contentRecords.projectId, projectId),
        eq(schema.contentRecords.modelId, modelId),
        isNull(schema.contentRecords.deletedAt),
      ),
    );
  const actualRows = await db
    .select()
    .from(schema.recordFieldIndex)
    .where(and(eq(schema.recordFieldIndex.projectId, projectId), eq(schema.recordFieldIndex.modelId, modelId)));
  const expectedKeys = new Set(
    records.flatMap((record) =>
      createGenericFieldIndexRows(projectId, model, record.id, asJsonObject(record.data, 'record.data')).map(
        (row) => `${row.recordId}:${row.fieldId}:${row.ordinal}`,
      ),
    ),
  );
  const actualKeys = new Set(actualRows.map((row) => `${row.recordId}:${row.fieldId}:${row.ordinal}`));
  const stale = expectedKeys.size !== actualKeys.size || [...expectedKeys].some((key) => !actualKeys.has(key));
  const indexedRecordCount = new Set(actualRows.map(({ recordId }) => recordId)).size;
  const status: InternalDataIndexStatus['status'] =
    indexableFieldCount === 0 ? 'disabled' : records.length === 0 ? 'empty' : stale ? 'stale' : 'ready';
  return Object.freeze({
    modelId,
    status,
    indexableFieldCount,
    activeRecordCount: records.length,
    indexedRecordCount,
    indexRowCount: actualRows.length,
  });
}

export function createGenericFieldIndexedInternalDataRepository(
  db: StudioProjectDatabase,
  base: InternalDataRepository = createDrizzleInternalDataRepository(db),
): InternalDataRepository {
  async function queryRecords(
    projectIdInput: string,
    modelIdInput: string,
    request?: InternalDataQuery,
  ): Promise<InternalDataQueryResult> {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const modelId = requireNonEmpty(modelIdInput, 'modelId');
    const query = normalizeQuery(request);
    const { model } = await dataModelForProject(db, projectId, modelId);
    const rows = (
      await db
        .select()
        .from(schema.contentRecords)
        .where(
          query.includeDeleted
            ? and(eq(schema.contentRecords.projectId, projectId), eq(schema.contentRecords.modelId, modelId))
            : and(
                eq(schema.contentRecords.projectId, projectId),
                eq(schema.contentRecords.modelId, modelId),
                isNull(schema.contentRecords.deletedAt),
              ),
        )
        .orderBy(asc(schema.contentRecords.createdAt), asc(schema.contentRecords.id))
    ).map(toRecord);
    const indexRows = await db
      .select()
      .from(schema.recordFieldIndex)
      .where(and(eq(schema.recordFieldIndex.projectId, projectId), eq(schema.recordFieldIndex.modelId, modelId)));

    let filtered = rows;
    if (query.filter) {
      const field = model.fields.find(({ key }) => key === query.filter!.field);
      const indexing = field ? readElectroCraftFieldIndexing(field) : null;
      if (field && indexing?.filterable) {
        const matchingIds = new Set(
          fieldRows(indexRows, field.id)
            .filter((row) => row.filterable && compareValues(indexRowJsonValue(row), query.filter!.value) === 0)
            .map(({ recordId }) => recordId),
        );
        filtered = filtered.filter(({ id }) => matchingIds.has(id));
      } else {
        filtered = filtered.filter((row) => row.data[query.filter!.field] === query.filter!.value);
      }
    }

    if (query.search?.text.trim()) {
      const needle = normalizeElectroCraftIndexText(query.search.text);
      const requested = new Set(query.search.fields ?? []);
      const fieldIds = new Set(
        model.fields
          .filter(
            (field) =>
              readElectroCraftFieldIndexing(field).searchable && (requested.size === 0 || requested.has(field.key)),
          )
          .map(({ id }) => id),
      );
      const matchingIds = new Set(
        indexRows
          .filter(
            (row) =>
              row.searchable &&
              fieldIds.has(row.fieldId) &&
              typeof row.normalizedText === 'string' &&
              row.normalizedText.includes(needle),
          )
          .map(({ recordId }) => recordId),
      );
      filtered = filtered.filter(({ id }) => matchingIds.has(id));
    }

    if (query.sort) {
      const field = model.fields.find(({ key }) => key === query.sort!.field);
      const indexing = field ? readElectroCraftFieldIndexing(field) : null;
      const direction = query.sort.direction === 'desc' ? -1 : 1;
      if (field && indexing?.sortable) {
        const values = new Map<string, JsonValue>();
        for (const row of fieldRows(indexRows, field.id).filter(({ sortable }) => sortable)) {
          if (!values.has(row.recordId) || row.ordinal === 0) values.set(row.recordId, indexRowJsonValue(row));
        }
        filtered = [...filtered].sort(
          (left, right) => direction * compareValues(values.get(left.id), values.get(right.id)),
        );
      } else {
        filtered = [...filtered].sort(
          (left, right) => direction * compareValues(left.data[query.sort!.field], right.data[query.sort!.field]),
        );
      }
    }

    const facets: Record<string, readonly { value: JsonValue; count: number }[]> = {};
    const visibleIds = new Set(filtered.map(({ id }) => id));
    for (const key of query.facets) {
      const field = model.fields.find(({ key: fieldKey }) => fieldKey === key);
      if (!field || !readElectroCraftFieldIndexing(field).faceted) continue;
      const buckets = new Map<string, { value: JsonValue; count: number }>();
      for (const row of fieldRows(indexRows, field.id)) {
        if (!row.faceted || !visibleIds.has(row.recordId)) continue;
        const value = indexRowJsonValue(row);
        const bucketKey = JSON.stringify(value);
        const current = buckets.get(bucketKey);
        buckets.set(bucketKey, { value, count: (current?.count ?? 0) + 1 });
      }
      facets[key] = Object.freeze(
        [...buckets.values()]
          .sort((left, right) => right.count - left.count || compareValues(left.value, right.value))
          .map((bucket) => Object.freeze(bucket)),
      );
    }

    return Object.freeze({
      rows: Object.freeze(filtered.slice(query.offset, query.offset + query.limit)),
      total: filtered.length,
      offset: query.offset,
      limit: query.limit,
      ...(Object.keys(facets).length ? { facets: Object.freeze(facets) } : {}),
    });
  }

  async function createRecord(
    projectIdInput: string,
    modelIdInput: string,
    input: InternalDataRecordInput,
  ): Promise<InternalDataRecord> {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const modelId = requireNonEmpty(modelIdInput, 'modelId');
    const id = requireNonEmpty(input.id ?? globalThis.crypto.randomUUID(), 'record.id');
    const { model } = await dataModelForProject(db, projectId, modelId);
    return db.transaction(async (tx) => {
      const now = new Date();
      const inserted = await tx
        .insert(schema.contentRecords)
        .values({
          projectId,
          id,
          modelId,
          data: { ...input.data },
          state: input.state ?? 'published',
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      if (!inserted[0]) throw new Error('internal data record was not created');
      const indexRows = createGenericFieldIndexRows(projectId, model, id, input.data);
      if (indexRows.length) await tx.insert(schema.recordFieldIndex).values(indexRows);
      return toRecord(inserted[0]);
    });
  }

  async function updateRecord(
    projectIdInput: string,
    modelIdInput: string,
    input: InternalDataRecordUpdate,
  ): Promise<InternalDataRecord> {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const modelId = requireNonEmpty(modelIdInput, 'modelId');
    const id = requireNonEmpty(input.id, 'record.id');
    const { model } = await dataModelForProject(db, projectId, modelId);
    return db.transaction(async (tx) => {
      const updated = await tx
        .update(schema.contentRecords)
        .set({ data: { ...input.data }, ...(input.state ? { state: input.state } : {}), updatedAt: new Date() })
        .where(
          and(
            eq(schema.contentRecords.projectId, projectId),
            eq(schema.contentRecords.modelId, modelId),
            eq(schema.contentRecords.id, id),
            isNull(schema.contentRecords.deletedAt),
          ),
        )
        .returning();
      if (!updated[0]) throw new Error(`internal data record not found or deleted: ${id}`);
      await tx
        .delete(schema.recordFieldIndex)
        .where(and(eq(schema.recordFieldIndex.projectId, projectId), eq(schema.recordFieldIndex.recordId, id)));
      const indexRows = createGenericFieldIndexRows(projectId, model, id, input.data);
      if (indexRows.length) await tx.insert(schema.recordFieldIndex).values(indexRows);
      return toRecord(updated[0]);
    });
  }

  async function deleteRecord(projectIdInput: string, modelIdInput: string, recordIdInput: string) {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const modelId = requireNonEmpty(modelIdInput, 'modelId');
    const recordId = requireNonEmpty(recordIdInput, 'recordId');
    return db.transaction(async (tx) => {
      const now = new Date();
      const deleted = await tx
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
      if (!deleted.length) return false;
      await tx
        .delete(schema.recordFieldIndex)
        .where(and(eq(schema.recordFieldIndex.projectId, projectId), eq(schema.recordFieldIndex.recordId, recordId)));
      return true;
    });
  }

  async function getModelIndexStatus(projectIdInput: string, sourceIdInput: string, modelIdInput: string) {
    return currentIndexStatus(
      db,
      requireNonEmpty(projectIdInput, 'projectId'),
      requireNonEmpty(sourceIdInput, 'sourceId'),
      requireNonEmpty(modelIdInput, 'modelId'),
    );
  }

  async function reindexModel(projectIdInput: string, sourceIdInput: string, modelIdInput: string) {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const sourceId = requireNonEmpty(sourceIdInput, 'sourceId');
    const modelId = requireNonEmpty(modelIdInput, 'modelId');
    const { model } = await dataModelForSource(db, projectId, sourceId, modelId);
    const records = await db
      .select({ id: schema.contentRecords.id, data: schema.contentRecords.data })
      .from(schema.contentRecords)
      .where(
        and(
          eq(schema.contentRecords.projectId, projectId),
          eq(schema.contentRecords.modelId, modelId),
          isNull(schema.contentRecords.deletedAt),
        ),
      );
    await db.transaction(async (tx) => {
      await tx
        .delete(schema.recordFieldIndex)
        .where(and(eq(schema.recordFieldIndex.projectId, projectId), eq(schema.recordFieldIndex.modelId, modelId)));
      for (const record of records) {
        const indexRows = createGenericFieldIndexRows(
          projectId,
          model,
          record.id,
          asJsonObject(record.data, 'record.data'),
        );
        if (indexRows.length) await tx.insert(schema.recordFieldIndex).values(indexRows);
      }
    });
    return currentIndexStatus(db, projectId, sourceId, modelId);
  }

  return Object.freeze({
    ...base,
    queryRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    getModelIndexStatus,
    reindexModel,
  });
}
