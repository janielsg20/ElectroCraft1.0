import { describe, expect, it, vi } from 'vitest';
import { createProjectStorageService, type ProjectStoragePort } from '@electrocraft/application';
describe('M04.5 project actions contract', () => {
  it('trims names and fails closed for empty actions', async () => {
    const renameProject = vi.fn(async () => ({
      id: 'p',
      name: 'Nuevo',
      metadata: {},
      status: 'active' as const,
      objectCount: 0,
      createdAt: 'x',
      updatedAt: 'x',
    }));
    const port = { renameProject } as unknown as ProjectStoragePort;
    const service = createProjectStorageService(port);
    await service.renameProject(' p ', ' Nuevo ');
    expect(renameProject).toHaveBeenCalledWith('p', 'Nuevo');
    expect(() => service.renameProject('p', ' ')).toThrow(/must not be empty/);
  });
});
