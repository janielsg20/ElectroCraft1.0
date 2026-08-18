import { describe, expect, it } from 'vitest';
import { evaluateStudioBootstrapHealth } from '../../../apps/studio/src/bootstrap-health';

describe('M01.4 unit — Studio bootstrap health', () => {
  it('reports ready only when every composition-root dependency is available', () => {
    const result = evaluateStudioBootstrapHealth([
      '@electrocraft/domain',
      '@electrocraft/application',
      '@electrocraft/runtime-web',
      '@electrocraft/exporters',
    ]);

    expect(result.state).toBe('ready');
    expect(result.missingDependencies).toEqual([]);
  });

  it('fails closed when a required owner is missing', () => {
    const result = evaluateStudioBootstrapHealth([
      '@electrocraft/domain',
      '@electrocraft/application',
      '@electrocraft/runtime-web',
    ]);

    expect(result.state).toBe('blocked');
    expect(result.missingDependencies).toEqual(['@electrocraft/exporters']);
  });
});
