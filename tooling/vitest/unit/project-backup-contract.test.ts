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
    saveProject: vi.fn(async (r) => r.revision),
    createCheckpoint: vi.fn(async () => saved.revision),
  } as unknown as ProjectStoragePort;
}
describe('M04.6 backup contract', () => {
  it('round trips a checksummed package as copy', async () => {
    const p = port();
    const s = createProjectStorageService(p);
    const backup = await s.createBackup('p');
    expect(backup.format).toBe('electrocraft-project-backup');
    await s.importBackup(backup, 'copy', 'copy');
    expect(p.saveProject).toHaveBeenCalled();
  });
  it('rejects tampering before writing', async () => {
    const p = port();
    const s = createProjectStorageService(p);
    const backup = await s.createBackup('p');
    await expect(
      s.importBackup({ ...backup, project: { ...backup.project, name: 'alterado' } }, 'copy'),
    ).rejects.toThrow(/checksum/);
    expect(p.saveProject).not.toHaveBeenCalled();
  });
  it('creates a safety checkpoint before replace', async () => {
    const p = port();
    const s = createProjectStorageService(p);
    await s.importBackup(await s.createBackup('p'), 'replace');
    expect(p.createCheckpoint).toHaveBeenCalledWith('p', 'pre-restore');
  });
});
