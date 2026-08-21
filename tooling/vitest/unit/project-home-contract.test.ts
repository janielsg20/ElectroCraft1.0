import { describe, expect, it } from 'vitest';
import { normalizeListProjectsRequest, normalizeProjectLifecycleStatus } from '@electrocraft/application';
describe('M04.4 Project Home contract', () => {
  it('normalizes filters', () =>
    expect(normalizeListProjectsRequest({ search: ' sitio ' })).toEqual({
      search: 'sitio',
      status: 'active',
      sort: 'updated-desc',
    }));
  it('fails closed', () => {
    expect(() => normalizeProjectLifecycleStatus('deleted')).toThrow();
    expect(() => normalizeListProjectsRequest({ sort: 'random' as never })).toThrow();
  });
});
