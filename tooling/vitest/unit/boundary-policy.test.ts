import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { collectWorkspace, validateWorkspaceSnapshot } from '../../src/boundaries.mjs';

const root = path.resolve(process.cwd());

describe('M01.3 unit — boundary policy', () => {
  it('accepts the canonical workspace snapshot', () => {
    expect(validateWorkspaceSnapshot(collectWorkspace(root))).toEqual({ ok: true, errors: [] });
  });

  it('fails closed when Native gains an editor dependency', () => {
    const snapshot = structuredClone(collectWorkspace(root));
    snapshot.boundaries.packages['@electrocraft/runtime-native'].push('@electrocraft/editor-puck');
    snapshot.manifests['@electrocraft/runtime-native'].dependencies['@electrocraft/editor-puck'] = '0.0.0-m01.3';
    const result = validateWorkspaceSnapshot(snapshot);
    expect(result.ok).toBe(false);
    expect(result.errors.join('\n')).toContain('native boundary depends on forbidden @electrocraft/editor-puck');
  });
});
