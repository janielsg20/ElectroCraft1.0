import type { ElectroRelationEdge, JsonValue } from '@electrocraft/domain';

export interface InternalRelationEdgeQuery {
  readonly fromRecordId?: string;
  readonly toRecordId?: string;
}

export interface InternalRelationEdgeInput {
  readonly id?: string;
  readonly fromRecordId: string;
  readonly toRecordId: string;
  readonly payload?: JsonValue;
}

export interface InternalRelationEdgeUpdate extends InternalRelationEdgeInput {
  readonly id: string;
}

export interface InternalRelationRepository {
  listRelationEdges(
    projectId: string,
    sourceId: string,
    relationId: string,
    query?: InternalRelationEdgeQuery,
  ): Promise<readonly ElectroRelationEdge[]>;
  createRelationEdge(
    projectId: string,
    sourceId: string,
    relationId: string,
    input: InternalRelationEdgeInput,
  ): Promise<ElectroRelationEdge>;
  updateRelationEdge(
    projectId: string,
    sourceId: string,
    relationId: string,
    input: InternalRelationEdgeUpdate,
  ): Promise<ElectroRelationEdge>;
  deleteRelationEdge(projectId: string, sourceId: string, relationId: string, edgeId: string): Promise<boolean>;
  prepareRecordDelete(projectId: string, sourceId: string, modelId: string, recordId: string): Promise<boolean>;
}
