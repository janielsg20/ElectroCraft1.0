import {
  deserializeElectroCraftDocument,
  deserializeElectroCraftProjectDefinition,
  electroCraftDocumentSchema,
  electroCraftProjectDefinitionSchema,
  serializeElectroCraftDocument,
  serializeElectroCraftProjectDefinition,
  validateProjectDefinitionSemantics,
  validateProjectDocumentReferences,
  type CanonicalReferenceDiagnostic,
  type ElectroCraftDocument,
  type ElectroCraftObjectId,
  type ElectroCraftProjectDefinition,
} from '@electrocraft/domain';

export type CanonicalProjectObjectKind = 'project' | 'document';

export interface CanonicalProjectObjectRecord {
  kind: CanonicalProjectObjectKind;
  id: ElectroCraftObjectId;
  schemaVersion: 1;
  payload: string;
}

export interface CanonicalProjectObjectRepository {
  putMany(records: readonly CanonicalProjectObjectRecord[]): Promise<void>;
  get(
    kind: CanonicalProjectObjectKind,
    id: ElectroCraftObjectId,
  ): Promise<CanonicalProjectObjectRecord | null>;
}

export type CanonicalProjectBlockedCode =
  | 'INVALID_PROJECT'
  | 'INVALID_DOCUMENT'
  | 'REFERENCE_ERROR'
  | 'PERSISTENCE_ERROR'
  | 'PROJECT_NOT_FOUND'
  | 'MISSING_DOCUMENT_REF'
  | 'INVALID_PROJECT_RECORD'
  | 'INVALID_DOCUMENT_RECORD';

export interface CanonicalProjectBlockedResult {
  status: 'blocked';
  code: CanonicalProjectBlockedCode;
  message: string;
  ref?: string;
  diagnostics?: CanonicalReferenceDiagnostic[];
}

export interface CanonicalProjectSavedResult {
  status: 'saved';
  projectId: ElectroCraftObjectId;
  documentCount: number;
}

export interface CanonicalProjectReadyResult {
  status: 'ready';
  project: ElectroCraftProjectDefinition;
  documents: ElectroCraftDocument[];
  migratedDocumentIds: ElectroCraftObjectId[];
}

export type CanonicalProjectSaveResult =
  | CanonicalProjectSavedResult
  | CanonicalProjectBlockedResult;

export type CanonicalProjectReopenResult =
  | CanonicalProjectReadyResult
  | CanonicalProjectBlockedResult;

function blocked(
  code: CanonicalProjectBlockedCode,
  message: string,
  extras: Omit<CanonicalProjectBlockedResult, 'status' | 'code' | 'message'> = {},
): CanonicalProjectBlockedResult {
  return { status: 'blocked', code, message, ...extras };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown canonical model error';
}

export class ProjectDocumentService {
  constructor(private readonly repository: CanonicalProjectObjectRepository) {}

  async save(
    projectInput: unknown,
    documentInputs: readonly unknown[],
  ): Promise<CanonicalProjectSaveResult> {
    const projectResult = electroCraftProjectDefinitionSchema.safeParse(projectInput);
    if (!projectResult.success) {
      return blocked('INVALID_PROJECT', projectResult.error.message);
    }
    const project = projectResult.data;
    const semanticDiagnostics = validateProjectDefinitionSemantics(project);
    if (semanticDiagnostics.length > 0) {
      return blocked('REFERENCE_ERROR', 'project semantics are invalid', {
        diagnostics: semanticDiagnostics,
      });
    }

    const documents: ElectroCraftDocument[] = [];
    for (const input of documentInputs) {
      const result = electroCraftDocumentSchema.safeParse(input);
      if (!result.success) {
        return blocked('INVALID_DOCUMENT', result.error.message);
      }
      documents.push(result.data);
    }

    const referenceDiagnostics = validateProjectDocumentReferences(
      project,
      documents,
    );
    if (referenceDiagnostics.length > 0) {
      return blocked('REFERENCE_ERROR', 'project document references are invalid', {
        diagnostics: referenceDiagnostics,
      });
    }

    const records: CanonicalProjectObjectRecord[] = [
      ...documents.map((document) => ({
        kind: 'document' as const,
        id: document.id,
        schemaVersion: 1 as const,
        payload: serializeElectroCraftDocument(document),
      })),
      {
        kind: 'project',
        id: project.id,
        schemaVersion: 1,
        payload: serializeElectroCraftProjectDefinition(project),
      },
    ];

    try {
      await this.repository.putMany(records);
      return {
        status: 'saved',
        projectId: project.id,
        documentCount: documents.length,
      };
    } catch (error) {
      return blocked('PERSISTENCE_ERROR', errorMessage(error));
    }
  }

  async reopen(
    projectId: ElectroCraftObjectId,
  ): Promise<CanonicalProjectReopenResult> {
    let projectRecord: CanonicalProjectObjectRecord | null;
    try {
      projectRecord = await this.repository.get('project', projectId);
    } catch (error) {
      return blocked('PERSISTENCE_ERROR', errorMessage(error));
    }

    if (projectRecord === null) {
      return blocked('PROJECT_NOT_FOUND', 'canonical project record was not found', {
        ref: projectId,
      });
    }

    let project: ElectroCraftProjectDefinition;
    try {
      project = deserializeElectroCraftProjectDefinition(projectRecord.payload);
    } catch (error) {
      return blocked('INVALID_PROJECT_RECORD', errorMessage(error), {
        ref: projectId,
      });
    }

    const documents: ElectroCraftDocument[] = [];
    const migratedDocumentIds: ElectroCraftObjectId[] = [];
    for (const documentId of project.documentRefs) {
      let record: CanonicalProjectObjectRecord | null;
      try {
        record = await this.repository.get('document', documentId);
      } catch (error) {
        return blocked('PERSISTENCE_ERROR', errorMessage(error), {
          ref: documentId,
        });
      }
      if (record === null) {
        return blocked(
          'MISSING_DOCUMENT_REF',
          'referenced canonical document record was not found',
          { ref: documentId },
        );
      }

      try {
        const imported = deserializeElectroCraftDocument(record.payload);
        documents.push(imported.document);
        if (imported.migratedFrom !== null) {
          migratedDocumentIds.push(imported.document.id);
        }
      } catch (error) {
        return blocked('INVALID_DOCUMENT_RECORD', errorMessage(error), {
          ref: documentId,
        });
      }
    }

    const diagnostics = validateProjectDocumentReferences(project, documents);
    if (diagnostics.length > 0) {
      return blocked('REFERENCE_ERROR', 'reopened project references are invalid', {
        diagnostics,
      });
    }

    return { status: 'ready', project, documents, migratedDocumentIds };
  }
}
