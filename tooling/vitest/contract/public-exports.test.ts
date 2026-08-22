import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { collectWorkspace, validateWorkspaceSnapshot } from '../../src/boundaries.mjs';

const root = path.resolve(process.cwd());

describe('M01.3 contract — public package surfaces', () => {
  it('keeps the public root plus only explicitly declared subpath exports per owner', () => {
    const snapshot = collectWorkspace(root);
    for (const [name, manifest] of Object.entries(snapshot.manifests)) {
      expect(manifest.exports).toEqual({
        '.': './src/index.ts',
        ...(snapshot.boundaries.publicSubpathExports?.[name] ?? {}),
      });
    }
  });

  it('rejects package subpath exports that are not declared in the boundary contract', () => {
    const snapshot = structuredClone(collectWorkspace(root));
    snapshot.manifests['@electrocraft/domain'].exports['./internal'] = './src/internal.ts';
    const result = validateWorkspaceSnapshot(snapshot);
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('@electrocraft/domain public exports mismatch');
  });

  it('keeps the declared stable package count and two composition roots', () => {
    const snapshot = collectWorkspace(root);
    expect(Object.keys(snapshot.boundaries.packages)).toHaveLength(
      snapshot.boundaries.invariants.expectedStablePackageCount,
    );
    expect(Object.keys(snapshot.boundaries.apps).sort()).toEqual([
      '@electrocraft/native-preview',
      '@electrocraft/studio',
    ]);
  });
});
