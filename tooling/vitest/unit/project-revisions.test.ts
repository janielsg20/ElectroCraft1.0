import {
  createProjectRevisionService,
  createProjectStorageRevision,
  inferProjectRevisionSource,
  summarizeProjectRevisionDiff,
  type ProjectRevisionPort,
} from '@electrocraft/application';
import { createElectroCraftCanonicalSnapshotChecksum } from '@electrocraft/domain';
import { describe, expect, it } from 'vitest';

function entry(objectId: string, kind: string, value: string) {
  const payload = { value } as const;
  return Object.freeze({
    objectId,
    kind,
    schemaVersion: 1,
    checksum: createElectroCraftCanonicalSnapshotChecksum(payload),
  });
}

describe('M04.8 project revision semantics', () => {
  it('summarizes added, changed, removed and unchanged objects by kind', () => {
    const previous = [
      entry('screen-home', 'screen', 'home-v1'),
      entry('component-hero', 'component', 'hero-v1'),
      entry('token-primary', 'token', 'blue'),
    ];
    const next = [
      entry('screen-home', 'screen', 'home-v2'),
      entry('component-hero', 'component', 'hero-v1'),
      entry('component-footer', 'component', 'footer-v1'),
    ];

    const summary = summarizeProjectRevisionDiff(previous, next);

    expect(summary).toMatchObject({ added: 1, changed: 1, removed: 1, unchanged: 1 });
    expect(summary.byKind).toEqual([
      { kind: 'component', added: 1, changed: 0, removed: 0, unchanged: 1 },
      { kind: 'screen', added: 0, changed: 1, removed: 0, unchanged: 0 },
      { kind: 'token', added: 0, changed: 0, removed: 1, unchanged: 0 },
    ]);
  });

  it('maps checkpoint reasons to stable revision sources', () => {
    expect(inferProjectRevisionSource('manual')).toBe('manual');
    expect(inferProjectRevisionSource('interval')).toBe('automatic');
    expect(inferProjectRevisionSource('pre-import')).toBe('pre-import');
    expect(inferProjectRevisionSource('pre-migration')).toBe('pre-migration');
    expect(inferProjectRevisionSource('pre-publish')).toBe('publish');
    expect(inferProjectRevisionSource('pre-export')).toBe('export');
    expect(inferProjectRevisionSource('restore:abc')).toBe('restore');
    expect(inferProjectRevisionSource('pre-restore-safety')).toBe('recovery');
  });

  it('keeps a persistent restore independent from the session Undo history', async () => {
    const sessionHistory = { undoDepth: 3, redoDepth: 1 };
    const currentRevision = createProjectStorageRevision(
      'project-undo-independent',
      [],
      'restore:revision-old',
      'revision-current',
      '2026-08-24T20:30:00.000Z',
    );
    const port: ProjectRevisionPort = Object.freeze({
      async createCheckpoint() {
        return currentRevision;
      },
      async listRevisionHistory() {
        return Object.freeze([]);
      },
      async restoreRevision(projectId, revisionId) {
        expect(projectId).toBe('project-undo-independent');
        expect(revisionId).toBe('revision-old');
        expect(sessionHistory).toEqual({ undoDepth: 3, redoDepth: 1 });
        return Object.freeze({
          projectId,
          restoredFromRevisionId: revisionId,
          safetyRevisionId: 'revision-safety',
          currentRevision,
        });
      },
    });

    await createProjectRevisionService(port).restore('project-undo-independent', 'revision-old');

    expect(sessionHistory).toEqual({ undoDepth: 3, redoDepth: 1 });
  });
});
