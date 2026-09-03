import type {
  DataSourceResourceDescriptor,
  InternalDataQuery,
  InternalDataQueryResult,
  InternalDataRecord,
  InternalDataRecordInput,
  InternalDataRecordUpdate,
  InternalDataRepository,
  InternalDataSourceStats,
} from '@electrocraft/application';
import { electroCraftDataSchemaSchema, type ElectroCraftDataSchema, type JsonValue } from '@electrocraft/domain';
import { and, asc, count, desc, eq } from 'drizzle-orm';
import type { StudioProjectDatabase } from './repository';
import * as schema from './schema';

function requireNonEmpty(value: string, field: string) {
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${field} must not be empty`);
  return normalized;
}

function asJsonObject(value: unknown, field: string): Readonly<Record<string, JsonValue>> {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    throw new TypeError(`${field} must be a JSON object`);
  }
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
  });
}

function comparable(value: JsonValue | undefined): string | number | boolean | null {
  if (value === null || value === undefined) return null;
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

function normalizeQuery(query: InternalDataQuery | undefined) {
  const offset = Math.max(0, Math.trunc(query?.offset ?? 0));
  const limit = Math.min(200, Math.max(1, Math.trunc(query?.limit ?? 50)));
  return Object.freeze({
    offset,
    limit,
    filter: query?.filter,
    sort: query?.sort,
  });
}

async function schemasForSource(
  db: StudioProjectDatabase,
  projectId: string,
  sourceId: string,
): Promise<readonly ElectroCraftDataSchema[]> {
  const rows = await db
    .select({ payload: schema.projectObjects.payload })
    .from(schema.projectObjects)
    .where(and(eq(schema.projectObjects.projectId, projectId), eq(schema.projectObjects.kind, 'data-schema')));

  return Object.freeze(
    rows
      .flatMap(({ payload }) => {
        const parsed = electroCraftDataSchemaSchema.safeParse(payload);
        return parsed.success && parsed.data.sourceRef === sourceId ? [parsed.data] : [];
      })
      .sort((left, right) => right.version - left.version),
  );
}

export function createDrizzleInternalDataRepository(db: StudioProjectDatabase): InternalDataRepository {
  async function testConnection(projectIdInput: string) {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const row = await db
      .select({ id: schema.projects.id })
      .from(schema.projects)
      .where(eq(schema.projects.id, projectId))
      .limit(1);
    return Object.freeze({
      ok: Boolean(row[0]),
      message: row[0] ? 'ElectroCraft Data local está disponible.' : 'El proyecto local no está disponible.',
    });
  }

  async function getSchema(projectIdInput: string, sourceIdInput: string) {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const sourceId = requireNonEmpty(sourceIdInput, 'sourceId');
    return (await schemasForSource(db, projectId, sourceId))[0] ?? null;
  }

  async function listResources(
    projectIdInput: string,
    sourceIdInput: string,
  ): Promise<readonly DataSourceResourceDescriptor[]> {
    const dataSchema = await getSchema(projectIdInput, sourceIdInput);
    if (!dataSchema) return Object.freeze([]);
    return Object.freeze(
      dataSchema.models.map((model) =>
        Object.freeze({
          id: model.id,
          label: model.label,
          kind: 'model',
          operations: Object.freeze([
            Object.freeze({
              id: 'read',
              label: 'Listar registros',
              capability: 'read' as const,
              parameters: Object.freeze([
                Object.freeze({
                  name: 'offset',
                  label: 'Desde',
                  location: 'input' as const,
                  inputPath: Object.freeze(['offset']),
                  required: false,
                  valueType: 'number' as const,
                  defaultValue: 0,
                }),
                Object.freeze({
                  name: 'limit',
                  label: 'Límite',
                  location: 'input' as const,
                  inputPath: Object.freeze(['limit']),
                  required: false,
                  valueType: 'number' as const,
                  defaultValue: 50,
                }),
                Object.freeze({
                  name: 'filter',
                  label: 'Filtro JSON',
                  location: 'input' as const,
                  inputPath: Object.freeze(['filter']),
                  required: false,
                  valueType: 'json' as const,
                }),
                Object.freeze({
                  name: 'sort',
                  label: 'Orden JSON',
                  location: 'input' as const,
                  inputPath: Object.freeze(['sort']),
                  required: false,
                  valueType: 'json' as const,
                }),
              ]),
              inputSchema: null,
            }),
            Object.freeze({
              id: 'create',
              label: 'Crear registro',
              capability: 'create' as const,
              parameters: Object.freeze([
                Object.freeze({
                  name: 'data',
                  label: 'Datos JSON',
                  location: 'input' as const,
                  inputPath: Object.freeze(['data']),
                  required: true,
                  valueType: 'json' as const,
                }),
              ]),
              inputSchema: null,
            }),
            Object.freeze({
              id: 'update',
              label: 'Actualizar registro',
              capability: 'update' as const,
              parameters: Object.freeze([
                Object.freeze({
                  name: 'id',
                  label: 'ID del registro',
                  location: 'input' as const,
                  inputPath: Object.freeze(['id']),
                  required: true,
                  valueType: 'string' as const,
                }),
                Object.freeze({
                  name: 'data',
                  label: 'Datos JSON',
                  location: 'input' as const,
                  inputPath: Object.freeze(['data']),
                  required: true,
                  valueType: 'json' as const,
                }),
              ]),
              inputSchema: null,
            }),
            Object.freeze({
              id: 'delete',
              label: 'Eliminar registro',
              capability: 'delete' as const,
              parameters: Object.freeze([
                Object.freeze({
                  name: 'id',
                  label: 'ID del registro',
                  location: 'input' as const,
                  inputPath: Object.freeze(['id']),
                  required: true,
                  valueType: 'string' as const,
                }),
              ]),
              inputSchema: null,
            }),
          ]),
          metadata: Object.freeze({
            key: model.key,
            fieldCount: model.fields.length,
            dataSchemaId: dataSchema.id,
          }),
        }),
      ),
    );
  }

  async function queryRecords(
    projectIdInput: string,
    modelIdInput: string,
    request?: InternalDataQuery,
  ): Promise<InternalDataQueryResult> {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const modelId = requireNonEmpty(modelIdInput, 'modelId');
    const query = normalizeQuery(request);
    const rows = (
      await db
        .select()
        .from(schema.contentRecords)
        .where(and(eq(schema.contentRecords.projectId, projectId), eq(schema.contentRecords.modelId, modelId)))
        .orderBy(asc(schema.contentRecords.createdAt), asc(schema.contentRecords.id))
    ).map(toRecord);

    let filtered = rows;
    if (query.filter) {
      filtered = filtered.filter((row) => row.data[query.filter!.field] === query.filter!.value);
    }
    if (query.sort) {
      const direction = query.sort.direction === 'desc' ? -1 : 1;
      filtered = [...filtered].sort(
        (left, right) => direction * compareValues(left.data[query.sort!.field], right.data[query.sort!.field]),
      );
    }

    return Object.freeze({
      rows: Object.freeze(filtered.slice(query.offset, query.offset + query.limit)),
      total: filtered.length,
      offset: query.offset,
      limit: query.limit,
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
    const now = new Date();
    const inserted = await db
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
    return toRecord(inserted[0]);
  }

  async function updateRecord(
    projectIdInput: string,
    modelIdInput: string,
    input: InternalDataRecordUpdate,
  ): Promise<InternalDataRecord> {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const modelId = requireNonEmpty(modelIdInput, 'modelId');
    const id = requireNonEmpty(input.id, 'record.id');
    const updated = await db
      .update(schema.contentRecords)
      .set({ data: { ...input.data }, ...(input.state ? { state: input.state } : {}), updatedAt: new Date() })
      .where(
        and(
          eq(schema.contentRecords.projectId, projectId),
          eq(schema.contentRecords.modelId, modelId),
          eq(schema.contentRecords.id, id),
        ),
      )
      .returning();
    if (!updated[0]) throw new Error(`internal data record not found: ${id}`);
    return toRecord(updated[0]);
  }

  async function deleteRecord(projectIdInput: string, modelIdInput: string, recordIdInput: string): Promise<boolean> {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const modelId = requireNonEmpty(modelIdInput, 'modelId');
    const recordId = requireNonEmpty(recordIdInput, 'recordId');
    const deleted = await db
      .delete(schema.contentRecords)
      .where(
        and(
          eq(schema.contentRecords.projectId, projectId),
          eq(schema.contentRecords.modelId, modelId),
          eq(schema.contentRecords.id, recordId),
        ),
      )
      .returning({ id: schema.contentRecords.id });
    return deleted.length > 0;
  }

  async function getStats(projectIdInput: string, sourceIdInput: string): Promise<InternalDataSourceStats> {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const resources = await listResources(projectId, sourceIdInput);
    const recordCount = await db
      .select({ value: count(schema.contentRecords.id) })
      .from(schema.contentRecords)
      .where(eq(schema.contentRecords.projectId, projectId));
    return Object.freeze({
      modelCount: resources.length,
      recordCount: Number(recordCount[0]?.value ?? 0),
    });
  }

  return Object.freeze({
    testConnection,
    listResources,
    getSchema,
    queryRecords,
    createRecord,
    updateRecord,
    deleteRecord,
    getStats,
  });
}
