import { packageDescriptor as dep0 } from '@electrocraft/domain';
import { packageDescriptor as dep1 } from '@electrocraft/application';
import { packageDescriptor as dep2 } from '@electrocraft/data-core';
import { packageDescriptor as dep3 } from '@electrocraft/query-rqb';
import { packageDescriptor as dep4 } from '@electrocraft/forms';

export const packageDescriptor = Object.freeze({
  name: '@electrocraft/admin-refine',
  responsibility: 'adapter de Administración Refine/TanStack',
  dependencies: [dep0.name, dep1.name, dep2.name, dep3.name, dep4.name] as const,
});

export type AdminRefinePackageDescriptor = typeof packageDescriptor;
