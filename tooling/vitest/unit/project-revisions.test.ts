import { summarizeProjectRevisionDiff, inferProjectRevisionSource } from '@electrocraft/application';
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
});
