import type {
  InternalRelationEdgeInput,
  InternalRelationEdgeQuery,
  InternalRelationEdgeUpdate,
  InternalRelationRepository,
} from '@electrocraft/application';
import {
  electroCraftDataSchemaSchema,
  electroRelationEdgeSchema,
  type ElectroCraftDataSchema,
  type ElectroRelation,
  type ElectroRelationEdge,
} from '@electrocraft/domain';
import { and, asc, eq, isNull } from 'drizzle-orm';
import type { StudioProjectDatabase } from './repository';
import * as schema from './schema';

function requireNonEmpty(value: string, field: string) {
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${field} must not be empty`);
  return normalized;
}

function toEdge(row: typeof schema.relationEdges.$inferSelect): ElectroRelationEdge {
  return electroRelationEdgeSchema.parse({
    id: row.id,
    relationRef: row.relationId,
    fromModelRef: row.fromModelId,
    fromRecordRef: row.fromRecordId,
    toModelRef: row.toModelId,
    toRecordRef: row.toRecordId,
    payload: row.payload,
    createdAt: row.createdAt.toISOString(),
  });
}

async function getSchema(
  db: StudioProjectDatabase,
  projectId: string,
  sourceId: string,
): Promise<ElectroCraftDataSchema> {
  const rows = await db
    .select({ payload: schema.projectObjects.payload })
    .from(schema.projectObjects)
    .where(and(eq(schema.projectObjects.projectId, projectId), eq(schema.projectObjects.kind, 'data-schema')));
  const schemas = rows
    .flatMap(({ payload }) => {
      const parsed = electroCraftDataSchemaSchema.safeParse(payload);
      return parsed.success && parsed.data.sourceRef === sourceId ? [parsed.data] : [];
    })
    .sort((left, right) => right.version - left.version);
  if (!schemas[0]) throw new Error('No hay un schema de datos interno para esta fuente.');
  return schemas[0];
}

async function requireRelation(
  db: StudioProjectDatabase,
  projectId: string,
  sourceId: string,
  relationId: string,
): Promise<ElectroRelation> {
  const dataSchema = await getSchema(db, projectId, sourceId);
  const relation = dataSchema.relations?.find(({ id }) => id === relationId) ?? null;
  if (!relation) throw new Error(`Relación interna no encontrada: ${relationId}.`);
  return relation;
}

async function requireRecord(db: StudioProjectDatabase, projectId: string, modelId: string, recordId: string) {
  const row = await db
    .select({ id: schema.contentRecords.id })
    .from(schema.contentRecords)
    .where(
      and(
        eq(schema.contentRecords.projectId, projectId),
        eq(schema.contentRecords.modelId, modelId),
        eq(schema.contentRecords.id, recordId),
        isNull(schema.contentRecords.deletedAt),
      ),
    )
    .limit(1);
  if (!row[0]) throw new Error(`Registro relacionado no encontrado: ${modelId}/${recordId}.`);
}

function validateCardinality(
  relation: ElectroRelation,
  edges: readonly ElectroRelationEdge[],
  fromRecordId: string,
  toRecordId: string,
  exceptId?: string,
) {
  const others = edges.filter(({ id }) => id !== exceptId);
  if (others.some((edge) => edge.fromRecordRef === fromRecordId && edge.toRecordRef === toRecordId)) {
    throw new Error('La relación ya contiene este vínculo.');
  }
  if (relation.cardinality === 'one-to-one') {
    if (others.some((edge) => edge.fromRecordRef === fromRecordId)) {
      throw new Error('Cardinalidad 1:1: el registro de origen ya está relacionado.');
    }
    if (others.some((edge) => edge.toRecordRef === toRecordId)) {
      throw new Error('Cardinalidad 1:1: el registro de destino ya está relacionado.');
    }
  }
  if (relation.cardinality === 'one-to-many' && others.some((edge) => edge.toRecordRef === toRecordId)) {
    throw new Error('Cardinalidad 1:N: el registro de destino ya pertenece a otro origen.');
  }
}

export function createDrizzleInternalRelationRepository(db: StudioProjectDatabase): InternalRelationRepository {
  async function listRelationEdges(
    projectIdInput: string,
    sourceIdInput: string,
    relationIdInput: string,
    query?: InternalRelationEdgeQuery,
  ) {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const sourceId = requireNonEmpty(sourceIdInput, 'sourceId');
    const relationId = requireNonEmpty(relationIdInput, 'relationId');
    await requireRelation(db, projectId, sourceId, relationId);
    const rows = await db
      .select()
      .from(schema.relationEdges)
      .where(and(eq(schema.relationEdges.projectId, projectId), eq(schema.relationEdges.relationId, relationId)))
      .orderBy(asc(schema.relationEdges.createdAt), asc(schema.relationEdges.id));
    return Object.freeze(
      rows
        .map(toEdge)
        .filter((edge) => (query?.fromRecordId ? edge.fromRecordRef === query.fromRecordId : true))
        .filter((edge) => (query?.toRecordId ? edge.toRecordRef === query.toRecordId : true)),
    );
  }

  async function validateEndpoints(
    projectId: string,
    sourceId: string,
    relationId: string,
    input: InternalRelationEdgeInput,
    exceptId?: string,
  ) {
    const relation = await requireRelation(db, projectId, sourceId, relationId);
    const fromRecordId = requireNonEmpty(input.fromRecordId, 'edge.fromRecordId');
    const toRecordId = requireNonEmpty(input.toRecordId, 'edge.toRecordId');
    await requireRecord(db, projectId, relation.sourceModelRef, fromRecordId);
    await requireRecord(db, projectId, relation.targetModelRef, toRecordId);
    const edges = await listRelationEdges(projectId, sourceId, relationId);
    validateCardinality(relation, edges, fromRecordId, toRecordId, exceptId);
    return { relation, fromRecordId, toRecordId };
  }

  async function createRelationEdge(
    projectIdInput: string,
    sourceIdInput: string,
    relationIdInput: string,
    input: InternalRelationEdgeInput,
  ) {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const sourceId = requireNonEmpty(sourceIdInput, 'sourceId');
    const relationId = requireNonEmpty(relationIdInput, 'relationId');
    const id = requireNonEmpty(input.id ?? globalThis.crypto.randomUUID(), 'edge.id');
    const { relation, fromRecordId, toRecordId } = await validateEndpoints(projectId, sourceId, relationId, input);
    const inserted = await db
      .insert(schema.relationEdges)
      .values({
        id,
        projectId,
        relationId,
        fromModelId: relation.sourceModelRef,
        fromRecordId,
        toModelId: relation.targetModelRef,
        toRecordId,
        payload: input.payload ?? {},
      })
      .returning();
    if (!inserted[0]) throw new Error('No se pudo crear el vínculo de relación.');
    return toEdge(inserted[0]);
  }

  async function updateRelationEdge(
    projectIdInput: string,
    sourceIdInput: string,
    relationIdInput: string,
    input: InternalRelationEdgeUpdate,
  ) {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const sourceId = requireNonEmpty(sourceIdInput, 'sourceId');
    const relationId = requireNonEmpty(relationIdInput, 'relationId');
    const id = requireNonEmpty(input.id, 'edge.id');
    const { relation, fromRecordId, toRecordId } = await validateEndpoints(projectId, sourceId, relationId, input, id);
    const updated = await db
      .update(schema.relationEdges)
      .set({
        fromModelId: relation.sourceModelRef,
        fromRecordId,
        toModelId: relation.targetModelRef,
        toRecordId,
        payload: input.payload ?? {},
      })
      .where(
        and(
          eq(schema.relationEdges.projectId, projectId),
          eq(schema.relationEdges.relationId, relationId),
          eq(schema.relationEdges.id, id),
        ),
      )
      .returning();
    if (!updated[0]) throw new Error(`Vínculo de relación no encontrado: ${id}.`);
    return toEdge(updated[0]);
  }

  async function deleteRelationEdge(
    projectIdInput: string,
    sourceIdInput: string,
    relationIdInput: string,
    edgeIdInput: string,
  ) {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const sourceId = requireNonEmpty(sourceIdInput, 'sourceId');
    const relationId = requireNonEmpty(relationIdInput, 'relationId');
    const edgeId = requireNonEmpty(edgeIdInput, 'edgeId');
    await requireRelation(db, projectId, sourceId, relationId);
    const deleted = await db
      .delete(schema.relationEdges)
      .where(
        and(
          eq(schema.relationEdges.projectId, projectId),
          eq(schema.relationEdges.relationId, relationId),
          eq(schema.relationEdges.id, edgeId),
        ),
      )
      .returning({ id: schema.relationEdges.id });
    return deleted.length > 0;
  }

  async function prepareRecordDelete(
    projectIdInput: string,
    sourceIdInput: string,
    modelIdInput: string,
    recordIdInput: string,
  ) {
    const projectId = requireNonEmpty(projectIdInput, 'projectId');
    const sourceId = requireNonEmpty(sourceIdInput, 'sourceId');
    const modelId = requireNonEmpty(modelIdInput, 'modelId');
    const recordId = requireNonEmpty(recordIdInput, 'recordId');
    const root = await db
      .select({ id: schema.contentRecords.id })
      .from(schema.contentRecords)
      .where(
        and(
          eq(schema.contentRecords.projectId, projectId),
          eq(schema.contentRecords.modelId, modelId),
          eq(schema.contentRecords.id, recordId),
          isNull(schema.contentRecords.deletedAt),
        ),
      )
      .limit(1);
    if (!root[0]) return false;

    const dataSchema = await getSchema(db, projectId, sourceId);
    const relations = new Map((dataSchema.relations ?? []).map((relation) => [relation.id, relation]));
    const edges = relations.size
      ? (await db.select().from(schema.relationEdges).where(eq(schema.relationEdges.projectId, projectId))).map(toEdge)
      : [];

    const visited = new Set<string>();
    const cascadeNodes = new Map<string, { modelId: string; recordId: string }>();
    const edgeIds = new Set<string>();
    const rootKey = `${modelId}:${recordId}`;

    function visit(currentModelId: string, currentRecordId: string) {
      const key = `${currentModelId}:${currentRecordId}`;
      if (visited.has(key)) return;
      visited.add(key);
      for (const edge of edges) {
        const relation = relations.get(edge.relationRef);
        if (!relation) continue;
        const isFrom = edge.fromModelRef === currentModelId && edge.fromRecordRef === currentRecordId;
        const isTo = edge.toModelRef === currentModelId && edge.toRecordRef === currentRecordId;
        if (!isFrom && !isTo) continue;
        if (relation.deleteBehavior === 'restrict') {
          throw new Error(`La relación ${relation.label} bloquea la eliminación mientras existan vínculos.`);
        }
        edgeIds.add(edge.id);
        if (relation.deleteBehavior === 'cascade') {
          const other = isFrom
            ? { modelId: edge.toModelRef, recordId: edge.toRecordRef }
            : { modelId: edge.fromModelRef, recordId: edge.fromRecordRef };
          const otherKey = `${other.modelId}:${other.recordId}`;
          if (otherKey !== rootKey) cascadeNodes.set(otherKey, other);
          visit(other.modelId, other.recordId);
        }
      }
    }

    visit(modelId, recordId);
    return db.transaction(async (tx) => {
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
        await tx
          .delete(schema.recordFieldIndex)
          .where(
            and(eq(schema.recordFieldIndex.projectId, projectId), eq(schema.recordFieldIndex.recordId, node.recordId)),
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
      if (deletedRoot.length > 0) {
        await tx
          .delete(schema.recordFieldIndex)
          .where(and(eq(schema.recordFieldIndex.projectId, projectId), eq(schema.recordFieldIndex.recordId, recordId)));
      }
      return deletedRoot.length > 0;
    });
  }

  return Object.freeze({
    listRelationEdges,
    createRelationEdge,
    updateRelationEdge,
    deleteRelationEdge,
    prepareRecordDelete,
  });
}
