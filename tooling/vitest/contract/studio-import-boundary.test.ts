import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { collectWorkspace, validateWorkspaceSnapshot } from '../../src/boundaries.mjs';

const root = path.resolve(process.cwd());

describe('M01.4 contract — Studio import boundary', () => {
  it('keeps Studio imports inside its declared owners and public roots', () => {
    const snapshot = collectWorkspace(root);
    const result = validateWorkspaceSnapshot(snapshot);
    const studioErrors = result.errors.filter((error) => error.includes('@electrocraft/studio'));

    expect(studioErrors).toEqual([]);
    expect(snapshot.importRecords['@electrocraft/studio'].some(({ specifier }) => specifier.includes('/src/'))).toBe(
      false,
    );
  });
});
