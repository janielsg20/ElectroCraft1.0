import { describe, expect, it, vi } from 'vitest';
import { normalizeIncrementalSaveProjectRequest } from '@electrocraft/application';
import { createProjectAutosaveController } from '../../../apps/studio/src/features/projects/project-storage-autosave';

const project = Object.freeze({ id: 'project-1', name: 'Proyecto', metadata: {} });
const object = (objectId: string, version: number) =>
  Object.freeze({ objectId, kind: 'screen', schemaVersion: 1, payload: { version } });

describe('M04.3 incremental autosave', () => {
  it('coalesces dirty objects by canonical id and lets delete win before commit', async () => {
    const saveProjectIncremental = vi.fn(async (request) => ({
      projectId: request.project.id,
      updatedAt: '2026-08-21T00:00:00.000Z',
      upsertedObjectIds: request.dirtyObjects.map(({ objectId }) => objectId),
      deletedObjectIds: request.deletedObjectIds ?? [],
      currentRevisionBase: 'revision-base',
    }));
    const controller = createProjectAutosaveController(
      { saveProjectIncremental, createCheckpoint: vi.fn() },
      { debounceMs: 60_000 },
    );

    controller.queue({ project, dirtyObjects: [object('screen-home', 1), object('theme', 1)] });
    controller.queue({
      project,
      dirtyObjects: [object('screen-home', 2)],
      deletedObjectIds: ['theme'],
    });
    expect(controller.pendingObjectIds()).toEqual({
      dirtyObjectIds: ['screen-home'],
      deletedObjectIds: ['theme'],
    });

    await controller.flush();
    expect(saveProjectIncremental).toHaveBeenCalledTimes(1);
    expect(saveProjectIncremental.mock.calls[0]?.[0]).toMatchObject({
      dirtyObjects: [expect.objectContaining({ objectId: 'screen-home', payload: { version: 2 } })],
      deletedObjectIds: ['theme'],
    });
    expect(controller.pendingObjectIds()).toEqual({ dirtyObjectIds: [], deletedObjectIds: [] });
    controller.dispose();
  });

  it('restores the dirty batch after a failed commit and checkpoints only after flushing', async () => {
    const saveProjectIncremental = vi
      .fn()
      .mockRejectedValueOnce(new Error('commit failed'))
      .mockResolvedValueOnce({
        projectId: project.id,
        updatedAt: '2026-08-21T00:00:00.000Z',
        upsertedObjectIds: ['screen-home'],
        deletedObjectIds: [],
        currentRevisionBase: null,
      });
    const createCheckpoint = vi.fn().mockResolvedValue({ id: 'revision-1' });
    const controller = createProjectAutosaveController(
      { saveProjectIncremental, createCheckpoint },
      { debounceMs: 60_000 },
    );
    controller.queue({ project, dirtyObjects: [object('screen-home', 1)] });

    await expect(controller.flush()).rejects.toThrow('commit failed');
    expect(controller.pendingObjectIds().dirtyObjectIds).toEqual(['screen-home']);
    await controller.checkpoint(project.id, 'pre-export');

    expect(saveProjectIncremental).toHaveBeenCalledTimes(2);
    expect(createCheckpoint).toHaveBeenCalledWith(project.id, 'pre-export');
    expect(saveProjectIncremental.mock.invocationCallOrder[1]).toBeLessThan(
      createCheckpoint.mock.invocationCallOrder[0]!,
    );
    controller.dispose();
  });

  it('rejects ambiguous or empty incremental deltas before reaching storage', () => {
    expect(() => normalizeIncrementalSaveProjectRequest({ project, dirtyObjects: [], deletedObjectIds: [] })).toThrow(
      /at least one dirty or deleted object/,
    );
    expect(() =>
      normalizeIncrementalSaveProjectRequest({
        project,
        dirtyObjects: [object('screen-home', 1)],
        deletedObjectIds: ['screen-home'],
      }),
    ).toThrow(/cannot be dirty and deleted/);
  });
});
