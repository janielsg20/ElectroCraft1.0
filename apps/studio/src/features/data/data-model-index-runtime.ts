import type { InternalDataIndexStatus } from '@electrocraft/application';
import { dataModelIndexResourceId, type JsonValue } from '@electrocraft/domain';
import { dataSourceWorkspaceRuntime } from './data-source-runtime';

function internalSource() {
  return (
    dataSourceWorkspaceRuntime
      .getSnapshot()
      .sources.find(({ kind, adapterId }) => kind === 'internal' && adapterId === 'internal.pglite') ?? null
  );
}

function parseIndexStatus(value: JsonValue): InternalDataIndexStatus {
  if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('Estado de índice inválido.');
  const candidate = value as Record<string, JsonValue>;
  if (
    typeof candidate.modelId !== 'string' ||
    !['disabled', 'empty', 'ready', 'stale'].includes(String(candidate.status)) ||
    typeof candidate.indexableFieldCount !== 'number' ||
    typeof candidate.activeRecordCount !== 'number' ||
    typeof candidate.indexedRecordCount !== 'number' ||
    typeof candidate.indexRowCount !== 'number'
  ) {
    throw new Error('Estado de índice incompleto.');
  }
  return Object.freeze({
    modelId: candidate.modelId,
    status: candidate.status as InternalDataIndexStatus['status'],
    indexableFieldCount: candidate.indexableFieldCount,
    activeRecordCount: candidate.activeRecordCount,
    indexedRecordCount: candidate.indexedRecordCount,
    indexRowCount: candidate.indexRowCount,
  });
}

export async function getDataModelIndexStatus(modelId: string) {
  await dataSourceWorkspaceRuntime.load();
  const source = internalSource();
  if (!source) throw new Error('ElectroCraft Data no está disponible.');
  return parseIndexStatus(
    await dataSourceWorkspaceRuntime.registry.query(source, 'development', {
      resourceId: dataModelIndexResourceId(modelId),
    }),
  );
}

export async function rebuildDataModelIndex(modelId: string) {
  await dataSourceWorkspaceRuntime.load();
  const source = internalSource();
  if (!source) throw new Error('ElectroCraft Data no está disponible.');
  return parseIndexStatus(
    await dataSourceWorkspaceRuntime.registry.mutate(source, 'development', {
      resourceId: dataModelIndexResourceId(modelId),
      operation: 'update',
      input: {},
    }),
  );
}
