import type {
  DataSourceResourceDescriptor,
  InternalDataFieldUsage,
  InternalDataQuery,
  InternalDataQueryResult,
  InternalDataRecord,
  InternalDataRecordInput,
  InternalDataRecordUpdate,
  InternalDataRepository,
  InternalDataSourceStats,
  InternalTaxonomyTermInput,
  InternalTaxonomyTermUpdate,
} from '@electrocraft/application';
import {
  electroCraftDataSchemaSchema,
  electroTaxonomyTermSchema,
  type ElectroCraftDataSchema,
  type ElectroTaxonomyTerm,
  type JsonValue,
} from '@electrocraft/domain';
import { and, asc, count, eq, isNull } from 'drizzle-orm';
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
    deletedAt: row.deletedAt?.toISOString() ?? null,
  });
}

function toTaxonomyTerm(row: typeof schema.taxonomyTerms.$inferSelect): ElectroTaxonomyTerm {
  return electroTaxonomyTermSchema.parse({
    id: row.id,
    taxonomyRef: row.taxonomyId,
    slug: row.slug,
    name: row.name,
    parentId: row.parentId,
    metadata: row.metadata,
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
  return Object.freeze({ offset, limit, filter: query?.filter, sort: query?.sort, includeDeleted: query?.includeDeleted === true });
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
    return Object.freeze([
      ...dataSchema.models.map((model) =>
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
                  name: 'includeDeleted',
                  label: 'Incluir eliminados',
                  location: 'input' as const,
                  inputPath: Object.freeze(['includeDeleted']),
                  required: false,
                  valueType: 'boolean' as const,
                  defaultValue: false,
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
      ...(dataSchema.taxonomies ?? []).map((taxonomy) =>
        Object.freeze({
          id: `taxonomy:${taxonomy.id}`,
          label: taxonomy.label,
          kind: 'taxonomy',
          operations: Object.freeze([
            Object.freeze({
              id: 'read',
              label: 'Listar términos',
              capability: 'read' as const,
              parameters: Object.freeze([]),
              inputSchema: null,
            }),
            Object.freeze({
              id: 'create',
              label: 'Crear término',
              capability: 'create' as const,
              parameters: Object.freeze([]),
              inputSchema: null,
            }),
            Object.freeze({
              id: 'update',
              label: 'Actualizar término',
              capability: 'update' as const,
              parameters: Object.freeze([]),
              inputSchema: null,
            }),
            Object.freeze({
              id: 'delete',
              label: 'Eliminar término',
              capability: 'delete' as const,
              parameters: Object.freeze([]),
              inputSchema: null,
            }),
          ]),
          metadata: Object.freeze({ taxonomyId: taxonomy.id, hierarchical: taxonomy.hierarchical }),
        }),
      ),
    ]);
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
          isNull(schema.contentRecords.deletedAt),
        ),
      )
      .returning();
    if (!updated[0]) throw new Error(`internal data record not found or deleted: ${id}`);
    return toRecord(updated[0]);
  }

  async function deleteRecord(projectIdInput: string, modelIdInput: string, recordIdInput: string): Promise<boolean> {
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

  async function getStats(projectIdInput: string, sourceIdInput: string): Promise<InternalDataSourceStats> {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const dataSchema = await getSchema(projectId, sourceIdInput);
    const recordCount = await db
      .select({ value: count(schema.contentRecords.id) })
      .from(schema.contentRecords)
      .where(and(eq(schema.contentRecords.projectId, projectId), isNull(schema.contentRecords.deletedAt)));
    return Object.freeze({
      modelCount: dataSchema?.models.length ?? 0,
      recordCount: Number(recordCount[0]?.value ?? 0),
    });
  }

  async function getFieldUsage(
    projectIdInput: string,
    modelIdInput: string,
    fieldKeyInput: string,
  ): Promise<InternalDataFieldUsage> {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const modelId = requireNonEmpty(modelIdInput, 'modelId');
    const fieldKey = requireNonEmpty(fieldKeyInput, 'fieldKey');
    const rows = await db
      .select({ data: schema.contentRecords.data })
      .from(schema.contentRecords)
      .where(
        and(
          eq(schema.contentRecords.projectId, projectId),
          eq(schema.contentRecords.modelId, modelId),
          isNull(schema.contentRecords.deletedAt),
        ),
      );
    let populatedCount = 0;
    for (const row of rows) {
      const data = asJsonObject(row.data, 'record.data');
      if (Object.prototype.hasOwnProperty.call(data, fieldKey) && data[fieldKey] !== null && data[fieldKey] !== '') {
        populatedCount += 1;
      }
    }
    return Object.freeze({ modelId, fieldKey, recordCount: rows.length, populatedCount });
  }

  async function requireTaxonomy(projectId: string, sourceId: string, taxonomyId: string) {
    const dataSchema = await getSchema(projectId, sourceId);
    const taxonomy = dataSchema?.taxonomies?.find(({ id }) => id === taxonomyId) ?? null;
    if (!taxonomy) throw new Error(`Taxonomía interna no encontrada: ${taxonomyId}.`);
    return taxonomy;
  }

  async function listTaxonomyTerms(
    projectIdInput: string,
    sourceIdInput: string,
    taxonomyIdInput: string,
  ): Promise<readonly ElectroTaxonomyTerm[]> {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const sourceId = requireNonEmpty(sourceIdInput, 'sourceId');
    const taxonomyId = requireNonEmpty(taxonomyIdInput, 'taxonomyId');
    await requireTaxonomy(projectId, sourceId, taxonomyId);
    const rows = await db
      .select()
      .from(schema.taxonomyTerms)
      .where(and(eq(schema.taxonomyTerms.projectId, projectId), eq(schema.taxonomyTerms.taxonomyId, taxonomyId)))
      .orderBy(asc(schema.taxonomyTerms.name), asc(schema.taxonomyTerms.id));
    return Object.freeze(rows.map(toTaxonomyTerm));
  }

  async function validateTermParent(
    projectId: string,
    sourceId: string,
    taxonomyId: string,
    termId: string,
    parentId: string | null,
  ) {
    const taxonomy = await requireTaxonomy(projectId, sourceId, taxonomyId);
    if (parentId === null) return;
    if (!taxonomy.hierarchical) throw new Error('Esta taxonomía no admite jerarquía de términos.');
    if (parentId === termId) throw new Error('Un término no puede ser su propio padre.');
    const terms = await listTaxonomyTerms(projectId, sourceId, taxonomyId);
    const byId = new Map<string, ElectroTaxonomyTerm>(terms.map((term) => [term.id, term]));
    if (!byId.has(parentId)) throw new Error('El término padre no pertenece a esta taxonomía.');
    let cursor: string | null = parentId;
    const visited = new Set<string>();
    while (cursor !== null) {
      if (cursor === termId) throw new Error('La jerarquía de términos no puede contener ciclos.');
      if (visited.has(cursor)) throw new Error('La jerarquía de términos existente contiene un ciclo.');
      visited.add(cursor);
      cursor = byId.get(cursor)?.parentId ?? null;
    }
  }

  async function assertUniqueTermSlug(projectId: string, taxonomyId: string, slug: string, exceptId?: string) {
    const rows = await db
      .select({ id: schema.taxonomyTerms.id })
      .from(schema.taxonomyTerms)
      .where(
        and(
          eq(schema.taxonomyTerms.projectId, projectId),
          eq(schema.taxonomyTerms.taxonomyId, taxonomyId),
          eq(schema.taxonomyTerms.slug, slug),
        ),
      );
    if (rows.some(({ id }) => id !== exceptId)) throw new Error(`Ya existe un término con el slug ${slug}.`);
  }

  async function createTaxonomyTerm(
    projectIdInput: string,
    sourceIdInput: string,
    taxonomyIdInput: string,
    input: InternalTaxonomyTermInput,
  ) {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const sourceId = requireNonEmpty(sourceIdInput, 'sourceId');
    const taxonomyId = requireNonEmpty(taxonomyIdInput, 'taxonomyId');
    const id = requireNonEmpty(input.id ?? globalThis.crypto.randomUUID(), 'term.id');
    const slug = requireNonEmpty(input.slug, 'term.slug');
    const name = requireNonEmpty(input.name, 'term.name');
    const parentId = input.parentId ?? null;
    await validateTermParent(projectId, sourceId, taxonomyId, id, parentId);
    await assertUniqueTermSlug(projectId, taxonomyId, slug);
    const candidate = electroTaxonomyTermSchema.parse({
      id,
      taxonomyRef: taxonomyId,
      slug,
      name,
      parentId,
      metadata: input.metadata ?? {},
    });
    const inserted = await db
      .insert(schema.taxonomyTerms)
      .values({
        projectId,
        id: candidate.id,
        taxonomyId: candidate.taxonomyRef,
        slug: candidate.slug,
        name: candidate.name,
        parentId: candidate.parentId,
        metadata: candidate.metadata,
      })
      .returning();
    if (!inserted[0]) throw new Error('El término no pudo crearse.');
    return toTaxonomyTerm(inserted[0]);
  }

  async function updateTaxonomyTerm(
    projectIdInput: string,
    sourceIdInput: string,
    taxonomyIdInput: string,
    input: InternalTaxonomyTermUpdate,
  ) {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const sourceId = requireNonEmpty(sourceIdInput, 'sourceId');
    const taxonomyId = requireNonEmpty(taxonomyIdInput, 'taxonomyId');
    const id = requireNonEmpty(input.id, 'term.id');
    const slug = requireNonEmpty(input.slug, 'term.slug');
    const name = requireNonEmpty(input.name, 'term.name');
    const parentId = input.parentId ?? null;
    await validateTermParent(projectId, sourceId, taxonomyId, id, parentId);
    await assertUniqueTermSlug(projectId, taxonomyId, slug, id);
    const candidate = electroTaxonomyTermSchema.parse({
      id,
      taxonomyRef: taxonomyId,
      slug,
      name,
      parentId,
      metadata: input.metadata ?? {},
    });
    const updated = await db
      .update(schema.taxonomyTerms)
      .set({ slug: candidate.slug, name: candidate.name, parentId: candidate.parentId, metadata: candidate.metadata })
      .where(
        and(
          eq(schema.taxonomyTerms.projectId, projectId),
          eq(schema.taxonomyTerms.taxonomyId, taxonomyId),
          eq(schema.taxonomyTerms.id, id),
        ),
      )
      .returning();
    if (!updated[0]) throw new Error(`Término no encontrado: ${id}.`);
    return toTaxonomyTerm(updated[0]);
  }

  async function deleteTaxonomyTerm(
    projectIdInput: string,
    sourceIdInput: string,
    taxonomyIdInput: string,
    termIdInput: string,
  ) {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const sourceId = requireNonEmpty(sourceIdInput, 'sourceId');
    const taxonomyId = requireNonEmpty(taxonomyIdInput, 'taxonomyId');
    const termId = requireNonEmpty(termIdInput, 'termId');
    await requireTaxonomy(projectId, sourceId, taxonomyId);
    const children = await db
      .select({ id: schema.taxonomyTerms.id })
      .from(schema.taxonomyTerms)
      .where(
        and(
          eq(schema.taxonomyTerms.projectId, projectId),
          eq(schema.taxonomyTerms.taxonomyId, taxonomyId),
          eq(schema.taxonomyTerms.parentId, termId),
        ),
      )
      .limit(1);
    if (children.length > 0) throw new Error('Mueve o elimina primero los términos hijos.');
    const deleted = await db
      .delete(schema.taxonomyTerms)
      .where(
        and(
          eq(schema.taxonomyTerms.projectId, projectId),
          eq(schema.taxonomyTerms.taxonomyId, taxonomyId),
          eq(schema.taxonomyTerms.id, termId),
        ),
      )
      .returning({ id: schema.taxonomyTerms.id });
    return deleted.length > 0;
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
    getFieldUsage,
    listTaxonomyTerms,
    createTaxonomyTerm,
    updateTaxonomyTerm,
    deleteTaxonomyTerm,
  });
}
