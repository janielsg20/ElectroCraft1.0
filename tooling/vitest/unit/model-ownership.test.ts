import { describe, expect, it } from 'vitest';
import {
  ELECTROCRAFT_MODEL_OWNERSHIP_CATALOG,
  electroCraftModelOwnershipCatalogSchema,
  listElectroCraftModelOwnershipByCategory,
} from '@electrocraft/domain';

describe('M02.8 model ownership catalog', () => {
  it('classifies every canonical model into exactly one of the three ownership categories', () => {
    const catalog = electroCraftModelOwnershipCatalogSchema.parse(ELECTROCRAFT_MODEL_OWNERSHIP_CATALOG);

    expect(catalog).toHaveLength(26);
    expect(listElectroCraftModelOwnershipByCategory('project-object')).toHaveLength(14);
    expect(listElectroCraftModelOwnershipByCategory('registry-definition')).toHaveLength(6);
    expect(listElectroCraftModelOwnershipByCategory('content-entity')).toHaveLength(6);
    expect(new Set(catalog.map(({ key }) => key)).size).toBe(catalog.length);
  });

  it('keeps storage/versioning/export ownership aligned with the category', () => {
    for (const descriptor of ELECTROCRAFT_MODEL_OWNERSHIP_CATALOG) {
      if (descriptor.category === 'project-object') {
        expect(descriptor.storageAuthority).toBe('canonical-project');
        expect(descriptor.versioningAuthority).toBe('project-schema');
        expect(['embedded', 'reference']).toContain(descriptor.exportAccess);
      } else if (descriptor.category === 'registry-definition') {
        expect(descriptor.storageAuthority).toBe('application-registry');
        expect(descriptor.versioningAuthority).toBe('app-version');
        expect(['reference', 'none']).toContain(descriptor.exportAccess);
      } else {
        expect(descriptor.storageAuthority).toBe('content-storage');
        expect(descriptor.versioningAuthority).toBe('content-schema');
        expect(['resolver', 'manifest', 'none']).toContain(descriptor.exportAccess);
      }
    }
  });

  it('distinguishes project reusable components from the core ComponentDefinition registry', () => {
    const reusable = ELECTROCRAFT_MODEL_OWNERSHIP_CATALOG.find(({ key }) => key === 'reusable-component');
    const componentDefinition = ELECTROCRAFT_MODEL_OWNERSHIP_CATALOG.find(({ key }) => key === 'component-definition');

    expect(reusable).toMatchObject({
      category: 'project-object',
      canonicalShape: 'ElectroCraftDocument kind=reusable-component',
    });
    expect(componentDefinition).toMatchObject({
      category: 'registry-definition',
      storageAuthority: 'application-registry',
    });
  });
});
