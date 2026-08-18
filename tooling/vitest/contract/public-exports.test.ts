import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { collectWorkspace } from '../../src/boundaries.mjs';

const root = path.resolve(process.cwd());

describe('M01.3 contract — public package surfaces', () => {
  it('keeps one public root export per owner', () => {
    const snapshot = collectWorkspace(root);
    for (const manifest of Object.values(snapshot.manifests)) {
      expect(manifest.exports).toEqual({ '.': './src/index.ts' });
    }
  });

  it('keeps exactly 17 packages and two composition roots', () => {
    const snapshot = collectWorkspace(root);
    expect(Object.keys(snapshot.boundaries.packages)).toHaveLength(17);
    expect(Object.keys(snapshot.boundaries.apps).sort()).toEqual(['@electrocraft/native-preview', '@electrocraft/studio']);
  });
});
