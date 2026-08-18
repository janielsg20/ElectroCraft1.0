import {
  createElectroCraftProjectSnapshotChecksum,
  electroCraftProjectSnapshotEnvelopeSchema,
  parseCanonicalJson,
  serializeElectroCraftDocument,
  serializeElectroCraftProjectDefinition,
  validateProjectDocumentReferences,
  type ElectroCraftProjectSnapshotEnvelope,
} from '@electrocraft/domain';
import type { CanonicalProjectObjectRecord, CanonicalProjectObjectRepository } from './project-document-service';

export type ProjectImportDiagnosticCode =
  | 'INVALID_JSON'
  | 'INVALID_SCHEMA'
  | 'CHECKSUM_MISMATCH'
  | 'REFERENCE_ERROR'
  | 'PERSISTENCE_ERROR';

export interface ProjectImportDiagnostic {
  code: ProjectImportDiagnosticCode;
  path: Array<string | number>;
  message: string;
  repair: string;
}

export interface ProjectImportBlockedResult {
  status: 'blocked';
  diagnostics: ProjectImportDiagnostic[];
}

export interface ProjectImportReadyResult {
  status: 'ready';
  envelope: ElectroCraftProjectSnapshotEnvelope;
}

export interface ProjectImportSavedResult {
  status: 'saved';
  projectId: ElectroCraftProjectSnapshotEnvelope['snapshot']['project']['id'];
  documentCount: number;
  checksum: ElectroCraftProjectSnapshotEnvelope['checksum'];
}

export type ProjectImportPreviewResult = ProjectImportBlockedResult | ProjectImportReadyResult;
export type ProjectImportResult = ProjectImportBlockedResult | ProjectImportSavedResult;

function blocked(diagnostics: ProjectImportDiagnostic[]): ProjectImportBlockedResult {
  return { status: 'blocked', diagnostics };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown project import error';
}

export class ProjectImportService {
  constructor(private readonly repository: CanonicalProjectObjectRepository) {}

  preview(serialized: string): ProjectImportPreviewResult {
    let parsed: unknown;
    try {
      parsed = parseCanonicalJson(serialized);
    } catch (error) {
      return blocked([
        {
          code: 'INVALID_JSON',
          path: [],
          message: errorMessage(error),
          repair: 'Corrige la sintaxis JSON y vuelve a validar el snapshot.',
        },
      ]);
    }

    const envelopeResult = electroCraftProjectSnapshotEnvelopeSchema.safeParse(parsed);
    if (!envelopeResult.success) {
      return blocked(
        envelopeResult.error.issues.map((issue) => ({
          code: 'INVALID_SCHEMA',
          path: issue.path.map((part) => (typeof part === 'symbol' ? String(part) : part)),
          message: issue.message,
          repair: `Corrige el valor canónico en ${issue.path.length > 0 ? issue.path.join('.') : 'la raíz del snapshot'}.`,
        })),
      );
    }

    const envelope = envelopeResult.data;
    const actualChecksum = createElectroCraftProjectSnapshotChecksum(envelope.snapshot);
    if (actualChecksum !== envelope.checksum) {
      return blocked([
        {
          code: 'CHECKSUM_MISMATCH',
          path: ['checksum'],
          message: `checksum esperado ${envelope.checksum}; checksum canónico actual ${actualChecksum}`,
          repair: 'Regenera el snapshot desde objetos canónicos válidos; no edites manualmente un snapshot firmado por checksum.',
        },
      ]);
    }

    const referenceDiagnostics = validateProjectDocumentReferences(
      envelope.snapshot.project,
      envelope.snapshot.documents,
    );
    if (referenceDiagnostics.length > 0) {
      return blocked(
        referenceDiagnostics.map((diagnostic) => ({
          code: 'REFERENCE_ERROR',
          path: diagnostic.ref ? ['snapshot', 'project', diagnostic.ref] : ['snapshot', 'project'],
          message: `${diagnostic.code}${diagnostic.ref ? `: ${diagnostic.ref}` : ''}`,
          repair: 'Restaura la referencia canónica faltante/duplicada o elimina la referencia inválida antes de importar.',
        })),
      );
    }

    return { status: 'ready', envelope };
  }

  async import(serialized: string): Promise<ProjectImportResult> {
    const preview = this.preview(serialized);
    if (preview.status === 'blocked') return preview;

    const { envelope } = preview;
    const records: CanonicalProjectObjectRecord[] = [
      ...envelope.snapshot.documents.map((document) => ({
        kind: 'document' as const,
        id: document.id,
        schemaVersion: 1 as const,
        payload: serializeElectroCraftDocument(document),
      })),
      {
        kind: 'project' as const,
        id: envelope.snapshot.project.id,
        schemaVersion: 1 as const,
        payload: serializeElectroCraftProjectDefinition(envelope.snapshot.project),
      },
    ];

    try {
      await this.repository.putMany(records);
    } catch (error) {
      return blocked([
        {
          code: 'PERSISTENCE_ERROR',
          path: [],
          message: errorMessage(error),
          repair: 'Corrige el storage/repository y reintenta el mismo snapshot validado.',
        },
      ]);
    }

    return {
      status: 'saved',
      projectId: envelope.snapshot.project.id,
      documentCount: envelope.snapshot.documents.length,
      checksum: envelope.checksum,
    };
  }
}
