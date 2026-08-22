import { describe, expect, it, vi } from 'vitest';
import {
  createProjectStorageService,
  normalizeSaveProjectRequest,
  type ProjectStoragePort,
} from '@electrocraft/application';

const saved = normalizeSaveProjectRequest({
  project: { id: 'p', name: 'Portal', metadata: {} },
  objects: [{ objectId: 's', kind: 'screen', schemaVersion: 1, payload: { title: 'Inicio' } }],
});

function port() {
  return {
    openProject: vi.fn(async (id: string) =>
      id === 'p' ? { project: saved.project, objects: saved.objects, revision: saved.revision } : null,
    ),
    saveProject: vi.fn(async (request) => request.revision),
    createCheckpoint: vi.fn(async () => saved.revision),
  } as unknown as ProjectStoragePort;
}

describe('M04.6 backup contract', () => {
  it('round trips a checksummed package as copy', async () => {
    const storage = port();
    const service = createProjectStorageService(storage);
    const backup = await service.createBackup('p');

    expect(backup.format).toBe('electrocraft-project-backup');
    expect(backup.objects).toHaveLength(1);

    await service.importBackup(backup, 'copy', 'copy');
    expect(storage.saveProject).toHaveBeenCalled();
  });

  it('rejects tampering before writing', async () => {
    const storage = port();
    const service = createProjectStorageService(storage);
    const backup = await service.createBackup('p');

    await expect(
      service.importBackup({ ...backup, project: { ...backup.project, name: 'alterado' } }, 'copy'),
    ).rejects.toThrow(/checksum/);
    expect(storage.saveProject).not.toHaveBeenCalled();
  });

  it('creates a safety checkpoint before replace', async () => {
    const storage = port();
    const service = createProjectStorageService(storage);

    await service.importBackup(await service.createBackup('p'), 'replace');
    expect(storage.createCheckpoint).toHaveBeenCalledWith('p', 'pre-restore-safety');
  });
});